const state = () => ({
  lastSearchTerms: {
    redes: "",
    escolas: "",
    turmas: "",
    alunos: "",
    educadores: "",
    gestores: "",
    responsaveis: "",
    admins: "",
    atividades: "",
    avaliações: "",
  },
});

const getters = {
  lastSearchTerms(state) {
    return state.lastSearchTerms;
  },
};

const mutations = {
  setLastSearchTerms(state, payload) {
    state.lastSearchTerms = payload;
  },
};

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations,
};
