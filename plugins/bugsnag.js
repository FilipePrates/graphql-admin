import Vue from "vue";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginVue from "@bugsnag/plugin-vue";

Bugsnag.start({
  apiKey: "a790adc4e6be9fbbedccf90f3a6d303e",
  plugins: [new BugsnagPluginVue()],
});

const bugsnagVue = Bugsnag.getPlugin("vue");
bugsnagVue.installVueErrorHandler(Vue);
