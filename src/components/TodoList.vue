<template>
    <div class="current-panel root-panel todo-list-component">
        <div id="todoapp">
            <header id="header">
            </header>
            <section id="main">
                <ul id="todo-list">
                    <li class="pending">
                        <div class="drag-handle"></div>
                        <label>更新产品模块</label>
                        <button class="top tool clickable" title="top"></button>
                        <button class=" tool finish clickable" title="finish"></button>
    
                    </li>
                    <li class="pending selected">
                        <div class="drag-handle"></div>
                        <label>首页四大金刚rn=1</label>
                        <button class="top tool clickable" title="top"></button>
                        <button class=" tool finish clickable" title="finish"></button>
                    </li>
                </ul>
            </section>
        </div>
    
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from '../eventHub';
import settings from '../settings';
import datepicker from 'vue-date';

export default {
    name: 'TodoList',
    created() {

    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            console.log('socket', socket.context.logged)
            if (!socket.context.logged) {
                router.replace("/login")
                return;
            }
        });
    },
    mounted() {

    },
    data() {
        return {
            today: (new Date()).format("yyyy-MM-dd")
        }
    },
    watch: {

    },
    methods: {


    },
    components: {
        datepicker
    }

}

</script>
