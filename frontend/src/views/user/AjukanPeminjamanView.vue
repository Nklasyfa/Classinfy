<template>
  <div class="font-body text-on-surface min-h-screen relative overflow-x-hidden bg-background">
    <!-- Grid Overlay -->
    <div class="fixed inset-0 bg-grid pointer-events-none"></div>

    <!-- Floating Pill Navbar -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1200px] h-[64px] px-8 flex items-center justify-between z-50 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div class="flex items-center gap-8">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-black text-primary tracking-tighter font-headline">CLASSINFY</span>
        <div class="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
          <router-link to="/" class="hover:text-primary transition-colors cursor-pointer">Monitoring</router-link>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-primary font-bold">Ajukan Peminjaman</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">{{ initials }}</div>
          <span class="text-sm font-semibold text-primary hidden sm:block">{{ authStore.user?.username || 'Guest' }}</span>
        </div>
      </div>
    </nav>

    <main class="pt-32 pb-24 px-4 max-w-[800px] mx-auto relative z-10">
      <!-- Header -->
      <header class="text-center mb-10">
        <h1 class="text-[40px] md:text-[48px] font-extrabold text-[#1A3C6E] tracking-tight mb-2">Ajukan Peminjaman Ruang</h1>
        <p class="text-slate-500 font-medium text-lg">Lengkapi detail kegiatan Anda untuk memproses peminjaman gedung.</p>
      </header>

      <!-- Step Indicator Pill Style -->
      <div class="flex items-center justify-center gap-4 mb-12">
        <div class="flex items-center gap-2 px-4 py-2 bg-[#D9E2FF] rounded-full text-primary font-bold text-sm">
          <span class="material-symbols-outlined text-lg fill-icon">check_circle</span>
          <span>Pilih Ruang</span>
        </div>
        <div class="h-[1px] w-12 bg-slate-300"></div>
        <div class="flex items-center gap-2 px-6 py-2.5 bg-[#1A3C6E] text-white rounded-full font-bold shadow-md">
          <span class="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center text-xs">2</span>
          <span>Detail Form</span>
        </div>
        <div class="h-[1px] w-12 bg-slate-300"></div>
        <div class="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-400 rounded-full text-slate-400 font-bold text-sm">
          <span class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">3</span>
          <span>Konfirmasi</span>
        </div>
      </div>

      <!-- Conflict Warning Banner -->
      <div v-if="hasConflict" class="mb-4 p-5 bg-[#FEF3C7] border border-[#F59E0B] rounded-[20px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
        <div class="flex items-center gap-4">
          <span class="material-symbols-outlined text-[#F59E0B] text-3xl">warning</span>
          <div class="flex flex-col">
            <p class="font-bold text-[#92400E]">Potensi Konflik Terdeteksi</p>
            <p class="text-[#B45309] text-sm">{{ conflictSubtitle }}</p>
          </div>
        </div>
      </div>

      <!-- User UI implementation -->
      <section class="bg-white rounded-[24px] p-6 mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-between gap-6 relative">
        <div class="flex flex-col sm:flex-row items-center gap-6 w-full">
          <div class="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0">
            <img alt="preview" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfRIB6-5ATscIZGnRwmzGYvhD0hocF-pV-bMzwHkX4DjoSKa47bkUlwKS28E0QXtTX8JDrlQlCNdrCs5i_X8HSNwOjjXvK7TEhup0LjfHHKWfix0sEReopW4ZcOlKBjKV_FW7da-q69WjA8av3y9_ncmKGE4neqpoPiMo3-hcNZ5DNAR5qZyHcmcK3UN31h3c6WlsnU2eUjqOe7I7BI0toYqSkp0Ikhac_oQzHrQ8LXcouJETPcv4YjCMrPK28JjMJhinqOEhuR8Q" />
          </div>
          <div class="flex-1 text-center sm:text-left">
            <div class="flex flex-col sm:flex-row items-center gap-3 mb-1 justify-center sm:justify-start">
              <h2 class="text-xl font-bold text-primary">{{ selectedRoomData?.code || 'Pilih Ruangan...' }}</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-500 flex items-center gap-1.5" :class="hasConflict ? 'text-red-600' : 'text-slate-500'">
                <span class="w-2 h-2 rounded-full" :class="hasConflict ? 'bg-red-500' : 'bg-green-500'"></span> {{ hasConflict ? 'Konflik' : 'Kosong' }}
              </span>
            </div>
            <div class="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                {{ form.bookingDate }}
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                {{ form.startTime }} - {{ form.endTime }} WIB
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">groups</span>
                Kapasitas: {{ selectedRoomData?.capacity || 40 }} Orang
              </div>
            </div>
          </div>
          <button @click="showModal = true" type="button" class="bg-[#D9E2FF] hover:bg-blue-100 text-[#1A3C6E] font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shrink-0 cursor-pointer">
            <span class="material-symbols-outlined text-lg">sync</span>
            Ganti Ruang
          </button>
        </div>
      </section>

      <!-- Main Form -->
      <form class="bg-white rounded-[32px] p-10 shadow-[0_8px_48px_rgba(0,0,0,0.06)] space-y-8" @submit.prevent="handleSubmit">
        <!-- Nama Kegiatan -->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-primary">Nama Kegiatan<span class="text-red-500">*</span></label>
          <input v-model="form.eventName" class="w-full h-14 bg-slate-50 border-none rounded-xl px-5 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Masukkan nama kegiatan..." type="text"/>
        </div>

        <!-- Kategori Kegiatan -->
        <div class="space-y-2 relative" @click="toggleDropdown">
          <label class="block text-sm font-bold text-primary">Kategori Kegiatan<span class="text-red-500">*</span></label>
          <button class="w-full h-14 bg-[#EFF4FF] rounded-xl px-5 flex items-center justify-between text-slate-700 font-medium border border-transparent hover:border-slate-200 transition-all cursor-pointer" type="button">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full" :class="getPriorityColor(form.activityWeight)"></span>
              {{ getPriorityLabel(form.activityWeight) }}
            </div>
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          
          <!-- Dropdown -->
          <div v-show="showDropdown" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20">
            <div class="p-2 space-y-1">
              <div @click.stop="submitPriority(5)" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" :class="{'bg-slate-50 text-primary font-bold': form.activityWeight===5}">
                <span class="w-2 h-2 rounded-full bg-red-600"></span><span class="text-sm border-0 m-0 leading-none">Priority 5: Tingkat Eksekutif/Rektorat</span>
              </div>
              <div @click.stop="submitPriority(4)" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" :class="{'bg-slate-50 text-primary font-bold': form.activityWeight===4}">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span><span class="text-sm border-0 m-0 leading-none">Priority 4: Kemahasiswaan & BEM Fakultas</span>
              </div>
              <div @click.stop="submitPriority(3)" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" :class="{'bg-slate-50 text-primary font-bold': form.activityWeight===3}">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="text-sm border-0 m-0 leading-none">Priority 3: Kegiatan Utama Mahasiswa (Seminar/Lomba)</span>
              </div>
              <div @click.stop="submitPriority(2)" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" :class="{'bg-slate-50 text-primary font-bold': form.activityWeight===2}">
                <span class="w-2 h-2 rounded-full bg-green-500"></span><span class="text-sm border-0 m-0 leading-none">Priority 2: Rapat Rutin UKM / HIMA</span>
              </div>
              <div @click.stop="submitPriority(1)" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" :class="{'bg-slate-50 text-primary font-bold': form.activityWeight===1}">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span><span class="text-sm border-0 m-0 leading-none">Priority 1: Kegiatan Lainnya (Reguler)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tujuan Penggunaan -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-bold text-primary">Tujuan Penggunaan<span class="text-red-500">*</span></label>
            <span class="text-[10px] font-bold text-slate-400">0/300</span>
          </div>
          <textarea v-model="form.purpose" class="w-full bg-slate-50 border-none rounded-xl p-5 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" placeholder="Jelaskan tujuan penggunaan ruang secara detail..." rows="4"></textarea>
        </div>

        <!-- Estimasi & PJ Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-primary">Estimasi Jumlah Peserta<span class="text-red-500">*</span></label>
            <div class="flex items-center bg-[#EFF4FF] rounded-xl h-14 p-1">
              <button @click="participantCount = Math.max(1, participantCount - 1)" class="w-12 h-12 flex items-center justify-center text-primary cursor-pointer hover:bg-white rounded-lg" type="button">
                <span class="material-symbols-outlined">remove</span>
              </button>
              <input v-model="participantCount" class="flex-1 bg-transparent border-none text-center font-bold text-primary focus:ring-0" type="number"/>
              <button @click="participantCount++" class="w-12 h-12 flex items-center justify-center text-primary cursor-pointer hover:bg-white rounded-lg" type="button">
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-primary">Penanggung Jawab<span class="text-red-500">*</span></label>
            <div class="h-14 bg-slate-50 rounded-xl px-5 flex items-center text-slate-500 font-semibold border border-transparent">
              {{ authStore.user?.username || 'Guest' }}
            </div>
          </div>
        </div>

        <!-- Nomor Kontak -->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-primary">Nomor Kontak (WhatsApp)<span class="text-red-500">*</span></label>
          <div class="flex h-14 bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent">
            <div class="px-4 flex items-center justify-center bg-[#D9E2FF] font-bold text-primary text-sm">
              +62
            </div>
            <input class="flex-1 bg-transparent border-none px-5 font-medium text-slate-700 outline-none" placeholder="812 3456 7890" type="tel"/>
          </div>
        </div>

        <!-- Lampiran -->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-primary">Lampiran (Proposal/Surat Izin)</label>
          <div class="border-2 border-dashed border-[#C8D5E8] rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-[#EFF4FF] hover:bg-slate-50 transition-all cursor-pointer relative">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <span class="material-symbols-outlined">cloud_upload</span>
            </div>
            <div class="text-center">
              <p class="text-sm font-bold text-primary">Klik atau seret file ke sini</p>
              <p class="text-[11px] text-slate-400 font-medium">PDF, JPG, atau PNG (Maks. 5MB)</p>
            </div>
            <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-100">
          <button @click="router.push('/')" class="flex-1 h-14 rounded-full border-2 border-primary text-primary font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer" type="button">
            <span class="material-symbols-outlined">arrow_back</span>
            Kembali
          </button>
          <button :disabled="isSubmitting" class="flex-[1.5] h-14 rounded-full bg-secondary text-white font-bold shadow-lg hover:bg-primary disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer" type="submit">
            {{ isSubmitting ? 'Memproses...' : 'Lanjut ke Konfirmasi' }}
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </main>

    <!-- Modal Ganti Ruang -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-primary">Pilih Ruang & Waktu</h3>
          <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-bold text-primary mb-2">Pilih Ruangan</label>
            <select v-model="form.roomId" class="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option v-for="room in rooms" :key="room.id" :value="room.id">
                {{ room.code }} - {{ room.name }} (Kap: {{ room.capacity }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-primary mb-2">Tanggal Peminjaman</label>
            <input type="date" v-model="form.bookingDate" class="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-primary mb-2">Waktu Mulai</label>
              <input type="time" v-model="form.startTime" class="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-bold text-primary mb-2">Waktu Selesai</label>
              <input type="time" v-model="form.endTime" class="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
            </div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-6 py-2.5 rounded-full text-slate-500 font-bold hover:bg-slate-200 transition-colors cursor-pointer">Batal</button>
          <button @click="showModal = false" class="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-blue-900 transition-colors shadow-md cursor-pointer">Konfirmasi</button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="w-full py-12 flex flex-col items-center justify-center gap-4 bg-transparent relative z-10">
      <div class="flex items-center gap-6 font-semibold text-slate-400 text-sm">
        <a class="hover:text-primary transition-colors cursor-pointer" href="#">Terms of Service</a>
        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
        <a class="hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
        <a class="hover:text-primary transition-colors cursor-pointer" href="#">Campus Map</a>
      </div>
      <p class="text-slate-400 text-xs font-medium">© 2026 CLASSINFY UNESA. Digital Quad System.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Data
const rooms = ref([])
const showDropdown = ref(false)
const showModal = ref(false)
const participantCount = ref(40)

// Init Form
const dt = new Date()
dt.setDate(dt.getDate() + 1)

const form = ref({
  roomId: '',
  bookingDate: dt.toISOString().split('T')[0],
  startTime: '08:00',
  endTime: '10:00',
  eventName: '',
  purpose: '',
  activityWeight: 2
})

// Validation State
const hasConflict = ref(false)
const conflictSubtitle = ref('')
const isChecking = ref(false)
const isSubmitting = ref(false)

const user = computed(() => authStore.user)
const initials = computed(() => {
  if (!user.value || !user.value.username) return 'U';
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
})

const selectedRoomData = computed(() => rooms.value.find(r => String(r.id) === String(form.value.roomId)))

// Priority Handling
const getPriorityLabel = (weight) => {
  switch(weight) {
    case 5: return "Priority 5: Tingkat Eksekutif/Rektorat";
    case 4: return "Priority 4: Kemahasiswaan & BEM Fakultas";
    case 3: return "Priority 3: Kegiatan Utama Mahasiswa (Seminar/Lomba)";
    case 2: return "Kegiatan Organisasi";
    case 1: return "Priority 1: Kegiatan Lainnya (Reguler)";
    default: return "Pilih Prioritas";
  }
}
const getPriorityColor = (weight) => {
  switch(weight) {
    case 5: return "bg-red-600";
    case 4: return "bg-orange-500";
    case 3: return "bg-amber-500";
    case 2: return "bg-red-500";
    case 1: return "bg-blue-400";
    default: return "bg-slate-300";
  }
}

const toggleDropdown = () => { showDropdown.value = !showDropdown.value }
const submitPriority = (weight) => {
  form.value.activityWeight = weight
  showDropdown.value = false
}

// Fetch Master Ruangan
const fetchRooms = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/rooms`, { headers: authStore.getAuthHeaders() })
    if (res.data.data) {
      rooms.value = res.data.data
    }
  } catch (err) {
    console.error('Failed fetching rooms', err)
  } finally {
    if (rooms.value.length > 0 && !form.value.roomId) {
      form.value.roomId = rooms.value[0].id
    }
  }
}

// Check Conflict with API
const checkConflict = async () => {
  if (!form.value.roomId || !form.value.bookingDate || !form.value.startTime || !form.value.endTime) return
  isChecking.value = true
  hasConflict.value = false
  
  try {
    const res = await axios.post(`${API_URL}/api/bookings/check-conflict`, {
      roomId: form.value.roomId,
      bookingDate: form.value.bookingDate,
      startTime: form.value.startTime,
      endTime: form.value.endTime
    }, { headers: authStore.getAuthHeaders() })
    
    if (res.data.status === 'conflict') {
      hasConflict.value = true
      conflictSubtitle.value = res.data.message || 'Slot yang diajukan bertabrakan dengan jadwal.'
    }
  } catch (err) {
    console.warn('Conflict checker error:', err)
  } finally {
    isChecking.value = false
  }
}

watch(() => [form.value.roomId, form.value.bookingDate, form.value.startTime, form.value.endTime], () => {
  if(form.value.startTime >= form.value.endTime) {
    form.value.endTime = `${String(Number(form.value.startTime.split(':')[0]) + 1).padStart(2,'0')}:00`
  }
  checkConflict()
})

const handleSubmit = async () => {
  if (!form.value.eventName.trim() || !form.value.purpose.trim()) {
    return alert('Nama kegiatan dan tujuan penggunaan harus diisi.')
  }
  isSubmitting.value = true
  
  try {
    const payload = {
      ...form.value,
      purpose: `${form.value.eventName} - ${form.value.purpose}`
    }
    await axios.post(`${API_URL}/api/bookings`, payload, { headers: authStore.getAuthHeaders() })
    alert('Permohonan berhasil diajukan! Anda dapat memantau status pada Dashboard Anda.')
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.status === 409) {
      alert(`Gagal! ${err.response.data.message}`)
    } else {
      alert(err.response?.data?.message || 'Gagal mengajukan permohonan. (Mungkin Dummy ID tidak valid di backend nyata)')
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.bg-grid {
    background-image: 
        linear-gradient(to right, rgba(200, 213, 232, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 213, 232, 0.4) 1px, transparent 1px);
    background-size: 24px 24px;
}
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.editorial-border {
    border: 1px solid rgba(26,60,110,0.1);
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
