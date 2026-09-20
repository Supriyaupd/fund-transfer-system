'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

export default function SendMoney() {
  const router = useRouter()
  const [form, setForm] = useState({ receiverPhone: '', amount: '', pin: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await api.post('/transactions/send', {
        receiverPhone: form.receiverPhone,
        amount: parseFloat(form.amount),
        pin: form.pin,
        description: form.description
      })
      setSuccess(`NPR ${form.amount} sent successfully! New balance: NPR ${res.data.newBalance}`)
      setForm({ receiverPhone: '', amount: '', pin: '', description: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-md p-8 w-full max-w-sm">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-gray-600 text-sm mb-6 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-500 text-sm mt-2">Transfer funds to another user</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Receiver Phone Number</label>
            <input
              type="text"
              placeholder="98XXXXXXXX"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 transition"
              value={form.receiverPhone}
              onChange={e => setForm({ ...form, receiverPhone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (NPR)</label>
            <input
              type="number"
              placeholder="Enter amount"
              min="1"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 transition"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Rent, Food, etc."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 transition"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-blue-500 transition"
              value={form.pin}
              onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Sending...' : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  )
}

