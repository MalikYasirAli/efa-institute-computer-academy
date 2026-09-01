import React from 'react'
import {
  fetchStudentPayments,
  uploadPaymentProof,
  getPaymentProofSignedUrl,
} from '@/lib/payments'

export default function StudentPaymentsSection({
  studentId,
}: {
  studentId: string
}) {
  const [payments, setPayments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [file, setFile] = React.useState<File | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function load() {
    setLoading(true)

    try {
      const data = await fetchStudentPayments(studentId)
      setPayments(data)
    } catch (err) {
      console.error(err)
      alert('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [studentId])

  async function handleSubmitProof() {
    if (!file) {
      alert('Please select payment proof')
      return
    }

    setSubmitting(true)

    try {
      const path = await uploadPaymentProof(file)

      alert(
        `Payment proof uploaded successfully.\n\nFile path:\n${path}\n\nAdmin will review it.`
      )

      setFile(null)

      const input = document.getElementById(
        'payment-proof-file'
      ) as HTMLInputElement | null

      if (input) input.value = ''

      await load()
    } catch (err) {
      console.error(err)
      alert('Failed to upload payment proof')
    } finally {
      setSubmitting(false)
    }
  }

  async function viewProof(path: string) {
    try {
      const url = await getPaymentProofSignedUrl(path)

      if (!url) {
        alert('Cannot open payment proof')
        return
      }

      window.open(url, '_blank')
    } catch (err) {
      console.error(err)
      alert('Cannot open payment proof')
    }
  }

  return (
    <div className="bg-white p-4 rounded">
      <h3 className="font-semibold">
        Fees / Payments
      </h3>

      <div className="mt-3">
        <div className="mb-3">
          <input
            id="payment-proof-file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
          />

          <button
            onClick={handleSubmitProof}
            disabled={submitting}
            className="mt-2 px-3 py-2 bg-efa-indigo-500 text-white rounded"
          >
            {submitting
              ? 'Uploading...'
              : 'Submit Payment Proof'}
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {payments.length === 0 ? (
              <div className="text-sm text-gray-500">
                No payment history
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="border p-2 rounded flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold">
                        {pay.payment_ref} • {pay.status}
                      </div>

                      <div className="text-sm text-gray-600">
                        Amount: {pay.amount} {pay.currency} •
                        Method: {pay.payment_method}
                      </div>

                      <div className="text-sm text-gray-600">
                        Date:{' '}
                        {pay.payment_date
                          ? new Date(
                              pay.payment_date
                            ).toLocaleString()
                          : new Date(
                              pay.created_at
                            ).toLocaleString()}
                      </div>
                    </div>

                    {pay.proof_file_path ? (
                      <button
                        onClick={() =>
                          viewProof(pay.proof_file_path)
                        }
                        className="px-2 py-1 bg-efa-lime-500 rounded text-sm"
                      >
                        View Proof
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Payment instructions (EasyPaisa):
        <br />
        EasyPaisa Number:{' '}
        <strong>0341-7490257</strong>
        <br />
        Account Name: <strong>M. Fareed</strong>
        <br />
        Please upload your payment proof here.
        Payments are reviewed by academy admin.
      </div>
    </div>
  )
}
