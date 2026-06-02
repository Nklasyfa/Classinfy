<template>
  <div class="min-h-screen font-body relative overflow-x-hidden bg-[#F0F4F8] text-[#0b1c30]">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <UserNavbar />

    <!-- Main Content -->
    <main class="relative z-10 pt-28 pb-20 px-6 max-w-5xl mx-auto space-y-6">

      <!-- Welcome Card -->
      <section>
        <div class="bg-white rounded-2xl px-8 py-5 flex items-center justify-between gap-6 shadow-[0_8px_32px_rgba(26,60,110,0.04)] border border-slate-100">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 rounded-full bg-[#1a3c6e] flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0">
              {{ initials }}
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-[#1A3C6E] tracking-tight">Selamat datang, {{ authStore.user?.username || 'Budi Santoso' }} 👋</h1>
              <p class="text-slate-400 font-medium text-xs mt-0.5">Role: {{ authStore.user?.role?.name || 'Penanggung Jawab Mata Kuliah' }}</p>
            </div>
          </div>
          <div class="bg-slate-100 text-[#1A3C6E] px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0">
            {{ currentDate }}
          </div>
        </div>
      </section>

      <!-- Summary Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1 -->
        <div class="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(26,60,110,0.04)] border border-slate-100 group hover:shadow-md transition-all">
          <div class="flex justify-between items-start mb-3">
            <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-[#1A3C6E] text-xl">calendar_month</span>
            </div>

          </div>
          <p class="text-slate-400 font-medium text-xs mb-1">Jadwal Hari Ini</p>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-[#1A3C6E]">{{ todaySchedulesCount }}</span>
            <span class="text-[#1A3C6E]/50 font-semibold text-xs">mata kuliah</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(26,60,110,0.04)] border border-slate-100 group hover:shadow-md transition-all">
          <div class="flex justify-between items-start mb-3">
            <div class="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-green-600 text-xl">check_circle</span>
            </div>

          </div>
          <p class="text-slate-400 font-medium text-xs mb-1">Sudah Dipakai</p>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-green-600">{{ activeSchedulesCount }}</span>
            <span class="text-green-600/50 font-semibold text-xs">hari ini</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(26,60,110,0.04)] border-2 border-orange-100 group hover:shadow-md transition-all relative overflow-hidden">
          <div class="absolute top-0 right-0 w-12 h-12 bg-orange-50/50 rounded-bl-full"></div>
          <div class="flex justify-between items-start mb-3 relative z-10">
            <div class="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-orange-500 text-xl">warning</span>
            </div>

          </div>
          <p class="text-slate-400 font-medium text-xs mb-1">Perlu Update</p>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-orange-500">{{ pendingUpdatesCount }}</span>
            <span class="text-orange-500/50 font-semibold text-xs">status pending</span>
          </div>
        </div>
      </section>

      <!-- Main Table -->
      <section class="bg-white rounded-2xl shadow-[0_8px_32px_rgba(26,60,110,0.04)] border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#1A3C6E] text-xl">calendar_today</span>
            <h2 class="text-base font-extrabold text-[#1A3C6E] tracking-tight">{{ authStore.user?.role?.id === 2 ? 'Jadwal Kelas Saya' : 'Jadwal Tanggung Jawab Saya' }}</h2>
          </div>
          <div class="flex bg-slate-100 p-1 rounded-full w-fit gap-1">
            <button @click="filterType = 'today'" :class="filterType === 'today' ? 'bg-[#1A3C6E] text-white shadow' : 'text-slate-500 hover:text-[#1A3C6E]'" class="px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer">Hari Ini ●</button>
            <button @click="filterType = 'week'" :class="filterType === 'week' ? 'bg-[#1A3C6E] text-white shadow' : 'text-slate-500 hover:text-[#1A3C6E]'" class="px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer">Minggu Ini</button>
            <button @click="filterType = 'all'" :class="filterType === 'all' ? 'bg-[#1A3C6E] text-white shadow' : 'text-slate-500 hover:text-[#1A3C6E]'" class="px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer">Semua</button>
          </div>
        </div>

        <div class="overflow-x-auto min-h-[280px] pb-8">
          <div v-if="isLoading" class="p-12 text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl animate-spin block mb-2">sync</span>
            <p class="text-sm font-medium">Memuat jadwal...</p>
          </div>
          <table v-else class="w-full text-left min-w-[640px]">
            <thead>
              <tr class="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] bg-slate-50/70 border-b border-slate-100">
                <th class="px-6 py-3">HARI & JAM</th>
                <th class="px-6 py-3">RUANG</th>
                <th class="px-6 py-3">MATA KULIAH</th>
                <th class="px-6 py-3">KELAS</th>
                <th class="px-6 py-3">STATUS</th>
                <th v-if="authStore.user?.role?.id !== 2" class="px-6 py-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-slate-50">
              <tr v-if="filteredSchedules.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada jadwal ditemukan.</td>
              </tr>
              <tr
                v-else
                v-for="s in filteredSchedules"
                :key="s.id"
                :class="openDropdownId === s.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'"
                class="transition-colors relative"
              >
                <td class="px-6 py-4 font-bold text-[#1A3C6E] text-xs whitespace-nowrap">{{ s.dayName || '-' }}, {{ s.startTime?.slice(0,5) }}–{{ s.endTime?.slice(0,5) }}</td>
                <td class="px-6 py-4 font-bold text-[#1A3C6E] text-xs">{{ s.room?.code || s.room?.name || '-' }}</td>
                <td class="px-6 py-4 font-bold text-[#1A3C6E] text-xs">{{ formatActivity(s.activity).matkul }}</td>
                <td class="px-6 py-4 text-slate-500 font-semibold text-xs">{{ formatActivity(s.activity).kelas }}</td>
                <td class="px-6 py-4">
                  <span :class="statusConfig[s.status]?.pillClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span :class="statusConfig[s.status]?.dotClass" class="w-1.5 h-1.5 rounded-full"></span>
                    {{ statusConfig[s.status]?.label || s.status }}
                  </span>
                </td>
                <td v-if="authStore.user?.role?.id !== 2" class="px-6 py-4 text-right relative">
                  <template v-if="s.canEdit">
                    <button
                      @click="toggleDropdown(s.id)"
                      :class="openDropdownId === s.id ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-[#1A3C6E] hover:bg-slate-200'"
                      class="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                    >
                      Ubah Status
                      <span class="material-symbols-outlined text-xs">{{ openDropdownId === s.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
                    </button>
                    <div v-if="openDropdownId === s.id" class="absolute right-6 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40">
                      <button @click="updateStatus(s.id, 'aktif')" class="w-full text-left px-3 py-2 hover:bg-green-50 text-green-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> ✅ Dipakai
                      </button>
                      <button @click="updateStatus(s.id, 'online')" class="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> 🔵 Online
                      </button>
                      <button @click="updateStatus(s.id, 'ditunda')" class="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <span class="w-2 h-2 rounded-full bg-orange-400"></span> 🟡 Ditunda
                      </button>
                      <button @click="updateStatus(s.id, 'batal')" class="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <span class="w-2 h-2 rounded-full bg-red-500"></span> 🔴 Dibatalkan
                      </button>
                    </div>
                  </template>
                  <span v-else class="text-[10px] text-slate-300 font-medium italic block mr-2">Hanya PJ terkait</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <span class="text-xs font-medium text-slate-500">Menampilkan halaman {{ page }} dari {{ totalPages }} (Total {{ totalItems }} jadwal)</span>
          <div class="flex gap-2">
            <button @click="prevPage" :disabled="page <= 1" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer">Sebelumnya</button>
            <button @click="nextPage" :disabled="page >= totalPages" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer">Selanjutnya</button>
          </div>
        </div>
      </section>

      <!-- History Card -->
      <section class="bg-white rounded-2xl shadow-[0_8px_32_rgba(26,60,110,0.04)] border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#1A3C6E] text-xl">history</span>
            <h2 class="text-base font-extrabold text-[#1A3C6E] tracking-tight">Riwayat Perubahan Status</h2>
          </div>

        </div>
        <div class="overflow-x-auto px-6 pb-4">
          <table class="w-full text-left min-w-[560px]">
            <thead>
              <tr class="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">
                <th class="py-4">TANGGAL</th>
                <th class="py-4">RUANG</th>
                <th class="py-4">MATA KULIAH</th>
                <th class="py-4">PERUBAHAN</th>
                <th class="py-4 text-right">JAM UPDATE</th>
              </tr>
            </thead>
            <tbody class="text-xs">
              <tr v-if="scheduleLogs.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400 font-medium">Belum ada riwayat perubahan.</td>
              </tr>
              <tr v-else v-for="log in scheduleLogs.slice(0, 5)" :key="log.id" class="border-t border-slate-50">
                <td class="py-4 text-slate-500 font-semibold">{{ formatDate(log.changedAt) }}</td>
                <td class="py-4 font-bold text-[#1A3C6E]">{{ log.roomName }}</td>
                <td class="py-4 font-bold text-[#1A3C6E]">{{ log.activity }}</td>
                <td class="py-4 flex items-center gap-2">
                  <span :class="statusConfig[log.oldStatus]?.pillClass" class="px-2 py-0.5 rounded-md font-bold text-[10px]">{{ statusConfig[log.oldStatus]?.label }}</span>
                  <span class="material-symbols-outlined text-slate-300 text-sm">trending_flat</span>
                  <span :class="statusConfig[log.newStatus]?.pillClass" class="px-2 py-0.5 rounded-md font-bold text-[10px]">{{ statusConfig[log.newStatus]?.label }}</span>
                </td>
                <td class="py-4 text-right font-bold text-[#1A3C6E]/60">{{ formatTime(log.changedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-6 px-8 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
      <p class="text-[#1A3C6E]/40 text-xs font-medium">© 2026 CLASSINFY UNESA. Digital Quad System.</p>
      <div class="flex items-center gap-6">
        <a class="text-[#1A3C6E]/40 hover:text-[#1A3C6E]/80 text-xs font-medium transition-colors cursor-pointer">Panduan PJ</a>
        <a class="text-[#1A3C6E]/40 hover:text-[#1A3C6E]/80 text-xs font-medium transition-colors cursor-pointer">Bantuan</a>
        <a class="text-[#1A3C6E]/40 hover:text-[#1A3C6E]/80 text-xs font-medium transition-colors cursor-pointer">Kebijakan Privasi</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import UserNavbar from '../../components/layout/UserNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const user = computed(() => authStore.user)
const schedules = ref([])
const scheduleLogs = ref([])
const isLoading = ref(true)
const openDropdownId = ref(null)
const filterType = ref('all')
const unreadCount = ref(0)

const page = ref(1)
const size = ref(10)
const totalPages = ref(1)
const totalItems = ref(0)

const statusConfig = {
  aktif: { pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', label: 'Dipakai' },
  online: { pillClass: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-500', label: 'Online' },
  ditunda: { pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-400', label: 'Ditunda' },
  batal: { pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-500', label: 'Dibatalkan' },
  terjadwal: { pillClass: 'bg-slate-100 text-slate-500', dotClass: 'bg-slate-400', label: 'Terjadwal' }
}

const initials = computed(() => {
  if (!user.value?.username) return 'BS'
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const currentDate = computed(() =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
)

const formatActivity = (activity) => {
  if (!activity) return { matkul: '-', kelas: '-' };
  const parts = activity.split('—').map(p => p.trim());
  if (parts.length >= 3) {
    const kelas = parts[parts.length - 1];
    const matkul = parts.slice(0, parts.length - 1).join(' — ');
    return { matkul, kelas };
  } else {
    const match = activity.match(/(.*?)\s+-\s+(\d{4}[A-Z]|\d{2}[A-Z])$/) || activity.match(/(.*?)\s+(\d{4}[A-Z]|\d{2}[A-Z])(\s*\(.*\))?$/);
    if (match) {
      return { matkul: match[1].trim(), kelas: match[2].trim() + (match[3] || '') };
    }
  }
  return { matkul: activity, kelas: '-' };
};

const currentDayNum = new Date().getDay()

const filteredSchedules = computed(() => {
  let result = schedules.value;
  if (filterType.value === 'today') {
    result = schedules.value.filter(s => s.dayOfWeek === currentDayNum);
  }
  
  // Sort by Kelas in ascending order (e.g. 2024A, 2024B, 2025A)
  return result.slice().sort((a, b) => {
    const classA = formatActivity(a.activity).kelas || '';
    const classB = formatActivity(b.activity).kelas || '';
    return classA.localeCompare(classB);
  });
})

const todaySchedulesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum).length)
const activeSchedulesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum && s.status === 'aktif').length)
const pendingUpdatesCount = computed(() => schedules.value.filter(s => s.dayOfWeek === currentDayNum && (!s.status || s.status === 'ditunda')).length)

const fetchMySchedules = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/api/schedules/me`, { 
      headers: authStore.getAuthHeaders(),
      params: { page: page.value, size: size.value }
    })
    schedules.value = res.data.data || []
    totalPages.value = res.data.totalPages || 1
    totalItems.value = res.data.totalItems || 0

    let allLogs = []
    for (const s of schedules.value) {
      try {
        const logRes = await axios.get(`${API_URL}/api/schedules/${s.id}/logs`, { headers: authStore.getAuthHeaders() })
        const logs = logRes.data.data.map(l => ({ ...l, roomName: s.room?.name, activity: s.activity }))
        allLogs = [...allLogs, ...logs]
      } catch (e) {}
    }
    scheduleLogs.value = allLogs.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
  } catch (err) {
    console.error('Failed fetching schedules', err)
  } finally {
    isLoading.value = false
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchMySchedules()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchMySchedules()
  }
}

const toggleDropdown = (id) => {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

const updateStatus = async (id, status) => {
  try {
    await axios.patch(`${API_URL}/api/schedules/${id}/status`, { status }, { headers: authStore.getAuthHeaders() })
    openDropdownId.value = null
    await fetchMySchedules()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengubah status')
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const formatDate = (d) => d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d)) : '-'
const formatTime = (d) => d ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '-'

onMounted(() => fetchMySchedules())
</script>
