<template>
  <header class="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 rounded-full mt-4 w-full max-w-[900px] h-[64px] bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(26,60,110,0.06)] nav-dropdown-area">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
      <span class="text-2xl font-extrabold tracking-tighter text-primary-container">CLASSINFY</span>
    </div>
    <nav class="hidden md:flex items-center gap-1 font-medium text-sm">
      <router-link to="/" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Monitoring</router-link>
      
      <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated" to="/dashboard" custom>
        <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Dashboard</a>
      </router-link>

      <router-link v-slot="{ navigate }" v-if="authStore.isAuthenticated && authStore.isAdmin" to="/admin/dashboard" custom>
        <a @click="navigate" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Fasilitas</a>
      </router-link>
      <router-link v-else to="/peminjaman" class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer">Peminjaman</router-link>
      <a class="text-primary-container px-4 py-2 hover:scale-105 transition-transform duration-200 cursor-pointer" @click="router.push('/team')">Tentang</a>
    </nav>

    <div v-if="authStore.isAuthenticated" class="flex items-center gap-3 relative">
      <router-link to="/notifikasi" class="relative p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Notifikasi">
        <span class="material-symbols-outlined text-xl">notifications</span>
        <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ unreadCount }}</span>
      </router-link>
      <router-link to="/chat" class="relative p-2 text-primary-container hover:text-primary transition-colors cursor-pointer" title="Chat dengan Admin">
        <span class="material-symbols-outlined text-xl">chat</span>
        <span v-if="unreadChatsCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ unreadChatsCount }}</span>
      </router-link>

      <div class="text-right hidden sm:block">
        <p class="text-[11px] font-bold text-primary leading-none uppercase tracking-wider">{{ authStore.user?.role?.name || 'User' }}</p>
        <p class="text-[10px] text-slate-500 font-medium">{{ authStore.user?.username || '' }}</p>
      </div>
      
      <div class="relative">
        <div
          @click="toggleProfileDropdown"
          class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:scale-105 transition-transform bg-cover bg-center"
          :style="authStore.user?.profilePicture ? `background-image: url(${API_URL}${authStore.user.profilePicture})` : ''"
          title="Profil"
        >
          {{ !authStore.user?.profilePicture ? initials : '' }}
        </div>

        <div v-if="showProfileDropdown" class="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div class="p-4 border-b border-slate-50 bg-slate-50">
            <p class="font-bold text-slate-800 text-sm truncate">{{ authStore.user?.username }}</p>
            <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
          </div>
          <div class="p-2">
            <button @click="openProfileModal" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-3 font-medium cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">person</span>
              Profil Settings
            </button>
            <router-link to="/riwayat" @click="showProfileDropdown = false" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-3 font-medium mt-1 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">history</span>
              Riwayat Peminjaman
            </router-link>
            <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3 font-medium mt-1 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    <button
      v-else
      @click="router.push('/auth/login')"
      class="bg-transparent border border-primary-container text-primary-container px-6 py-2 rounded-full font-bold hover:bg-primary-container hover:text-white transition-all duration-200 cursor-pointer"
    >
      Login
    </button>
  </header>

  <!-- Profile & History Modal — Teleported to body so it's not clipped by the header -->
  <Teleport to="body">
    <div v-if="showProfileModal" class="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" @click.self="showProfileModal = false">
      <div class="bg-surface-container-lowest w-full max-w-[640px] rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.12)] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        <button @click="showProfileModal = false" class="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer z-10">
          <span class="material-symbols-outlined">close</span>
        </button>
        
        <div class="px-8 pt-8 pb-6 space-y-1">
          <h2 class="text-2xl font-extrabold text-primary tracking-tight">Profil Pengguna</h2>
          <div class="flex items-center gap-2">
            <span class="text-on-surface-variant font-medium">Role:</span>
            <span class="text-secondary font-bold font-label text-xs tracking-wider uppercase bg-secondary-fixed px-2 py-0.5 rounded">{{ authStore.user?.role?.name || 'Mahasiswa' }}</span>
          </div>
        </div>

        <div class="px-8 pb-10 overflow-y-auto max-h-[75vh] space-y-8">
          <!-- Profile Section -->
          <section class="space-y-6">
            <div class="flex items-center gap-4">
              <div class="h-[1px] flex-1 bg-surface-container-high"></div>
              <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-label">Informasi Profil</span>
              <div class="h-[1px] flex-1 bg-surface-container-high"></div>
            </div>
            <div class="flex gap-6 items-start">
              <div class="relative group shrink-0">
                <div class="w-24 h-24 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-bold text-4xl shadow-inner group-hover:bg-white transition-colors border-4 border-surface-container-low bg-cover bg-center"
                     :style="profilePreview ? `background-image: url(${profilePreview})` : (authStore.user?.profilePicture ? `background-image: url(${API_URL}${authStore.user.profilePicture})` : '')">
                  {{ (!profilePreview && !authStore.user?.profilePicture) ? initials : '' }}
                </div>
                <label class="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center border-2 border-white">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                  <input type="file" class="hidden" accept="image/*" @change="onFileSelected" />
                </label>
              </div>
              <div class="flex-1 grid grid-cols-2 gap-y-4 gap-x-6 mt-1">
                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label mb-1">Nama Lengkap (Paten)</label>
                  <p class="text-on-surface font-semibold text-sm">{{ authStore.user?.username }}</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label mb-1">Status</label>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[10px] uppercase">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktif
                  </span>
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label mb-1">Alamat Surel (Paten)</label>
                  <p class="text-on-surface font-semibold text-sm">{{ authStore.user?.email }}</p>
                </div>
              </div>
            </div>
            <div v-if="selectedFile" class="flex justify-end pt-2 border-t border-slate-100">
              <button @click="saveProfile" :disabled="isUploading" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-blue-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2">
                {{ isUploading ? 'Menyimpan...' : 'Simpan Foto Profil' }}
                <span class="material-symbols-outlined text-sm" v-if="!isUploading">save</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const notifications = ref([])
