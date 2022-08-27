<template>
  <div class="d-flex flex-column align-center justify-center">
    <div class="d-flex mt-4 mb-n5 px-4 mx-12" style="width: 90%">
      <v-row no-gutters>
        <v-col cols="6">
          <v-text-field
            v-if="!Object.keys(enumsValues).includes(searchProperty)"
            v-model="searchTerm"
            class="mr-4"
            full-width
            outlined
            prepend-inner-icon="mdi-magnify"
            placeholder="Quero buscar por..."
          />
          <v-select
            v-else
            style="z-index: 11"
            class="mr-4"
            v-model="enumSearchTerm"
            prepend-inner-icon="mdi-magnify"
            placeholder="Quero buscar por..."
            full-width
            outlined
            :items="enumsValues[searchProperty]"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            @input="setSearchProp"
            v-model="searchProperty"
            style="z-index: 11"
            color="primary-1"
            class="mr-4"
            full-width
            outlined
            :items="getSearchableProperties()"
          ></v-select>
        </v-col>
        <v-col cols="2" v-if="possibleOrderByOptions">
          <v-select
            style="z-index: 11"
            color="primary-1"
            v-model="orderBy"
            prepend-inner-icon="mdi-magnify"
            placeholder="Ordernar por"
            full-width
            outlined
            item-text="translatedName"
            item-value="name"
            :items="possibleOrderByOptionsTranslated"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-btn
            @click="search()"
            class="ml-4 white--text"
            depressed
            style="text-transform: none !important"
            color="grey-2"
            height="56"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-1"> mdi-magnify </v-icon>
              <div>Pesquisar</div>
            </div>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div
      width="100vw"
      class="text-center"
      style="
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        z-index: 10;
        background: none no-repeat scroll 0 0 #fff;
        width: 100%;
      "
    >
      <v-divider class="mb-3 align-self-stretch" />
      <data-table-header
        :type="type"
        :selectedElements="selectedElements"
        :numberOfRows="list ? list.length : 0"
        context="list"
        @clearSelected="selectedElements = []"
        @elementAction="emitElementAction"
        @tabAction="emitTabAction"
        @filter="filterTab = !filterTab"
        @clearFilter="filter = {}"
        @changedSinceDate="changedSinceDate"
        @changedUntilDate="changedUntilDate"
      ></data-table-header>
      <v-divider class="mt-3 align-self-stretch" />
    </div>
    <div v-if="list" class="d-flex fit-screen px-4">
      <data-table
        v-if="list.length > 0"
        :type="this.type"
        :selected="selectedElements"
        :rows="list"
        :sinceDate="sinceDate"
        context="list"
        @changedSelected="changedSelected"
        @copiedText="$nuxt.$emit('copiedText')"
      />
      <v-row justify="center" v-else>
        <v-col cols="4">
          <empty-state class="my-3" />
        </v-col>
      </v-row>
    </div>
    <div v-if="loading">
      <loader style="position: fixed; top: 45%; left: 50%"></loader>
    </div>

    <v-slide-x-transition>
      <filter-tab
        v-model="filter"
        v-if="filterTab"
        @input="updatedFilter"
      ></filter-tab>
    </v-slide-x-transition>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import gql from "graphql-tag";
import DataTable from "~/components/DataTable.vue";
import DataTableHeader from "~/components/DataTableHeader.vue";
import EmptyState from "~/components/EmptyState.vue";
import FilterTab from "~/components/FilterTab.vue";
import Loader from "~/components/BookLoader.vue";
import utils from "~/utils/utils.js";

