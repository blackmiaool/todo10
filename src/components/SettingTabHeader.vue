<template>
    <div class="setting-tab-header clickable" :class="{active:active}"  @click="select">
        <img src="../assets/deep_ui/little_box3.png" class="left">
        <img src="../assets/deep_ui/little_box2.png" class="right">
        <div class="nav-name">{{tab}}</div>
    </div>
</template>
<script>
    import eventHub from "../eventHub";
    export default {
        name: "SettingTabHeader",
        props: ['tab', 'active'],
        methods: {
            selectTab() {

            },
            select() {

            }
        }
    }

</script>
