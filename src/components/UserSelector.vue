<template>
    <div class="comp-user-selector">
        <header>{{$t("Select a user")}}</header>
        <div class="input-wrapper">
            <input type="text" :placeholder="$t('Search')" class="form-control" v-model="searchText">
            <span v-if="searchText" class="glyphicon glyphicon-remove-circle clickable" @click="searchText=''"></span>
        </div>
        <main>
            <ul>
                <li @click="onSelect(user.uid)" class="clickable" v-for="user in userMap" :key="user.uid">
                    <i class="fa fa-wechat" :class="{active:user.hasWechat}"></i>
                    <span class="user-name">{{user.name}}</span>
                </li>
            </ul>
        </main>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import settings from "../settings";
import store from "store";
import eventHub from "../eventHub";

export default {
    name: "UserSelector",
    computed: {
        userMap() {
            const fullList = Object.keys(store.state.userMap).map(key => {
                return store.state.userMap[key];
            });
            if (!this.searchText) {
                return fullList;
            } else {
                function match(content, key) {
                    return content.match(/^[^@]+/)[0].includes(key);
                }
                return fullList.filter(li => {
                    return (
                        match(li.email, this.searchText) ||
                        match(li.name, this.searchText)
                    );
                });
            }
        }
    },
    methods: {
        onSelect(uid) {
            eventHub.$emit("select-user", uid);
        }
    },
    data() {
        return {
            searchText: ""
        };
    }
};
</script>
<style scoped lang="less">
.input-wrapper {
    text-align: center;
    padding: 5px 0;
    margin: 0 20px;
    position: relative;
    input {
        padding-right: 25px;
    }
}
.glyphicon-remove-circle {
    position: absolute;
    right: 10px;
    top: 2px;
    bottom: 0;
    margin: auto;
    height: 15px;
    font-size: 15px;
    color: #aaa;
    &:hover {
        color: #555;
    }
}
</style>
