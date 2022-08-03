<template>
  <v-layout>
    <div
      class="d-flex flex-column justify-center align-center fs-14 grey-1--text text-center"
    >
      <img
        width="160px"
        height="160px"
        :src="require(`@/assets/empty-states/${emptyStates[type].svgName}`)"
      />
      <span class="mt-4">
        <!-- {{ emptyStates[type].sentence }} -->
        no result
      </span>
    </div>
  </v-layout>
</template>
<script>
import { EMPTY_STATES } from "~/utils/constants";
export default {
  props: {
    type: {
      default: "emptyContent",
    },
  },

  data() {
    return {
      emptyStates: EMPTY_STATES,
      sentence: "no results.",
    };
  },
};
</script>
