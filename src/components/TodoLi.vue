<template>
    <li class="comp-todo-li pending" @click="select(info)" :class="{selected:selected,finished:info.status==='done'}">
        <header>
            <div class="drag-handle" :data-priority="info.priority">
                <div class="point"></div>
                <!--<span>{{priority2letter[info.priority]}}</span>-->
            </div>
            <label>{{info.title}}</label>
            <button v-if="mutable&&canFinish" class=" tool finish clickable" title="finish" @click="emit('finish',$event)"></button>
    
            <button v-if="mutable&&info.status==='done'" class=" tool restore clickable" title="restore" @click="emit('restore',$event)"></button>
            <button v-if="mutable" class=" tool destroy clickable" title="unwatch" @click="emit('destroy',$event)"></button>
        </header>
        <main>
            <span class="relation">
                {{requestorName}} -> {{ownerName}}
            </span>
            <span class="projects-tags">
                <span class="projects">
                    <span v-for="project in info.projects" :key="project" class="project">{{projectInfo(project).name}}</span>
                </span>
                <span class="tags">
                    <span v-for="tag in info.tags" :key="tag" class="tag">{{tagInfo(tag).name}}</span>
                </span>
            </span>
        </main>
    </li>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import settings from '../settings';
import store from 'store';

export default {
    name: 'TodoLi',
    created() {

    },
    computed: {
        canFinish: function () {
            return this.info.status === 'pending' && (this.info.requestor == store.state.user.uid || this.info.owner == store.state.user.uid)
        },
        requestorName: function () {
            return store.getters.uid2name(this.info.requestor);
        },
        ownerName: function () {
            return store.getters.uid2name(this.info.owner);
        },

    },
    mounted() {

    },
    props: { info: Object, selected: Boolean, mutable: { type: Boolean, default: true } },
    data() {
        return {
            priority2letter: {
                0: "S",
                1: "A",
                2: "B",
                3: "C",
            }
        }
    },
    watch: {

    },
    methods: {
        tagInfo: (id) => store.getters.tagInfo(id),
        emit(action, $event) {
            this.$emit("action", { action, info: this.info });
            $event.stopPropagation();
        },
        select(item) {
            this.$emit("select", item);
        },
        projectInfo: store.getters.projectInfo,
    },
    components: {

    }

}

</script>
