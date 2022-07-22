<template>
  <v-btn
    class="chipButtonText chipButton px-3 mx-2"
    style="text-transform: none !important"
    @click.stop="click()"
    >{{ text }}<unicon :name="icon" fill="#5f6565"></unicon>
  </v-btn>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "exclamation-triangle",
    },
  },
  data: () => ({}),
  methods: {
    click() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.chipButtonText {
  font-family: Rubik;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 150%;
  /* identical to box height, or 24px */

  text-align: center;

  /* gray / 02 */

  color: #5f6565;

  /* Inside Auto Layout */

  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 0px 8px;
}

.chipButton {
  background: #ffffff;
  /* gray / 05 */

  border: 1px solid #e4e5e5;
  box-sizing: border-box;
  /* letra :) */

  box-shadow: 0px 1px 3px rgba(255, 255, 255, 0.4);
  border-radius: 8px;

  /* Inside Auto Layout */

  flex: none;
  order: 2;
  flex-grow: 0;
  margin: 0px 25px;
}
</style>
