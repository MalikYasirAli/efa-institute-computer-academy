import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { academy as localAcademy } from '@/data/academy'

export function useAcademySettings() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    async function fetchSettings() {
      if (!supabaseUrl || !supabaseKey) {
        setData(localAcademy)
        setLoading(false)
        return
      }

      try {
        const { data: row, error } = await supabase.from('public_academy_settings').select('*').maybeSingle()
        if (error) throw error
        if (mounted) setData(row ?? localAcademy)
      } catch (err: any) {
        setError(err.message || String(err))
        setData(localAcademy)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSettings()
    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}
