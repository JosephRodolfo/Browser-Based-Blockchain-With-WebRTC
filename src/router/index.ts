import { createRouter, createWebHistory } from 'vue-router'
import Connections from '../pages/Connections.vue'
import Dashboard from '../pages/Dashboard.vue'

const routes = [
  {
    path: '/connections',
    name: 'Connections',
    component: Connections
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
