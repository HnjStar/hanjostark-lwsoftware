import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'xxxxx'
const supabaseAnonKey = 'xxxxxx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
