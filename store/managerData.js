export const state = () => ({
  managerData: {
    definitions: [],
    data: [],
    loading: true,
    error: false
  }
});

export const actions = {
  async fetchManagerData({ commit }) {
    try {
      const url =
        "https://run.mocky.io/v3/09a1870d-294b-4d53-ac4f-87b676ddd000";
      commit("setLoading", true);
      commit("setError", false);
      const data = await this.$axios.$get(url, {
        data: {}
      });
      commit("setData", data);
    } catch (error) {
      console.error(error);
      commit("setError", true);
      commit("setLoading", false);
    } finally {
      commit("setLoading", false);
    }
  }
};

export const mutations = {
  setData(state, res) {
    state.managerData.definitions = res.definitions;
    state.managerData.data = res.data;
  },
  setLoading(state, bool) {
    state.managerData.loading = bool;
  },
  setError(state, bool) {
    state.managerData.error = bool;
  }
};

export const getters = {
  getData(state) {
    return state.managerData.data;
  },
  getDefinations(state) {
    return state.managerData.definitions;
  },
  getLoading(state) {
    return state.managerData.loading;
  },
  getError(state) {
    return state.managerData.error;
  }
};
