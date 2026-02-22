// Kaiten External Webhooks — приём POST от Kaiten при изменении задач на доске
// Деплой: supabase functions deploy kaiten-webhook
// URL: https://<project-ref>.supabase.co/functions/v1/kaiten-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

function getBoardId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const o = payload as Record<string, unknown>
  // Типичные поля в вебхуках: board_id, board_id, data.board_id
  if (typeof o.board_id === 'string') return o.board_id
  if (typeof o.board_id === 'number') return String(o.board_id)
  if (o.data && typeof o.data === 'object' && typeof (o.data as Record<string, unknown>).board_id !== 'undefined') {
    const b = (o.data as Record<string, unknown>).board_id
    return b != null ? String(b) : null
  }
  if (o.card_id != null && o.board_id == null && o.card != null && typeof o.card === 'object') {
    const card = o.card as Record<string, unknown>
    if (typeof card.board_id !== 'undefined') return String(card.board_id)
  }
  return null
}

function getEventType(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'card.updated'
  const o = payload as Record<string, unknown>
  if (typeof o.event === 'string') return o.event
  if (typeof o.event_type === 'string') return o.event_type
  if (typeof o.type === 'string') return o.type
  return 'card.updated'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = req.headers.get('x-webhook-secret')
  const expectedSecret = Deno.env.get('KAITEN_WEBHOOK_SECRET')
  if (expectedSecret && webhookSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const boardId = getBoardId(body)
  if (!boardId) {
    return new Response(JSON.stringify({ error: 'board_id not found in payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { error } = await supabase.from('kaiten_webhook_events').insert({
    board_id: boardId,
    event_type: getEventType(body),
    payload: body ?? {},
  })

  if (error) {
    console.error('kaiten-webhook insert error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true, board_id: boardId }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
