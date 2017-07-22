import Vuex from "vuex";
import Vue from 'vue';
import port from "port";
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        user: {},
        commonTags: [],
        port,
        userMap: {}
    },
    mutations: {
        setUser(state, userInfo) {
            state.user = userInfo;
        },
        setCommonTags(state, tags) {
            state.commonTags = tags;
        },
        setUserMap(state, map) {
            state.userMap = map;
        }
    }
})
module.exports = store;
