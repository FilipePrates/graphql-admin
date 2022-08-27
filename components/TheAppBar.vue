<template>
  <v-app-bar color="accent-4" dense dark max-height="48px">
    <img v-if="!isLoading" class="mx-4 fill-height" src="/logo.png" alt="" />
    <v-toolbar-title style="min-width: 15vw">
      <v-text-field
        v-model="searchTerm"
        color="white"
        class="mt-6"
        append-icon="mdi-search"
      >
      </v-text-field>
    </v-toolbar-title>
    <v-slide-group v-if="!isLoading" multiple show-arrows center-active>
      <v-slide-item v-for="item in nodeLabelsSearched" :key="item.name">
        <v-tab
          :disabled="item.disabled"
          :to="`/lista/${item.name}`"
          style="height: 100%; text-transform: none !important; max-width: 100%"
          active-class="active"
          >{{ item.name }}
        </v-tab>
      </v-slide-item>
    </v-slide-group>
    <v-progress-linear
      v-else
      class="mx-4"
      indeterminate
      color="secondary"
    ></v-progress-linear>
  </v-app-bar>
</template>

<script>
import utils from "~/utils/utils.js";

export default {
  props: ["loading"],
  data() {
    return {
      searchTerm: "",
      internalLoading: false,
    };
  },
  computed: {
    isLoading() {
      return this.loading || this.internalLoading;
    },
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
  mounted() {
    this.getNodeLabels();
  },
  methods: {
    async getNodeLabels() {
      const { data } = await this.$apollo.query({
        query: require("~/graphql/nodeLabels.gql"),
      });
      const nodeLabels = data.__schema.types
        .filter(
          (t) =>
            t.kind == "OBJECT" &&
            !t.name.startsWith("_") &&
            !["Query", "Mutation", "Subscription"].includes(t.name)
        )
        .sort((a, b) => (a.name.length > b.name.length ? 1 : -1));
      this.$store.commit("setNodeLabels", nodeLabels);
      console.log(nodeLabels);
      this.internalLoading = false;
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
