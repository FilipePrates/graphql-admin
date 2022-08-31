<template>
  <v-container
    style="
      background-color: #efefef !important;
      background-color: rgb(239, 239, 239) !important;
      max-width: 720px;
      min-height: 100vh;
    "
    class="fade-in-anim grey-7"
  >
    <v-container class="header-card">
      <v-row no-gutters style="top: 55% !important; position: relative">
        <v-col class="d-flex justify-center" cols="12">
          <v-img
            max-width="225px"
            contain
            max-height="80px"
            alt="logo"
            src="/logo.png"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-container class="footer-card">
      <v-row justify="center">
        <v-col cols="12">
          <v-row>
            <v-col class="justify-center text-center mt-5" cols="12">
              <span class="setup-title">Generic GraphQL Manager</span>
              <v-icon color="#888888" size="13">mdi-help-circle</v-icon>
            </v-col>
            <v-col class="text-center">
              <span class="setup-subtitle" style="max-width: 40vw"
                >Read, Write and Traverse your Database</span
              ><br />
              Every Node has a Profile, every Relationship as a Link
            </v-col>
            <v-col class="justify-center" cols="12">
              <v-text-field
                label="GraphQL Endpoint"
                placeholder=" "
                prepend-inner-icon="mdi-link"
                v-model="endpoint"
                name="endpoint"
                color="primary-3"
                class="input-group--focused"
                required
              />
            </v-col>
            <v-col class="justify-center" cols="12"> </v-col>
          </v-row>

          <v-fade-transition>
            <v-alert outlined v-if="!loading && errorMessage" color="red-5">
              {{ errorMessage }}
            </v-alert>
          </v-fade-transition>
        </v-col>
        <v-col cols="1">
          <loader v-if="loading"></loader>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col class="d-flex justify-center" cols="12">
          <v-btn
            @click="saveEndPoint"
            elevation="0"
            width="290px"
            color="primary-3"
            height="48px"
            class="my-4"
          >
            <span class="font-weight-regular fs-16 white--text"> Entrar </span>
          </v-btn>
        </v-col>

        <v-col
          class="mt-1 d-flex justify-center align-center cursor-pointer"
          cols="12"
        >
          <v-icon class="mr-2">mdi-help-circle-outline</v-icon>

          <span class="font-weight-regular fs-16 grey-2--text">
            Me contate
          </span>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import Loader from "~/components/BookLoader.vue";

export default {
  data() {
    return {
      endpoint: "",
      e3: true,
      handledError: null,
      loading: false,
      errorMessage: "",
    };
  },
  components: {
    Loader,
  },
  methods: {
    async saveEndPoint() {
      this.$store.commit("setGraphQLEndPoint", this.endpoint);
      this.$router.push("/login");
      try {
        this.errorMessage = undefined;
        this.loading = true;
        this.getNodeLabels();
        this.loading = false;
      } catch (error) {
        // this.handleLoginError(error);
        this.errorMessage = error;
        this.loading = false;
      }
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
    },
  },
};
</script>

<style scoped>
@media only screen and (max-width: 600px) {
  .login-footer-card {
    height: 120%;
  }
}
@media only screen and (min-width: 600px) {
  .login-footer-card {
    height: auto;
  }
}
.header-card {
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 28%;
  width: 100%;
  max-width: 720px;
  border-radius: 100% / 50%;
  background-color: #e5e5e5;
}
.login-footer-card {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 16.98%;
  bottom: 0%;
  background: #ffffff;
  box-shadow: 0px -4px 18px rgba(0, 0, 0, 0.25);
  border-radius: 0px 78px 0px 0px;
}
.footer-card {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 15%;
  max-width: 600px;
  background: EFEFEF;
}

.setup-title {
  font-weight: bold;
}
</style>
