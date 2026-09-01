import { supabase } from './supabaseClient'

export async function fetchPayments({
  query,
  studentId,
  paymentRef,
  status,
  courseId,
}: {
  query?: string
  studentId?: string | null
  paymentRef?: string | null
  status?: string | null
  courseId?: string | null
} = {}) {
  let s = supabase
    .from('payments')
    .select(
      'id, payment_ref, student_id, amount, currency, payment_method, payment_date, status, proof_file_path, created_at'
    )

  if (studentId) s = s.eq('student_id', studentId)
  if (paymentRef) s = s.eq('payment_ref', paymentRef)
  if (status) s = s.eq('status', status)

  s = s.order('created_at', { ascending: false }).limit(200)

  const { data, error } = await s

  if (error) throw error
  return data ?? []
}

export async function fetchStudentPayments(studentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function uploadPaymentProof(file: File) {
  if (!file) throw new Error('No file selected')

  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ]

  if (!allowed.includes(file.type)) {
    throw new Error('Only PDF, JPG and PNG files are allowed')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10 MB')
  }

  const bucket = 'payment-proofs'

  const safeName = file.name.replace(
    /[^a-zA-Z0-9.\-]/g,
    '_'
  )

  const path = `uploads/${Date.now()}_${Math.floor(
    Math.random() * 1000000
  )}_${safeName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  return data.path
}

export async function setPaymentStatusAdmin(
  paymentRef: string,
  newStatus: string,
  notes?: string | null
) {
  const { data, error } = await supabase.rpc(
    'set_payment_status_admin',
    {
      p_payment_ref: paymentRef,
      p_new_status: newStatus,
      p_notes: notes ?? null,
    }
  )

  if (error) throw error

  return Array.isArray(data) ? data[0] : data
}

export async function updatePayment(
  id: string,
  updates: any
) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function deletePayment(id: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getPaymentProofSignedUrl(
  path: string,
  expires = 60
) {
  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(path, expires)

  if (error) {
    console.warn('Could not create signed URL', error)
    return null
  }

  return data.signedUrl
}
