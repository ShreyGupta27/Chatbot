'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth, useTheme } from '../providers'
import { 
  Menu, X, Scale, Home, Users, FileText, MessageSquare, 
  Calendar, CreditCard, Settings, BarChart3, Shield, 
  Bot, Filter, Ticket, Moon, Sun, LogOut, Bell,
  ChevronDown, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Cases', href: '/admin/cases', icon: FileText, badge: '12' },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { 
    name: 'AI & Chat', 
    href: '/admin/ai', 
    icon: Bot,
    children: [
      { name: 'AI Agents', href: '/admin/agents', icon: Bot },
      { name: 'Message Filters', href: '/admin/filters', icon: Filter },
      { name: 'Chat Sessions', href: '/admin/sessions', icon: MessageSquare },
    ]
  },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket, badge: '3' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user has admin access
    if (user && !['super_admin', 'admin'].includes(user.role)) {
      toast.error('Access denied. Admin privileges required.')
      router.push('/login')
    }
  }, [user, router])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href

  const SidebarItem = ({ item, level = 0 }: { item: SidebarItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)

    return (
      <div>
        <div
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer
            transition-colors duration-200
            ${level > 0 ? 'ml-4' : ''}
            ${active 
              ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name)
            } else {
              router.push(item.href)
              setSidebarOpen(false)
            }
          }}
        >
          <div className="flex items-center">
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-200">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarItem key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Legal Platform</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden md:flex items-center ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cases, users, documents..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}