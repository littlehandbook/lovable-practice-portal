
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuupszdkcowmyjycnkgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dXBzemRrY293bXlqeWNua2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDYyMjEsImV4cCI6MjA2MzQyMjIyMX0.WPqdaaeXubwtP_vu0YjvXQkV9xY5Gnm5JLXu-a6olj4'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
