<template>
    <div class="generate-panel root-panel todo-creator-component">
        <h2 class="current-mode">{{mode}}</h2>
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
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable">{{tag}}</span>
            </div>
            <div class="common-tags">
                <span :key="tag" v-for="tag in commonTags" class="common-tag clickable">{{tag}}</span>
    
            </div>
        </div>
        <div class="input-block">
            <label for="choose-priority">Priority</label>
            <select id="choose-priority" class="form-control" v-model="priority">
                <option value="verbose">delay it as u want(~)</option>
                <option value="normal">do it when u have time(.)</option>
                <option value="warn">do it as soon as possible(!)</option>
                <option value="danger">do it right now(!!!)</option>
            </select>
        </div>
        <div class="input-block">
            <label for="choose-deadline">Deadline (not recommanded)</label>
            <datepicker v-model="today"></datepicker>
        </div>
        <div class="input-block">
            <label for="choose-assignee">Assignee</label>
            <input type="text" id="choose-assignee" class="form-control" v-model="assignee">
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
    name: 'TodoCreator',
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
            today: (new Date()).format("yyyy-MM-dd"),
            assignee: "Yourself",
            mode: "Create",
            priority: "normal",
            selectedTags: ["编辑器", "活动", "app-rn"],
            commonTags: ["有品", '老米家', '微信', 'PC站', '小程序']
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
