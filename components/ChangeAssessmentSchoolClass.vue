<template>
  <div class="text-center">
    <div class="d-flex flex-column white" style="border-radius: 8px">
      <v-row v-if="list" justify="center" no-gutters class="my-8">
        <v-col cols="8" class="mb-3">
          <v-autocomplete
            outlined
            v-model="selectedSchoolClassId"
            :items="list"
            item-text="name"
            @update:search-input="setSearchTerm"
            item-value="Id"
            no-data-text="Pesquise Turma por Nome"
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
            <div v-if="!loading" class="d-flex align-center">
              <v-icon class="mr-1"> mdi-plus-box </v-icon>
              <div>Criar nova avaliação pra turma (e arquivar essa atual)</div>
            </div>
            <v-progress-circular v-else indeterminate></v-progress-circular>
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
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import Loader from "~/components/BookLoader.vue";
import utils from "~/utils/utils.js";

export default {
  props: ["assessmentId"],
  data() {
    return {
      selectedSchoolClassId: "",
      searchTerm: null,
      interval: null,
      loading: 0,
    };
  },
  components: { Loader },
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
  },
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
    profile: {
      query() {
        return require(`~/graphql/avaliações/profile.gql`);
      },
      loadingKey: "loading",
      variables() {
        return {
          id: this.assessmentId,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
        };
      },
    },
  },

  methods: {
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    setSearchTerm(a) {
      if (a != null) {
        clearTimeout(this.interval);
        this.interval = window.setTimeout(() => {
          if (a.length > 2) {
            this.searchTerm = a;
          }
        }, 200);
      }
    },
    async commitChanges() {
      this.loading = true;
      let duplicateAssessment = JSON.parse(JSON.stringify(this.profile[0]));
      let newId = uuidv4();
      duplicateAssessment.Id = newId;
      let { data } = await this.$apollo.query({
        query: require(`~/graphql/getCurrentDateTime.gql`),
      });
      let now = new DateTime.fromISO(data.currentDateTime).c;
      let nowFormatted = data.currentDateTime;
      duplicateAssessment.updatedAt = now;
      let startsAt = new DateTime.fromISO(duplicateAssessment.startsAt.startsAt)
        .c;
      startsAt.timezone = "-03:00";
      let endsAt = new DateTime.fromISO(duplicateAssessment.endsAt.endsAt).c;
      endsAt.timezone = "-03:00";
      duplicateAssessment.startsAt = startsAt;
      duplicateAssessment.endsAt = endsAt;
      duplicateAssessment.normalizedName = utils.normalizeString(
        duplicateAssessment.name
      );

      try {
        await this.$apollo.mutate({
          mutation: require("@/graphql/avaliações/create.gql"),
          variables: duplicateAssessment,
        });
      } catch (e) {
        console.log("Erro na criação da nova avaliação ", e);
      }
      let selectedSchoolClassStudents = {};
      try {
        selectedSchoolClassStudents = await this.$apollo.query({
          query: require("@/graphql/turmas/getStudents.gql"),
          variables: { schoolClassId: this.selectedSchoolClassId },
        });
      } catch (e) {
        console.log("Erro na criação da nova avaliação ", e);
      }
      const mergerStudents = new jgLib.GqlBuilder();
      const mergerQuestions = new jgLib.GqlBuilder();
      for (let assessmentStudent of selectedSchoolClassStudents.data
        .SchoolClass[0].students) {
        mergerStudents.addMutation({
          mutation: require(`@/graphql/avaliações/mergeAssignedContext.gql`),
          variables: {
            parentId: duplicateAssessment.Id,
            childId: assessmentStudent.Id,
            createdAt: nowFormatted,
          },
        });
      }
      for (let assessmentQuestion of this.profile[0].Questoes) {
        mergerQuestions.addMutation({
          mutation: require(`@/graphql/avaliações/mergeQuestion.gql`),
          variables: {
            parentId: duplicateAssessment.Id,
            childId: assessmentQuestion.Question.Id,
            order: assessmentQuestion.order,
            maxGrade: assessmentQuestion.maxGrade,
          },
        });
      }
      try {
        await this.$apollo.mutate({
          mutation: mergerQuestions.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro na conexão da avaliação com questões ", e);
      }
      try {
        await this.$apollo.mutate({
          mutation: mergerStudents.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro na conexão da avaliação com alunos", e);
      }
      if (duplicateAssessment.creator) {
        try {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/avaliações/mergeCreator.gql`),
            variables: {
              parentId: duplicateAssessment.Id,
              childId: duplicateAssessment.creator.Id,
            },
          });
        } catch (e) {
          console.log("Erro ao conectar o Criador ", e);
          alert(e);
          return;
        }
      }
      if (duplicateAssessment.knowledgeArea) {
        try {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/avaliações/mergeKnowledgeArea.gql`),
            variables: {
              parentId: duplicateAssessment.Id,
              childId: this.profile[0].knowledgeArea.id,
            },
          });
        } catch (e) {
          console.log("Erro ao conectar a disciplina ", e);
          alert(e);
          return;
        }
      }
      try {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/avaliações/mergeSchoolClass.gql`),
          variables: {
            parentId: duplicateAssessment.Id,
            childId: this.selectedSchoolClassId,
          },
        });
      } catch (e) {
        console.log("Erro ao conectar o turma ", e);
        alert(e);
        return;
      }
      try {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/avaliações/update.gql`),
          variables: {
            Id: this.assessmentId,
            weight: this.profile[0].weight,
            duration: this.profile[0].duration,
            isArchived: true,
          },
        });
      } catch (e) {
        console.log("Erro ao arquivar a avaliação antiga ", e);
        alert(e);
        return;
      }
      this.loading = false;
      this.routerReplace("/lista/avaliações");
      // this.$emit("merged", {
      //   action: "Merge",
      //   typename: "Turma",
      // });
      this.$emit("closed");
    },
  },
};
</script>
