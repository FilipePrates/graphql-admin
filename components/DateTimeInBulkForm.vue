<template>
  <div class="text-center">
    <div class="d-flex flex-column white" style="border-radius: 8px">
      <div
        class="
          d-flex
          blue-2--text
          font-weight-bold
          gray-7
          py-5
          align-center
          justify-center
          text-h5
        "
      >
        <v-icon class="mr-2 text-h5" color="blue-2">
          mdi-view-grid-plus-outline
        </v-icon>
        <div>Editar Datas</div>
      </div>
      <div class="d-flex flex-column px-10">
        <div class="font-weight-bold mb-8">* Campos obrigatórios</div>
        <v-form>
          <v-row no-gutters justify="space-between">
            <v-col cols="12" class="px-2">
              <date-time-picker
                :label="`Começo`"
                :datetime="startDate"
                @onChange="changedStartDate($event)"
              />
            </v-col>
            <v-col cols="12" class="px-2">
              <date-time-picker
                :label="`Fim`"
                :datetime="endDate"
                @onChange="changedEndDate($event)"
              />
            </v-col>
          </v-row>
        </v-form>
      </div>
      <div class="d-flex align-self-center mb-5" v-if="!loading">
        <v-btn depressed outlined color="blue-2" class="mx-3" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          @click="commitChanges"
          depressed
          color="blue-2"
          class="mx-3 white--text"
        >
          Salvar
        </v-btn>
      </div>
      <div class="d-flex align-self-center mb-5" v-else>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "~/utils/utils.js";
import { DateTime } from "luxon";
import DateTimePicker from "~/components/FormDateTimePicker.vue";
// import jgLib from "@jovens-genios/vue-components";

export default {
  props: ["elements"],
  data() {
    return {
      loading: false,
      startDate: "",
      endDate: "",
    };
  },
  components: {
    DateTimePicker,
  },
  methods: {
    close() {
      this.$emit("closed");
    },
    changedStartDate(value) {
      this.startDate = value;
    },
    changedEndDate(value) {
      this.endDate = value;
    },
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    async commitChanges() {
      let { data } = await this.$apollo.query({
        query: require(`~/graphql/getCurrentDateTime.gql`),
      });
      let now = new DateTime.fromISO(data.currentDateTime).c;
      for (let element of this.elements) {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/${this.__typenameToType(
            element.__typename
          )}/updateDates.gql`),
          variables: {
            Id: element.Id,
            startDate: this.startDate,
            endDate: this.endDate,
            updatedAt: now,
          },
        });
      }
      setTimeout(() => {
        this.close();
        this.$router.go();
      }, 50);
    },

    // @TODO fix mutationBuilder para aceitar variaveis Neo4jDateTime
    // let mutationBuilder = new jgLib.GqlBuilder();
    // for (let element of this.elements) {
    //   mutationBuilder.addMutation({
    //     mutation: require(`@/graphql/${this.__typenameToType(
    //       element.__typename
    //     )}/updateDates.gql`),
    //     variables: {
    //       id: element.Id,
    //       startDate: this.startDate,
    //       endsDate: this.endDate,
    //       updatedAt: now,
    //     },
    //   });
    // }
    // this.$apollo.mutate({
    //   mutation: mutationBuilder.generateMutationRequest(),
    // });
  },
};
</script>
