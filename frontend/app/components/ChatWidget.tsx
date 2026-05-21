'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2, Bot, User, Paperclip, Minimize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  agent_used?: string
}

interface ChatWidgetProps {
  isOpen?: boolean
  onToggle?: () => void
  sessionId?: string
  caseId?: number
  visitorInfo?: {
    name?: string
    email?: string
    ip?: string
    location?: string
    device?: string
    browser?: string
  }
}

export default function ChatWidget({ 
  isOpen = false, 
  onToggle,
  sessionId,
  caseId,
  visitorInfo 
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue,
          case_id: caseId,
          session_id: currentSessionId,
          visitor_info: visitorInfo,
          chat_history: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session ID if it's new
        if (!currentSessionId) {
          setCurrentSessionId(data.session_id)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
          agent_used: data.agent_used
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Legal Assistant</h3>
            <p className="text-xs text-primary-100">
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar h-[480px]">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to Legal Assistant
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  I'm here to help you with legal questions and document analysis. 
                  How can I assist you today?
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      {message.role === 'assistant' ? (
                        <ReactMarkdown className="text-sm">
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs bg-white/10 rounded px-2 py-1">
                              {source}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${
                        message.role === 'user' 
                          ? 'text-primary-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                      {message.agent_used && (
                        <p className={`text-xs ${
                          message.role === 'user' 
                            ? 'text-primary-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.agent_used}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a legal question..."
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              This AI assistant provides general information only. Consult a qualified attorney for legal advice.
            </p>
          </div>
        </>
      )}
    </div>
  )
}