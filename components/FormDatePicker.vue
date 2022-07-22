<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :return-value.sync="date"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="date"
        hide-details
        :disabled="disabled"
        :label="label"
        class="shrink mx-3"
        append-icon="mdi-calendar-month"
        readonly
        outlined
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-date-picker v-model="date" no-title scrollable>
      <v-spacer />
      <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
      <v-btn text color="primary" @click="save"> OK </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  props: {
    defaultDate: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    date: "",
    menu: false,
  }),
  watch: {
    defaultDate(date) {
      this.date = date;
    },
  },
  mounted() {
    this.date = this.defaultDate;
  },
  methods: {
    save() {
      this.$refs.menu.save(this.date);
      this.$emit("changedDate", this.date);
    },
  },
};
</script>
