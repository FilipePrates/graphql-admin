import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _d7c7fc9c = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _5206ac1a = () => interopDefault(import('../pages/olimpiada-nacional.vue' /* webpackChunkName: "pages/olimpiada-nacional" */))
const _f3328bd4 = () => interopDefault(import('../pages/lista/_type.vue' /* webpackChunkName: "pages/lista/_type" */))
const _0b2f50f0 = () => interopDefault(import('../pages/perfil/_type/_id.vue' /* webpackChunkName: "pages/perfil/_type/_id" */))
const _6b1742ca = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/login",
    component: _d7c7fc9c,
    name: "login"
  }, {
    path: "/olimpiada-nacional",
    component: _5206ac1a,
    name: "olimpiada-nacional"
  }, {
    path: "/lista/:type?",
    component: _f3328bd4,
    name: "lista-type"
  }, {
    path: "/perfil/:type?/:id?",
    component: _0b2f50f0,
    name: "perfil-type-id"
  }, {
    path: "/",
    component: _6b1742ca,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
