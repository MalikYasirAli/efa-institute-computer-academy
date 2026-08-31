import React from 'react'

export default function ApplicationStatus(){
  const [applicationId, setApplicationId] = React.useState('')
  const [checking, setChecking] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)

  function onCheck(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setResult(null)
    setTimeout(() => {
      setChecking(false)
      setResult('Backend not connected — please run verification from the admin panel or connect Supabase.')
    }, 700)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">Application Status</h1>
      <p className="mt-2 text-gray-600">Enter your application ID to check status. This demo does not connect to a backend.</p>

      <form onSubmit={onCheck} className="mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Application ID</label>
          <input value={applicationId} onChange={e => setApplicationId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" />
        </div>
        <div className="mt-4">
          <button type="submit" className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{checking ? 'Checking...' : 'Check Status'}</button>
        </div>
      </form>

      {result && <div className="mt-4 text-sm text-amber-700">{result}</div>}
    </div>
  )
}
