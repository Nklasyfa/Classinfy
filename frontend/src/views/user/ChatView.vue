<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdminNavbar from '../../components/layout/AdminNavbar.vue'
import UserNavbar from '../../components/layout/UserNavbar.vue'
import axios from 'axios'

import AuroraImg from '../../assets/kelompok/Aurora.png'
import FaizImg from '../../assets/kelompok/Faiz.png'
import FathanImg from '../../assets/kelompok/Fathan.png'
import NabilaImg from '../../assets/kelompok/Nabila.png'
import NakulaImg from '../../assets/kelompok/Nakula.png'

const avatarMap = {
  aurora: AuroraImg,
  faiz: FaizImg,
  fathan: FathanImg,
  nabila: NabilaImg,
  nakula: NakulaImg
}

const getAvatarUrl = (username, profilePicture = null) => {
  if (profilePicture) return `${API_URL}${profilePicture}`;
  if (!username) return null;
  const nameKey = Object.keys(avatarMap).find(key => username.toLowerCase().includes(key));
  return nameKey ? avatarMap[nameKey] : null;
}

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const chatBox = ref(null)
const inputText = ref('')
const unreadCount = ref(0)
const isAdmin = computed(() => authStore.isAdmin)

const messages = ref([])
const conversations = ref([])
const selectedUserId = ref(null)
const selectedUserName = ref('Pilih percakapan')
const selectedUserProfilePic = ref(null)
let pollInterval = null

