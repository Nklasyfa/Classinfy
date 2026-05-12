<template>
  <div class="bg-[#F0F4F8] font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Background Layering -->
    <div class="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0"></div>

    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-6 pointer-events-none">
      <div class="bg-white/80 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(26,60,110,0.06)] h-[60px] max-w-[900px] w-full flex items-center justify-between px-6 pointer-events-auto">
        <router-link to="/" class="flex items-center gap-2 cursor-pointer group">
          <span class="material-symbols-outlined text-primary text-2xl group-hover:text-secondary transition-colors" style="font-variation-settings: 'FILL' 1;">school</span>
          <span class="font-extrabold text-primary tracking-tighter text-xl group-hover:text-secondary transition-colors">CLASSINFY</span>
        </router-link>
        
        <div class="hidden md:flex items-center gap-2 pointer-events-auto">
          <router-link to="/" class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300">Monitoring</router-link>
          <a class="bg-[#1A3C6E] text-white rounded-full px-6 py-2 font-medium text-sm tracking-tight transition-all duration-300 scale-105" href="#">Dashboard</a>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Jadwal Saya</a>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Riwayat</a>
        </div>
        
        <div class="flex items-center gap-4">
          <button class="relative p-2 text-primary/70 hover:scale-110 transition-transform">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          
          <div class="flex items-center gap-2 pl-2 cursor-pointer group relative" @click="handleLogout">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm editorial-shadow transition-transform group-hover:scale-105">
              {{ initials }}
            </div>
            <!-- Logout tooltip hint -->
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
        <div class="bg-surface-container-lowest editorial-shadow rounded-full px-8 py-4 flex flex-col md:flex-row items-center gap-6 max-w-2xl w-full">
          <div class="w-16 h-16 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xl font-bold editorial-shadow">
            {{ initials }}
          </div>
          <div class="text-left flex-1 text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Selamat datang, {{ user?.username || 'Budi Santoso' }} 👋</h1>
            <p class="text-on-surface-variant font-medium text-sm">Role: {{ user?.role?.name || 'Penanggung Jawab Mata Kuliah' }}</p>
          </div>
          <div class="bg-surface-container-high text-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap mt-4 md:mt-0">
            {{ currentDate }}
          </div>
        </div>
      </section>

      <!-- Summary Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-orange-50 rounded-lg"><span class="material-symbols-outlined text-orange-600">pending_actions</span></div>
            <span class="text-orange-600 font-bold text-sm">{{ pendingCount }}</span>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Menunggu Review</h3>
          <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-orange-600">{{ pendingCount }}</span><span class="text-orange-600/60 font-semibold text-sm">permohonan</span></div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-purple-50 rounded-lg"><span class="material-symbols-outlined text-purple-600">forum</span></div>
            <span class="text-purple-600 font-bold text-sm">{{ negotiationCount }}</span>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Perlu Respons Nego</h3>
          <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-purple-600">{{ negotiationCount }}</span><span class="text-purple-600/60 font-semibold text-sm">menunggu</span></div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-green-50 rounded-lg"><span class="material-symbols-outlined text-green-600">check_circle</span></div>
            <a class="text-primary font-bold text-sm group-hover:underline" href="#">Lihat →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Sudah Disetujui</h3>
          <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-extrabold text-green-600">{{ approvedCount }}</span><span class="text-green-600/60 font-semibold text-sm">booking</span></div>
        </div>
      </section>

      <!-- Negosiasi Alert Banner -->
      <section v-if="negotiationBookings.length > 0">
        <div v-for="nb in negotiationBookings" :key="nb.id" class="mb-4 p-5 bg-purple-50 border border-purple-200 rounded-xl flex flex-col md:flex-row md:items-center gap-4">
          <div class="bg-purple-500 text-white p-2 rounded-lg shrink-0"><span class="material-symbols-outlined">forum</span></div>
          <div class="flex-1">
            <p class="font-bold text-purple-800">❗ Admin Mengirim Rekomendasi Negosiasi</p>
            <p class="text-sm text-purple-700">Ruang {{ nb.room?.name }} &middot; {{ nb.bookingDate }} &middot; {{ nb.startTime?.slice(0,5) }}-{{ nb.endTime?.slice(0,5) }}</p>
            <p v-if="nb.adminNotes" class="text-sm italic text-slate-600 mt-1 border-l-2 border-purple-300 pl-2">"{{ nb.adminNotes }}"</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="respondNego(nb.id, 'accept')" :disabled="isResponding" class="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-50">
              ✅ Terima
            </button>
            <button @click="respondNego(nb.id, 'reject')" :disabled="isResponding" class="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50">
              ❌ Tolak
            </button>
          </div>
        </div>
      </section>

      <!-- My Bookings Table -->
      <section class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-visible">
        <div class="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">assignment</span>
            <h2 class="text-xl font-extrabold text-primary tracking-tight">Riwayat Permohonan Saya</h2>
          </div>
          <router-link to="/peminjaman" class="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition-all">
            <span class="material-symbols-outlined text-lg">add</span> Ajukan Baru
          </router-link>
        </div>
        <div class="overflow-x-auto pb-8">
          <div v-if="isLoading" class="p-12 text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl animate-spin">sync</span>
          </div>
          <table v-else class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="text-on-surface-variant/60 font-bold text-xs uppercase tracking-widest bg-surface-container-low/50">
                <th class="px-8 py-4">Ruang</th>
                <th class="px-6 py-4">Tanggal &amp; Waktu</th>
                <th class="px-6 py-4">Keperluan</th>
                <th class="px-6 py-4">Prioritas</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-if="myBookings.length === 0">
                <td colspan="5" class="px-8 py-12 text-center text-slate-400">Belum ada permohonan. <router-link to="/peminjaman" class="text-primary font-bold underline">Ajukan sekarang!</router-link></td>
              </tr>
              <tr v-else v-for="b in myBookings" :key="b.id" class="hover:bg-surface-container-low/30 transition-colors border-t border-primary/5">
                <td class="px-8 py-5 font-bold text-primary">{{ b.room?.code || '-' }}</td>
                <td class="px-6 py-5 text-on-surface-variant">
                  <p class="font-bold">{{ formatDate(b.bookingDate) }}</p>
                  <p class="text-xs text-slate-400">{{ b.startTime?.slice(0,5) }} - {{ b.endTime?.slice(0,5) }}</p>
                </td>
                <td class="px-6 py-5 max-w-[200px] truncate">{{ b.purpose }}</td>
                <td class="px-6 py-5">
                  <span class="inline-flex items-center gap-1 text-xs">
                    <span v-for="i in 5" :key="i" class="material-symbols-outlined text-sm" :class="i <= b.activityWeight ? 'text-amber-400' : 'text-slate-200'" :style="i <= b.activityWeight ? `font-variation-settings: 'FILL' 1` : ''">star</span>
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span :class="statusPillClass(b.status)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ statusLabel(b.status) }}
                  </span>
                  <p v-if="b.adminNotes && b.status === 'needs_negotiation'" class="text-[10px] text-purple-600 mt-1 italic">Cek panel negosiasi di atas!</p>
                </td>
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
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Panduan PJ</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Bantuan</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Kebijakan Privasi</a>
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
const myBookings = ref([])
const isLoading = ref(true)
const isResponding = ref(false)

