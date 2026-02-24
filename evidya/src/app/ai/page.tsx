'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface AIPreference {
  model: string
  temperature: number
  maxTokens: number
  responseStyle: 'concise' | 'detailed' | 'balanced'
}

export default function AIPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [preferences, setPreferences] = useState<AIPreference>({
    model: 'llama3.2:latest',
    temperature: 0.7,
    maxTokens: 1000,
    responseStyle: 'balanced',
  })
  const [showSettings, setShowSettings] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Initial Auth Check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch Chats on Load
  useEffect(() => {
    if (session?.user) {
      fetchChats()
    }
  }, [session])

  // Fetch Messages when Chat Selected
  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId)
    } else {
      setMessages([])
    }
  }, [currentChatId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchChats() {
    try {
      const res = await fetch('/api/ai/chats')
      if (res.ok) {
        const data = await res.json()
        setChats(data)
        // Optionally select the most recent chat if none selected?
        // For now, let's leave it unselected to show "New Chat" screen or select first.
        // if (data.length > 0 && !currentChatId) setCurrentChatId(data[0].id)
      }
    } catch (e) {
      console.error('Failed to fetch chats', e)
    }
  }

  async function fetchMessages(chatId: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/ai/chats/${chatId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (e) {
      console.error('Failed to fetch messages', e)
    } finally {
      setLoading(false)
    }
  }

  async function createNewChat() {
    try {
      const res = await fetch('/api/ai/chats', { method: 'POST' })
      if (res.ok) {
        const newChat = await res.json()
        setChats([newChat, ...chats])
        setCurrentChatId(newChat.id)
        setMessages([])
      }
    } catch (e) {
      console.error("Error creating chat", e)
    }
  }

  async function handleDeleteChat(e: React.MouseEvent, chatId: string) {
    e.stopPropagation()
    if (!confirm("Delete this chat?")) return

    try {
      const res = await fetch(`/api/ai/chats/${chatId}`, { method: 'DELETE' })
      if (res.ok) {
        setChats(chats.filter(c => c.id !== chatId))
        if (currentChatId === chatId) {
          setCurrentChatId(null)
          setMessages([])
        }
      }
    } catch (e) { console.error(e) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    let activeChatId = currentChatId

    // If no chat selected, create one first
    if (!activeChatId) {
      try {
        const res = await fetch('/api/ai/chats', { method: 'POST' })
        if (res.ok) {
          const newChat = await res.json()
          setChats([newChat, ...chats])
          setCurrentChatId(newChat.id)
          activeChatId = newChat.id
        } else {
          return // Failed
        }
      } catch (e) { return }
    }

    if (!activeChatId) return

    const currentPrompt = prompt
    setPrompt('')

    // Optimistic Update
    const userMsg: Message = { role: 'user', content: currentPrompt, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`/api/ai/chats/${activeChatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentPrompt,
          ...preferences
        })
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = { role: 'assistant', content: data.response, timestamp: Date.now() }
        setMessages(prev => [...prev, aiMsg])

        // Refresh chats list to update titles if it was new
        fetchChats()
      } else {
        // Handle error
        setMessages(prev => [...prev, { role: 'assistant', content: "Error: Failed to get response.", timestamp: Date.now() }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: connection failed.", timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return null
  if (!session) return null

  return (
    <AppLayout>
      <div className="flex h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0 overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={createNewChat}
              className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                className={`group p-3 rounded-lg text-sm cursor-pointer flex items-center justify-between transition-colors ${currentChatId === chat.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="truncate flex-1">{chat.title || 'New Chat'}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
            {chats.length === 0 && (
              <div className="text-center text-xs text-gray-400 mt-10">No chats yet</div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">

          {/* Toggle Sidebar Button (Mobile/Desktop) */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white rounded-md shadow border border-gray-200 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="p-4 border-b bg-white flex justify-end items-center h-16 shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs bg-gray-100 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-gray-600 font-medium tracking-tight">AI Active</span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </div>

          {/* Settings Drawer */}
          {showSettings && (
            <div className="bg-gray-50 p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-500">Model</label>
                <select value={preferences.model} onChange={e => setPreferences({ ...preferences, model: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1 px-2">
                  <option value="llama3.2:latest">Llama 3.2 (Local)</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-500">Style</label>
                <select value={preferences.responseStyle} onChange={e => setPreferences({ ...preferences, responseStyle: e.target.value as any })} className="mt-1 block w-full rounded border-gray-300 py-1 px-2">
                  <option value="balanced">Balanced</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-500">Temperature: {preferences.temperature}</label>
                <input type="range" min="0" max="1" step="0.1" value={preferences.temperature} onChange={e => setPreferences({ ...preferences, temperature: parseFloat(e.target.value) })} className="w-full mt-2 accent-blue-600" />
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
                <p className="text-gray-500 max-w-sm">I can help you brainstorm ideas, debug code, or explain complex topics.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                    <div className="prose prose-sm max-w-none text-inherit leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4 rounded-tl-none flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white relative z-10">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                  placeholder="Message..."
                  className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-[56px] max-h-32 transition-all shadow-sm"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
