<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'
import axios from 'axios'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const activeTab = ref('prodi')
const tabs = [
  { key: 'prodi', label: 'Program Studi', icon: 'domain' },
  { key: 'matkul', label: 'Mata Kuliah', icon: 'menu_book' },
  { key: 'kelas', label: 'Kelas', icon: 'groups' },
]

const prodis = ref([])
const matkuls = ref([])
const kelasList = ref([])

const fetchProdis = async () => {
  try { const r = await axios.get(`${API_URL}/api/prodis`); prodis.value = r.data.data } catch(e) {}
}
const fetchMatkuls = async () => {
  try { const r = await axios.get(`${API_URL}/api/matkuls`); matkuls.value = r.data.data } catch(e) {}
}
const fetchKelas = async () => {
  try { const r = await axios.get(`${API_URL}/api/kelas`); kelasList.value = r.data.data } catch(e) {}
}

onMounted(() => { fetchProdis(); fetchMatkuls(); fetchKelas() })

// --- Search ---
const searchProdi = ref('')
const searchMatkul = ref('')
const searchKelas = ref('')

// --- Pagination ---
const pageProdi = ref(1); const pageMatkul = ref(1); const pageKelas = ref(1)
const PER = 10

const filteredProdis = computed(() => prodis.value.filter(p =>
  p.name.toLowerCase().includes(searchProdi.value.toLowerCase()) ||
  p.code.toLowerCase().includes(searchProdi.value.toLowerCase())
))
const paginatedProdis = computed(() => filteredProdis.value.slice((pageProdi.value-1)*PER, pageProdi.value*PER))
const totalProdiPages = computed(() => Math.max(1, Math.ceil(filteredProdis.value.length / PER)))

const filteredMatkuls = computed(() => matkuls.value.filter(m =>
  m.name.toLowerCase().includes(searchMatkul.value.toLowerCase()) ||
  m.code.toLowerCase().includes(searchMatkul.value.toLowerCase())
))
const paginatedMatkuls = computed(() => filteredMatkuls.value.slice((pageMatkul.value-1)*PER, pageMatkul.value*PER))
const totalMatkulPages = computed(() => Math.max(1, Math.ceil(filteredMatkuls.value.length / PER)))

const filteredKelas = computed(() => kelasList.value.filter(k =>
  k.name.toLowerCase().includes(searchKelas.value.toLowerCase()) ||
  k.code.toLowerCase().includes(searchKelas.value.toLowerCase())
))
const paginatedKelas = computed(() => filteredKelas.value.slice((pageKelas.value-1)*PER, pageKelas.value*PER))
const totalKelasPages = computed(() => Math.max(1, Math.ceil(filteredKelas.value.length / PER)))

// --- Modals ---
const modal = ref({ open: false, type: '', isEdit: false, form: {} })

function openModal(type, data = null) {
  const defaults = {
    prodi: { id: null, code: '', name: '' },
    matkul: { id: null, code: '', name: '', prodiId: '' },
    kelas: { id: null, code: '', name: '', prodiId: '' },
  }
  modal.value = {
    open: true, type,
    isEdit: !!data,
    form: data ? { ...data, prodiId: data.prodiId || data.prodi?.id || '' } : { ...defaults[type] }
  }
}

function closeModal() { modal.value.open = false }

const saving = ref(false)
async function handleSave() {
  saving.value = true
  const { type, isEdit, form } = modal.value
  const endpoints = { prodi: 'prodis', matkul: 'matkuls', kelas: 'kelas' }
  const ep = endpoints[type]
  try {
    if (isEdit) await axios.put(`${API_URL}/api/${ep}/${form.id}`, form, { headers: authStore.getAuthHeaders() })
    else await axios.post(`${API_URL}/api/${ep}`, form, { headers: authStore.getAuthHeaders() })
    closeModal()
    if (type === 'prodi') fetchProdis()
    if (type === 'matkul') fetchMatkuls()
    if (type === 'kelas') fetchKelas()
  } catch(e) { alert('Gagal menyimpan data') }
  saving.value = false
}

