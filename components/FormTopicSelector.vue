<template>
  <v-row class="px-2">
    <v-col cols="12">
      <ApolloQuery :query="require('@/graphql/getKnowledgeAreas.gql')">
        <template v-slot="{ result: { loading, error, data } }">
          <div v-if="loading" class="loading apollo">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
          <div v-else-if="error" class="error apollo">Um erro ocorreu :(</div>
          <div v-else-if="data" class="result apollo">
            <v-select
              v-model="selectedKnowledgeArea"
              :items="data.KnowledgeArea"
              label="Disciplina"
              item-text="name"
              return-object
              required
              outlined
            ></v-select>
            <ApolloQuery
              v-if="selectedKnowledgeArea.Id"
              :query="require('@/graphql/getCourses.gql')"
              :variables="{ knowledgeAreaId: selectedKnowledgeArea.Id }"
            >
              <template v-slot="{ result: { loading, error, data } }">
                <div v-if="loading" class="loading apollo">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
                <div v-else-if="error" class="error apollo">
                  Um erro ocorreu :(
                </div>
                <div v-else-if="data" class="result apollo">
                  <v-select
                    v-model="selectedCourse"
                    :items="data.Course"
                    label="Curso"
                    item-text="name"
                    return-object
                    required
                    outlined
                  ></v-select>
                  <ApolloQuery
                    v-if="selectedCourse.Id"
                    :query="require('@/graphql/getTopics.gql')"
                    :variables="{ courseId: selectedCourse.Id }"
                  >
                    <template v-slot="{ result: { loading, error, data } }">
                      <div v-if="loading" class="loading apollo">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                      </div>
                      <div v-else-if="error" class="error apollo">
                        Um erro ocorreu :(
                      </div>
                      <div v-else-if="data" class="result apollo">
                        <v-autocomplete
                          @input="addOrRemoveSelectedTopic"
                          :items="data.Topic"
                          label="Tópicos"
                          item-text="name"
                          return-object
                          multiple
                          outlined
                        >
                        </v-autocomplete>
                      </div>
                      <div v-else class="no-result apollo">
                        <v-progress-circular
                          class="mb-8"
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                      </div>
                    </template>
                  </ApolloQuery>
                </div>
                <div v-else class="no-result apollo">
                  <v-progress-circular
                    class="mb-8"
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
              </template>
            </ApolloQuery>
          </div>
          <div v-else class="no-result apollo">
            <v-progress-circular
              class="mb-8"
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
        </template>
      </ApolloQuery>
    </v-col>
    <v-col cols="12">
      <v-data-table
        v-if="selectedTopics.length > 0"
        :items="selectedTopics"
        :headers="topicHeaders"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            @click="removeTopic(item)"
            text
            fab
            depressed
            height="24px"
            width="24px"
          >
            <v-icon color="blue-5">mdi-close-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: [""],
  data() {
    return {
      dialog: false,
      selectedTopics: [],
      selectedKnowledgeArea: {},
      selectedCourse: {},
      topicHeaders: [
        { text: "Remover", value: "actions" },
        { text: "Disciplina", value: "knowledgeArea" },
        { text: "Curso", value: "course" },
        {
          text: "Nome",
          align: "start",
          sortable: true,
          value: "name",
        },
      ],
    };
  },
  watch: {
    selectedTopics(newVal) {
      this.$emit("change", newVal);
    },
  },
  methods: {
    addOrRemoveSelectedTopic(topics) {
      let aux = this.selectedTopics.concat(
        topics.map((a) => {
          if (a.course) {
            return a;
          } else {
            a.course = JSON.parse(JSON.stringify(this.selectedCourse.name));
            a.knowledgeArea = JSON.parse(
              JSON.stringify(this.selectedKnowledgeArea.name)
            );
            a.actions = "actions";
            return a;
          }
        })
      );
      this.selectedTopics = this.getUnique(aux, "Id");
    },
    removeTopic(topic) {
      this.selectedTopics = this.selectedTopics.filter(
        (item) => item.Id !== topic.Id
      );
      this.selectedCourse = {};
    },
    getUnique(arr, comp) {
      const unique = arr
        .map((e) => e[comp])
        .map((e, i, final) => final.indexOf(e) === i && i)
        .filter((e) => arr[e])
        .map((e) => arr[e]);
      return unique;
    },
  },
};
</script>
