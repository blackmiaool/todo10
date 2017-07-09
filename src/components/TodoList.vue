<template>
    <div class="current-panel root-panel todo-list-component">
        <div>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-tasks"></i>
                    Pending
                </h3>
                <div class="todo-wrap">
                    <header class="list-header">
    
                    </header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <li class="pending" v-for="li in listPending" :key="li.id" @click="edit(li)" :class="{selected:li.id===selecting}">
                                <div class="drag-handle"></div>
                                <label>{{li.title}}</label>
                                <button class=" tool finish clickable" title="finish"></button>
    
                            </li>
                        </ul>
                    </section>
                </div>
            </section>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-feed"></i>
                    Created
                </h3>
                <div class="todo-wrap">
                    <header class="list-header"></header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <li class="pending" v-for="li in listCreated" :key="li.id" @click="edit(li)" :class="{selected:li.id===selecting}">
                                <div class="drag-handle"></div>
                                <label>{{li.title}}</label>
                                <button v-if="li.status==='pending'" class=" tool finish clickable" title="finish"></button>
                            </li>
                        </ul>
                    </section>
                </div>
            </section>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-trash"></i>
                    Finished
                </h3>
                <div class="todo-wrap">
                    <header class="list-header"></header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <li class="finished" v-for="li in listDone" :key="li.id" @click="edit(li)" :class="{selected:li.id===selecting}">
                                <div class="drag-handle"></div>
                                <label>{{li.title}}</label>
                                <button class=" tool restore clickable" title="restore"></button>
                                <button class=" tool destroy clickable" title="destroy"></button>
    
                            </li>
                        </ul>
                    </section>
                </div>
    
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
import store from 'store';

export default {
    name: 'TodoList',
    created() {

    },
    computed: {
        listPending() {
            return this.list.filter((item) => {
                return item.owner === store.state.user.name && item.status === 'pending';
            });
        },
        listCreated() {
            return this.list.filter((item) => {
                return item.requestor === store.state.user.name;
            });
        },
        listDone() {
            return this.list.filter((item) => {
                return item.owner === store.state.user.name && item.status === 'done';
            });
        }
    },
    mounted() {
        console.log(this)
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
