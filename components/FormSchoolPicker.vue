<template>
  <v-row no-gutters>
    <v-col cols="12">
      <ApolloQuery :query="require('@/graphql/escolas/listNames.gql')">
        <template v-slot="{ result: { loading, error, data } }">
          <div v-if="loading" class="loading apollo">Carregando...</div>
          <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
          <div v-else-if="data" class="result apollo">
            <v-autocomplete
              chips
              :multiple="multiple"
              :items="data.list"
              item-text="name"
              item-value="Id"
              label="Escola"
              @input="changedSchool"
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
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),
  methods: {
    changedSchool($event) {
      this.$emit("changedSchool", $event);
    },
  },
};
</script>
