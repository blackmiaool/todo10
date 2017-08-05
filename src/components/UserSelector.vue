<template>
    <div class="comp-user-selector">
        <header>{{$t("Select a user")}}</header>
        <main>
            <ul>
                <li @click="$emit('select',user.uid)" class="clickable" v-for="user in userMap" :key="user.uid">{{user.name}}</li>
            </ul>
        </main>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import settings from '../settings';
import store from 'store';

export default {
    name: 'UserSelector',
    computed: {
        userMap: () => store.state.userMap
    },
    data() {
        return {

        }
    },
}

</script>
