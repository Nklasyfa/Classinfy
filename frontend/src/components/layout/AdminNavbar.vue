<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navLinks = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Fasilitas', path: '/admin/fasilitas' },
  { name: 'Akademik', path: '/admin/akademik' },
  { name: 'Permohonan', path: '/admin/permohonan' },
  { name: 'Users', path: '/admin/users' },
]

const logout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="fixed top-6 left-0 w-full z-50 px-8 flex justify-center">
    <nav class="bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,60,110,0.08)] border border-white/20 rounded-full px-8 py-2.5 flex items-center gap-8 max-w-7xl w-full justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 text-2xl font-black text-[#1A3C6E] tracking-tighter">
        <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">school</span>
        CLASSINFY
      </router-link>

      <!-- Nav Links -->
      <div class="hidden md:flex items-center gap-2">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          :class="[
            route.path === link.path 
              ? 'bg-[#1A3C6E] text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-500 hover:bg-slate-100'
          ]"
          class="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
        >
          {{ link.name }}
        </router-link>
      </div>

      <!-- User Profile -->
      <div class="flex items-center gap-4 border-l border-slate-200 pl-6 ml-2">
        <div class="text-right hidden sm:block">
          <p class="text-[10px] font-black text-[#1A3C6E] uppercase tracking-widest leading-none">ADMIN</p>
          <p class="text-xs font-medium text-slate-400">{{ authStore.user?.username || 'Administrator' }}</p>
        </div>
        <div class="relative group">
          <button @click="logout" class="w-10 h-10 rounded-full bg-[#001B3F] text-white flex items-center justify-center font-bold text-lg hover:scale-105 transition-transform overflow-hidden border-2 border-white shadow-md cursor-pointer">
            {{ authStore.user?.username?.charAt(0).toUpperCase() || 'A' }}
            <div class="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span class="material-symbols-outlined text-xl">logout</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.router-link-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
