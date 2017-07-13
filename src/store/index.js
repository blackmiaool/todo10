import Vuex from "vuex";
import Vue from 'vue';
import port from "port";
console.log('port', port)
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        user: {},
        commonTags: [],
        port,
    },
    mutations: {
        setUser(state, userInfo) {
            state.user = userInfo;
        },
        setCommonTags(state, tags) {
            state.commonTags = tags;
        }
    }
})
module.exports = store;
