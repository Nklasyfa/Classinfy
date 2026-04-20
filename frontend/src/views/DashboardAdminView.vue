<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const userContext = localStorage.getItem('user');
const user = ref(userContext ? JSON.parse(userContext) : null);

const isLoading = ref(true)
const errorMsg = ref('')
const monitoringData = ref([])
const timeSlots = ref([])
const dayName = ref('')
const dateString = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const statusFilter = ref('Semua')

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

const filteredRooms = computed(() => {
  let result = monitoringData.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(room =>
      room.code.toLowerCase().includes(q) ||
      room.name.toLowerCase().includes(q) ||
      room.slots.some(s => s.title && s.title.toLowerCase().includes(q))
    )
  }

  if (statusFilter.value !== 'Semua') {
     const filterTarget = statusFilter.value.toLowerCase()
     result = result.filter(room => {
       if (filterTarget === 'kosong') return room.slots.some(s => s.status === 'kosong')
       if (filterTarget === 'dipakai') return room.slots.some(s => s.status === 'dipakai' || s.status === 'terjadwal')
       return true
     })
  }

  return result
})

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

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  }
}

onMounted(() => {
  if (!user.value || user.value.role?.id !== 1) {
     // Optional: restrict access
     // router.push('/auth/login');
  }
  fetchMonitoring()
})
</script>

<template>
  <div class="min-h-screen bg-background bg-grid text-on-background font-body selection:bg-secondary-container selection:text-on-secondary-container relative overflow-x-hidden">

    <!-- TopNavBar -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-2xl">domain</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSIFY</span>
        <span class="ml-2 text-xs font-bold text-white bg-error px-2 py-0.5 rounded-full uppercase tracking-widest hidden md:inline-block">Admin</span>
      </div>
      <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
        <a class="bg-primary-container text-white rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Monitoring</a>
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Peminjaman</a>
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Manajemen</a>
      </nav>
      <button
        @click="handleLogout"
        class="bg-transparent border border-error text-error px-6 py-2 rounded-full font-bold hover:bg-error hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">logout</span>
        Logout
      </button>
    </header>

    <main class="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">

      <!-- Hero Section -->
      <section class="relative text-center mb-20">
        <h1 class="text-4xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
          Admin Dashboard Monitoring <br/><span class="text-secondary text-3xl md:text-5xl">UNESA 5</span>
        </h1>
        <p class="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Kelola dan pantau seluruh jadwal, status, dan permohonan peminjaman ruangan dengan cepat.
        </p>
        <button
          class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_8px_32px_rgba(26,60,110,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span class="material-symbols-outlined">manage_search</span>
          Kelola Peminjaman
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
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-label">
          <div class="w-2 h-2 rounded-full bg-blue-600"></div> Online
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
        <div class="md:col-span-2 relative">
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
        <select v-model="statusFilter" class="bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim outline-none">
          <option>Semua</option>
          <option>Kosong</option>
          <option>Dipakai</option>
        </select>
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
          {{ searchQuery ? 'Tidak ada ruangan yang cocok dengan pencarian.' : 'Belum ada data ruangan dari database.' }}
        </p>
        <button v-if="!searchQuery" class="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
           <span class="material-symbols-outlined text-sm">add</span> Tambah Ruang Baru
        </button>
      </div>

      <!-- Monitoring Grid Table -->
      <div v-else class="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden">
        <div class="overflow-x-auto scrollbar-hide">
          <table class="w-full min-w-[1000px]">
            <thead>
              <tr class="bg-surface-container-low">
                <th class="p-6 text-left text-primary font-extrabold text-sm uppercase tracking-wider sticky left-0 bg-surface-container-low z-10 w-40 border-r border-slate-200">
                  <div class="text-xs text-primary/60 font-bold mb-1">{{ dayName }}, {{ dateString }}</div>
                  Kode Ruang
                </th>
                <th v-for="slot in timeSlots" :key="slot" class="p-6 text-center text-primary font-bold text-xs">
                  {{ slot }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.code" class="hover:bg-surface-container-low/30 transition-colors border-t border-slate-100">
                <td class="p-6 font-extrabold text-primary sticky left-0 bg-white z-10 shadow-[4px_0_8px_rgba(0,0,0,0.02)] border-r border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary/40">meeting_room</span>
                    <div>
                      <div>{{ room.code }}</div>
                      <div class="text-[10px] font-medium text-on-surface-variant line-clamp-1">{{ room.name }}</div>
                    </div>
                  </div>
                </td>
                <td v-for="(slot, idx) in room.slots" :key="idx" class="p-2">
                  <!-- Kosong -->
                  <div v-if="slot.status === 'kosong'" class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-3 h-24 flex items-center justify-center group hover:border-primary/40 transition-colors cursor-pointer" title="Tambah Jadwal">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors flex flex-col items-center gap-1">
                      <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                      Kosong
                    </span>
                  </div>
                  <!-- Status lain -->
                  <div v-else-if="statusConfig[slot.status]" :class="[statusConfig[slot.status].bg, 'rounded-xl p-3 h-24 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow relative']" title="Klik untuk kelola">
                    <div class="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-xl"></div>
                    <div class="flex items-center justify-between">
                      <div :class="['w-2 h-2 rounded-full', statusConfig[slot.status].dot]"></div>
                      <span :class="['text-[10px] font-bold', statusConfig[slot.status].text]">{{ statusConfig[slot.status].label }}</span>
                    </div>
                    <div class="text-[11px] font-extrabold text-primary leading-tight line-clamp-2">{{ slot.title }}</div>
                    <div class="text-[10px] text-on-surface-variant font-medium truncate flex items-center gap-1">
                        <span class="material-symbols-outlined text-[10px]">person</span> {{ slot.person }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- Footer -->
    <footer class="w-full py-12 flex flex-col items-center justify-center gap-4 bg-transparent relative z-10">
      <div class="text-sm text-primary-container opacity-60">
        © 2026 <span class="font-bold">CLASSIFY</span> — Admin Panel. Universitas Negeri Surabaya
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