export default {
  // middleware: "authenticated",
  components: {
    DataTable,
    DataTableHeader,
    EmptyState,
    FilterTab,
    Loader,
  },

  data() {
    return {
      type: this.$route.params.type,
      loading: 0,
      searchProperty: "Nome",
      searchTerm: "",
      enumSearchTerm: "",
      searchingEnums: false,
      enumsValues: {},
      datePicker: false,
      page: 0,
      pageSize: 20,
      filterTab: false,
      filter: {},
      orderBy: "createdAt_desc",
      selectedElements: [],
      sinceDate: DateTime.local().plus({ days: -30 }).startOf("day").toISO(),
      now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
      list: [],
    };
  },

  apollo: {
    list: {
      query() {
        return this.listQuery;
      },
      loadingKey() {
        return this.loading;
      },
      watchLoading(isLoading) {
        // TODO: remove this hack after resolving: https://github.com/Akryum/vue-apollo/issues/13
        this.loading = isLoading;
      },
      variables() {
        return {
          first: this.pageSize,
          offset: 0,
          filter: this.filter,
          now: this.now,
          sinceDate: this.sinceDate,
          orderBy: this.orderBy,
          ...this.filter,
        };
      },
      error(error) {
        console.error("We've got an error!", error);
        localStorage.removeItem("apollo-token");
        this.$router.push("/login");
      },

      fetchPolicy: "cache-and-network",
    },
    __type: {
      query() {
        return require(`~/graphql/introspectionQuery.gql`);
      },
      loadingKey() {
        return this.loading;
      },
      variables() {
        return {
          typename: this.type,
        };
      },
      error(error) {
        console.error("We've got an error!", error);
        localStorage.removeItem("apollo-token");
        this.$router.push("/login");
      },
      fetchPolicy: "cache-and-network",
    },
    possibleOrderByOptions: {
      query() {
        return require(`~/graphql/ordering.gql`);
      },
      loadingKey() {
        return this.loading;
      },
      variables() {
        return {
          name: `_${this.type}Ordering`,
        };
      },
      error(error) {
        console.error("We've got an error!", error);
        localStorage.removeItem("apollo-token");
        this.$router.push("/login");
      },
      fetchPolicy: "cache-and-network",
    },
  },

  computed: {
    listQuery() {
      return gql`query list(
                  $first: Int
                  $offset: Int
                  $orderBy: [_${this.type}Ordering]
                  $filter: _${this.type}Filter
                ) {
                  list: ${this.type}(
                    filter: $filter
                    first: $first
                    offset: $offset
                    orderBy: $orderBy
                  ) {
                      Id: id
  name
  email
  role
  createdAt {
    createdAt: formatted
  }
                  }
                }
                `;
    },
    possibleOrderByOptionsTranslated() {
      let self = this;
      let fields = this.possibleOrderByOptions.enumValues
        .map((el) => {
          return { name: el.name, translatedName: self.translate(el.name) };
        })
        .filter((el) => {
          return el.name != el.translatedName;
        });
      return fields.filter((el) => {
        if (this.type === "escolas") {
          return (
            el.name === "clientStatus_asc" ||
            el.name === "clientStatus_desc" ||
            el.name === "numberOfStudents_asc" ||
            el.name === "numberOfStudents_desc" ||
            el.name === "activeStudents_asc" ||
            el.name === "activeStudents_desc"
          );
        }
        if (this.type === "turmas") {
          return (
            el.name === "schoolYear_asc" ||
            el.name === "schoolYear_desc" ||
            el.name === "clientStatus_asc" ||
            el.name === "clientStatus_desc" ||
            el.name === "numberOfStudents_asc" ||
            el.name === "numberOfStudents_desc" ||
            el.name === "activeStudents_asc" ||
            el.name === "activeStudents_desc"
          );
        }
        if (this.type === "alunos") {
          return (
            el.name === "schoolYear_asc" ||
            el.name === "schoolYear_desc" ||
            el.name === "lastActivity_asc" ||
            el.name === "lastActivity_desc" ||
            el.name === "points_asc" ||
            el.name === "points_desc"
          );
        }
        if (this.type === "educadores") {
          return (
            el.name === "lastActivity_asc" ||
            el.name === "lastActivity_desc" ||
            el.name === "schoolClassesCount_asc" ||
            el.name === "schoolClassesCount_desc" ||
            el.name === "schoolsCount_asc" ||
            el.name === "schoolsCount_desc" ||
            el.name === "tasksCount_asc" ||
            el.name === "tasksCount_desc" ||
            el.name === "assessmentsCount_asc" ||
            el.name === "assessmentsCount_desc"
          );
        }
        if (this.type === "responsaveis") {
          return (
            el.name === "lastActivity_asc" || el.name === "lastActivity_desc"
          );
        }
        if (this.type === "atividades") {
          return (
            el.name === "createdAt_asc" ||
            el.name === "createdAt_desc" ||
            el.name === "startDate_asc" ||
            el.name === "startDate_desc" ||
            el.name === "endDate_asc" ||
            el.name === "endDate_desc" ||
            el.name === "status_asc" ||
            el.name === "status_desc"
          );
        }
        if (this.type == "avaliações") {
          return (
            el.name === "createdAt_asc" ||
            el.name === "createdAt_desc" ||
            el.name === "startsAt_asc" ||
            el.name === "startsAt_desc" ||
            el.name === "endsAt_asc" ||
            el.name === "endsAt_desc" ||
            el.name === "status_asc" ||
            el.name === "status_desc"
          );
        }
      });
    },
  },

  mounted() {
    window.addEventListener("scroll", this.infiniteScroll);
    window.addEventListener("keyup", this.handleEnterKeyPressed);
    if (this.$route.query.search) {
      this.search();
    }
  },

  created() {
    if (this.$store.getters["SearchProperties/lastSearchTerms"]) {
      this.searchTerm =
        this.$store.getters["SearchProperties/lastSearchTerms"][this.type];
    }
    this.getTaskRealTime();
  },

  beforeDestroy() {
    window.removeEventListener("keyup", this.handleEnterKeyPressed);
  },

  destroyed() {
    window.removeEventListener("scroll", this.infiniteScroll);
  },
  methods: {
    handleEnterKeyPressed(e) {
      if (e.key === "Enter") {
        this.search();
      }
    },
    setSearchProp(prop) {
      this.searchingEnums = Object.keys(this.enumsValues).includes(prop);
    },

    async search() {
      if (this.searchProperty == "Turmas") {
        this.searchInSchoolClassList();
      } else {
        let lastSearchTerm = JSON.parse(
          JSON.stringify(
            this.$store.getters["SearchProperties/lastSearchTerms"]
          )
        );
        lastSearchTerm[this.type] = this.searchTerm;
        this.$store.commit(
          "SearchProperties/setLastSearchTerms",
          lastSearchTerm
        );
        this.$store.commit(
          "SearchProperties/setLastSearchProperty",
          this.searchProperty
        );
        let filteroption = this.detranslate(this.searchProperty).toString();
        this.filter = {};

        if (this.searchTerm != "" && !this.searchingEnums) {
          let searchTerm = this.searchTerm;
          if (filteroption == "name") {
            filteroption = "normalizedName";
            searchTerm = utils.normalizeString(searchTerm);
          }
          filteroption += "_regexp";
          let trimSearchTerm = searchTerm.trim(); // trim it
          this.filter[filteroption] = `.*(?i)${trimSearchTerm}.*`;
        } else if (this.enumSearchTerm != "" && this.searchingEnums) {
          this.filter[filteroption] = this.detranslate(this.enumSearchTerm);
        }
      }
    },
    async emitElementAction(action) {
      $nuxt.$emit("elementAction", {
        action: action,
        context: "list",
        elements: this.selectedElements,
        __typename: this.type,
      });
    },
    async emitTabAction(action) {
      $nuxt.$emit("tabAction", {
        action: action,
        context: "list",
        __typename: this.type,
      });
    },
    changedSinceDate(newSinceDate) {
      this.sinceDate = newSinceDate;
    },
    changedUntilDate(newUntilDate) {
      this.now = newUntilDate;
    },

    getSearchableProperties() {
      if (this.__type) {
        let searchable = [];
        for (let field of this.__type.fields) {
          if (field.type.ofType) {
            if (["ID", "String"].includes(field.type.ofType.name)) {
              searchable.push(field.name);
            }
            if (field.type.ofType.kind == "ENUM") {
              searchable.push(field.name);
              this.enumsValues[this.translate(field.name)] =
                field.type.ofType.enumValues.map((el) => {
                  return this.translate(el.name);
                });
            }
          } else {
            if (["ID", "String"].includes(field.type.name)) {
              searchable.push(field.name);
            }
            if (field.type.kind == "ENUM") {
              searchable.push(field.name);
              this.enumsValues[this.translate(field.name)] =
                field.type.enumValues.map((el) => {
                  return this.translate(el.name);
                });
            }
          }
        }
        if (this.type == "atividades") {
          searchable.unshift("Turmas");
        }
        return searchable
          .filter(
            (e) =>
              ![
                "__typename",
                "_id",
                "password",
                "avatarUrl",
                "recoverPasswordCode",
                "nickname",
                "clientStatus",
                "parentFullName",
                "subscribedNotifications",
                "lastName",
                "lessonPlanClassification",
                "normalizedName",
                "powerUpsInContext",
              ].includes(e)
          )
          .map((p) => {
            return this.translate(p);
          })
          .sort();
      }
    },
    clearSelectedElements() {
      this.selectedElements = [];
    },
    changedSelected(selected) {
      this.selectedElements = selected;
    },
    infiniteScroll() {
      if (
        window.innerHeight + window.scrollY + 1 >
        document.body.offsetHeight
      ) {
        this.fetchMore();
      }
    },
    translate(s) {
      return utils.translate(s);
    },
    trimString(s) {
      return utils.trimString(s);
    },
    detranslate(s) {
      return utils.detranslate(s);
    },
    updatedFilter(filterObj) {
      this.filter = filterObj.filter;
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    searchInSchoolClassList() {
      let lastSearchTerm = JSON.parse(
        JSON.stringify(this.$store.getters["SearchProperties/lastSearchTerms"])
      );
      lastSearchTerm["turmas"] = this.searchTerm;
      this.$store.commit("SearchProperties/setLastSearchTerms", lastSearchTerm);
      this.routerReplace({
        path: "/lista/turmas",
        query: { search: true, tab: "Atividades" },
      });
    },
    fetchMore() {
      this.page++;
      const offset = this.page * this.pageSize;
      this.$apollo.queries.list.fetchMore({
        variables: {
          first: this.pageSize,
          offset,
          filter: this.filter,
        },
        loadingKey: this.loading,
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return fetchMoreResult.list.length
            ? {
                list: [...previousResult.list, ...fetchMoreResult.list],
              }
            : previousResult;
        },
      });
    },
    getTaskRealTime() {
      const task = this.$apollo.subscribe({
        query: require(`~/graphql/atividades/getTaskRealTime.gql`),
        variables: {},
      });
      task.subscribe({
        next: (data) => {
          if (this.type === "atividades") {
            this.newTaskCreated(data.data.taskCreated.id);
          }
        },
      });
    },
    async newTaskCreated(taskId) {
      let response = await this.$apollo.query({
        query: require(`~/graphql/atividades/newTaskCreated.gql`),
        variables: {
          id: taskId,
        },
      });
      this.list.unshift(response.data.Task[0]);
    },
  },
};
</script>

<style>
.v-list .v-list-item--active {
  background-color: #282828 !important;
}

.v-list .v-list-item--active .v-list-item__title {
  color: #ffffff !important;
}
</style>
