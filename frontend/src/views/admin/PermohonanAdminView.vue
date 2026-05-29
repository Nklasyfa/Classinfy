<template>
  <div class="admin-bg-grid font-body text-on-surface min-h-screen pb-20 relative overflow-x-hidden">
    <AdminNavbar />

    <main class="max-w-7xl mx-auto px-6 pt-32 space-y-10 relative z-10">
      <!-- Header Moment -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold tracking-tight text-primary">Daftar Permohonan Peminjaman</h1>
          <p class="text-slate-500 font-medium">Monitoring antrian dan log permohonan fasilitas.</p>
        </div>
        <button @click="exportToExcel" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors w-fit">
          <span class="material-symbols-outlined text-sm">download</span>
          Export Laporan Excel
        </button>
      </header>

      <!-- Main Request Status Table -->
      <section class="bg-surface-container-lowest rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden border border-outline-variant/10 min-h-[400px]">
        <div class="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
          <div class="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-x-auto w-full md:w-auto">
            <button v-for="tab in ['Semua', 'Pending', 'Konflik', 'Approved', 'Rejected']" :key="tab"
                    @click="activeTab = tab"
                    :class="activeTab === tab ? 'px-4 py-2 text-xs font-bold rounded-lg bg-surface-container-low text-primary shadow-sm whitespace-nowrap' : 'px-4 py-2 text-xs font-medium text-slate-500 hover:text-primary cursor-pointer whitespace-nowrap'">
              {{ tab }}
            </button>
          </div>
          <div class="relative w-full md:w-auto">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input v-model="searchQuery" class="pl-9 pr-4 py-2 bg-white border border-outline-variant/20 rounded-full text-xs w-full md:w-64 focus:ring-2 focus:ring-primary-fixed-dim outline-none" placeholder="Cari nama, ruangan..." type="text"/>
          </div>
        </div>
        <div v-if="isLoading" class="p-16 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p class="text-on-surface-variant font-medium">Memuat data permohonan...</p>
        </div>
        
        <div v-else-if="filteredBookings.length === 0" class="p-16 flex flex-col items-center justify-center gap-4 border-t border-slate-100">
          <span class="material-symbols-outlined text-4xl text-outline">inbox</span>
          <p class="text-on-surface-variant font-medium">Tidak ada permohonan ditemukan.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low/30 border-b border-outline-variant/10">
              <tr>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Pemohon</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Ruangan</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Waktu</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Prioritas</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              <tr v-for="booking in filteredBookings" :key="booking.id" :class="getRowClass(booking.status)">
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-900 font-extrabold' : 'text-slate-700'">{{ booking.user?.username || 'Anonim' }}</td>
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-900 font-bold' : 'text-slate-700'">{{ booking.room?.name || '-' }}</td>
                <td class="px-6 py-4 text-xs font-medium" :class="booking.status === 'needs_negotiation' ? 'text-red-700' : 'text-slate-500'">{{ formatDate(booking.bookingDate) }}, {{ booking.startTime.slice(0,5) }} - {{ booking.endTime.slice(0,5) }}</td>
                <td class="px-6 py-4">
                  <span class="text-white text-[10px] font-extrabold px-2 py-1 rounded" :class="getPriorityColor(booking.activityWeight)">P{{ booking.activityWeight }}</span>
                </td>
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
import * as XLSX from 'xlsx'
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

const exportToExcel = () => {
  if (filteredBookings.value.length === 0) {
    alert('Tidak ada data untuk diexport.')
    return
  }

  // 1. Siapkan data baris (rows)
  const rows = filteredBookings.value.map((b, index) => ({
    'No': index + 1,
    'ID Peminjaman': b.id,
    'Nama Pemohon': b.user?.username || 'Anonim',
    'Email Pemohon': b.user?.email || '-',
    'Ruangan': b.room?.name || '-',
    'Kode Ruang': b.room?.code || '-',
    'Tanggal Peminjaman': b.bookingDate,
    'Jam Mulai': b.startTime,
    'Jam Selesai': b.endTime,
    'Tujuan / Kegiatan': b.purpose || '-',
    'Prioritas (Weight)': `P${b.activityWeight}`,
    'Status': b.status.toUpperCase(),
    'Tanggal Dibuat': new Date(b.createdAt).toLocaleString('id-ID')
  }))

  // 2. Buat worksheet dan workbook
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Peminjaman')

  // 3. Atur lebar kolom
  const wscols = [
    { wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, 
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 40 },
    { wch: 15 }, { wch: 15 }, { wch: 20 }
  ]
  worksheet['!cols'] = wscols

  // 4. Buat dan unduh file
  const fileName = `Laporan_Peminjaman_Fasilitas_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

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
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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
</style>
