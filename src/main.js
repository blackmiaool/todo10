// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import Chat from './Chat'
import Login from './pages/Login'
import Todo from './pages/Todo'
import Settings from './pages/Settings'
import socket from './io';

import LeftTabs from './components/LeftTabs';
import VueRouter from 'vue-router';
require("port");
require("./less/style.less");

/* eslint-disable no-new */
Date.prototype.format = function (format) {
    const zeros = ['', '0', '00', '000'];
    const c = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S+': this.getMilliseconds(),
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
    }

    for (const k in c) {
        if (new RegExp(`(${k})`).test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (c[k]) : ((zeros[RegExp.$1.length] + c[k]).substr((`${c[k]}`).length)));
        }
    }
    return format;
};

Vue.use(VueRouter);

const routes = [{
        path: '/',
        component: Todo,

    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/settings',
        component: Settings,
        name: "Settings"
    },
    {
        path: '/todo',
        component: Todo,
        name: "Todo"
    }
];
socket.on("disconnection", function () {
    socket.context.logged = false;
});
window.router = new VueRouter({
    routes // short for routes: routes
});

//Vue.component('lefttabs', LeftTabs);
Vue.filter('messageDate', function (value) {
    return (new Date(value).format('hh:mm'));
});
new Vue({
    router: window.router,
    data: {
        avatar: "",
        connected: false,
    },
    mounted() {

    },
    components: {
        'lefttabs': LeftTabs
    }
}).$mount('#app');
