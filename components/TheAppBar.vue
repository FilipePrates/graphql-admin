<template>
  <div class="appbar primary-2 d-flex">
    <div class="fit-screen mx-auto d-flex">
      <img v-if="!loading" class="mx-4 fill-height" src="/logo.png" alt="" />
      <v-btn-toggle v-if="!loading" class="fill-height" tile group borderless>
        <v-btn
          to="/"
          :class="`ma-0  fill-height appbar-tab ${
            $route.params.type == '' ? 'white--text' : 'white--text'
          }`"
          style="height: 100%; text-transform: none !important"
        >
          <unicon name="channel" fill="#FFFFFF"></unicon>
        </v-btn>

        <v-btn
          v-for="item in profileEntities()"
          :key="item.text"
          :to="item.to"
          :disabled="item.disabled"
          :class="`ma-0  fill-height appbar-tab ${
            $route.params.type == item.to.split('/')[2]
              ? 'secondary-2--text'
              : 'secondary-2--text'
          }`"
          style="height: 100%; text-transform: none !important"
        >
          <span class="">{{ item.text }}</span>
        </v-btn>
      </v-btn-toggle>
      <v-progress-linear
        v-else
        class="mx-4"
        indeterminate
        color="primary"
      ></v-progress-linear>
    </div>
  </div>
</template>

<script>
import utils from "~/utils/utils.js";

export default {
  props: ["loading"],
  computed: {
    profileEntities() {
      return utils.profileEntities;
    },
  },
};
</script>

<style>
.appbar {
  height: 62px;
  box-shadow: 0px 4px 8px rgba(43, 37, 63, 0.1);
}

.appbar-tab {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 1.1em;
  line-height: 150%;
  text-align: center;
  color: #5c9ce5;
}
</style>
