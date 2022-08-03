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

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['atividades'].includes(type)"
            @click="emitExportAction"
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
              name="file-export"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Exportar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['alunos', 'educadores'].includes(type)"
            @click="emitElementAction('Resetar Senha')"
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
              name="key-skeleton"
              fill="#FFFFFF"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>Resetar Senha</span>
      </v-tooltip>

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
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="['alunos'].includes(type)"
            @click="dialogStudentCsvImportExternal = true"
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
              fill="#404040"
              class="pa-0 text-center"
            ></unicon>
          </v-btn>
        </template>
        <span>[EXTERNAL] Importar Lista de Alunos</span>
      </v-tooltip>

      <v-dialog v-model="dialogStudentCsvImport" max-width="60vw">
        <StudentCsvImport
          @close="dialogStudentCsvImport = false"
        ></StudentCsvImport>
      </v-dialog>
      <v-dialog v-model="dialogStudentCsvImportExternal" max-width="60vw">
        <StudentCsvImportExternal
          @close="dialogStudentCsvImportExternal = false"
        ></StudentCsvImportExternal>
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
                v-else-if="actionName === 'Exportar Relatório' && !reportLoaded"
                @click="getReport()"
                v-on="on"
                color="primary-2"
                class="white--text mx-1"
                :disabled="
                  new Date(exportData['endDate'].endDate).getTime() > now
                "
                depressed
                fab
                small
              >
                <unicon
                  name="file-graph"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
              <v-btn
                v-else-if="actionName === 'Exportar Ranking' && !rankingLoaded"
                @click="getFullRanking()"
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

              <v-btn
                v-else-if="actionName === 'Exportar Pontos' && !historyLoaded"
                @click="getFullPointTransactionHistory()"
                v-on="on"
                color="primary-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  name="history"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>

              <v-btn
                v-else-if="
                  actionName === 'Exportar Respostas' && !studentAnswersLoaded
                "
                @click="getFullStudentAnswerHistory()"
                v-on="on"
                color="primary-2"
                class="white--text mx-1"
                depressed
                fab
                small
              >
                <unicon
                  name="history"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>

              <v-btn
                v-else-if="
                  ![
                    'Exportar Relatório',
                    'Exportar Ranking',
                    'Exportar Respostas',
                    'Exportar Pontos',
                  ].includes(actionName)
                "
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
        <v-tooltip bottom v-if="reportLoaded">
          <template v-slot:activator="{ on, attrs }">
            <JsonExcel
              type="xls"
              class=""
              :data="reportData"
              :fields="reportFieldsToExport"
              :name="exportData.name + '_relatório.xls'"
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
                  name="file-graph"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </JsonExcel>
          </template>
          <span>Baixar Relatório</span>
        </v-tooltip>
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
        <v-tooltip bottom v-if="historyLoaded">
          <template v-slot:activator="{ on, attrs }">
            <JsonExcel
              type="xls"
              class=""
              :data="historyData"
              :fields="historyFieldsToExport"
              :name="exportData.name + '_histórico_pontos.xls'"
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
                  name="history"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </JsonExcel>
          </template>
          <span>Baixar Histórico de Pontos</span>
        </v-tooltip>
        <v-tooltip bottom v-if="studentAnswersLoaded">
          <template v-slot:activator="{ on, attrs }">
            <JsonExcel
              type="xls"
              class=""
              :data="studentAnswersData"
              :fields="studentAnswerFieldsToExport"
              :name="exportData.name + '_historico_respostas.xls'"
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
                  name="history"
                  fill="#FFFFFF"
                  class="pa-0 text-center"
                ></unicon>
              </v-btn>
            </JsonExcel>
          </template>
          <span>Baixar Histórico de Respostas</span>
        </v-tooltip>

        <v-progress-circular
          v-if="loading"
          indeterminate
          class="mt-3"
          color="grey-2"
        ></v-progress-circular>
      </v-row>
    </v-col>
    <v-col :cols="context === 'list' ? 6 : 7">
      <chip-button text="Ordenar" icon="filter" @click="openOrderByDialog()">
      </chip-button>
      <chip-button
        :text="
          changedDates
            ? 'Estatísticas ' +
              ptBrDate(sinceDate) +
              ' - ' +
              ptBrDate(untilDate)
            : 'Estatísticas Desde/Até'
        "
        icon="calendar-alt"
        @click="openSinceDateDialog()"
      >
      </chip-button>
      <chip-button text="Limpar" icon="times" @click="emitClearFilterClick()">
      </chip-button>
    </v-col>
    <v-col :cols="context === 'list' ? 2 : 1">
      <span class="numberOfRows">Mostrando {{ numberOfRows }} resultados</span>
    </v-col>
    <v-dialog
      v-model="dialogSinceDate"
      persistent
      width="30vw"
      class="pa-0 ma-0"
    >
      <v-card>
        <v-row justify="end" no-gutters>
          <v-col cols="2"
            ><v-btn text @click="dialogSinceDate = false" class="py-5">
              <unicon
                name="times"
                fill="#0D47A1"
                class="pa-0 text-center"
              ></unicon>
            </v-btn>
          </v-col>

          <v-col cols="12" class="mb-5">
            <date-picker
              :defaultDate="sinceDate"
              label="Estatísticas Desde:"
              @changedDate="changedSinceDate"
            ></date-picker>
          </v-col>
          <v-col cols="12" class="mb-3">
            <date-picker
              :defaultDate="untilDate"
              label="Estatísticas Até:"
              @changedDate="changedUntilDate"
            ></date-picker>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center">
          <v-btn
            @click="dialogSinceDate = false"
            depressed
            color="blue-2"
            class="white--text mb-3"
          >
            Ok
          </v-btn>
        </v-row>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogOrderBy" persistent width="30vw" class="pa-0 ma-0">
      <v-card>
        <v-row justify="end" no-gutters>
          <v-col cols="2"
            ><v-btn text @click="dialogOrderBy = false" class="py-5">
              <unicon
                name="times"
                fill="#0D47A1"
                class="pa-0 text-center"
              ></unicon>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-select
              label="Ordenar por"
              class="shrink mx-3"
              outlined
              @change="changedOrderBy"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { DateTime } from "luxon";
