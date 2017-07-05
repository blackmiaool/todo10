<template>
    <div class="current-panel root-panel todo-list-component">
        <div id="todoapp">
            <header id="header">
            </header>
            <section id="main">
                <ul id="todo-list">
                    <li class="pending" v-for="li in list" :key="li.id" @click="edit(li)" :class="{selected:li.id===selecting}">
                        <div class="drag-handle"></div>
                        <label>{{li.title}}</label>
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
    mounted() {

    },
    props: ['list'],
    data() {
        return {
            selecting: "",
        }
    },
    watch: {

    },
    methods: {
        edit(item) {
            this.selecting = item.id;
            this.$emit("select", item);
        }

    },
    components: {

    }

}

</script>
