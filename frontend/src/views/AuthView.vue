<template>
  <div class="bg-surface font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Grid Overlay -->
    <div class="fixed inset-0 bg-grid pointer-events-none"></div>

    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 rounded-full max-w-[900px] mt-6 mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,60,110,0.06)]">
      <div class="text-2xl font-extrabold tracking-tighter text-blue-900 dark:text-white font-headline">CLASSIFY</div>
      <div class="flex items-center gap-6">
        <a class="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-900 transition-transform duration-200 hover:scale-105 font-medium" href="#">Monitoring</a>
        <button class="bg-blue-900 dark:bg-blue-600 text-white rounded-full px-6 py-2 font-bold hover:scale-105 transition-transform duration-200">Sign Up</button>
      </div>
    </nav>

    <main class="min-h-screen flex items-center justify-center p-4 pt-28 pb-32 relative">
      <div class="w-full max-w-[480px] bg-surface-container-lowest p-10 rounded-lg shadow-[0_20px_50px_rgba(26,60,110,0.1)] relative z-10">
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-primary font-headline mb-2">{{ isLogin ? 'Selamat Datang' : 'Buat Akun Baru' }}</h1>
          <p class="text-on-surface-variant font-label text-sm uppercase tracking-widest">{{ isLogin ? 'Silakan masuk ke akun Anda' : 'Daftar untuk menggunakan layanan' }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin" class="space-y-2">
            <label class="font-label text-xs font-semibold text-primary/70 ml-1 uppercase">Username / Nama Lengkap</label>
            <div class="relative">
              <input v-model="username" :disabled="isLoading" required :class="['w-full px-4 py-4 bg-surface-container-low rounded-lg border-2 font-medium text-on-surface placeholder:text-outline/50 transition-all', isLoading ? 'cursor-not-allowed opacity-70 border-transparent' : 'border-transparent focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20']" placeholder="Nama Anda" type="text" />
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/50">person</span>
            </div>
          </div>

          <div class="space-y-2">
            <label class="font-label text-xs font-semibold text-primary/70 ml-1 uppercase">Email Address</label>
            <div class="relative">
              <input v-model="email" :disabled="isLoading" required :class="['w-full px-4 py-4 bg-surface-container-low rounded-lg border-2 transition-all font-medium text-on-surface placeholder:text-outline/50', isLoading ? 'cursor-not-allowed opacity-70 border-transparent' : (errorMsg ? 'border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-error/20' : 'border-transparent focus:outline-none focus:ring-2 focus:border-secondary focus:ring-secondary/20')]" placeholder="nama@email.com" type="email"/>
              <span :class="['material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2', errorMsg ? 'text-[#DC2626]' : 'text-outline/50']">mail</span>
            </div>
          </div>

          <div class="space-y-2">
            <label class="font-label text-xs font-semibold text-primary/70 ml-1 uppercase">Password</label>
            <div class="relative">
              <input v-model="password" :disabled="isLoading" required :class="['w-full px-4 py-4 bg-surface-container-low rounded-lg border-2 transition-all font-medium text-on-surface placeholder:text-outline/50', isLoading ? 'cursor-not-allowed opacity-70 border-transparent' : (errorMsg ? 'border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-error/20' : 'border-transparent focus:outline-none focus:ring-2 focus:border-secondary focus:ring-secondary/20')]" placeholder="••••••••" :type="showPassword ? 'text' : 'password'" />
              <button type="button" :disabled="isLoading" @click="showPassword = !showPassword" :class="['absolute right-4 top-1/2 -translate-y-1/2 hover:text-primary transition-colors', isLoading ? 'cursor-not-allowed opacity-50' : '', errorMsg ? 'text-[#DC2626]' : 'text-outline/50']">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div v-if="isLogin" class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all" type="checkbox" :disabled="isLoading" />
              <span :class="['font-medium transition-colors', isLoading ? 'text-on-surface-variant opacity-70' : 'text-on-surface-variant group-hover:text-primary']">Ingat Saya</span>
            </label>
            <a :class="['font-bold transition-all', isLoading ? 'text-secondary pointer-events-none opacity-50' : 'text-secondary hover:underline']" href="#">Lupa Password?</a>
          </div>

          <button 
            :disabled="isLoading" 
            :class="[
              'w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all',
              isLoading 
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-wait shadow-none' 
                : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            ]" 
            type="submit"
          >
            <template v-if="isLoading">
              <span class="material-symbols-outlined animate-spin" data-icon="sync">sync</span>
              MEMROSES...
            </template>
            <template v-else>
              {{ isLogin ? 'MASUK' : 'DAFTAR' }}
              <span class="material-symbols-outlined">{{ isLogin ? 'login' : 'person_add' }}</span>
            </template>
          </button>
          
          <div v-if="errorMsg" class="mt-4 flex items-center justify-center gap-2 text-[#DC2626] font-semibold text-sm animate-pulse">
            <span>❌ {{ errorMsg }}</span>
          </div>
          <div v-if="successMsg" class="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm animate-pulse">
            <span>✅ {{ successMsg }}</span>
          </div>
        </form>

        <div class="mt-10 pt-8 border-t border-outline-variant/10 text-center">
          <p class="text-on-surface-variant font-medium">
            {{ isLogin ? 'Belum punya akun?' : 'Sudah punya akun?' }} 
            <button @click="toggleMode" type="button" class="text-secondary font-bold hover:underline ml-1">
              {{ isLogin ? 'Daftar Sekarang' : 'Masuk di Sini' }}
            </button>
          </p>
        </div>
      </div>
    </main>

    <footer class="absolute bottom-8 w-full flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-4 font-['Inter'] text-xs font-medium uppercase tracking-widest bg-transparent z-20 text-center">
      <span class="text-slate-400 dark:text-slate-500">© 2026 CLASSIFY Campus Management. All rights reserved.</span>
      <div class="flex flex-wrap justify-center gap-4 md:gap-6">
        <a class="text-slate-400 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
        <a class="text-slate-400 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
        <a class="text-slate-400 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors opacity-80 hover:opacity-100" href="#">Help Center</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter();
const route = useRoute();
const isLogin = computed(() => route.name !== 'register')

const username = ref('')
const email = ref('')
const password = ref('')

const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const toggleMode = () => {
  errorMsg.value = '';
  successMsg.value = '';
  if (isLogin.value) {
    router.push('/auth/register');
  } else {
    router.push('/auth/login');
  }
}

const handleSubmit = async () => {
  if (!email.value || !password.value) return;

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    if (isLogin.value) {
      // Login API
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.value,
        password: password.value
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        successMsg.value = 'Login berhasil! Mengalihkan ke dashboard...';
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } else {
      // Register API
      if (!username.value) {
        errorMsg.value = 'Username / Nama Lengkap wajib diisi'
        isLoading.value = false;
        return;
      }
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: username.value,
        email: email.value,
        password: password.value
      });

      successMsg.value = 'Akun Anda berhasil didaftarkan! Mengalihkan ke login...';
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMsg.value = error.response.data.message;
    } else {
      errorMsg.value = 'Terjadi kesalahan saat menghubungi server.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
