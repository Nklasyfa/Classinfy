<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const notifications = ref([])
const unreadCount = ref(0)
const unreadChatsCount = ref(0)
const unverifiedCount = ref(0)
const showProfileDropdown = ref(false)

const navLinks = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Fasilitas', path: '/admin/fasilitas' },
  { name: 'Akademik', path: '/admin/akademik' },
  { name: 'Permohonan', path: '/admin/permohonan' },
  { name: 'Users', path: '/admin/users' },
]

const logout = () => {
  authStore.logout()
  router.push('/auth/login')
}

const fetchNotifications = async () => {
  try {
    const resUsers = await axios.get(`${API_URL}/api/users`, { headers: authStore.getAuthHeaders() })
    const users = resUsers.data.data || []
    unverifiedCount.value = users.filter(u => !u.isVerified).length

    const resNotif = await axios.get(`${API_URL}/api/notifications`, { headers: authStore.getAuthHeaders() })
    notifications.value = resNotif.data.data || []
    unreadCount.value = notifications.value.filter(n => !n.isRead && n.title !== 'Pesan Chat Masuk').length
    unreadChatsCount.value = notifications.value.filter(n => !n.isRead && n.title === 'Pesan Chat Masuk').length
  } catch (error) {
    console.error('Failed fetching data for admin navbar', error)
  }
}

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const closeDropdowns = (e) => {
  if (!e.target.closest('.nav-dropdown-area')) {
    showProfileDropdown.value = false
  }
}

let pollInterval = null

onMounted(() => {
  fetchNotifications()
  pollInterval = setInterval(fetchNotifications, 5000)
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', closeDropdowns)
})
</script>

<template>
  <div class="fixed top-6 left-0 w-full z-50 px-8 flex justify-center">
    <nav class="bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,60,110,0.08)] border border-white/20 rounded-full px-8 py-2.5 flex items-center gap-8 max-w-7xl w-full justify-between nav-dropdown-area">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 text-2xl font-black text-[#1A3C6E] tracking-tighter">
        <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">school</span>
        CLASSINFY
      </router-link>

      <!-- Nav Links -->
      <div class="hidden md:flex items-center gap-2">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          :class="[
            route.path === link.path 
              ? 'bg-[#1A3C6E] text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-500 hover:bg-slate-100'
          ]"
          class="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
        >
          {{ link.name }}
        </router-link>
      </div>

      <!-- User Profile & Icons -->
      <div class="flex items-center gap-4 border-l border-slate-200 pl-6 ml-2 relative">
        <!-- Notification Icon -->
        <router-link to="/notifikasi" class="relative p-2 text-[#1A3C6E]/60 hover:text-[#1A3C6E] transition-colors cursor-pointer focus:outline-none" title="Notifikasi Sistem">
          <span class="material-symbols-outlined text-xl">notifications</span>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md border border-white animate-pulse">
            {{ unreadCount }}
          </span>
        </router-link>



        <!-- Chat Icon -->
        <router-link to="/chat" class="relative p-2 text-[#1A3C6E]/60 hover:text-[#1A3C6E] transition-colors cursor-pointer" title="Pesan Masuk">
          <span class="material-symbols-outlined text-xl">forum</span>
          <span v-if="unreadChatsCount > 0" class="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md border border-white animate-pulse">
            {{ unreadChatsCount }}
          </span>
        </router-link>

        <div class="text-right hidden sm:block">
          <p class="text-[10px] font-black text-[#1A3C6E] uppercase tracking-widest leading-none">{{ authStore.user?.roleId === 1 ? 'ADMIN' : 'USER' }}</p>
          <p class="text-xs font-medium text-slate-400">{{ authStore.user?.username || 'Administrator' }}</p>
        </div>
        
        <!-- Profile Toggle -->
        <div class="relative">
          <button @click="toggleProfileDropdown" class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#001B3F] to-blue-700 text-white flex items-center justify-center font-bold text-lg hover:shadow-lg transition-all overflow-hidden border-2 border-white shadow-md cursor-pointer focus:outline-none bg-cover bg-center"
            :style="authStore.user?.profilePicture ? `background-image: url(${API_URL}${authStore.user.profilePicture})` : ''">
            {{ !authStore.user?.profilePicture ? (authStore.user?.username?.charAt(0).toUpperCase() || 'A') : '' }}
          </button>

          <!-- Profile Dropdown -->
          <div v-if="showProfileDropdown" class="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div class="p-4 border-b border-slate-50 bg-slate-50">
              <p class="font-bold text-slate-800 text-sm truncate">{{ authStore.user?.username }}</p>
              <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
            </div>
            <div class="p-2">
              <button class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-3 font-medium">
                <span class="material-symbols-outlined text-[18px]">person</span>
                Profil Settings
              </button>
              <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3 font-medium mt-1">
                <span class="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.router-link-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
