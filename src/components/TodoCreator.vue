<template>
    <div class="generate-panel root-panel todo-creator-component">
        <h2 class="current-mode">{{mode}}</h2>
        <div class="input-block">
            <label for="new-todo-title">Todo Title</label>
            <input v-if="mode==='Create'" type="text" id="new-todo-title" class="form-control" placeholder="Describe the task within a few words" v-model="title">
            <p v-if="mode==='View'">{{title}}</p>
        </div>
        <div class="input-block">
            <label for="new-todo-content">Todo Content</label>
            <textarea v-if="mode==='Create'" type="text" id="new-todo-content" class="form-control" placeholder="Write some details about the task" v-model="content"></textarea>
            <p v-if="mode==='View'">{{content}}</p>
        </div>
        <div class="input-block">
            <label>Tags</label>
            <div v-if="mode==='Create'" :data-mode="mode" class="selected-tags">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable" @click="removeTag(tag)">{{tag}}</span>
            </div>
            <div v-if="mode==='Create'" :data-mode="mode" class="common-tags">
                <span :key="tag" v-for="tag in commonTags" class="common-tag clickable" @click="selectTag(tag)">{{tag}}</span>
            </div>
            <div v-if="mode==='View'" :data-mode="mode" class="selected-tags">
                <span :key="tag" v-for="tag in commonTags" class="selected-tag clickable" @click="selectTag(tag)">{{tag}}</span>
            </div>
        </div>
        <div class="input-block">
            <label for="choose-priority">Priority</label>
            <select v-if="mode==='Create'" id="choose-priority" class="form-control" v-model="priority">
                <option value="verbose">{{priorityMap.verbose}}</option>
                <option value="normal">{{priorityMap.normal}}</option>
                <option value="warn">{{priorityMap.warn}}</option>
                <option value="danger">{{priorityMap.danger}}</option>
            </select>
            <p v-if="mode==='View'">{{priorityMap[priority]}}</p>
        </div>
        <div class="input-block">
            <label for="choose-deadline">Deadline (not recommanded)</label>
            <datepicker v-if="mode==='Create'" v-model="deadline"></datepicker>
            <p v-if="mode==='View'">{{formattedDeadline}}</p>
        </div>
        <div class="input-block">
            <label for="choose-assigner">Creator</label>
            <input v-if="mode==='Create'" readonly type="text" id="choose-creator" class="form-control" v-model="creator">
            <p v-if="mode==='View'">{{creator}}</p>
        </div>
        <div class="input-block">
            <label for="choose-assignee">Assignee</label>
            <input v-if="mode==='Create'" type="text" id="choose-assignee" class="form-control" v-model="assignee">
            <p v-if="mode==='View'">{{assignee}}</p>
        </div>
        <div class="input-block">
            <button class="btn btn-primary submit" @click="create">Create</button>
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
            title: "abc",
            content: "abc",
            creator: "Yourself",
            deadline: "",
            assignee: "Yourself",
            priority: "normal",
            selectedTags: ["编辑器", "活动", "app-rn"],
            commonTags: ["有品", '老米家', '微信', 'PC站', '小程序'],
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
        }
    },
    props: ['onCreate', 'mode', 'editing'],
    watch: {
        editing(v) {
            Object.assign(this, v);
            console.log(v);
        },
    },
    methods: {
        selectTag(tag) {
            const index = this.commonTags.indexOf(tag);
            this.selectedTags.push(tag);
            this.commonTags.splice(index, 1);
        },
        removeTag(tag) {
            const index = this.selectedTags.indexOf(tag);
            this.commonTags.push(tag);
            this.selectedTags.splice(index, 1);
        },
        create() {
            let deadline;
            if (this.deadline) {
                deadline = new Date(this.deadline).getTime();
            }
            this.$emit('create', {
                assignee: this.assignee,
                deadline: deadline,
                priority: this.priority,
                selectedTags: this.selectedTags
            });
        }
    },
    components: {
        datepicker
    }

}

</script>
