import React from 'react'
import { fetchPayments, uploadPaymentProof, setPaymentStatusAdmin, getPaymentProofSignedUrl } from '@/lib/payments'

export default function AdminPayments(){
  const [payments, setPayments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchPayments({ status: statusFilter })
      setPayments(data)
    } catch (err) {
      console.error(err)
      setPayments([])
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [statusFilter])

  function filtered() {
    if (!query) return payments
    const q = query.toLowerCase()
    return payments.filter(p => p.payment_ref?.toLowerCase().includes(q) || p.student_id?.toLowerCase().includes(q))
  }

  async function viewProof(path: string) {
    const url = await getPaymentProofSignedUrl(path)
    if (url) window.open(url, '_blank')
    else alert('Cannot generate signed URL here')
  }

  async function verify(paymentRef: string) {
    if (!confirm('Mark as Verified?')) return
    try {
      await setPaymentStatusAdmin(paymentRef, 'Verified', 'Verified by admin')
      alert('Verified')
      load()
    } catch (err) { console.error(err); alert('Failed') }
  }

  async function reject(paymentRef: string) {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      await setPaymentStatusAdmin(paymentRef, 'Rejected', reason)
      alert('Rejected')
      load()
    } catch (err) { console.error(err); alert('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded">
        <div className="flex gap-2">
          <input placeholder="Search by payment ref or student id" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded flex-1" />
          <select value={statusFilter ?? ''} onChange={e => setStatusFilter(e.target.value || null)} className="border p-2 rounded">
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button onClick={load} className="px-3 py-2 bg-efa-indigo-500 text-white rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded">
        {loading ? <div>Loading...</div> : (
          <div>
            {filtered().length === 0 ? <div className="text-sm text-gray-500">No payments found</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2">Payment Ref</th>
                      <th className="py-2">Student ID</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Method</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered().map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2">{p.payment_ref}</td>
                        <td className="py-2">{p.student_id}</td>
                        <td className="py-2">{p.amount} {p.currency}</td>
                        <td className="py-2">{p.payment_method}</td>
                        <td className="py-2">{p.payment_date ? new Date(p.payment_date).toLocaleString() : new Date(p.created_at).toLocaleString()}</td>
                        <td className="py-2">{p.status}</td>
                        <td className="py-2">
                          {p.proof_file_path && <button onClick={() => viewProof(p.proof_file_path)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm mr-2">View Proof</button>}
                          {p.status === 'Submitted' && <button onClick={() => verify(p.payment_ref)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm mr-2">Verify</button>}
                          {p.status === 'Submitted' && <button onClick={() => reject(p.payment_ref)} className="px-2 py-1 bg-rose-600 rounded text-sm">Reject</button>}
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
