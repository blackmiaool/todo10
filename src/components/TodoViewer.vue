<template>
    <div class="todo-viewer">
        <div class="input-block">
            <label for="new-todo-title">Todo Title</label>
            <p>{{title}}</p>
        </div>
        <div class="input-block">
            <label for="new-todo-content">Todo Description</label>
            <p>{{description}}</p>
        </div>
        <div class="input-block">
            <label>Tags</label>
            <div data-mode="View" class="selected-tags">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable" @click="removeTag(tag)">{{tag}}</span>
            </div>
        </div>
        <div class="input-block">
            <label for="choose-priority">Priority</label>
            <p>{{priorityMap[priority]}}</p>
        </div>
        <div class="input-block">
            <label for="choose-deadline">Deadline (not recommanded)</label>
            <p>{{formattedDeadline}}</p>
        </div>
        <div class="input-block">
            <label for="choose-assigner">Creator</label>
            <p>{{creator}}</p>
        </div>
        <div class="input-block">
            <label for="choose-assignee">Assignee</label>
            <p>{{assignee}}</p>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from '../eventHub';
import settings from '../settings';
import store from 'store';

export default {
    name: 'TodoViewer',
    created(p) {
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
            title: "",
            description: "",
            creator: "",
            deadline: 0,
            deadlineText: "",
            assignee: "",
            priority: "",
            unsaved: true,
            selectedTags: "",
            commonTags: [],
            priorityMap: {
                verbose: 'delay it as u want(~)',
                normal: 'do it when u have time(.)',
                warn: 'do it as soon as possible(!)',
                danger: 'do it right now(!!!)',
            },
        }
    },
    computed: {
        formattedDeadline() {
            return new Date(this.deadline).format("yyyy-MM-dd hh:mm:ss");
        },
        editMode: function () {
            return this.mode === 'Create' || this.mode === 'Edit';
        }
    },
    props: [],
    watch: {
    },
    methods: {
        set(info) {
            Object.assign(this, info);
        },
        edit() {
            console.log(store.state.user.name, this.assignee);
            if (this.creator !== store.state.user.name && this.assignee !== store.state.user.name) {
                alert("Only creator or assignee can mutate it");
                return;
            }
            this.$emit("edit");
        },
        fork() {

        },
    },
    components: {
    }

}

</script>
