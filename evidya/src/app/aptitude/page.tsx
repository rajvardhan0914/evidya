'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function Aptitude() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    )
  }
  if (!session) return null

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aptitude Practice</h1>
            <p className="text-gray-600">Sharpen your analytical and logical reasoning skills.</p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
                  <p className="text-gray-600 text-sm">
                    Full aptitude test modules are being developed. Try the sample question below!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Question */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">⏰</span>
              <span className="text-sm font-medium text-gray-700">Logical Reasoning</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Question</h2>
            <p className="text-gray-700 mb-6">
              If all Bloops are Razzies and all Razzies are Lazzies, then which of the following must be true?
            </p>
            <div className="space-y-3">
              {[
                'All Razzies are Bloops',
                'All Lazzies are Bloops',
                'All Bloops are Lazzies',
                'Some Lazzies are not Razzies'
              ].map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Your answer:</strong> {selectedAnswer}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This is a preview. Full explanations and scoring will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
