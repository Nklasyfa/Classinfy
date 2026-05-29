<template>
  <div class="min-h-screen font-body flex flex-col relative overflow-hidden bg-[#F0F4F8] text-[#0b1c30]" style="height: 100vh;">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <!-- TopNavBar -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSINFY</span>
      </div>
      <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
        <router-link to="/" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Monitoring</router-link>
        
        <!-- Tampil kalau sudah login -->
        <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated" to="/dashboard" custom>
          <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Dashboard</a>
        </router-link>

        <!-- Admin: tampilkan Fasilitas, bukan Peminjaman -->
        <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated && authStore.isAdmin" to="/admin/dashboard" custom>
          <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Fasilitas</a>
        </router-link>
        <router-link v-else to="/peminjaman" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Peminjaman</router-link>
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" @click="router.push('/team')">Tentang</a>
      </nav>

      <!-- Jika sudah login: tampilkan info user + logout -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <!-- Notification Icon -->
        <router-link to="/notifikasi" class="relative p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Notifikasi">
          <span class="material-symbols-outlined text-xl">notifications</span>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ unreadCount }}</span>
        </router-link>
        <!-- Chat Icon -->
        <router-link to="/chat" class="p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Chat dengan Admin">
          <span class="material-symbols-outlined text-xl">chat</span>
        </router-link>

        <div class="text-right hidden sm:block">
          <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ authStore.user?.role?.name || 'User' }}</p>
          <p class="text-[10px] text-slate-500 font-medium">{{ authStore.user?.username || '' }}</p>
        </div>
        <div
          @click="router.push('/dashboard')"
          class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform"
          title="Ke Dashboard"
        >
          {{ initials }}
        </div>
        <button
          @click="handleLogout"
          class="text-slate-500 hover:text-red-600 transition-colors cursor-pointer p-1"
          title="Logout"
        >
          <span class="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
      <!-- Jika belum login: tampilkan tombol Login -->
      <button
        v-else
        @click="router.push('/auth/login')"
        class="bg-transparent border border-primary-container text-primary-container px-6 py-2 rounded-full font-bold hover:bg-primary-container hover:text-white transition-all duration-200 cursor-pointer"
      >
        Login
      </button>
    </header>

    <!-- Chat Area -->
    <main class="flex-1 flex flex-col px-6 pt-28 pb-5 max-w-3xl mx-auto w-full relative z-10" style="min-height: 0;">
      <!-- Title -->
      <div class="mb-4 shrink-0">
        <h1 class="text-xl font-extrabold text-[#1A3C6E] tracking-tight">Chat dengan Admin</h1>
        <p class="text-slate-500 text-xs font-medium">Sampaikan pertanyaan atau keperluan kamu langsung ke tim admin.</p>
      </div>

      <!-- Chat Box -->
      <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-slate-100 flex flex-col overflow-hidden" style="flex: 1; min-height: 0;">
        <!-- Chat Header -->
        <div class="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <p class="font-extrabold text-[#1A3C6E] text-sm">Admin CLASSINFY</p>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <span class="text-[10px] text-slate-400 font-medium">Online</span>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <span class="material-symbols-outlined text-xs">shield</span>
            Percakapan Aman
          </div>
        </div>

        <!-- Messages -->
        <div ref="chatBox" class="flex-1 overflow-y-auto p-5 space-y-4" style="min-height: 0;">
          <div class="text-center">
            <span class="text-[10px] font-bold text-slate-300 bg-slate-100 px-4 py-1 rounded-full uppercase tracking-wider">Hari ini</span>
          </div>

          <div v-for="msg in messages" :key="msg.id" :class="msg.fromUser ? 'flex justify-end' : 'flex justify-start items-end gap-2'">
            <div v-if="!msg.fromUser" class="w-7 h-7 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-[10px] font-bold shrink-0">A</div>
            <div :class="[
              'max-w-[72%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed',
              msg.fromUser
                ? 'bg-[#1A3C6E] text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-700 rounded-bl-sm'
            ]">
              <p>{{ msg.text }}</p>
              <p :class="msg.fromUser ? 'text-blue-200' : 'text-slate-400'" class="text-[10px] mt-1.5 text-right font-semibold">{{ msg.time }}</p>
            </div>
            <div v-if="msg.fromUser" class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">{{ initials }}</div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-end gap-2">
            <div class="w-7 h-7 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-[10px] font-bold shrink-0">A</div>
            <div class="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay:0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay:150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay:300ms"></span>
            </div>
          </div>
        </div>

        <!-- Quick Replies -->
        <div v-if="messages.length <= 2" class="shrink-0 px-5 pb-3 flex gap-2 flex-wrap">
          <button
            v-for="q in quickReplies" :key="q"
            @click="sendQuick(q)"
            class="text-[11px] font-bold px-3 py-1.5 rounded-full bg-blue-50 text-[#1A3C6E] hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
          >{{ q }}</button>
        </div>

        <!-- Input -->
        <div class="shrink-0 px-4 py-3 border-t border-slate-100 flex items-center gap-3">
          <div class="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 py-2.5 gap-3 focus-within:ring-2 focus-within:ring-[#1A3C6E]/20 transition-all">
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              placeholder="Ketik pesan kamu..."
              class="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none"
            />
            <button @click="sendMessage" :disabled="!inputText.trim()" class="disabled:opacity-30 cursor-pointer transition-transform hover:scale-110">
              <span class="material-symbols-outlined text-[#1A3C6E]">send</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const chatBox = ref(null)
