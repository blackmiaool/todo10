// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
// import Chat from './Chat'
import Login from "./pages/Login";
import Todo from "./pages/Todo";
import View from "./pages/View";
import List from "./pages/List";
import UserPage from "./pages/User";
import Settings from "./pages/Settings";
import socket from "./io";

import LeftTabs from "./components/LeftTabs";
import VueRouter from "vue-router";

import VueI18n from "vue-i18n";
import store from "store";

require("port");
require("./less/style.less");
const Clipboard = require("clipboard");
const messages = require("./i18n");

new Clipboard("[data-clipboard-text]");

/* eslint-disable no-new */
Date.prototype.format = function(format) {
    const zeros = ["", "0", "00", "000"];
    const c = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) {
        format = format.replace(
            RegExp.$1,
            `${this.getFullYear()}`.substr(4 - RegExp.$1.length)
        );
    }

    for (const k in c) {
        if (new RegExp(`(${k})`).test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1
                    ? c[k]
                    : (zeros[RegExp.$1.length] + c[k]).substr(`${c[k]}`.length)
            );
        }
    }
    return format;
};
Vue.use(VueI18n);
Vue.use(VueRouter);
const i18n = new VueI18n({
    locale: localStorage.getItem("testChinese") ? "zh-CN" : navigator.language, // set locale
    // locale: 'zh-CN', // set locale
    silentTranslationWarn: true,
    messages // set locale messages
});
/*eslint-disable */
const routes = [
    {
        path: "/",
        component: Todo
    },
    {
        path: "/login",
        component: Login,
        name: "Login"
    },
    {
        path: "/settings",
        component: Settings,
        name: "Settings"
    },
    {
        path: "/todo",
        component: Todo,
        name: "Todo"
    },
    {
        path: "/view",
        component: View,
        name: "View"
    },
    {
        path: "/list",
        component: List,
        name: "List"
    },
    {
        path: "/user",
        component: UserPage,
        name: "UserPage"
    }
];
/*eslint-disable */
socket.on("connect", () => {
    store.commit("setConnectionState", true);
    store.dispatch("login");
});
socket.on("disconnect", () => {
    store.commit("setConnectionState", false);
    store.commit("setLoginState", false);
});
window.router = new VueRouter({
    routes // short for routes: routes
});
store.dispatch("getProjects").then(projects => {});
store.dispatch("getUserMap").then(map => {});
Vue.filter("messageDate", value => new Date(value).format("hh:mm"));
new Vue({
    i18n,
    router: window.router,
    data: {
        avatar: ""
    },
    store: store,
    mounted() {},
    computed: {
        connected: () => store.state.connected
    },
    components: {
        lefttabs: LeftTabs
    }
}).$mount("#app");
