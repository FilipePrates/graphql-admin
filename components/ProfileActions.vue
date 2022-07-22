<template>
  <v-card class="ma-0 pa-0">
    <v-row no-gutters>
      <v-col
        cols="12"
        class="text-center"
        v-for="(action, i) in actions"
        :key="i"
      >
        <v-btn
          @click="$emit('profileAction', type, action)"
          text
          class="align-self-start text-none my-2"
        >
          <span
            :class="`${action == 'Deletar' ? 'red-action' : 'black-action'}`"
          >
            {{ action }}
          </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: ["actions", "type"],
  data() {
    return {};
  },
};
</script>

<style></style>
