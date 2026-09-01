import React from 'react'
import { useParams } from 'react-router-dom'
import { fetchStudentByStudentId, updateStudent, getStudentPhotoSignedUrl } from '@/lib/students'
import StudentCertificatesSection from '@/components/StudentCertificatesSection'
import StudentPaymentsSection from '@/components/StudentPaymentsSection'
import StudentAttendanceSection from '@/components/StudentAttendanceSection'

export default function StudentDetail(){
  const { id } = useParams() as { id?: string }
  const [student, setStudent] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState<any>({})

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (!id) return
        const data = await fetchStudentByStudentId(id)
        if (mounted) {
          setStudent(data)
          setForm({
            full_name: data?.full_name ?? '',
            father_name: data?.father_name ?? '',
            date_of_birth: data?.date_of_birth ?? '',
            gender: data?.gender ?? '',
            mobile: data?.mobile ?? '',
            whatsapp: data?.whatsapp ?? '',
            email: data?.email ?? '',
            complete_address: data?.complete_address ?? '',
            education: data?.education ?? '',
            status: data?.status ?? '',
            fee_status: data?.fee_status ?? ''
          })
          if (data?.student_photo_path) {
            const url = await getStudentPhotoSignedUrl(data.student_photo_path)
            setSignedUrl(url)
          }
        }
      } catch (err) {
        console.error(err)
        if (mounted) setError('Failed to load student')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  async function save() {
    try {
      if (!student) throw new Error('No student')
      await updateStudent(student.student_id, form)
      alert('Saved')
    } catch (err) {
      console.error(err)
      alert('Save failed')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-rose-600">{error}</div>
  if (!student) return <div className="p-6">Student not found.</div>

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded">
        <h1 className="text-2xl font-bold">{student.full_name}</h1>
        <div className="text-sm text-gray-500">Student ID: {student.student_id} • Reg#: {student.registration_number}</div>
      </div>

      <div className="bg-white p-6 rounded">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Full name</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Father name</label>
            <input value={form.father_name} onChange={e => setForm({...form, father_name: e.target.value})} className="mt-1 block w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Mobile</label>
            <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="mt-1 block w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full border rounded p-2" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Address</label>
            <textarea value={form.complete_address} onChange={e => setForm({...form, complete_address: e.target.value})} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="mt-4">
          <button onClick={save} className="px-4 py-2 bg-efa-indigo-500 text-white rounded">Save</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded">
        <h2 className="font-semibold">Photo</h2>
        <div className="mt-2">
          {signedUrl ? <img src={signedUrl} alt="student" className="w-48" /> : <div className="text-sm text-gray-500">Photo not available or signing not configured.</div>}
        </div>
      </div>

      <div>
        {/* Payments/Fees - pass student.student_id (human ID) to payments/certificates */}
        <StudentPaymentsSection studentId={student.student_id} />
      </div>

      <div className="bg-white p-6 rounded">
        <h2 className="font-semibold">Attendance</h2>
        <div className="mt-4">
          {/* Attendance expects the students.id UUID */}
          <StudentAttendanceSection studentId={student.id} />
        </div>
      </div>

      <div className="bg-white p-6 rounded">
        <h2 className="font-semibold">Certificates</h2>
        <div className="mt-4">
          {/* The StudentCertificatesSection expects studentId prop (human student_id) */}
          <StudentCertificatesSection studentId={student.student_id} />
        </div>
      </div>
    </div>
  )
}
