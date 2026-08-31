import { supabase } from './supabaseClient'

type AdmissionInput = {
  fullName: string
  guardianName: string
  dateOfBirth?: string | null
  gender?: string | null
  cnic?: string | null
  mobile: string
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  education?: string | null
  courseSlug: string
  previousExperience?: string | null
  additionalInformation?: string | null
}

export async function uploadStudentPhoto(file: File) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured')
  }
  if (!file) throw new Error('No file')

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) throw new Error('Invalid file type')
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large')

  const bucket = 'student-photos'
  const path = `uploads/${Date.now()}_${Math.floor(Math.random()*1e6)}_${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export async function submitApplication(input: AdmissionInput, photoFile?: File) {
  // Upload photo first (if provided) to storage and obtain a private path
  let photoPath: string | null = null
  if (photoFile) {
    photoPath = await uploadStudentPhoto(photoFile)
  }

  // Call RPC insert_application
  const args = {
    p_full_name: input.fullName,
    p_father_guardian_name: input.guardianName,
    p_date_of_birth: input.dateOfBirth ?? null,
    p_gender: input.gender ?? null,
    p_cnic_b_form: input.cnic ?? null,
    p_mobile_number: input.mobile,
    p_whatsapp_number: input.whatsapp ?? null,
    p_email: input.email ?? null,
    p_complete_address: input.address ?? null,
    p_education: input.education ?? null,
    p_course_slug: input.courseSlug,
    p_previous_computer_experience: input.previousExperience ?? null,
    p_additional_information: input.additionalInformation ?? null,
    p_student_photo_path: photoPath
  }

  const { data, error } = await supabase.rpc('insert_application', args)
  if (error) {
    // If upload happened, we could consider deleting the uploaded file to avoid orphan, but skip here and log for admins.
    throw error
  }
  // data is expected to be an array with one row due to RETURNS TABLE
  return (data as any)[0]
}
