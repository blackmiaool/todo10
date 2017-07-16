<template>
    <div class="todo-viewer">
        <div class="input-block">
            <label for="new-todo-title">
                <i class="fa fa-pencil"></i>
                Todo Title
            </label>
            <p>{{title}}</p>
            <span class="id-detail">id:{{id}}</span>
        </div>
        <div class="input-block">
            <label for="new-todo-content">
                <i class="fa fa-paint-brush"></i>
                Todo Description
            </label>
            <pre>{{description}}</pre>
        </div>
        <div class="input-block">
            <label>
                <i class="fa fa-tags"></i>
                Tags
            </label>
            <div data-mode="View" class="selected-tags">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable">{{tag}}</span>
            </div>
        </div>
        <div class="input-block">
    
            <label for="choose-priority">
                <i class="fa fa-bomb"></i>
                Priority
            </label>
            <p>{{priorityMap[priority]}}</p>
        </div>
        <div class="input-block">
            <label for="choose-deadline">
                <i class="fa fa-calendar-o"></i>
                Deadline (not recommended)
            </label>
            <p>{{formattedDeadline}}</p>
        </div>
        <div class="input-block">
            <label for="choose-assigner">
                <i class="fa fa-user-o"></i>
                Requestor
            </label>
            <p>{{requestorName}}</p>
        </div>
        <div class="input-block">
            <label for="choose-owner">
                <i class="fa fa-user-circle-o"></i>
                owner
            </label>
            <p>{{ownerName}}</p>
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
            id: 0,
            title: "",
            description: "",
            requestor: "",
            deadline: 0,
            deadlineText: "",
            owner: "",
            priority: "",
            unsaved: true,
            selectedTags: "",
            commonTags: [],
            priorityMap: {
                verbose: 'delay it as u want~',
                normal: 'do it when u have time.',
                warn: 'do it as soon as possible!',
                danger: 'do it right now!!!',
            },
        }
    },
    computed: {
        requestorName() {
            return this.uid2name(this.requestor);
        },
        ownerName() {
            return this.uid2name(this.owner);
        },
        formattedDeadline() {
            if (this.deadline) {
                return new Date(this.deadline).format("yyyy-MM-dd hh:mm:ss");
            } else {
                return "No deadline"
            }

        },
        editMode: function () {
            return this.mode === 'Create' || this.mode === 'Edit';
        },
        descriptionHandled: function () {
            return this.description.replace(/\n/g, "<br/>")
        }
    },
    props: ['userList'],
    watch: {
    },
    methods: {
        uid2name(uid) {
            const user = this.userList.find((user) => user.value == uid);
            if (user) {
                return user.label;
            } else {
                return 'not found'
            }
        },
        set(info) {
            Object.assign(this, info);
        },
        edit() {
            if (this.requestor !== store.state.user.name && this.owner !== store.state.user.name) {
                alert("Only requestor or owner can mutate it");
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
