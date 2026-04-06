import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import DashboardPjView from '../views/DashboardPjView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login'
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
    }
  ]
})

export default router
