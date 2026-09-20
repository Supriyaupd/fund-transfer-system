'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

export default function SetPin() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (pin.length !== 4) {
      return setError('PIN must be exactly 4 digits')
    }

    if (pin !== confirmPin) {
      return setError('PINs do not match')
    }

    setLoading(true)
    try {
      await api.post('/auth/set-pin', { pin })
      setSuccess('PIN set successfully!')
      setTimeout(() => router.push('/dashboard'), 1500)
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Transaction PIN</h1>
          <p className="text-gray-500 text-sm mt-2">This PIN will be required every time you send money</p>
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">Enter 4-digit PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-purple-500 transition"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-purple-500 transition"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Saving...' : 'Set PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}