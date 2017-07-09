import Vuex from "vuex";
import Vue from 'vue';
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        user: {},
        commonTags: []
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
