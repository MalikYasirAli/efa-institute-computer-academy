import { supabase } from './supabaseClient'

export async function fetchPayments({ query, studentId, paymentRef, status, courseId } : { query?: string, studentId?: string | null, paymentRef?: string | null, status?: string | null, courseId?: string | null } = {}) {
  let s = supabase.from('payments').select('id, payment_ref, student_id, amount, currency, payment_method, payment_date, status, created_at')
  if (studentId) s = s.eq('student_id', studentId)
  if (paymentRef) s = s.eq('payment_ref', paymentRef)
  if (status) s = s.eq('status', status)
  s = s.order('created_at', { ascending: false }).limit(200)
  const { data, error } = await s
  if (error) throw error
  return data ?? []
}

export async function fetchStudentPayments(studentId: string) {
  const { data, error } = await supabase.from('payments').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function uploadPaymentProof(file: File) {
  if (!file) throw new Error('No file')
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) throw new Error('Invalid file type')
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large')

  const bucket = 'payment-proofs'
  const path = `uploads/${Date.now()}_${Math.floor(Math.random()*1e6)}_${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export async function createPaymentAdmin({ studentId, amount, method, paymentDate, proofPath, notes } : { studentId: string, amount: number, method?: string | null, paymentDate?: string | null, proofPath?: string | null, notes?: string | null }) {
  const { data, error } = await supabase.rpc('create_payment_admin', { p_student_id: studentId, p_amount: amount, p_payment_method: method ?? null, p_payment_date: paymentDate ?? null, p_proof_file_path: proofPath ?? null, p_admin_notes: notes ?? null })
  if (error) throw error
  return (data as any)[0]
}

export async function setPaymentStatusAdmin(paymentRef: string, newStatus: string, notes?: string | null) {
  const { data, error } = await supabase.rpc('set_payment_status_admin', { p_payment_ref: paymentRef, p_new_status: newStatus, p_notes: notes ?? null })
  if (error) throw error
  return (data as any)[0]
}

export async function updatePayment(id: string, updates: any) {
  const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select()
  if (error) throw error
  return data
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function getPaymentProofSignedUrl(path: string, expires = 60) {
  try {
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, expires)
    if (error) throw error
    return data.signedUrl
  } catch (err) {
    console.warn('Signed URL not available in this environment', err)
    return null
  }
}