const initials = computed(() => {
  if (!user.value || !user.value.username) return 'BS';
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
})

// Computed stats
const negotiationBookings = computed(() => myBookings.value.filter(b => b.status === 'needs_negotiation'))
const pendingCount = computed(() => myBookings.value.filter(b => b.status === 'pending').length)
const negotiationCount = computed(() => negotiationBookings.value.length)
const approvedCount = computed(() => myBookings.value.filter(b => b.status === 'approved').length)

const fetchMyBookings = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/api/bookings/me`, { headers: authStore.getAuthHeaders() })
    myBookings.value = res.data.data || []
  } catch (err) {
    console.error('Failed fetching bookings', err)
  } finally {
    isLoading.value = false
  }
}

// Sprint 4: Mahasiswa respond negosiasi
const respondNego = async (bookingId, response) => {
  const label = response === 'accept' ? 'MENERIMA' : 'MENOLAK'
  if (!confirm(`Apakah Anda yakin ingin ${label} rekomendasi negosiasi dari admin?`)) return

  isResponding.value = true
  try {
    const res = await axios.patch(`${API_URL}/api/bookings/${bookingId}/respond-negotiation`,
      { response },
      { headers: authStore.getAuthHeaders() }
    )
    alert(res.data.message)
    await fetchMyBookings()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal merespons negosiasi')
  } finally {
    isResponding.value = false
  }
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusLabel = (status) => {
  const map = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak', cancelled: 'Dibatalkan', needs_negotiation: 'Perlu Respons', rescheduled: 'Rescheduled' }
  return map[status] || status
}

const statusPillClass = (status) => {
  if (status === 'approved') return 'bg-green-50 text-green-600'
  if (status === 'rejected' || status === 'cancelled') return 'bg-slate-100 text-slate-500'
  if (status === 'needs_negotiation') return 'bg-purple-50 text-purple-700'
  if (status === 'rescheduled') return 'bg-sky-50 text-sky-700'
  return 'bg-amber-50 text-amber-700'
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(() => {
  fetchMyBookings()
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
