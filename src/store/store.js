import Vuex from "vuex";
import Vue from "vue";
import port from "port";
import socket, { loadLocal, saveLocal } from "../io";
import eventHub from "../eventHub";

Vue.use(Vuex);
let loginPromise;

function login({ email, password, data, mode, remember = true } = {}) {
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
        socket.emit("login", params, result => {
            store.commit("setUser", result.data);
            if (result.code) {
                reject(result);
                loginPromise = undefined;
            } else {
                if (remember) {
                    saveLocal("todoAccount", {
                        email: result.data.email,
                        password: result.data.password
                    });
                }
                store.commit("setLoginState", true);
                resolve(result);
                loginPromise = undefined;
            }
        });
    });
}

function list2map(list, key) {
    const map = {};
    list.forEach(li => {
        map[li[key]] = li;
    });
    return map;
}
const actions = {
    selectUser({ commit }) {
        commit("setModal", "userSelector");
        return new Promise((resolve, reject) => {
            eventHub.$once("select-user", uid => {
                resolve(uid);
            });
            eventHub.$once("modal-cancel", () => {
                reject();
            });
        });
    },
    login({ commit }, params) {
        if (!params) {
            if (!loginPromise) {
                loginPromise = login(params);
            }
            return loginPromise;
        }
        return login(params);
    },
    getProjects({ commit }) {
        return new Promise(resolve => {
            socket.emit("getProjects", {}, ({ data }) => {
                const tagMap = {};
                const map = list2map(data, "id");
                data.forEach(project => {
                    project.tags.forEach(tag => {
                        tagMap[tag.id] = tag;
                    });
                });
                commit("setTags", tagMap);
                commit("setProjects", map);
                resolve(map);
            });
        });
    },
    getUserMap({ commit }) {
        return new Promise(resolve => {
            socket.emit("getUserList", {}, ({ data: { list } }) => {
                const userMap = list2map(list, "uid");
                commit("setUserMap", userMap);
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
        list: [],
        unsaved: false,
        userSelector: false,
        showingModal: null
    },
    mutations: {
        setModal(state, value) {
            state.showingModal = value;
        },
        setUnsaved(state, unsaved) {
            state.unsaved = unsaved;
        },
        setLoginState(state, logged) {
            state.logged = logged;
        },
        setConnectionState(state, connection) {
            state.connected = connection;
        },
        setUser(state, userInfo) {
            state.user = userInfo;
        },
        setTags(state, tags) {
            state.tags = tags;
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
        setTodoList(state, list) {
            state.list = list;
        }
    },
    actions,
    getters: {
        uid2name(state) {
            return uid => {
                if (!uid) {
                    return "";
                }
                const user = state.userMap[uid];
                if (!user) {
                    return "not found";
                }
                return user.name;
            };
        },
        tag2project(state) {
            return tag => {
                console.log(state.projects, tag);
            };
        },
        projectInfo(state) {
            return id => {
                if (!id) {
                    return {};
                }
                const project = state.projects[id];
                if (!project) {
                    return "not found";
                }
                return project;
            };
        },
        tagInfo(state) {
            return id => {
                if (!id) {
                    return {};
                }
                const tag = state.tags[id];
                if (!tag) {
                    return "not found";
                }
                return tag;
            };
        }
    }
});
window.ddd = () => {
    console.log(store.state);
};
module.exports = store;
