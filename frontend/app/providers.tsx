'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark'
  primaryColor: string
  fontFamily: string
  toggleTheme: () => void
  setPrimaryColor: (color: string) => void
  setFontFamily: (font: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Auth Context
interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  status: string
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Theme Provider
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [primaryColor, setPrimaryColorState] = useState('#3B82F6')
  const [fontFamily, setFontFamilyState] = useState('Inter')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const savedColor = localStorage.getItem('primaryColor')
    const savedFont = localStorage.getItem('fontFamily')

    if (savedTheme) setTheme(savedTheme)
    if (savedColor) setPrimaryColorState(savedColor)
    if (savedFont) setFontFamilyState(savedFont)

    // Apply theme to document
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    
    // Apply font family
    if (savedFont) {
      document.documentElement.style.fontFamily = savedFont === 'Inter' ? 'var(--font-inter)' :
        savedFont === 'Poppins' ? 'var(--font-poppins)' : 'var(--font-roboto-mono)'
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color)
    localStorage.setItem('primaryColor', color)
    
    // Update CSS variables
    const root = document.documentElement
    const hsl = hexToHsl(color)
    
    // Generate color palette
    const shades = generateColorShades(hsl)
    shades.forEach((shade, index) => {
      const step = (index + 1) * 100
      root.style.setProperty(`--primary-${step}`, shade)
    })
  }

  const setFontFamily = (font: string) => {
    setFontFamilyState(font)
    localStorage.setItem('fontFamily', font)
    
    const fontVar = font === 'Inter' ? 'var(--font-inter)' :
      font === 'Poppins' ? 'var(--font-poppins)' : 'var(--font-roboto-mono)'
    
    document.documentElement.style.fontFamily = fontVar
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      primaryColor,
      fontFamily,
      toggleTheme,
      setPrimaryColor,
      setFontFamily
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth data from localStorage
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Main Providers Component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

// Utility functions
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

function generateColorShades([h, s, l]: [number, number, number]): string[] {
  const shades = []
  
  // Generate 9 shades (50, 100, 200, ..., 900)
  for (let i = 0; i < 9; i++) {
    const lightness = i === 0 ? 95 : // 50
                     i === 1 ? 90 : // 100
                     i === 2 ? 80 : // 200
                     i === 3 ? 70 : // 300
                     i === 4 ? 60 : // 400
                     i === 5 ? l :  // 500 (base)
                     i === 6 ? l - 10 : // 600
                     i === 7 ? l - 20 : // 700
                     i === 8 ? l - 30 : // 800
                     l - 40 // 900
    
    shades.push(`hsl(${h}, ${s}%, ${Math.max(0, Math.min(100, lightness))}%)`)
  }
  
  return shades
}