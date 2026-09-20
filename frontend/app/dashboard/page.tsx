'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  phone: string
  balance: number
  role: string
}

interface Transaction {
  _id: string
  transactionId: string
  senderId: { name: string; phone: string }
  receiverId: { name: string; phone: string }
  senderPhone: string
  receiverPhone: string
  amount: number
  type: string
  status: string
  description: string
  createdAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userRes, txRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions/history')
      ])
      setUser(userRes.data)
      setTransactions(txRes.data.transactions)
    } catch (err) {
      localStorage.removeItem('token')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }} className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-200 text-sm">Welcome back</p>
              <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
              <p className="text-blue-300 text-sm">{user?.phone}</p>
            </div>
            <button
              onClick={logout}
              className="text-blue-200 hover:text-white text-sm border border-blue-400 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <p className="text-blue-200 text-sm mb-1">Available Balance</p>
            <p className="text-white text-4xl font-bold">
              NPR {user?.balance.toLocaleString()}
            </p>
            <p className="text-blue-300 text-xs mt-2">Fund Transfer System</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/send')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-sm font-semibold transition shadow-lg"
          >
            💸 Send Money
          </button>
          <button
            onClick={() => router.push('/topup')}
            className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-sm font-semibold transition shadow-lg"
          >
            ➕ Top Up
          </button>
          <button
            onClick={() => router.push('/pin')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl text-sm font-semibold transition shadow-lg"
          >
            🔐 Set PIN
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h2 className="text-gray-800 font-bold text-lg mb-4">Recent Transactions</h2>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-400 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {transactions.map((tx, i) => {
              const isSender = tx.senderPhone === user?.phone
              const isTopup = tx.type === 'topup'
              return (
                <div
                  key={tx._id}
                  className={`flex items-center px-5 py-4 ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-4 ${
                    isTopup ? 'bg-green-100' : isSender ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {isTopup ? '➕' : isSender ? '↑' : '↓'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {isTopup ? 'Wallet Top-up' : isSender
                        ? `Sent to ${tx.receiverPhone}`
                        : `Received from ${tx.senderPhone}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tx.transactionId} · {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${
                    isTopup ? 'text-green-600' : isSender ? 'text-red-500' : 'text-blue-600'
                  }`}>
                    {isTopup ? '+' : isSender ? '-' : '+'} NPR {tx.amount.toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}