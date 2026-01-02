import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bzshlphhsjwawuwikxxk.supabase.co'
const supabaseAnonKey = 'sb_publishable_amjW7L7EWuW2zbuzQ-ZWFg_tDb0dRIR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
