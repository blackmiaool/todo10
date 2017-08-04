<template>
    <div class="list-panel todo-list-component">
        <div>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-tasks"></i>
                    {{$t('Pending')}}
                </h3>
                <div class="todo-wrap">
                    <header class="list-header">
    
                    </header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <TodoLi v-for="li in listPending" :info="li" :selected="li.id===selecting" :key="li.id" @action="liAction" @select="select">
                            </TodoLi>
                        </ul>
                    </section>
                </div>
            </section>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-feed"></i>
                    {{$t('Watching')}}
                </h3>
                <div class="todo-wrap">
                    <header class="list-header"></header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <TodoLi v-for="li in listWatching" :info="li" :selected="li.id===selecting" :key="li.id" @action="liAction" @select="select">
                            </TodoLi>
                        </ul>
                    </section>
                </div>
            </section>
    
            <section class="todoapp">
                <h3>
                    <i class="fa fa-trash"></i>
                    {{$t('Finished')}}
                </h3>
                <div class="todo-wrap">
                    <header class="list-header"></header>
                    <section class="list-main">
                        <ul class="todo-list">
                            <TodoLi v-for="li in listDone" :info="li" :selected="li.id===selecting" :key="li.id" @action="liAction" @select="select">
                            </TodoLi>
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
import TodoLi from 'components/TodoLi'
function sortList(a, b) {
    if (a.priority === b.priority) {
        return a.name > b.name ? 1 : -1;
    } else {
        return a.priority - b.priority;
    }
}
export default {
    name: 'TodoList',
    created() {

    },
    computed: {
        listPending() {
            return this.list.filter((item) => {
                return item.owner == store.state.user.uid && item.status === 'pending';
            }).sort(sortList);
        },
        listWatching() {
            return this.list.filter((item) => {
                return item.owner != store.state.user.uid;
            }).sort(sortList);
        },
        listDone() {
            return this.list.filter((item) => {
                return item.owner == store.state.user.uid && item.status === 'done';
            }).sort(sortList);
        }
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
        liAction({ action, info }) {
            this.$emit(action, info);
        },
        select(item) {
            this.selecting = item.id;
            this.$emit("select", item);
        },
        clear(item) {
            this.selecting = undefined;
        },
    },
    components: {
        TodoLi
    }

}

</script>
