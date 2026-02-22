// Quick test script to verify Supabase connection
// Run with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
dotenv.config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('projects').select('count').limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Tables not found! Please run the SQL schema first.')
        console.error('   Go to Supabase Dashboard > SQL Editor and run supabase-schema.sql')
      } else {
        console.error('❌ Connection error:', error.message)
      }
      process.exit(1)
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Tables are accessible')
    
    // Test 2: Check tables exist
    const { data: projects } = await supabase.from('projects').select('id').limit(1)
    const { data: stages } = await supabase.from('stages').select('id').limit(1)
    
    console.log('✅ Projects table:', projects !== null ? 'OK' : 'Missing')
    console.log('✅ Stages table:', stages !== null ? 'OK' : 'Missing')
    
    console.log('\n🎉 Everything is set up correctly!')
    console.log('   You can now run: npm run dev')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

testConnection()
