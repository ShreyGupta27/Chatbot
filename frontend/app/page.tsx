'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './providers'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'super_admin':
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'firm_owner':
            router.push('/firm/dashboard')
            break
          case 'lawyer':
            router.push('/lawyer/dashboard')
            break
          case 'client':
            router.push('/client/dashboard')
            break
          default:
            router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Legal Platform
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing your legal workspace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legal-navy to-primary-900">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-legal-gold rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Unified Legal Technology Platform
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Enterprise-grade legal RAG chatbot with comprehensive case management, 
            payment processing, and AI-powered document analysis.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="w-12 h-12 bg-legal-gold rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Case Management</h3>
            <p className="text-blue-100 text-sm">
              Complete case lifecycle management with deadlines, hearings, and document tracking.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="w-12 h-12 bg-legal-gold rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Legal Assistant</h3>
            <p className="text-blue-100 text-sm">
              Specialized AI agents for contract analysis, legal research, and document review.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="w-12 h-12 bg-legal-gold rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Processing</h3>
            <p className="text-blue-100 text-sm">
              Integrated payment processing with Stripe and Razorpay for consultations and services.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-blue-200">
            Redirecting to your dashboard...
          </p>
          <Loader2 className="h-8 w-8 animate-spin text-legal-gold mx-auto" />
        </div>
      </div>
    </div>
  )
}