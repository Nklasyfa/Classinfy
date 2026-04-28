<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const authStore = useAuthStore()

const user = computed(() => authStore.user)

// ==================== State ====================
const isLoading = ref(true)
const errorMsg = ref('')
const bookings = ref([])
const searchQuery = ref('')
const activeTab = ref('Semua')

const tabs = ['Semua', 'Pending', 'Konflik', 'Approved', 'Rejected']

// ==================== Status Config ====================
const statusConfig = {
  pending:             { bg: 'bg-[#F59E0B]/20', text: 'text-[#D97706]', icon: 'visibility',     label: 'Pending' },
  approved:            { bg: 'bg-[#16A34A]/20', text: 'text-[#16A34A]', icon: 'check_circle',   label: 'Approved' },
  rejected:            { bg: 'bg-[#991B1B]/20', text: 'text-[#991B1B]', icon: 'cancel',         label: 'Rejected' },
  cancelled:           { bg: 'bg-[#9CA3AF]/20', text: 'text-[#4B5563]', icon: 'block',          label: 'Cancelled' },
  needs_negotiation:   { bg: 'bg-[#7C3AED]/20', text: 'text-[#7C3AED]', icon: 'forum',          label: 'Needs Negotiation' },
}

// ==================== Computed ====================
const filteredBookings = computed(() => {
  let result = bookings.value

  // Tab filter
  if (activeTab.value === 'Pending') {
    result = result.filter(b => b.status === 'pending')
  } else if (activeTab.value === 'Konflik') {
    result = result.filter(b => b.status === 'needs_negotiation')
  } else if (activeTab.value === 'Approved') {
    result = result.filter(b => b.status === 'approved')
  } else if (activeTab.value === 'Rejected') {
    result = result.filter(b => b.status === 'rejected' || b.status === 'cancelled')
  }

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.id?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      b.user?.username?.toLowerCase().includes(q) ||
      b.room?.name?.toLowerCase().includes(q) ||
      b.room?.code?.toLowerCase().includes(q)
    )
  }

  return result
})

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const conflictCount = computed(() => bookings.value.filter(b => b.status === 'needs_negotiation').length)
const approvedCount = computed(() => bookings.value.filter(b => b.status === 'approved').length)

