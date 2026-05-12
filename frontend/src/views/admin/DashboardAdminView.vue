<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'

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

const tabs = ['Semua', 'Pending', 'Konflik', 'Rescheduled', 'Approved', 'Rejected']

// ==================== Status Config ====================
const statusConfig = {
  pending:             { bg: 'bg-[#F59E0B]/20', text: 'text-[#D97706]', icon: 'visibility',     label: 'Pending' },
  approved:            { bg: 'bg-[#16A34A]/20', text: 'text-[#16A34A]', icon: 'check_circle',   label: 'Approved' },
  rejected:            { bg: 'bg-[#991B1B]/20', text: 'text-[#991B1B]', icon: 'cancel',         label: 'Rejected' },
  cancelled:           { bg: 'bg-[#9CA3AF]/20', text: 'text-[#4B5563]', icon: 'block',          label: 'Cancelled' },
  needs_negotiation:   { bg: 'bg-[#7C3AED]/20', text: 'text-[#7C3AED]', icon: 'forum',          label: 'Needs Negotiation' },
  rescheduled:         { bg: 'bg-[#0EA5E9]/20', text: 'text-[#0284C7]', icon: 'event_repeat',   label: 'Rescheduled' },
}

// ==================== Computed ====================
const filteredBookings = computed(() => {
  let result = bookings.value

  // Tab filter
  if (activeTab.value === 'Pending') {
    result = result.filter(b => b.status === 'pending')
  } else if (activeTab.value === 'Konflik') {
    result = result.filter(b => b.status === 'needs_negotiation')
  } else if (activeTab.value === 'Rescheduled') {
    result = result.filter(b => b.status === 'rescheduled')
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
const rescheduledCount = computed(() => bookings.value.filter(b => b.status === 'rescheduled').length)
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

async function forceOverride(bookingId) {
  const reason = prompt('⚠️ FORCE OVERRIDE — Masukkan alasan darurat (force majeure) minimal 10 karakter:')
  if (!reason || reason.trim().length < 10) {
    if (reason !== null) alert('Alasan terlalu pendek (minimal 10 karakter).')
    return
  }
  if (!confirm(`FORCE OVERRIDE akan mem-bypass semua konflik dan langsung APPROVE booking ini.\n\nAlasan: ${reason}\n\nLanjutkan?`)) return
  try {
    const res = await axios.patch(`${API_URL}/api/bookings/${bookingId}/force-override`,
      { forceOverrideReason: reason },
      { headers: authStore.getAuthHeaders() }
    )
    const info = res.data
    alert(`✅ ${info.message}\n${info.preempted?.total > 0 ? `${info.preempted.total} booking konflik dibatalkan.` : ''}`)
    await fetchBookings()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal melakukan Force Override')
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
  <div class="bg-slate-50 font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Background Decoration -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.4]" 
         style="background-image: radial-gradient(#1a3c6e 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>

    <AdminNavbar />

    <!-- Main Content -->
    <main class="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
      
      <!-- Header -->
      <header class="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 class="text-4xl font-black text-[#1A3C6E] tracking-tight mb-2">Control Center</h1>
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Monitoring & Resolusi Konflik</p>
        </div>
        <div class="flex gap-3 bg-white/50 backdrop-blur p-1.5 rounded-full border border-slate-200 shadow-sm">
          <button v-for="tab in tabs" :key="tab"
                  @click="activeTab = tab"
                  :class="activeTab === tab ? 'bg-[#1A3C6E] text-white shadow-lg' : 'text-slate-500 hover:bg-white'"
                  class="px-6 py-2 rounded-full text-xs font-black transition-all duration-300 relative">
            {{ tab }}
            <span v-if="tab === 'Konflik' && conflictCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center border-2 border-white">{{ conflictCount }}</span>
          </button>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div v-for="(item, idx) in [
          { label: 'Menunggu Review', val: pendingCount, icon: 'pending_actions' },
          { label: 'Butuh Resolusi', val: conflictCount, icon: 'warning' },
          { label: 'Rescheduled', val: rescheduledCount, icon: 'event_repeat' },
          { label: 'Berhasil Disetujui', val: approvedCount, icon: 'check_circle' },
        ]" :key="idx"
             class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden relative">
          <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span class="material-symbols-outlined text-9xl text-[#1A3C6E]">{{ item.icon }}</span>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{{ item.label }}</p>
          <h3 class="text-5xl font-black text-[#1A3C6E]">{{ item.val }}</h3>
        </div>
      </section>

      <!-- Main Table -->
      <div class="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100">
        <div class="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 class="font-black text-[#1A3C6E] text-xl flex items-center gap-3">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">list_alt</span>
            Daftar Permohonan
          </h3>
          <div class="relative w-64">
            <input v-model="searchQuery" 
                   class="w-full bg-slate-50 border-none rounded-2xl py-2.5 px-10 text-xs focus:ring-2 focus:ring-blue-100 transition-all" 
                   placeholder="Cari permohonan..." type="text"/>
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th class="px-8 py-6">Penerima</th>
                <th class="px-8 py-6">Ruang & Waktu</th>
                <th class="px-8 py-6 text-center">Prioritas</th>
                <th class="px-8 py-6">Status</th>
                <th class="px-8 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="isLoading" v-for="i in 3" :key="i" class="animate-pulse">
                <td colspan="5" class="px-8 py-10 h-16 bg-slate-50/20"></td>
              </tr>
              <tr v-else v-for="booking in filteredBookings" :key="booking.id" class="group hover:bg-blue-50/30 transition-colors">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#1A3C6E] font-black text-xl group-hover:bg-white transition-colors">
                      {{ booking.user?.username?.charAt(0).toUpperCase() || '?' }}
                    </div>
                    <div>
                      <p class="font-black text-[#1A3C6E] text-lg">{{ booking.user?.username || 'Anonim' }}</p>
                      <p class="text-[10px] font-bold text-slate-400 tracking-wider truncate max-w-[150px]">{{ booking.purpose }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-sm font-black text-slate-600">{{ booking.room?.name || 'Ruang ?' }}</p>
                  <p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{{ formatDate(booking.bookingDate) }} · {{ formatTime(booking.startTime, booking.endTime) }}</p>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center justify-center gap-1">
                    <span v-for="i in 5" :key="i" 
                          class="material-symbols-outlined text-sm" 
                          :class="i <= booking.activityWeight ? 'text-amber-400' : 'text-slate-100'"
                          :style="i <= booking.activityWeight ? `font-variation-settings: 'FILL' 1` : ''">
                      star
                    </span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div v-if="statusConfig[booking.status]" class="flex items-center gap-2">
                    <span :class="statusConfig[booking.status].bg" class="w-2 h-2 rounded-full"></span>
                    <span :class="statusConfig[booking.status].text" class="text-xs font-black uppercase tracking-widest">
                      {{ statusConfig[booking.status].label }}
                    </span>
                  </div>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-2 flex-wrap">
                    <!-- Approve -->
                    <button v-if="['pending', 'needs_negotiation', 'rescheduled'].includes(booking.status)"
                            @click="updateStatus(booking.id, 'approved')"
                            title="Approve"
                            class="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                      <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                    </button>
                    <!-- Negotiate -->
                    <button v-if="booking.status === 'pending'"
                            @click="negotiateBooking(booking.id)"
                            title="Negotiate"
                            class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                      <span class="material-symbols-outlined text-lg">forum</span>
                    </button>
                    <!-- Reject -->
                    <button v-if="['pending', 'needs_negotiation', 'rescheduled'].includes(booking.status)"
                            @click="updateStatus(booking.id, 'rejected', 'Ditolak oleh admin')"
                            title="Reject"
                            class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">
                      <span class="material-symbols-outlined text-lg">cancel</span>
                    </button>
                    <!-- FORCE OVERRIDE — tombol merah darurat -->
                    <button v-if="['pending', 'needs_negotiation', 'rescheduled'].includes(booking.status)"
                            @click="forceOverride(booking.id)"
                            title="Force Override (Bypass Konflik)"
                            class="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-200">
                      <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">bolt</span>
                    </button>
                    <!-- Detail -->
                    <router-link :to="`/admin/permohonan/${booking.id}`" 
                                 title="Lihat Detail"
                                 class="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-white hover:text-[#1A3C6E] transition-all border border-transparent hover:border-slate-100">
                      <span class="material-symbols-outlined text-lg">arrow_forward_ios</span>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>
