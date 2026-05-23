import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Public
import HomeView from '../views/public/HomeView.vue'

// Auth
import AuthView from '../views/auth/AuthView.vue'

// User
import DashboardPjView from '../views/user/DashboardPjView.vue'
import AjukanPeminjamanView from '../views/user/AjukanPeminjamanView.vue'

// Admin
import DashboardAdminView from '../views/admin/DashboardAdminView.vue'
import PermohonanAdminView from '../views/admin/PermohonanAdminView.vue'
import DetailPermohonanAdminView from '../views/admin/DetailPermohonanAdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/auth/login',
      name: 'login',
      component: AuthView,
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: AuthView,
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPjView,
      meta: { requiresAuth: true, roles: [1, 2, 3, 4] }, // Semua role bisa akses
    },
    {
      path: '/peminjaman',
      name: 'peminjaman',
      component: AjukanPeminjamanView,
      meta: { requiresAuth: true, roles: [1, 2, 3, 4] },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: DashboardAdminView,
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
    {
      path: '/admin/fasilitas',
      name: 'admin-fasilitas',
      component: () => import('../views/admin/FasilitasAdminView.vue'),
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
    {
      path: '/admin/akademik',
      name: 'admin-akademik',
      component: () => import('../views/admin/MasterAkademikAdminView.vue'),
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
    {
      path: '/admin/permohonan',
      name: 'admin-permohonan',
      component: PermohonanAdminView,
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
    {
      path: '/admin/permohonan/:id',
      name: 'admin-permohonan-detail',
      component: DetailPermohonanAdminView,
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/UserAdminView.vue'),
      meta: { requiresAuth: true, roles: [1] }, // Hanya Admin
    },
  ],
})

// ==================== NAVIGATION GUARDS ====================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Load dari localStorage jika belum
  if (!authStore.isAuthenticated) {
    authStore.loadFromStorage()
  }

  // 1. Route membutuhkan autentikasi
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 2. Route khusus guest (login/register) — redirect jika sudah login
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next(authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
  }

  // 3. Role-based access control
  if (to.meta.roles && authStore.isAuthenticated) {
    const userRoleId = authStore.roleId
    if (!to.meta.roles.includes(userRoleId)) {
      // Redirect ke dashboard sesuai role
      return next(authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
    }
  }

  next()
})

export default router
