<template>
  <div class="bg-[#F0F4F8] grid-texture font-body text-on-surface min-h-screen pb-20">
    <!-- TopNavBar -->
    <nav class="fixed top-4 left-1/2 -translate-x-1/2 w-[900px] max-w-[95%] rounded-full flex items-center justify-between px-6 py-2 z-50 shadow-[0_8px_32px_rgba(26,60,110,0.06)] bg-white/80 backdrop-blur-[20px]">
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-2xl font-extrabold text-blue-900 tracking-tight cursor-pointer hover:text-blue-700 transition-colors">CLASSINFY</router-link>
        <div class="hidden md:flex items-center gap-1">
          <router-link to="/" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Monitoring</router-link>
          <router-link to="/admin/dashboard" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Dashboard</router-link>
          <router-link to="/admin/fasilitas" class="text-slate-600 hover:text-blue-900 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors">Fasilitas</router-link>
          <router-link to="/admin/permohonan" class="bg-blue-900 text-white rounded-full px-4 py-1.5 transition-all text-sm font-medium cursor-pointer shadow-sm">Permohonan</router-link>
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
          >
            {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 pt-32 space-y-8">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-16 flex flex-col items-center justify-center gap-4">
        <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        <p class="text-on-surface-variant font-medium">Memuat detail permohonan...</p>
      </div>
      
      <!-- Not Found State -->
      <div v-else-if="!booking" class="p-16 flex flex-col items-center justify-center gap-4 bg-white rounded-xl shadow-sm text-center">
        <span class="material-symbols-outlined text-4xl text-outline">error</span>
        <p class="text-on-surface-variant font-bold text-xl">Permohonan tidak ditemukan</p>
        <button @click="router.push('/admin/permohonan')" class="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-md cursor-pointer">Kembali ke Antrian</button>
      </div>

      <div v-else>
        <!-- Breadcrumb & Header -->
        <div class="flex flex-col gap-2 mb-8">
          <nav class="flex items-center gap-2 text-sm font-label text-slate-500">
            <router-link to="/admin/permohonan" class="hover:text-primary transition-colors cursor-pointer">Permohonan</router-link>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-secondary font-semibold">Detail #{{ booking.id.substring(0,8) }}</span>
          </nav>
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <h1 class="text-4xl font-extrabold text-primary tracking-tight">Detail Permohonan Ruang</h1>
             <span class="px-4 py-1 rounded-full text-xs font-bold uppercase w-fit" :class="getStatusPillClass(booking.status)">
               Status: {{ getStatusString(booking.status) }}
             </span>
          </div>
        </div>

        <!-- Conflict Banner -->
        <div v-if="booking.status === 'needs_negotiation'" class="mb-8 w-full bg-[#FEF2F2] border-y-2 border-x-0 md:border-x-2 md:rounded-xl border-[#DC2626] p-5 flex items-center gap-4 animate-pulse">
          <div class="bg-[#DC2626] text-white p-2 rounded-lg flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined">warning</span>
          </div>
          <div>
            <h3 class="font-bold text-[#DC2626] tracking-tight">⚠️ KONFLIK JADWAL TERDETEKSI</h3>
            <p class="text-sm text-[#991B1B]">Sistem mendeteksi adanya status "Needs Negotiation" atau tumpang tindih waktu untuk Ruang {{ booking.room?.name }}.</p>
          </div>
        </div>

        <!-- Main Content Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          <!-- Left Column (60%) -->
          <div class="lg:col-span-6 space-y-8">
            <!-- Detail Card -->
            <div class="bg-surface-container-lowest rounded-lg p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-16 -mt-16 bg-primary rounded-full"></div>
              <h2 class="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">assignment</span>
                Informasi Pengajuan
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div>
                  <p class="text-xs font-label text-slate-400 uppercase tracking-widest mb-1">Pemohon</p>
                  <div class="flex items-center gap-3 mt-2">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">
                      {{ booking.user?.username?.substring(0,2).toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <p class="font-bold text-on-surface">{{ booking.user?.username || 'User' }}</p>
                      <p class="text-xs text-slate-500">{{ booking.user?.email || '-' }}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p class="text-xs font-label text-slate-400 uppercase tracking-widest mb-1">Ruangan</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="bg-primary-container text-white px-3 py-1 rounded-lg font-bold text-sm">{{ booking.room?.code }}</span>
                    <span class="text-sm text-slate-600 font-medium truncate max-w-[150px]">{{ booking.room?.name }}</span>
                  </div>
                </div>
                
                <div>
                  <p class="text-xs font-label text-slate-400 uppercase tracking-widest mb-1">Waktu Pelaksanaan</p>
                  <p class="font-bold text-on-surface flex items-center gap-2 mt-2">
                    <span class="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                    {{ formatDate(booking.bookingDate) }}, {{ booking.startTime.slice(0,5) }} - {{ booking.endTime.slice(0,5) }} WIB
                  </p>
                </div>
                
                <div>
                  <p class="text-xs font-label text-slate-400 uppercase tracking-widest mb-1">Prioritas</p>
                  <div class="mt-2">
                    <span class="inline-block px-3 py-1 rounded-full text-white text-xs font-bold" :class="getPriorityColor(booking.activityWeight)">
                      Priority {{ booking.activityWeight }}
                    </span>
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <p class="text-xs font-label text-slate-400 uppercase tracking-widest mb-2">Tujuan Penggunaan (Notes)</p>
                  <p class="text-on-surface leading-relaxed italic text-sm border-l-4 border-primary/20 pl-4 py-1">
                    "{{ booking.purpose }}"
                  </p>
                </div>
              </div>
            </div>

            <!-- Status History -->
            <div class="bg-surface-container-lowest rounded-lg p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
              <h2 class="text-xl font-bold text-primary mb-6">Riwayat Sistem</h2>
              <div class="space-y-8 relative">
                <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                
                <!-- History Item 1: Dibuat -->
                <div class="relative pl-10">
                  <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center z-10">
                    <span class="material-symbols-outlined text-slate-600 text-[14px]">file_present</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400">{{ formatDateTime(booking.createdAt) }}</span>
                    <p class="font-bold text-primary">Permohonan Berhasil Diinput</p>
                    <p class="text-sm text-slate-500 mt-1">Sistem menerima pengajuan peminjaman dari pemohon.</p>
                  </div>
                </div>

                <!-- History Item 2: Konflik/Pending -->
                <div v-if="booking.status === 'needs_negotiation'" class="relative pl-10">
                  <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-error-container flex items-center justify-center z-10">
                    <span class="material-symbols-outlined text-error text-[14px]">warning</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400">{{ formatDateTime(booking.updatedAt) }}</span>
                    <p class="font-bold text-error">Sistem Mengindikasi Konflik</p>
                    <p class="text-sm text-slate-500 mt-1">Dialihkan ke mode negosiasi karena tumpang tindih waktu.</p>
                  </div>
                </div>
                
                <div v-if="booking.status === 'approved'" class="relative pl-10">
                  <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center z-10">
                    <span class="material-symbols-outlined text-white text-[14px]">check_circle</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400">{{ formatDateTime(booking.updatedAt) }}</span>
                    <p class="font-bold text-green-600">Disetujui Admin</p>
                    <p class="text-sm text-slate-500 mt-1">Permohonan disetujui. Ruangan dapat digunakan secara sah.</p>
                  </div>
                </div>

                <div v-if="booking.status === 'rejected'" class="relative pl-10">
                  <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center z-10">
                    <span class="material-symbols-outlined text-white text-[14px]">cancel</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400">{{ formatDateTime(booking.updatedAt) }}</span>
                    <p class="font-bold text-[#DC2626]">Ditolak Admin</p>
                    <p class="text-sm text-[#991B1B] mt-1">{{ booking.rejectionReason || 'Ditolak karena tidak sesuai syarat.' }}</p>
                  </div>
                </div>

                <div v-if="booking.adminNotes" class="relative pl-10">
                  <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center z-10">
                    <span class="material-symbols-outlined text-white text-[14px]">forum</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400">{{ formatDateTime(booking.updatedAt) }}</span>
                    <p class="font-bold text-[#7C3AED]">Pesan Negosiasi Baru Dari Admin</p>
                    <p class="text-sm text-slate-700 italic border-l-2 border-[#7C3AED] pl-2 mt-1">{{ booking.adminNotes }}</p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          <!-- Right Column (40%) -->
          <div class="lg:col-span-4 space-y-8">
            <!-- Action Card -->
            <div class="bg-surface-container-lowest border-2 border-primary rounded-lg p-6 shadow-xl relative" v-if="booking.status === 'pending' || booking.status === 'needs_negotiation'">
              <div class="absolute -top-4 left-6 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold">⚡ Tindakan Admin</div>
              <h3 class="text-lg font-bold text-primary mb-4 mt-2">Keputusan Akhir</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Catatan Peninjauan</label>
                  <textarea v-model="adminNotes" class="w-full bg-surface-container-low border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[120px] outline-none" placeholder="Berikan alasan penolakan atau pesan negosiasi (khusus Nego/Reject)..."></textarea>
                </div>
                <div class="grid grid-cols-1 gap-3 pt-4">
                  <button @click="updateStatus('approved')" :disabled="isProcessing" class="w-full bg-[#16A34A] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer">
                    <span class="material-symbols-outlined">verified</span>
                    Approve Request
                  </button>
                  <button @click="updateStatus('rejected')" :disabled="isProcessing" class="w-full bg-[#DC2626] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer">
                    <span class="material-symbols-outlined">cancel</span>
                    Reject Request
                  </button>
                  <button v-if="booking.status === 'pending'" @click="negotiate()" :disabled="isProcessing" class="w-full bg-[#7C3AED] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer">
                    <span class="material-symbols-outlined">forum</span>
                    Negotiate (Nego)
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Info Card -->
            <div class="bg-[#EFF6FF] rounded-lg p-6 border-l-4 border-secondary shadow-sm">
              <h4 class="font-bold text-secondary flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-[20px]">info</span>
                Panduan Peninjauan
              </h4>
              <ul class="text-sm text-slate-600 space-y-3 font-medium">
                <li class="flex gap-2">
                  <span class="text-secondary">•</span>
                  Prioritas 5 merupakan hak Rektorat untuk override jadwal lain.
                </li>
                <li class="flex gap-2">
                  <span class="text-secondary">•</span>
                  Jika terdapat konflik, Anda dapat mereject dengan "Catatan Peninjauan".
                </li>
                <li class="flex gap-2">
                  <span class="text-secondary">•</span>
                  Gunakan "Negotiate" (jika masih Pending) agar Mahasiswa bisa merevisi waktu pinjam.
                </li>
              </ul>
            </div>
            
            <!-- Decorative Logo -->
            <div class="relative h-32 flex items-center justify-center group pointer-events-none mt-8">
              <div class="absolute w-full h-full bg-primary/5 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform"></div>
              <span class="text-[#1A3C6E]/20 font-extrabold text-5xl">CLASSINFY</span>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons at bottom -->
        <div class="flex items-center justify-between py-12 border-t border-slate-200 mt-12 w-full">
          <button @click="router.push('/admin/permohonan')" class="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors cursor-pointer">
            <span class="material-symbols-outlined">arrow_back</span>
            Kembali ke Antrian
          </button>
        </div>
      </div>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// State
const booking = ref(null)
const isLoading = ref(true)
const isProcessing = ref(false)
const adminNotes = ref('')

const fetchBookingDetail = async () => {
  try {
    isLoading.value = true
    const { id } = route.params
    const res = await axios.get(`${API_URL}/api/bookings/${id}`, { headers: authStore.getAuthHeaders() })
    booking.value = res.data.data
  } catch (err) {
    console.error('Failed fetching detail permohonan', err)
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (status) => {
  if (status === 'rejected' && (!adminNotes.value || adminNotes.value.trim() === '')) {
    return alert('Harap berikan Catatan Peninjauan mengapa permohonan ini ditolak.')
  }
  
  if (!confirm(`Apakah Anda yakin ingin memproses status ini menjadi: ${status.toUpperCase()}?`)) return;

  isProcessing.value = true
  try {
    const { id } = route.params
    const res = await axios.patch(`${API_URL}/api/bookings/${id}/status`, {
      status,
      rejectionReason: adminNotes.value
    }, { headers: authStore.getAuthHeaders() })
    
    alert(`Sukses: ${res.data.message}`)
    await fetchBookingDetail()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengupdate status.')
  } finally {
    isProcessing.value = false
  }
}

const negotiate = async () => {
  if (!adminNotes.value || adminNotes.value.trim() === '') {
    return alert('Harap berikan rekomendasi negosiasi di kolom Catatan Peninjauan.')
  }

  if (!confirm('Pindah ke status Negotiate dan kirimkan rekomendasi ini ke pemohon?')) return;

  isProcessing.value = true
  try {
    const { id } = route.params
    const res = await axios.patch(`${API_URL}/api/bookings/${id}/negotiate`, {
      adminNotes: adminNotes.value
    }, { headers: authStore.getAuthHeaders() })
    
    alert(`Sukses: ${res.data.message}`)
    await fetchBookingDetail()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengirim negosiasi.')
  } finally {
    isProcessing.value = false
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(() => {
  fetchBookingDetail()
})

// === UI Helpers ===
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
  if (status === 'needs_negotiation') return 'Konflik / Negosiasi'
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
