<template>
  <div class="bg-[#F0F4F8] grid-texture font-body text-on-surface min-h-screen pb-20">
    <!-- TopNavBar -->
    <nav class="fixed top-4 left-1/2 -translate-x-1/2 w-[900px] max-w-[95%] rounded-full flex items-center justify-between px-6 py-2 z-50 shadow-[0_8px_32px_rgba(26,60,110,0.06)] bg-white/80 backdrop-blur-[20px]">
      <div class="flex items-center gap-8">
        <router-link to="/" class="flex items-center gap-2 text-2xl font-extrabold text-blue-900 tracking-tight cursor-pointer hover:text-blue-700 transition-colors"><span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>CLASSINFY</router-link>
        <div class="hidden md:flex items-center gap-1">
          <router-link to="/" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Monitoring</router-link>
          <router-link to="/admin/dashboard" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Dashboard</router-link>
          <router-link to="/admin/fasilitas" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Fasilitas</router-link>
          <router-link to="/admin/permohonan" class="bg-blue-900 text-white rounded-full px-4 py-1.5 transition-all text-sm font-medium cursor-pointer shadow-sm">Permohonan</router-link>
          <router-link to="/admin/users" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Users</router-link>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
          <div class="text-right hidden sm:block">
            <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ authStore.user?.role?.name || 'Administrator' }}</p>
            <p class="text-[10px] text-slate-500 font-medium">{{ authStore.user?.username || 'Admin' }}</p>
          </div>
          <div
            @click="handleLogout"
            class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Klik untuk Logout"
          >
            {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 pt-32 space-y-10">
      <section class="bg-surface-container-lowest p-8 rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-2">Daftar Permohonan Peminjaman</h1>
          <p class="text-on-surface-variant font-medium">Kelola dan proses semua permohonan masuk secara tersistem</p>
        </div>
        <div class="flex flex-wrap gap-3 z-10">
          <div class="bg-error-container text-on-error-container px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm">
            <span class="material-symbols-outlined text-lg">report</span>
            Conflict ({{ conflictCount }})
          </div>
          <div class="bg-surface-container-high text-primary px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm">
            <span class="material-symbols-outlined text-lg">pending</span>
            Pending ({{ pendingCount }})
          </div>
        </div>
        <div class="absolute -right-8 -bottom-8 opacity-10">
          <span class="material-symbols-outlined text-[160px]">inventory</span>
        </div>
      </section>

      <section class="bg-surface-container-lowest p-6 rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-1 relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input v-model="searchQuery" class="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none text-sm" placeholder="Cari nama pemohon atau gedung..." type="text"/>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 pt-2">
          <button @click="activeTab = 'Semua'" :class="tabClass('Semua')">Semua</button>
          <button @click="activeTab = 'Pending'" :class="tabClass('Pending')" class="flex items-center gap-2">
            Perlu Review <span v-if="pendingCount > 0" class="bg-white px-2 rounded-full text-xs text-primary">{{ pendingCount }}</span>
          </button>
          <button @click="activeTab = 'Konflik'" :class="tabClass('Konflik')" class="flex items-center gap-2">
            Konflik <span v-if="conflictCount > 0" class="bg-error text-white px-2 rounded-full text-xs">{{ conflictCount }}</span>
          </button>
          <button @click="activeTab = 'Approved'" :class="tabClass('Approved')">Approved</button>
          <button @click="activeTab = 'Rejected'" :class="tabClass('Rejected')">Rejected</button>
        </div>
      </section>

      <section class="bg-surface-container-lowest rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden min-h-[400px]">
        <div v-if="isLoading" class="p-16 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p class="text-on-surface-variant font-medium">Memuat data permohonan...</p>
        </div>
        
        <div v-else-if="filteredBookings.length === 0" class="p-16 flex flex-col items-center justify-center gap-4 border-t border-slate-100">
          <span class="material-symbols-outlined text-4xl text-outline">inbox</span>
          <p class="text-on-surface-variant font-medium">Tidak ada permohonan ditemukan.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-surface-container-low/50 text-outline text-xs font-bold uppercase tracking-widest">
                <th class="px-6 py-5">Pemohon</th>
                <th class="px-6 py-5">Gedung / Ruangan</th>
                <th class="px-6 py-5">Waktu Peminjaman</th>
                <th class="px-6 py-5">Prioritas</th>
                <th class="px-6 py-5">Status</th>
                <th class="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              <tr v-for="booking in filteredBookings" :key="booking.id" :class="getRowClass(booking.status)">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold" :class="getAvatarClass(booking.status)">
                      {{ booking.user?.username?.substring(0, 2).toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-on-surface">{{ booking.user?.username || 'Guest' }}</div>
                      <div class="text-xs text-on-surface-variant max-w-[150px] truncate">{{ booking.purpose }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="font-medium">{{ booking.room?.name || 'Ruangan' }}</div>
                  <div class="text-xs text-on-surface-variant">{{ booking.room?.code || '-' }}</div>
                </td>
                <td class="px-6 py-5">
                  <div class="font-medium flex items-center gap-1" :class="booking.status === 'needs_negotiation' ? 'text-red-600' : ''">
                    <span v-if="booking.status === 'needs_negotiation'" class="material-symbols-outlined text-sm">warning</span>
                    {{ formatDate(booking.bookingDate) }}
                  </div>
                  <div class="text-xs text-on-surface-variant">{{ booking.startTime.slice(0,5) }} - {{ booking.endTime.slice(0,5) }} WIB</div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-white text-[10px] font-extrabold px-2 py-1 rounded" :class="getPriorityColor(booking.activityWeight)">P{{ booking.activityWeight }}</span>
                </td>
                <td class="px-6 py-5">
                  <span class="text-xs font-bold px-2 py-1 rounded-full uppercase" :class="getStatusPillClass(booking.status)">{{ getStatusString(booking.status) }}</span>
                </td>
                <td class="px-6 py-5 text-right">
                  <button v-if="booking.status === 'needs_negotiation'" @click="goToDetail(booking.id)" class="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform cursor-pointer">Selesaikan Konflik</button>
                  <button v-else-if="booking.status === 'pending'" @click="goToDetail(booking.id)" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform cursor-pointer">Tinjau</button>
                  <span v-else-if="booking.status === 'approved'" class="text-green-600 font-bold text-sm flex items-center justify-end gap-1 cursor-pointer hover:underline" @click="goToDetail(booking.id)">
                    <span class="material-symbols-outlined text-sm">visibility</span> Cek Detail
                  </span>
                  <span v-else class="text-slate-500 font-bold text-sm flex items-center justify-end gap-1 cursor-pointer hover:underline" @click="goToDetail(booking.id)">
                    <span class="material-symbols-outlined text-sm">visibility</span> Cek Detail
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Metadata -->
        <div v-if="filteredBookings.length > 0" class="bg-surface-container-low px-8 py-5 flex items-center justify-between border-t border-slate-200">
          <div class="text-xs text-on-surface-variant font-medium">Menampilkan {{ filteredBookings.length }} Data Permohonan</div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t border-outline-variant/10 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex flex-col items-center md:items-start">
          <span class="font-bold text-blue-900 text-lg">CLASSINFY</span>
          <p class="text-slate-500 text-sm mt-1">© 2026 CLASSINFY — UNESA Digital Quad System.</p>
        </div>
        <div class="flex gap-8">
          <a class="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer">Panduan</a>
          <a class="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer">Bantuan</a>
          <a class="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer">Fasilitas</a>
        </div>
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

const bookings = ref([])
const isLoading = ref(true)
const activeTab = ref('Semua')
const searchQuery = ref('')

const fetchBookings = async () => {
  try {
    isLoading.value = true
    const res = await axios.get(`${API_URL}/api/bookings`, { headers: authStore.getAuthHeaders() })
    bookings.value = res.data.data
  } catch (err) {
    console.error('Failed fetching permohonan', err)
  } finally {
    isLoading.value = false
  }
}

const filteredBookings = computed(() => {
  let res = bookings.value
  
  if (activeTab.value === 'Pending') res = res.filter(b => b.status === 'pending')
  if (activeTab.value === 'Konflik') res = res.filter(b => b.status === 'needs_negotiation')
  if (activeTab.value === 'Approved') res = res.filter(b => b.status === 'approved')
  if (activeTab.value === 'Rejected') res = res.filter(b => b.status === 'rejected' || b.status === 'cancelled')

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(b => 
      b.user?.username?.toLowerCase().includes(q) || 
      b.room?.name?.toLowerCase().includes(q) || 
      b.purpose?.toLowerCase().includes(q)
    )
  }
  return res
})

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const conflictCount = computed(() => bookings.value.filter(b => b.status === 'needs_negotiation').length)

const goToDetail = (id) => {
  router.push(`/admin/permohonan/${id}`)
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(() => {
  fetchBookings()
})

// === UI Helpers ===
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const tabClass = (tabName) => {
  if (activeTab.value === tabName) {
    return 'px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-md cursor-pointer transition-colors'
  }
  return 'px-6 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container-highest transition-colors cursor-pointer'
}

const getRowClass = (status) => {
  if (status === 'needs_negotiation') return 'bg-[#FFF5F5] border-l-4 border-red-500 hover:bg-red-50/50 transition-colors'
  if (status === 'approved') return 'bg-[#F0FDF4] border-l-4 border-green-500 hover:bg-green-50/50 transition-colors'
  return 'hover:bg-surface-container-low transition-colors'
}

const getAvatarClass = (status) => {
  if (status === 'needs_negotiation') return 'bg-red-100 text-red-600'
  if (status === 'approved') return 'bg-green-100 text-green-600'
  if (status === 'pending') return 'bg-blue-100 text-blue-600'
  return 'bg-slate-100 text-slate-600'
}

const getPriorityColor = (weight) => {
  switch(weight) {
    case 5: return 'bg-red-600'
    case 4: return 'bg-orange-500'
    case 3: return 'bg-amber-500'
    case 2: return 'bg-green-500'
    case 1: return 'bg-blue-400'
    default: return 'bg-slate-300'
  }
}

const getStatusString = (status) => {
  if (status === 'needs_negotiation') return 'Konflik'
  return status
}

const getStatusPillClass = (status) => {
  if (status === 'needs_negotiation') return 'bg-red-100 text-red-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'approved') return 'bg-green-100 text-green-700'
  if (status === 'rejected' || status === 'cancelled') return 'bg-slate-200 text-slate-700'
  return 'bg-slate-100 text-slate-600'
}

</script>

<style scoped>
.grid-texture {
    background-image: 
        linear-gradient(to right, rgba(26, 60, 110, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(26, 60, 110, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
}
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
