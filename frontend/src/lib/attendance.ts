import { supabase } from './supabaseClient'

export async function fetchAttendance({ courseId, date, startDate, endDate, studentId, status, limit = 500 } : { courseId?: string | null, date?: string | null, startDate?: string | null, endDate?: string | null, studentId?: string | null, status?: string | null, limit?: number } = {}) {
  // Fetch attendance records using course filter by joining with students on the client side.
  // Step 1: if courseId provided, fetch students in that course
  let studentIds: string[] | null = null
  if (courseId) {
    const { data: students, error: sErr } = await supabase.from('students').select('id').eq('course_id', courseId).eq('status', 'Active').limit(200)
    if (sErr) throw sErr
    studentIds = (students ?? []).map((s:any) => s.id)
    if (studentIds.length === 0) return []
  }

  let q = supabase.from('attendance').select('id, student_id, attendance_date, status, check_in_time, check_out_time, notes, marked_by, created_at, updated_at')
  if (studentId) q = q.eq('student_id', studentId)
  if (studentIds) q = q.in('student_id', studentIds)
  if (date) q = q.eq('attendance_date', date)
  if (startDate) q = q.gte('attendance_date', startDate)
  if (endDate) q = q.lte('attendance_date', endDate)
  if (status) q = q.eq('status', status)
  q = q.order('attendance_date', { ascending: false }).limit(limit)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function fetchStudentAttendance(studentId: string, { limit = 200 } = {}) {
  const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId).order('attendance_date', { ascending: false }).limit(limit)
  if (error) throw error
  return data ?? []
}

export async function createAttendanceAdmin({ studentId, attendanceDate, status, checkIn, checkOut, notes } : { studentId: string, attendanceDate: string, status: string, checkIn?: string | null, checkOut?: string | null, notes?: string | null }) {
  const { data, error } = await supabase.rpc('create_attendance_admin', { p_student_id: studentId, p_attendance_date: attendanceDate, p_status: status, p_check_in: checkIn ?? null, p_check_out: checkOut ?? null, p_notes: notes ?? null })
  if (error) throw error
  return (data as any)[0]
}

export async function updateAttendanceAdmin(attendanceId: string, { status, checkIn, checkOut, notes } : { status?: string | null, checkIn?: string | null, checkOut?: string | null, notes?: string | null }) {
  const { data, error } = await supabase.rpc('update_attendance_admin', { p_attendance_id: attendanceId, p_status: status ?? null, p_check_in: checkIn ?? null, p_check_out: checkOut ?? null, p_notes: notes ?? null })
  if (error) throw error
  return (data as any)[0]
}
