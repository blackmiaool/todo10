<template>
    <div class="list-panel todo-list-component" :class="{refreshing}">
        <div class="top-bar">
            <button class="btn btn-primary" @click="$emit('new')">
                <i class="fa fa-plus-square-o"></i> {{$t('New')}}
            </button>
            <button class="btn btn-default" @click="$emit('refresh')">
                <i class="fa fa-refresh"></i> {{$t('Refresh')}}
            </button>
            <button class="btn btn-primary btn-lg mail-btn clickable" @click="$emit('toggleMessageBox')">
                <i class="fa fa-envelope"></i>
            </button>
        </div>
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
                <button v-if="listDone.length" class="btn btn-danger btn-xs" @click="$emit('deleteAllFinished',listWatching)">
                    <i class="fa fa-trash"></i> {{$t('Unwatch Finished')}}</button>
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
                <button v-if="listDone.length" class="btn btn-primary btn-xs" @click="$emit('generateReport',[listPending,listDone])">
                    <i class="fa fa-file-text"></i> {{$t('Generate Report')}}</button>

                <button v-if="listDone.length" class="btn btn-danger btn-xs" @click="$emit('deleteAll',listDone)">
                    <i class="fa fa-trash"></i> {{$t('Unwatch All')}}</button>
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
</template>

<script>

import store from 'store';
import TodoLi from 'components/TodoLi';


function sortList(a, b) {
    if (a.priority === b.priority) {
        return a.name > b.name ? 1 : -1;
    } else {
        return a.priority - b.priority;
    }
}
export default {
    name: 'TodoList',
    computed: {
        listPending() {
            return this.list.filter(item =>
                item.owner == store.state.user.uid
                && item.status === 'pending').sort(sortList);
        },
        listWatching() {
            return this.list.filter(item => item.owner != store.state.user.uid).sort(sortList);
        },
        listDone() {
            return this.list.filter(item => item.owner == store.state.user.uid && item.status === 'done').sort(sortList);
        }
    },
    mounted() {

    },
    props: ['list', 'refreshing'],
    data() {
        return {
            showingMessageBox: false,
            selecting: "",
        };
    },
    methods: {
        liAction({ action, info }) {
            this.$emit(action, info);
        },
        select(item) {
            this.selecting = item.id;
            this.$emit("select", item);
        },
        clear() {
            this.selecting = undefined;
        },
    },
    components: {
        TodoLi,

    }

};

</script>
