<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('Semua') 

const activeDropdownId = ref(null)
const roles = [
  { id: 1, name: 'Admin', icon: 'admin_panel_settings' },
  { id: 2, name: 'Mahasiswa', icon: 'school' },
  { id: 3, name: 'Dosen', icon: 'person' },
  { id: 4, name: 'PJ', icon: 'engineering' }
]

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: authStore.getAuthHeaders()
    })
    users.value = response.data.data
  } catch (error) {
    console.error('Error fetchUsers:', error)
  } finally {
    loading.value = false
  }
}

const toggleVerification = async (user) => {
  try {
    const newStatus = !user.isVerified
    await axios.patch(`${API_URL}/api/users/${user.id}/verify`, 
      { isVerified: newStatus },
      { headers: authStore.getAuthHeaders() }
    )
    user.isVerified = newStatus
  } catch (error) {
    alert('Gagal mengupdate status verifikasi')
  }
}

const updateRole = async (userId, roleId) => {
  try {
    await axios.patch(`${API_URL}/api/users/${userId}/role`, 
      { roleId },
      { headers: authStore.getAuthHeaders() }
    )
    activeDropdownId.value = null
    fetchUsers() 
  } catch (error) {
    alert('Gagal mengupdate role')
  }
}

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    if (filterStatus.value === 'Semua') return matchesSearch
    if (filterStatus.value === 'Perlu Verifikasi') return matchesSearch && !user.isVerified
    if (filterStatus.value === 'Aktif') return matchesSearch && user.isVerified
    
    return matchesSearch
  })
})

const stats = computed(() => {
  return {
    total: users.value.length,
    mhs: users.value.filter(u => u.roleId === 2).length,
    pj: users.value.filter(u => u.roleId === 4).length,
    admin: users.value.filter(u => u.roleId === 1).length
  }
})

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="bg-slate-50 font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Background Decoration -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.4]" 
         style="background-image: radial-gradient(#1a3c6e 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>

    <AdminNavbar />

    <!-- Main Content -->
    <main class="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
      <!-- Search Bar Floating -->
      <div class="mb-10 flex justify-end">
        <div class="relative w-full max-w-md">
          <input v-model="searchQuery" 
                 class="w-full bg-white/80 backdrop-blur shadow-sm border border-slate-200 rounded-2xl py-3 px-12 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" 
                 placeholder="Cari nama, email, atau ID..." type="text"/>
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        </div>
      </div>

      <!-- Header & Stats Bento -->
      <header class="mb-10">
        <h1 class="text-4xl font-black text-[#1A3C6E] tracking-tight mb-8">Direktori Pengguna</h1>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="(val, key) in { 'Total Pengguna': stats.total, 'Mahasiswa': stats.mhs, 'Mahasiswa PJ': stats.pj, 'Admin / Tendik': stats.admin }" 
               :key="key"
               class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{{ key }}</p>
            <h3 class="text-4xl font-black text-[#1A3C6E]">{{ val }}</h3>
          </div>
        </div>
      </header>

      <!-- Filters -->
      <section class="mb-8">
        <div class="flex bg-white/50 backdrop-blur p-1.5 rounded-full border border-slate-200 w-fit gap-1">
          <button v-for="tab in ['Semua', 'Perlu Verifikasi', 'Aktif']" 
                  :key="tab"
                  @click="filterStatus = tab"
                  :class="filterStatus === tab ? 'bg-[#1A3C6E] text-white shadow-lg' : 'text-slate-500 hover:bg-white'"
                  class="px-8 py-2.5 rounded-full text-sm font-black transition-all duration-300">
            {{ tab }}
          </button>
        </div>
      </section>

      <!-- User Directory Table -->
      <div class="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th class="px-8 py-6">Pengguna</th>
              <th class="px-8 py-6">Email</th>
              <th class="px-8 py-6">Role</th>
              <th class="px-8 py-6">Status</th>
              <th class="px-8 py-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading" v-for="i in 3" :key="i" class="animate-pulse">
              <td colspan="5" class="px-8 py-10 h-16 bg-slate-50/20"></td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id" class="group hover:bg-blue-50/30 transition-colors">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#1A3C6E] font-black text-xl shadow-inner group-hover:bg-white transition-colors">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-black text-[#1A3C6E] text-lg">{{ user.username }}</p>
                    <p class="text-[10px] font-bold text-slate-400 tracking-wider">ID: {{ user.id.split('-')[0] }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-sm font-bold text-slate-500">{{ user.email }}</td>
              <td class="px-8 py-6">
                <div class="relative">
                  <button @click="activeDropdownId = activeDropdownId === user.id ? null : user.id" 
                          class="flex items-center gap-2 bg-slate-100 text-[#1A3C6E] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                    {{ user.role?.name || 'Mahasiswa' }}
                    <span class="material-symbols-outlined text-xs">expand_more</span>
                  </button>
                  
                  <div v-if="activeDropdownId === user.id" 
                       class="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl z-20 border border-slate-100 py-3 animate-in fade-in zoom-in duration-200">
                    <button v-for="role in roles" :key="role.id"
                            @click="updateRole(user.id, role.id)"
                            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors">
                      <span class="material-symbols-outlined text-sm">{{ role.icon }}</span>
                      {{ role.name }}
                      <span v-if="user.roleId === role.id" class="ml-auto material-symbols-outlined text-xs text-green-500" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <span :class="user.isVerified ? 'bg-green-500 shadow-green-200' : 'bg-amber-500 shadow-amber-200'" class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"></span>
                  <span :class="user.isVerified ? 'text-green-600' : 'text-amber-600'" class="text-xs font-black">
                    {{ user.isVerified ? 'Terverifikasi' : 'Pending' }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <button @click="toggleVerification(user)" 
                        :class="user.isVerified ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'"
                        class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  {{ user.isVerified ? 'Suspend' : 'Verify' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom animations or transitions */
</style>


<style scoped>
.router-link-active {
  color: #1A3C6E;
}
</style>
