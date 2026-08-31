import React from 'react'

export default function ApplicationStatus(){
  const [applicationId, setApplicationId] = React.useState('')
  const [cnic, setCnic] = React.useState('')
  const [checking, setChecking] = React.useState(false)
  const [result, setResult] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function onCheck(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!applicationId || !cnic) {
      setError('Please enter Application ID and CNIC/B-Form')
      return
    }
    setChecking(true)
    try {
      // call RPC verify_application
      const { data, error } = await (window as any).supabase?.rpc
        ? (window as any).supabase.rpc('verify_application', { p_application_id: applicationId, p_cnic_b_form: cnic })
        : { data: null, error: new Error('Supabase not configured') }

      if (error) {
        throw error
      }
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setError('Verification failed. Please check your information.')
      } else {
        setResult((data as any)[0])
      }
    } catch (err: any) {
      console.error(err)
      setError('Verification failed. Please check your information.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Application Status</h1>
      <p className="mt-2 text-gray-600">Enter your Application ID and CNIC/B-Form to verify status.</p>

      <form onSubmit={onCheck} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Application ID</label>
          <input value={applicationId} onChange={e => setApplicationId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CNIC / B-Form</label>
          <input value={cnic} onChange={e => setCnic(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>

        <div>
          <button type="submit" className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{checking ? 'Checking...' : 'Check Status'}</button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

      {result && (
        <div className="mt-4 bg-neutral-50 p-4 rounded">
          <div className="font-semibold">Application ID: {result.application_id}</div>
          <div className="mt-1">Name: {result.full_name}</div>
          <div className="mt-1">Course: {result.course_id}</div>
          <div className="mt-1">Status: {result.status}</div>
          <div className="mt-1 text-sm text-gray-500">Submitted: {new Date(result.created_at).toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}
