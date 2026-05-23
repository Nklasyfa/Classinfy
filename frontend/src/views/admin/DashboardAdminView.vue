<template>
  <div class="admin-bg-grid font-body text-on-surface min-h-screen pb-20 relative overflow-x-hidden">
    <AdminNavbar />

    <main class="max-w-7xl mx-auto px-6 pt-32 space-y-10 relative z-10">
      <!-- Header Moment -->
      <header class="flex justify-between items-end">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold tracking-tight text-primary">Admin Control Center</h1>
          <p class="text-slate-500 font-medium">Monitoring and resolving facility booking conflicts.</p>
        </div>
        <button @click="router.push('/admin/permohonan')" class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2 cursor-pointer">
          <span class="material-symbols-outlined text-[20px]">list_alt</span>
          Lihat Semua Antrian
        </button>
      </header>

      <!-- Section A: Status Legend -->
      <section class="bg-surface-container-lowest rounded-lg p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-secondary">label_important</span>
          <h2 class="text-lg font-bold text-primary">System Lifecycle States</h2>
        </div>
        <div class="flex flex-wrap gap-3">
          <span class="status-chip bg-[#F59E0B]/20 text-[#D97706]"><span class="material-symbols-outlined text-[14px]">visibility</span>Under Review (Pending)</span>
          <span class="status-chip bg-[#DC2626]/20 text-[#DC2626]"><span class="material-symbols-outlined text-[14px]">warning</span>Conflict Detected</span>
          <span class="status-chip bg-[#7C3AED]/20 text-[#7C3AED]"><span class="material-symbols-outlined text-[14px]">forum</span>Needs Negotiation</span>
          <span class="status-chip bg-[#16A34A]/20 text-[#16A34A]"><span class="material-symbols-outlined text-[14px]">check_circle</span>Approved</span>
          <span class="status-chip bg-[#991B1B]/20 text-[#991B1B]"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected</span>
          <span class="status-chip bg-[#0EA5E9]/20 text-[#0EA5E9]"><span class="material-symbols-outlined text-[14px]">event_repeat</span>Rescheduled</span>
          <span class="status-chip bg-[#9CA3AF]/20 text-[#4B5563]"><span class="material-symbols-outlined text-[14px]">block</span>Cancelled</span>
        </div>
      </section>

      <!-- Section B: Conflict Indicator Showcase -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Variant 1: Urgent -->
        <div class="bg-[#FFFBEB] rounded-lg p-6 shadow-sm border-l-[6px] border-red-600 flex flex-col justify-between" v-if="conflictBookings.length > 0">
          <div>
            <h4 class="text-sm font-extrabold text-amber-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">priority_high</span> 
              URGENT: RESOLUTION NEEDED
            </h4>
            <p class="text-xs text-amber-800 mt-1">Konflik di {{ conflictBookings[0].room?.name }}</p>
            <p class="text-[10px] text-amber-700 mt-1 truncate">ID: {{ conflictBookings[0].id.substring(0,8) }} - {{ conflictBookings[0].purpose }}</p>
          </div>
          <div class="flex gap-2 mt-4">
            <button @click="goToDetail(conflictBookings[0].id)" class="px-4 py-2 w-full bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer">Selesaikan</button>
          </div>
        </div>
        <div v-else class="bg-green-50 rounded-lg p-6 shadow-sm border-l-[6px] border-green-500 flex flex-col justify-center items-center text-center">
          <span class="material-symbols-outlined text-green-500 text-3xl mb-2">check_circle</span>
          <h4 class="text-sm font-extrabold text-green-900">Aman</h4>
          <p class="text-xs text-green-700">Tidak ada konflik darurat</p>
        </div>

        <!-- Variant 2: Row -->
        <div class="bg-surface-container-lowest rounded-lg p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden group border border-outline-variant/10" v-if="conflictBookings.length > 1">
          <div class="absolute inset-0 bg-red-50/50 group-hover:bg-red-50 transition-colors"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
              <span class="text-sm font-bold text-red-900">{{ conflictBookings[1].room?.name }}</span>
            </div>
            <span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">KONFLIK</span>
          </div>
          <div class="mt-4 text-xs text-slate-500 font-medium relative z-10 truncate">{{ conflictBookings[1].purpose }}</div>
          <button @click="goToDetail(conflictBookings[1].id)" class="relative z-10 mt-3 text-[10px] font-bold text-red-600 hover:underline cursor-pointer">Cek Detail →</button>
        </div>
        <div v-else class="bg-surface-container-lowest rounded-lg p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10 flex flex-col justify-center items-center text-slate-400">
          <span class="material-symbols-outlined text-3xl mb-2">task_alt</span>
          <p class="text-xs font-medium">Slot Aman</p>
        </div>

        <!-- Variant 3: Card Badge -->
        <div class="bg-surface-container-lowest rounded-lg p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative border border-outline-variant/10" v-if="conflictBookings.length > 2">
          <div class="absolute -top-2 -right-2 bg-error text-white text-[10px] font-extrabold px-3 py-1 rounded-lg rotate-3 shadow-md z-10">KONFLIK</div>
          <h4 class="text-sm font-bold text-primary mb-2 truncate">Permohonan {{ conflictBookings[2].user?.username }}</h4>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] text-slate-500">
              <span>Waktu:</span>
              <span class="font-bold text-on-surface">{{ conflictBookings[2].startTime.slice(0,5) }} - {{ conflictBookings[2].endTime.slice(0,5) }}</span>
            </div>
            <div class="flex justify-between text-[11px] text-slate-500">
              <span>Ruang:</span>
              <span class="font-bold text-on-surface truncate max-w-[100px] text-right">{{ conflictBookings[2].room?.name }}</span>
            </div>
          </div>
          <button @click="goToDetail(conflictBookings[2].id)" class="mt-4 w-full bg-surface-container-low text-primary text-[10px] py-1.5 font-bold rounded-md hover:bg-surface-container-highest cursor-pointer">Review</button>
        </div>
        <div v-else class="bg-surface-container-lowest rounded-lg p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10 flex flex-col justify-center items-center text-slate-400">
          <span class="material-symbols-outlined text-3xl mb-2">task_alt</span>
          <p class="text-xs font-medium">Slot Aman</p>
        </div>
      </section>

      <!-- Section C: Main Request Status Table -->
      <section class="bg-surface-container-lowest rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden border border-outline-variant/10">
        <div class="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
          <div class="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
            <button v-for="tab in ['Semua', 'Pending', 'Konflik', 'Approved', 'Rejected']" :key="tab"
                    @click="activeTab = tab"
                    :class="activeTab === tab ? 'px-4 py-2 text-xs font-bold rounded-lg bg-surface-container-low text-primary shadow-sm' : 'px-4 py-2 text-xs font-medium text-slate-500 hover:text-primary cursor-pointer'">
              {{ tab }} 
              <span v-if="tab === 'Konflik' && conflictBookings.length > 0" class="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-extrabold">{{ conflictBookings.length }}</span>
            </button>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input v-model="searchQuery" class="pl-9 pr-4 py-2 bg-white border border-outline-variant/20 rounded-full text-xs w-64 focus:ring-2 focus:ring-primary-fixed-dim outline-none" placeholder="Search request ID, name..." type="text"/>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low/30 border-b border-outline-variant/10">
              <tr>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">ID Permohonan</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Pemohon</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Ruangan</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Waktu</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/5">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">Memuat data...</td>
              </tr>
              <tr v-else-if="filteredBookings.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada permohonan yang sesuai.</td>
              </tr>
              <tr v-else v-for="booking in filteredBookings" :key="booking.id" :class="getRowClass(booking.status)">
                <td class="px-6 py-4 text-xs font-bold" :class="booking.status === 'needs_negotiation' ? 'text-red-900' : 'text-primary'">REQ-{{ booking.id.substring(0,8).toUpperCase() }}</td>
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-900 font-extrabold' : 'text-slate-700'">{{ booking.user?.username || 'Anonim' }}</td>
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-900 font-bold' : 'text-slate-700'">{{ booking.room?.name || '-' }}</td>
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-700' : 'text-slate-500'">{{ formatDate(booking.bookingDate) }}, {{ booking.startTime.slice(0,5) }}</td>
                <td class="px-6 py-4">
                  <span :class="getStatusChipConfig(booking.status).class" class="status-chip">{{ getStatusChipConfig(booking.status).label }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button v-if="booking.status === 'needs_negotiation'" @click="goToDetail(booking.id)" class="bg-red-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded animate-pulse cursor-pointer hover:bg-red-700">Resolve</button>
                  <span v-else @click="goToDetail(booking.id)" class="material-symbols-outlined cursor-pointer" :class="booking.status === 'pending' ? 'text-amber-500 hover:text-amber-700' : 'text-slate-400 hover:text-primary'">{{ booking.status === 'pending' ? 'visibility' : 'more_vert' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section D: Conflict Priority & Resolution Flow -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Priority Ladder -->
        <div class="bg-surface-container-lowest rounded-lg p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10">
          <div class="flex items-center gap-3 mb-8">
            <span class="material-symbols-outlined text-amber-500">leaderboard</span>
            <h3 class="text-xl font-bold text-primary">Priority Ladder</h3>
          </div>
          <div class="space-y-6">
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#FFD700]"></div>
              <span class="material-symbols-outlined text-3xl text-[#FFD700]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">Rectorate / Academic</h4>
                <p class="text-[10px] font-medium text-slate-500">Level 5 - Maximum Override Power</p>
              </div>
              <span class="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full">GOLD</span>
            </div>
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#C0C0C0]"></div>
              <span class="material-symbols-outlined text-3xl text-[#94A3B8]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">Faculty Events</h4>
                <p class="text-[10px] font-medium text-slate-500">Level 3~4 - High Resolution Priority</p>
              </div>
              <span class="text-[10px] font-bold text-primary-container bg-surface-container-highest px-3 py-1 rounded-full">SILVER</span>
            </div>
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#CD7F32]"></div>
              <span class="material-symbols-outlined text-3xl text-[#CD7F32]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">Student Organizations</h4>
                <p class="text-[10px] font-medium text-slate-500">Level 1~2 - Peer-to-Peer Negotiation</p>
              </div>
              <span class="text-[10px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">BRONZE</span>
            </div>
          </div>
        </div>

        <!-- Resolution Flowchart -->
        <div class="bg-surface-container-lowest rounded-lg p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden border border-outline-variant/10">
          <div class="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span class="material-symbols-outlined text-[120px]">account_tree</span>
          </div>
          <div class="flex items-center gap-3 mb-8 relative z-10">
            <span class="material-symbols-outlined text-secondary">schema</span>
            <h3 class="text-xl font-bold text-primary">Resolution Flow</h3>
          </div>
          <div class="flex flex-col items-center gap-4 relative z-10">
            <div class="w-full h-px bg-outline-variant/20 absolute top-1/2 -translate-y-1/2 left-0 hidden md:block"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
              <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center font-bold shadow-md">1</div>
                <span class="text-xs font-bold text-primary uppercase">Conflict Trigger</span>
                <p class="text-[10px] text-slate-500">Overlap system detection based on time/room</p>
              </div>
              <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold shadow-md">2</div>
                <span class="text-xs font-bold text-primary uppercase">Priority Check</span>
                <p class="text-[10px] text-slate-500">Automated rank comparison between units</p>
              </div>
              <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md">3</div>
                <span class="text-xs font-bold text-primary uppercase">Final Verdict</span>
                <p class="text-[10px] text-slate-500">Admin override or suggested reschedule</p>
              </div>
            </div>
            <div class="mt-4 p-4 bg-primary text-white rounded-xl w-full text-center shadow-lg">
              <span class="text-xs font-bold tracking-widest uppercase">Resolution System Active</span>
            </div>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'

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
    bookings.value = res.data.data || []
  } catch (err) {
    console.error('Failed fetching permohonan', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBookings()
})

const conflictBookings = computed(() => {
  return bookings.value.filter(b => b.status === 'needs_negotiation')
})

const filteredBookings = computed(() => {
  let res = bookings.value
  
  if (activeTab.value === 'Pending') res = res.filter(b => b.status === 'pending')
  if (activeTab.value === 'Konflik') res = res.filter(b => b.status === 'needs_negotiation')
  if (activeTab.value === 'Approved') res = res.filter(b => b.status === 'approved')
  if (activeTab.value === 'Rejected') res = res.filter(b => b.status === 'rejected' || b.status === 'cancelled')

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(b => 
      b.id?.toLowerCase().includes(q) ||
      b.user?.username?.toLowerCase().includes(q) || 
      b.room?.name?.toLowerCase().includes(q) || 
      b.purpose?.toLowerCase().includes(q)
    )
  }
  return res
})

const goToDetail = (id) => {
  router.push(`/admin/permohonan/${id}`)
}

// === UI Helpers ===
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

const getRowClass = (status) => {
  if (status === 'needs_negotiation') return 'bg-[#FFF5F5] border-l-4 border-red-500'
  if (status === 'approved') return 'bg-[#F0FDF4] border-l-4 border-green-500'
  if (status === 'pending') return 'bg-[#FFFBEB] border-l-4 border-amber-500'
  if (status === 'rescheduled') return 'bg-[#F0F9FF] border-l-4 border-sky-500'
  return 'hover:bg-slate-50/50 transition-colors'
}

const getStatusChipConfig = (status) => {
  switch (status) {
    case 'pending': return { class: 'bg-[#F59E0B]/20 text-[#D97706]', label: 'Under Review' }
    case 'needs_negotiation': return { class: 'bg-[#DC2626]/20 text-[#DC2626]', label: 'Conflict Detected' }
    case 'approved': return { class: 'bg-[#16A34A]/20 text-[#16A34A]', label: 'Approved' }
    case 'rejected': return { class: 'bg-[#991B1B]/20 text-[#991B1B]', label: 'Rejected' }
    case 'cancelled': return { class: 'bg-[#9CA3AF]/20 text-[#4B5563]', label: 'Cancelled' }
    case 'rescheduled': return { class: 'bg-[#0EA5E9]/20 text-[#0EA5E9]', label: 'Rescheduled' }
    default: return { class: 'bg-slate-200 text-slate-600', label: status }
  }
}
</script>

<style scoped>
.admin-bg-grid {
    background-color: #F0F4F8;
    background-image: 
        linear-gradient(to right, rgba(26, 60, 110, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(26, 60, 110, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
}
.status-chip {
    padding: 4px 12px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
}
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
