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
      <v-row v-if="topics.length">
        <v-col>
          <div v-for="topic in topics" :key="topic.name">
            <v-chip class="mt-2"
              >{{ topic.name }}
              <unicon
                style="cursor: pointer"
                @click="removeTopic(topic)"
                name="times"
                fill="#0D47A1"
                class="pa-0 text-center"
              ></unicon>
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="list" justify="center" no-gutters class="my-8">
        <v-col cols="8">
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
            no-data-text="Pesquise por Nome"
            multiple
            hide-details="true"
          >
            <ul slot="item" slot-scope="data">
              <li @click="topics.push(data.item)" style="list-style: none">
                {{ data.item.name }}
              </li>
            </ul>
          </v-autocomplete>
        </v-col>
        <v-col v-if="isMergeSchoolClassToTask()" cols="8">
          <v-switch
            v-model="mergeSchoolClassStudents"
            label="Também conectar os alunos das turmas na Tarefa"
          ></v-switch>
        </v-col>

        <v-col cols="12" class="mt-3">
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
              <div>Adicionar</div>
            </div>
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="!list" no-gutters justify="center" class="text-center my-12">
        <v-col cols="4">
          <loader style="position: relative; top: 30%; left: 40%"></loader>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import utils from "~/utils/utils.js";
import jgLib from "@jovens-genios/vue-components";
import Loader from "~/components/BookLoader.vue";

export default {
  props: ["parent", "typename"],
  data() {
    return {
      Ids: [],
      searchTerm: null,
      interval: null,
      loading: 0,
      mergeSchoolClassStudents: false,
      topics: [],
    };
  },
  computed: {
    tipo() {
      return this.__typenameToType(this.typename) === "notas"
        ? "alunos"
        : this.__typenameToType(this.typename);
    },
  },
  components: { Loader },
  watch: {},
  apollo: {
    list: {
      query() {
        return require(`~/graphql/${this.tipo}/listNames.gql`);
      },
      loadingKey: "loading",
      variables() {
        return {
          filter:
            this.typename != "Topic"
              ? {
                  name_regexp: `.*(?i)${this.searchTerm}.*`,
                }
              : {
                  name_regexp: `.*(?i)${this.searchTerm}.*`,
                  questions_some: {
                    questionId_not: "",
                  },
                },
          first: this.searchTerm != null ? undefined : 1,
          offset: 0,
        };
      },
    },
  },

  methods: {
    close() {
      this.$emit("closed");
    },
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
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    isMergeSchoolClassToTask() {
      return this.typename == "SchoolClass" && this.parent.__typename == "Task";
    },
    async mergeSchoolClassStudentsInTask(id) {
      let studentMerger = new jgLib.GqlBuilder();
      let studentsIds = await this.$apollo.query({
        query: require(`~/graphql/turmas/listStudentIds.gql`),
        variables: { schoolClassId: id },
      });
      let counter = 0;
      for (let student of studentsIds.data.SchoolClass[0].students) {
        counter++;
        let studentMergeVariables = {
          parentId: this.parent.Id,
          childId: student.Id,
        };
        studentMerger.addMutation({
          mutation: require(`@/graphql/atividades/mergeStudent.gql`),
          variables: studentMergeVariables,
        });
        if (counter % 200 == 0) {
          await this.$apollo.mutate({
            mutation: studentMerger.generateMutationRequest(),
          });
          counter = 0;
          studentMerger = new jgLib.GqlBuilder();
        }
      }
      if (counter != 0) {
        await this.$apollo.mutate({
          mutation: studentMerger.generateMutationRequest(),
        });
      }
    },
    async commitChanges() {
      const builder = new jgLib.GqlBuilder();

      for (let id of this.Ids) {
        let variables = { parentId: this.parent.Id, childId: id };
        if (
          this.parent.__typename == "Assessment" &&
          ["Student", "StudentAssessment"].includes(this.typename)
        ) {
          let now = await this.$apollo.query({
            query: require(`~/graphql/getCurrentDateTime.gql`),
          });
          variables.createdAt = now.data.currentDateTime;
        }
        builder.addMutation({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.parent.__typename
          )}/merge${this.typename}.gql`),
          variables: variables,
        });
        if (this.mergeSchoolClassStudents) {
          this.mergeSchoolClassStudentsInTask(id);
        }
      }
      await this.$apollo.mutate({
        mutation: builder.generateMutationRequest(),
      });
      this.$emit("merged", {
        action: "Conectar",
        typename: this.__typenameToType(this.typename),
      });
      this.close();
    },
    removeTopic(topic) {
      let index = this.Ids.indexOf(topic.Id);
      this.Ids.splice(index, 1);

      index = this.topics.indexOf(topic.id);
      this.topics.splice(index, 1);
    },
  },
};
</script>
