<template>
  <v-app>
    <app-bar
      v-if="!$route.path.includes('login')"
      class="d-none d-md-flex"
      :loading="loading"
    />
    <nuxt />

    <v-dialog v-model="formDialog" persistent class="pa-0" max-width="800px">
      <element-form
        v-if="formDialog"
        :element="formElement"
        :typename="formType"
        :add="add"
        :action="action"
        :opened="formDialog"
        @closed="closed"
        @edited="saved"
      ></element-form>
    </v-dialog>
    <v-dialog v-model="mergeDialog" persistent class="pa-0" max-width="600px">
      <v-card>
        <merge-form
          v-if="mergeDialog"
          :typename="mergeType"
          :parent="mergeParent"
          @closed="closed"
          @merged="saved"
        ></merge-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="mergeTaskStudentsDialog" class="pa-0" max-width="600px">
      <v-card>
        <merge-form-students
          v-if="mergeTaskStudentsDialog"
          :parent="mergeParent"
          @closed="closed"
          @merged="saved"
        ></merge-form-students>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="moveStudentsToNewSchoolClassDialog"
      class="pa-0"
      max-width="600px"
    >
      <v-card>
        <MoveStudentsToNewSchoolClass
          :students="moveStudentsToNewSchoolClassStudents"
          :oldSchoolClassId="moveStudentsToNewSchoolClassOldSchoolClassId"
          @merged="saved"
        >
        </MoveStudentsToNewSchoolClass>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dateTimeinBulkDialog" class="pa-0" max-width="600px">
      <v-card>
        <date-time-in-bulk-form
          :elements="dateTimeInBulkElements"
          @closed="dateTimeinBulkDialog = false"
        >
        </date-time-in-bulk-form>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="changeAssessmentSchoolClassDialog"
      class="pa-0"
      max-width="600px"
    >
      <v-card>
        <ChangeAssessmentSchoolClass
          :assessmentId="changeAssessmentSchoolClassAssessmentId"
          @merged="saved"
          @closed="changeAssessmentSchoolClassDialog = false"
        >
        </ChangeAssessmentSchoolClass>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="feedbackDialog" color="success" class="text-center">{{
      feedbackText ? feedbackText : "Sucesso"
    }}</v-snackbar>
  </v-app>
</template>

<script>
import { DateTime } from "luxon";
import AppBar from "~/components/TheAppBar.vue";
import ElementForm from "~/components/TheForm.vue";
import DateTimeInBulkForm from "~/components/DateTimeInBulkForm.vue";
import MergeForm from "~/components/TheMergeForm.vue";
import MergeFormStudents from "~/components/TheMergeFormStudents.vue";
import MoveStudentsToNewSchoolClass from "~/components/TheMoveStudentsToNewSchoolClass.vue";
import ChangeAssessmentSchoolClass from "~/components/ChangeAssessmentSchoolClass.vue";
import utils from "~/utils/utils.js";
import jgLib from "@jovens-genios/vue-components";
import exportFromJSON from "export-from-json";
import * as XLSX from "xlsx";

