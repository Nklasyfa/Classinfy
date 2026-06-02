<template>
  <div class="min-h-screen font-body relative overflow-x-hidden bg-[#F0F4F8] text-[#0b1c30]">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <AdminNavbar v-if="authStore.isAdmin" />
    <UserNavbar v-else />

    <main class="relative z-10 pt-28 pb-20 px-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-[#1A3C6E] tracking-tight mb-1">Notifikasi</h1>
        <p class="text-slate-500 text-sm font-medium">Semua pemberitahuan terkait permohonan dan jadwal kamu.</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-5 flex-wrap">
        <button
          v-for="tab in tabs" :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key ? 'bg-[#1A3C6E] text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'"
          class="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
        >
          {{ tab.label }}
          <span v-if="tab.key === 'unread' && unreadCount > 0" class="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-extrabold">{{ unreadCount }}</span>
        </button>
      </div>

      <!-- Notifications -->
      <div class="space-y-3">
        <div v-if="loading" class="text-center py-16 text-slate-400">
          <p class="font-semibold text-sm">Memuat notifikasi...</p>
        </div>
        <div v-else-if="filteredNotifs.length === 0" class="text-center py-16 text-slate-400">
          <span class="material-symbols-outlined text-5xl mb-3 block">notifications_off</span>
          <p class="font-semibold text-sm">Tidak ada notifikasi</p>
        </div>

        <div
          v-else
          v-for="notif in filteredNotifs" :key="notif.id"
          @click="markRead(notif.id)"
          :class="[
            'bg-white rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md border border-slate-100',
            notif.isRead ? 'opacity-60' : 'shadow-[0_8px_32px_rgba(26,60,110,0.04)]',
            !notif.isRead ? 'border-l-4' : '',
            !notif.isRead ? 'border-blue-400' : '',
          ]"
        >
          <div class="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-lg text-blue-500">info</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <p class="font-extrabold text-sm text-[#1A3C6E] truncate">{{ notif.title }}</p>
              <span v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            </div>
            <p class="text-slate-500 text-xs font-medium leading-relaxed">{{ notif.message }}</p>
            <p class="text-[#1A3C6E]/40 text-[10px] font-semibold mt-2">{{ new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</p>
          </div>
        </div>
      </div>

      <div v-if="unreadCount > 0" class="mt-6 text-center">
        <button @click="markAllRead" class="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          Tandai semua sudah dibaca ({{ unreadCount }})
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'
import UserNavbar from '../../components/layout/UserNavbar.vue'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const activeTab = ref('all')
const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'unread', label: 'Belum Dibaca' }
]

const notifications = ref([])
const loading = ref(false)

const fetchNotifications = async (isInitial = false) => {
  if (isInitial) loading.value = true
  try {
    const res = await axios.get(`${API_URL}/api/notifications`, { headers: authStore.getAuthHeaders() })
    notifications.value = res.data.data || []
  } catch (error) {
    console.error('Failed fetching notifications', error)
  } finally {
    if (isInitial) loading.value = false
  }
}

let pollInterval = null

onMounted(() => {
  fetchNotifications(true)
  pollInterval = setInterval(() => fetchNotifications(false), 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const filteredNotifs = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'unread') return notifications.value.filter(n => !n.isRead)
  return notifications.value
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const markRead = async (id) => {
  try {
    await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { headers: authStore.getAuthHeaders() })
    const notif = notifications.value.find(n => n.id === id)
    if (notif) notif.isRead = true
    window.dispatchEvent(new CustomEvent('refresh-notifications'))
  } catch (error) {
    console.error('Failed marking notification as read', error)
  }
}

const markAllRead = async () => {
  try {
    await axios.patch(`${API_URL}/api/notifications/read-all`, {}, { headers: authStore.getAuthHeaders() })
    notifications.value.forEach(n => n.isRead = true)
    window.dispatchEvent(new CustomEvent('refresh-notifications'))
  } catch (error) {
    console.error('Failed marking all as read', error)
  }
}
</script>
