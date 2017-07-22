import Vuex from "vuex";
import Vue from 'vue';
import port from "port";
import socket, {
    loadLocal,
    saveLocal
} from "../io";
Vue.use(Vuex)
const actions = {
    login({
        commit,
    }, {
        email,
        password,
        data,
        mode,
        remember = true,
    } = {}) {
        return new Promise((resolve, reject) => {
            let params;
            if (mode) {
                params = {
                    mode,
                    data
                };
            } else if (!email) {
                const local = loadLocal("todoAccount") || {};
                email = local.email;
                password = local.password;
                if (!email) {
                    reject();
                } else {
                    params = {
                        email,
                        password
                    };
                }
            } else {
                params = {
                    email,
                    password
                };
            }
            socket.emit("login", params, (result) => {
                store.commit('setUser', result.data);
                if (result.code) {
                    reject(result);
                } else {
                    if (remember) {
                        saveLocal('todoAccount', {
                            email: result.data.email,
                            password: result.data.password
                        });
                    }
                    store.commit('setLoginState', true);
                    resolve(result);
                }
            });
        });
    }
};
const store = new Vuex.Store({
    state: {
        user: {},
        commonTags: [],
        port,
        userMap: {},
        connected: false,
        logged: false
    },
    mutations: {
        setLoginState(state, logged) {
            state.logged = logged;
        },
        setConnectionState(state, connection) {
            state.connected = connection;
        },
        setUser(state, userInfo) {
            state.user = userInfo;
        },
        setCommonTags(state, tags) {
            state.commonTags = tags;
        },
        setUserMap(state, map) {
            state.userMap = map;
        }
    },
    actions
})

module.exports = store;
