'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { 
  Plus, Bot, Edit, Trash2, Power, PowerOff, 
  Brain, Scale, Building, Users, Shield, 
  FileText, Gavel, Home, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AIAgent {
  id: number
  name: string
  alias: string
  specialization: string
  model: string
  temperature: number
  created_at: string
}

const specializationIcons = {
  general: Brain,
  legal_research: Scale,
  contract_analysis: FileText,
  litigation: Gavel,
  corporate: Building,
  family_law: Users,
  criminal_law: Shield,
  immigration: Globe,
  intellectual_property: Brain,
  real_estate: Home
}

const specializationColors = {
  general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  legal_research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  contract_analysis: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  litigation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  corporate: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  family_law: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  criminal_law: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  immigration: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  intellectual_property: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  real_estate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
}

export default function AgentsPage() {
  const { token } = useAuth()
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAgents(data)
      } else {
        toast.error('Failed to fetch agents')
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Error loading agents')
    } finally {
      setLoading(false)
    }
  }

  const CreateAgentModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      alias: '',
      model: 'gemma2:2b-instruct-q8_0',
      system_prompt: '',
      temperature: 0.7,
      specialization: 'general'
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const response = await fetch('http://localhost:8000/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast.success('AI Agent created successfully')
          setShowCreateModal(false)
          fetchAgents()
          setFormData({
            name: '',
            alias: '',
            model: 'gemma2:2b-instruct-q8_0',
            system_prompt: '',
            temperature: 0.7,
            specialization: 'general'
          })
        } else {
          const error = await response.json()
          toast.error(error.detail || 'Failed to create agent')
        }
      } catch (error) {
        console.error('Error creating agent:', error)
        toast.error('Error creating agent')
      }
    }

    const getSystemPromptTemplate = (specialization: string) => {
      const templates = {
        general: "You are a helpful legal assistant. Provide accurate legal information while reminding users that this is not legal advice and they should consult with a qualified attorney for specific legal matters.",
        legal_research: "You are a legal research specialist. Help users find relevant case law, statutes, and legal precedents. Provide comprehensive research assistance while maintaining accuracy and citing sources.",
        contract_analysis: "You are a contract analysis specialist. Help users understand contract terms, identify potential issues, and explain legal language in plain English. Focus on clarity and risk assessment.",
        litigation: "You are a litigation support specialist. Assist with case strategy, document review, and trial preparation. Provide tactical insights while maintaining objectivity.",
        corporate: "You are a corporate law specialist. Help with business formation, compliance, mergers and acquisitions, and corporate governance matters.",
        family_law: "You are a family law specialist. Assist with divorce, custody, adoption, and domestic relations matters with sensitivity and compassion.",
        criminal_law: "You are a criminal law specialist. Help with criminal defense strategies, plea negotiations, and understanding criminal procedures and rights.",
        immigration: "You are an immigration law specialist. Assist with visa applications, citizenship processes, and immigration compliance matters.",
        intellectual_property: "You are an intellectual property specialist. Help with patents, trademarks, copyrights, and IP protection strategies.",
        real_estate: "You are a real estate law specialist. Assist with property transactions, leases, zoning issues, and real estate disputes."
      }
      return templates[specialization as keyof typeof templates] || templates.general
    }

    useEffect(() => {
      setFormData(prev => ({
        ...prev,
        system_prompt: getSystemPromptTemplate(prev.specialization)
      }))
    }, [formData.specialization])

    if (!showCreateModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New AI Agent
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., contract_specialist"
                />
                <p className="text-xs text-gray-500 mt-1">Internal identifier (no spaces)</p>
              </div>

              <div>
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.alias}
                  onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                  placeholder="e.g., Contract Analysis Specialist"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Specialization</label>
                <select
                  className="form-input"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                >
                  <option value="general">General Legal Assistant</option>
                  <option value="legal_research">Legal Research</option>
                  <option value="contract_analysis">Contract Analysis</option>
                  <option value="litigation">Litigation Support</option>
                  <option value="corporate">Corporate Law</option>
                  <option value="family_law">Family Law</option>
                  <option value="criminal_law">Criminal Law</option>
                  <option value="immigration">Immigration Law</option>
                  <option value="intellectual_property">Intellectual Property</option>
                  <option value="real_estate">Real Estate Law</option>
                </select>
              </div>

              <div>
                <label className="form-label">AI Model</label>
                <select
                  className="form-input"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                >
                  <option value="gemma2:2b-instruct-q8_0">Gemma 2B (Fast)</option>
                  <option value="gemma2:7b-instruct-q8_0">Gemma 7B (Balanced)</option>
                  <option value="qwen2.5:3b">Qwen 2.5 3B</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Cloud)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Temperature</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="flex-1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {formData.temperature}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower values (0.1-0.3) for factual responses, higher values (0.7-0.9) for creative responses
              </p>
            </div>

            <div>
              <label className="form-label">System Prompt</label>
              <textarea
                className="form-input"
                rows={6}
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="Define the agent's role, expertise, and behavior..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This prompt defines how the AI agent behaves and responds to queries
              </p>
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
                Create Agent
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage specialized AI agents for different legal practice areas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = specializationIcons[agent.specialization as keyof typeof specializationIcons] || Bot
          const colorClass = specializationColors[agent.specialization as keyof typeof specializationColors]
          
          return (
            <div key={agent.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {agent.alias}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                      {agent.specialization.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between items-center mb-1">
                      <span>Model:</span>
                      <span className="font-medium">{agent.model}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Temperature:</span>
                      <span className="font-medium">{agent.temperature}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                    </div>
                    <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      <Bot className="w-4 h-4" />
                      <span>Test Agent</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No AI agents configured
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create specialized AI agents to handle different types of legal queries and provide expert assistance.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Agent
          </button>
        </div>
      )}

      <CreateAgentModal />
    </div>
  )
}