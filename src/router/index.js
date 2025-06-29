import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import HomeView from '../views/HomeView.vue'
import TasksView from '../views/TasksView.vue'
import FriendsView from '../views/FriendsView.vue'
import LoadingView from '../views/LoadingView.vue'
import BestReferals from '@/views/BestReferals.vue'
import GameView from '@/game/GameView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Basic slash is the route path for the first rendering page
      name: 'loading',
      component: LoadingView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
    {
      path: '/best-referals',
      name: 'best-referals',
      component: BestReferals,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
    },
  ],
})

// Global guard: check subscription before any route except `/subscribe`
router.beforeEach(async (to, from, next) => {
  const app = useAppStore()

  // Always let them go to the subscribe page, or if the store hasn't initialized yet
  if (to.name === 'tasks' || !app.not_done_tasks.length) {
    return next()
  }

  // If they haven’t completed all sponsor subscriptions, redirect to /subscribe
  if (!app.checkSponsors()) {
    return next({ name: 'tasks' })
  }

  // Otherwise allow
  next()
})

export default router
