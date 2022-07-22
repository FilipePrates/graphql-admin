<template>
  <div class="d-flex flex-column align-center justify-center">
    <div class="my-4 profile-card align-self-stretch d-flex one-edge-shadow">
      <v-row v-if="profile" no-gutters>
        <v-col cols="5">
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
                    <v-col cols="1">
                      <v-btn @click="openProfileActions" text
                        ><v-icon>mdi-dots-vertical </v-icon></v-btn
                      >
                      <v-dialog
                        v-model="showProfileActions"
                        width="15em"
                        class="pa-0 ma-0"
                      >
                        <profile-actions
                          @profileAction="emitProfileAction"
                          :actions="profileActions(type)"
                          :type="type"
                          style="overflow: hidden"
                        ></profile-actions>
                      </v-dialog>
                    </v-col>

                    <v-col cols="12" v-if="profile[0].cursos">
                      <available-courses-tags
                        :courses="profile[0].cursos"
                      ></available-courses-tags>
                    </v-col>
                    <v-col cols="12" class="mt-2">
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-chip small color="white"
                            ><span class="profile-type">{{
                              this.profile[0].__typename == "Professor" &&
                              this.profile[0].role == "MANAGER"
                                ? "Gestor"
                                : this.translate(profile[0].__typename)
                            }}</span>
                          </v-chip>
                        </v-col>
                        <v-col
                          cols="3"
                          v-for="chip in getProfileChips(
                            profile[0].__typename
                          ).filter((c) => {
                            return c.expected
                              ? profile[0][c.prop] == c.expected
                              : Array.isArray(profile[0][c.prop])
                              ? profile[0][c.prop].length > 0
                              : true;
                          })"
                          :key="chip.prop"
                        >
                          <v-chip small :color="chip.color"
                            ><span class="profile-type">{{
                              Array.isArray(profile[0][chip.prop]) &&
                              profile[0][chip.prop].length > 0
                                ? profile[0][chip.prop][0].name
                                : translate(profile[0][chip.prop])
                            }}</span>
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" class="mt-2">
                  <v-row no-gutters class="text-left">
                    <v-col cols="12" class="py-2">
                      <v-btn
                        v-for="(rect, i) in getProfileRects(
                          profile[0].__typename
                        )"
                        :key="i"
                        height="38px"
                        style="text-transform: none !important"
                        :outlined="!(i % 2)"
                        :color="rect.color"
                        class="mx-2"
                        @click="rect.isBtn ? rectAction(rect.prop) : undefined"
                      >
                        <v-progress-circular
                          v-if="rect.isBtn && loadingRectAction"
                          color="white"
                          size="25"
                          indeterminate
                        ></v-progress-circular>
                        <span
                          v-else-if="
                            rect.isBtn &&
                            !loadingRectAction &&
                            profile[0][rect.prop] === undefined
                          "
                          class="rect-text"
                          :class="i % 2 ? 'white--text' : ''"
                          >{{ rect.extra }}</span
                        >
                        <span
                          v-else
                          class="rect-text"
                          :class="i % 2 ? 'white--text' : ''"
                          >{{ profile[0][rect.prop] + " " + rect.extra }}</span
                        >
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <v-divider v-if="profile" vertical class="pb-12 mb-12" />

        <v-col cols="4" class="px-3 py-1">
          <div
            v-for="headerProp in this.getHeaderProperties(
              profile[0].__typename
            )"
            :key="`element-${headerProp}`"
            class="d-flex flex-row pt-1"
          >
            <span class="profile-prop-name">{{ translate(headerProp) }}</span>
            <v-spacer />
            <v-chip
              @click="
                showFullInfo(
                  translate(
                    trueValue(flatten(profile[0])[headerProp], headerProp)
                  )
                )
              "
              small
              class="profile-prop"
            >
              <a
                v-if="headerProp === 'creator.email'"
                :href="navigateNewTabLink(profile[0])"
              >
                <v-btn
                  small
                  text
                  style="height: 100%"
                  depressed
                  @click.stop.prevent="navigateNewTab(profile[0])"
                >
                  <unicon name="arrow-up-right" fill="#2E84E5"></unicon>
                </v-btn>
              </a>
              {{
                headerProp === "points"
                  ? Math.floor(
                      truncateString(
                        translate(
                          trueValue(flatten(profile[0])[headerProp], headerProp)
                        ),
                        20
                      )
                    )
                  : truncateString(
                      translate(
                        trueValue(flatten(profile[0])[headerProp], headerProp)
                      ),
                      20
                    )
              }}
            </v-chip>
          </div>
        </v-col>
        <v-divider v-if="profile" vertical />
        <v-col cols="3" class="px-3 py-1">
          <v-row no-gutters>
            <v-col cols="8" class="mb-1"></v-col>
            <!-- <v-col cols="4">
              <v-row no-gutters>
                <v-col cols="5">
                  <v-btn @click="showProfileActions = true" text
                    ><v-icon>mdi-dots-vertical </v-icon></v-btn
                  >
                  <v-dialog
                    v-model="showProfileActions"
                    width="15em"
                    class="pa-0 ma-0"
                  >
                    <profile-actions
                      @profileAction="emitProfileAction"
                      :actions="profileActions(type)"
                      :type="type"
                      style="overflow: hidden"
                    ></profile-actions>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-col> -->
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
      style="
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        z-index: 10;
        background: none no-repeat scroll 0 0 #fff;
        width: 90%;
      "
    >
      <v-tabs
        v-if="profile"
        v-model="tab"
        background-color="transparent"
        color="blue-5"
        grow
      >
        <v-tab v-for="key in getProfileTabs(profile)" :key="`tab-${key}`">
          {{ translate(key) }}
        </v-tab>
      </v-tabs>
      <v-divider v-if="profile" class="align-self-stretch mb-3" />

      <div
        v-if="profile && getProfileTabs(profile).length > 0"
        class="d-flex px-4"
      >
        <data-table-header
          v-if="profile[0][getProfileTabs(profile)[tab]]"
          context="profile"
          :type="type"
          :exportData="profile[0]"
          :elementActions="elementActions(profile, type)"
          :tabActions="tabActions(profile, type)"
          :tab="getProfileTabs(profile)[tab]"
          :selectedElements="selectedElements[tab]"
          :numberOfRows="profile[0][getProfileTabs(profile)[tab]].length"
          @clearSelected="clearSelectedElements"
          @elementAction="emitElementAction"
          @tabAction="emitTabAction"
          @filter="filterTab = !filterTab"
          @clearFilter="filter = {}"
          @changedSinceDate="changedSinceDate"
          @changedUntilDate="changedUntilDate"
        ></data-table-header>

        <v-spacer />
      </div>
      <v-divider v-if="profile" class="my-3 align-self-stretch" />
    </div>
    <v-tabs-items v-if="profile" v-model="tab">
      <v-tab-item v-for="key in getProfileTabs(profile)" :key="key">
        <v-row>
          <v-col>
            <data-table
              v-if="profile[0][key].length > 0"
              :headers="getDataTableHeaders('profile', key)"
              :rows="computeDataTableRows(profile[0][key])"
              :selected="selectedElements[tab]"
              :sinceDate="sinceDate"
              :untilDate="now"
              @changedSelected="changedSelected"
              @copiedText="$nuxt.$emit('copiedText')"
              isProfile
            >
            </data-table>
            <empty-state
              v-else-if="!loading"
              type="emptyContent"
              class="my-4"
            />
            <loader
              v-if="loading"
              style="position: fixed; top: 80%; left: 50%"
            ></loader>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
    <loader v-else style="position: fixed; top: 30%; left: 50%"></loader>
    <v-dialog v-model="dialogShowInfo" max-width="50vw">
      <v-card max-width="60vw" class="text-center pa-2">
        <span class="ma-2">{{ infoToShow }}</span>
        <!-- @TODO: copiar por algum motivo não funciona aqui, acho que é porque o dialog que está focus()
        <v-btn
          height="30px"
          width="30px"
          fab
          text
          depressed
          @click="copy(infoToShow)"
        >
          <unicon name="copy-alt" fill="#2E84E5"></unicon>
        </v-btn> -->
      </v-card>
    </v-dialog>
    <v-slide-x-transition>
      <filter-tab
        v-model="filter"
        v-if="filterTab && profile"
        :children="getProfileTabs(profile)[tab]"
        style="z-index: 999"
        @input="updatedFilter"
      />
    </v-slide-x-transition>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import AvailableCoursesTags from "~/components/AvailableCoursesTags.vue";
