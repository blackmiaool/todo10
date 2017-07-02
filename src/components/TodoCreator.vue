<template>
    <div class="generate-panel root-panel">
        <div class="input-block">
            <label for="new-todo-title">Todo Title</label>
            <input type="text" id="new-todo-title" class="form-control">
        </div>
        <div class="input-block">
            <label for="new-todo-content">Todo Content</label>
            <textarea type="text" id="new-todo-content" class="form-control"></textarea>
        </div>
        <div class="input-block">
            <label>Tags</label>
            <div class="selected-tags">
                <span class="selected-tag">编辑器</span>
                <span class="selected-tag">活动</span>
                <span class="selected-tag">app-rn</span>
            </div>
            <div class="common-tags">
                <span class="common-tag">有品</span>
                <span class="common-tag">老米家</span>
                <span class="common-tag">微信</span>
                <span class="common-tag">PC站</span>
                <span class="common-tag">小程序</span>
            </div>
        </div>
        <div class="input-block">
            <label for="choose-priority">Priority</label>
            <select id="choose-priority" class="form-control">
                <option value="verbose">随便往后拖</option>
                <option value="normal">有空就做</option>
                <option value="warn">尽快做</option>
                <option value="danger">立即做</option>
            </select>
        </div>
        <div class="input-block">
            <label for="choose-deadline">Deadline (not recommanded)</label>
            <datepicker v-model="today"></datepicker>
        </div>
        <div class="input-block">
            <button class="btn btn-primary submit">Create</button>
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
        datepicker
    }

}

</script>
