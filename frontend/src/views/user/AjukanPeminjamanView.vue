<template>
  <div class="bg-background font-body text-on-background min-h-screen relative overflow-x-hidden">
    <!-- Background Grid -->
    <div class="fixed inset-0 bg-grid pointer-events-none z-0"></div>

    <UserNavbar />

    <main class="pt-32 pb-24 px-4 max-w-[900px] mx-auto relative z-10">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-3 font-headline">Ajukan Peminjaman Ruang</h1>
        <p class="text-slate-500 font-medium">Lengkapi detail kegiatan Anda untuk memproses peminjaman gedung.</p>
      </header>

      <!-- Step Indicator -->
      <div class="flex items-center justify-center gap-4 mb-12">
        <!-- Step 1 Done -->
        <div class="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full text-primary font-bold text-sm">
          <span class="material-symbols-outlined text-lg fill-icon">check_circle</span>
          <span>Pilih Ruang</span>
        </div>
        <div class="h-[2px] w-8 bg-surface-container-highest"></div>
        <!-- Step 2 Active -->
        <div class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg scale-105">
          <span class="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center text-xs">2</span>
          <span>Detail Form</span>
        </div>
        <div class="h-[2px] w-8 bg-surface-container-highest"></div>
        <!-- Step 3 Upcoming -->
        <div class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-outline-variant rounded-full text-slate-400 font-bold text-sm">
          <span class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">3</span>
          <span>Konfirmasi</span>
        </div>
      </div>

      <!-- Selected Room Summary -->
      <section class="bg-surface-container-lowest rounded-[20px] p-6 mb-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex flex-col sm:flex-row gap-6 w-full">
          <div class="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary overflow-hidden shrink-0">
            <span class="material-symbols-outlined text-4xl">meeting_room</span>
          </div>
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 class="text-xl font-extrabold text-primary">{{ selectedRoomData?.code || 'Pilih Ruangan...' }}</h2>
              <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-low border border-dashed flex items-center gap-1.5 w-fit transition-colors"
                :class="hasConflict ? 'border-red-300 text-red-600 bg-red-50' : 'border-outline-variant text-on-surface-variant'">
                <span class="w-2 h-2 rounded-full transition-colors" :class="hasConflict ? 'bg-red-500 animate-pulse' : 'bg-green-500'"></span> 
                {{ hasConflict ? 'TIDAK TERSEDIA' : 'Kosong' }}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">calendar_today</span>
                {{ formatDateIndo(form.bookingDate) }}
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">schedule</span>
                {{ form.startTime }} - {{ form.endTime }} WIB
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">groups</span>
                Kapasitas: {{ selectedRoomData?.capacity || 40 }} Orang
              </div>
            </div>
          </div>
        </div>
        <button @click="showModal = true" type="button" class="bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold px-6 py-3 rounded-[12px] transition-all flex items-center gap-2 text-sm active:scale-95 shrink-0 cursor-pointer w-full md:w-auto justify-center">
          <span class="material-symbols-outlined text-lg">sync</span>
          Ganti Ruang
        </button>
      </section>

      <!-- Conflict Warning Banner (Detection Detail) -->
      <div v-if="hasConflict" class="mb-8 p-6 bg-[#FEF3C7] border border-[#F59E0B] rounded-[20px] shadow-sm flex flex-col gap-6 animate-fade-in-up">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <span class="material-symbols-outlined text-[#F59E0B] text-3xl mt-0.5">warning</span>
            <div class="flex flex-col">
              <p class="font-bold text-[#92400E]">Potensi Konflik Terdeteksi</p>
              <p class="text-[#B45309] text-sm">{{ conflictSubtitle }}</p>
            </div>
          </div>
          <div class="flex gap-3 shrink-0">
            <button @click.prevent="scrollToSubmit" type="button" class="px-5 py-2.5 rounded-full bg-[#F59E0B] text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer">Tetap Lanjutkan</button>
            <button @click.prevent="showModal = true" type="button" class="px-5 py-2.5 rounded-full bg-white text-[#F59E0B] border border-[#F59E0B] font-bold text-sm hover:bg-[#FFFBEB] transition-colors cursor-pointer">Pilih Waktu Lain</button>
          </div>
        </div>

        <!-- Conflicting Schedules/Bookings -->
        <div class="space-y-2">
          <div v-for="(item, idx) in conflictsList" :key="idx" class="bg-white border border-[#FDE68A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider" 
                  :class="item.type === 'schedule' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'">
                  {{ item.type === 'schedule' ? 'Akademik' : 'Peminjaman' }}
                </span>
                <span class="font-extrabold text-slate-800 text-xs truncate">
                  {{ item.type === 'schedule' ? item.detail.activity : item.detail.purpose }}
                </span>
              </div>
              <p class="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">schedule</span>
                {{ item.detail.startTime }} - {{ item.detail.endTime }} WIB
              </p>
            </div>
            <div v-if="item.type === 'booking'" class="text-right shrink-0">
              <span class="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Oleh: {{ item.detail.bookedBy?.username || 'User' }}</span>
              <div class="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full inline-block">Tier {{ item.detail.activityWeight }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form Card -->
      <form @submit.prevent="handleSubmit" class="bg-surface-container-lowest rounded-[24px] p-8 shadow-[0_8px_32px_rgba(26,60,110,0.06)] max-w-[720px] mx-auto space-y-8">
        
        <!-- Nama Kegiatan -->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-primary px-1">Nama Kegiatan<span class="text-error">*</span></label>
          <input v-model="form.eventName" class="w-full h-14 bg-surface-container-low border-none rounded-[12px] px-5 font-medium text-on-surface focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none" placeholder="Masukkan nama kegiatan..." type="text"/>
        </div>

        <!-- Kategori Kegiatan -->
        <div class="space-y-2 relative">
          <label class="block text-sm font-bold text-primary px-1">Kategori Kegiatan<span class="text-error">*</span></label>
          <div class="relative group">
            <button @click="toggleDropdown" class="w-full h-14 bg-surface-container-low rounded-[12px] px-5 flex items-center justify-between text-on-surface font-medium hover:bg-surface-container-high transition-colors cursor-pointer" type="button">
              <div class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full" :class="getPriorityColor(form.activityWeight)"></span>
                {{ getPriorityLabel(form.activityWeight) }}
              </div>
              <span class="material-symbols-outlined">expand_more</span>
            </button>
            <div v-show="showDropdown" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-surface-container-low overflow-hidden z-20">
              <div class="p-2 space-y-1">
                <div @click="submitPriority(1)" class="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-xl cursor-pointer" :class="{'bg-surface-container-low text-primary font-bold': form.activityWeight===1}">
                  <span class="w-2 h-2 rounded-full bg-red-600"></span><span class="text-sm font-semibold">Priority 1: Tingkat Eksekutif/Rektorat</span>
                </div>
                <div @click="submitPriority(2)" class="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-xl cursor-pointer" :class="{'bg-surface-container-low text-primary font-bold': form.activityWeight===2}">
                  <span class="w-2 h-2 rounded-full bg-orange-500"></span><span class="text-sm font-semibold">Priority 2: Event Seminar/Event</span>
                </div>
                <div @click="submitPriority(3)" class="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-xl cursor-pointer" :class="{'bg-surface-container-low text-primary font-bold': form.activityWeight===3}">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="text-sm font-semibold">Priority 3: Peminjaman Kelas untuk Matkul</span>
                </div>
                <div @click="submitPriority(4)" class="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-xl cursor-pointer" :class="{'bg-surface-container-low text-primary font-bold': form.activityWeight===4}">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span><span class="text-sm font-semibold">Priority 4: Rapat Organisasi Kemahasiswaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tujuan Penggunaan -->
        <div class="space-y-2">
          <div class="flex justify-between items-center px-1">
            <label class="block text-sm font-bold text-primary">Tujuan Penggunaan<span class="text-error">*</span></label>
            <span class="text-[10px] font-bold text-slate-400 font-label">{{ form.purpose.length }}/300</span>
          </div>
          <textarea v-model="form.purpose" maxlength="300" class="w-full bg-surface-container-low border-none rounded-[12px] p-5 font-medium text-on-surface focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none resize-none" placeholder="Jelaskan tujuan penggunaan ruang secara detail..." rows="4"></textarea>
        </div>

        <!-- Jurusan, Estimasi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-primary px-1">Estimasi Jumlah Peserta<span class="text-error">*</span></label>
            <div class="flex items-center bg-surface-container-low rounded-[12px] h-14 p-1 overflow-hidden">
              <button @click.prevent="participantCount = Math.max(1, participantCount - 1)" class="w-12 h-12 rounded-[10px] hover:bg-white flex items-center justify-center text-primary transition-all active:scale-90 cursor-pointer" type="button">
                <span class="material-symbols-outlined">remove</span>
              </button>
              <input v-model="participantCount" class="flex-1 bg-transparent border-none text-center font-extrabold text-primary focus:ring-0" type="number"/>
              <button @click.prevent="participantCount++" class="w-12 h-12 rounded-[10px] hover:bg-white flex items-center justify-center text-primary transition-all active:scale-90 cursor-pointer" type="button">
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          <div class="space-y-2 opacity-80">
            <label class="block text-sm font-bold text-primary px-1">Jurusan / Prodi<span class="text-error">*</span></label>
            <div class="h-14 bg-slate-200/50 rounded-[12px] px-5 flex items-center text-slate-600 font-bold border border-slate-200 cursor-not-allowed">
              {{ form.jurusan || 'Tidak Ada Prodi (Silakan hubungi Admin)' }}
            </div>
          </div>
        </div>

        <!-- Penanggung Jawab & Kontak -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 opacity-80">
            <label class="block text-sm font-bold text-primary px-1">Penanggung Jawab<span class="text-error">*</span></label>
            <div class="h-14 bg-slate-200/50 rounded-[12px] px-5 flex items-center text-slate-600 font-bold border border-slate-200 cursor-not-allowed">
                {{ authStore.user?.username || 'Guest' }}
            </div>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-primary px-1">Nomor Kontak (WhatsApp)<span class="text-error">*</span></label>
            <div class="flex h-14 bg-surface-container-low rounded-[12px] overflow-hidden focus-within:ring-2 focus-within:ring-primary-fixed-dim transition-all">
              <div class="px-4 flex items-center justify-center bg-surface-container-high border-r border-white font-bold text-primary text-sm">
                  +62
              </div>
              <input v-model="whatsappNumber" class="flex-1 bg-transparent border-none px-5 font-medium text-on-surface outline-none" placeholder="812 3456 7890" type="tel"/>
            </div>
          </div>
        </div>

        <!-- Lampiran -->
        <div class="space-y-2">
          <div class="flex justify-between items-center px-1">
            <label class="block text-sm font-bold text-primary">Lampiran (Proposal/Surat Izin)</label>
            <a 
              href="https://docs.google.com/document/d/1FQ6nvWvd6IeXjMnQ2LjnhUd3PFgdVoAh/edit" 
              target="_blank" 
              class="text-xs font-bold text-[#1A3C6E] hover:underline flex items-center gap-1 bg-[#1A3C6E]/5 px-2.5 py-1 rounded-full cursor-pointer transition-all hover:bg-[#1A3C6E]/10"
            >
              <span class="material-symbols-outlined text-[14px]">download</span>
              Unduh Template Surat Izin
            </a>
          </div>
          <div class="group relative border-2 border-dashed border-outline-variant rounded-[12px] p-8 flex flex-col items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container-high hover:border-primary transition-all cursor-pointer">
            <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined" :class="uploadedFile ? 'text-green-600' : 'text-primary'">{{ uploadedFile ? 'check_circle' : 'cloud_upload' }}</span>
            </div>
            <div class="text-center">
              <p class="text-sm font-bold text-primary">{{ uploadedFile ? uploadedFile.name : 'Klik atau seret file ke sini' }}</p>
              <p class="text-xs text-slate-500 font-medium">{{ uploadedFile ? `Berhasil diunggah (${(uploadedFile.size/1024/1024).toFixed(2)} MB)` : 'PDF, JPG, atau PNG (Maks. 5MB)' }}</p>
            </div>
            <input type="file" @change="onFileChange" class="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png"/>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-6 flex flex-col-reverse sm:flex-row gap-4">
          <button @click="router.push('/')" class="flex-1 h-14 rounded-full border-2 border-primary text-primary font-extrabold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer" type="button">
            <span class="material-symbols-outlined">arrow_back</span>
            Kembali
          </button>
          <button :disabled="isSubmitting" class="flex-[1.5] h-14 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold shadow-[0_8px_20px_rgba(26,60,110,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer" type="submit">
            {{ isSubmitting ? 'Memproses...' : 'Lanjut ke Konfirmasi' }}
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </main>

    <!-- Modal Ganti Ruang -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up border border-slate-100">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-primary">Pilih Ruang & Waktu</h3>
          <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-bold text-primary mb-2">Pilih Ruangan</label>
            <div class="relative mb-2">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input v-model="roomSearchQuery" type="text" placeholder="Cari kode atau nama ruangan..." class="w-full h-10 bg-white border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <select v-model="form.roomId" class="w-full h-12 bg-surface-container-low border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" size="4" style="height: auto;">
              <option v-for="room in filteredRooms" :key="room.id" :value="room.id" class="p-2 hover:bg-white rounded cursor-pointer">
                {{ room.code }} - {{ room.name }} (Kap: {{ room.capacity }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-primary mb-2">Tanggal Peminjaman</label>
            <input type="date" v-model="form.bookingDate" class="w-full h-12 bg-surface-container-low border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-primary mb-2">Waktu Mulai</label>
              <input type="time" v-model="form.startTime" class="w-full h-12 bg-surface-container-low border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-bold text-primary mb-2">Waktu Selesai</label>
              <input type="time" v-model="form.endTime" class="w-full h-12 bg-surface-container-low border-none rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
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
    <footer class="w-full py-8 flex flex-col items-center justify-center gap-4 bg-transparent mt-12 relative z-10">
      <div class="flex items-center gap-6 font-medium text-slate-500 text-sm">
        <a class="hover:text-primary transition-colors" href="#">Terms of Service</a>
        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
        <a class="hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
        <a class="hover:text-primary transition-colors" href="#">Campus Map</a>
      </div>
      <p class="text-slate-500 font-['Plus_Jakarta_Sans'] text-xs font-medium opacity-70">
        © 2026 CLASSIFY UNESA. Digital Quad System.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import UserNavbar from '../../components/layout/UserNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Data
const roomSearchQuery = ref('')
const rooms = ref([])
const filteredRooms = computed(() => {
  if (!roomSearchQuery.value) return rooms.value;
  const q = roomSearchQuery.value.toLowerCase();
  return rooms.value.filter(r => 
    r.name.toLowerCase().includes(q) || 
    r.code.toLowerCase().includes(q)
  );
})

const showDropdown = ref(false)
const showModal = ref(false)
const participantCount = ref(40)
const whatsappNumber = ref('')
const uploadedFile = ref(null)

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
  jurusan: '',
  activityWeight: 4
})

// Validation State
const hasConflict = ref(false)
const conflictSubtitle = ref('')
const conflictsList = ref([])
const isChecking = ref(false)
const isSubmitting = ref(false)

const user = computed(() => authStore.user)
const initials = computed(() => {
  if (!user.value || !user.value.username) return 'U';
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
})

const selectedRoomData = computed(() => rooms.value.find(r => String(r.id) === String(form.value.roomId)))

// Format Date Indo
const formatDateIndo = (dateStr) => {
  if (!dateStr) return ''
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const d = new Date(dateStr)
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const getPriorityLabel = (weight) => {
  switch(weight) {
    case 1: return "Priority 1: Tingkat Eksekutif/Rektorat";
    case 2: return "Priority 2: Event Seminar/Event";
    case 3: return "Priority 3: Peminjaman Kelas untuk Matkul";
    case 4: return "Priority 4: Rapat Organisasi Kemahasiswaan";
    default: return "Pilih Prioritas";
  }
}
const getPriorityColor = (weight) => {
  switch(weight) {
    case 1: return "bg-red-600";
    case 2: return "bg-orange-500";
    case 3: return "bg-amber-500";
    case 4: return "bg-blue-400";
    default: return "bg-slate-300";
  }
}

const toggleDropdown = () => { showDropdown.value = !showDropdown.value }
const submitPriority = (weight) => {
  form.value.activityWeight = weight
  showDropdown.value = false
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadedFile.value = file
  }
}

const scrollToSubmit = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
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
    // Trigger conflict check setelah room pertama di-set
    checkConflict()
  }
}

