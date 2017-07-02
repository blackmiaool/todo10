<template>
    <div class="info-panel root-panel todo-info-component">
    
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from '../eventHub';
import settings from '../settings';
import datepicker from 'vue-date';

export default {
    name: 'TodoInfo',
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