async function handleDelete(type, id) {
  if (!confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.')) return
  const endpoints = { prodi: 'prodis', matkul: 'matkuls', kelas: 'kelas' }
  try {
    await axios.delete(`${API_URL}/api/${endpoints[type]}/${id}`, { headers: authStore.getAuthHeaders() })
    if (type === 'prodi') fetchProdis()
    if (type === 'matkul') fetchMatkuls()
    if (type === 'kelas') fetchKelas()
  } catch(e) { alert('Gagal menghapus data') }
}

import * as XLSX from 'xlsx'

const modalTitle = computed(() => {
  const names = { prodi: 'Program Studi', matkul: 'Mata Kuliah', kelas: 'Kelas' }
  return `${modal.value.isEdit ? 'Edit' : 'Tambah'} ${names[modal.value.type] || ''}`
})

// --- Bulk Import ---
const fileInput = ref(null)
const isImporting = ref(false)

function triggerImport() {
  if (fileInput.value) fileInput.value.click()
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  
  isImporting.value = true
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(worksheet)
    
    if (!rows || rows.length === 0) {
      alert('File kosong atau format salah!')
      return
    }

    // Pemetaan data menyesuaikan format masing-masing tab
    let payload = []
    if (activeTab.value === 'prodi') {
      payload = rows.map(r => ({ code: r.Kode || r.code, name: r.Nama || r.name }))
    } else if (activeTab.value === 'matkul') {
      payload = rows.map(r => {
        const p = prodis.value.find(pr => pr.code === (r.Prodi || r.prodiCode))
        return { code: r.Kode || r.code, name: r.Nama || r.name, prodiId: p ? p.id : null }
      })
    } else if (activeTab.value === 'kelas') {
      payload = rows.map(r => {
        const p = prodis.value.find(pr => pr.code === (r.Prodi || r.prodiCode))
        return { code: r.Kode || r.code, name: r.Nama || r.name, prodiId: p ? p.id : null }
      })
    }
    
    // Filter out rows with null prodiId if matkul/kelas
    if (activeTab.value !== 'prodi') {
      const invalid = payload.filter(p => !p.prodiId)
      if (invalid.length > 0) {
        alert(`${invalid.length} baris gagal diproses karena Kode Prodi tidak ditemukan di database. Pastikan kolom "Prodi" atau "prodiCode" pada Excel valid.`)
        payload = payload.filter(p => p.prodiId)
      }
    }

    if (payload.length === 0) {
      alert('Tidak ada data valid untuk diimport.')
      return
    }

    const endpoints = { prodi: 'prodis', matkul: 'matkuls', kelas: 'kelas' }
    const ep = endpoints[activeTab.value]
    
    const res = await axios.post(`${API_URL}/api/${ep}/bulk`, { data: payload }, { headers: authStore.getAuthHeaders() })
    alert(res.data.message || 'Import berhasil!')
    
    if (activeTab.value === 'prodi') fetchProdis()
    if (activeTab.value === 'matkul') fetchMatkuls()
    if (activeTab.value === 'kelas') fetchKelas()
    
  } catch(error) {
    console.error(error)
    alert('Terjadi kesalahan saat import data.')
  } finally {
    isImporting.value = false
    e.target.value = null // reset input
  }
}
</script>

