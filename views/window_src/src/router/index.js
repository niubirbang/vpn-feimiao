import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const noauth = true
const notitle = true
const nobackup = true
const tabbar = true

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/recharge',
      name: 'recharge',
      component: () => import('@/views/RechargeV2.vue'),
      meta: {
        tabbar,
        nobackup,
      },
    },
    {
      path: '/application',
      name: 'application',
      component: () => import('@/views/Application.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/User.vue'),
      meta: {
        tabbar,
        nobackup,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/registe',
      name: 'registe',
      component: () => import('@/views/Registe.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/forget_password',
      name: 'forget_password',
      component: () => import('@/views/ForgetPassword.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/bind',
      name: 'bind',
      component: () => import('@/views/Bind.vue'),
      meta: {},
    },
    {
      path: '/recharge_full',
      name: 'recharge_full',
      component: () => import('@/views/Recharge.vue'),
      meta: {},
    },
    {
      path: '/node',
      name: 'node',
      component: () => import('@/views/Node.vue'),
      meta: {},
    },
    {
      path: '/invite',
      name: 'invite',
      component: () => import('@/views/Invite.vue'),
      meta: {},
    },
    {
      path: '/bind_invite',
      name: 'bind_invite',
      component: () => import('@/views/InviteBind.vue'),
      meta: {},
    },
    {
      path: '/invite_history',
      name: 'invite_history',
      component: () => import('@/views/InviteHistory.vue'),
      meta: {},
    },
    {
      path: '/invite_award',
      name: 'invite_award',
      component: () => import('@/views/InviteAward.vue'),
      meta: {},
    },
    {
      path: '/about_us',
      name: 'about_us',
      component: () => import('@/views/AboutUs.vue'),
      meta: {},
    },
    {
      path: '/delete_account',
      name: 'delete_account',
      component: () => import('@/views/DeleteAccount.vue'),
      meta: {},
    },
    {
      path: '/third_page',
      name: 'third_page',
      component: () => import('@/views/ThirdPage.vue'),
      meta: {},
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/Test.vue'),
      meta: {},
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (
    ['/login', '/registe', '/forget_password'].includes(to.path) &&
    store.state.authorized &&
    store.state.authorization_type === 'user'
  ) {
    next('/')
    return
  }
  if (to.meta && to.meta.noauth) {
    next()
    return
  }
  if (!store.state.authorized) {
    next({
      path: '/login',
      query: {
        from: to.path,
      },
    })
    return
  }
  next()
})

export default router