const initials = computed(() => {
  const name = authStore.user?.username || 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    authStore.logout()
    router.push('/auth/login')
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

const fetchMessages = async () => {
  try {
    if (isAdmin.value) {
      const res = await axios.get(`${API_URL}/api/chat`, { headers: authStore.getAuthHeaders() })
      conversations.value = res.data.data || []
    }

    if (isAdmin.value && !selectedUserId.value) {
      return
    }

    const url = isAdmin.value ? `${API_URL}/api/chat?userId=${selectedUserId.value}` : `${API_URL}/api/chat`
    const res = await axios.get(url, { headers: authStore.getAuthHeaders() })
    
    const fetched = res.data.data || []
    const formatted = fetched.map(m => ({
      id: m.id,
      fromUser: m.senderId === authStore.user.id,
      text: m.text,
      time: formatTime(m.createdAt),
      senderId: m.senderId,
      isRead: m.isRead
    }))

    const isNewMessage = formatted.length > messages.value.length
    messages.value = formatted

    if (isNewMessage) {
      await scrollBottom()
    }
    window.dispatchEvent(new CustomEvent('refresh-notifications'))
  } catch (error) {
    console.error('Failed fetching chat', error)
  }
}

const selectConversation = async (conv) => {
  selectedUserId.value = conv.userId
  selectedUserName.value = conv.username
  selectedUserProfilePic.value = conv.profilePicture
  conv.unreadCount = 0
  await fetchMessages()
  await scrollBottom()
}

onMounted(async () => {
  await fetchMessages()
  pollInterval = setInterval(fetchMessages, 3000)
  await scrollBottom()
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text) return
  if (isAdmin.value && !selectedUserId.value) {
    alert("Pilih chat dari list di kiri terlebih dahulu!")
    return
  }

  messages.value.push({
    id: Date.now(),
    fromUser: true,
    text: text,
    time: formatTime(new Date()),
    senderId: authStore.user.id,
    isRead: false
  })
  inputText.value = ''
  await scrollBottom()

  try {
    const payload = { text }
    if (isAdmin.value) payload.targetUserId = selectedUserId.value

    await axios.post(`${API_URL}/api/chat`, payload, { headers: authStore.getAuthHeaders() })
    await fetchMessages()
  } catch (error) {
    console.error('Failed sending message', error)
  }
}

const scrollBottom = async () => {
  await nextTick()
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}
</script>

<template>
  <div class="min-h-screen font-body flex flex-col relative overflow-hidden bg-[#F0F4F8] text-[#0b1c30]" style="height: 100vh;">
    <!-- Light Grid Background -->
    <div class="fixed inset-0 pointer-events-none z-0" style="background-image: radial-gradient(circle, #1a3c6e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.05;"></div>

    <!-- TopNavBar -->
    <AdminNavbar v-if="isAdmin" />
    <UserNavbar v-else />

    <!-- Chat Area -->
    <main class="flex-1 flex px-6 pt-28 pb-5 max-w-5xl mx-auto w-full relative z-10 gap-6" style="min-height: 0;">
      
      <!-- Admin Sidebar List -->
      <div v-if="isAdmin" class="w-1/3 bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-slate-100 flex flex-col overflow-hidden h-full">
        <div class="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 class="font-extrabold text-[#1A3C6E]">Daftar Pesan</h2>
          <p class="text-xs text-slate-500 font-medium">Pilih user untuk membalas pesan.</p>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="conversations.length === 0" class="p-6 text-center text-slate-400 text-sm font-medium">
            Belum ada pesan masuk.
          </div>
          <div 
            v-for="conv in conversations" :key="conv.userId"
            @click="selectConversation(conv)"
            :class="['p-4 border-b border-slate-50 cursor-pointer transition-colors', selectedUserId === conv.userId ? 'bg-[#1A3C6E]/5 border-l-4 border-l-[#1A3C6E]' : 'hover:bg-slate-50']"
          >
            <div class="flex justify-between items-center mb-1">
              <div class="flex items-center gap-2 truncate pr-2">
                <img v-if="getAvatarUrl(conv.username, conv.profilePicture)" :src="getAvatarUrl(conv.username, conv.profilePicture)" class="w-6 h-6 rounded-full object-cover shrink-0" />
                <span v-else class="w-6 h-6 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-[10px] font-bold shrink-0">{{ conv.username.charAt(0).toUpperCase() }}</span>
                <span class="font-bold text-[#1A3C6E] text-sm truncate">{{ conv.username }}</span>
              </div>
              <span class="text-[10px] font-semibold text-slate-400 shrink-0">{{ formatTime(conv.time) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-xs text-slate-500 truncate mr-2">{{ conv.lastMessage }}</p>
              <span v-if="conv.unreadCount > 0" class="bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shrink-0">
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Box -->
      <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,60,110,0.06)] border border-slate-100 flex flex-col overflow-hidden h-full transition-all" :class="isAdmin ? 'w-2/3' : 'w-full max-w-3xl mx-auto'">
        <!-- Chat Header -->
        <div class="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div class="w-10 h-10 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            <template v-if="isAdmin && selectedUserId">
              <img v-if="getAvatarUrl(selectedUserName, selectedUserProfilePic)" :src="getAvatarUrl(selectedUserName, selectedUserProfilePic)" class="w-full h-full object-cover" />
              <span v-else>{{ selectedUserName.charAt(0).toUpperCase() }}</span>
            </template>
            <template v-else-if="!isAdmin">
              <span>A</span>
            </template>
            <template v-else>
              <span>?</span>
            </template>
          </div>
          <div>
            <p class="font-extrabold text-[#1A3C6E] text-sm">{{ isAdmin ? (selectedUserId ? selectedUserName : 'Pilih User dari List') : 'Admin CLASSINFY' }}</p>
            <div class="flex items-center gap-1.5" v-if="!isAdmin || selectedUserId">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <span class="text-[10px] text-slate-400 font-medium">Live Chat Connected</span>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <span class="material-symbols-outlined text-xs">shield</span>
            End-to-End
          </div>
        </div>

        <!-- Messages -->
        <div ref="chatBox" class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50" style="min-height: 0;">
          <div class="text-center">
            <span class="text-[10px] font-bold text-slate-300 bg-slate-100 px-4 py-1 rounded-full uppercase tracking-wider">Live Chat Dimulai</span>
          </div>
          
          <div v-if="isAdmin && !selectedUserId" class="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
            ⬅️ Klik percakapan di sebelah kiri untuk membalas pesan.
          </div>

          <div v-for="msg in messages" :key="msg.id" :class="msg.fromUser ? 'flex justify-end' : 'flex justify-start items-end gap-2'">
            <div v-if="!msg.fromUser" class="w-7 h-7 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
              <template v-if="isAdmin">
                <img v-if="getAvatarUrl(selectedUserName, selectedUserProfilePic)" :src="getAvatarUrl(selectedUserName, selectedUserProfilePic)" class="w-full h-full object-cover" />
                <span v-else>{{ selectedUserName.charAt(0).toUpperCase() }}</span>
              </template>
              <template v-else>
                <span>A</span>
              </template>
            </div>
            <div :class="[
              'max-w-[72%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm border border-slate-100/50',
              msg.fromUser
                ? 'bg-[#1A3C6E] text-white rounded-br-sm'
                : 'bg-white text-slate-700 rounded-bl-sm'
            ]">
              <p>
                {{ msg.text }}
              </p>
              <div :class="msg.fromUser ? 'text-blue-200' : 'text-slate-400'" class="flex items-center justify-end gap-1 mt-1">
                <span class="text-[9px] font-bold">{{ msg.time }}</span>
                <span v-if="msg.fromUser" class="material-symbols-outlined text-[12px]" :class="msg.isRead ? 'text-blue-300' : 'text-blue-200/50'">
                  {{ msg.isRead ? 'done_all' : 'check' }}
                </span>
              </div>
            </div>
            <div v-if="msg.fromUser" class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0 overflow-hidden">
              <img v-if="getAvatarUrl(authStore.user?.username, authStore.user?.profilePicture)" :src="getAvatarUrl(authStore.user?.username, authStore.user?.profilePicture)" class="w-full h-full object-cover" />
              <span v-else>{{ initials }}</span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="shrink-0 px-4 py-3 border-t border-slate-100 flex items-center gap-3 bg-white">
          <div class="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 py-2.5 gap-3 focus-within:ring-2 focus-within:ring-[#1A3C6E]/20 transition-all border border-slate-200/60">
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              :disabled="isAdmin && !selectedUserId"
              :placeholder="isAdmin && !selectedUserId ? 'Pilih user untuk chat...' : 'Ketik pesan kamu...'"
              class="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none disabled:cursor-not-allowed"
            />
            <button @click="sendMessage" :disabled="(!inputText.trim()) || (isAdmin && !selectedUserId)" class="disabled:opacity-30 cursor-pointer transition-transform hover:scale-110">
              <span class="material-symbols-outlined text-[#1A3C6E]" style="font-variation-settings: 'FILL' 1;">send</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
