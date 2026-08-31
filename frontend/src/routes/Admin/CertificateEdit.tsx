import React from 'react'
import { fetchCertificateById, getCertificateSignedUrl, replaceCertificate, updateCertificate } from '@/lib/certificates'
import { useParams, useNavigate } from 'react-router-dom'

export default function CertificateEdit(){
  const { id } = useParams() as { id?: string }
  const [cert, setCert] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [file, setFile] = React.useState<File | null>(null)
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (!id) return
        const data = await fetchCertificateById(id)
        if (mounted) setCert(data)
        if (data?.certificate_file_path) {
          const url = await getCertificateSignedUrl(data.certificate_file_path)
          setSignedUrl(url)
        }
      } catch (err) { console.error(err) } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [id])

  async function handleReplace() {
    if (!cert || !file) return alert('Select a file')
    try {
      await replaceCertificate(cert.id, file, cert.certificate_file_path)
      alert('Replaced')
      navigate('/admin/certificates')
    } catch (err) { console.error(err); alert('Replace failed') }
  }

  async function handleSave() {
    if (!cert) return
    try {
      await updateCertificate(cert.id, { certificate_status: cert.certificate_status })
      alert('Saved')
      navigate('/admin/certificates')
    } catch (err) { console.error(err); alert('Save failed') }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!cert) return <div className="p-6">Certificate not found</div>

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded">
        <h1 className="text-2xl font-bold">Edit Certificate</h1>
        <div className="mt-4">Certificate #: {cert.certificate_number}</div>
        <div className="mt-2">Reg#: {cert.registration_number}</div>
      </div>

      <div className="bg-white p-6 rounded">
        <h2 className="font-semibold">File</h2>
        <div className="mt-2">
          {signedUrl ? <a href={signedUrl} target="_blank" rel="noreferrer" className="text-efa-indigo-500">View current file</a> : <div className="text-sm text-gray-500">No file or signing not configured</div>}
          <div className="mt-2">
            <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button onClick={handleReplace} className="ml-2 px-3 py-1 bg-efa-indigo-500 text-white rounded">Replace</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded">
        <label className="block text-sm">Status</label>
        <select value={cert.certificate_status} onChange={e => setCert({...cert, certificate_status: e.target.value})} className="mt-1 border p-2 rounded">
          <option value="Active">Active</option>
          <option value="Revoked">Revoked</option>
        </select>
        <div className="mt-4">
          <button onClick={handleSave} className="px-3 py-1 bg-efa-lime-500 rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
