export type Course = {
  id: string
  slug: string
  title: string
  summary?: string
  price?: number | null
  duration?: string | null
  created_at?: string
}

export type Application = {
  id: string
  application_id: string
  student_id?: string | null
  course_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'incomplete'
  created_at?: string
}
