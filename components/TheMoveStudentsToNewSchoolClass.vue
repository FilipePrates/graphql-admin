<template>
  <div class="text-center">
    <div class="d-flex flex-column white" style="border-radius: 8px">
      <v-row v-if="list" justify="center" no-gutters class="my-8">
        <v-col cols="8" class="mb-3">
          <div v-if="loading">
            <loader style="position: relative; top: 30%; left: 45%"></loader>
          </div>
          <v-autocomplete
            outlined
            v-model="Ids"
            :items="list"
            item-text="name"
            @update:search-input="setSearchTerm"
            item-value="Id"
            no-data-text="Pesquise Turma por Nome"
            multiple
          >
            <template slot="selection" slot-scope="data">
              <v-chip>
                {{ data.item.name }}
              </v-chip>
            </template>
            <template slot="item" slot-scope="data">
              {{ data.item.name }}
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-btn
            @click="commitChanges()"
            class="ml-4 blue-2--text"
            style="text-transform: none !important"
            depressed
            color="blue-8"
            height="56"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-1"> mdi-plus-box </v-icon>
              <div>Mover</div>
            </div>
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-else no-gutters justify="center" class="text-center my-12">
        <v-col cols="4">
          <loader style="position: relative; top: 30%; left: 40%"></loader>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import jgLib from "@jovens-genios/vue-components";
import Loader from "~/components/JGLoader.vue";

export default {
  props: ["students", "oldSchoolClassId"],
  data() {
    return {
      Ids: [],
      searchTerm: null,
      interval: null,
      loading: 0,
    };
  },
  components: { Loader },
  watch: {},
  apollo: {
    list: {
      query() {
        return require(`~/graphql/turmas/listNames.gql`);
      },
      loadingKey: "loading",
      variables() {
        return {
          filter: {
            name_regexp: `.*(?i)${this.searchTerm}.*`,
          },
          first: this.searchTerm != null ? undefined : 1,
          offset: 0,
        };
      },
    },
  },

  methods: {
    setSearchTerm(a) {
      if (a != null) {
        clearTimeout(this.interval);
        this.interval = window.setTimeout(() => {
          if (a.length > 2) {
            this.searchTerm = a;
          }
        }, 300);
      }
    },
    async commitChanges() {
      const merger = new jgLib.GqlBuilder();
      const remover = new jgLib.GqlBuilder();
      for (let studentId of this.students) {
        for (let schoolClassId of this.Ids) {
          let mergerVariables = { parentId: studentId, childId: schoolClassId };
          merger.addMutation({
            mutation: require(`@/graphql/alunos/mergeSchoolClass.gql`),
            variables: mergerVariables,
          });
          let removerVariables = {
            parentId: studentId,
            childId: this.oldSchoolClassId,
          };
          remover.addMutation({
            mutation: require(`@/graphql/alunos/removeSchoolClass.gql`),
            variables: removerVariables,
          });
        }
      }
      try {
        await this.$apollo.mutate({
          mutation: remover.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro na remoção da turma antiga ", e);
      }
      try {
        await this.$apollo.mutate({
          mutation: merger.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro na conexão com a(s) turma(s) nova(s) ", e);
      }
      this.$emit("merged", {
        action: "Conectar",
        typename: "Turma",
      });
      this.$emit("closed");
    },
  },
};
</script>
