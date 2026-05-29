<template>
  <div class="min-h-screen font-body relative overflow-x-hidden bg-[#F0F4F8] text-[#0b1c30]">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <!-- TopNavBar -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSINFY</span>
      </div>
      <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
        <router-link to="/" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Monitoring</router-link>
        
        <!-- Tampil kalau sudah login -->
        <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated" to="/dashboard" custom>
          <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Dashboard</a>
        </router-link>

        <!-- Admin: tampilkan Fasilitas, bukan Peminjaman -->
        <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated && authStore.isAdmin" to="/admin/dashboard" custom>
          <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Fasilitas</a>
        </router-link>
        <router-link v-else to="/peminjaman" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Peminjaman</router-link>
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" @click="router.push('/team')">Tentang</a>
      </nav>

      <!-- Jika sudah login: tampilkan info user + logout -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <!-- Notification Icon -->
        <router-link to="/notifikasi" class="relative p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Notifikasi">
          <span class="material-symbols-outlined text-xl">notifications</span>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ unreadCount }}</span>
        </router-link>
        <!-- Chat Icon -->
        <router-link to="/chat" class="p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Chat dengan Admin">
          <span class="material-symbols-outlined text-xl">chat</span>
        </router-link>

        <div class="text-right hidden sm:block">
          <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ authStore.user?.role?.name || 'User' }}</p>
          <p class="text-[10px] text-slate-500 font-medium">{{ authStore.user?.username || '' }}</p>
        </div>
        <div
          @click="router.push('/dashboard')"
          class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform"
          title="Ke Dashboard"
        >
          {{ initials }}
        </div>
        <button
          @click="handleLogout"
          class="text-slate-500 hover:text-red-600 transition-colors cursor-pointer p-1"
          title="Logout"
        >
          <span class="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
      <!-- Jika belum login: tampilkan tombol Login -->
      <button
        v-else
        @click="router.push('/auth/login')"
        class="bg-transparent border border-primary-container text-primary-container px-6 py-2 rounded-full font-bold hover:bg-primary-container hover:text-white transition-all duration-200 cursor-pointer"
      >
        Login
      </button>
    </header>

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
        <div v-if="filteredNotifs.length === 0" class="text-center py-16 text-slate-400">
          <span class="material-symbols-outlined text-5xl mb-3 block">notifications_off</span>
          <p class="font-semibold text-sm">Tidak ada notifikasi</p>
        </div>

        <div
          v-for="notif in filteredNotifs" :key="notif.id"
          @click="markRead(notif.id)"
          :class="[
            'bg-white rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md border border-slate-100',
            notif.read ? 'opacity-60' : 'shadow-[0_8px_32px_rgba(26,60,110,0.04)]',
            !notif.read ? 'border-l-4' : '',
            !notif.read && notif.type === 'approved' ? 'border-green-400' : '',
            !notif.read && notif.type === 'rejected' ? 'border-red-400' : '',
            !notif.read && notif.type === 'pending' ? 'border-amber-400' : '',
            !notif.read && notif.type === 'info' ? 'border-blue-400' : '',
          ]"
        >
          <div :class="iconBg(notif.type)" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-lg" :class="iconColor(notif.type)">{{ iconName(notif.type) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <p class="font-extrabold text-sm text-[#1A3C6E] truncate">{{ notif.title }}</p>
              <span v-if="!notif.read" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            </div>
            <p class="text-slate-500 text-xs font-medium leading-relaxed">{{ notif.body }}</p>
            <p class="text-[#1A3C6E]/40 text-[10px] font-semibold mt-2">{{ notif.time }}</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('all')
const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'unread', label: 'Belum Dibaca' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
]

const notifications = ref([
  { id: 1, type: 'approved', read: false, title: 'Permohonan Disetujui', body: 'Permohonan peminjaman Ruang R.301 pada Selasa, 27 Mei 2026 pukul 09.00–11.00 telah disetujui oleh admin.', time: '2 jam lalu' },
  { id: 2, type: 'pending', read: false, title: 'Permohonan Sedang Diproses', body: 'Permohonan peminjaman Ruang Labkom 1 pada Rabu, 28 Mei 2026 masih dalam antrian review admin.', time: '5 jam lalu' },
  { id: 3, type: 'rejected', read: false, title: 'Permohonan Ditolak', body: 'Permohonan peminjaman Gedung 2 Lt.3 ditolak karena jadwal bentrok dengan kegiatan akademik.', time: 'Kemarin, 14:30' },
  { id: 4, type: 'info', read: true, title: 'Pengingat: Peminjaman Besok', body: 'Kamu memiliki jadwal peminjaman Ruang R.201 besok pukul 13.00–15.00. Jangan lupa siapkan proposalmu!', time: '2 hari lalu' },
  { id: 5, type: 'info', read: true, title: 'Selamat datang di CLASSINFY', body: 'Akun kamu telah berhasil terdaftar. Mulai ajukan permohonan peminjaman ruang sekarang!', time: '5 hari lalu' },
])

const filteredNotifs = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === activeTab.value)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const initials = computed(() => {
  if (!authStore.user || !authStore.user.username) return 'U';
  return authStore.user.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
})

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const markRead = (id) => { const n = notifications.value.find(n => n.id === id); if (n) n.read = true }
const markAllRead = () => notifications.value.forEach(n => n.read = true)

const iconName = (t) => ({ approved: 'check_circle', rejected: 'cancel', pending: 'hourglass_top', info: 'info' }[t] || 'notifications')
const iconBg = (t) => ({ approved: 'bg-green-100', rejected: 'bg-red-100', pending: 'bg-amber-100', info: 'bg-blue-100' }[t] || 'bg-slate-100')
const iconColor = (t) => ({ approved: 'text-green-600', rejected: 'text-red-500', pending: 'text-amber-500', info: 'text-blue-500' }[t] || 'text-slate-400')
</script>
