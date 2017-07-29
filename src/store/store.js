import Vuex from "vuex";
import Vue from 'vue';
import port from "port";
import socket, {
    loadLocal,
    saveLocal
} from "../io";
Vue.use(Vuex);
let loginPromise;

function login({
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
                loginPromise = undefined;
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
                loginPromise = undefined;
            } else {
                if (remember) {
                    saveLocal('todoAccount', {
                        email: result.data.email,
                        password: result.data.password
                    });
                }
                store.commit('setLoginState', true);
                resolve(result);
                loginPromise = undefined;
            }
        });
    });
}

function list2map(list, key) {
    const map = {};
    list.forEach((li) => {
        map[li[key]] = li;
    });
    return map;
}
const actions = {
    login({
        commit,
    }, params) {
        if (!params) {
            if (!loginPromise) {
                loginPromise = login(params);
            }
            return loginPromise;
        } else {
            return login(params);
        }
    },
    getProjects({
        commit
    }) {
        return new Promise((resolve) => {
            socket.emit("getProjects", {}, ({
                code,
                data
            }) => {
                const map = list2map(data, 'id');
                commit("setProjects", map);
                resolve(map);
            });
        });
    },
    getUserMap({
        commit
    }) {
        return new Promise((resolve) => {
            socket.emit("getUserList", {}, ({
                code,
                data: {
                    list
                }
            }) => {
                const userMap = list2map(list, 'uid');
                store.commit("setUserMap", userMap);
                resolve(userMap);
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
        logged: false,
        projects: {},
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
        },
        setProjects(state, map) {
            state.projects = map;
        },
    },
    actions,
    getters: {
        uid2name(state) {
            return (uid) => {
                if (!uid) {
                    return '';
                }
                const user = state.userMap[uid];
                if (!user) {
                    return 'not found';
                }
                return user.name;
            }
        },
        project2name(state) {
            return (id) => {
                if (!id) {
                    return '';
                }
                const project = state.projects[id];
                if (!project) {
                    return 'not found';
                }
                return project.name;
            };
        }
    }
});
window.ddd = () => {
    console.log(store.state);
};
module.exports = store;
