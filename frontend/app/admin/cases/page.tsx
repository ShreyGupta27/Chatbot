'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, 
  Calendar, Clock, AlertCircle, CheckCircle, FileText, User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Case {
  id: number
  case_number: string
  title: string
  case_type: string
  status: string
  priority: string
  client_name?: string
  lawyer_name?: string
  created_at: string
  deadline?: string
}

const statusColors = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  discovery: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  trial: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export default function CasesPage() {
  const { token } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const response = await fetch('http://localhost:8000/cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCases(data)
      } else {
        toast.error('Failed to fetch cases')
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error('Error loading cases')
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || case_.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const CreateCaseModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      case_type: '',
      client_id: '',
      priority: 'medium',
      deadline: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const response = await fetch('http://localhost:8000/cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            client_id: parseInt(formData.client_id),
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
          })
        })

        if (response.ok) {
          toast.success('Case created successfully')
          setShowCreateModal(false)
          fetchCases()
          setFormData({
            title: '',
            description: '',
            case_type: '',
            client_id: '',
            priority: 'medium',
            deadline: ''
          })
        } else {
          const error = await response.json()
          toast.error(error.detail || 'Failed to create case')
        }
      } catch (error) {
        console.error('Error creating case:', error)
        toast.error('Error creating case')
      }
    }

    if (!showCreateModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Case
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Case Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter case title"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Case description"
              />
            </div>

            <div>
              <label className="form-label">Case Type</label>
              <select
                required
                className="form-input"
                value={formData.case_type}
                onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
              >
                <option value="">Select case type</option>
                <option value="contract">Contract Law</option>
                <option value="litigation">Litigation</option>
                <option value="corporate">Corporate Law</option>
                <option value="family">Family Law</option>
                <option value="criminal">Criminal Law</option>
                <option value="immigration">Immigration</option>
                <option value="intellectual_property">Intellectual Property</option>
                <option value="real_estate">Real Estate</option>
              </select>
            </div>

            <div>
              <label className="form-label">Client ID</label>
              <input
                type="number"
                required
                className="form-input"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                placeholder="Enter client ID"
              />
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label">Deadline (Optional)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Case
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cases</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all legal cases
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="intake">Intake</option>
                <option value="discovery">Discovery</option>
                <option value="trial">Trial</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Case</th>
                <th>Client</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredCases.map((case_) => (
                <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {case_.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {case_.case_number}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {case_.client_name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {case_.case_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[case_.status as keyof typeof statusColors]}`}>
                      {case_.status === 'closed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {case_.status === 'trial' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
                      {case_.priority.charAt(0).toUpperCase() + case_.priority.slice(1)}
                    </span>
                  </td>
                  <td>
                    {case_.deadline ? (
                      <div className={`flex items-center ${isOverdue(case_.deadline) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {formatDate(case_.deadline)}
                        </span>
                        {isOverdue(case_.deadline) && (
                          <AlertCircle className="w-4 h-4 ml-1 text-red-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No deadline</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(case_.created_at)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No cases found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first case.'
                }
              </p>
              {!searchTerm && !statusFilter && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create First Case
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateCaseModal />
    </div>
  )
}