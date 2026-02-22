// Temporary script to check card status
// Run with: node check-card-status.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
dotenv.config({ path: join(__dirname, '.env') })

// You'll need to provide Kaiten config
const kaitenConfig = {
  domain: 'onyagency', // from URL https://onyagency.kaiten.ru
  apiKey: process.env.VITE_KAITEN_API_KEY || '', // You need to set this in .env
  baseUrl: process.env.VITE_KAITEN_BASE_URL || '/api/kaiten'
}

const cardId = 60782092

console.log(`Checking card ${cardId} status...`)
console.log('Note: This requires Kaiten API key to be set in .env as VITE_KAITEN_API_KEY')
console.log('And Kaiten proxy to be running (npm run dev)')

// For direct API call (if you have the key):
// const response = await fetch(`https://onyagency.kaiten.ru/api/v1/cards/${cardId}`, {
//   headers: {
//     'Authorization': `Bearer ${kaitenConfig.apiKey}`
//   }
// })
// const card = await response.json()
// console.log('Card status:', card.status)