const inputText = ref('')
const isTyping = ref(false)
const unreadCount = ref(2)

const initials = computed(() => {
  const name = authStore.user?.username || 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const now = () => new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())

const messages = ref([
  { id: 1, fromUser: false, text: 'Halo! 👋 Selamat datang di layanan chat CLASSINFY. Ada yang bisa kami bantu terkait peminjaman ruangan atau fasilitas kampus?', time: now() }
])

const quickReplies = [
  'Status permohonan saya?',
  'Cara mengajukan peminjaman?',
  'Jadwal ruangan tersedia?',
  'Syarat peminjaman apa saja?',
]

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text) return
  messages.value.push({ id: Date.now(), fromUser: true, text, time: now() })
  inputText.value = ''
  await scrollBottom()
  isTyping.value = true
  await scrollBottom()
  setTimeout(async () => {
    isTyping.value = false
    messages.value.push({ id: Date.now() + 1, fromUser: false, text: getReply(text), time: now() })
    await scrollBottom()
  }, 1500)
}

const sendQuick = (t) => { inputText.value = t; sendMessage() }

const scrollBottom = async () => {
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

const getReply = (text) => {
  const t = text.toLowerCase()
  if (t.includes('status') || t.includes('permohonan')) return 'Untuk mengecek status permohonan kamu, silakan buka menu Dashboard → Riwayat. Jika ada kendala, mohon berikan nomor ID permohonan. 📋'
  if (t.includes('cara') || t.includes('ajukan')) return 'Cara mengajukan: 1) Login, 2) Klik "Ajukan Peminjaman", 3) Pilih ruangan & tanggal, 4) Isi form, 5) Submit. Tunggu konfirmasi admin dalam 1×24 jam kerja. 🏫'
  if (t.includes('jadwal') || t.includes('tersedia')) return 'Cek ketersediaan ruangan di halaman Monitoring (/). Jadwal ditampilkan real-time. Jam kerja admin: 08.00–16.00 WIB. 🕐'
  if (t.includes('syarat') || t.includes('dokumen')) return 'Syarat: 1) Akun CLASSINFY aktif, 2) Isi form detail lengkap, 3) Upload proposal/surat untuk kegiatan besar (opsional). Proses 1×24 jam kerja. ✅'
  return 'Terima kasih pesanmu! Admin akan merespons dalam 1×24 jam kerja. Untuk urusan mendesak, hubungi kantor BAAK secara langsung. 🙏'
}
</script>
