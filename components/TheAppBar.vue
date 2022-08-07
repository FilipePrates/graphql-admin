<template>
  <div class="appbar primary-2 d-flex">
    <div class="mx-0 my-0">
      <img v-if="!loading" class="mx-4 fill-height" src="/logo.png" alt="" />
      <v-text-field
        style="position: fixed; top: 0vh; left: 7vw; width: 12vw"
        v-model="searchTerm"
        color="white"
      >
      </v-text-field>

      <v-tabs
        v-if="!loading"
        center-active
        show-arrows
        background-color="primary-2"
        style="position: fixed; top: 6px; left: 20vw; max-width: 79vw"
        ><v-tab
          v-for="item in nodeLabelsSearched"
          :key="item.name"
          style="max-width: 100%"
        >
          <v-btn
            :to="`/lista/${item.name}`"
            :disabled="item.disabled"
            class="primary-1 white--text"
            active-class="active"
            style="
              height: 100%;
              text-transform: none !important;
              max-width: 100%;
            "
          >
            <span class="">{{ item.name }}</span>
          </v-btn>
        </v-tab></v-tabs
      >
      <!-- <v-btn-toggle v-if="!loading" class="fill-height" tile group borderless>
        <v-btn
          to="/"
          :class="`ma-0  fill-height appbar-tab ${
            $route.params.type == '' ? 'white--text' : 'white--text'
          }`"
          style="height: 100%; text-transform: none !important"
        >
          <unicon name="channel" fill="#FFFFFF"></unicon>
        </v-btn>
        <v-btn class="my-0 fill-height">
          <v-text-field
            class="fill-height"
            v-model="searchTerm"
            color="#000000"
          >
          </v-text-field>
        </v-btn>
        <v-btn
          v-for="item in nodeLabelsSearched"
          :key="item.name"
          :to="`/lista/${item.name}`"
          :disabled="item.disabled"
          :class="`ma-0  fill-height appbar-tab ${
            $route.params.type == item.name
              ? 'secondary-2--text'
              : 'secondary-2--text'
          }`"
          style="height: 100%; text-transform: none !important"
        >
          <span class="">{{ item.name }}</span>
        </v-btn>
      </v-btn-toggle> -->
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
  data() {
    return {
      searchTerm: "",
    };
  },
  computed: {
    profileEntities() {
      return utils.profileEntities;
    },
    nodeLabels() {
      return this.$store.getters.getNodeLabels;
    },
    nodeLabelsSearched() {
      return this.nodeLabels.filter((n) => {
        return n.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    },
  },
};
</script>

<style>
.appbar {
  height: 62px;
  box-shadow: 0px 4px 8px rgba(43, 37, 63, 0.1);
}

.active {
  color: #000000;
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