export default {
  components: {
    AppBar,
    ElementForm,
    DateTimeInBulkForm,
    MergeForm,
    MergeFormStudents,
    MoveStudentsToNewSchoolClass,
    ChangeAssessmentSchoolClass,
  },
  data() {
    return {
      formElement: {},
      formType: "",
      formDialog: false,
      context: "",
      parentType: "",
      mergeDialog: false,
      mergeTaskStudentsDialog: false,
      changeAssessmentSchoolClassDialog: false,
      moveStudentsToNewSchoolClassDialog: false,
      moveStudentsToNewSchoolClassStudents: [],
      moveStudentsToNewSchoolClassOldSchoolClassId: "",
      changeAssessmentSchoolClassAssessmentId: "",
      dateTimeinBulkDialog: false,
      dateTimeInBulkElements: [],
      mergeParent: "",
      mergeType: "",
      add: false,
      action: "",
      loading: false,
    };
  },
  created() {
    this.$nuxt.$on("profileAction", (payload) => {
      this.profileActionHandler(payload);
    });
    this.$nuxt.$on("tabAction", (payload) => {
      this.tabActionHandler(payload);
    });
    this.$nuxt.$on("elementAction", (payload) => {
      this.elementActionHandler(payload);
    });
    this.$nuxt.$on("copiedText", (payload) => {
      this.feedBackCopiedText(payload);
    });
  },
  computed: {
    feedbackText() {
      return this.$store.getters.getFeedBackText;
    },
    feedbackDialog() {
      return this.$store.getters.getFeedBackDialog;
    },
  },
  watch: {
    feedbackDialog(val) {
      if (val) {
        setTimeout(() => {
          this.$store.commit("setFeedBackDialog", false);
        }, 1000);
      }
    },
  },
  methods: {
    async elementActionHandler(payload) {
      // console.log("eaH", payload);
      this.context = payload.context;
      this.action = payload.action;
      if (payload.action == "Editar") {
        payload.element = payload.elements[0];
        this.handleEdit(payload);
      } else if (payload.action == "Retirar") {
        this.handleRemove(payload);
      } else if (payload.action == "Congelar") {
        this.handleFreeze(payload, true);
      } else if (payload.action == "Descongelar") {
        this.handleFreeze(payload, false);
      } else if (payload.action == "Deletar") {
        payload.element = payload.elements[0];
        await this.handleDelete(payload);
      } else if (payload.action == "Exportar") {
        await this.handleExport(payload);
      } else if (payload.action == "Resetar Senha") {
        await this.handlePasswordReset(payload);
      } else if (payload.action == "Resetar Ranking") {
        await this.handleResetRanking(payload);
      } else if (payload.action == "Reabrir Avaliação") {
        await this.handleOpenAssessment(payload);
      } else if (payload.action == "Mudar de Turma") {
        await this.handleChangeStudentsClass(payload);
      }
    },
    async tabActionHandler(payload) {
      // console.log("taH", payload);
      this.context = payload.context;
      this.action = payload.action;
      if (payload.parent) {
        this.parentType = utils.__typenameToType(payload.parent.__typename);
      } else {
        this.parentType = null;
      }
      if (["Criar&Conectar", "Criar"].includes(payload.action)) {
        this.formType = JSON.parse(JSON.stringify(payload.__typename));
        this.add = true;
        this.formDialog = true;
      } else if (payload.action == "Conectar") {
        if (
          payload.parent.__typename == "Task" &&
          payload.__typename == "Student"
        ) {
          this.mergeType = JSON.parse(JSON.stringify(payload.__typename));
          this.mergeTaskStudentsDialog = true;
          this.mergeParent = payload.parent;
        } else {
          this.mergeType = JSON.parse(JSON.stringify(payload.__typename));
          this.mergeDialog = true;
          this.mergeParent = payload.parent;
        }
      }
    },
    async profileActionHandler(payload) {
      // console.log("paH", payload);
      this.context = payload.context;
      this.action = payload.action;
      if (payload.action == "Editar") {
        this.handleEdit(payload);
      } else if (payload.action == "Congelar") {
        await this.handleFreeze(payload, true);
      } else if (payload.action == "Descongelar") {
        await this.handleFreeze(payload, false);
      } else if (payload.action == "Deletar") {
        await this.handleDelete(payload);
      } else if (payload.action == "Resetar Senha") {
        await this.handlePasswordReset(payload);
      } else if (payload.action == "Mudar a Turma") {
        await this.handleChangeAssessmentSchoolClass(payload);
      }
    },
    async handleExport(payload) {
      let response = [];
      const dataTable = [
        ["ID", "Nome da atividade","Criador", "Email", "Criado em", "Começa em", "Termina em", "Tópicos", "Turma",  "Status"],
      ];
      if (this.$route.path === "/lista/atividades") {
        for (let activity of payload.elements) {
          try {
            response = await this.$apollo.query({
              query: require(`@/graphql/atividades/getTask.gql`),
              variables: { id: activity.Id },
            });
            let task = response.data.Task[0];
            let dates = [
              { date: task.createdAt.formatted },
              { date: task.startDate.formatted },
              { date: task.endDate.formatted },
            ];
            let datesFormatted = dates.map(
              (date) =>
                DateTime.fromISO(date.date)
                  .toLocaleString(DateTime.DATETIME_FULL)
                  .split("BRT")[0]
            );
            dataTable.push([
                    task.id,
                    task.name,
                    task.creator.name,
                    task.creator.email,
                    datesFormatted[0],
                    datesFormatted[1],
                    datesFormatted[2],
                    task.topics.map((topic) => topic.name).join(", "),
                    task.schoolClass
                      .map((schoolClass) => schoolClass.name)
                      .join(", "),
                    this.statusTranslate(task.status),
                  
                ])
          } catch (e) {
            console.log(e);
            alert(e);
            return;
          }
        }
        //end for loop
        const wb = XLSX.utils.book_new();
        
        wb.Props = {
          Title: "Atividades",
          Subject: "Atividades",
          }

        wb.SheetNames.push("Atividades"); //sheet name

        const ws = XLSX.utils.aoa_to_sheet(dataTable); //convert array of arrays into sheet object

        wb.Sheets["Atividades"] = ws; //sheet object

          XLSX.writeFile(wb, "Atividades.xlsx" ,{bookType:'xlsx', type:'binary'}); //write file
      } else {
        for (let activity of payload.elements) {
          try {
            response = await this.$apollo.query({
              query: require(`@/graphql/atividades/ranking.gql`),
              variables: { id: activity.Id },
            });
            setTimeout(() => {
              response.data.Task[0].Ranking.forEach(function (v) {
                delete v.__typename;
              });
              exportFromJSON({
                data: response.data.Task[0].Ranking,
                fileName: activity.name + "_ranking.xls",
                exportType: "xls",
              });
            }, 1000);
          } catch (e) {
            console.log(e);
            alert(e);
            return;
          }
        }
      }
    },
    async handleFreeze(payload, boolean) {
      let now = DateTime.local().c;
      let type = "";
      this.loading = true;
      window.scrollTo(0, 0);
      if (Array.isArray(payload.elements)) {
        type = utils.__typenameToType(payload.elements[0].__typename);
        for (let element of payload.elements) {
          // let freezeBoolean =
          //   element.isFrozen != null ? !element.isFrozen : true;
          element.updatedAt = now;
          element.isFrozen = boolean;
          try {
            await this.$apollo.mutate({
              mutation: require(`@/graphql/${type}/freeze.gql`),
              variables: element,
            });
          } catch (e) {
            console.log(e);
            alert(e);
            return;
          }
        }
      } else {
        type = utils.__typenameToType(payload.element.__typename);
        payload.element.updatedAt = now;
        payload.element.isFrozen = boolean;
        try {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/${type}/freeze.gql`),
            variables: payload.element,
          });
        } catch (e) {
          console.log(e);
          alert(e);
          return;
        }
      }
      this.saved({
        action: "Congelar",
        typename: type,
      });

      this.loading = false;
    },
    async handleEdit(payload) {
      if (payload.elements) {
        if (
          payload.elements.length > 1 &&
          ["Task", "Assessment"].includes(payload.elements[0].__typename)
        ) {
          this.dateTimeInBulkElements = payload.elements;
          this.dateTimeinBulkDialog = true;
          return;
        }
      }
      this.loading = true;
      window.scrollTo(0, 0);
      this.add = false;
      let type = utils.__typenameToType(payload.__typename);
      let { data } = await this.$apollo.query({
        query: require(`~/graphql/${type}/profile.gql`),
        variables: {
          first: 20,
          offset: 0,
          id: payload.element.Id,
          now: DateTime.local().startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
        },
      });
      this.formElement = JSON.parse(JSON.stringify(data.profile[0]));
      this.formType = JSON.parse(JSON.stringify(payload.__typename));
      this.formDialog = true;
      this.loading = false;
    },
    async handleDelete(payload) {
      let type = "";
      if (!payload.elements) {
        payload.elements = [];
      }
      if (payload.elements.length == 0) {
        payload.elements.push(payload.element);
      }
      for (let el of payload.elements) {
        if (confirm(`Certeza que quer deletar ${el.name}`)) {
          if (this.deletingSchoolThatStillHasSchoolClasses(el)) {
            alert("Não é possível deixar turmas sem Escola.");
            return;
          } else {
            type = utils.__typenameToType(el.__typename);
            try {
              await this.$apollo.mutate({
                mutation: require(`@/graphql/${type}/delete.gql`),
                variables: el,
              });
            } catch (e) {
              console.log(e);
              alert(e);
              return;
            }
          }
        }
      }
      this.saved({
        action: "Deletar",
        typename: type,
      });
    },
    async handleChangeAssessmentSchoolClass(payload) {
      this.changeAssessmentSchoolClassAssessmentId = payload.element.Id;
      this.changeAssessmentSchoolClassDialog = true;
    },
    async handlePasswordReset(payload) {
      if (!payload.elements) {
        payload.elements = [];
      }
      if (payload.elements.length == 0) {
        payload.elements.push(payload.element);
      }
      let type = utils.__typenameToType(payload.elements[0].__typename);
      if (
        confirm(
          `Certeza que quer resetar a(s) senhas(s) dos ${type}(s) selecionado(s) para ${
            type == "alunos" ? '"1234"' : '"jovensgenios"'
          }?`
        )
      ) {
        for (let element of payload.elements) {
          try {
            await this.$apollo.mutate({
              mutation: require(`@/graphql/${type}/resetPassword.gql`),
              variables: { Id: element.Id },
            });
          } catch (e) {
            console.log(e);
            alert(e);
            return;
          }
        }
        this.saved({
          action: "Resetar Senha",
          typename: type,
        });
      }
    },
    async handleRemove(payload) {
      if (
        confirm("Certeza que quer retirar o(s) elemento(s) selecionado(s)?")
      ) {
        let parentType = utils.__typenameToType(payload.parent.__typename);
        const builder = new jgLib.GqlBuilder();

        for (let element of payload.elements) {
          if (
            (payload.parent.__typename == "School" &&
              element.__typename == "SchoolClass") ||
            (payload.parent.__typename == "SchoolClass" &&
              element.__typename == "School")
          ) {
            let schoolClassId =
              element.__typename == "SchoolClass"
                ? element.Id
                : payload.parentId;
            let { data } = await this.$apollo.query({
              query: require(`@/graphql/turmas/getSchools.gql`),
              variables: { schoolClassId: schoolClassId },
            });
            if (
              data.SchoolClass[0].schools.length < 2 ||
              data.SchoolClass[0].schools.length < payload.elements.length
            ) {
              alert("Nenhuma turma pode ficar sem escolas");
              return;
            }
          }
          builder.addMutation({
            mutation: require(`@/graphql/${parentType}/remove${element.__typename}.gql`),
            variables: { parentId: payload.parentId, childId: element.Id },
          });
        }
        try {
          await this.$apollo.mutate({
            mutation: builder.generateMutationRequest(),
          });
        } catch (e) {
          console.log(e);
          alert(e);
          return;
        }
        this.saved({
          action: "Retirar",
          typename: utils.__typenameToType(payload.elements[0].__typename),
        });
      }
    },
    async handleResetRanking(payload) {
      if (
        confirm(
          "Certeza que quer resetar/recalcular o ranking desse aluno nesse contexto?"
        )
      ) {
        for (let element of payload.elements) {
          try {
            await this.$apollo.mutate({
              mutation: require(`@/graphql/alunos/resetRanking.gql`),
              variables: {
                Id: element.Id,
                contextId: payload.parentId,
              },
            });
          } catch (e) {
            console.log(e);
            alert(e);
            return;
          }
        }
        this.saved({
          action: "Resetar Ranking",
          typename: utils.__typenameToType(payload.elements[0].__typename),
        });
      }
    },
    async handleChangeStudentsClass(payload) {
      this.moveStudentsToNewSchoolClassOldSchoolClassId = payload.parentId;
      this.moveStudentsToNewSchoolClassStudents = payload.elements.map((el) => {
        return el.Id;
      });
      this.moveStudentsToNewSchoolClassDialog = true;
    },
    async handleOpenAssessment(payload) {
      this.loading = true;
      window.scrollTo(0, 0);
      let now = DateTime.local().c;
      for (let studentAssessment of payload.elements) {
        studentAssessment.createdAt = now;
        try {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/avaliações/open.gql`),
            variables: studentAssessment,
          });
        } catch (e) {
          console.log(e);
          alert(e);
          return;
        }
      }
      this.loading = false;

      this.saved({
        action: "Abriu",
        typename: "Avaliação",
      });
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    feedBackCopiedText() {
      this.$store.commit("setFeedbackText", "Copiado com sucesso!");
      this.$store.commit("setFeedBackDialog", true);
    },
    closed() {
      this.formElement = {};
      this.mergeDialog = false;
      this.formDialog = false;
    },
    feedBack(payload) {
      this.$store.commit(
        "setFeedbackText",
        `${payload.action} ${payload.typename} com sucesso!`
      );
      this.$store.commit("setFeedBackDialog", true);
    },
    deletingSchoolThatStillHasSchoolClasses(element) {
      return (
        element.__typename == "School" && element.numberOfSchoolClasses > 0
      );
    },
    saved(payload) {
      this.$store.commit(
        "setFeedbackText",
        `${payload.action} ${payload.__typename} com sucesso!`
      );
      this.$store.commit("setFeedBackDialog", true);

      this.closed();
      // if (this.add == false) {
      // if (confirm("refresh?")) {
      setTimeout(() => {
        if( 
            this.$route.path.includes(payload.typename) &&
            this.$route.path.includes("perfil") &&
            payload.action === "Deletar" 
          ){
            return   this.routerReplace({path:`/lista/${payload.typename}`});
        }
        else{
          return this.$router.go();
        }
        // this.routerReplace(this.$route.fullPath);
        //this.$router.go();
      }, 50);
      // }
      // }
      // if (this.context == "list") {
      //   try {
      //     const apolloClient = this.$apollo.provider.defaultClient;
      //     const apolloRes = apolloClient.readQuery({
      //       query: require(`@/graphql/${payload.typename}/${this.context}.gql`),
      //       variables: {
      //         first: 20,
      //         offset: 0,
      //         filter: {},
      //       },
      //     });
      //     let data = Object.assign({}, apolloRes);
      //     data[this.context].unshift(
      //       payload.response.data[Object.keys(payload.response.data)[0]]
      //     );
      //     apolloClient.writeQuery({
      //       query: require(`@/graphql/${payload.typename}/${this.context}.gql`),
      //       variables: {
      //         first: 20,
      //         offset: 0,
      //         filter: {},
      //       },
      //       data,
      //     });
      //   } catch (e) {
      //     console.log(e);
      //   }
      // } else if (this.context == "profile") {
      //   try {
      //     // TODO, não ta funcionando essa reatividade
      //     const apolloClient = this.$apollo.provider.defaultClient;
      //     const apolloRes = apolloClient.readQuery({
      //       query: require(`@/graphql/${this.parentType}/${this.context}.gql`),
      //       variables: {
      //         id: this.$route.params.id,
      //         first: 20,
      //         offset: 0,
      //         now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
      //         sinceDate: DateTime.local()
      //           .plus({ days: -30 })
      //           .startOf("day")
      //           .toISO(),
      //         filter: {},
      //       },
      //     });
      //     let data = Object.assign({}, apolloRes);
      //     data[this.context][0][utils.capitalize(payload.typename)].unshift(
      //       payload.response.data[Object.keys(payload.response.data)[0]]
      //     );
      //     apolloClient.writeQuery({
      //       query: require(`@/graphql/${this.parentType}/${this.context}.gql`),
      //       variables: {
      //         id: this.$route.params.id,
      //         first: 20,
      //         offset: 0,
      //         now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
      //         sinceDate: DateTime.local()
      //           .plus({ days: -30 })
      //           .startOf("day")
      //           .toISO(),
      //         filter: {},
      //       },
      //       data,
      //     });
      //   } catch (e) {
      //     console.log(e);
      //   }
      // }
    },
    statusTranslate(status) {
      return utils.translate(status);
    },
  },
};
</script>

<style lang="sass">
body
  background-color: #F9F9F9

.fit-screen
  width: 100%
  max-width: 1400px
</style>
