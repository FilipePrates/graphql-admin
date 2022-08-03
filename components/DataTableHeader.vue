<template>
  <v-row no-gutters justify="center" align="center" style="width: 90%">
    <v-col cols="4" v-if="context === 'list'">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click="clearSelectedElements()"
            v-bind="attrs"
            v-on="on"
            :disabled="selectedElements.length === 0"
            class="white--text mx-1"
            color="grey-2"
            depressed
            small
            fab
          >
            <unicon
              name="check"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Desmarcar</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click="emitElementAction('Editar')"
            v-bind="attrs"
            v-on="on"
            color="grey-2"
            class="white--text mx-1"
            depressed
            fab
            small
            :disabled="
              ['atividades', 'avaliações'].includes(type)
                ? selectedElements.length === 0
                : selectedElements.length != 1
            "
          >
            <unicon
              name="edit"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Editar</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click="emitElementAction('Deletar')"
            v-bind="attrs"
            v-on="on"
            color="grey-2"
            class="white--text mx-1"
            depressed
            fab
            small
            :disabled="selectedElements.length === 0"
          >
            <unicon
              name="trash-alt"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Deletar</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['escolas', 'turmas'].includes(type)"
            @click="emitElementAction('Congelar')"
            v-bind="attrs"
            v-on="on"
            color="grey-2"
            class="white--text mx-1"
            depressed
            fab
            small
            :disabled="selectedElements.length === 0"
          >
            <unicon
              name="snowflake"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Congelar</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['escolas', 'turmas'].includes(type)"
            @click="emitElementAction('Descongelar')"
            v-bind="attrs"
            v-on="on"
            color="grey-2"
            class="white--text mx-1"
            depressed
            fab
            small
            :disabled="selectedElements.length === 0"
          >
            <unicon
              name="fire"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Descongelar</span>
      </v-tooltip>

      <!--        CSV
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['alunos', 'educadores'].includes(type)"
            @click="
              type === 'alunos'
                ? (dialogStudentCsvImport = true)
                : (dialogProfessorCsvImport = true)
            "
            v-bind="attrs"
            v-on="on"
            color="primary-2"
            class="white--text mx-1"
            depressed
            fab
            small
            :disabled="selectedElements.length > 0"
          >
            <unicon
              name="file-import"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Importar Lista de {{ type }}</span>
      </v-tooltip> -->

      <v-dialog v-model="dialogStudentCsvImport" max-width="60vw">
        <StudentCsvImport
          @close="dialogStudentCsvImport = false"
        ></StudentCsvImport>
      </v-dialog>
      <v-dialog v-model="dialogProfessorCsvImport" max-width="60vw">
        <ProfessorCsvImport
          @close="dialogProfessorCsvImport = false"
        ></ProfessorCsvImport>
      </v-dialog>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click="emitTabAction('Criar')"
            v-bind="attrs"
            v-on="on"
            color="primary-2"
            class="white--text mx-1"
            depressed
            fab
            small
          >
            <v-icon class="text"> mdi-plus </v-icon>
          </v-btn>
        </template>
        <span>Criar</span>
      </v-tooltip>
    </v-col>
    <v-col cols="4" v-else-if="context === 'profile'">
      <v-row no-gutters justify="start">
        <v-col v-if="selectedElements.length === 0" cols="1" class="mr-3">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="clearSelectedElements()"
                v-bind="attrs"
                v-on="on"
                color="grey-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  name="check"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </template>
            <span>Marcar todos</span>
          </v-tooltip>
        </v-col>
        <v-col v-else cols="1" class="mr-3">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="clearSelectedElements()"
                v-bind="attrs"
                v-on="on"
                color="grey-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  name="check"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </template>
            <span>Desmarcar</span>
          </v-tooltip>
        </v-col>
        <v-col
          class="mr-3"
          cols="1"
          v-for="(action, actionName) in elementActions"
          :key="actionName"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="emitElementAction(actionName)"
                v-bind="attrs"
                v-on="on"
                :disabled="isEditDisabled(actionName)"
                color="grey-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  :name="action"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </template>
            <span>{{ translate(actionName) }}</span>
          </v-tooltip>
        </v-col>
        <v-col
          v-for="(action, actionName) in tabActions"
          :key="actionName"
          cols="1"
          class="mr-3"
        >
          <v-tooltip bottom v-if="!loading">
            <template v-slot:activator="{ on, attrs }">
              <JsonExcel
                v-if="actionName === 'Exportar'"
                type="xls"
                class=""
                :data="exportData['Ranking']"
                :fields="rankingFieldsToExport"
                :name="exportData.name + '_ranking.xls'"
              >
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  color="primary-2"
                  class="white--text mx-1"
                  depressed
                  fab
                  small
                >
                  <unicon
                    name="file-export"
                    fill="#FFFFFF"
                    class="pa-0 text-center"
                  ></unicon>
                </v-btn>
              </JsonExcel>
              <v-btn
                @click="emitTabAction(actionName)"
                v-bind="attrs"
                v-on="on"
                color="primary-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  :name="action"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </template>
            <span>{{ translate(actionName) }}</span>
          </v-tooltip>
        </v-col>
        <v-tooltip bottom v-if="rankingLoaded">
          <template v-slot:activator="{ on, attrs }">
            <JsonExcel
              type="xls"
              class=""
              :data="rankingData"
              :fields="rankingFieldsToExport"
              :name="rankingName"
            >
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="primary-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  name="chart"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </JsonExcel>
          </template>
          <span>Baixar Ranking</span>
        </v-tooltip>
        <v-progress-circular
          v-if="loading"
          indeterminate
          class="mt-3"
          color="grey-2"
        ></v-progress-circular>
      </v-row>
    </v-col>
    <v-spacer></v-spacer>
    <v-col cols="2">
      <span class="numberOfRows">Mostrando {{ numberOfRows }} resultados</span>
    </v-col>
  </v-row>
