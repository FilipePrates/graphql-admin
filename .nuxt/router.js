import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _3f81c531 = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _02dc6645 = () => interopDefault(import('../pages/setup.vue' /* webpackChunkName: "pages/setup" */))
const _00f3fbfc = () => interopDefault(import('../pages/setupGQLTemplates.vue' /* webpackChunkName: "pages/setupGQLTemplates" */))
const _2134bb56 = () => interopDefault(import('../pages/lista/_type.vue' /* webpackChunkName: "pages/lista/_type" */))
const _600882ae = () => interopDefault(import('../pages/perfil/_type/_id.vue' /* webpackChunkName: "pages/perfil/_type/_id" */))
const _75da221a = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _3f81c531,
    name: "login"
  }, {
    path: "/setup",
    component: _02dc6645,
    name: "setup"
  }, {
    path: "/setupGQLTemplates",
    component: _00f3fbfc,
    name: "setupGQLTemplates"
  }, {
    path: "/lista/:type?",
    component: _2134bb56,
    name: "lista-type"
  }, {
    path: "/perfil/:type?/:id?",
    component: _600882ae,
    name: "perfil-type-id"
  }, {
    path: "/",
    component: _75da221a,
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
