/**
 * useApi — Centralized API configuration composable
 * 
 * Provides the base API URL and axios instance for all views/components.
 * Usage: const { API_URL, api } = useApi()
 */
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useApi() {
  const authStore = useAuthStore()

  // Pre-configured axios instance with auth headers
  const api = axios.create({
    baseURL: API_URL,
  })

  // Auto-attach Authorization header
  api.interceptors.request.use((config) => {
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  })

  return {
    API_URL,
    api,
  }
}
