import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import SearchProperties from "./SearchProperties";

Vue.use(Vuex);

const vuexPersist = new VuexPersistence({
  storage: window.localStorage,
  modules: ["SearchProperties"],
});

export const plugins = [vuexPersist.plugin];
export const modules = { SearchProperties };
// /* eslint-disable no-new */
// export const store = new Vuex.Store({
//   plugins: [vuexPersist.plugin],
//   state: {},
//   mutations: {},
//   getters: {},
//   modules: { SearchProperties },
// });

export const state = () => ({
  user: {},
  feedBackText: "",
  feedBackDialog: false,
});
export const getters = {
  getUser(state) {
    return state.user;
  },
  getFeedBackText(state) {
    return state.feedBackText;
  },
  getFeedBackDialog(state) {
    return state.feedBackDialog;
  },
};
export const mutations = {
  setUser(state, payload) {
    state.user = payload;
  },
  setFeedBackText(state, payload) {
    state.feedBackText = payload;
  },
  setFeedBackDialog(state, payload) {
    state.feedBackDialog = payload;
  },
};
