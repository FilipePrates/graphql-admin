<template>
  <v-row no-gutters>
    <v-col cols="12">
      <ApolloQuery :query="require('@/graphql/cursos/listNames.gql')">
        <template v-slot="{ result: { loading, error, data } }">
          <div v-if="loading" class="loading apollo">Carregando...</div>
          <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
          <div v-else-if="data" class="result apollo">
            <v-autocomplete
              v-model="selectedCourses"
              chips
              multiple
              :items="data.list"
              item-text="name"
              item-value="Id"
              label="Cursos*"
              outlined
            ></v-autocomplete>
          </div>
          <div v-else class="no-result apollo">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
        </template>
      </ApolloQuery>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {},
  data: () => ({
    selectedCourses: [
      "cec40946-f187-410c-bba2-12bb8af9045a",
      "39e3d5ff-d18c-492d-bd85-e1fcb85fdbf9",
      "1fae83ce-3a08-4d5c-93fd-6d0574426c19",
      "035842e9-0c63-4d8e-b67e-7029248a8c23",
      "afeb7bf6-6651-4a31-b4bb-302cc4b2a3ba",
      "0d5c54c3-de48-4d83-b187-e062343302b4",
      "c2e75f25-846c-49be-8369-239f6f208cb4",
      "01987e1b-651c-4b66-963a-747d6248c77e",
      "67b00bda-d30e-4b20-bbb8-4ba6dfed362f",
      "e1d44479-9142-45bc-be71-dd427d7361e9",
      "9c7fec71-dfe2-492a-8d69-19f78b697808",
      "70d30115-7ed2-4f40-8766-6c1307937c70",
      "75270b50-5d49-4e48-8673-43b4398a862e",
      "6e051269-684d-4a70-916e-0e86fef06901",
      "c6dd7f05-47c6-4d95-a20f-5f6ebc97d2b6",
      "d9b03469-ba47-42e3-b68e-db33bb8f4bd9",
      "ef9a8f3d-00b6-4b3c-ac03-41b719bd27ac",
      "d75191d0-a48f-4d56-8e97-77094ae9ca38",
      "706ce72a-86ae-4ef5-98a2-ed1e1a236f98",
      "03bbe4b6-6a2f-4604-abd2-1d48a5f3b387",
      "e0dd8afb-c40c-449f-827c-1653fa80277c",
      "299f7301-e2ac-4b02-96c9-2db69e4577de",
      "27d0e67d-0eb0-49ce-bd17-bd9e982e8a39",
      "faeaa568-59ed-45c2-bd24-32f4566a6a44",
      "e4ba966f-8bda-4054-bd2f-a3e41afbdd1f",
      "dc844ade-3835-493a-813d-6ae6516c424e",
      "5150ff35-1644-47a2-bcc5-d54892931d10",
      "27e60c0e-04c0-455b-9d95-17721b99bd4f",
      "e7f1a4e1-ea1e-4458-9db9-0ce044b5a601",
    ],
  }),
  watch: {
    selectedCourses(newVal) {
      this.$emit("changedCourses", newVal);
    },
  },
  mounted() {
    this.$emit("changedCourses", this.selectedCourses);
  },
};
</script>
