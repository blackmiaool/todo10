import Vuex from "vuex";
import Vue from 'vue';
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        user: {}
    },
    mutations: {
        setUser(state, userInfo) {
            state.user = userInfo;
        }
    }
})
module.exports = store;
