import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../components/views/MapView.vue'
import FootprintView from '../components/views/FootprintView.vue'
import PlanView from '../components/views/PlanView.vue'
import SettingsView from '../components/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapView,
      meta: { index: 0, showTabBar: true }
    },
    {
      path: '/footprint',
      name: 'footprint',
      component: FootprintView,
      meta: { index: 1, showTabBar: true }
    },
    {
      path: '/plan',
      name: 'plan',
      component: PlanView,
      meta: { index: 2, showTabBar: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { index: 3, showTabBar: true }
    }
  ]
})

export default router
