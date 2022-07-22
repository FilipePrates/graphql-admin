import colors from "vuetify/es5/util/colors";
import { Settings } from "luxon";

Settings.defaultLocale = "pt-Br";
const AUTH_TOKEN = "apollo-token";

let httpEndpoint;
let wsEndpoint;

if (process.env.NODE_ENV == "development") {
  httpEndpoint = "https://ecs-api-stage.jovensgenios.com/graphql";
  wsEndpoint = "wss://ecs-api-stage.jovensgenios.com/graphql";
}

//Não mexer!
if (process.env.VUE_APP_ENV == "staging") {
  httpEndpoint = "https://ecs-api-stage.jovensgenios.com/graphql";
  wsEndpoint = "wss://ecs-api-stage.jovensgenios.com/graphql";
} else if (process.env.VUE_APP_ENV == "testing") {
  httpEndpoint = "https://ecs-api-stage.jovensgenios.com:444/graphql";
  wsEndpoint = "wss://ecs-api-stage.jovensgenios.com:444/graphql";
} else if (process.env.NODE_ENV == "production") {
  httpEndpoint = "https://ecs-api.jovensgenios.com/graphql";
  wsEndpoint = "wss://ecs-api.jovensgenios.com/graphql";
}
export default {
  ssr: false,
  server: {
    port: 3000,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "graphql-admin",
    title: "FilipePrates",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["~/plugins/unicons", "~/plugins/bugsnag"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    "@nuxtjs/eslint-module",
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/apollo"],

  apollo: {
    clientConfigs: {
      default: {
        // You can use `https` for secure connection (recommended in production)
        httpEndpoint,
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint,
        // LocalStorage token
        tokenName: AUTH_TOKEN,
        // Enable Automatic Query persisting with Apollo Engine
        persisting: false,
        // Use websockets for everything (no HTTP)
        // You need to pass a `wsEndpoint` for this to work
        websocketsOnly: false,
        // Is being rendered on the server?
        ssr: false,
        // cache: new InMemoryCache({ fragmentMatcher }),
      },
    },
    includeNodeModules: true,
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        light: {
          "primary-1": "#404040",
          "primary-2": "#282828",
          "primary-3": "#181818",
          "primary-4": "#121212",
          "primary-5": "#67E5E1",
          "primary-6": "#99FFFC",
          "primary-7": "#CCFFFD",
          "primary-8": "#EBFFFE",
          "secondary-1": "#594C00",
          "secondary-2": "#B3B3B3",
          "secondary-3": "#CCAE00",
          "secondary-4": "#ECCD19",
          "secondary-5": "#F2D83D",
          "secondary-6": "#F2DF6D",
          "secondary-7": "#F2E596",
          "secondary-8": "#F2EABB",
          "blue-1": "#082D66",
          "blue-2": "#0D47A1",
          "blue-3": "#1565C0",
          "blue-4": "#2E84E5",
          "blue-5": "#5C9CE5",
          "blue-6": "#89B4E5",
          "blue-7": "#C2D9F2",
          "blue-8": "#C8DFFA",
          "blue-auxiliary-1": "#082D66",
          "blue-auxiliary-2": "#0D47A1",
          "blue-auxiliary-3": "#1565C0",
          "blue-auxiliary-4": "#2E84E5",
          "blue-auxiliary-8": "#C8DFFA",
          "orange-1": "#803A00",
          "orange-2": "#A64B00",
          "orange-3": "#EF6C00",
          "orange-4": "#EF8630",
          "orange-5": "#F59E56",
          "orange-6": "#FAB57D",
          "orange-7": "#FACAA2",
          "orange-8": "#FADFC8",
          "brown-1": "#B9A75E",
          "brown-2": "#CABD86",
          "brown-3": "#DCD3AF",
          "brown-4": "#EDE9D7",
          "red-1": "#660505",
          "red-2": "#990F0F",
          "red-3": "#B71C1C",
          "red-4": "#CC3D3D",
          "red-5": "#E55C5C",
          "red-6": "#F27979",
          "red-7": "#F59393",
          "red-8": "#FAC8C8",
          "red-auxiliary-1": "#F64F77",
          "red-auxiliary-4": "#FCD3DD",
          "green-1": "#086634",
          "green-2": "#0DA152",
          "green-3": "#15C065",
          "green-4": "#2EE584",
          "green-5": "#5CE59C",
          "green-6": "#89E5B4",
          "green-7": "#C2F2D8",
          "green-8": "#C8FADF",
          "green-auxiliary-1": "#31D0AA",
          "green-auxiliary-4": "#EBFBF7",
          "purple-1": "#38004D",
          "purple-2": "#540073",
          "purple-3": "#761799",
          "purple-4": "#9C39BF",
          "purple-5": "#C467E5",
          "purple-6": "#E499FF",
          "purple-7": "#F1CCFF",
          "purple-8": "#FAEBFF",
          "grey-1": "#293232",
          "grey-2": "#5F6565",
          "grey-3": "#949999",
          "grey-4": "#C9CBCB",
          "grey-5": "#E4E5E5",
          "grey-6": "#F2F2F2",
          "grey-7": "#F9F9F9",
          "grey-8": "#FFFFFF",
          "grey-9": "#C4C4C4",
        },
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
