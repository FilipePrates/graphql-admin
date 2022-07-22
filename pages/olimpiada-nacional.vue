<template>
  <div v-if="loadAll" class="d-flex flex-column align-center justify-center">
    <div class="my-4 profile-card align-self-stretch d-flex one-edge-shadow">
      <v-row v-if="profile" no-gutters>
        <v-col cols="5" v-if="profile.length > 0">
          <v-row no-gutters class="mt-3 text-center" justify="center">
            <v-col cols="10">
              <v-row no-gutters>
                <v-col cols="3">
                  <v-progress-circular value="100" size="100" color="blue-5">
                    <v-avatar size="90">
                      <img
                        v-if="profile[0].avatarUrl"
                        class="my-auto mx-4"
                        :src="profile[0].avatarUrl"
                        alt=""
                      />
                      <img v-else class="my-auto mx-4" src="/logo.png" alt="" />
                    </v-avatar>
                  </v-progress-circular>
                </v-col>
                <v-col cols="9">
                  <v-row no-gutters>
                    <v-col cols="10" class="text-left ml-5 mb-3">
                      <span class="profile-title">{{ profile[0].name }} </span>
                    </v-col>
                    <v-col cols="12" v-if="profile">
                      <div class="d-flex flex-row pt-1 ml-6">
                        <span class="profile-prop-name">Escolas Inscritas</span>
                        <v-spacer />
                        <v-chip small class="profile-prop">
                          {{ profile[0].numberOfSchools }}
                        </v-chip>
                      </div>
                      <div class="d-flex flex-row pt-1 ml-6">
                        <span class="profile-prop-name">Turmas Inscritas</span>
                        <v-spacer />
                        <v-chip small class="profile-prop">
                          {{ profile[0].numberOfSchoolClasses }}
                        </v-chip>
                      </div>

                      <div class="d-flex flex-row pt-1 ml-6">
                        <span class="profile-prop-name">Alunos Inscritos</span>
                        <v-spacer />
                        <v-chip small class="profile-prop">
                          {{ profile[0].numberOfStudents }}
                        </v-chip>
                      </div>

                      <div class="d-flex flex-row pt-1 ml-6">
                        <span class="profile-prop-name"
                          >Total de Questões Feitas</span
                        >
                        <v-spacer />
                        <v-chip small class="profile-prop">
                          {{ profile[0].questionsAnsweredCount }}
                        </v-chip>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <v-divider v-if="profile" vertical class="pb-12 mb-12" />

        <v-col v-if="profile.length > 0" cols="4" class="px-3 py-1">
          <div
            v-for="key in [
              'Id',
              'name',
              'type',
              'isArchived',
              'description',
              'pointsMade',
            ]"
            :key="`element-${key}`"
            class="d-flex flex-row pt-1"
          >
            <span class="profile-prop-name">{{ translate(key) }}</span>
            <v-spacer />
            <v-chip
              @click="showFullInfo(trueValue(profile[0][key], key))"
              small
              class="profile-prop"
            >
              {{
                truncateString(translate(trueValue(profile[0][key], key)), 30)
              }}
            </v-chip>
          </div>
        </v-col>
        <v-divider v-if="profile" vertical />
        <v-col v-if="profile.length > 0" cols="3" class="px-3 py-1">
          <v-row no-gutters>
            <v-col cols="8" class="mb-1"></v-col>
            <v-col cols="10">
              <div
                v-for="key in Object.keys(profile[0]).filter(
                  (key) =>
                    key !== '__typename' &&
                    !Array.isArray(profile[0][key]) &&
                    isDate(profile[0][key], key)
                )"
                :key="`element-${key}`"
                class="d-flex flex-row pt-1"
              >
                <span class="profile-prop-name">{{ translate(key) }}</span>
                <v-spacer />
                <v-chip small class="profile-prop">
                  {{
                    new Date(
                      trueValue(profile[0][key], key)
                    ).toLocaleDateString() == "Invalid Date"
                      ? "Sem Data"
                      : new Date(
                          trueValue(profile[0][key], key)
                        ).toLocaleString({
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour12: false,
                        })
                  }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <div
      v-if="profile"
      style="
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        z-index: 10;
        background: none no-repeat scroll 0 0 #fff;
        width: 90%;
      "
    >
      <v-tabs v-model="tab" background-color="transparent" color="blue-5" grow>
        <v-tab v-for="key in tabs" :key="`tab-${key}`">
          {{ translate(key) }}
        </v-tab>
      </v-tabs>
      <v-divider v-if="profile" class="align-self-stretch ma-0" />
    </div>

    <v-tabs-items v-if="profile" v-model="tab">
      <v-tab-item v-for="key in tabs" :key="key">
        <v-row justify="center">
          <v-col cols="12">
            <v-col cols="12" v-if="key == 'Ranking Alunos'" class="mb-0 pb-0">
              <v-row v-if="skipRequests['schoolClasses'] == false">
                <v-col v-if="schoolClasses" cols="4">
                  <v-autocomplete
                    v-model="selectedSchoolClassId"
                    :items="schoolClasses"
                    label="Por Turma"
                    item-text="name"
                    item-value="Id"
                    outlined
                    style="z-index: 11"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col v-if="schools" cols="4">
                  <v-autocomplete
                    v-model="selectedSchoolId"
                    :items="schools"
                    label="Por Escola"
                    item-text="name"
                    item-value="Id"
                    outlined
                    style="z-index: 11"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <chip-button
                    text="Limpar"
                    icon="times"
                    class="mt-2"
                    @click="
                      () => {
                        selectedSchoolClassId = '';
                        selectedSchoolId = '';
                      }
                    "
                  ></chip-button>
                </v-col>
              </v-row>
              <v-row v-else class="text-center mb-1">
                <chip-button
                  text="Filtrar Por Turma e Escola"
                  icon="filter"
                  class="mt-2"
                  @click="
                    () => {
                      skipRequests['schoolClasses'] = false;
                      skipRequests['schools'] = false;
                    }
                  "
                >
                </chip-button>
              </v-row>
            </v-col>
            <v-col class="my-2 py-0" cols="12">
              <v-text-field
                @input="setSearchTerm"
                label="Pesquisar por Nome"
                outlined
              ></v-text-field>
            </v-col>
            <v-col v-if="key != 'Ranking Escolas'" cols="4" class="py-0">
              <v-autocomplete
                v-model="schoolYear"
                :items="[5, 6, 7, 8, 9]"
                label="Ano"
                outlined
                style="z-index: 11"
              >
              </v-autocomplete>
            </v-col>

            <div v-if="key == 'Ranking Alunos' && studentRanking">
              <data-table
                v-if="studentRanking.length > 0"
                :headers="getDataTableHeaders('nationalOlympics', key)"
                :rows="computeDataTableRows(studentRanking[0].studentRanking)"
                :selected="selectedElements[tab]"
                @changedSelected="changedSelected"
                @copiedText="$nuxt.$emit('copiedText')"
                isProfile
              >
              </data-table>
            </div>
            <div v-else-if="key == 'Ranking Turmas' && schoolClassRanking">
              <data-table
                v-if="schoolClassRanking.length > 0"
                :headers="getDataTableHeaders('nationalOlympics', key)"
                :rows="
                  computeDataTableRows(schoolClassRanking[0].schoolClassRanking)
                "
                :selected="selectedElements[tab]"
                @changedSelected="changedSelected"
                @copiedText="$nuxt.$emit('copiedText')"
                isProfile
              >
              </data-table>
            </div>
            <div v-else-if="key == 'Ranking Escolas' && schoolRanking">
              <data-table
                v-if="schoolRanking.length > 0"
                :headers="getDataTableHeaders('nationalOlympics', key)"
                :rows="computeDataTableRows(schoolRanking[0].schoolRanking)"
                :selected="selectedElements[tab]"
                @changedSelected="changedSelected"
                @copiedText="$nuxt.$emit('copiedText')"
                isProfile
              >
              </data-table>
            </div>
            <loader
              v-else-if="loadingRequests != 0"
              style="position: fixed; top: 80%; left: 50%"
            ></loader>
            <empty-state v-else type="emptyContent" class="my-2" />
            <loader
              v-if="loadingRequests > 0"
              style="position: fixed; top: 80%; left: 50%"
            ></loader>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="dialogShowInfo" max-width="50vw">
      <v-card>
        <span class="ma-2">{{ infoToShow }}</span>
      </v-card>
    </v-dialog>
    <v-slide-x-transition>
      <filter-tab
        v-model="filter"
        v-if="filterTab && profile"
        :children="getListProperties(profile)[tab]"
        style="z-index: 999"
        @input="updatedFilter"
      />
    </v-slide-x-transition>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import ChipButton from "~/components/ChipButton";
import DataTable from "~/components/DataTable.vue";
import EmptyState from "~/components/EmptyState.vue";
import FilterTab from "~/components/FilterTab.vue";
import Loader from "~/components/JGLoader.vue";
import utils from "~/utils/utils.js";

export default {
  middleware: "authenticated",
  components: {
    DataTable,
    ChipButton,
    EmptyState,
    FilterTab,
    Loader,
  },
  data() {
    return {
      id: "",
      type: "atividades",
      filterTab: false,
      page: {},
      pageSize: 20,
      tab: undefined,
      datePicker: false,
      loading: false,
      loadAll: false,
      loadingRequests: 0,
      showProfileActions: false,
      selectedElements: {
        0: [],
      },
      schoolYear: 6,
      selectedSchoolClassId: "",
      selectedSchoolId: "",
      searchType: "",
      infoToShow: "",
      interval: undefined,
      searchTerm: undefined,
      dialogShowInfo: false,
      filter: undefined,
      tabs: ["Ranking Alunos", "Ranking Turmas", "Ranking Escolas"],
      tabRequests: [
        "studentRanking",
        "schoolClassRanking",
        "schoolRanking",
        "schoolClasses",
        "schools",
        "profile",
      ],
      skipRequests: {
        studentRanking: true,
        schoolClassRanking: true,
        schoolRanking: true,
        schoolClasses: true,
        schools: true,
        profile: true,
      },
    };
  },
  computed: {
    searchTermFilter() {
      return this.searchTerm != ""
        ? { name_regexp: `.*(?i)${this.searchTerm.trim()}.*` }
        : {};
    },
  },
  watch: {
    tab(val) {
      if (this.profile) {
        if (!Object.keys(this.selectedElements).find((k) => k == val)) {
          this.selectedElements[val] = [];
        }
        this.$router.replace({
          query: {
            tab: this.getListProperties(this.profile)[val],
          },
        });
      }
      this.searchTerm = "";
      this.filter = {};
      window.scrollTo(0, 0);
      if (val < 3) {
        this.skipRequests[Object.keys(this.skipRequests)[val]] = false;
      }
    },
    $route(to) {
      if (to.query.tab) {
        this.tab = this.getListProperties(this.profile).findIndex((el) => {
          return el == to.query.tab;
        });
      }
    },
    profile(loaded) {
      if (loaded) {
        if (this.$route.query.tab) {
          this.tab = this.getListProperties(this.profile).findIndex((el) => {
            return el == this.$route.query.tab;
          });
        }
      }
    },
    searchType(val) {
      this.skipRequests[val] = false;
    },
  },
  async mounted() {
    window.addEventListener("scroll", this.infiniteScroll);
    await this.getNationalOlympicId();
  },
  destroyed() {
    window.removeEventListener("scroll", this.infiniteScroll);
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
    async getNationalOlympicId() {
      let { data } = await this.$apollo.query({
        query: require(`~/graphql/olimpiada-nacional/getNationalOlympicId.gql`),
        variables: {},
      });
      this.id = data.NationalOlympic[0].Id;
      this.skipRequests["profile"] = false;
      this.loadingRequests = 0;
      this.loadAll = true;
    },
    search() {
      this.filter = JSON.parse(JSON.stringify(this.searchTermFilter));
    },
    clearSelectedElements() {
      this.loading = true;
      if (this.selectedElements[this.tab].length == 0) {
        this.selectedElements[this.tab] = JSON.parse(
          JSON.stringify(
            this.profile[0][this.getListProperties(this.profile)[this.tab]]
          )
        );
      } else {
        this.selectedElements[this.tab] = [];
      }
      this.loading = false;
    },
    changedSelected(selected) {
      this.loading = true;
      this.selectedElements[this.tab] = selected;
      this.loading = false;
    },
    emitProfileAction(parent, action) {
      const __typename = this.typeTo__typename(this.type);
      $nuxt.$emit("profileAction", {
        parent: parent,
        action: action,
        context: "profile",
        element: this.profile[0],
        __typename: __typename,
      });
      this.showProfileActions = false;
    },
    async emitElementAction(action) {
      let type = this.getListProperties(this.profile)[this.tab];
      // @TODO fix não poder usar ç e õ no .gql
      if (type == "Avaliacoes") {
        type = "avaliações";
      } else if (type == "Topicos") {
        type = "topicos";
      }
      let typename = this.typeTo__typename(type.toLowerCase());
      $nuxt.$emit("elementAction", {
        parent: this.profile[0],
        parentId: this.$route.params.id,
        action: action,
        context: "profile",
        elements: this.selectedElements[this.tab],
        __typename: typename,
      });
    },
    async emitTabAction(action) {
      let type = this.getListProperties(this.profile)[this.tab];
      // @TODO fix não poder usar ç e õ no .gql
      if (type == "Avaliacoes") {
        type = "avaliações";
      }
      let typename = this.typeTo__typename(type.toLowerCase());
      $nuxt.$emit("tabAction", {
        parent: this.profile[0],
        parentId: this.$route.params.id,
        action: action,
        context: "profile",
        type: type.toLowerCase(),
        __typename: typename,
      });
    },
    trueValue(v, key) {
      return typeof v === "object" && !!v ? v[key] : v;
    },

    isDate(s, key) {
      if (typeof s === "object") {
        if (s != null) {
          if (s.__typename == "_Neo4jDateTime") {
            return true;
          }
        }
      }
      return this.trueValue(s, key)?.length >= 10
        ? new Date(this.trueValue(s, key).substring(0, 10)).toString() !==
            "Invalid Date"
        : false;
    },

    translate(s) {
      return utils.translate(s);
    },
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    typeTo__typename(s) {
      return utils.typeTo__typename(s);
    },

    profileActions(context) {
      return utils.profileActions(context);
    },
    tabActions(profile, context) {
      return utils.tabActions(
        context,
        this.getListProperties(profile)[this.tab]
      );
    },
    elementActions(profile, context) {
      return utils.elementActions(
        context,
        this.getListProperties(profile)[this.tab]
      );
    },
    infiniteScroll() {
      if (this.loadingRequests == 0) {
        if (
          window.innerHeight + window.scrollY === document.body.offsetHeight &&
          this[this.tabRequests[this.tab]][0][this.tabRequests[this.tab]]
            .length >= this.pageSize
        ) {
          this.fetchMore();
        }
      }
    },
    getListProperties(profile) {
      return Object.keys(profile[0]).filter((key) =>
        Array.isArray(profile[0][key])
      );
    },
    getProfileChips(t) {
      return utils.getProfileChips(t);
    },
    getProfileRects(t) {
      return utils.getProfileRects(t);
    },
    updatedFilter(filterObj) {
      console.log(filterObj);
    },
    flatten(obj) {
      return utils.flatten(obj);
    },
    truncateString(str, num) {
      return utils.truncateString(str, num);
    },
    getDataTableHeaders(context, type) {
      return utils.getDataTableHeaders(context, type);
    },
    computeDataTableRows(r) {
      return utils.computeDataTableRows(r);
    },
    arrayEquals(a, b) {
      if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
        let aux = true;
        for (let item in a) {
          if (a[item].Id != b[item].Id) {
            aux = false;
          }
        }
        return aux;
      }
      return false;
    },
    showFullInfo(prop) {
      this.infoToShow = prop;
      this.dialogShowInfo = true;
    },
    fetchMore() {
      this.loading = true;
      let requestName = this.tabRequests[this.tab];
      if (!this.page[requestName]) {
        this.page[requestName] = 1;
      } else {
        this.page[requestName]++;
      }
      const offset = this.page[requestName] * this.pageSize;
      this.$apollo.queries[requestName].fetchMore({
        variables: {
          first: this.pageSize,
          offset,
        },
        loadingKey: this.loading,
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (previousResult == undefined) {
            this.loading = false;
            return fetchMoreResult;
          }
          if (previousResult && fetchMoreResult) {
            let result = previousResult;
            result[requestName][0][requestName] = result[requestName][0][
              requestName
            ].concat(fetchMoreResult[requestName][0][requestName]);
            this.loading = false;
            return result;
          } else {
            this.loading = false;
            return;
          }
        },
      });
    },
  },
  apollo: {
    profile: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getHeader.gql`);
      },
      variables() {
        return {
          id: this.id,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
        };
      },
      skip() {
        return this.skipRequests["profile"];
      },
    },
    studentRanking: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getStudentsRanking.gql`);
      },
      variables() {
        return {
          id: this.id,
          first: this.pageSize,
          offset: 0,
          name: this.searchTerm,
          schoolYear: this.schoolYear,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
          schoolClassId: this.selectedSchoolClassId,
          schoolId: this.selectedSchoolId,
        };
      },
      loadingKey: "loadingRequests",
      skip() {
        return this.skipRequests["studentRanking"];
      },
    },

    schoolRanking: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getSchoolsRanking.gql`);
      },
      variables() {
        return {
          id: this.id,
          first: this.pageSize,
          offset: 0,
          schoolYear: this.schoolYear,
          name: this.searchTerm,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
        };
      },
      loadingKey: "loadingRequests",
      skip() {
        return this.skipRequests["schoolRanking"];
      },
    },

    schoolClassRanking: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getSchoolClassesRanking.gql`);
      },
      variables() {
        return {
          id: this.id,
          first: this.pageSize,
          offset: 0,
          schoolYear: this.schoolYear,
          name: this.searchTerm,
          now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
          sinceDate: DateTime.local()
            .plus({ days: -30 })
            .startOf("day")
            .toISO(),
        };
      },
      loadingKey: "loadingRequests",
      skip() {
        return this.skipRequests["schoolClassRanking"];
      },
    },

    schoolClasses: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getSchoolClasses.gql`);
      },
      variables() {
        return {
          id: this.id,
        };
      },
      loadingKey: "loadingRequests",
      skip() {
        return this.skipRequests["schoolClasses"];
      },
    },

    schools: {
      query() {
        return require(`~/graphql/olimpiada-nacional/getSchools.gql`);
      },
      variables() {
        return {
          id: this.id,
        };
      },
      loadingKey: "loadingRequests",
      skip() {
        return this.skipRequests["schools"];
      },
    },
  },
};
</script>
<style>
.profile-card {
  background-color: #f2f2f2;
  box-shadow: 0px 4px 8px rgba(43, 37, 63, 0.1);
}

.profile-title {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #082d66;
}

.profile-prop-name {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 0.8em;
  line-height: 150%;
  text-align: center;
  color: #293231;
}

.profile-prop {
  font-family: Rubik;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 150%;
  text-align: center;
  color: #293231;
}

.red-action {
  font-family: "Rubik";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  color: #b71c1c;
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 24px 0px;
}

.black-action {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  color: #293231;
  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 24px 0px;
}

.rect-text {
  font-family: Rubik;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #5c9ce5;
}
.profile-type {
  font-family: Rubik;
  font-style: normal;
  font-weight: normal;
  font-size: 1.1em;
  line-height: 150%;
}

.shadow {
  -webkit-box-shadow: 3px 3px 5px 6px rgb(204, 187, 187); /* Safari 3-4, iOS 4.0.2 - 4.2, Android 2.3+ */
  -moz-box-shadow: 3px 3px 5px 6px #ccc; /* Firefox 3.5 - 3.6 */
  box-shadow: 3px 3px 5px 6px #ccc; /* Opera 10.5, IE 9, Firefox 4+, Chrome 6+, iOS 5 */
}

.one-edge-shadow {
  box-shadow: 0 15px 10px -6px #ccc;
}
</style>