const prodis = ref([])
const fetchProdis = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/prodis`)
    prodis.value = res.data.data || []
  } catch(e) { console.error('Failed fetching prodis', e) }
}

// Check Conflict with API
const checkConflict = async () => {
  if (!form.value.roomId || !form.value.bookingDate || !form.value.startTime || !form.value.endTime) return
  isChecking.value = true
  hasConflict.value = false
  conflictsList.value = []
  
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
      conflictsList.value = res.data.conflicts || []
    }
  } catch (err) {
    console.warn('Conflict checker error:', err)
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert('Sesi Anda telah kedaluwarsa. Silakan login kembali.');
      authStore.logout();
      router.push('/auth/login');
    }
  } finally {
    isChecking.value = false
  }
}

watch(() => [form.value.roomId, form.value.bookingDate, form.value.startTime, form.value.endTime], () => {
  if(form.value.startTime && form.value.endTime && form.value.startTime >= form.value.endTime) {
    form.value.endTime = `${String(Number(form.value.startTime.split(':')[0]) + 1).padStart(2,'0')}:00`
  }
  checkConflict()
}, { immediate: true })

const handleSubmit = async () => {
  if (!form.value.eventName.trim()) {
    return alert('Nama kegiatan harus diisi.')
  }
  if (!form.value.purpose.trim()) {
    return alert('Tujuan penggunaan harus diisi.')
  }
  if (!form.value.jurusan) {
    return alert('Jurusan/Prodi harus dipilih.')
  }
  const waRaw = whatsappNumber.value.trim()
  if (!waRaw) {
    return alert('Nomor kontak WhatsApp harus diisi.')
  }
  let cleanedWA = waRaw.replace(/\D/g, '')
  if (cleanedWA.startsWith('0')) {
    cleanedWA = cleanedWA.substring(1)
  } else if (cleanedWA.startsWith('62')) {
    cleanedWA = cleanedWA.substring(2)
  }
  if (cleanedWA.length < 9 || cleanedWA.length > 13) {
    return alert('Format nomor WhatsApp salah. Masukkan nomor yang valid (9-13 digit setelah kode negara).')
  }
  isSubmitting.value = true
  
  try {
    const purposeString = `${form.value.eventName} | Jurusan: ${form.value.jurusan} | Peserta: ${participantCount.value} orang | WA: +62${cleanedWA} | Alasan: ${form.value.purpose}`
    const formData = new FormData();
    formData.append('roomId', form.value.roomId);
    formData.append('bookingDate', form.value.bookingDate);
    formData.append('startTime', form.value.startTime);
    formData.append('endTime', form.value.endTime);
    formData.append('purpose', purposeString);
    formData.append('activityWeight', form.value.activityWeight);
    if (uploadedFile.value) {
      formData.append('attachment', uploadedFile.value);
    }
    
    await axios.post(`${API_URL}/api/bookings`, formData, { headers: authStore.getAuthHeaders() })
    alert('Permohonan berhasil diajukan! Anda dapat memantau status pada Dashboard Anda.')
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.status === 409) {
      alert(`Gagal! ${err.response.data.message}`)
    } else {
      alert(err.response?.data?.message || 'Gagal mengajukan permohonan.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const unreadCount = ref(0)

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(async () => {
  if (authStore.token) {
    try {
      const profileRes = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: authStore.getAuthHeaders()
      })
      if (profileRes.data && profileRes.data.data) {
        authStore.user = profileRes.data.data
        localStorage.setItem('user', JSON.stringify(profileRes.data.data))
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err)
    }
  }

  fetchRooms()
  fetchProdis()

  if (authStore.user && authStore.user.prodi) {
    form.value.jurusan = authStore.user.prodi.name
  }
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
.fill-icon {
  font-variation-settings: 'FILL' 1;
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
