import React from 'react'
import { fetchCertificates, fetchStudentCertificates, uploadCertificate, createCertificate, replaceCertificate, deleteCertificate, getCertificateSignedUrl } from '@/lib/certificates'
import { useParams } from 'react-router-dom'

export default function StudentCertificatesSection({ studentId }: { studentId: string }){
  const [certs, setCerts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchStudentCertificates(studentId)
      setCerts(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load certificates')
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [studentId])

  async function handleUpload() {
    if (!file) return alert('Select a file')
    setUploading(true)
    try {
      const path = await uploadCertificate(file)
      // create certificate record via RPC requires admin and proper params; here we open a prompt for required fields
      const courseId = prompt('Course ID (use course UUID):')
      const res = await createCertificate({ studentId, courseId: courseId ?? '', filePath: path })
      alert('Certificate created: ' + res.certificate_number)
      setFile(null)
      load()
    } catch (err:any) {
      console.error(err)
      alert('Upload/create failed')
    } finally { setUploading(false) }
  }

  async function handleReplace(cert: any) {
    const f = (document.getElementById('replace-file-' + cert.id) as HTMLInputElement)?.files?.[0]
    if (!f) return alert('Select file')
    try {
      await replaceCertificate(cert.id, f, cert.certificate_file_path)
      alert('Replaced')
      load()
    } catch (err) { console.error(err); alert('Replace failed') }
  }

  async function handleDelete(cert: any) {
    if (!confirm('Delete certificate? This cannot be undone.')) return
    try {
      await deleteCertificate(cert.id)
      alert('Deleted')
      load()
    } catch (err) { console.error(err); alert('Delete failed') }
  }

  async function viewSignedUrl(path: string) {
    const url = await getCertificateSignedUrl(path)
    if (url) window.open(url, '_blank')
    else alert('Cannot generate signed URL in this environment')
  }

  return (
    <div className="bg-white p-4 rounded">
      <h3 className="font-semibold">Certificates</h3>
      <div className="mt-2">
        <div className="mb-2">
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <button onClick={handleUpload} disabled={uploading} className="ml-2 px-3 py-1 bg-efa-indigo-500 text-white rounded">Upload</button>
        </div>

        {loading ? <div>Loading...</div> : (
          <div>
            {certs.length === 0 ? <div className="text-sm text-gray-500">No certificates</div> : (
              <div className="space-y-2">
                {certs.map(cert => (
                  <div key={cert.id} className="border p-2 rounded flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{cert.certificate_number}</div>
                      <div className="text-sm text-gray-600">Reg#: {cert.registration_number} • Course: {cert.course_id}</div>
                      <div className="text-sm text-gray-600">Issued: {cert.issue_date ?? ''}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => viewSignedUrl(cert.certificate_file_path)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm">View</button>
                      <input id={'replace-file-' + cert.id} type="file" />
                      <button onClick={() => handleReplace(cert)} className="px-2 py-1 bg-efa-indigo-500 rounded text-sm">Replace</button>
                      <button onClick={() => handleDelete(cert)} className="px-2 py-1 bg-rose-600 rounded text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