<template>
  <div class="admin-bg-grid font-body text-on-background min-h-screen">
    <AdminNavbar />

    <main class="pt-28 pb-16 px-6 max-w-6xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">Master Data Akademik</h1>
          <p class="text-slate-500 text-sm mt-1">Kelola program studi, mata kuliah, dan kelas secara terpusat.</p>
        </div>
        <!-- Stats chips -->
        <div class="flex gap-3">
          <div class="bg-white border border-outline-variant/20 rounded-xl px-4 py-2 text-center shadow-sm">
            <p class="text-xl font-extrabold text-primary">{{ prodis.length }}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase">Prodi</p>
          </div>
          <div class="bg-white border border-outline-variant/20 rounded-xl px-4 py-2 text-center shadow-sm">
            <p class="text-xl font-extrabold text-secondary">{{ matkuls.length }}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase">Matkul</p>
          </div>
          <div class="bg-white border border-outline-variant/20 rounded-xl px-4 py-2 text-center shadow-sm">
            <p class="text-xl font-extrabold text-primary">{{ kelasList.length }}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase">Kelas</p>
          </div>
        </div>
      </header>

      <!-- Tab Container -->
      <div class="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,60,110,0.08)] border border-outline-variant/10 overflow-hidden">

        <!-- Tab Bar -->
        <div class="flex border-b border-outline-variant/10 bg-surface-container-low/40">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative cursor-pointer',
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-slate-500 hover:text-primary hover:bg-white/60'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
            {{ tab.label }}
            <span class="ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
              :class="activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'">
              {{ tab.key === 'prodi' ? prodis.length : tab.key === 'matkul' ? matkuls.length : kelasList.length }}
            </span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6">

          <!-- Toolbar -->
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                v-if="activeTab === 'prodi'" v-model="searchProdi" @input="pageProdi=1"
                class="w-full pl-9 pr-4 py-2.5 bg-surface-container-low/60 border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Cari program studi..." />
              <input
                v-if="activeTab === 'matkul'" v-model="searchMatkul" @input="pageMatkul=1"
                class="w-full pl-9 pr-4 py-2.5 bg-surface-container-low/60 border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Cari mata kuliah..." />
              <input
                v-if="activeTab === 'kelas'" v-model="searchKelas" @input="pageKelas=1"
                class="w-full pl-9 pr-4 py-2.5 bg-surface-container-low/60 border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Cari kelas..." />
            </div>
            
            <input type="file" ref="fileInput" @change="handleFileUpload" accept=".xlsx, .xls, .csv" class="hidden" />
            
            <button
              @click="triggerImport"
              :disabled="isImporting"
              class="flex items-center justify-center gap-2 bg-white border border-green-500 text-green-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span v-if="isImporting" class="animate-spin material-symbols-outlined text-[18px]">sync</span>
              <span v-else class="material-symbols-outlined text-[18px]">upload_file</span>
              Import Excel
            </button>
            
            <button
              @click="openModal(activeTab)"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20 whitespace-nowrap"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              Tambah {{ tabs.find(t=>t.key===activeTab)?.label }}
            </button>
          </div>

          <!-- TABLE: Prodi -->
          <div v-if="activeTab === 'prodi'">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-outline-variant/10 bg-surface-container-low/30">
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest w-24">Kode</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Nama Program Studi</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="paginatedProdis.length === 0">
                  <td colspan="3" class="py-12 text-center text-slate-400 text-sm">
                    <span class="material-symbols-outlined text-4xl block mb-2 opacity-30">domain</span>
                    Belum ada data prodi.
                  </td>
                </tr>
                <tr v-for="p in paginatedProdis" :key="p.id" class="group hover:bg-surface-container-low/30 transition-colors">
                  <td class="px-4 py-3.5">
                    <span class="inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">{{ p.code }}</span>
                  </td>
                  <td class="px-4 py-3.5 text-sm font-semibold text-slate-700">{{ p.name }}</td>
                  <td class="px-4 py-3.5 text-right">
                    <div class="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="openModal('prodi', p)" class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer" title="Edit">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button @click="handleDelete('prodi', p.id)" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Pagination Prodi -->
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
              <p class="text-xs text-slate-400">Menampilkan {{ paginatedProdis.length }} dari {{ filteredProdis.length }} prodi</p>
              <div class="flex gap-1">
                <button @click="pageProdi--" :disabled="pageProdi===1" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary/5 rounded-lg">{{ pageProdi }} / {{ totalProdiPages }}</span>
                <button @click="pageProdi++" :disabled="pageProdi===totalProdiPages" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          </div>

          <!-- TABLE: Matkul -->
          <div v-if="activeTab === 'matkul'">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-outline-variant/10 bg-surface-container-low/30">
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest w-24">Kode</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Nama Mata Kuliah</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Program Studi</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="paginatedMatkuls.length === 0">
                  <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                    <span class="material-symbols-outlined text-4xl block mb-2 opacity-30">menu_book</span>
                    Belum ada data mata kuliah.
                  </td>
                </tr>
                <tr v-for="m in paginatedMatkuls" :key="m.id" class="group hover:bg-surface-container-low/30 transition-colors">
                  <td class="px-4 py-3.5">
                    <span class="inline-block bg-secondary/10 text-secondary text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">{{ m.code }}</span>
                  </td>
                  <td class="px-4 py-3.5 text-sm font-semibold text-slate-700">{{ m.name }}</td>
                  <td class="px-4 py-3.5">
                    <span v-if="m.prodi" class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-medium">{{ m.prodi.name }}</span>
                    <span v-else class="text-xs text-slate-300 italic">—</span>
                  </td>
                  <td class="px-4 py-3.5 text-right">
                    <div class="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="openModal('matkul', m)" class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button @click="handleDelete('matkul', m.id)" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
              <p class="text-xs text-slate-400">Menampilkan {{ paginatedMatkuls.length }} dari {{ filteredMatkuls.length }} matkul</p>
              <div class="flex gap-1">
                <button @click="pageMatkul--" :disabled="pageMatkul===1" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary/5 rounded-lg">{{ pageMatkul }} / {{ totalMatkulPages }}</span>
                <button @click="pageMatkul++" :disabled="pageMatkul===totalMatkulPages" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          </div>

          <!-- TABLE: Kelas -->
          <div v-if="activeTab === 'kelas'">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-outline-variant/10 bg-surface-container-low/30">
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest w-24">Kode</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Nama Kelas</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Program Studi</th>
                  <th class="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="paginatedKelas.length === 0">
                  <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                    <span class="material-symbols-outlined text-4xl block mb-2 opacity-30">groups</span>
                    Belum ada data kelas.
                  </td>
                </tr>
                <tr v-for="k in paginatedKelas" :key="k.id" class="group hover:bg-surface-container-low/30 transition-colors">
                  <td class="px-4 py-3.5">
                    <span class="inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">{{ k.code }}</span>
                  </td>
                  <td class="px-4 py-3.5 text-sm font-semibold text-slate-700">{{ k.name }}</td>
                  <td class="px-4 py-3.5">
                    <span v-if="k.prodi" class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-medium">{{ k.prodi.name }}</span>
                    <span v-else class="text-xs text-slate-300 italic">—</span>
                  </td>
                  <td class="px-4 py-3.5 text-right">
                    <div class="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="openModal('kelas', k)" class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button @click="handleDelete('kelas', k.id)" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
              <p class="text-xs text-slate-400">Menampilkan {{ paginatedKelas.length }} dari {{ filteredKelas.length }} kelas</p>
              <div class="flex gap-1">
                <button @click="pageKelas--" :disabled="pageKelas===1" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span class="px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary/5 rounded-lg">{{ pageKelas }} / {{ totalKelasPages }}</span>
                <button @click="pageKelas++" :disabled="pageKelas===totalKelasPages" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Unified Modal -->
    <Transition name="modal">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="closeModal"></div>
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-[18px]">
                  {{ modal.type === 'prodi' ? 'domain' : modal.type === 'matkul' ? 'menu_book' : 'groups' }}
                </span>
              </div>
              <h2 class="text-base font-extrabold text-primary">{{ modalTitle }}</h2>
            </div>
            <button @click="closeModal" class="w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Kode</label>
              <input v-model="modal.form.code" class="w-full px-4 py-2.5 bg-surface-container-low/60 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" :placeholder="modal.type==='prodi'?'Cth: TIF': modal.type==='matkul'?'Cth: MK001':'Cth: KLS001'" />
            </div>
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Nama</label>
              <input v-model="modal.form.name" class="w-full px-4 py-2.5 bg-surface-container-low/60 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" :placeholder="modal.type==='prodi'?'Cth: Teknik Informatika': modal.type==='matkul'?'Cth: Basis Data':'Cth: 2024A'" />
            </div>
            <div v-if="modal.type === 'matkul' || modal.type === 'kelas'">
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Program Studi</label>
              <select v-model="modal.form.prodiId" class="w-full px-4 py-2.5 bg-surface-container-low/60 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer">
                <option value="">Pilih Program Studi</option>
                <option v-for="p in prodis" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <button
              @click="handleSave"
              :disabled="saving"
              class="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer mt-2 shadow-md shadow-primary/20 disabled:opacity-60"
            >
              <span v-if="saving" class="flex items-center justify-center gap-2">
                <span class="animate-spin material-symbols-outlined text-[16px]">progress_activity</span> Menyimpan...
              </span>
              <span v-else>{{ modal.isEdit ? 'Simpan Perubahan' : 'Tambah Data' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
