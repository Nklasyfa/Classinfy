<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Load auth state from localStorage on mount
if (!authStore.isAuthenticated) {
  authStore.loadFromStorage()
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/')
  }
}

function goToDashboard() {
  if (authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else {
    router.push('/dashboard')
  }
}

function goToPeminjaman() {
  if (authStore.isAuthenticated) {
    router.push('/peminjaman')
  } else {
    router.push('/auth/login')
  }
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isLoading = ref(true)
const errorMsg = ref('')
const monitoringData = ref([])
const timeSlots = ref([])
const dayName = ref('')
const dateString = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')

const statusConfig = {
  dipakai:     { bg: 'bg-green-100',  dot: 'bg-green-600',  text: 'text-green-700',  label: 'DIPAKAI' },
  terjadwal:   { bg: 'bg-slate-100',  dot: 'bg-slate-400',  text: 'text-slate-500',  label: 'TERJADWAL' },
  online:      { bg: 'bg-blue-100',   dot: 'bg-blue-600',   text: 'text-blue-700',   label: 'ONLINE' },
  ditunda:     { bg: 'bg-orange-100', dot: 'bg-orange-600', text: 'text-orange-700', label: 'DITUNDA' },
  dibatalkan:  { bg: 'bg-red-50',     dot: 'bg-red-600',    text: 'text-red-700',    label: 'DIBATALKAN' },
  pending:     { bg: 'bg-amber-50',   dot: 'bg-amber-400',  text: 'text-amber-600',  label: 'PENDING' },
  maintenance: { bg: 'bg-red-50',     dot: 'bg-red-600',    text: 'text-red-700',    label: 'MAINTENANCE' },
  kosong:      null,
}

const todayDay = new Date().getDay()
const initialDay = todayDay === 0 ? '1' : todayDay.toString()
const selectedDay = ref(initialDay) // specific day number
const dayOptions = [
  { label: 'Senin', value: '1' },
  { label: 'Selasa', value: '2' },
  { label: 'Rabu', value: '3' },
  { label: 'Kamis', value: '4' },
  { label: 'Jumat', value: '5' },
  { label: 'Sabtu', value: '6' },
]

const filteredRooms = computed(() => {
  if (!searchQuery.value) return monitoringData.value
  const q = searchQuery.value.toLowerCase()
  return monitoringData.value.filter(room =>
    room.code.toLowerCase().includes(q) ||
    room.name.toLowerCase().includes(q) ||
    room.slots.some(s => s.title && s.title.toLowerCase().includes(q))
  )
})

// Hitung tanggal terdekat untuk hari tertentu
function getNextDateForDay(dayNum) {
  const today = new Date()
  const todayDay = today.getDay()
  let diff = dayNum - todayDay
  if (diff < 0) diff += 7
  const target = new Date(today)
  target.setDate(today.getDate() + diff)
  return target.toISOString().split('T')[0]
}

function onDayFilterChange(e) {
  const val = e.target.value
  selectedDay.value = val
  if (val === '' || val === 'senin-jumat') {
    // Tetap di tanggal saat ini
    return
  }
  // Pindah ke tanggal terdekat untuk hari yang dipilih
  selectedDate.value = getNextDateForDay(parseInt(val))
  fetchMonitoring()
}

async function fetchMonitoring() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.get(`${API_URL}/api/monitoring`, {
      params: { date: selectedDate.value }
    })
    monitoringData.value = res.data.data
    timeSlots.value = res.data.timeSlots
    dayName.value = res.data.dayName
    dateString.value = res.data.date
  } catch (err) {
    errorMsg.value = 'Gagal memuat data monitoring'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function onDateChange(e) {
  selectedDate.value = e.target.value
  fetchMonitoring()
}

onMounted(() => {
  fetchMonitoring()
})
</script>

<template>
  <div class="min-h-screen bg-background bg-grid text-on-background font-body selection:bg-secondary-container selection:text-on-secondary-container">

    <!-- TopNavBar -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSINFY</span>
      </div>
      <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
        <a class="bg-primary-container text-white rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Monitoring</a>
        
        <!-- Tampil kalau sudah login -->
        <a v-if="authStore.isAuthenticated"
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="goToDashboard">Dashboard</a>

        <!-- Admin: tampilkan Fasilitas, bukan Peminjaman -->
        <a v-if="authStore.isAuthenticated && authStore.isAdmin" 
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="router.push('/admin/dashboard')">Fasilitas</a>
        <a v-else 
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="goToPeminjaman">Peminjaman</a>
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Tentang</a>
      </nav>

      <!-- Jika sudah login: tampilkan info user + logout -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ authStore.user?.role?.name || 'User' }}</p>
          <p class="text-[10px] text-slate-500 font-medium">{{ authStore.user?.username || '' }}</p>
        </div>
        <div
          @click="goToDashboard"
          class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform"
          title="Ke Dashboard"
        >
          {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
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

    <main class="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      <!-- Hero Section -->
      <section class="relative text-center mb-20">
        <h1 class="text-4xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
          Pantau Ketersediaan Ruang Kampus <span class="text-secondary">UNESA 5</span>
        </h1>
        <p class="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Informasi jadwal dan status aktual ruang kelas secara real-time — transparan &amp; mudah diakses.
        </p>
        <button
          @click="goToPeminjaman"
          class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_8px_32px_rgba(26,60,110,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span class="material-symbols-outlined">add_circle</span>
          {{ authStore.isAuthenticated ? (authStore.isAdmin ? 'Kelola Fasilitas' : 'Ajukan Peminjaman') : 'Ajukan Peminjaman' }}
        </button>
      </section>

      <!-- Status Legend -->
      <div class="bg-surface-container-lowest rounded-2xl p-6 mb-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-wrap items-center justify-center gap-4">
        <span class="text-sm font-bold text-primary mr-2">Status:</span>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-slate-400"></div> Terjadwal
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-green-600"></div> Dipakai
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-orange-600"></div> Ditunda
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-red-600"></div> Dibatalkan
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-slate-300"></div> Kosong
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-amber-400"></div> Menunggu Persetujuan
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-surface-container-lowest rounded-2xl p-4 mb-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
          <input
            v-model="searchQuery"
            class="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary-fixed-dim font-medium text-sm outline-none"
            placeholder="Cari Kode Ruang atau Mata Kuliah..."
            type="text"
          />
        </div>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">calendar_today</span>
          <input
            type="date"
            :value="selectedDate"
            @change="onDateChange"
            class="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary-fixed-dim font-medium text-sm outline-none"
          />
        </div>
        <select
          :value="selectedDay"
          @change="onDayFilterChange"
          class="bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim outline-none"
        >
          <option v-for="opt in dayOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <div v-if="dayName" class="flex items-center justify-center gap-2 py-3 px-4 bg-primary-container/10 rounded-xl">
          <span class="material-symbols-outlined text-primary text-lg">today</span>
          <span class="text-sm font-bold text-primary">{{ dayName }}, {{ dateString }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-surface-container-lowest rounded-2xl p-16 shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-col items-center justify-center gap-4">
        <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        <p class="text-on-surface-variant font-medium">Memuat data monitoring...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMsg" class="bg-error-container rounded-2xl p-16 shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-col items-center justify-center gap-4">
        <span class="material-symbols-outlined text-4xl text-on-error-container">error</span>
        <p class="text-on-error-container font-medium">{{ errorMsg }}</p>
        <button @click="fetchMonitoring" class="bg-primary text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRooms.length === 0" class="bg-surface-container-lowest rounded-2xl p-16 shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-col items-center justify-center gap-4">
        <span class="material-symbols-outlined text-4xl text-outline">meeting_room</span>
        <p class="text-on-surface-variant font-medium">
          {{ searchQuery ? 'Tidak ada ruangan yang cocok dengan pencarian.' : 'Belum ada data ruangan. Silakan tambahkan ruangan terlebih dahulu.' }}
        </p>
      </div>

      <!-- Monitoring Grid Table -->
      <div v-else class="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden">
        <div class="overflow-x-auto scrollbar-hide">
          <table class="w-full min-w-[1000px]">
            <thead>
              <tr class="bg-surface-container-low">
                <th class="p-6 text-left text-primary font-extrabold text-sm uppercase tracking-wider sticky left-0 bg-surface-container-low z-10 w-40">
                  Kode Ruang
                </th>
                <th v-for="slot in timeSlots" :key="slot" class="p-6 text-center text-primary font-bold text-xs">
                  {{ slot }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.code" class="hover:bg-surface-container-low/30 transition-colors">
                <td class="p-6 font-extrabold text-primary sticky left-0 bg-white z-10 shadow-[4px_0_8px_rgba(0,0,0,0.02)]">
                  <div>{{ room.code }}</div>
                  <div class="text-[10px] font-medium text-on-surface-variant">{{ room.name }}</div>
                </td>
                <td v-for="(slot, idx) in room.slots" :key="idx" class="p-2">
                  <!-- Kosong -->
                  <div v-if="slot.status === 'kosong'" class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-3 h-24 flex items-center justify-center">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Kosong</span>
                  </div>
                  <!-- Status lain -->
                  <div v-else-if="statusConfig[slot.status]" :class="[statusConfig[slot.status].bg, 'rounded-xl p-3 h-24 flex flex-col justify-between']">
                    <div class="flex items-center justify-between">
                      <div :class="['w-2 h-2 rounded-full', statusConfig[slot.status].dot]"></div>
                      <span :class="['text-[10px] font-bold', statusConfig[slot.status].text]">{{ statusConfig[slot.status].label }}</span>
                    </div>
                    <div class="text-[11px] font-extrabold text-primary leading-tight line-clamp-2">{{ slot.title }}</div>
                    <div class="text-[10px] text-on-surface-variant font-medium truncate">{{ slot.person }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- Floating CTA -->
    <button
      @click="goToPeminjaman"
      class="fixed bottom-8 right-8 z-40 bg-primary-container text-white p-4 rounded-full shadow-[0_8px_32px_rgba(26,60,110,0.3)] hover:scale-110 active:scale-95 transition-all group overflow-hidden flex items-center gap-0 hover:gap-3 px-4 cursor-pointer"
    >
      <span class="material-symbols-outlined text-2xl">{{ authStore.isAuthenticated ? 'dashboard' : 'add' }}</span>
      <span class="max-w-0 group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap overflow-hidden">{{ authStore.isAuthenticated ? (authStore.isAdmin ? 'Kelola Fasilitas' : 'Ajukan Peminjaman') : 'Ajukan Peminjaman' }}</span>
    </button>

    <!-- Footer -->
    <footer class="w-full py-12 flex flex-col items-center justify-center gap-4 bg-transparent">
      <div class="text-sm text-primary-container opacity-60">
        © 2026 <span class="font-bold">CLASSINFY</span> — Universitas Negeri Surabaya
      </div>
      <div class="flex gap-6 text-slate-500 text-xs font-medium">
        <a class="hover:text-secondary transition-colors cursor-pointer">Monitoring</a>
        <a v-if="authStore.isAuthenticated" class="hover:text-secondary transition-colors cursor-pointer" @click="goToDashboard">Dashboard</a>
        <a v-if="authStore.isAuthenticated && authStore.isAdmin" class="hover:text-secondary transition-colors cursor-pointer" @click="router.push('/admin/dashboard')">Fasilitas</a>
        <a v-else class="hover:text-secondary transition-colors cursor-pointer" @click="goToPeminjaman">Peminjaman</a>
        <a class="hover:text-secondary transition-colors cursor-pointer">Tentang</a>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
