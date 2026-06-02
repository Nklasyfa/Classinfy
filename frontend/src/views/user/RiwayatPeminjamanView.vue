<template>
  <div class="min-h-screen font-body relative overflow-x-hidden bg-[#F0F4F8] text-[#0b1c30]">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <UserNavbar />

    <main class="relative z-10 pt-28 pb-20 px-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-[#1A3C6E] tracking-tight mb-1">Riwayat Peminjaman</h1>
        <p class="text-slate-500 text-sm font-medium">Rekam jejak permohonan dan surat izin kegiatan Anda.</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,60,110,0.04)] border border-slate-100 overflow-hidden">
        <div class="p-8">
          <div v-if="isLoadingBookings" class="text-center py-16 text-slate-400">
            <span class="material-symbols-outlined animate-spin mb-3 block text-3xl">sync</span>
            <p class="text-sm font-semibold">Memuat riwayat peminjaman...</p>
          </div>
          <div v-else-if="myBookings.length === 0" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            <span class="material-symbols-outlined text-5xl mb-3 block opacity-50">history</span>
            <p class="text-sm font-semibold">Belum ada riwayat peminjaman.</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="booking in myBookings" :key="booking.id" class="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-extrabold text-base text-[#1A3C6E]">{{ booking.room?.name || 'Ruang' }}</h4>
                  <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">{{ new Date(booking.bookingDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) }} • {{ booking.startTime.slice(0,5) }} - {{ booking.endTime.slice(0,5) }}</p>
                </div>
                <span :class="getStatusPill(booking.status).class" class="px-3 py-1.5 rounded-full font-extrabold text-[10px] uppercase border">{{ getStatusPill(booking.status).label }}</span>
              </div>
              <div class="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span class="font-extrabold block text-[#1A3C6E] mb-1">Tujuan Kegiatan:</span> 
                {{ booking.purpose.split('|')[0] }}
              </div>
              <!-- Admin Attachment (Surat Izin) -->
              <div v-if="booking.adminAttachmentUrl" class="mt-2 pt-4 border-t border-slate-200 flex justify-end">
                <a :href="API_URL + booking.adminAttachmentUrl" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm">
                  <span class="material-symbols-outlined text-base">download</span>
                  Unduh Surat Izin / Bukti Terima
                </a>
              </div>
              <!-- Rejection Reason -->
              <div v-if="booking.status === 'rejected' && booking.rejectionReason" class="mt-2 pt-4 border-t border-slate-200">
                <p class="text-xs text-red-600 font-medium bg-red-50 p-4 rounded-xl border border-red-100"><span class="font-bold block mb-1">Alasan ditolak:</span> {{ booking.rejectionReason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'
import UserNavbar from '../../components/layout/UserNavbar.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const myBookings = ref([])
const isLoadingBookings = ref(false)

const fetchMyBookings = async () => {
  isLoadingBookings.value = true
  try {
    const res = await axios.get(`${API_URL}/api/bookings/me`, { headers: authStore.getAuthHeaders() })
    myBookings.value = res.data.data || []
  } catch (error) {
    console.error('Failed fetching bookings', error)
  } finally {
    isLoadingBookings.value = false
  }
}

const getStatusPill = (status) => {
  switch(status) {
    case 'approved': return { label: 'Disetujui', class: 'bg-green-100 text-green-700 border-green-200' }
    case 'pending': return { label: 'Menunggu', class: 'bg-amber-100 text-amber-700 border-amber-200' }
    case 'rejected': return { label: 'Ditolak', class: 'bg-red-100 text-red-700 border-red-200' }
    case 'cancelled': return { label: 'Dibatalkan', class: 'bg-slate-100 text-slate-600 border-slate-200' }
    case 'needs_negotiation': return { label: 'Negosiasi', class: 'bg-purple-100 text-purple-700 border-purple-200' }
    case 'rescheduled': return { label: 'Jadwal Ulang', class: 'bg-blue-100 text-blue-700 border-blue-200' }
    default: return { label: status, class: 'bg-slate-100 text-slate-600' }
  }
}

onMounted(() => {
  fetchMyBookings()
})
</script>
