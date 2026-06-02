<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

import AuroraImg from '../../assets/kelompok/Aurora.png'
import FaizImg from '../../assets/kelompok/Faiz.png'
import FathanImg from '../../assets/kelompok/Fathan.png'
import NabilaImg from '../../assets/kelompok/Nabila.png'
import NakulaImg from '../../assets/kelompok/Nakula.png'

const router = useRouter()
const authStore = useAuthStore()

const initials = computed(() => {
  if (!authStore.user || !authStore.user.username) return 'U';
  return authStore.user.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
})

const unreadCount = ref(0) // Default value

// Load auth state from localStorage on mount
if (!authStore.isAuthenticated) {
  authStore.loadFromStorage()
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/')
  }
}

function goToDashboard() {
  if (authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else {
    router.push('/dashboard')
  }
}

function goToPeminjaman() {
  if (authStore.isAuthenticated) {
    router.push('/peminjaman')
  } else {
    router.push('/auth/login')
  }
}

const teamMembers = [
  {
    role: 'Programmer',
    roleIcon: 'terminal',
    roleBg: 'bg-[#1a3c6e]',
    roleText: 'text-white',
    name: 'Nakula Syafa Saputra',
    nim: '25051204374',
    github: 'https://github.com/Nklasyfa',
    instagram: 'https://www.instagram.com/nakulasyafa_/',
    image: NakulaImg
  },
  {
    role: 'System Analyst',
    roleIcon: 'analytics',
    roleBg: 'bg-[#2d5daa]',
    roleText: 'text-white',
    name: 'Nabila Pasha Hamidah',
    nim: '25051204318',
    github: 'https://github.com/NabilaPasha16',
    instagram: 'https://www.instagram.com/nabilaapshaa/',
    image: NabilaImg
  },
  {
    role: 'Scrum Master',
    roleIcon: 'dashboard',
    roleBg: 'bg-[#405e92]',
    roleText: 'text-white',
    name: 'Fathan Orvala',
    nim: '25051204271',
    github: 'https://github.com/atangorp',
    instagram: 'https://www.instagram.com/forvala_/',
    image: FathanImg
  },
  {
    role: 'UI/UX Designer',
    roleIcon: 'palette',
    roleBg: 'bg-[#264679]',
    roleText: 'text-white',
    name: 'Aurora Ilmannafia',
    nim: '25051204276',
    github: 'https://github.com/auroranafia',
    instagram: 'https://www.instagram.com/auroraanafia/',
    image: AuroraImg
  },
  {
    role: 'Quality Assurance',
    roleIcon: 'bug_report',
    roleBg: 'bg-[#002653]',
    roleText: 'text-white',
    name: 'Faiz Ramadhani',
    nim: '25051204372',
    github: 'https://github.com/faizramadhani01',
    instagram: 'https://www.instagram.com/faizramadhanign/',
    image: FaizImg
  }
]
</script>

<template>
  <div class="min-h-screen bg-background bg-grid text-on-background font-body selection:bg-secondary-container selection:text-on-secondary-container">

    <!-- TopNavBar -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSINFY</span>
      </div>
      <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
        <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" @click="router.push('/')">Monitoring</a>
        
        <!-- Tampil kalau sudah login -->
        <a v-if="authStore.isAuthenticated"
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="goToDashboard">Dashboard</a>

        <!-- Admin: tampilkan Fasilitas, bukan Peminjaman -->
        <a v-if="authStore.isAuthenticated && authStore.isAdmin" 
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="router.push('/admin/dashboard')">Fasilitas</a>
        <a v-else 
           class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" 
           @click="goToPeminjaman">Peminjaman</a>
        <a class="bg-primary-container text-white rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" @click="router.push('/team')">Tentang</a>
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
          @click="goToDashboard"
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

    <main class="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh]">

      <!-- Header Section -->
      <section class="mb-16">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary text-4xl">drag_indicator</span>
              <h1 class="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Meet The Professional Team
              </h1>
            </div>
            <p class="text-lg text-on-surface-variant font-medium leading-relaxed mb-4">
              <strong class="text-primary font-extrabold">CLASSINFY</strong> dikembangkan dengan bangga oleh <strong class="text-secondary font-extrabold">Kelompok 2</strong> sebagai solusi inovatif untuk memantau ketersediaan ruang kampus di Lingkungan Kampus 5 UNESA.
            </p>
            <p class="text-on-surface-variant leading-relaxed text-justify">
              Berawal dari permasalahan umum tentang kebingungan mencari ruang kelas kosong dan seringnya terjadi bentrok jadwal perkuliahan, kami merancang aplikasi berbasis web ini secara khusus agar seluruh proses peminjaman ruang, pengecekan ketersediaan, serta pemantauan jadwal dapat dilakukan secara <strong>real-time</strong>, <strong>transparan</strong>, dan <strong>terstruktur</strong>. Kami berharap CLASSINFY mampu mengefisienkan birokrasi dan memaksimalkan penggunaan fasilitas kampus!
            </p>
          </div>
          <div class="bg-primary-container/10 p-6 rounded-3xl border border-primary-container/20 md:w-80 shrink-0 shadow-sm relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 opacity-5">
              <span class="material-symbols-outlined text-[120px]">school</span>
            </div>
            <h3 class="text-primary font-extrabold mb-1 text-lg">Proyek Kelompok 2</h3>
            <p class="text-sm text-on-surface-variant mb-6 font-medium">Sistem Informasi Peminjaman & Monitoring Ruang Kelas</p>
            <div class="flex items-center gap-3 text-primary text-sm font-bold bg-white px-4 py-2 rounded-xl shadow-sm w-fit border border-primary-container/10">
              <span class="material-symbols-outlined">location_on</span>
              Kampus 5 UNESA
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <!-- Team Member Card -->
          <div v-for="(member, index) in teamMembers" :key="index" class="flex flex-col">
            <div class="mb-6 flex justify-center">
              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container shadow-xl bg-surface-container-low relative">
                <img :src="member.image" :alt="member.name" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>

            <div :class="['py-3 px-4 rounded-xl flex items-center gap-2 mb-4 shadow-sm', member.roleBg, member.roleText]">
              <span class="material-symbols-outlined text-[18px]">{{ member.roleIcon }}</span>
              <span class="font-bold text-sm">{{ member.role }}</span>
            </div>

            <div class="mb-4">
              <p class="font-extrabold text-primary text-sm">{{ member.nim }} - {{ member.name }}</p>
            </div>

            <div class="flex items-center gap-4 mt-auto">
              <!-- GitHub Icon -->
              <a :href="member.github" target="_blank" class="text-on-surface-variant hover:text-primary transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
              </a>
              <!-- Instagram Icon -->
              <a :href="member.instagram" target="_blank" class="text-on-surface-variant hover:text-primary transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="w-full py-12 flex flex-col items-center justify-center gap-4 bg-transparent">
      <div class="text-sm text-primary-container opacity-60">
        © 2026 <span class="font-bold">CLASSINFY</span> — Universitas Negeri Surabaya
      </div>
      <div class="flex gap-6 text-slate-500 text-xs font-medium">
        <a class="hover:text-secondary transition-colors cursor-pointer" @click="router.push('/')">Monitoring</a>
        <a v-if="authStore.isAuthenticated" class="hover:text-secondary transition-colors cursor-pointer" @click="goToDashboard">Dashboard</a>
        <a v-if="authStore.isAuthenticated && authStore.isAdmin" class="hover:text-secondary transition-colors cursor-pointer" @click="router.push('/admin/dashboard')">Fasilitas</a>
        <a v-else class="hover:text-secondary transition-colors cursor-pointer" @click="goToPeminjaman">Peminjaman</a>
        <a class="hover:text-secondary transition-colors cursor-pointer" @click="router.push('/team')">Tentang</a>
      </div>
    </footer>

  </div>
</template>
