import React from 'react'
import { fetchCertificates, getCertificateSignedUrl, uploadCertificate, replaceCertificate, deleteCertificate } from '@/lib/certificates'
import { Link } from 'react-router-dom'

export default function AdminCertificates(){
  const [certs, setCerts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [courseFilter, setCourseFilter] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchCertificates({ status: statusFilter, courseId: courseFilter })
      setCerts(data)
    } catch (err) {
      console.error(err)
      setCerts([])
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [statusFilter, courseFilter])

  function filtered() {
    if (!query) return certs
    const q = query.toLowerCase()
    return certs.filter(c => c.certificate_number?.toLowerCase().includes(q) || c.registration_number?.toLowerCase().includes(q) || c.student_id?.toLowerCase().includes(q))
  }

  async function view(cert: any) {
    const url = await getCertificateSignedUrl(cert.certificate_file_path)
    if (url) window.open(url, '_blank')
    else alert('Cannot generate signed URL here')
  }

  async function handleDelete(cert: any) {
    if (!confirm('Delete certificate?')) return
    try {
      await deleteCertificate(cert.id)
      alert('Deleted')
      load()
    } catch (err) { console.error(err); alert('Delete failed') }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded">
        <div className="flex gap-2">
          <input placeholder="Search by cert#/reg#/student id" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded flex-1" />
          <select value={statusFilter ?? ''} onChange={e => setStatusFilter(e.target.value || null)} className="border p-2 rounded">
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Revoked">Revoked</option>
          </select>
          <button onClick={load} className="px-3 py-2 bg-efa-indigo-500 text-white rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded">
        {loading ? <div>Loading...</div> : (
          <div>
            {filtered().length === 0 ? <div className="text-sm text-gray-500">No certificates found</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2">Certificate #</th>
                      <th className="py-2">Reg#</th>
                      <th className="py-2">Student ID</th>
                      <th className="py-2">Course</th>
                      <th className="py-2">Issued</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered().map(cert => (
                      <tr key={cert.id} className="border-t">
                        <td className="py-2">{cert.certificate_number}</td>
                        <td className="py-2">{cert.registration_number}</td>
                        <td className="py-2">{cert.student_id}</td>
                        <td className="py-2">{cert.course_id}</td>
                        <td className="py-2">{cert.issue_date}</td>
                        <td className="py-2">{cert.certificate_status}</td>
                        <td className="py-2">
                          <button onClick={() => view(cert)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm mr-2">View</button>
                          <Link to={`/admin/certificates/${cert.id}`} className="px-2 py-1 bg-efa-indigo-500 text-white rounded text-sm mr-2">Edit</Link>
                          <button onClick={() => handleDelete(cert)} className="px-2 py-1 bg-rose-600 rounded text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