const showProfileDropdown = ref(false)
const showProfileModal = ref(false)
const selectedFile = ref(null)
const profilePreview = ref(null)
const isUploading = ref(false)

const initials = computed(() => {
  if (!authStore.user || !authStore.user.username) return 'U';
  return authStore.user.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead && n.title !== 'Pesan Baru dari Admin').length)
const unreadChatsCount = computed(() => notifications.value.filter(n => !n.isRead && n.title === 'Pesan Baru dari Admin').length)

const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const res = await axios.get(`${API_URL}/api/notifications`, { headers: authStore.getAuthHeaders() })
    notifications.value = res.data.data || []
  } catch (error) {
    console.error('Failed fetching notifications', error)
  }
}

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const closeDropdowns = (e) => {
  if (!e.target.closest('.nav-dropdown-area')) {
    showProfileDropdown.value = false
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const openProfileModal = () => {
  showProfileDropdown.value = false
  showProfileModal.value = true
  selectedFile.value = null
  profilePreview.value = null
}

const onFileSelected = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    profilePreview.value = URL.createObjectURL(file)
  }
}

const saveProfile = async () => {
  if (!selectedFile.value) {
    showProfileModal.value = false
    return
  }
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('profilePicture', selectedFile.value)
  
  try {
    const res = await axios.post(`${API_URL}/api/auth/profile-picture`, formData, {
      headers: {
        ...authStore.getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // Update store
    if (res.data.success) {
      authStore.user.profilePicture = res.data.profilePicture
      // Simpan ulang ke localStorage
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    
    showProfileModal.value = false
  } catch (error) {
    alert('Gagal mengupload foto profil')
    console.error(error)
  } finally {
    isUploading.value = false
  }
}

let pollInterval = null

onMounted(() => {
  fetchNotifications()
  pollInterval = setInterval(fetchNotifications, 5000)
  document.addEventListener('click', closeDropdowns)
  window.addEventListener('refresh-notifications', fetchNotifications)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', closeDropdowns)
  window.removeEventListener('refresh-notifications', fetchNotifications)
})
</script>
