<template>
  <v-row no-gutters>
    <v-col cols="6" class="pr-2">
      <v-text-field
        :label="label"
        :disabled="disabled"
        type="date"
        v-model="newDate"
        outlined
        @change="onChange"
      />
    </v-col>
    <v-col cols="6" class="pl-2">
      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="newTime"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="newTime"
            :disabled="disabled"
            label="Horário"
            append-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
            outlined
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="menu"
          v-model="newTime"
          ampm-in-title
          format="24hr"
          @change="
            () => {
              onChange();
              $refs.menu.save(newTime);
            }
          "
        ></v-time-picker>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    datetime: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    newDate: null,
    newTime: null,
    menu: false,
  }),
  methods: {
    onChange() {
      let output = {};
      if (this.newDate) {
        output.year = parseInt(this.newDate.split("-")[0]);
        output.month = parseInt(this.newDate.split("-")[1]);
        output.day = parseInt(this.newDate.split("-")[2]);
      }
      if (this.newTime) {
        output.hour = parseInt(this.newTime.split(":")[0]);
        output.minute = parseInt(this.newTime.split(":")[1]);
      }
      output.timezone = "-03:00";
      this.$emit("onChange", output);
    },
  },
  mounted() {
    if (this.datetime) {
      this.newDate = this.datetime.split("T")[0];
      if (this.datetime.split("T").length > 1) {
        this.newTime = this.datetime.split("T")[1].substring(0, 5);
      }
    }
  },
};
</script>
