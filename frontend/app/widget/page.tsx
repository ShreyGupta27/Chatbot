'use client'

import { useState, useEffect } from 'react'
import ChatWidget from '../components/ChatWidget'

export default function WidgetPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [visitorInfo, setVisitorInfo] = useState({
    ip: '',
    location: '',
    device: '',
    browser: ''
  })

  useEffect(() => {
    // Collect visitor information
    const collectVisitorInfo = () => {
      const userAgent = navigator.userAgent
      
      // Detect device type
      let device = 'Desktop'
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        device = 'Mobile'
      } else if (/iPad/i.test(userAgent)) {
        device = 'Tablet'
      }

      // Detect browser
      let browser = 'Unknown'
      if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Edge')) browser = 'Edge'

      setVisitorInfo({
        ip: 'Unknown', // Would need server-side detection
        location: 'Unknown', // Would need geolocation API
        device,
        browser
      })
    }

    collectVisitorInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-navy via-primary-800 to-legal-burgundy relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center text-white mb-12 max-w-4xl">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-legal-gold rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Legal AI Assistant
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Get instant answers to your legal questions with our advanced AI-powered assistant. 
              Specialized in contract analysis, legal research, and case law interpretation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-legal-gold rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Legal Guidance</h3>
              <p className="text-blue-100 leading-relaxed">
                Get immediate answers to legal questions with AI trained on extensive legal databases and case law.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-legal-gold rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Document Analysis</h3>
              <p className="text-blue-100 leading-relaxed">
                Upload contracts, agreements, and legal documents for AI-powered analysis and risk assessment.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-legal-gold rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-legal-navy" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Confidential</h3>
              <p className="text-blue-100 leading-relaxed">
                All conversations are encrypted and confidential. Your legal matters remain private and secure.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-legal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-legal-gold font-bold text-lg">1</span>
                </div>
                <p className="text-blue-100">Click the chat button to start a conversation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-legal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-legal-gold font-bold text-lg">2</span>
                </div>
                <p className="text-blue-100">Ask your legal question or upload documents</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-legal-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-legal-gold font-bold text-lg">3</span>
                </div>
                <p className="text-blue-100">Receive expert AI-powered legal guidance</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-blue-200 text-sm mb-4">
              Ready to get started? Click the chat button in the bottom right corner.
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-blue-300">
              <span>✓ Available 24/7</span>
              <span>✓ Instant Responses</span>
              <span>✓ Multiple Legal Areas</span>
              <span>✓ Document Upload</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 max-w-4xl text-center">
          <p className="text-blue-200 text-sm leading-relaxed">
            <strong className="text-legal-gold">Legal Disclaimer:</strong> This AI assistant provides general legal information only and does not constitute legal advice. 
            For specific legal matters, please consult with a qualified attorney. The information provided should not be relied upon as a substitute for professional legal counsel.
          </p>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        visitorInfo={visitorInfo}
      />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-legal-gold/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-legal-burgundy/20 rounded-full blur-xl"></div>
    </div>
  )
}