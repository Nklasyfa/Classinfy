<template>
  <div class="bg-surface font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Grid Overlay -->
    <div class="fixed inset-0 bg-grid pointer-events-none"></div>

    <!-- TopNavBar -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[900px] z-50 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">school</span>
        <span class="text-2xl font-extrabold tracking-tighter text-primary">CLASSINFY</span>
      </div>
      <div class="flex items-center gap-4 md:gap-8">
        <router-link to="/" class="hidden md:block text-slate-600 hover:text-primary transition-transform duration-200 hover:scale-105 font-medium">Monitoring</router-link>
        <button
          v-if="isLogin"
          @click="router.push('/auth/register')"
          class="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >Sign Up</button>
        <button
          v-else
          @click="router.push('/auth/login')"
          class="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >Login</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="min-h-screen flex items-center justify-center px-4 pt-24 pb-32">
      <div class="w-full max-w-[480px] bg-surface-container-lowest rounded-[24px] p-8 md:p-10 shadow-[0_20px_50px_rgba(26,60,110,0.12)] relative z-20">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-container rounded-2xl mb-6 shadow-lg">
            <span class="material-symbols-outlined text-white text-4xl" style="font-variation-settings: 'FILL' 1;">{{ isLogin ? 'school' : 'person_add' }}</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary mb-2">{{ isLogin ? 'Masuk ke CLASSINFY' : 'Daftar Akun Baru' }}</h1>
          <p class="text-on-surface-variant font-medium">{{ isLogin ? 'Kelola ruang kampus lebih mudah & transparan' : 'Buat akun untuk menggunakan layanan CLASSINFY' }}</p>
        </div>

        <!-- Role Pills (Register only) -->
        <div v-if="!isLogin" class="flex flex-wrap justify-center gap-2 mb-8">
          <button
            v-for="role in roleOptions" :key="role.id"
            @click="selectedRoleId = role.id"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer',
              selectedRoleId === role.id
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-surface-container-high text-primary border-primary/5 hover:bg-surface-container-highest'
            ]"
          >
            <span class="material-symbols-outlined text-[16px]">{{ role.icon }}</span>
            {{ role.label }}
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username (Register only) -->
          <div v-if="!isLogin">
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1 font-label">Username / Nama Lengkap</label>
            <div class="relative">
              <input
                v-model="username"
                :disabled="isLoading"
                required
                class="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-[12px] text-on-surface placeholder:text-slate-400 focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                placeholder="Nama Lengkap Anda"
                type="text"
              />
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
            </div>
          </div>

          <!-- Prodi, Matkul & Kelas (Register only) -->
          <div v-if="!isLogin && selectedRoleId !== 1" class="grid grid-cols-2 gap-4">
            <div :class="selectedRoleId === 3 ? 'col-span-2' : 'col-span-1'">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Prodi</label>
              <select v-model="selectedProdiId" class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-[12px] text-sm text-on-surface focus:ring-2 focus:ring-secondary/20 outline-none cursor-pointer">
                <option value="" disabled>Pilih Prodi</option>
                <option v-for="p in prodis" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <!-- Matkul untuk PJ (Hanya bisa milih 1) -->
            <div v-if="selectedRoleId === 4">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Matkul</label>
              <select v-model="singleSelectedMatkulId" class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-[12px] text-sm text-on-surface focus:ring-2 focus:ring-secondary/20 outline-none cursor-pointer">
                <option value="" disabled>Pilih Matkul</option>
                <option v-for="m in filteredMatkuls" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>

            <!-- Matkul untuk Dosen (Bisa milih beberapa dengan UI Pill) -->
            <div v-if="selectedRoleId === 3" class="col-span-2">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Pilih Matkul yang Diampu</label>
              <div v-if="filteredMatkuls.length === 0" class="text-xs text-slate-400 italic">Silakan pilih prodi terlebih dahulu.</div>
              <div v-else class="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-surface-container-lowest">
                <button
                  v-for="m in filteredMatkuls" :key="m.id"
                  @click="toggleMatkul(m.id)"
                  type="button"
                  :class="[
                    'px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer',
                    selectedMatkulIds.includes(m.id)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-slate-500 border-transparent hover:bg-surface-container-high'
                  ]"
                >
                  {{ m.name }}
                </button>
              </div>
            </div>
            <div v-if="selectedRoleId === 4 || selectedRoleId === 2" :class="selectedRoleId === 4 ? 'col-span-2' : 'col-span-1'">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Kelas</label>
              <select v-model="selectedKelasId" class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-[12px] text-sm text-on-surface focus:ring-2 focus:ring-secondary/20 outline-none cursor-pointer">
                <option value="">Pilih Kelas</option>
                <option v-for="k in filteredKelas" :key="k.id" :value="k.id">{{ k.name }}</option>
              </select>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1 font-label">Email</label>
            <div class="relative">
              <input
                v-model="email"
                :disabled="isLoading"
                required
                :class="['w-full px-5 py-3.5 bg-surface-container-low border-none rounded-[12px] text-on-surface placeholder:text-slate-400 transition-all outline-none', errorMsg ? 'ring-2 ring-error/30' : 'focus:ring-2 focus:ring-secondary/20']"
                placeholder="email@unesa.ac.id"
                type="email"
              />
              <span :class="['material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[20px]', errorMsg ? 'text-error' : 'text-slate-400']">mail</span>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1 font-label">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :disabled="isLoading"
                required
                :class="['w-full px-5 py-3.5 bg-surface-container-low border-none rounded-[12px] text-on-surface placeholder:text-slate-400 transition-all outline-none', errorMsg ? 'ring-2 ring-error/30' : 'focus:ring-2 focus:ring-secondary/20']"
                placeholder="••••••••"
                :type="showPassword ? 'text' : 'password'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>



          <!-- Submit -->
          <button
            :disabled="isLoading"
            :class="[
              'w-full py-4 rounded-[12px] font-bold text-base tracking-wide transition-all uppercase flex items-center justify-center gap-3',
              isLoading
                ? 'bg-slate-300 text-slate-500 cursor-wait shadow-none'
                : 'bg-primary text-white shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            ]"
            type="submit"
          >
            <template v-if="isLoading">
              <span class="material-symbols-outlined animate-spin text-[20px]">sync</span>
              MEMPROSES...
            </template>
            <template v-else>
              {{ isLogin ? 'MASUK' : 'DAFTAR' }}
            </template>
          </button>
        </form>

        <!-- Error / Success -->
        <div v-if="errorMsg" class="mt-5 flex items-center justify-center gap-2 text-error font-semibold text-sm bg-error-container/50 rounded-xl py-3 px-4">
          <span class="material-symbols-outlined text-[18px]">error</span>
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mt-5 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm bg-green-50 rounded-xl py-3 px-4">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          {{ successMsg }}
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-8">
          <div class="h-[1px] flex-1 bg-outline-variant/30"></div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-widest">atau</span>
          <div class="h-[1px] flex-1 bg-outline-variant/30"></div>
        </div>

        <!-- Footer Info -->
        <div class="text-center space-y-6">
          <p v-if="isLogin" class="text-sm text-on-surface-variant">
            Belum punya akun?
            <button @click="router.push('/auth/register')" type="button" class="font-bold text-primary hover:underline ml-1 cursor-pointer">Daftar Sekarang</button>
          </p>
          <p v-else class="text-sm text-on-surface-variant">
            Sudah punya akun?
            <button @click="router.push('/auth/login')" type="button" class="font-bold text-primary hover:underline ml-1 cursor-pointer">Masuk di Sini</button>
          </p>
          <router-link to="/" class="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:translate-x-[-4px] transition-transform">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Monitoring
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="absolute bottom-0 w-full py-8 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-4 z-20 text-center">
      <p class="font-label text-xs font-medium uppercase tracking-widest text-slate-400">© 2026 CLASSINFY Campus Management. All rights reserved.</p>
      <div class="hidden sm:flex gap-6">
        <a class="font-label text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors cursor-pointer">Privacy Policy</a>
        <a class="font-label text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors cursor-pointer">Terms of Service</a>
        <a class="font-label text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors cursor-pointer">Help Center</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = computed(() => route.name !== 'register')

