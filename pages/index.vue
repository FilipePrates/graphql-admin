<template>
  <v-container
    class="fill-height ma-0"
    style="background: #888888; max-width: 100vw"
  >
    <iframe
      :style="`display : ${toggleIframe ? 'none' : ''}`"
      width="100%"
      height="100%"
      src="http://neo4j-admins.jovensgenios.com.s3-website-us-east-1.amazonaws.com"
    ></iframe>

    <v-row class="fill-height">
      <v-col cols="12" class="justify-center d-flex">
        <v-card width="40vw" v-if="!loading">
          <v-card-title
            >Connect to ${Neo4j}
            <v-spacer></v-spacer>
            <v-icon color="#888888" size="13">mdi-help-circle</v-icon>
          </v-card-title>

          <v-card-text>
            <v-select
              v-model="mainNodeLabels"
              multiple
              :items="nodeLabels"
              item-text="name"
              item-value="name"
              label="Choose the main nodes"
              @change="selectedMainNode"
            ></v-select>
            <v-chip
              v-for="node in mainNodeLabels"
              :key="node.name"
              class="ma-1"
              close
              @click:close="removeFromMainNodes(node)"
              >{{ node }}</v-chip
            >
          </v-card-text>
        </v-card>
        <v-card v-else width="40vw">
          <v-progress-circular
            size="15"
            indeterminate
            color="#888888"
          ></v-progress-circular>
        </v-card>
      </v-col>
      <v-btn
        height="10"
        max-width="10"
        color="black"
        @click="toggleIframe = !toggleIframe"
        >yo</v-btn
      >
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      toggleIframe: true,
      nodeLabels: undefined,
      mainNodeLabels: [],
    };
  },
  mounted() {
    this.getNodeLabels();
  },
  methods: {
    selectedMainNode(n) {
      console.log(n);
    },
    removeFromMainNodes(node) {
      this.mainNodeLabels.splice(
        this.mainNodeLabels.findIndex((e) => {
          return e == node;
        }),
        1
      );
    },
    async getNodeLabels() {
      const { data } = await this.$apollo.query({
        query: require("~/graphql/nodeLabels.gql"),
      });
      this.nodeLabels = data.__schema.types
        .filter(
          (t) =>
            t.kind == "OBJECT" &&
            !t.name.startsWith("_") &&
            !["Query", "Mutation", "Subscription"].includes(t.name)
        )
        .sort((a, b) => (a.name > b.name ? 1 : -1));
      this.$store.commit("setNodeLabels", this.nodeLabels);
      this.loading = false;
    },
  },
};
</script>
