import { supabase } from './supabaseClient'

export async function fetchStudents({ query, status, courseId, feeStatus } : { query?: string, status?: string | null, courseId?: string | null, feeStatus?: string | null } = {}) {
  // rely on RLS to restrict to admin users
  let s = supabase.from('students').select('id, student_id, registration_number, full_name, course_id, admission_date, status, fee_status')
  if (status) s = s.eq('status', status)
  if (courseId) s = s.eq('course_id', courseId)
  if (feeStatus) s = s.eq('fee_status', feeStatus)
  s = s.order('admission_date', { ascending: false }).limit(200)

  const { data, error } = await s
  if (error) throw error
  return data ?? []
}

export async function fetchStudentByStudentId(studentId: string) {
  const { data, error } = await supabase.from('students').select('*').eq('student_id', studentId).maybeSingle()
  if (error) throw error
  return data
}

export async function approveApplication(applicationId: string) {
  const { data, error } = await supabase.rpc('approve_application_and_create_student', { p_application_id: applicationId })
  if (error) throw error
  // returns array with one row
  return (data as any)[0]
}

export async function updateStudent(studentId: string, updates: any) {
  const { data, error } = await supabase.from('students').update(updates).eq('student_id', studentId).select()
  if (error) throw error
  return data
}

export async function getStudentPhotoSignedUrl(path: string) {
  const bucket = 'student-photos'
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60)
    if (error) throw error
    return data.signedUrl
  } catch (err) {
    console.warn('Signed URL not available in this environment', err)
    return null
  }
}