const username = ref('')
const email = ref('')
const password = ref('')
const selectedRoleId = ref(2)
const selectedProdiId = ref('')
const selectedMatkulIds = ref([])
const singleSelectedMatkulId = ref('')
const selectedKelasId = ref('')

watch(selectedProdiId, () => {
  selectedMatkulIds.value = []
  singleSelectedMatkulId.value = ''
  selectedKelasId.value = ''
})

const toggleMatkul = (id) => {
  if (selectedMatkulIds.value.includes(id)) {
    selectedMatkulIds.value = selectedMatkulIds.value.filter(m => m !== id)
  } else {
    selectedMatkulIds.value.push(id)
  }
}

const prodis = ref([])
const matkuls = ref([])
const kelasList = ref([])

const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const fetchAkademik = async () => {
  try {
    const pRes = await axios.get(`${API_URL}/api/prodis`)
    prodis.value = pRes.data.data || []
    const mRes = await axios.get(`${API_URL}/api/matkuls`)
    matkuls.value = mRes.data.data || []
    const kRes = await axios.get(`${API_URL}/api/kelas`)
    kelasList.value = kRes.data.data || []
  } catch(e) { console.error('Gagal memuat data akademik') }
}

const filteredMatkuls = computed(() => {
  if (!selectedProdiId.value) return [];
  return matkuls.value.filter(m => m.prodiId === selectedProdiId.value);
});

