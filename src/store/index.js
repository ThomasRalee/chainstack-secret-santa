import { pathOr, prop } from 'ramda';
import Vue from 'vue';
import Vuex from 'vuex';
import { getContract, getSantaContract, getWeb3 } from '@/utils/web3';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    web3: {},
    contractInstance: null,
    santaContractInstance: null,
  },
  getters: {
    web3: prop('web3'),
    account: pathOr(null, ['web3', 'account']),
    contractInstance: prop('contractInstance'),
    santaContractInstance: prop('santaContractInstance'),
  },
  mutations: {
    setWeb3(state, payload) {
      state.web3 = payload;
    },

    setContract(state, contractInstance) {
      state.contractInstance = () => contractInstance;
    },

    setSantaContract(state, santaContractInstance) {
      state.santaContractInstance = () => santaContractInstance;
    },
  },
  actions: {
    initContract({ commit }) {
      getContract()
        .then(contract => {
          commit('setContract', contract);
        })
        .catch(e => {
          console.log('error in action initContract', e);
        });
    },

    initSantaContract({ commit }, address) {
      getSantaContract(address)
        .then(contract => {
          commit('setSantaContract', contract);
        })
        .catch(e => {
          console.log('error in action initSantaContract', e);
        });
    },

    initWeb3({ commit }) {
      getWeb3
        .then(result => {
          commit('setWeb3', result);
        })
        .catch(e => {
          console.log('error in action initWeb3', e);
        });
    },
  },
});