import ChipButton from "./ChipButton.vue";
import DatePicker from "./FormDatePicker.vue";
import JsonExcel from "vue-json-excel";
import utils from "~/utils/utils.js";
import StudentCsvImport from "./TheStudentCsvImport.vue";
import StudentCsvImportExternal from "./TheStudentCsvImportExternalId.vue";

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
    ChipButton,
    JsonExcel,
    StudentCsvImport,
    StudentCsvImportExternal,
    ProfessorCsvImport,
    DatePicker,
  },
  data: () => ({
    rankingName: "",
    rankingFieldsToExport: {},
    taskRankingFieldsToExport: {
      Nome: "Nome",
      Email: "Email",
      Ano: "Ano",
      Turma: "Turma",
      Pontos: "Pontos",
    },
    assessmentGradesFieldsToExport: {
      Nome: "Student-name",
      Email: "Student-email",
      Tentativas: "attempts",
      Nota: "grade",
      "Tempo Gasto": "timeSpent",
      Estado: "status",
    },
    historyFieldsToExport: {
      Pontos: "quantity",
      "Pontos Bonus (combo/poder)": "bonus",
      Acertou: "studentAnswer-fraction",
      TipoContexto: "studentAnswer-context-__typename",
      IdContexto: "studentAnswer-context-Id",
      NomeContexto: "studentAnswer-context-name",
      Questão: "studentAnswer-question-questionId",
      Tópico: "studentAnswer-question-topic-name",
      Curso: "studentAnswer-question-topic-course-name",
      Data: "studentAnswer-createdAt-formatted",
    },
    studentAnswerFieldsToExport: {
      Pontos: "points",
      "Pontos Bonus (combo/poder)": "bonusPoints",
      Acertou: "fraction",
      TipoContexto: "assignedContext-context-__typename",
      IdContexto: "assignedContext-context-Id",
      NomeContexto: "assignedContext-context-name",
      Questão: "question-questionId",
      Tópico: "question-topic-name",
      Curso: "question-topic-course-name",
      Data: "createdAt-formatted",
    },
    // NomeContext: "studentAnswer-context-name",
    reportFieldsToExport: {
      Nome: "name",
      "Número de Estudantes": "numberOfStudents",
      "Estudantes Ativos": "numberOfActiveStudents",
      "Total de Questões Feitas": "numberOfQuestions",
      "Média de Questões por Aluno": "questionsAverage",
      "Melhor Habilidade": "firstAbility",
      "2ª Melhor Habilidade": "secondAbility",
      "3ª Melhor Habilidade": "thirdAbility",
      "3ª Pior Habilidade": "thirdToLastAbility",
      "2ª Pior Habilidade": "secondToLastAbility",
      "Pior Habilidade": "lastAbility",
      "Melhor Aluno Matemática": "bestStudentMath",
      "Melhor Aluno Linguagens": "bestStudentLang",
      "Melhor Aluno Ciências": "bestStudentSci",
      "Melhor Aluno Geografia": "bestStudentGeo",
      "Melhor Aluno História": "bestStudentHist",
    },
    rankingData: [],
    reportData: [],
    historyData: [],
    studentAnswersData: [],
    reportLoaded: false,
    rankingLoaded: false,
    studentAnswersLoaded: false,
    historyLoaded: false,
    loading: false,
    dialogStudentCsvImport: false,
    dialogStudentCsvImportExternal: false,
    dialogProfessorCsvImport: false,
    dialogSinceDate: false,
    dialogOrderBy: false,
    changedDates: false,
    sinceDate: DateTime.local()
      .plus({ days: -30 })
      .startOf("day")
      .toISO()
      .split("T")[0],
    untilDate: DateTime.local()
      .plus({ days: 1 })
      .startOf("day")
      .toISO()
      .split("T")[0],
  }),
  methods: {
    async getReport() {
      this.loading = true;
      try {
        let dateTime = await this.$apollo.query({
          query: require(`~/graphql/getCurrentDateTime.gql`),
        });
        let now = dateTime.data.currentDateTime;
        const { data } = await this.$apollo.query({
          query: require("@/graphql/atividades/getReport.gql"),
          variables: {
            taskId: this.exportData.Id,
            now: now,
          },
        });
        this.loading = false;
        this.reportLoaded = true;
        this.populateReportData(data.report[0]);
      } catch (e) {
        console.log(e);
      }
    },
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
    async getFullPointTransactionHistory() {
      this.loading = true;
      try {
        const { data } = await this.$apollo.query({
          query: require("@/graphql/alunos/history.gql"),
          variables: {
            id: this.exportData.Id,
          },
        });
        this.historyData = data.Historico[0].Pontos.map((pt) => {
          let flat = this.flatten(pt);
          for (let entry of Object.entries(flat)) {
            let newKey = entry[0].split(".").join("-");
            flat[newKey] = entry[1];
          }
          return flat;
        });
        this.historyLoaded = true;
        this.loading = false;
      } catch (e) {
        console.log(e);
      }
    },
    async getFullStudentAnswerHistory() {
      this.loading = true;
      try {
        const { data } = await this.$apollo.query({
          query: require("@/graphql/alunos/getStudentAnswers.gql"),
          variables: {
            id: this.exportData.Id,
          },
        });
        this.studentAnswersData = data.Student[0].Respostas.map((sa) => {
          let flat = this.flatten(sa);
          for (let entry of Object.entries(flat)) {
            let newKey = entry[0].split(".").join("-");
            flat[newKey] = entry[1];
          }
          return flat;
        });
        this.studentAnswersLoaded = true;
        this.loading = false;
      } catch (e) {
        console.log(e);
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
    emitFilterClick() {
      this.$emit("filter");
    },
    openSinceDateDialog() {
      this.dialogSinceDate = true;
    },
    openOrderByDialog() {
      this.dialogOrderBy = true;
    },
    changedSinceDate(date) {
      this.sinceDate = date;
      this.changedDates = true;
      this.$emit("changedSinceDate", this.sinceDate);
    },
    changedUntilDate(date) {
      this.untilDate = date;
      this.changedDates = true;
      this.$emit("changedUntilDate", this.untilDate);
    },
    changedOrderBy(val) {
      console.log(val);
    },
    ptBrDate(date) {
      return (
        date.substring(8, 10) +
        "/" +
        date.substring(5, 7) +
        "/" +
        date.substring(0, 4)
      );
    },
    isEditDisabled(actionName) {
      if (actionName == "Editar") {
        return ["atividades", "avaliacoes"].includes(this.tab.toLowerCase())
          ? this.selectedElements.length === 0
          : this.selectedElements.length != 1;
      } else {
        return this.selectedElements.length === 0;
      }
    },
    emitClearFilterClick() {
      this.$emit("clearFilter");
      this.changedDates = false;
      let defaultSinceDate = DateTime.local()
        .plus({ days: -30 })
        .startOf("day")
        .toISO()
        .split("T")[0];
      let defaultUntilDate = DateTime.local()
        .plus({ days: 1 })
        .startOf("day")
        .toISO()
        .split("T")[0];
      this.untilDate = defaultUntilDate;
      this.sinceDate = defaultSinceDate;
      this.$emit("changedSinceDate", this.sinceDate);
      this.$emit("changedUntilDate", this.untilDate);
    },
    emitExportAction() {
      $nuxt.$emit("elementAction", {
        action: "Exportar",
        elements: this.selectedElements,
      });
    },
    populateReportData(report) {
      let aggInfo = {};
      aggInfo.name = "Total";
      aggInfo.numberOfStudents = report.numberOfStudents;
      aggInfo.numberOfActiveStudents = report.activeStudents;
      aggInfo.numberOfQuestions = report.questionsAnsweredCount;
      aggInfo.questionsAverage =
        aggInfo.numberOfQuestions > 0
          ? (
              aggInfo.numberOfQuestions / aggInfo.numberOfActiveStudents
            ).toFixed(2)
          : 0;
      this.reportData.push(aggInfo);
      for (let schoolClass of report.schoolClassesStatistics) {
        let schoolClassInfo = {};
        let schoolClassAbilities = report.bestAndWorstAbilities
          .filter((a) => {
            return a.schoolClassName == schoolClass.name;
          })
          .sort(function (a, b) {
            return (
              +(a.performance < b.performance) ||
              +(a.performance === b.performance) - 1
            );
          });
        let schoolClassBestStudentsByKnowledgeArea =
          report.bestStudentsByKnowledgeArea
            .filter((a) => {
              return a.schoolClassName == schoolClass.name;
            })
            .sort(function (a, b) {
              return +(a.hits > b.hits) || +(a.hits === b.hits) - 1;
            });
        schoolClassInfo.name = schoolClass.name;
        schoolClassInfo.numberOfStudents = schoolClass.numberOfStudents;
        schoolClassInfo.numberOfActiveStudents = schoolClass.activeStudents;
        schoolClassInfo.numberOfQuestions = schoolClass.numberOfQuestions;
        schoolClassInfo.questionsAverage = schoolClass.questionsAverage;
        schoolClassInfo.firstAbility = schoolClassAbilities[0]
          ? schoolClassAbilities[0].name +
            " (" +
            schoolClassAbilities[0].hits +
            "/" +
            schoolClassAbilities[0].numberOfTries +
            ")"
          : null;
        schoolClassInfo.secondAbility = schoolClassAbilities[1]
          ? schoolClassAbilities[1].name +
            " (" +
            schoolClassAbilities[1].hits +
            "/" +
            schoolClassAbilities[1].numberOfTries +
            ")"
          : null;
        schoolClassInfo.thirdAbility = schoolClassAbilities[2]
          ? schoolClassAbilities[2].name +
            " (" +
            schoolClassAbilities[2].hits +
            "/" +
            schoolClassAbilities[2].numberOfTries +
            ")"
          : null;
        schoolClassInfo.thirdToLastAbility = schoolClassAbilities[
          schoolClassAbilities.length - 3
        ]
          ? schoolClassAbilities[schoolClassAbilities.length - 3].name +
            " (" +
            schoolClassAbilities[schoolClassAbilities.length - 3].hits +
            "/" +
            schoolClassAbilities[schoolClassAbilities.length - 3]
              .numberOfTries +
            ")"
          : null;
        schoolClassInfo.secondToLastAbility = schoolClassAbilities[
          schoolClassAbilities.length - 2
        ]
          ? schoolClassAbilities[schoolClassAbilities.length - 2].name +
            " (" +
            schoolClassAbilities[schoolClassAbilities.length - 2].hits +
            "/" +
            schoolClassAbilities[schoolClassAbilities.length - 2]
              .numberOfTries +
            ")"
          : null;
        schoolClassInfo.lastAbility = schoolClassAbilities[
          schoolClassAbilities.length - 1
        ]
          ? schoolClassAbilities[schoolClassAbilities.length - 1].name +
            " (" +
            schoolClassAbilities[schoolClassAbilities.length - 1].hits +
            "/" +
            schoolClassAbilities[schoolClassAbilities.length - 1]
              .numberOfTries +
            ")"
          : null;

        let bestMathStudentOfClass =
          schoolClassBestStudentsByKnowledgeArea.find((st) => {
            return st.knowledgeAreaName == "Matemática";
          });
        let bestSciStudentOfClass = schoolClassBestStudentsByKnowledgeArea.find(
          (st) => {
            return st.knowledgeAreaName == "Ciências da Natureza";
          }
        );
        let bestGeoStudentOfClass = schoolClassBestStudentsByKnowledgeArea.find(
          (st) => {
            return st.knowledgeAreaName == "Geografia";
          }
        );
        let bestHistStudentOfClass =
          schoolClassBestStudentsByKnowledgeArea.find((st) => {
            return st.knowledgeAreaName == "História";
          });
        let bestLangStudentOfClass =
          schoolClassBestStudentsByKnowledgeArea.find((st) => {
            return st.knowledgeAreaName == "Linguagens";
          });

        schoolClassInfo.bestStudentMath = bestMathStudentOfClass
          ? bestMathStudentOfClass.bestStudent +
            " (" +
            bestMathStudentOfClass.hits +
            ")"
          : null;
        schoolClassInfo.bestStudentSci = bestSciStudentOfClass
          ? bestSciStudentOfClass.bestStudent +
            " (" +
            bestSciStudentOfClass.hits +
            ")"
          : null;
        schoolClassInfo.bestStudentGeo = bestGeoStudentOfClass
          ? bestGeoStudentOfClass.bestStudent +
            " (" +
            bestGeoStudentOfClass.hits +
            ")"
          : null;
        schoolClassInfo.bestStudentHist = bestHistStudentOfClass
          ? bestHistStudentOfClass.bestStudent +
            " (" +
            bestHistStudentOfClass.hits +
            ")"
          : null;
        schoolClassInfo.bestStudentLang = bestLangStudentOfClass
          ? bestLangStudentOfClass.bestStudent +
            " (" +
            bestLangStudentOfClass.hits +
            ")"
          : null;
        this.reportData.push(schoolClassInfo);
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
