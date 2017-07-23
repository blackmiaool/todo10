<template>
    <div class="top-page-wrap login-page">
        <div class="login-panel">
            <div class="top-half-panel">
                <div class="input-block" v-if="mode==='register'">
                    <input name="name" class="form-control" type="text" :placeholder="$t('Username')" v-model="name">
                    <div class="err" v-if="webError.name">{{webError.name}}</div>
                </div>
                <div class="input-block">
                    <input name="email" class="form-control" type="email" :placeholder="$t('Email')" v-model="email">
                    <div class="err" v-if="webError.email">{{webError.email}}</div>
                </div>
                <div class="input-block">
                    <input name="password" class="form-control" type="password" :placeholder="$t('Password')" v-model="password">
                    <div class="err" v-if="webError.password">{{webError.password}}</div>
                </div>
                <div class="input-block">
                    <input name="password2" v-if="mode==='register'" class="form-control" type="password" :placeholder="$t('Password again (optional)')" v-model="password2">
                    <div class="err" v-if="webError.password2">{{webError.password2}}</div>
                </div>
            </div>
            <div class="bottom-half-panel">
                <div class="middle" :class="{'third-support':third.length,middle:true}">
                    <div v-if="mode==='register'" @click="refreshAvatar()" class="avatar-preview clickable" :style="{'background-image':'url('+avatar+')'}"></div>
                    <div class="thrid-entry clickable" v-for="thirdWay in third" :key="thirdWay.name" @click="thirdWay.cb(onThird(thirdWay.name))">
                        <img :src="thirdWay.icon" alt="">
                    </div>
                </div>
    
                <label class="remember">
                    <input v-model="remember" type="checkbox"> {{$t('Remember me')}}
                </label>
                <button @click="send" class="btn btn-primary submit">Go</button>
                <button v-if="mode==='login'" class="go-register clickable" @click="setMode('register')">{{$t('or Register')}}</button>
                <button v-if="mode==='register'" class="go-register clickable" @click="setMode('login')">{{$t('or Login')}}</button>
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
import socket, { loadLocal, saveLocal } from "io";
const config = require("config");
import eventHub from 'eventHub';
import store from 'store';
const href = window.location.href;
let firstPage = href.match(/\/#\/(\w+)/);
if (firstPage) {
    firstPage = firstPage[1];
}

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
        store.dispatch("login").then((result) => {
            this.onLogin(result);
        }).catch(() => {
            //ignore it;
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
            this.$root.avatar = data.avatar;
            this.$root.userName = data.name;
            window.router.push({
                name: this.$route.params.target || 'Todo',
                query: this.$route.params.params,
                params: {}
            });

        },
        onThird(mode) {
            return (data) => {
                // socket.emit("login", {
                //     data,
                //     mode
                // }, this.onLogin.bind(this));
                store.dispatch("login", {
                    data,
                    mode,
                    remember: this.remember,
                }).then(result => {
                    this.onLogin(result);
                }).catch(result => {
                    this.onLogin(result);
                    //ignore it;
                });
            }
        },
        onLogin(result) {
            if (!result.code) {
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
        doLogin(email, password) {
            store.dispatch("login", {
                email: email || this.email,
                password: password || handlePwd(this.password),
                remember: this.remember,
            }).then(result => {
                this.onLogin(result);
            }).catch(result => {
                this.onLogin(result);
                //ignore it;
            });
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
            } else {
                this.doLogin();
            }
        }
    },
    components: {


    },
}

</script>
