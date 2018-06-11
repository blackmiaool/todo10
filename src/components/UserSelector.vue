<template>
    <div class="comp-user-selector">
        <header>{{$t("Select a user")}}</header>
        <div class="input-wrapper">
            <input type="text" :placeholder="$t('Search')" class="form-control" v-model="searchText">
        </div>        
        <main>
            <ul>
                <li @click="$emit('select',user.uid)" class="clickable" v-for="user in userMap" :key="user.uid">
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
            match(li.email, this.searchText) || match(li.name, this.searchText)
          );
        });
      }
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
}
</style>
