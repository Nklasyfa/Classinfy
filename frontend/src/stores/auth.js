import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  // ==================== State ====================
  const token = ref(null)
  const user = ref(null)

  // ==================== Getters ====================
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role?.id === 1)
  const isPJ = computed(() => [1, 3, 4].includes(user.value?.role?.id))
  const roleId = computed(() => user.value?.role?.id ?? null)
  const roleName = computed(() => user.value?.role?.name ?? null)

  // ==================== Actions ====================
  function loadFromStorage() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken) token.value = savedToken
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        user.value = null
      }
    }
  }

  async function login(email, password) {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    if (response.data.token) {
      token.value = response.data.token
      user.value = response.data.data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
    return response.data
  }

  async function register(username, email, password) {
    const response = await axios.post(`${API_URL}/api/auth/register`, { username, email, password })
    return response.data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Axios interceptor: auto-attach Authorization header
  function getAuthHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isPJ,
    roleId,
    roleName,
    loadFromStorage,
    login,
    register,
    logout,
    getAuthHeaders,
  }
})
