import React from 'react'
import { submitApplication } from '@/lib/admissions'
import { courses } from '@/data/courses'

export default function Admission(){
  const [form, setForm] = React.useState({
    fullName: '',
    guardianName: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    mobile: '',
    whatsapp: '',
    email: '',
    address: '',
    education: '',
    course: '',
    previousExperience: '',
    additionalInformation: ''
  })
  const [photo, setPhoto] = React.useState<File | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<{ application_id: string; status: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // simple client-side validation
    if (!form.fullName || !form.guardianName || !form.mobile || !form.course) {
      setError('Please complete required fields: Full Name, Father/Guardian, Mobile, Course')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitApplication({
        fullName: form.fullName,
        guardianName: form.guardianName,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        cnic: form.cnic || null,
        mobile: form.mobile,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        address: form.address || null,
        education: form.education || null,
        courseSlug: form.course,
        previousExperience: form.previousExperience || null,
        additionalInformation: form.additionalInformation || null
      }, photo ?? undefined)

      setSuccess({ application_id: result.application_id, status: result.status })
    } catch (err: any) {
      console.error(err)
      setError('Submission failed. Please try again later or contact the academy.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">Application Submitted Successfully</h1>
        <div className="mt-4 text-gray-700">Application ID: <strong>{success.application_id}</strong></div>
        <div className="mt-2 text-gray-700">Status: <strong>{success.status}</strong></div>
        <div className="mt-4 text-sm text-gray-600">Keep your Application ID safe. Use it to check application status later.</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Online Admission</h1>
      <p className="mt-2 text-gray-600">Complete the form below to start an admission request.</p>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Father / Guardian Name *</label>
          <input name="guardianName" value={form.guardianName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CNIC / B-Form</label>
          <input name="cnic" value={form.cnic} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Complete Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Education</label>
          <input name="education" value={form.education} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Select Course *</label>
          <select name="course" value={form.course} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" required>
            <option value="">Select a course</option>
            {courses.map(c => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Student Photo</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] ?? null)} className="mt-1 block w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Previous Computer Experience</label>
          <textarea name="previousExperience" value={form.previousExperience} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Additional Information</label>
          <textarea name="additionalInformation" value={form.additionalInformation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </div>

        {error && <div className="md:col-span-2 text-sm text-rose-600">{error}</div>}
      </form>
    </div>
  )
}
