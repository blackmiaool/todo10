<template>
    <div class="comp-modal">
        <div @click="$emit('cancel')" class="shadow"></div>
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
}

</script>
