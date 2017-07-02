<template>
    <div class="top-page-wrap todo-page">
        <TodoCreator></TodoCreator>
        <div class="current-panel root-panel"></div>
        <div class="finished-panel root-panel"></div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "./io";

import eventHub from './eventHub';
import settings from './settings';
import datepicker from 'vue-date';
import TodoCreator from './components/TodoCreator';

export default {
    name: 'Todo',
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
        datepicker,
        TodoCreator
    }

}

</script>
