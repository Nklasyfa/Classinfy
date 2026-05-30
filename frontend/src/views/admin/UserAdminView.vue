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

const showModal = ref(false)
const newUser = ref({
  username: '',
  email: '',
  password: '',
  roleId: 2,
  isVerified: true
})

const createUser = async () => {
  if (!newUser.value.username || !newUser.value.email || !newUser.value.password) return alert('Data tidak lengkap')
  try {
    await axios.post(`${API_URL}/api/users`, newUser.value, { headers: authStore.getAuthHeaders() })
    showModal.value = false
    newUser.value = { username: '', email: '', password: '', roleId: 2, isVerified: true }
    fetchUsers()
  } catch (error) {
    alert('Gagal menambah user')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Yakin ingin menghapus user ini?')) return
  try {
    await axios.delete(`${API_URL}/api/users/${id}`, { headers: authStore.getAuthHeaders() })
    fetchUsers()
  } catch (error) {
    alert('Gagal menghapus user')
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
  <div class="admin-bg-grid font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <AdminNavbar />

    <!-- Main Content -->
    <main class="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10 space-y-10">
      <!-- Header Moment -->
      <header class="flex justify-between items-end">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold tracking-tight text-primary">Direktori Pengguna</h1>
          <p class="text-slate-500 font-medium">Manajemen otorisasi dan kontrol akses pengguna.</p>
        </div>
        <!-- Search Bar & Add Button -->
        <div class="flex items-center gap-4 w-full max-w-xl justify-end">
          <div class="relative w-full max-w-md">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input v-model="searchQuery" 
                   class="w-full bg-white border border-outline-variant/20 rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none" 
                   placeholder="Cari nama, email..." type="text"/>
          </div>
          <button @click="showModal = true" class="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Tambah User
          </button>
        </div>
      </header>

      <!-- Stats Bento -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div v-for="(val, key) in { 'Total Pengguna': stats.total, 'Mahasiswa': stats.mhs, 'Mahasiswa PJ': stats.pj, 'Admin / Tendik': stats.admin }" 
             :key="key"
             class="bg-surface-container-lowest p-6 rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-outline-variant/10">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ key }}</p>
          <h3 class="text-3xl font-extrabold text-primary">{{ val }}</h3>
        </div>
      </section>

      <!-- Filters -->
      <section class="bg-surface-container-lowest rounded-lg shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden border border-outline-variant/10">
        <div class="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
          <div class="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
            <button v-for="tab in ['Semua', 'Perlu Verifikasi', 'Aktif']" 
                    :key="tab"
                    @click="filterStatus = tab"
                    :class="filterStatus === tab ? 'px-4 py-2 text-xs font-bold rounded-lg bg-surface-container-low text-primary shadow-sm' : 'px-4 py-2 text-xs font-medium text-slate-500 hover:text-primary cursor-pointer'">
              {{ tab }}
            </button>
          </div>
        </div>

        <!-- User Directory Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low/30 border-b border-outline-variant/10">
              <tr>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Pengguna</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Email</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Akademik</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Role</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/5">
            <tr v-if="loading" v-for="i in 3" :key="i" class="animate-pulse">
              <td colspan="5" class="px-6 py-10 h-16 bg-slate-50/20"></td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-xs shadow-inner group-hover:bg-white transition-colors">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-bold text-primary text-xs">{{ user.username }}</p>
                    <p class="text-[10px] font-medium text-slate-400">ID: {{ user.id.split('-')[0] }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-medium text-slate-600">{{ user.email }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-0.5">
                  <span v-if="user.prodi" class="text-[10px] font-bold text-primary">{{ user.prodi.name }}</span>
                  <span v-if="user.matkul" class="text-[10px] text-slate-500">{{ user.matkul.name }}</span>
                  <span v-if="user.kelas" class="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-md inline-block w-max mt-0.5">{{ user.kelas.name }}</span>
                  <span v-if="!user.prodi && !user.matkul && !user.kelas" class="text-[10px] text-slate-300 italic">-</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="relative">
                  <button @click="activeDropdownId = activeDropdownId === user.id ? null : user.id" 
                          class="flex items-center gap-1 bg-surface-container-lowest text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-all cursor-pointer">
                    {{ user.role?.name || 'Mahasiswa' }}
                    <span class="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                  
                  <div v-if="activeDropdownId === user.id" 
                       class="absolute left-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-xl z-20 border border-outline-variant/10 py-2 animate-in fade-in zoom-in duration-200">
                    <button v-for="role in roles" :key="role.id"
                            @click="updateRole(user.id, role.id)"
                            class="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-xs font-bold text-slate-600 transition-colors cursor-pointer">
                      <span class="material-symbols-outlined text-[16px]">{{ role.icon }}</span>
                      {{ role.name }}
                      <span v-if="user.roleId === role.id" class="ml-auto material-symbols-outlined text-[16px] text-[#16A34A]">check_circle</span>
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="user.isVerified" class="status-chip bg-[#16A34A]/20 text-[#16A34A]"><span class="material-symbols-outlined text-[14px]">check_circle</span>Terverifikasi</span>
                <span v-else class="status-chip bg-[#F59E0B]/20 text-[#D97706]"><span class="material-symbols-outlined text-[14px]">visibility</span>Pending</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="toggleVerification(user)" 
                          :class="user.isVerified ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'"
                          class="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border border-transparent hover:border-current/20">
                    {{ user.isVerified ? 'Suspend' : 'Verify' }}
                  </button>
                  <button @click="deleteUser(user.id)" class="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer" title="Hapus User">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>
    </main>

    <!-- Modal Create User -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-error transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2 class="text-xl font-extrabold text-primary mb-6">Tambah Pengguna Baru</h2>
        
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Nama Lengkap</label>
            <input v-model="newUser.username" required type="text" class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nama..." />
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Email</label>
            <input v-model="newUser.email" required type="email" class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="email@unesa.ac.id" />
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Password</label>
            <input v-model="newUser.password" required type="text" class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Password..." />
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Role</label>
            <select v-model="newUser.roleId" class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
              <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" id="verifyCheck" v-model="newUser.isVerified" class="rounded border-outline-variant/30 text-primary focus:ring-primary/20" />
            <label for="verifyCheck" class="text-xs font-bold text-slate-600 cursor-pointer">Langsung Terverifikasi</label>
          </div>
          
          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:scale-105 transition-transform shadow-md">Simpan User</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  color: #1A3C6E;
}
.status-chip {
    padding: 4px 12px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
}
</style>
