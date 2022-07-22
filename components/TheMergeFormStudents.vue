<template>
  <div class="text-center">
    <div class="d-flex flex-column white" style="border-radius: 8px">
      <v-row no-gutters justify="end" class="pa-0 ma-0"
        ><v-col cols="2"
          ><v-btn text @click="close()">
            <unicon
              name="times"
              fill="#0D47A1"
              class="pa-0 text-center"
            ></unicon>
          </v-btn> </v-col
      ></v-row>
      <v-row v-if="list" justify="center" no-gutters class="my-3">
        <v-col cols="8">
          <span class="profile-title">Alunos das Turmas da Atividade</span>
          <v-select
            class="mt-3"
            outlined
            v-model="Ids"
            :items="students"
            item-text="name"
            item-value="Id"
            no-data-text="Nenhuma Turma na Atividade"
            multiple
          >
            <template slot="selection" slot-scope="data">
              <v-chip>
                {{ data.item.name + " | " + data.item.email }}
              </v-chip>
            </template>
            <template slot="item" slot-scope="data">
              {{ data.item.name }}
              {{ data.item.email ? " | " + data.item.email : "" }}
            </template>
          </v-select>
        </v-col>
        <v-col cols="12">
          <v-btn
            @click="mergeAll()"
            class="ml-4 blue-2--text"
            style="text-transform: none !important"
            depressed
            color="blue-8"
            height="56"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-1"> mdi-plus-box </v-icon>
              <div>Adicionar Todos</div>
            </div>
          </v-btn>
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
              <div>Adicionar Selecionados</div>
            </div>
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-else no-gutters justify="center" class="text-center my-12">
        <v-col cols="4">
          <v-progress-circular indeterminate color="blue"></v-progress-circular>
        </v-col>
      </v-row>
      <v-row
        v-if="loading"
        no-gutters
        justify="center"
        class="text-center my-12"
      >
        <v-col cols="4">
          <v-progress-circular indeterminate color="blue"></v-progress-circular>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import utils from "~/utils/utils.js";
// import jgLib from "@jovens-genios/vue-components";

export default {
  props: ["parent", "typename"],
  data() {
    return {
      Ids: [],
      searchTerm: null,
      interval: null,
      loading: false,
    };
  },
  computed: {
    students() {
      return [].concat.apply(
        [],
        this.list.map((sc) => {
          return sc.students;
        })
      );
    },
  },
  components: {},
  watch: {},
  apollo: {
    list: {
      query() {
        return require(`~/graphql/turmas/listStudentNames.gql`);
      },
      variables() {
        return {
          filter: {
            schoolClassId_in: this.parent.Turmas.map((sc) => {
              return sc.Id;
            }),
          },
        };
      },
    },
  },

  methods: {
    close() {
      this.$emit("closed");
    },
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    async commitChanges() {
      this.loading = true;
      let now = await this.$apollo.query({
        query: require(`~/graphql/getCurrentDateTime.gql`),
      });
      for (let id of this.Ids) {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/atividades/mergeStudent.gql`),
          variables: {
            parentId: this.parent.Id,
            childId: id,
            createdAt: now.data.currentDateTime,
          },
        });
      }
      this.loading = false;
      this.$emit("merged", { action: "Conectar", typename: this.typename });
      this.$emit("closed");
    },
    async mergeAll() {
      this.loading = true;
      let now = await this.$apollo.query({
        query: require(`~/graphql/getCurrentDateTime.gql`),
      });
      for (let student of this.students) {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/atividades/mergeStudent.gql`),
          variables: {
            parentId: this.parent.Id,
            childId: student.Id,
            createdAt: now.data.currentDateTime,
          },
        });
      }
      this.loading = false;
      this.$emit("merged", {
        action: "Conectar",
        typename: this.__typenameToType(this.typename),
      });
      this.close();
    },
  },
};
</script>
<style scoped>
.profile-title {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  /* identical to box height, or 24px */

  text-align: center;

  /* auxiliary / blue / 01 */

  color: #082d66;
}
</style>
