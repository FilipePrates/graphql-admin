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
            src="FilipePrates/.png"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-container class="footer-card">
      <v-row justify="center">
        <v-col cols="12">
          <v-row>
            <v-col class="justify-center" cols="12">
              <v-text-field
                label="Email"
                placeholder=" "
                prepend-inner-icon="mdi-account-outline"
                v-model="email"
                name="email"
                autocomplete="email"
                color="primary-3"
                class="input-group--focused"
                required
              />
            </v-col>
            <v-col class="justify-center" cols="12">
              <v-text-field
                label="Senha"
                color="primary-3"
                placeholder=" "
                prepend-inner-icon="mdi-key-variant"
                v-model="password"
                name="password"
                autocomplete="current-password"
                :append-icon="hidePassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="hidePassword = !hidePassword"
                :type="hidePassword ? 'password' : 'text'"
                required
                @keyup.enter="signIn"
              />
            </v-col>
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
            @click="signIn"
            elevation="0"
            width="290px"
            color="primary-3"
            height="48px"
            class="my-4"
          >
            <span class="font-weight-regular fs-16 white--text"> Entrar </span>
          </v-btn>
        </v-col>

        <v-col class="d-flex justify-center" cols="12">
          <v-btn
            disabled
            outlined
            dark
            elevation="0"
            width="290px"
            color="primary-3"
            height="48px"
            class="mb-6"
          >
            <span class="font-weight-regular fs-16"> Criar Conta </span>
          </v-btn>
        </v-col>

        <v-col
          class="mt-1 d-flex justify-center align-center cursor-pointer"
          cols="12"
          @click="openContactBox"
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
      email: "",
      password: "",
      e3: true,
      handledError: null,
      hidePassword: true,
      loading: false,
      errorMessage: "",
    };
  },
  components: {
    Loader,
  },
  mounted() {
    this.deleteApolloToken();
  },
  methods: {
    openContactBox() {
      console.log("openContactBox");
    },
    deleteApolloToken() {
      document.cookie =
        "apollo-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("apollo-token");
      localStorage.removeItem("token");
    },
    handleLoginError(error) {
      this.deleteApolloToken();
      if (error.message.includes("401")) {
        this.handledError = "Senha incorreta 🤔";
      } else if (error.message.includes("404")) {
        this.handledError = "Usuário não encontrado 🧐";
      } else {
        this.handledError = error.message;
      }
    },
    async saveToken(token) {
      this.deleteApolloToken();
      this.$apolloHelpers.onLogin(token);
      localStorage.setItem("apollo-token", token);
      const currentUser = await this.$apollo.mutate({
        mutation: require("@/graphql/getCurrentUser.gql"),
      });
      this.$store.commit("setUser", currentUser.data.currentUser);
    },

    async signIn() {
      try {
        this.errorMessage = undefined;
        this.loading = true;
        const { data } = await this.$apollo.mutate({
          mutation: require("@/graphql/login.gql"),
          variables: {
            email: this.email.toLowerCase(),
            password: this.password,
          },
        });
        if (data.login) {
          await this.saveToken(data.login.token);
          this.$router.push("/lista/escolas");
        }
      } catch (error) {
        // this.handleLoginError(error);
        this.loading = false;
      }
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
.login-title-box {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 74.59%;
  height: 100%;
  background: #136c6a;
  box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.25);
  border-radius: 0px;
}
</style>
