import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import DashboardPjView from '../views/DashboardPjView.vue'
import DashboardAdminView from '../views/DashboardAdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth/login',
      name: 'login',
      component: AuthView
    },
    {
      path: '/auth/register',
      name: 'register',
      component: AuthView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPjView
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: DashboardAdminView
    }
  ]
})

export default router
