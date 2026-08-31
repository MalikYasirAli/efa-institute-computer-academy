import { supabase } from './supabaseClient'

export async function signInWithEmail(email: string, password: string) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured')
  }
  const res = await supabase.auth.signInWithPassword({ email, password })
  return res
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
