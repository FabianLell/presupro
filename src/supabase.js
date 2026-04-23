import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}