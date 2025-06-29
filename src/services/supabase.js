import { createClient } from '@supabase/supabase-js'

const key = process.env.VITE_SUPABASE_KEY
// when using the hidden values make sure to do 1) npm run build 2) npm run preview not dev
const supabaseUrl = 'https://kotxxkvalgqcxjgiafkn.supabase.co'
const supabase = createClient(supabaseUrl, key)

export default supabase