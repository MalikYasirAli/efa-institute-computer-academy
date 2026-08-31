import React from 'react'

export default function CertificateVerification(){
  const [cert, setCert] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)

  function onVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setResult(null)
    setTimeout(() => {
      setVerifying(false)
      setResult('Verification service not connected in this demo. Connect Supabase to enable verification.')
    }, 700)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">Certificate Verification</h1>
      <p className="mt-2 text-gray-600">Enter a certificate number to verify. This demo is not connected to the verification backend.</p>

      <form onSubmit={onVerify} className="mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate Number</label>
          <input value={cert} onChange={e => setCert(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>
        <div className="mt-4">
          <button type="submit" className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{verifying ? 'Verifying...' : 'Verify'}</button>
        </div>
      </form>

      {result && <div className="mt-4 text-sm text-amber-700">{result}</div>}
    </div>
  )
}