const filteredKelas = computed(() => {
  if (!selectedProdiId.value) return [];
  return kelasList.value.filter(k => k.prodiId === selectedProdiId.value);
});

onMounted(() => {
  fetchAkademik()
})

const roleOptions = [
  { id: 2, label: 'Mahasiswa', icon: 'person' },
  { id: 4, label: 'PJ', icon: 'school' },
  { id: 3, label: 'Dosen', icon: 'corporate_fare' },
]

const handleSubmit = async () => {
  if (!email.value || !password.value) return

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
      successMsg.value = 'Login berhasil! Mengalihkan...'

      setTimeout(() => {
        if (authStore.isAdmin) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 800)
    } else {
      if (!username.value) {
        errorMsg.value = 'Username / Nama Lengkap wajib diisi'
        isLoading.value = false
        return
      }

      let finalMatkulIds = undefined;
      if (selectedRoleId.value === 4 && singleSelectedMatkulId.value) {
        finalMatkulIds = [singleSelectedMatkulId.value];
      } else if (selectedRoleId.value === 3 && selectedMatkulIds.value.length) {
        finalMatkulIds = selectedMatkulIds.value;
      }

      await axios.post(`${API_URL}/api/auth/register`, {
        username: username.value,
        email: email.value,
        password: password.value,
        roleId: selectedRoleId.value,
        prodiId: selectedProdiId.value || undefined,
        matkulIds: finalMatkulIds,
        kelasId: selectedKelasId.value || undefined,
      })

      successMsg.value = 'Registrasi berhasil! Mengalihkan ke login...'
      setTimeout(() => {
        router.push('/auth/login')
      }, 1200)
    }
  } catch (error) {
    if (error.response?.data?.message) {
      errorMsg.value = error.response.data.message
    } else {
      errorMsg.value = 'Terjadi kesalahan saat menghubungi server.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.bg-grid {
  background-image: 
    linear-gradient(to right, rgba(200, 213, 232, 0.4) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(200, 213, 232, 0.4) 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>
