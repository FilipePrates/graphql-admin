<template>
  <v-layout style="z-index: 9999; justify-content: center">
    <div>
      <span width="160px" height="160px" class="mt-4"> [ ] </span>
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