import DataTableHeader from "~/components/DataTableHeader.vue";
import DataTable from "~/components/DataTable.vue";
import EmptyState from "~/components/EmptyState.vue";
import FilterTab from "~/components/FilterTab.vue";
import Loader from "~/components/JGLoader.vue";
import ProfileActions from "~/components/ProfileActions.vue";
import utils from "~/utils/utils.js";

export default {
  // middleware: "authenticated",
  components: {
    DataTable,
    DataTableHeader,
    ProfileActions,
    EmptyState,
    FilterTab,
    AvailableCoursesTags,
    Loader,
  },
  data() {
    return {
      filterTab: false,
      filter: {},
      page: {},
      pageSize: 20,
      type: this.$route.params.type,
      id: this.$route.params.id,
      tab: 0,
      datePicker: false,
      loading: false,
      loadingRectAction: false,
      showProfileActions: false,
      selectedElements: {
        0: [],
      },
      infoToShow: "",
      dialogShowInfo: false,
      sinceDate: DateTime.local().plus({ days: -30 }).startOf("day").toISO(),
      now: DateTime.local().plus({ days: 1 }).startOf("day").toISO(),
    };
  },

  watch: {
    tab(val) {
      if (this.profile) {
        if (!Object.keys(this.selectedElements).find((k) => k == val)) {
          this.selectedElements[val] = [];
        }
        this.routerReplace({
          path: this.$route.fullPath,
          query: {
            tab: this.getProfileTabs(this.profile)[val],
          },
        });
      }
      window.scrollTo(0, 0);
    },
    $route(to) {
      if (to.query.tab) {
        this.tab = this.getProfileTabs(this.profile).findIndex((el) => {
          return el == to.query.tab;
        });
      }
    },
    profile(loaded) {
      if (loaded) {
        if (this.$route.query.tab) {
          this.tab = this.getProfileTabs(this.profile).findIndex((el) => {
            return el == this.$route.query.tab;
          });
        }
      }
    },
  },

  apollo: {
    profile: {
      query() {
        return require(`~/graphql/${this.type}/profile.gql`);
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
          id: this.id,
          first: this.pageSize,
          offset: 0,
          now: this.now,
          sinceDate: this.sinceDate,
          ...this.filter,
        };
      },
    },
  },

  mounted() {
    window.addEventListener("scroll", this.infiniteScroll);
  },

  destroyed() {
    window.removeEventListener("scroll", this.infiniteScroll);
  },

  methods: {
    navigateNewTabLink(item) {
      if (this.isProfile && item.creator.Id) {
        console.log(true);
        return `/perfil/${this.type}/${item.creator.Id}`;
      } else {
        console.log(false);
        return `/perfil/${this.type}/${item.creator.id}`;
      }
    },
    navigateNewTab(o) {
      let creatorId = null;

      if (o.creator.Id) {
        creatorId = o.creator.Id;
      } else {
        creatorId = o.creator.id;
      }

      let routeData = this.$router.resolve({
        path: `/perfil/educadores/${creatorId}`,
        query: {},
      });
      window.open(routeData.href);
    },
    clearSelectedElements() {
      this.loading = true;
      if (this.selectedElements[this.tab].length == 0) {
        let aux = JSON.parse(
          JSON.stringify(
            this.profile[0][this.getProfileTabs(this.profile)[this.tab]]
          )
        );
        this.selectedElements[this.tab] = aux;
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
      let type = this.getProfileTabs(this.profile)[this.tab];
      // @TODO fix não poder usar ç e ó no .gql
      if (type == "Avaliacoes") {
        type = "avaliações";
      } else if (type == "Topicos") {
        type = "topicos";
      } else if (type === "Notas") {
        type = "Alunos";
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
      let type = this.getProfileTabs(this.profile)[this.tab];
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
      if (key.endsWith("Percentage")) {
        return String((v * 100).toFixed(1)) + "%";
      }
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
      return this.trueValue(s, key)?.length >= 10 &&
        !this.trueValue(s, key).includes("@")
        ? new Date(this.trueValue(s, key).substring(0, 10)).toString() !==
            "Invalid Date"
        : false;
    },
    changedSinceDate(newSinceDate) {
      this.sinceDate = newSinceDate;
    },
    changedUntilDate(newUntilDate) {
      this.now = newUntilDate;
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
      return utils.tabActions(context, this.getProfileTabs(profile)[this.tab]);
    },
    elementActions(profile, context) {
      return utils.elementActions(
        context,
        this.getProfileTabs(profile)[this.tab]
      );
    },
    infiniteScroll() {
      if (this.profile) {
        let numberOfElementsShowing = this.computeDataTableRows(
          this.profile[0][this.getProfileTabs(this.profile)[this.tab]]
        ).length;

        if (
          window.innerHeight + window.scrollY + 1 >
            document.body.offsetHeight &&
          numberOfElementsShowing >= this.pageSize &&
          numberOfElementsShowing % this.pageSize == 0
        ) {
          this.fetchMore();
        }
      }
    },
    getProfileTabs(profile) {
      if (profile) {
        return Object.keys(profile[0]).filter((key) =>
          Array.isArray(profile[0][key])
        );
      }
    },
    getProfileChips(t) {
      return utils.getProfileChips(t);
    },
    getProfileRects(t) {
      return utils.getProfileRects(t);
    },
    getHeaderProperties(t) {
      return utils.getHeaderProperties(t);
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
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
      if (type == "Avaliacoes") {
        type = "avaliações";
      }
      return utils.getDataTableHeaders(
        context,
        this.typeTo__typename(type.toLowerCase())
      );
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
    openProfileActions() {
      if (this.profile[0].type) {
        if (this.profile[0].type == "NATIONAL_OLYMPICS") {
          return;
        }
      }
      this.showProfileActions = true;
    },
    copy(c) {
      utils.copyTextToClipboard(c);
      this.$nuxt.$emit("copiedText");
    },
    fetchMore() {
      this.loading = true;
      let tabName = this.getProfileTabs(this.profile)[this.tab];
      if (!this.page[tabName]) {
        this.page[tabName] = 1;
      } else {
        this.page[tabName]++;
      }
      const offset = this.page[tabName] * this.pageSize;
      this.$apollo.queries.profile.fetchMore({
        variables: {
          first: this.pageSize,
          offset,
        },
        loadingKey: this.loading,
        updateQuery: (previousResult, { fetchMoreResult }) => {
          // if (
          //   !this.arrayEquals(
          //     previousResult.profile[0][
          //       this.getProfileTabs(this.profile)[this.tab]
          //     ],
          //     fetchMoreResult.profile[0][
          //       this.getProfileTabs(this.profile)[this.tab]
          //     ]
          //   )
          // ) {
          const result = previousResult;
          result.profile[0][this.getProfileTabs(this.profile)[this.tab]] =
            result.profile[0][
              this.getProfileTabs(this.profile)[this.tab]
            ].concat(
              fetchMoreResult.profile[0][
                this.getProfileTabs(this.profile)[this.tab]
              ]
            );
          this.loading = false;
          return result;
          // } else {
          //   this.loading = false;
          //   return previousResult;
          // }
        },
      });
    },
    async rectAction(prop) {
      if (this.profile[0][prop] === undefined) {
        switch (prop) {
          case "activeStudents":
            this.getActiveStudents();
            break;
        }
      }
    },
    async getActiveStudents() {
      if (["turmas", "escolas"].includes(this.type)) {
        this.loadingRectAction = true;

        const { data } = await this.$apollo.query({
          query: require(`@/graphql/${this.type}/getActiveStudents.gql`),
          variables: {
            id: this.id,
            now: this.now,
            sinceDate: this.sinceDate,
          },
        });
        this.profile[0].activeStudents = data.profile[0].activeStudents;
        this.loadingRectAction = false;
      }
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
