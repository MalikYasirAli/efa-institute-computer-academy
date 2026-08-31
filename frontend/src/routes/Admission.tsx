import React from 'react'

export default function Admission(){
  const [form, setForm] = React.useState({
    fullName: '',
    guardianName: '',
    phone: '',
    email: '',
    address: '',
    course: ''
  })
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // No backend connected here. Show clear unconnected state.
    setTimeout(() => {
      setSubmitting(false)
      setMessage('This demo is not connected to a backend. Your application is not submitted.');
    }, 700)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">Online Admission</h1>
      <p className="mt-2 text-gray-600">Complete the form below to start an admission request. Note: backend is not connected in this demo.</p>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Father / Guardian Name</label>
          <input name="guardianName" value={form.guardianName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Course Selection</label>
          <select name="course" value={form.course} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200">
            <option value="">Select a course</option>
            <option value="computer-course">Computer Course</option>
            <option value="digital-marketing">Digital Marketing</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </div>

        {message && <div className="md:col-span-2 text-sm text-amber-700">{message}</div>}
      </form>
    </div>
  )
}
