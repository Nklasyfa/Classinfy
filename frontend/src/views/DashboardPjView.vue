<template>
  <div class="bg-[#F0F4F8] font-body text-on-surface min-h-screen relative overflow-x-hidden">
    <!-- Background Layering -->
    <div class="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0"></div>

    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-6 pointer-events-none">
      <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(26,60,110,0.06)] h-[60px] max-w-[900px] w-full flex items-center justify-between px-6 pointer-events-auto">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white text-xs font-extrabold tracking-tighter">C</span>
          </div>
          <span class="font-extrabold text-primary tracking-tighter text-xl">CLASSIFY</span>
        </div>
        
        <div class="hidden md:flex items-center gap-2">
          <a class="bg-[#1A3C6E] text-white rounded-full px-6 py-2 font-medium text-sm tracking-tight transition-all duration-300 scale-105" href="#">Dashboard</a>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Jadwal Saya</a>
          <a class="text-primary/70 px-4 font-medium text-sm tracking-tight hover:text-[#1A3C6E] transition-all duration-300" href="#">Riwayat</a>
        </div>
        
        <div class="flex items-center gap-4">
          <button class="relative p-2 text-primary/70 hover:scale-110 transition-transform">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          
          <div class="flex items-center gap-2 pl-2 cursor-pointer group relative" @click="handleLogout">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm editorial-shadow transition-transform group-hover:scale-105">
              {{ initials }}
            </div>
            <!-- Logout tooltip hint -->
            <div class="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg py-1 px-3 text-xs font-bold text-error opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Keluar
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content Canvas -->
    <main class="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      
      <!-- Greeting Section -->
      <section class="flex flex-col items-center text-center space-y-6">
        <div class="bg-surface-container-lowest editorial-shadow rounded-full px-8 py-4 flex flex-col md:flex-row items-center gap-6 max-w-2xl w-full">
          <div class="w-16 h-16 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xl font-bold editorial-shadow">
            {{ initials }}
          </div>
          <div class="text-left flex-1 text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Selamat datang, {{ user?.username || 'Budi Santoso' }} 👋</h1>
            <p class="text-on-surface-variant font-medium text-sm">Role: {{ user?.role?.name || 'Penanggung Jawab Mata Kuliah' }}</p>
          </div>
          <div class="bg-surface-container-high text-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap mt-4 md:mt-0">
            {{ currentDate }}
          </div>
        </div>
      </section>

      <!-- Summary Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-primary/5 rounded-lg">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
            </div>
            <a class="text-primary font-bold text-sm group-hover:underline" href="#">Lihat →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Jadwal Hari Ini</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-primary">4</span>
            <span class="text-primary/60 font-semibold text-sm">mata kuliah</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-green-50 rounded-lg">
              <span class="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <a class="text-primary font-bold text-sm group-hover:underline" href="#">Lihat →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Sudah Dipakai</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-green-600">2</span>
            <span class="text-green-600/60 font-semibold text-sm">hari ini</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-surface-container-lowest rounded-xl p-6 border-2 border-orange-200 editorial-shadow group hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-bl-full -mr-4 -mt-4"></div>
          <div class="flex justify-between items-start mb-4 relative z-10">
            <div class="p-2 bg-orange-50 rounded-lg">
              <span class="material-symbols-outlined text-orange-600">warning</span>
            </div>
            <a class="text-orange-600 font-bold text-sm group-hover:underline" href="#">Update →</a>
          </div>
          <h3 class="text-on-surface-variant font-medium text-sm">Perlu Update</h3>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-orange-600">2</span>
            <span class="text-orange-600/60 font-semibold text-sm">status pending</span>
          </div>
        </div>
      </section>

      <!-- Main Table Card -->
      <section class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-visible">
        <div class="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">calendar_today</span>
            <h2 class="text-xl font-extrabold text-primary tracking-tight">Jadwal Tanggung Jawab Saya</h2>
          </div>
          <div class="flex bg-surface-container-low p-1 rounded-full w-fit max-w-full overflow-x-auto">
            <button class="px-4 md:px-6 py-2 bg-primary text-white rounded-full text-xs font-bold whitespace-nowrap">Hari Ini ●</button>
            <button class="px-4 md:px-6 py-2 text-on-surface-variant text-xs font-bold hover:text-primary transition-colors whitespace-nowrap">Minggu Ini</button>
            <button class="px-4 md:px-6 py-2 text-on-surface-variant text-xs font-bold hover:text-primary transition-colors whitespace-nowrap">Semua</button>
          </div>
        </div>
        
        <div class="overflow-x-auto pb-8">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="text-on-surface-variant/60 font-bold text-xs uppercase tracking-widest bg-surface-container-low/50">
                <th class="px-8 py-4">Jam</th>
                <th class="px-6 py-4">Ruang</th>
                <th class="px-6 py-4">Mata Kuliah</th>
                <th class="px-6 py-4">Kelas</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr class="hover:bg-surface-container-low/30 transition-colors">
                <td class="px-8 py-5 font-bold text-primary">07.00-08.40</td>
                <td class="px-6 py-5 font-semibold text-on-surface-variant">MG1-101</td>
                <td class="px-6 py-5 font-bold text-primary">Basis Data</td>
                <td class="px-6 py-5 font-bold text-on-surface-variant">A</td>
                <td class="px-6 py-5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Terjadwal
                  </span>
                </td>
                <td class="px-6 py-5 text-right pr-8">
                  <button class="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg text-xs font-bold inline-flex flex-row items-center gap-2 ml-auto">
                    Ubah Status <span class="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                  </button>
                </td>
              </tr>
              
              <tr class="hover:bg-surface-container-low/30 transition-colors">
                <td class="px-8 py-5 font-bold text-primary">08.40-10.20</td>
                <td class="px-6 py-5 font-semibold text-on-surface-variant">MG1-202</td>
                <td class="px-6 py-5 font-bold text-primary">Pemrog. Web</td>
                <td class="px-6 py-5 font-bold text-on-surface-variant">B</td>
                <td class="px-6 py-5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Dipakai
                  </span>
                </td>
                <td class="px-6 py-5 text-right pr-8">
                  <button class="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg text-xs font-bold inline-flex flex-row items-center gap-2 ml-auto">
                    Ubah Status <span class="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                  </button>
                </td>
              </tr>
              
              <tr class="hover:bg-surface-container-low/30 transition-colors border-l-4 border-l-orange-500">
                <td class="px-8 py-5 font-bold text-primary">13.40-15.20</td>
                <td class="px-6 py-5 font-semibold text-on-surface-variant">MG2-101</td>
                <td class="px-6 py-5 font-bold text-primary">Jaringan Komp.</td>
                <td class="px-6 py-5 font-bold text-on-surface-variant">C</td>
                <td class="px-6 py-5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Ditunda
                  </span>
                </td>
                <td class="px-6 py-5 text-right pr-8 relative">
                  <button class="bg-primary text-white border border-primary px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 ml-auto hover:bg-primary-container transition-colors shadow-sm">
                    Ubah Status <span class="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                  </button>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
      </section>

      <!-- History Card -->
      <section class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
        <div class="p-6 md:p-8 flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl text-primary">history</span>
          <h2 class="text-xl font-extrabold text-primary tracking-tight">Riwayat Perubahan Status</h2>
        </div>
        <div class="overflow-x-auto px-8 pb-4">
          <table class="w-full text-left min-w-[500px]">
            <thead>
              <tr class="text-on-surface-variant/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                <th class="py-4">Tanggal</th>
                <th class="py-4">Ruang</th>
                <th class="py-4">Mata Kuliah</th>
                <th class="py-4">Perubahan</th>
                <th class="py-4 text-right">Jam Update</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr class="border-t border-primary/5">
                <td class="py-5 font-semibold text-on-surface-variant">10/03/2026</td>
                <td class="py-5 font-bold text-primary">MG1-101</td>
                <td class="py-5 font-bold text-primary">Basis Data</td>
                <td class="py-5 flex flex-wrap items-center gap-3">
                  <span class="px-3 py-1 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px]">Terjadwal</span>
                  <span class="material-symbols-outlined text-primary/40 text-sm">trending_flat</span>
                  <span class="px-3 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">Online</span>
                </td>
                <td class="py-5 text-right font-bold text-primary/60">06.45</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-6 bg-surface-container-low/30 text-right">
          <a class="text-primary font-extrabold text-sm hover:underline inline-flex flex-row items-center justify-end gap-2" href="#">
            Lihat Riwayat Lengkap <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="w-full py-8 mt-auto px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-primary/5">
      <p class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40">© 2026 CLASSIFY UNESA. Digital Quad System.</p>
      <div class="flex items-center gap-8">
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Panduan PJ</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Bantuan</a>
        <a class="font-['Plus_Jakarta_Sans'] text-xs font-medium text-blue-900/40 hover:text-blue-900 transition-colors opacity-80 hover:opacity-100" href="#">Kebijakan Privasi</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userContext = localStorage.getItem('user');
const user = ref(userContext ? JSON.parse(userContext) : null);

const initials = computed(() => {
  if (!user.value || !user.value.username) return 'BS';
  return user.value.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());
})

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  }
}

onMounted(() => {
  if (!user.value) {
    // router.push('/auth/login'); // Enforce auth natively
  }
});
</script>

<style scoped>
.grid-bg {
    background-color: #F0F4F8;
    background-image: 
        linear-gradient(#C8D5E8 0.5px, transparent 0.5px),
        linear-gradient(90deg, #C8D5E8 0.5px, transparent 0.5px);
    background-size: 24px 24px;
}
.editorial-shadow {
    box-shadow: 0 8px 32px rgba(26, 60, 110, 0.06);
}
</style>
