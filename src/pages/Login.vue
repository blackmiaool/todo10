<template>
    <div class="top-page-wrap login-page">
        <div class="login-panel">
            <div class="top-half-panel">
                <div class="input-block" v-if="mode==='register'">
                    <input name="name" class="form-control" type="text" placeholder="Username" v-model="name">
                    <div class="err" v-if="webError.name">{{webError.name}}</div>
                </div>
                <div class="input-block">
                    <input name="email" class="form-control" type="email" placeholder="Email" v-model="email">
                    <div class="err" v-if="webError.email">{{webError.email}}</div>
                </div>
                <div class="input-block">
                    <input name="password" class="form-control" type="password" placeholder="Password" v-model="password">
                    <div class="err" v-if="webError.password">{{webError.password}}</div>
                </div>
                <div class="input-block">
                    <input name="password2" v-if="mode==='register'" class="form-control" type="password" placeholder="Password again (optional)" v-model="password2">
                    <div class="err" v-if="webError.password2">{{webError.password2}}</div>
                </div>
            </div>
            <div class="bottom-half-panel">
                <div class="middle" :class="{'third-support':third.length,middle:true}">
                    <div v-if="mode==='register'" @click="refreshAvatar()" class="avatar-preview clickable" :style="{'background-image':'url('+avatar+')'}"></div>
                    <div class="thrid-entry clickable" v-for="thirdWay in third" :key="thirdWay" @click="thirdWay.cb(onThird(thirdWay.name))">
                        <img :src="thirdWay.icon" alt="">
                    </div>
                </div>
    
                <label class="remember">
                    <input v-model="remember" type="checkbox"> Remember me
                </label>
                <button @click="send" class="btn btn-primary submit">Go</button>
                <button v-if="mode==='login'" class="go-register clickable" @click="setMode('register')">or Register</button>
                <button v-if="mode==='register'" class="go-register clickable" @click="setMode('login')">or Login</button>
            </div>
    
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import md5 from 'md5';
import {
    registerCheck
} from 'common/check';
import Vue from 'vue';
import socket from "io";
const config = require("config");
import eventHub from 'eventHub';
import store from 'store';
const href = window.location.href;
let firstPage = href.match(/\/#\/(\w+)/);
if (firstPage) {
    firstPage = firstPage[1];
}

let cacheLoginInfo;
function handlePwd(pwd) {
    pwd += config.salt;
    return md5(pwd);
}
export default {
    name: 'app',
    mounted() {

    },
    data() {
        return {
            avatar: "",
            mode: "register",
            name: "",
            password: "",
            password2: "",
            serverError: {},
            webError: {},
            remember: true,
            email: "",
        }
    },
    computed: {
        third: () => store.state.port.login
    },
    mounted() {
        this.refreshAvatar();

        const { email, password } = JSON.parse(localStorage.getItem("god-account")) || {};

        socket.on("connect", () => {
            if (cacheLoginInfo) {
                this.doLogin(cacheLoginInfo.email, cacheLoginInfo.password);
            } else if (email) {
                this.doLogin(email, password);
            }
        });
        socket.on("disconnect", () => {
            this.$root.connected = false;
        });

    },
    methods: {
        refreshAvatar() {
            $.post("//" + location.hostname + `:${config.serverPort}/avatar`, {}, (result) => {
                this.avatar = result;
            });
        },
        setMode(mode) {
            this.mode = mode;
            this.webError = {};
        },

        onSuccess(data) {
            console.log('onSuccess')
            store.commit("setUser", { avatar: data.avatar, name: data.name, email: data.email })
            this.$root.avatar = data.avatar;
            this.$root.userName = data.name;
            this.$root.connected = true;
            socket.context.logged = true;
            if (firstPage === 'settings') {
                window.router.push({
                    name: 'Settings',
                    params: {}
                });
            } else {
                window.router.push({
                    name: 'Todo',
                    params: data
                });
            }

        },
        onThird(mode) {
            return (data) => {
                console.log('onthird', mode, data)
                console.log(data);
                this.doLogin(data.email, data.password, mode);
                socket.emit("login", {
                    data,
                    mode
                }, this.onLogin.bind(this));
                // $.post(`//${location.hostname}:${config.serverPort}/third`, {
                //     mode,
                //     data
                // }, (result) => {
                // });
            }

        },
        onLogin(result) {
            console.log('login', result)
            if (!result.code) {
                if (true) { //login with input info
                    cacheLoginInfo = {
                        email: this.email,
                        password: handlePwd(this.password)
                    };
                    if (this.remember) {
                        localStorage.setItem("god-account", JSON.stringify({
                            email: result.data.email,
                            password: result.data.password
                        }));
                    }
                }
                this.onSuccess(result.data);
            } else if (result.key) {
                this.webError = {
                    [result.key]: result.msg
                }
            } else if (result.msg) {
                alert(result.msg);
            } else {
                alert("error");
            }
        },
        doLogin(email, password, mode) {
            socket.emit("login", {
                email: email || this.email,
                password: password || handlePwd(this.password),
                mode
            }, this.onLogin.bind(this));
        },
        doRegister() {
            socket.emit("register", {
                name: this.name,
                email: this.email,
                password: handlePwd(this.password),
                avatar: this.avatar
            }, (result) => {
                if (result.code === 0) {
                    this.doLogin();
                } else if (result.key) {
                    this.webError = {
                        [result.key]: result.msg
                    }
                } else if (result.msg) {
                    alert(result.msg);
                } else {
                    alert("error");
                }
            })
        },
        send() {

            this.webError = {};

            const checkResult = registerCheck("web", this.mode, this.name, this.email, md5(this.password), this.password2 && this.mode === "register" ? md5(this.password2) : '');

            if (checkResult) {
                this.webError = {
                    [checkResult.key]: checkResult.message
                };
                return;
            }

            if (this.mode === "register") {
                this.doRegister();
                // $.post(`//${location.hostname}:${config.serverPort}/${this.mode}`, {
                //     name: this.name,
                //     password: handlePwd(this.password),
                //     avatar: this.avatar
                // }, (result) => {
                //     if (!result.code) {
                //         this.doLogin();
                //     } else if (result.key) {
                //         this.webError = {
                //             [result.key]: result.msg
                //         }
                //     } else if (result.msg) {
                //         alert(result.msg);
                //     } else {
                //         alert("error");
                //     }

                // });
            } else {
                this.doLogin();
            }
        }
    },
    components: {


    },
}

</script>
