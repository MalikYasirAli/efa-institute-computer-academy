import { supabase } from './supabaseClient'

export async function fetchCertificates({ query, studentId, registrationNumber, certificateNumber, courseId, status } : { query?: string, studentId?: string | null, registrationNumber?: string | null, certificateNumber?: string | null, courseId?: string | null, status?: string | null } = {}) {
  let s = supabase.from('certificates').select('id, certificate_number, student_id, registration_number, course_id, issue_date, completion_date, certificate_status')
  if (studentId) s = s.eq('student_id', studentId)
  if (registrationNumber) s = s.eq('registration_number', registrationNumber)
  if (certificateNumber) s = s.eq('certificate_number', certificateNumber)
  if (courseId) s = s.eq('course_id', courseId)
  if (status) s = s.eq('certificate_status', status)

  s = s.order('created_at', { ascending: false }).limit(200)
  const { data, error } = await s
  if (error) throw error
  return data ?? []
}

export async function fetchCertificateById(id: string) {
  const { data, error } = await supabase.from('certificates').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchStudentCertificates(studentId: string) {
  const { data, error } = await supabase.from('certificates').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function uploadCertificate(file: File) {
  if (!file) throw new Error('No file')
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) throw new Error('Invalid file type')
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large')

  const bucket = 'certificates'
  const path = `uploads/${Date.now()}_${Math.floor(Math.random()*1e6)}_${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export async function createCertificate({ studentId, courseId, issueDate, completionDate, marks, grade, majorAreas, filePath }: { studentId: string, courseId: string, issueDate?: string | null, completionDate?: string | null, marks?: string | null, grade?: string | null, majorAreas?: string | null, filePath?: string | null }) {
  const { data, error } = await supabase.rpc('insert_certificate', { p_student_id: studentId, p_course_id: courseId, p_issue_date: issueDate ?? null, p_completion_date: completionDate ?? null, p_marks: marks ?? null, p_grade: grade ?? null, p_major_content_areas: majorAreas ?? null, p_certificate_file_path: filePath ?? null })
  if (error) throw error
  return (data as any)[0]
}

export async function updateCertificate(id: string, updates: any) {
  const { data, error } = await supabase.from('certificates').update(updates).eq('id', id).select()
  if (error) throw error
  return data
}

export async function deleteCertificate(id: string) {
  const { error } = await supabase.from('certificates').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function replaceCertificate(id: string, file: File, oldPath?: string | null) {
  const path = await uploadCertificate(file)
  const { data, error } = await supabase.from('certificates').update({ certificate_file_path: path, updated_at: new Date().toISOString() }).eq('id', id).select()
  if (error) {
    // try to clean up uploaded file
    try { await supabase.storage.from('certificates').remove([path]) } catch (e) {}
    throw error
  }
  if (oldPath) {
    try { await supabase.storage.from('certificates').remove([oldPath]) } catch (e) { console.warn('Failed to remove old certificate file', e) }
  }
  return (data as any)[0]
}

export async function getCertificateSignedUrl(path: string, expires = 60) {
  try {
    const { data, error } = await supabase.storage.from('certificates').createSignedUrl(path, expires)
    if (error) throw error
    return data.signedUrl
  } catch (err) {
    console.warn('Signed URL not available in this environment', err)
    return null
  }
}
