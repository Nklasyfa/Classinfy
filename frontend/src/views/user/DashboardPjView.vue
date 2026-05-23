<template>
  <div class="bg-[#F0F4F8] font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Background Layering -->
    <div class="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0"></div>

    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-6 pointer-events-none">
      <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(26,60,110,0.06)] h-[60px] max-w-[900px] w-full flex items-center justify-between px-6 pointer-events-auto">
        <router-link to="/" class="flex items-center gap-2 cursor-pointer group">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white text-xs font-extrabold tracking-tighter">C</span>
          </div>
          <span class="font-extrabold text-primary tracking-tighter text-xl group-hover:text-secondary transition-colors">CLASSINFY</span>
        </router-link>

        <div class="hidden md:flex items-center gap-2">
          <router-link to="/dashboard" class="bg-[#1A3C6E] text-white rounded-full px-6 py-2 font-medium text-sm tracking-tight transition-all duration-300 scale-105">Dashboard</router-link>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Jadwal Saya</a>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Riwayat</a>
        </div>

        <div class="flex items-center gap-4">
          <button class="relative p-2 text-primary/70 hover:scale-110 transition-transform cursor-pointer">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          <div class="flex items-center gap-2 pl-2 group relative cursor-pointer" @click="handleLogout">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm editorial-shadow group-hover:scale-105 transition-transform">
              {{ initials }}
            </div>
            <div class="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg py-1 px-3 text-xs font-bold text-error opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Keluar
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content Canvas -->
    <main class="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <!-- Greeting Section -->
      <section class="flex flex-col items-center text-center space-y-6">
        <div class="bg-surface-container-lowest editorial-shadow rounded-full px-8 py-4 flex items-center gap-6 max-w-2xl">
          <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold editorial-shadow">
            {{ initials }}
          </div>
          <div class="text-left">
            <h1 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Selamat datang, {{ user?.username || 'Budi Santoso' }} 👋</h1>
            <p class="text-on-surface-variant font-medium text-sm">Role: {{ user?.role?.name || 'Penanggung Jawab Mata Kuliah' }}</p>
          </div>
          <div class="ml-4 bg-surface-container-high text-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
            {{ currentDate }}
          </div>
        </div>
      </section>

      <!-- Summary Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-primary/5 rounded-lg">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
            </div>
            <a class="text-primary font-bold text-sm group-hover:underline" href="#">Lihat →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Jadwal Hari Ini</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-primary">{{ todaySchedulesCount }}</span>
            <span class="text-primary/60 font-semibold text-sm">mata kuliah</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-green-50 rounded-lg">
              <span class="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <a class="text-primary font-bold text-sm group-hover:underline" href="#">Lihat →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Sudah Dipakai</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-green-600">{{ activeSchedulesCount }}</span>
            <span class="text-green-600/60 font-semibold text-sm">hari ini</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 border-2 border-orange-200 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-bl-full -mr-4 -mt-4"></div>
          <div class="flex justify-between items-start mb-4 relative z-10">
            <div class="p-2 bg-orange-50 rounded-lg">
              <span class="material-symbols-outlined text-orange-600">warning</span>
            </div>
            <a class="text-orange-600 font-bold text-sm group-hover:underline" href="#">Update →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Perlu Update</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-orange-600">{{ pendingUpdatesCount }}</span>
            <span class="text-orange-600/60 font-semibold text-sm">status pending</span>
          </div>
        </div>
      </section>

      <!-- Main Table Card -->
      <section class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-visible">
        <div class="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">calendar_today</span>
            <h2 class="text-xl font-extrabold text-primary tracking-tight">Jadwal Tanggung Jawab Saya</h2>
          </div>
          <div class="flex bg-surface-container-low p-1 rounded-full w-fit">
            <button @click="filterType = 'today'" :class="filterType === 'today' ? 'bg-primary text-white rounded-full' : 'text-on-surface-variant hover:text-primary'" class="px-6 py-2 text-xs font-bold transition-colors cursor-pointer">Hari Ini ●</button>
            <button @click="filterType = 'all'" :class="filterType === 'all' ? 'bg-primary text-white rounded-full' : 'text-on-surface-variant hover:text-primary'" class="px-6 py-2 text-xs font-bold transition-colors cursor-pointer">Semua</button>
          </div>
        </div>

        <div class="overflow-x-auto pb-8">
          <div v-if="isLoading" class="p-12 text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl animate-spin">sync</span>
          </div>
          <table v-else class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="text-on-surface-variant/60 font-bold text-xs uppercase tracking-widest bg-surface-container-low/50">
                <th class="px-8 py-4">Hari & Jam</th>
                <th class="px-6 py-4">Ruang</th>
                <th class="px-6 py-4">Mata Kuliah</th>
                <th class="px-6 py-4">Kelas</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-if="filteredSchedules.length === 0">
                <td colspan="6" class="px-8 py-12 text-center text-slate-400">Tidak ada jadwal ditemukan.</td>
              </tr>
              <tr v-else v-for="s in filteredSchedules" :key="s.id" :class="['transition-colors', openDropdownId === s.id ? 'bg-primary/5 relative' : 'hover:bg-surface-container-low/30']">
                <td class="px-8 py-5 font-bold text-primary">{{ s.dayName }}, {{ s.startTime.slice(0,5) }}-{{ s.endTime.slice(0,5) }}</td>
                <td class="px-6 py-5 font-semibold text-on-surface-variant">{{ s.room?.name || 'Unknown' }}</td>
                <td class="px-6 py-5 font-bold text-primary">{{ s.activity }}</td>
                <td class="px-6 py-5 font-bold text-on-surface-variant">{{ user?.kelas || '-' }}</td>
                <td class="px-6 py-5">
                  <span :class="statusConfig[s.status]?.pillClass" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px]">
                    <span :class="statusConfig[s.status]?.dotClass" class="w-1.5 h-1.5 rounded-full"></span>
                    {{ statusConfig[s.status]?.label }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right relative">
                  <button @click="toggleDropdown(s.id)" :class="openDropdownId === s.id ? 'bg-primary text-white' : 'bg-surface-container-high hover:bg-surface-container-highest text-primary'" class="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto transition-colors cursor-pointer">
                    Ubah Status <span class="material-symbols-outlined text-xs">{{ openDropdownId === s.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
                  </button>
                  
                  <!-- Dropdown Overlay -->
                  <div v-if="openDropdownId === s.id" class="absolute right-6 top-full mt-2 w-48 bg-white editorial-shadow rounded-xl p-2 z-40 border border-primary/5">
                    <button @click="updateStatus(s.id, 'aktif')" class="w-full text-left px-4 py-2 hover:bg-green-50 text-green-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                      <span class="w-2 h-2 rounded-full bg-green-500"></span> ✅ Dipakai
                    </button>
                    <button @click="updateStatus(s.id, 'online')" class="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                      <span class="w-2 h-2 rounded-full bg-blue-500"></span> 🔵 Online
                    </button>
                    <button @click="updateStatus(s.id, 'ditunda')" class="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                      <span class="w-2 h-2 rounded-full bg-orange-500"></span> 🟡 Ditunda
                    </button>
                    <button @click="updateStatus(s.id, 'batal')" class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                      <span class="w-2 h-2 rounded-full bg-red-500"></span> 🔴 Dibatalkan
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- History Card -->
      <section class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
        <div class="p-6 md:p-8 flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl text-primary">history</span>
          <h2 class="text-xl font-extrabold text-primary tracking-tight">Riwayat Perubahan Status</h2>
        </div>
        <div class="overflow-x-auto px-8 pb-4">
          <table class="w-full text-left">
            <thead>
              <tr class="text-on-surface-variant/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                <th class="py-4">Tanggal</th>
                <th class="py-4">Ruang</th>
                <th class="py-4">Mata Kuliah</th>
                <th class="py-4">Perubahan</th>
                <th class="py-4 text-right">Jam Update</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-if="scheduleLogs.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400">Belum ada riwayat perubahan.</td>
              </tr>
              <tr v-else v-for="log in scheduleLogs" :key="log.id" class="border-t border-primary/5">
                <td class="py-5 font-semibold text-on-surface-variant">{{ formatDate(log.changedAt) }}</td>
                <td class="py-5 font-bold text-primary">{{ log.roomName }}</td>
                <td class="py-5 font-bold text-primary">{{ log.activity }}</td>
                <td class="py-5 flex items-center gap-3">
                  <span :class="statusConfig[log.oldStatus]?.pillClass" class="px-3 py-1 rounded-md font-bold text-[10px]">{{ statusConfig[log.oldStatus]?.label }}</span>
                  <span class="material-symbols-outlined text-primary/40 text-sm">trending_flat</span>
                  <span :class="statusConfig[log.newStatus]?.pillClass" class="px-3 py-1 rounded-md font-bold text-[10px]">{{ statusConfig[log.newStatus]?.label }}</span>
                </td>
                <td class="py-5 text-right font-bold text-primary/60">{{ formatTime(log.changedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full py-8 mt-auto px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40">© 2026 CLASSINFY UNESA. Digital Quad System.</p>
      <div class="flex items-center gap-8">
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100 cursor-pointer">Panduan PJ</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100 cursor-pointer">Bantuan</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100 cursor-pointer">Kebijakan Privasi</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const user = computed(() => authStore.user)
const schedules = ref([])
const scheduleLogs = ref([])
const isLoading = ref(true)
const openDropdownId = ref(null)
const filterType = ref('all') // 'today' or 'all'

const statusConfig = {
  aktif: { pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', label: 'Dipakai' },
  online: { pillClass: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-500', label: 'Online' },
  ditunda: { pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-500', label: 'Ditunda' },
  batal: { pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-500', label: 'Dibatalkan' },
  terjadwal: { pillClass: 'bg-slate-100 text-slate-500', dotClass: 'bg-slate-400', label: 'Terjadwal' }
}

const initials = computed(() => {
  if (!user.value || !user.value.username) return 'BS';
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
})

const currentDayNum = new Date().getDay()

const filteredSchedules = computed(() => {
  if (filterType.value === 'today') {
    return schedules.value.filter(s => s.dayOfWeek === currentDayNum)
  }
  return schedules.value
})

const todaySchedulesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum).length)
const activeSchedulesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum && s.status === 'aktif').length)
const pendingUpdatesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum && (s.status === 'aktif' /* or terjadwal but default is aktif in DB */)).length)

const fetchMySchedules = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/api/schedules/me`, { headers: authStore.getAuthHeaders() })
    schedules.value = res.data.data || []
    
    // Fetch logs for these schedules
    let allLogs = []
    for (const s of schedules.value) {
      try {
        const logRes = await axios.get(`${API_URL}/api/schedules/${s.id}/logs`, { headers: authStore.getAuthHeaders() })
        const logs = logRes.data.data.map(l => ({...l, roomName: s.room?.name, activity: s.activity}))
        allLogs = [...allLogs, ...logs]
      } catch(e) {}
    }
    // Sort logs by date desc
    scheduleLogs.value = allLogs.sort((a,b) => new Date(b.changedAt) - new Date(a.changedAt))
    
  } catch (err) {
    console.error('Failed fetching schedules', err)
  } finally {
    isLoading.value = false
  }
}

const toggleDropdown = (id) => {
  if (openDropdownId.value === id) openDropdownId.value = null
  else openDropdownId.value = id
}

const updateStatus = async (id, status) => {
  try {
    await axios.patch(`${API_URL}/api/schedules/${id}/status`, { status }, { headers: authStore.getAuthHeaders() })
    openDropdownId.value = null
    await fetchMySchedules()
  } catch(err) {
    alert(err.response?.data?.message || 'Gagal mengubah status')
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString))
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateString))
}

onMounted(() => {
  fetchMySchedules()
})
</script>

<style scoped>
.grid-bg {
    background-color: #F0F4F8;
    background-image: 
        linear-gradient(#C8D5E8 0.5px, transparent 0.5px),
        linear-gradient(90deg, #C8D5E8 0.5px, transparent 0.5px);
    background-size: 24px 24px;
}
.editorial-shadow {
    box-shadow: 0 8px 32px rgba(26, 60, 110, 0.06);
}
</style>
