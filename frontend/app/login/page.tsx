'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers'
import { Eye, EyeOff, Scale, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('username', formData.username)
      formDataObj.append('password', formData.password)

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        body: formDataObj,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Get user info
        const userResponse = await fetch('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          login(data.access_token, userData)
          
          toast.success('Login successful!')
          
          // Redirect based on role
          switch (userData.role) {
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
              router.push('/dashboard')
          }
        } else {
          throw new Error('Failed to get user information')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-legal-navy to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-legal-gold rounded-lg flex items-center justify-center mr-4">
                <Scale className="w-6 h-6 text-legal-navy" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Legal Platform</h1>
                <p className="text-blue-200">Enterprise Legal Technology</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Welcome to the Future of Legal Practice
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Streamline your legal workflow with AI-powered case management, 
              document analysis, and client communication tools.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-legal-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-legal-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Legal Research</h3>
                <p className="text-blue-200 text-sm">Get instant answers from your legal documents with advanced RAG technology.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-legal-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-legal-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Complete Case Management</h3>
                <p className="text-blue-200 text-sm">Track cases, deadlines, appointments, and payments in one unified platform.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-legal-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-legal-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Compliant</h3>
                <p className="text-blue-200 text-sm">Enterprise-grade security with role-based access and audit trails.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal Platform</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your legal workspace and AI assistant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                <p className="text-gray-600 dark:text-gray-400">admin / admin123</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">Lawyer</p>
                <p className="text-gray-600 dark:text-gray-400">lawyer / lawyer123</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}