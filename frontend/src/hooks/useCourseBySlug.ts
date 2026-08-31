import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Course } from '@/types'
import { courses as localCourses } from '@/data/courses'

export function useCourseBySlug(slug?: string | null) {
  const [data, setData] = useState<Course | null>(null)
  const [topics, setTopics] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    async function fetchCourse() {
      if (!slug) {
        setLoading(false)
        return
      }

      if (!supabaseUrl || !supabaseKey) {
        const local = (localCourses as any[]).find(c => c.slug === slug)
        if (mounted) {
          setData(local ?? null)
          setTopics(local?.topics ?? null)
          setLoading(false)
        }
        return
      }

      try {
        const { data: rows, error } = await supabase
          .from('courses')
          .select('id, slug, title, summary, description, duration, created_at')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle()

        if (error) throw error
        if (!rows) {
          if (mounted) {
            setData(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setData(rows as Course)
        }

        // fetch topics from course_topics
        try {
          const courseId = (rows as any).id
          const { data: trows, error: terr } = await supabase
            .from('course_topics')
            .select('title')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true })
          if (terr) throw terr
          if (mounted) setTopics((trows as any[]).map(r => r.title))
        } catch (tErr: any) {
          // ignore topic errors; topics optional
          if (mounted) setTopics(null)
        }
      } catch (err: any) {
        setError(err.message || String(err))
        // fallback to local
        const local = (localCourses as any[]).find(c => c.slug === slug)
        if (mounted) {
          setData(local ?? null)
          setTopics(local?.topics ?? null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCourse()
    return () => {
      mounted = false
    }
  }, [slug])

  return { data, topics, loading, error }
}
