<template>
  <v-row no-gutters>
    <v-col cols="12" v-if="schoolId">
      <ApolloQuery
        :query="require('@/graphql/escolas/getSchoolClasses.gql')"
        :variables="{ schoolId: schoolId }"
      >
        <template v-slot="{ result: { loading, error, data } }">
          <div v-if="loading" class="loading apollo">Carregando...</div>
          <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
          <div v-else-if="data" class="result apollo">
            <v-autocomplete
              chips
              multiple
              v-model="classes"
              :items="data.School[0].schoolClasses"
              item-text="name"
              item-value="Id"
              label="Turma*"
              outlined
            ></v-autocomplete>
          </div>
          <div v-else class="no-result apollo">
            <v-progress-circular
              class="mb-2"
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
        </template>
      </ApolloQuery>
    </v-col>
    <v-col cols="12" v-else>
      <ApolloQuery :query="require('@/graphql/turmas/listNames.gql')">
        <template v-slot="{ result: { loading, error, data } }">
          <div v-if="loading" class="loading apollo">Carregando...</div>
          <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
          <div v-else-if="data" class="result apollo">
            <v-autocomplete
              class="px-2"
              chips
              multiple
              v-model="classes"
              :items="data.list"
              item-text="name"
              item-value="Id"
              label="Turma*"
              outlined
            ></v-autocomplete>
          </div>
          <div v-else class="no-result apollo">
            <v-progress-circular
              class="mb-2"
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
  props: {
    schoolId: {
      type: String,
      default: null,
    },
    currentClasses: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data: () => ({
    classes: [],
  }),
  watch: {
    classes(newVal) {
      this.$emit("changedClasses", newVal);
    },
    currentClasses(newVal) {
      this.classes = newVal;
    },
  },
};
</script>
