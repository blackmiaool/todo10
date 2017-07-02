<template>
    <div class="top-page-wrap settings-page">
        <div class="setting-tab-header-wrap">
            <div v-for="(tab,$index) in tabs" v-on:click="selectTab($index)">
                <SettingTabHeader :tab="tab" :active="currentTab===$index" />
            </div>
        </div>
        <ConfigPanel :class="{top:currentTab>1,bottom:currentTab<1}" />
    </div>
</template>

<script>
import $ from "jquery";
import socket from "./io";
import SettingTabHeader from './components/SettingTabHeader';
import ConfigPanel from './components/ConfigPanel';

const config = require("../config.js");

export default {
    name: 'settings',
    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (!socket.context.logged) {
                router.replace("/login")
            }
        });
    },
    data() {
        return {
            tabs: ["ROOM", "CONFIG"],
            currentTab: 0,
        }
    },
    methods: {
        selectTab(tab) {
            this.currentTab = tab;
        }
    },
    components: {
        SettingTabHeader,
        ConfigPanel,
    },
}

</script>
