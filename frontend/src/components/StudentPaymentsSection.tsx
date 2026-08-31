import React from 'react'
import { fetchStudentPayments, uploadPaymentProof, createPaymentAdmin, setPaymentStatusAdmin, getPaymentProofSignedUrl } from '@/lib/payments'

export default function StudentPaymentsSection({ studentId }: { studentId: string }){
  const [payments, setPayments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchStudentPayments(studentId)
      setPayments(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load payments')
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [studentId])

  async function handleSubmitProof() {
    if (!file) return alert('Select a file')
    setSubmitting(true)
    try {
      const path = await uploadPaymentProof(file)
      // admin must call createPaymentAdmin; here we prompt for amount and method (for admin use)
      const amountStr = prompt('Amount (PKR):')
      if (!amountStr) throw new Error('Amount required')
      const amount = parseFloat(amountStr)
      const method = prompt('Payment method (e.g., EasyPaisa):') || 'EasyPaisa'
      await createPaymentAdmin({ studentId, amount, method, paymentDate: new Date().toISOString(), proofPath: path, notes: null })
      alert('Payment record created (Submitted). Admin will verify it.')
      setFile(null)
      load()
    } catch (err:any) {
      console.error(err)
      alert('Failed to submit payment proof')
    } finally { setSubmitting(false) }
  }

  async function handleVerify(paymentRef: string) {
    if (!confirm('Mark as Verified?')) return
    try {
      await setPaymentStatusAdmin(paymentRef, 'Verified', 'Verified by admin')
      alert('Payment verified')
      load()
    } catch (err) { console.error(err); alert('Verify failed') }
  }

  async function handleReject(paymentRef: string) {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      await setPaymentStatusAdmin(paymentRef, 'Rejected', reason)
      alert('Payment rejected')
      load()
    } catch (err) { console.error(err); alert('Reject failed') }
  }

  async function viewProof(path: string) {
    const url = await getPaymentProofSignedUrl(path)
    if (url) window.open(url, '_blank')
    else alert('Cannot generate signed URL here')
  }

  return (
    <div className="bg-white p-4 rounded">
      <h3 className="font-semibold">Fees / Payments</h3>
      <div className="mt-2">
        <div className="mb-2">
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <button onClick={handleSubmitProof} disabled={submitting} className="ml-2 px-3 py-1 bg-efa-indigo-500 text-white rounded">Submit Proof</button>
        </div>

        {loading ? <div>Loading...</div> : (
          <div>
            {payments.length === 0 ? <div className="text-sm text-gray-500">No payment history</div> : (
              <div className="space-y-2">
                {payments.map(pay => (
                  <div key={pay.id} className="border p-2 rounded flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{pay.payment_ref} • {pay.status}</div>
                      <div className="text-sm text-gray-600">Amount: {pay.amount} {pay.currency} • Method: {pay.payment_method}</div>
                      <div className="text-sm text-gray-600">Date: {pay.payment_date ? new Date(pay.payment_date).toLocaleString() : new Date(pay.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {pay.proof_file_path ? <button onClick={() => viewProof(pay.proof_file_path)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm">View Proof</button> : null}
                      {pay.status === 'Submitted' && (
                        <>
                          <button onClick={() => handleVerify(pay.payment_ref)} className="px-2 py-1 bg-efa-lime-500 rounded text-sm">Verify</button>
                          <button onClick={() => handleReject(pay.payment_ref)} className="px-2 py-1 bg-rose-600 rounded text-sm">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Payment instructions (EasyPaisa):<br />
        EasyPaisa Number: <strong>0341-7490257</strong><br />
        Account Name: <strong>M. Fareed</strong><br />
        Please submit payment proof here — payments are reviewed and verified by academy admin.
      </div>
    </div>
  )
}
