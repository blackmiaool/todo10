<template>
    <div class="config-panel deep-panel">            
        <label class="check-notification-action deep-select">
            <input v-model="config.showNotification" name="notification" type="checkbox">
            <span class="deep-checkbox"></span>
            <span>Show Notification</span>
        </label>            
        <header>
            <div class="deep-header"><img class="deep-text" src="../assets/header_text/config.png" alt=""></div> 
        </header>            
    </div>
</template>

<script>
    import $ from "jquery";
    import settings from '../settings';
    import {
        saveLocal,
        loadLocal
    } from "../io";
    console.log(settings)

    export default {
        name: 'ConfigPanel',
        mounted() {

        },
        data() {
            return {
                config: settings.config,
                preNotification: settings.config.showNotification
            }
        },
        computed: {},
        watch: {
            config: {
                handler: function(config) {
                    if (config.showNotification && !this.preNotification) {
                        Notification.requestPermission(function(permission) {


                        });
                    }
                    this.preNotification = config.showNotification;
                    saveLocal("config", config);
                },
                deep: true
            }
        },
        methods: {

        },
        components: {

        },
    }

</script>
