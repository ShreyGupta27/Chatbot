/**
 * API Configuration
 * Centralized API endpoint configuration to avoid hardcoding URLs
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/token`,
    register: `${API_BASE_URL}/register`,
    getCurrentUser: `${API_BASE_URL}/users/me`,
  },

  // Cases
  cases: {
    list: `${API_BASE_URL}/cases`,
    create: `${API_BASE_URL}/cases`,
    get: (id: number) => `${API_BASE_URL}/cases/${id}`,
    update: (id: number) => `${API_BASE_URL}/cases/${id}`,
    delete: (id: number) => `${API_BASE_URL}/cases/${id}`,
  },

  // Documents
  documents: {
    list: `${API_BASE_URL}/documents`,
    upload: `${API_BASE_URL}/upload`,
    get: (id: number) => `${API_BASE_URL}/documents/${id}`,
    delete: (id: number) => `${API_BASE_URL}/documents/${id}`,
  },

  // AI & Chat
  chat: {
    query: `${API_BASE_URL}/query`,
    sessions: `${API_BASE_URL}/sessions`,
    getSession: (id: string) => `${API_BASE_URL}/sessions/${id}`,
  },

  // AI Agents
  agents: {
    list: `${API_BASE_URL}/agents`,
    create: `${API_BASE_URL}/agents`,
    get: (id: number) => `${API_BASE_URL}/agents/${id}`,
    update: (id: number) => `${API_BASE_URL}/agents/${id}`,
    delete: (id: number) => `${API_BASE_URL}/agents/${id}`,
  },

  // Appointments
  appointments: {
    list: `${API_BASE_URL}/appointments`,
    create: `${API_BASE_URL}/appointments`,
    get: (id: number) => `${API_BASE_URL}/appointments/${id}`,
    update: (id: number) => `${API_BASE_URL}/appointments/${id}`,
    delete: (id: number) => `${API_BASE_URL}/appointments/${id}`,
  },

  // Payments
  payments: {
    list: `${API_BASE_URL}/payments`,
    createIntent: `${API_BASE_URL}/payments/create-intent`,
    confirm: (id: number) => `${API_BASE_URL}/payments/${id}/confirm`,
    get: (id: number) => `${API_BASE_URL}/payments/${id}`,
  },

  // Analytics
  analytics: {
    dashboard: `${API_BASE_URL}/analytics/dashboard`,
  },

  // Message Filters
  filters: {
    list: `${API_BASE_URL}/filters`,
    create: `${API_BASE_URL}/filters`,
    delete: (id: number) => `${API_BASE_URL}/filters/${id}`,
  },

  // Support Tickets
  tickets: {
    list: `${API_BASE_URL}/tickets`,
    create: `${API_BASE_URL}/tickets`,
    get: (id: number) => `${API_BASE_URL}/tickets/${id}`,
    update: (id: number) => `${API_BASE_URL}/tickets/${id}`,
  },
}

export default API_ENDPOINTS