// ==================== Fetch ====================
async function fetchBookings() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.get(`${API_URL}/api/bookings`, {
      headers: authStore.getAuthHeaders(),
    })
    bookings.value = res.data.data || []
  } catch (err) {
    errorMsg.value = 'Gagal memuat data permohonan'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ==================== Actions ====================
async function updateStatus(bookingId, status, reason = '') {
  try {
    await axios.patch(`${API_URL}/api/bookings/${bookingId}/status`, 
      { status, rejectionReason: reason },
      { headers: authStore.getAuthHeaders() }
    )
    await fetchBookings()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengubah status')
  }
}

async function negotiateBooking(bookingId) {
  const notes = prompt('Masukkan rekomendasi negosiasi (waktu/ruang alternatif):')
  if (!notes) return
  try {
    await axios.patch(`${API_URL}/api/bookings/${bookingId}/negotiate`,
      { adminNotes: notes },
      { headers: authStore.getAuthHeaders() }
    )
    await fetchBookings()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengirim negosiasi')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(start, end) {
  if (!start || !end) return '-'
  return `${start.slice(0,5)} - ${end.slice(0,5)}`
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
</script>

<template>
  <div class="font-body text-on-surface antialiased pb-20 min-h-screen bg-background" style="background-image:linear-gradient(to right,rgba(26,60,110,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(26,60,110,0.05) 1px,transparent 1px);background-size:24px 24px;">

    <!-- TopNavBar -->
    <nav class="fixed top-4 left-1/2 -translate-x-1/2 w-[900px] max-w-[95%] rounded-full flex items-center justify-between px-6 py-2 z-50 shadow-[0_8px_32px_rgba(26,60,110,0.06)] bg-white/80 backdrop-blur-[20px]">
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-2xl font-extrabold text-blue-900 tracking-tight cursor-pointer hover:text-blue-700 transition-colors">CLASSINFY</router-link>
        <div class="hidden md:flex items-center gap-1">
          <router-link to="/" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Monitoring</router-link>
          <router-link to="/admin/dashboard" class="bg-blue-900 text-white rounded-full px-4 py-1.5 transition-all text-sm font-medium cursor-pointer shadow-sm">Dashboard</router-link>
          <router-link to="/admin/fasilitas" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Fasilitas</router-link>
          <router-link to="/admin/permohonan" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Permohonan</router-link>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative group cursor-pointer">
          <span class="material-symbols-outlined text-slate-600 group-hover:scale-105 transition-transform">notifications</span>
          <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 bg-error text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{{ pendingCount }}</span>
        </div>
        <div class="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
          <div class="text-right hidden sm:block">
            <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ user?.role?.name || 'Administrator' }}</p>
            <p class="text-[10px] text-slate-500 font-medium">{{ user?.username || 'Admin' }}</p>
          </div>
          <div
            @click="handleLogout"
            class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Klik untuk Logout"
          >
            {{ user?.username?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 pt-32 space-y-10">

      <!-- Header -->
      <header class="flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold tracking-tight text-primary">Admin Control Center</h1>
          <p class="text-slate-500 font-medium">Monitoring and resolving facility booking conflicts.</p>
        </div>
        <button class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2 cursor-pointer">
          <span class="material-symbols-outlined">add_circle</span>
          New Allocation
        </button>
      </header>

      <!-- Section A: Status Legend -->
      <section class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-secondary">label_important</span>
          <h2 class="text-lg font-bold text-primary">System Lifecycle States</h2>
        </div>
        <div class="flex flex-wrap gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#D97706] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">visibility</span>Pending</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DC2626]/20 text-[#DC2626] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">warning</span>Conflict Detected</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">forum</span>Needs Negotiation</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/20 text-[#16A34A] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Approved</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#991B1B]/20 text-[#991B1B] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected</span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9CA3AF]/20 text-[#4B5563] text-xs font-semibold"><span class="material-symbols-outlined text-[14px]">block</span>Cancelled</span>
        </div>
      </section>

      <!-- Section B: Stat Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Pending Card -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="absolute inset-0 bg-amber-50/50 group-hover:bg-amber-50 transition-colors"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-amber-100 rounded-lg"><span class="material-symbols-outlined text-amber-600">pending_actions</span></div>
              <span class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">PENDING</span>
            </div>
            <h3 class="text-on-surface-variant font-medium text-sm">Menunggu Review</h3>
            <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-amber-600">{{ pendingCount }}</span><span class="text-amber-600/60 font-semibold text-sm">permohonan</span></div>
          </div>
        </div>

        <!-- Conflict/Negotiation Card -->
        <div class="bg-[#FFFBEB] rounded-2xl p-6 shadow-sm border-l-[6px] border-red-600 flex flex-col justify-between">
          <div>
            <h4 class="text-sm font-extrabold text-amber-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">priority_high</span>
              PERLU RESOLUSI
            </h4>
            <p class="text-xs text-amber-800 mt-1">{{ conflictCount }} permohonan butuh negosiasi.</p>
          </div>
          <div class="mt-4 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-red-600">{{ conflictCount }}</span><span class="text-red-600/60 font-semibold text-sm">konflik</span></div>
        </div>

        <!-- Approved Card -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="absolute inset-0 bg-green-50/50 group-hover:bg-green-50 transition-colors"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-green-50 rounded-lg"><span class="material-symbols-outlined text-green-600">check_circle</span></div>
              <span class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">APPROVED</span>
            </div>
            <h3 class="text-on-surface-variant font-medium text-sm">Disetujui</h3>
            <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-green-600">{{ approvedCount }}</span><span class="text-green-600/60 font-semibold text-sm">permohonan</span></div>
          </div>
        </div>
      </section>

      <!-- Section C: Main Request Table -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden">
        <div class="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl">
            <button
              v-for="tab in tabs" :key="tab"
              @click="activeTab = tab"
              :class="[
                'px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
                activeTab === tab ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
              ]"
            >
              {{ tab }}
              <span v-if="tab === 'Konflik' && conflictCount > 0" class="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-extrabold">{{ conflictCount }}</span>
              <span v-if="tab === 'Pending' && pendingCount > 0" class="ml-1 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-extrabold">{{ pendingCount }}</span>
            </button>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              v-model="searchQuery"
              class="pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-xs w-64 focus:ring-2 focus:ring-primary-fixed-dim outline-none"
              placeholder="Cari ID, pemohon, ruang..."
              type="text"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="p-16 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p class="text-on-surface-variant font-medium">Memuat data permohonan...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorMsg" class="p-16 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-4xl text-error">error</span>
          <p class="text-error font-medium">{{ errorMsg }}</p>
          <button @click="fetchBookings" class="bg-primary text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">Coba Lagi</button>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredBookings.length === 0" class="p-16 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-4xl text-outline">inbox</span>
          <p class="text-on-surface-variant font-medium">Tidak ada permohonan ditemukan.</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low/50 border-b border-outline-variant/10">
              <tr>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">ID</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Pemohon</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Ruangan</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Waktu</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Kegiatan</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Prioritas</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/5">
              <tr
                v-for="booking in filteredBookings"
                :key="booking.id"
                :class="[
                  'transition-colors',
                  booking.status === 'needs_negotiation' ? 'bg-[#FAF5FF]' :
                  booking.status === 'approved' ? 'bg-[#F0FDF4]' :
                  'hover:bg-slate-50/50'
                ]"
              >
                <td class="px-6 py-4 text-xs font-bold text-primary">{{ booking.id?.slice(0, 8) }}...</td>
                <td class="px-6 py-4 text-xs font-medium">{{ booking.user?.username || '-' }}</td>
                <td class="px-6 py-4 text-xs font-medium">{{ booking.room?.code || '-' }} · {{ booking.room?.name || '' }}</td>
                <td class="px-6 py-4 text-xs text-slate-500">
                  <div>{{ formatDate(booking.bookingDate) }}</div>
                  <div class="text-[10px] font-bold text-primary/60">{{ formatTime(booking.startTime, booking.endTime) }}</div>
                </td>
                <td class="px-6 py-4 text-xs font-medium max-w-[160px] truncate">{{ booking.purpose }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1">
                    <span v-for="i in 5" :key="i" class="material-symbols-outlined text-[14px]" :class="i <= booking.activityWeight ? 'text-amber-500' : 'text-slate-200'" :style="i <= booking.activityWeight ? `font-variation-settings: 'FILL' 1` : ''">star</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="statusConfig[booking.status]"
                    :class="[statusConfig[booking.status].bg, statusConfig[booking.status].text, 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold']"
                  >
                    <span class="material-symbols-outlined text-[14px]">{{ statusConfig[booking.status].icon }}</span>
                    {{ statusConfig[booking.status].label }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <!-- Approve -->
                    <button
                      v-if="booking.status === 'pending' || booking.status === 'needs_negotiation'"
                      @click="updateStatus(booking.id, 'approved')"
                      class="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <span class="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                    </button>
                    <!-- Negotiate -->
                    <button
                      v-if="booking.status === 'pending'"
                      @click="negotiateBooking(booking.id)"
                      class="p-1.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                      title="Negosiasi"
                    >
                      <span class="material-symbols-outlined text-purple-600 text-[18px]">forum</span>
                    </button>
                    <!-- Reject -->
                    <button
                      v-if="booking.status === 'pending' || booking.status === 'needs_negotiation'"
                      @click="updateStatus(booking.id, 'rejected', 'Ditolak oleh admin')"
                      class="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      title="Reject"
                    >
                      <span class="material-symbols-outlined text-red-600 text-[18px]">cancel</span>
                    </button>
                    <!-- Info for non-actionable -->
                    <span
                      v-if="booking.status === 'approved' || booking.status === 'rejected' || booking.status === 'cancelled'"
                      class="material-symbols-outlined text-slate-400 text-[18px]"
                      :style="booking.status === 'approved' ? `font-variation-settings: 'FILL' 1; color: #16A34A` : ''"
                    >
                      {{ booking.status === 'approved' ? 'check_circle' : 'info' }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section D: Priority Ladder & Resolution Flow -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Priority Ladder -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10">
          <div class="flex items-center gap-3 mb-8">
            <span class="material-symbols-outlined text-amber-500">leaderboard</span>
            <h3 class="text-xl font-bold text-primary">Priority Ladder</h3>
          </div>
          <div class="space-y-6">
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#FFD700]"></div>
              <span class="material-symbols-outlined text-3xl text-[#FFD700]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">Rektorat / Dekanat</h4>
                <p class="text-[10px] font-medium text-slate-500">Weight 5 — Maximum Override Power</p>
              </div>
              <span class="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full">★★★★★</span>
            </div>
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#C0C0C0]"></div>
              <span class="material-symbols-outlined text-3xl text-[#94A3B8]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">Akademik / Fakultas</h4>
                <p class="text-[10px] font-medium text-slate-500">Weight 3-4 — High Resolution Priority</p>
              </div>
              <span class="text-[10px] font-bold text-primary-container bg-surface-container-highest px-3 py-1 rounded-full">★★★★</span>
            </div>
            <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-[#CD7F32]"></div>
              <span class="material-symbols-outlined text-3xl text-[#CD7F32]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <div class="flex-1">
                <h4 class="text-sm font-extrabold text-primary">UKM / Organisasi</h4>
                <p class="text-[10px] font-medium text-slate-500">Weight 1-2 — Peer-to-Peer Negotiation</p>
              </div>
              <span class="text-[10px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">★★</span>
            </div>
          </div>
        </div>

        <!-- Resolution Flowchart -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden">
          <div class="absolute top-0 right-0 p-8 opacity-5">
            <span class="material-symbols-outlined text-[120px]">account_tree</span>
          </div>
          <div class="flex items-center gap-3 mb-8">
            <span class="material-symbols-outlined text-secondary">schema</span>
            <h3 class="text-xl font-bold text-primary">Resolution Flow</h3>
          </div>
          <div class="flex flex-col items-center gap-4 relative">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
              <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center font-bold shadow-md">1</div>
                <span class="text-xs font-bold text-primary uppercase">Conflict Trigger</span>
                <p class="text-[10px] text-slate-500">Overlap detection by time & room matrix</p>
              </div>
              <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold shadow-md">2</div>
                <span class="text-xs font-bold text-primary uppercase">Priority Check</span>
                <p class="text-[10px] text-slate-500">Automated weight comparison (1-5)</p>
              </div>
              <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center text-center gap-2">
                <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md">3</div>
                <span class="text-xs font-bold text-primary uppercase">Final Verdict</span>
                <p class="text-[10px] text-slate-500">Preemption or negotiation recommendation</p>
              </div>
            </div>
            <div class="mt-4 p-4 bg-primary text-white rounded-xl w-full text-center">
              <span class="text-xs font-bold tracking-widest uppercase">Preemption Engine Active — Auto-Resolution Enabled</span>
            </div>
          </div>
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
