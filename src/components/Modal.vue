<template>
    <div class="comp-modal">
        <div class="shadow"></div>
        <slot></slot>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import settings from '../settings';
import store from 'store';

export default {
    name: 'Modal',
    created() {

    },
    computed: {

    },
    mounted() {

    },
    props: {},
    data() {
        return {

        }
    },
    watch: {

    },
    methods: {

    },
    components: {

    }

}

</script>
