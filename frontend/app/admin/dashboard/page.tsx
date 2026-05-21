'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { 
  Users, FileText, Calendar, CreditCard, MessageSquare, 
  TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign,
  Bot, Filter, Ticket, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  cases: {
    total: number
    active: number
  }
  appointments: {
    total: number
    upcoming: number
  }
  payments: {
    total: number
    revenue: number
  }
  chat: {
    total_sessions: number
    active_sessions: number
  }
}

const mockChartData = [
  { name: 'Mon', cases: 4, sessions: 12, revenue: 2400 },
  { name: 'Tue', cases: 3, sessions: 19, revenue: 1398 },
  { name: 'Wed', cases: 6, sessions: 15, revenue: 9800 },
  { name: 'Thu', cases: 8, sessions: 22, revenue: 3908 },
  { name: 'Fri', cases: 5, sessions: 18, revenue: 4800 },
  { name: 'Sat', cases: 2, sessions: 8, revenue: 3800 },
  { name: 'Sun', cases: 1, sessions: 5, revenue: 4300 },
]

const caseTypeData = [
  { name: 'Contract Law', value: 35, color: '#3B82F6' },
  { name: 'Litigation', value: 25, color: '#EF4444' },
  { name: 'Corporate', value: 20, color: '#10B981' },
  { name: 'Family Law', value: 12, color: '#F59E0B' },
  { name: 'Other', value: 8, color: '#8B5CF6' },
]

export default function AdminDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    color = 'blue' 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    trend?: 'up' | 'down'
    trendValue?: string
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    }

    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {trend && trendValue && (
            <div className="mt-4 flex items-center">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your legal platform today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cases"
          value={stats?.cases.total || 0}
          subtitle={`${stats?.cases.active || 0} active`}
          icon={FileText}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Appointments"
          value={stats?.appointments.upcoming || 0}
          subtitle="This week"
          icon={Calendar}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats?.payments.revenue || 0).toLocaleString()}`}
          subtitle="This month"
          icon={DollarSign}
          trend="up"
          trendValue="+23%"
          color="yellow"
        />
        <StatCard
          title="Chat Sessions"
          value={stats?.chat.active_sessions || 0}
          subtitle="Active now"
          icon={MessageSquare}
          trend="down"
          trendValue="-5%"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cases and chat sessions over the last 7 days
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Cases"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Chat Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Types */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Case Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cases by practice area
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {caseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="card-body space-y-3">
            <button className="w-full flex items-center p-3 text-left bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <FileText className="w-5 h-5 text-primary-600 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Create New Case</span>
            </button>
            <button className="w-full flex items-center p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <Calendar className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Appointment</span>
            </button>
            <button className="w-full flex items-center p-3 text-left bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <Bot className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Configure AI Agent</span>
            </button>
            <button className="w-full flex items-center p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <Users className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Add New User</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    New case created: "Contract Dispute - ABC Corp"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Payment received: $2,500 from Johnson & Associates
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Appointment scheduled with Sarah Miller
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    New chat session started by potential client
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Case deadline approaching: "Smith vs. Jones" due tomorrow
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Agents</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">5 Active</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Message Filters</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">12 Rules</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Excellent</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}