</template>

<script>
import JsonExcel from "vue-json-excel";
import utils from "~/utils/utils.js";
import StudentCsvImport from "./TheStudentCsvImport.vue";
import ProfessorCsvImport from "./TheProfessorCsvImport.vue";

export default {
  props: [
    "type",
    "context",
    "selectedElements",
    "elementActions",
    "tabActions",
    "tab",
    "exportData",
    "numberOfRows",
  ],
  components: {
    JsonExcel,
    StudentCsvImport,
    ProfessorCsvImport,
  },
  data: () => ({
    rankingName: "",
    rankingFieldsToExport: {},
    rankingData: [],
    rankingLoaded: false,
    loading: false,
    dialogStudentCsvImport: false,
    dialogProfessorCsvImport: false,
  }),
  methods: {
    async getFullRanking() {
      this.loading = true;

      if (this.exportData.__typename === "Task") {
        try {
          const { data } = await this.$apollo.query({
            query: require("@/graphql/atividades/ranking.gql"),
            variables: {
              id: this.exportData.Id,
            },
            fetchPolicy: "network-only",
          });
          this.rankingData = data.Task[0].Ranking;
          this.rankingFieldsToExport = this.taskRankingFieldsToExport;
          this.rankingName = this.exportData.name + "_ranking.xls";
          this.rankingLoaded = true;
          this.loading = false;
        } catch (e) {
          console.log(e);
        }
      } else if (this.exportData.__typename === "Assessment") {
        let self = this;
        this.rankingData = this.exportData.Notas.map((st) => {
          let flat = this.flatten(st);
          for (let entry of Object.entries(flat)) {
            let newKey = entry[0].split(".").join("-");
            flat[newKey] = entry[1];
            if (flat["status"]) {
              flat["status"] = self.translate(flat["status"]);
            }
          }
          return flat;
        });
        this.rankingFieldsToExport = this.assessmentGradesFieldsToExport;
        this.rankingName = this.exportData.name + "_notas.xls";
        this.rankingLoaded = true;
        this.loading = false;
      }
    },
    flatten(obj) {
      return utils.flatten(obj);
    },

    translate(s) {
      return utils.translate(s);
    },
    clearSelectedElements() {
      this.$emit("clearSelected");
    },
    emitElementAction(action) {
      this.$emit("elementAction", action);
    },
    emitTabAction(action) {
      this.$emit("tabAction", action);
    },
    // TODO limpar
    isEditDisabled(actionName) {
      if (actionName == "Editar") {
        return ["atividades", "avaliacoes"].includes(this.tab.toLowerCase())
          ? this.selectedElements.length === 0
          : this.selectedElements.length != 1;
      } else {
        return this.selectedElements.length === 0;
      }
    },
  },
};
</script>

<style scoped>
.filter-tab {
  border-radius: 0px 20px 20px 0px;
}
.numberOfRows {
  font-family: "Rubik";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  text-align: center;
  color: #949999;
}
</style>
