module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  },
  globals: {
    $nuxt: true,
    amplitude: "readonly",
    moment: "readonly",
    axios: "readonly",
    introJs: "readonly",
    MathJax: "readonly",
    TimeMe: "readonly",
    DateTime: "readonly"
  }
};
