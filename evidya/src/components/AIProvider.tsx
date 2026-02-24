'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

interface AIContextType {
    messages: Message[]
    loading: boolean
    sendMessage: (prompt: string, preferences: any) => Promise<void>
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    // Load chat history from localStorage on mount (user-specific)
    useEffect(() => {
        if (!userId) return

        const storageKey = `ai-chat-history-${userId}`
        const savedChat = localStorage.getItem(storageKey)
        if (savedChat) {
            try {
                setMessages(JSON.parse(savedChat))
            } catch (e) {
                console.error('Failed to parse chat history', e)
            }
        }
    }, [userId])

    // Persist chat history whenever it changes (user-specific)
    useEffect(() => {
        if (!userId) return

        const storageKey = `ai-chat-history-${userId}`
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages))
        }
    }, [messages, userId])

    const sendMessage = async (prompt: string, preferences: any) => {
        if (!prompt.trim() || loading) return

        const userMsg: Message = {
            role: 'user',
            content: prompt,
            timestamp: Date.now()
        }

        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.slice(-10),
                    ...preferences
                }),
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'AI service error')
            }
            const data = await res.json()

            const assistantMsg: Message = {
                role: 'assistant',
                content: data.response || data.error || 'No response received.',
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, assistantMsg])
        } catch (error: any) {
            const errorMsg: Message = {
                role: 'assistant',
                content: `Error: ${error.message || 'Failed to get AI response.'}`,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    return (
        <AIContext.Provider value={{ messages, loading, sendMessage, setMessages }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    const context = useContext(AIContext)
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider')
    }
    return context
}
