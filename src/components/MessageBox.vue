<template>
    <div class="comp-message-box" :class="{active}">
        <ul class="box">
            <li :key="li.id" v-for="li in list">
                <div class="content">{{li.data&&li.data.content}}</div>
                <button class="btn btn-danger" @click="del(li)">Delete</button>
            </li>
        </ul>
        <footer class="clickable" @click="$emit('close')"></footer>
    </div>
</template>

<script>
import store from 'store';
import socket from '../io';
export default {
    data() {
        return {
            list: [],
        };
    },
    methods: {
        del(li) {
            socket.emit('deleteMessage', li.id, ({
                data: list,
            }) => {
                list = list.reverse();
                this.list.splice(0, this.list.length, ...list);
            });
        }
    },
    watch: {
        active() {
            if (this.active) {
                socket.emit('getMessages', {}, ({
                    data: list,
                }) => {
                    list = list.reverse();
                    this.list.splice(0, this.list.length, ...list);
                });
            }
        }
    },
    props: ["active"],
    name: 'MessageBox',
}

</script>
