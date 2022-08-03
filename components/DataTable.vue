<template>
  <v-row style="width: 90vw" justify="space-around" no-gutters>
    <v-col cols="12" v-if="$route.params.id">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"
            v-on="on"
            v-model="searchTerm"
            class="mx-4"
            outlined
            prepend-inner-icon="mdi-magnify"
          />
        </template>
        <span>Provisoriamente só pesquisa elementos já carregados.</span>
      </v-tooltip>
    </v-col>
    <v-col cols="12">
      <v-data-table
        class="tbody"
        v-if="searchedRows.length > 0"
        :headers="
          headers.map((h) => {
            return { text: translate(h), value: h, align: 'start' };
          })
        "
        :items="searchedRows"
        :custom-sort="customSort"
        @click:row="navigate"
        hide-default-footer
        disable-pagination
      >
        <template v-slot:[`item.✓`]="{ item }">
          <v-btn
            v-if="
              selectedData.filter((d) => {
                return !!d.Id
                  ? d.Id === item.Id
                  : d['Student.Id'] === item['Student.Id'];
              }).length > 0
            "
            @click.stop="
              selectedData.splice(
                selectedData.findIndex((d) => {
                  return d.Id
                    ? d.Id === item.Id
                    : d['Student.Id'] === item['Student.Id'];
                }),
                1
              )
            "
            text
            style="height: 100%"
          >
            <v-btn fab depressed color="grey-2" height="30px" width="30px">
              <v-icon class="white--text text-body-2"> mdi-check </v-icon>
            </v-btn>
          </v-btn>
          <v-btn
            v-else
            @click.stop="selectedData.push(item)"
            text
            style="height: 100%"
          >
            <v-btn
              fab
              color="grey-9"
              height="30px"
              width="30px"
              depressed
            ></v-btn>
          </v-btn>
        </template>
        <template v-slot:[`item.newTab`]="{ item }">
          <a :href="navigateNewTabLink(item)">
            <v-btn
              text
              style="height: 100%"
              depressed
              @click.stop.prevent="navigateNewTab(item)"
            >
              <unicon name="arrow-up-right" fill="grey"></unicon>
            </v-btn>
          </a>
        </template>

        <template v-slot:[`item.activeStudentsPercentage`]="{ item }">
          <v-progress-circular
            v-if="loadingActiveStudents.includes(item.Id)"
            color="primary-1"
            size="25"
            indeterminate
          ></v-progress-circular>
          <v-btn
            v-else-if="activeStudentsPercentage[item.Id] == undefined"
            style="height: 100%"
            text
            depressed
            @click.stop="getActiveStudents(item)"
          >
            <unicon name="cloud-download" fill="grey"></unicon>
          </v-btn>
          <span v-else>{{
            (activeStudentsPercentage[item.Id] * 100).toFixed(1) + "%"
          }}</span>
        </template>

        <template v-slot:[`item.pointsMade`]="{ item }">
          <v-progress-circular
            v-if="loadingTasksPointsMade.includes(item.Id)"
            color="primary-1"
            size="25"
            indeterminate
          ></v-progress-circular>
          <v-btn
            v-else-if="tasksPointsMade[item.Id] == undefined"
            style="height: 100%"
            text
            depressed
            @click.stop="getPointsMade(item)"
          >
            <unicon name="cloud-download" fill="grey"></unicon>
          </v-btn>
          <span v-else>{{ tasksPointsMade[item.Id] }}</span>
        </template>

        <template v-slot:[`item.Id`]="{ item }">
          <v-btn
            height="30px"
            width="30px"
            fab
            text
            depressed
            @click.stop="copy(item.Id)"
          >
            <unicon name="copy-alt" fill="grey"></unicon>
          </v-btn>
        </template>
        <template v-slot:[`item.Assessment.Id`]="{ item }">
          <v-btn
            height="30px"
            width="30px"
            fab
            text
            depressed
            @click.stop="copy(item['Assessment.Id'])"
          >
            <unicon name="copy-alt" fill="grey"></unicon>
          </v-btn>
        </template>
        <template v-slot:[`item.view`]="{ item }">
          <v-btn
            height="30px"
            width="30px"
            fab
            text
            depressed
            @click.stop="viewElement(item)"
          >
            <unicon name="search" fill="grey"></unicon>
          </v-btn>
        </template>
      </v-data-table>
    </v-col>
    <v-row
      v-if="searchedRows.length == 0"
      no-gutters
      justify="center"
      class="text-center"
    >
      <v-col cols="2"> <empty-state type="emptyContent" class="my-4" /> </v-col>
    </v-row>
    <v-dialog v-model="dialogViewPointTransaction" max-width="50vw">
      <v-card>
        <ApolloQuery
          v-if="viewingQuestionId != ''"
          :query="require('@/graphql/questoes/view.gql')"
          :variables="{ questionId: viewingQuestionId }"
        >
          <template v-slot="{ result: { loading, error, data } }">
            <div v-if="loading" class="loading apollo">Carregando...</div>
            <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
            <div v-else-if="data" class="result apollo">
              <span class="ma-1">Id da questão: {{ viewingQuestionId }}</span>

              <v-card class="pa-5" color="#F0F0F0">
                <v-card
                  v-html="data.Question[0].text"
                  class="pa-1 mb-2 mt-1"
                ></v-card>
                <v-card
                  v-for="(answer, i) in data.Question[0].answers"
                  v-html="answer.text"
                  :key="i"
                  :color="answer.fraction ? 'primary-1' : '#fffffff'"
                  class="pa-1 ma-1"
                >
                </v-card>
              </v-card>
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
      </v-card>
      <v-btn
        color="primary-1"
        v-if="['Atividade', 'Task'].includes(viewingContextTypename)"
        :to="'/perfil/atividades/' + viewingContextId"
        >Ir para perfil da atividade
        <unicon class="mt-1" name="arrow-right" fill="grey"></unicon>
      </v-btn>
    </v-dialog>
    <v-dialog v-model="dialogViewNationalOlympicsTopics" max-width="50vw">
      <v-card class="pa-2">
        <v-row
          v-if="Object.keys(viewingMissionNationalOlympicsTopics).length == 0"
          no-gutters
        >
          <v-col>
            <span>Esse tópico não é da Olimpíada Nacional</span>
          </v-col>
        </v-row>
        <v-row v-else no-gutters>
          <v-col
            cols="12"
            v-for="topic in Object.entries(
              viewingMissionNationalOlympicsTopics
            )"
            :key="topic[1]"
          >
            <ApolloQuery
              :query="require('@/graphql/topicos/getTopic.gql')"
              :variables="{ topicId: topic[1] }"
            >
              <template v-slot="{ result: { loading, error, data } }">
                <div v-if="loading" class="loading apollo">Carregando...</div>
                <div v-else-if="error" class="error apollo">
                  Um erro ocorreu :(
                </div>
                <div v-else-if="data" class="result apollo">
                  <v-card color="#F0F0F0" class="my-2">
                    <v-row no-gutters justify="center">
                      <v-col cols="12" class="pa-2">
                        <span>{{ translate(topic[0]) }}:</span>
                      </v-col>
                      <!-- bug estranho, fala que ta copiando mas não está
                      <v-col cols="1">
                        <v-btn
                          height="30px"
                          width="30px"
                          fab
                          text
                          depressed
                          @click="copy(topic[1])"
                        >
                          <unicon name="copy-alt" fill="#2E84E5"></unicon>
                        </v-btn>
                      </v-col> -->
                      <v-col cols="8">
                        <span>{{
                          data.Topic[0].name + " | " + data.Topic[0].course.name
                        }}</span></v-col
                      >
                    </v-row>
                  </v-card>
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
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import utils from "~/utils/utils.js";
import { DateTime } from "luxon";
import EmptyState from "~/components/EmptyState.vue";

export default {
  props: {
    type: {
      type: String,
      default: () => "",
    },
    rows: {
      type: Array,
      default: () => [],
    },
    isProfile: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Array,
      default: () => [],
    },
    context: {
      type: String,
      default: () => "",
    },
    sinceDate: {
      type: String,
      default: () =>
        DateTime.local()
          .plus({ days: -30 })
          .startOf("day")
          .toISO()
          .split("T")[0],
    },
  },
  data() {
    return {
      selectedData: [],
      searchTerm: "",
      drag: false,
      dialogViewQuestions: false,
      viewingQuestionId: "",
      viewingContextTypename: "",
      dialogViewNationalOlympicsTopics: false,
      viewingMissionNationalOlympicsTopics: [],
      dialogViewPointTransaction: false,
      loadingActiveStudents: [],
      loadingTasksPointsMade: [],
      activeStudentsPercentage: {},
      tasksPointsMade: {},
    };
  },
  components: {
    EmptyState,
  },
  watch: {
    selected(newVal) {
      this.selectedData = newVal;
      this.$emit("changedSelected", newVal);
    },
    selectedData(newVal) {
      this.$emit("changedSelected", newVal);
    },
    sinceDate() {
      this.activeStudentsPercentage = {};
    },
  },

  computed: {
    formattedElements() {
      return this.computeDataTableRows(this.rows);
    },
    headers() {
      return this.getDataTableHeaders(this.context, this.type);
    },
    searchedRows() {
      var results = [];
      let trimSearchTerm = this.trimString(this.searchTerm); // trim it
      for (var i = 0; i < this.rows.length; i++) {
        for (var key in this.rows[i]) {
          if (this.rows[i][key] != null && !Array.isArray(this.rows[i][key])) {
            if (this.rows[i][key].indexOf) {
              if (
                this.rows[i][key]
                  .toLowerCase()
                  .indexOf(trimSearchTerm.toLowerCase()) != -1
              ) {
                if (!this.itemExists(results, this.rows[i])) {
                  results.push(this.rows[i]);
                }
              }
            }
          }
        }
      }
      return results;
    },
    // type() {
    //   return this.$route.params.type;
    // },
  },

  methods: {
    typeTo__typename(s) {
      return utils.typeTo__typename(s);
    },

    getDataTableHeaders(context, type) {
      return utils.getDataTableHeaders(context, type);
    },
    computeDataTableRows(r) {
      return utils.computeDataTableRows(r);
    },
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    trimString(s) {
      return utils.trimString(s);
    },
    itemExists(i, e) {
      return utils.itemExists(i, e);
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    isDate(date) {
      return utils.isDate(date);
    },
    customSort(items, index, isDesc) {
      let collumnName = index[0];
      items.sort((a, b) => {
        if (collumnName) {
          if (this.isDate(a[collumnName])) {
            collumnName += ".ISO";
          }
          if (isDesc[0]) {
            return typeof a[collumnName] == "number"
              ? b[collumnName] - a[collumnName]
              : b[collumnName]?.toString()?.localeCompare(a[collumnName]);
          } else {
            return typeof a[collumnName] == "number"
              ? a[collumnName] - b[collumnName]
              : a[collumnName]?.toString()?.localeCompare(b[collumnName]);
          }
        }
      });
      return items;
    },
    copy(c) {
      utils.copyTextToClipboard(c);
      this.$emit("copiedText");
    },
    getKeyByValue(object, value) {
      return Object.keys(object).find((key) => key.includes(value));
    },
    async getActiveStudents(item) {
      this.loadingActiveStudents.push(item.Id);
      const { data } = await this.$apollo.query({
        query: require(`@/graphql/${this.__typenameToType(
          item.__typename
        )}/getActiveStudentsPercentage.gql`),
        variables: {
          id: item.Id,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: this.sinceDate,
        },
      });
      this.activeStudentsPercentage[item.Id] =
        data[item.__typename][0].activeStudentsPercentage;
      let index = this.loadingActiveStudents.findIndex((a) => {
        return a == item.Id;
      });
      this.loadingActiveStudents.splice(index, 1);
    },
    async getPointsMade(item) {
      this.loadingTasksPointsMade.push(item.Id);
      const { data } = await this.$apollo.query({
        query: require(`@/graphql/atividades/getPointsMade.gql`),
        variables: {
          Id: item.Id,
        },
      });
      this.tasksPointsMade[item.Id] = data.Task[0].pointsMade;
      let index = this.loadingTasksPointsMade.findIndex((a) => {
        return a == item.Id;
      });
      this.loadingTasksPointsMade.splice(index, 1);
    },

    viewElement(item) {
      if (item.__typename == "PointTransaction") {
        this.viewingContextId = item["studentAnswer.context.Id"];
        this.viewingContextTypename = item["studentAnswer.context.__typename"];
        let questionIdKey = this.getKeyByValue(item, "questionId");
        if (questionIdKey) {
          this.viewingQuestionId = item[questionIdKey];
          this.dialogViewPointTransaction = true;
        } else {
          alert("Pontos ganhos através de Baús/Missões");
        }
      } else if (item.__typename == "StudentAnswer") {
        this.viewingQuestionId = item["question.questionId"];
        this.viewingContextId = item["context.Id"];
        this.viewingContextTypename = item["context.__typename"];
        this.dialogViewPointTransaction = true;
      } else if (item.__typename == "_StudentMissions") {
        this.viewingMissionNationalOlympicsTopics = [];
        for (let key in item) {
          if (
            key.includes("nationalOlympicsTopics") &&
            key.includes("topicId")
          ) {
            // example key: Mission.nationalOlympicsTopics.topic5thGrade.name
            // splitKey[splitKey.length - 2] = topic5thGrade
            let splitKey = key.split(".");
            this.viewingMissionNationalOlympicsTopics[
              splitKey[splitKey.length - 2]
            ] = item[key];
          }
        }
        this.dialogViewNationalOlympicsTopics = true;
      } else if (item.__typename == "_AssessmentQuestions") {
        this.viewingQuestionId = item["Id"];
        this.dialogViewPointTransaction = true;
      }
    },
    translate(s) {
      return utils.translate(s);
    },
    navigateNewTabLink(item) {
      return this.isProfile
        ? `/perfil/${utils.__typenameToType(item.__typename)}/${item.Id}`
        : `/perfil/${utils.__typenameToType(this.type)}/${item.Id}`;
    },
    navigate(o) {
      if (!this.drag) {
        if (["AssignedContext"].includes(o.__typename)) {
          o = { Id: o["student.Id"], __typename: "Student" };
        } else if (["_StudentAssessments"].includes(o.__typename)) {
          o = {
            Id: o["Assessment.Id"],
            __typename: "Assessment",
          };
        }
        if (
          ![
            "StudentAnswer",
            "Course",
            "Topic",
            "RankingPosition",
            "_AssessmentQuestions",
            "_StudentPhases",
            "_StudentMissions",
            "_StudentNarrativeChapters",
            "PointTransaction",
            "KeyTransaction",
            "ChestTransaction",
            "Item",
          ].includes(o.__typename)
        ) {
          let query = this.$route.query;
          this.isProfile
            ? this.routerReplace({
                path: `/perfil/${utils.__typenameToType(o.__typename)}/${o.Id}`,
                query: query,
              })
            : this.routerReplace({
                path: `/perfil/${utils.__typenameToType(this.type)}/${o.Id}`,
                query: query,
              });
        }
      }
    },
    navigateNewTab(o) {
      let routeData = this.$router.resolve({
        path: this.isProfile
          ? `/perfil/${utils.__typenameToType(o.__typename)}/${o.Id}`
          : `/perfil/${this.type}/${o.Id}`,
        query: {},
      });
      window.open(routeData.href, "_blank");
    },
  },
  mounted() {
    console.log("a", this.type, this.context);
    document.addEventListener("mousedown", () => (this.drag = false));
    document.addEventListener("mousemove", () => (this.drag = true));
  },
  beforeDestroy() {
    document.removeEventListener("mousedown", () => (this.drag = false));
    document.removeEventListener("mousemove", () => (this.drag = true));
  },
};
</script>
