import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prtceszhyfsjddccoegz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGNlc3poeWZzamRkY2NvZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg0NTAsImV4cCI6MjEwNDA3NDQ1MH0.0-uo8zfhbKHK5AzU3plvLeQqBNJU6gzsYn1jSsGMx3E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing connection to Supabase...')
  const { data: plots, error: pError } = await supabase.from('plots').select('*')
  console.log('Plots query result:', { plots, error: pError })

  const { data: items, error: iError } = await supabase.from('inventory_items').select('*')
  console.log('Inventory query result:', { count: items?.length, error: iError })
}

test()
