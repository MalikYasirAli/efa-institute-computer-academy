import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Course } from '@/types'
import { courses as localCourses } from '@/data/courses'

export function usePublishedCourses() {
  const [data, setData] = useState<Course[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    async function fetchCourses() {
      if (!supabaseUrl || !supabaseKey) {
        // Supabase not configured: fallback to local approved data
        setData(localCourses as Course[])
        setLoading(false)
        return
      }

      try {
        const { data: rows, error } = await supabase
          .from('courses')
          .select('id, slug, title, summary, description, duration, created_at')
          .eq('published', true)

        if (error) throw error
        if (mounted) {
          setData((rows as any) ?? [])
        }
      } catch (err: any) {
        setError(err.message || String(err))
        // fallback to local data (approved)
        setData(localCourses as Course[])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCourses()
    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}
