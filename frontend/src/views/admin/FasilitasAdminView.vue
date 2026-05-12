<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const user = computed(() => authStore.user)

const rooms = ref([])

const fetchRooms = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/rooms`, { headers: authStore.getAuthHeaders() })
    rooms.value = res.data.data.map(room => ({
      id: room.id,
      code: room.code,
      building: room.location || 'Gedung Pendukung',
      floor: room.name.includes('Lantai') ? room.name.split('Lantai ')[1] : '01',
      capacity: room.capacity,
      facilities: room.facilities || [],
      status: room.status === 'available' ? 'Aktif' : 'Maintenance'
    }))
  } catch (err) {
    console.error('Failed to fetch rooms', err)
  }
}

onMounted(() => fetchRooms())

// Pagination dummy state
const currentPage = ref(1)

// Modal State
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const roomToDelete = ref(null)

const formData = ref({
  id: '',
  code: '',
  building: 'Gedung 1',
  floor: '01',
  capacity: 30,
  facilities: [],
  status: 'Aktif'
})

const facilityOptions = [
  { id: 'videocam', name: 'Projector', icon: 'videocam' },
  { id: 'ac_unit', name: 'AC', icon: 'ac_unit' },
  { id: 'wifi', name: 'WiFi', icon: 'wifi' },
  { id: 'mic', name: 'Mic / Sound', icon: 'mic' },
]

const resetForm = () => {
  formData.value = { id: '', code: '', building: 'Gedung 1', floor: '01', capacity: 30, facilities: [], status: 'Aktif' }
}

const openAddModal = () => {
  resetForm()
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
}

const handleAddRoom = async () => {
  try {
    const payload = {
      code: formData.value.code,
      name: `Ruang ${formData.value.code} Lantai ${formData.value.floor}`,
      capacity: formData.value.capacity,
      location: formData.value.building,
      facilities: formData.value.facilities,
      status: formData.value.status === 'Aktif' ? 'available' : 'maintenance'
    }
    await axios.post(`${API_URL}/api/rooms`, payload, { headers: authStore.getAuthHeaders() })
    alert('Ruangan berhasil ditambahkan ke database!')
    await fetchRooms()
    closeAddModal()
  } catch(err) {
    alert(err.response?.data?.message || 'Gagal menyimpan ke database')
  }
}

const openEditModal = (room) => {
  formData.value = { ...room, facilities: [...room.facilities] }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const handleEditRoom = async () => {
  try {
    const payload = {
      code: formData.value.code,
      name: `Ruang ${formData.value.code} Lantai ${formData.value.floor}`,
      capacity: formData.value.capacity,
      location: formData.value.building,
      facilities: formData.value.facilities,
      status: formData.value.status === 'Aktif' ? 'available' : 'maintenance'
    }
    await axios.put(`${API_URL}/api/rooms/${formData.value.id}`, payload, { headers: authStore.getAuthHeaders() })
    alert('Ruangan berhasil diupdate!')
    await fetchRooms()
    closeEditModal()
  } catch(err) {
    alert(err.response?.data?.message || 'Gagal mengupdate ruangan')
  }
}

const confirmDelete = (room) => {
  roomToDelete.value = room
  isDeleteModalOpen.value = true
}

const handleDelete = async () => {
  if (!roomToDelete.value) return;
  try {
    await axios.delete(`${API_URL}/api/rooms/${roomToDelete.value.id}`, { headers: authStore.getAuthHeaders() })
    alert('Ruangan berhasil dihapus!')
    await fetchRooms()
  } catch(err) {
    alert(err.response?.data?.message || 'Gagal menghapus ruangan')
  } finally {
    isDeleteModalOpen.value = false
    roomToDelete.value = null
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}
</script>

<template>
  <div class="font-body text-on-background min-h-screen relative overflow-x-hidden bg-background">
    <!-- Grid Texture Background -->
    <div class="fixed inset-0 pointer-events-none" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>
    
    <AdminNavbar />

    <!-- Main Content Area -->
    <main class="pt-32 pb-32 px-8 max-w-[1400px] mx-auto relative z-10">
      <!-- Editorial Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 class="text-5xl md:text-6xl font-extrabold text-primary tracking-tight leading-none mb-4">
            Master Data <br/><span class="text-secondary">Ruangan</span>
          </h1>
          <p class="text-on-surface-variant max-w-md font-medium">
            Kelola infrastruktur kampus dengan kontrol presisi. Inventarisir gedung, kapasitas, dan status operasional dalam satu layar.
          </p>
        </div>
        <div class="flex gap-4">
          <button @click="openAddModal" class="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <span class="material-symbols-outlined">add</span>
            Tambah Ruangan
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-surface-container-low p-6 rounded-xl mb-8 flex flex-wrap items-center gap-4 border border-outline-variant/10">
        <div class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm font-semibold text-primary shadow-sm border border-outline-variant/10">
          <span class="material-symbols-outlined text-lg">filter_list</span> Filters
        </div>
        <select class="bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim px-4 py-2 min-w-[140px] shadow-sm outline-none cursor-pointer">
          <option>Semua Gedung</option>
          <option>Gedung 1</option>
          <option>Gedung 2</option>
          <option>Labkom</option>
        </select>
        <select class="bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim px-4 py-2 min-w-[140px] shadow-sm outline-none cursor-pointer">
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Maintenance</option>
          <option>Nonaktif</option>
        </select>
        <div class="ml-auto flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Showing {{ rooms.length }} rooms</span>
        </div>
      </div>

      <!-- Data Table Section -->
      <div class="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] overflow-hidden border border-outline-variant/10">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/50 border-b border-outline-variant/10">
            <tr>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest">Kode Ruang</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest">Gedung</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest text-center">Lantai</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest text-center">Kapasitas</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest">Fasilitas</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest">Status</th>
              <th class="px-6 py-5 font-bold text-primary uppercase text-xs tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            <tr v-for="room in rooms" :key="room.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-bold text-primary">{{ room.code }}</td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ room.building }}</td>
              <td class="px-6 py-4 text-center font-bold text-slate-700">{{ room.floor }}</td>
              <td class="px-6 py-4 text-center">
                <span class="bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-secondary">{{ room.capacity }} Orang</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-1 flex-wrap">
                  <span v-for="(fac, idx) in room.facilities" :key="idx" class="material-symbols-outlined text-outline text-lg" :title="fac">{{ fac }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="room.status === 'Aktif'" class="bg-[#16A34A]/10 text-[#16A34A] text-[10px] font-bold px-3 py-1 rounded-full border border-[#16A34A]/20 uppercase tracking-tighter">Aktif</span>
                <span v-else-if="room.status === 'Maintenance'" class="bg-amber-100/50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-tighter">Maintenance</span>
                <span v-else class="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 uppercase tracking-tighter">Nonaktif</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="openEditModal(room)" class="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><span class="material-symbols-outlined text-[20px]">edit</span></button>
                <button @click="confirmDelete(room)" class="p-1.5 text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"><span class="material-symbols-outlined text-[20px]">delete</span></button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="bg-surface-container-low/30 px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
          <button class="text-xs font-bold text-primary hover:bg-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm border border-outline-variant/10 cursor-pointer">
            <span class="material-symbols-outlined text-sm">chevron_left</span> Previous
          </button>
          <div class="flex gap-2">
            <button class="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow-md cursor-pointer">1</button>
            <button class="w-8 h-8 rounded-lg hover:bg-white text-xs font-bold transition-colors text-slate-600 border border-transparent shadow-sm cursor-pointer">2</button>
          </div>
          <button class="text-xs font-bold text-primary hover:bg-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm border border-outline-variant/10 cursor-pointer">
            Next <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <!-- Add Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div class="fixed inset-0 bg-primary/40 backdrop-blur-[2px]" @click="closeAddModal"></div>
      <div class="bg-surface-container-lowest w-[600px] max-h-[90vh] rounded-lg shadow-[0_20px_50px_rgba(26,60,110,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 relative z-10">
        <!-- Modal Header -->
        <div class="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <div>
            <h2 class="text-2xl font-extrabold text-primary tracking-tight">Tambah Ruangan Baru</h2>
            <p class="text-on-surface-variant text-sm font-medium mt-1">Input data detail untuk manajemen aset kampus</p>
          </div>
          <button @click="closeAddModal" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-outline">close</span>
          </button>
        </div>
        <!-- Modal Body (Form) -->
        <div class="p-8 overflow-y-auto space-y-8 max-h-[60vh]">
          <!-- Basic Info Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kode Ruang</label>
              <input v-model="formData.code" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all" placeholder="Contoh: R.301" type="text" />
            </div>
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kode Gedung (Building)</label>
              <select v-model="formData.building" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all appearance-none cursor-pointer">
                <option disabled selected>Pilih Gedung</option>
                <option>Gedung 1</option>
                <option>Gedung 2</option>
                <option>Labkom</option>
              </select>
            </div>
          </div>
          <!-- Location Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Lantai</label>
              <select v-model="formData.floor" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all appearance-none cursor-pointer">
                <option disabled selected>Pilih Lantai</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kapasitas (Orang)</label>
              <div class="flex items-center gap-4 bg-surface-container-low w-fit p-1 rounded-full">
                <button @click="formData.capacity = Math.max(0, formData.capacity - 5)" class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <span class="w-12 text-center font-bold text-lg text-primary">{{ formData.capacity }}</span>
                <button @click="formData.capacity += 5" class="w-10 h-10 rounded-full bg-primary text-white shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Facilities Checkboxes -->
          <div class="space-y-4">
            <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Fasilitas Ruangan</label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="fac in facilityOptions" :key="fac.id" class="flex items-center gap-3 p-3 rounded-md hover:bg-surface-container-low transition-colors cursor-pointer group">
                <input type="checkbox" :value="fac.id" v-model="formData.facilities" class="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary" />
                <span class="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{{ fac.name }}</span>
              </label>
            </div>
          </div>
          <!-- Status Radio Buttons -->
          <div class="space-y-4">
            <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Status Awal</label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Aktif" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100" :class="formData.status === 'Aktif' ? 'ring-2 ring-green-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-sm font-bold text-green-700">Aktif</span>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Maintenance" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100" :class="formData.status === 'Maintenance' ? 'ring-2 ring-amber-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span class="text-sm font-bold text-amber-700">Maintenance</span>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Nonaktif" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100" :class="formData.status === 'Nonaktif' ? 'ring-2 ring-slate-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span class="text-sm font-bold text-slate-600">Nonaktif</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <!-- Modal Footer -->
        <div class="px-8 py-6 bg-surface-container-low flex justify-end gap-4">
          <button @click="closeAddModal" class="px-6 py-3 rounded-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer">
            Batal
          </button>
          <button @click="handleAddRoom" class="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-[0_8px_20px_rgba(26,60,110,0.2)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer">
            Simpan Ruangan
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div class="fixed inset-0 bg-primary/40 backdrop-blur-[2px]" @click="closeEditModal"></div>
      <div class="bg-surface-container-lowest w-[600px] max-h-[90vh] rounded-lg shadow-[0_20px_50px_rgba(26,60,110,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 relative z-10">
        <!-- Modal Header -->
        <div class="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <div>
            <h2 class="text-2xl font-extrabold text-primary tracking-tight">Edit Ruangan: {{ formData.code }}</h2>
            <p class="text-on-surface-variant text-sm font-medium mt-1">Perbarui data detail kelolaan aset fasilitas kampus</p>
          </div>
          <button @click="closeEditModal" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-outline">close</span>
          </button>
        </div>
        <!-- Modal Body (Form) -->
        <div class="p-8 overflow-y-auto space-y-8 max-h-[60vh]">
          <!-- Basic Info Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kode Ruang</label>
              <input v-model="formData.code" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all" type="text" />
            </div>
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kode Gedung (Building)</label>
              <select v-model="formData.building" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all appearance-none cursor-pointer">
                <option disabled selected>Pilih Gedung</option>
                <option>Gedung 1</option>
                <option>Gedung 2</option>
                <option>Labkom</option>
              </select>
            </div>
          </div>
          <!-- Location Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Lantai</label>
              <select v-model="formData.floor" class="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary-fixed-dim transition-all appearance-none cursor-pointer">
                <option disabled selected>Pilih Lantai</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Kapasitas (Orang)</label>
              <div class="flex items-center gap-4 bg-surface-container-low w-fit p-1 rounded-full">
                <button @click="formData.capacity = Math.max(0, formData.capacity - 5)" class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <span class="w-12 text-center font-bold text-lg text-primary">{{ formData.capacity }}</span>
                <button @click="formData.capacity += 5" class="w-10 h-10 rounded-full bg-primary text-white shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Facilities Checkboxes -->
          <div class="space-y-4">
            <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Fasilitas Ruangan</label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="fac in facilityOptions" :key="fac.id" class="flex items-center gap-3 p-3 rounded-md hover:bg-surface-container-low transition-colors cursor-pointer group">
                <input type="checkbox" :value="fac.id" v-model="formData.facilities" class="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary" />
                <span class="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{{ fac.name }}</span>
              </label>
            </div>
          </div>
          <!-- Status Radio Buttons -->
          <div class="space-y-4">
            <label class="font-label text-xs font-semibold uppercase tracking-wider text-outline">Status Awal</label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Aktif" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100" :class="formData.status === 'Aktif' ? 'ring-2 ring-green-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-sm font-bold text-green-700">Aktif</span>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Maintenance" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100" :class="formData.status === 'Maintenance' ? 'ring-2 ring-amber-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span class="text-sm font-bold text-amber-700">Maintenance</span>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Nonaktif" v-model="formData.status" class="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                <div class="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100" :class="formData.status === 'Nonaktif' ? 'ring-2 ring-slate-400' : ''">
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span class="text-sm font-bold text-slate-600">Nonaktif</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <!-- Modal Footer -->
        <div class="px-8 py-6 bg-surface-container-low flex justify-end gap-4">
          <button @click="closeEditModal" class="px-6 py-3 rounded-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer">
            Batal
          </button>
          <button @click="handleEditRoom" class="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-[0_8px_20px_rgba(26,60,110,0.2)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDeleteModalOpen = false"></div>
      <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-outline-variant/10 text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-error shadow-sm">
          <span class="material-symbols-outlined text-4xl">warning</span>
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-primary">Hapus Ruangan</h3>
          <p class="text-sm text-slate-500 mt-1">Anda yakin ingin menghapus ruangan <span class="font-bold text-primary">{{ roomToDelete?.code }}</span>? Aksi ini tidak dapat dibatalkan.</p>
        </div>
        <div class="flex gap-3 pt-2">
           <button @click="isDeleteModalOpen = false" class="flex-1 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-surface-container-low hover:bg-slate-200 transition-colors cursor-pointer">Batal</button>
           <button @click="handleDelete" class="flex-1 px-5 py-2.5 bg-error text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">Ya, Hapus</button>
        </div>
      </div>
    </div>

  </div>
</template>
