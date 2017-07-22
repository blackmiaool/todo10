<template>
    <div class="left-tabs-wrap">
    
        <div class="avatar">
            <img v-if="avatar" :src="avatar" alt="" :class="{active:connected}">
        </div>
        <div class="tabs">
    
            <router-link to="/todo" data-tab-name="groups" class="clickable">
                <i class="fa fa-user-circle"></i>
            </router-link>
            <!--<router-link to="/settings" data-tab-name="settings" class="clickable">
                                        <i class="fa fa-cog"></i>
                                    </router-link>-->
            <!--                <div data-tab-name="search" class="clickable"></div>-->
            <!--                <div data-tab-name="other" class="clickable"></div>-->
            <router-link to="/login" data-tab-name="login" class="clickable">
                <i class="fa fa-power-off"></i>
            </router-link>
        </div>
        <div class="tools">
            <div data-tool-name="logging"></div>
            <div data-tool-name="search"></div>
            <div data-tool-name="other"></div>
        </div>
    </div>
</template>

<script>
import store from 'store';
export default {
    name: 'leftTabs',
    props: {
    },
    data() {
        return {

        }
    },
    computed: {
        connected: () => store.state.connected,
        avatar: () => store.state.user.avatar
    },
    methods: {

    },
    components: {

    },
    directives: {

    }
}

</script>
