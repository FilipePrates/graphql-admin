<template>
  <div class="text-center">
    <div class="d-flex flex-column white" style="border-radius: 8px">
      <v-row no-gutters justify="end" class="pa-0 ma-0"
        ><v-col cols="1"
          ><v-btn text @click="close()">
            <unicon
              name="times"
              fill="#0D47A1"
              class="pa-0 text-center"
            ></unicon>
          </v-btn> </v-col
      ></v-row>
      <div
        class="
          d-flex
          blue-2--text
          font-weight-bold
          gray-7
          pb-5
          align-center
          justify-center
          text-h5
        "
      >
        <v-icon class="mr-2 text-h5" color="blue-2">
          mdi-view-grid-plus-outline
        </v-icon>
        <div>{{ add ? "Criar" : "Editar" }}</div>
      </div>
      <div class="d-flex flex-column px-10" v-if="loaded">
        <div class="font-weight-bold mb-8">* Campos obrigatórios</div>
        <v-form>
          <v-row no-gutters justify="space-between">
            <v-col cols="12" class="px-2">
              <v-text-field disabled label="Id" v-model="Id" outlined>
              </v-text-field>
            </v-col>
            <v-col
              cols="12"
              class="px-2"
              v-for="(property, i) in properties.strings"
              :key="i"
            >
              <v-row no-gutters>
                <v-col v-if="i != 'avatarUrl'">
                  <v-text-field
                    :label="`${
                      non_null[i] ? translate(i) + ' *' : translate(i)
                    }`"
                    v-model="property.value"
                    :disabled="property.disableInput"
                    outlined
                  />
                </v-col>
                <v-col cols="11" v-else-if="i == 'avatarUrl'">
                  <v-file-input
                    @change="uploadImage(i, $event)"
                    :label="`${
                      non_null[i] ? translate(i) + ' *' : translate(i)
                    }`"
                    prepend-icon=""
                    append-icon="$file"
                    outlined
                  >
                  </v-file-input>
                </v-col>
                <v-col
                  cols="1"
                  v-if="i == 'avatarUrl' && property.value != ''"
                  @click="viewAvatarUrl = true"
                >
                  <v-hover v-slot="{ hover }">
                    <v-flex>
                      <v-card v-if="hover" class="mb-3 mx-3"
                        ><v-img :src="property.value"></v-img
                      ></v-card>
                      <unicon v-else name="eye" class="mt-4"> </unicon>
                    </v-flex>
                  </v-hover>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="6"
              class="px-2"
              v-for="(enumProperty, j) in properties.enums"
              :key="j"
            >
              <v-select
                :label="`${non_null[j] ? translate(j) + ' *' : translate(j)}`"
                :items="enumValues[j]"
                item-text="name"
                item-value="name"
                v-model="enumProperty.value"
                outlined
                @input="checkEnumChanged(enumProperty)"
              >
                <template slot="selection" slot-scope="{ item }">
                  {{ translate(item.name) }}
                </template>
                <template slot="item" slot-scope="{ item }">
                  {{ translate(item.name) }}
                </template>
              </v-select>
            </v-col>
            <v-col
              cols="6"
              class="px-2"
              v-for="(property, k) in properties.numerics"
              :key="k"
            >
              <v-text-field
                :label="`${non_null[k] ? translate(k) + ' *' : translate(k)}`"
                type="number"
                v-model="property.value"
                outlined
              />
            </v-col>
            <v-col
              cols="12"
              class="px-2"
              v-for="(property, w) in properties.dateTimes"
              :key="w"
            >
              <date-time-picker
                :label="`${non_null[w] ? translate(w) + ' *' : translate(w)}`"
                :datetime="property.value"
                @onChange="changedDateTime($event, w)"
              />
            </v-col>
            <v-col
              cols="3"
              class="pa-2"
              v-for="(property, y) in properties.booleans"
              :key="y"
            >
              <v-switch
                class="mt-0"
                v-model="property.value"
                :label="`${non_null[y] ? translate(y) + ' *' : translate(y)}`"
              ></v-switch>
            </v-col>
            <v-col cols="3" v-if="isUser(typename) && !add" class="pa-2">
              <v-switch
                v-model="changedPassword"
                label="Mudar senha"
              ></v-switch>
            </v-col>
            <v-col
              cols="5"
              v-if="
                isCreateTaskInSchoolClassProfile ||
                (classes != [] && typename == 'Task')
              "
            >
              <v-switch
                class="mt-0"
                v-model="addAllStudentsFromSchoolClasses"
                label="Conectar com todos os alunos"
              ></v-switch>
            </v-col>

            <v-col cols="12" v-if="changedPassword">
              <v-text-field
                v-model="password"
                label="Nova Senha"
                outlined
              ></v-text-field>
            </v-col>

            <v-col
              cols="12"
              v-if="isCreateSchoolClassInListContext"
              class="px-2"
            >
              <school-picker @changedSchool="changedSchool"></school-picker>
            </v-col>

            <v-col
              cols="12"
              v-if="isCreateSchoolManagerInListContext || isEmployee"
              class="px-2"
            >
              <school-picker
                multiple
                @changedSchool="changedSchool"
              ></school-picker>
            </v-col>

            <v-col cols="12" v-if="isOlympics">
              <school-picker
                multiple
                @changedSchool="setOlympicsSchool"
              ></school-picker>
              <courses-picker
                @changedCourses="changedOlympicCourses"
              ></courses-picker>
            </v-col>

            <v-col cols="12" v-if="isCreateSchool">
              <courses-picker
                @changedCourses="changedSchoolCourses"
              ></courses-picker>
            </v-col>

            <v-col
              cols="12"
              v-if="isCreateTaskInListContext || isCreateProfessorInListContext"
            >
              <school-class-picker
                :currentClasses="classes"
                @changedClasses="changedClasses"
              ></school-class-picker>
            </v-col>

            <v-col cols="12" v-if="isCreateUserInSchoolProfile">
              <school-class-picker
                :schoolId="$route.params.id"
                @changedClasses="changedClasses"
              ></school-class-picker>
            </v-col>

            <v-col cols="12" v-if="typename == 'Task' && add && !isOlympics">
              <topic-selector @change="changedSelectedTopic"></topic-selector>
            </v-col>
          </v-row>
        </v-form>
      </div>
      <div class="d-flex align-self-center mb-5" v-if="!loading">
        <v-btn depressed outlined color="blue-2" class="mx-3" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          @click="commitChanges"
          depressed
          color="blue-2"
          class="mx-3 white--text"
        >
          Salvar
        </v-btn>
      </div>
      <div class="d-flex align-self-center mb-5" v-else>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "~/utils/passwordEncryptor.js";
import { defaultPasswords } from "~/utils/constants.js";
import SchoolClassPicker from "~/components/FormSchoolClassPicker.vue";
import SchoolPicker from "~/components/FormSchoolPicker.vue";
import CoursesPicker from "~/components/FormCoursesPicker.vue";
import DateTimePicker from "~/components/FormDateTimePicker.vue";
import TopicSelector from "~/components/FormTopicSelector.vue";
import utils from "~/utils/utils.js";
import jgLib from "@jovens-genios/vue-components";

const axios = require("axios");

export default {
  props: ["element", "add", "typename", "action", "opened"],
  data() {
    return {
      Id: "",
      properties: {
        strings: {},
        enums: {},
        numerics: {},
        dateTimes: {},
        booleans: {},
      },
      enumValues: {},
      editableProperties: {},
      non_null: {},
      password: "1234",
      addAllStudentsFromSchoolClasses: true,
      changedPassword: false,
      loaded: false,
      loading: false,
      viewAvatarUrl: false,
      topics: [],
      isOlympics: false,
      isManager: false,
      isProfessor: true,
      isEmployee: false,
      olympicTopics: [],
      classes: [],
      school: null,
      schools: [],
      olympicCourses: [],
      schoolCourses: [],
    };
  },
  components: {
    DateTimePicker,
    TopicSelector,
    SchoolClassPicker,
    SchoolPicker,
    CoursesPicker,
  },
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    isCreateSchoolManagerInListContext() {
      return (
        this.typename == "Professor" &&
        this.$route.params.type == "educadores" &&
        this.add == true &&
        this.isManager == true
      );
    },
    isCreateProfessorInListContext() {
      return (
        this.typename == "Professor" &&
        this.$route.params.type == "educadores" &&
        this.add == true &&
        this.isProfessor == true
      );
    },
    isCreateProfessorInSchoolClassProfile() {
      return (
        this.typename == "Professor" &&
        this.add == true &&
        this.$route.params.type == "turmas"
      );
    },
    isCreateTaskInSchoolClassProfile() {
      return (
        this.typename == "Task" &&
        this.add == true &&
        (this.$route.params.type == "turmas" || this.classes.length > 0)
      );
    },
    isCreateUserInSchoolProfile() {
      return (
        ["Professor", "Student"].includes(this.typename) &&
        this.add == true &&
        this.$route.params.type == "escolas"
      );
    },
    isCreateTaskInListContext() {
      return (
        this.typename == "Task" &&
        this.$route.params.type == "atividades" &&
        this.add == true
      );
    },
    // isCreateAdmin() {
    //   return this.typename == "Admin" && this.add == true;
    // },
    isCreateSchool() {
      return this.typename == "School" && this.add == true;
    },
    isCreateTask() {
      return this.typename == "Task" && this.add == true;
    },
    isCreateSchoolClassInListContext() {
      return (
        this.typename === "SchoolClass" &&
        this.$route.params.type == "turmas" &&
        this.add == true
      );
    },
    isNonStandardPassword() {
      return this.typename === "Professor";
    },
  },
  watch: {
    typename(newVal) {
      if (newVal) {
        this.setUpFormFields();
      }
    },
    opened(newVal) {
      if (newVal) {
        if (!this.user.Id) {
          this.saveUserInStore();
        }
        this.setup();
      }
    },
  },
  async mounted() {
    if (!this.user.Id) {
      this.saveUserInStore();
    }
    if (this.isNonStandardPassword) {
      this.password = defaultPasswords[this.typename].password;
    }
    this.setup();
  },
  methods: {
    async saveUserInStore() {
      try {
        const currentUser = await this.$apollo.query({
          query: require("@/graphql/getCurrentUser.gql"),
        });
        this.$store.commit("setUser", currentUser.data.currentUser);
      } catch (error) {
        alert("Erro, erro ao pegar o usuário");
        this.loading = false;
      }
    },
    async setup() {
      this.loaded = false;
      this.editableProperties = this.getEditableProperties();

      await this.setUpFormFields();
      if (this.add) {
        this.Id = uuidv4();
        if (this.isUser(this.typename)) {
          this.changedPassword = true;
        }
        if (["SchoolClass", "School"].includes(this.typename)) {
          this.properties.strings["code"].value = this.Id.substring(0, 6);
          this.properties.strings["code"].disableInput = true;
        }
      } else {
        this.populateFormFields();
      }
      this.loaded = true;
    },
    async setUpFormFields() {
      if (this.typename) {
        let schema = await this.getInstrospectionQuery(this.typename);
        for (let field of schema.fields) {
          if (field.type.kind == "NON_NULL") {
            this.non_null[field.name] = field;
            this.separatePropertiesIntoTypes(
              field.type.ofType.name,
              field.type.ofType.kind,
              { type: field.type.ofType, name: field.name }
            );
          } else {
            this.separatePropertiesIntoTypes(
              field.type.name,
              field.type.kind,
              field
            );
          }
        }
      } else {
        console.log("No typename");
      }
    },
    separatePropertiesIntoTypes(name, kind, field) {
      if (kind == "OBJECT" && name == "_Neo4jDateTime") {
        field.value = DateTime.local().toISO();
        if (this.editableProperties.indexOf(field.name) != -1) {
          this.properties.dateTimes[field.name] = field;
        }
      } else if (kind == "SCALAR") {
        if (name == "String") {
          if (this.editableProperties.indexOf(field.name) != -1) {
            field.value = "";
            this.properties.strings[field.name] = field;
          }
        } else if (name == "Boolean") {
          if (this.editableProperties.indexOf(field.name) != -1) {
            field.value = false;
            this.properties.booleans[field.name] = field;
          }
        } else if (name == "Int" || name == "Float") {
          if (this.editableProperties.indexOf(field.name) != -1) {
            field.value = 0;
            this.properties.numerics[field.name] = field;
          }
        }
      } else if (kind == "ENUM") {
        if (this.editableProperties.indexOf(field.name) != -1) {
          // Hardcoded para garantir já selecionar o enumValue que faz sentido
          if (["Professor", "Task"].includes(this.typename)) {
            field.value = field.type.enumValues[0].name;
          } else {
            field.value =
              field.type.enumValues[field.type.enumValues.length - 1].name;
          }
          this.enumValues[field.name] = field.type.enumValues;
          this.properties.enums[field.name] = field;
        }
      }
    },
    populateFormFields() {
      this.Id = this.element.Id;
      for (let property in this.element) {
        for (let field in Object.entries(this.properties.strings)) {
          if (property == Object.entries(this.properties.strings)[field][0]) {
            this.properties.strings[property].value = this.element[property];
          }
        }
        for (let field in Object.entries(this.properties.enums)) {
          if (property == Object.entries(this.properties.enums)[field][0]) {
            this.properties.enums[property].value = this.element[property];
          }
        }
        for (let field in Object.entries(this.properties.dateTimes)) {
          if (
            property.split(".")[property.split(".").length - 1] ==
            Object.entries(this.properties.dateTimes)[field][0]
          ) {
            if (typeof this.element[property] == "object") {
              this.properties.dateTimes[property.split(".")[0]].value =
                this.element[property][Object.keys(this.element[property])[0]];
            } else {
              this.properties.dateTimes[property.split(".")[0]].value =
                DateTime.fromFormat(
                  this.element[property],
                  "dd/MM/yyyy HH:mm:ss"
                ).toISO();
            }
          }
        }
        for (let field in Object.entries(this.properties.booleans)) {
          if (property == Object.entries(this.properties.booleans)[field][0]) {
            this.properties.booleans[property].value = this.element[property];
          }
        }
        for (let field in Object.entries(this.properties.numerics)) {
          if (property == Object.entries(this.properties.numerics)[field][0]) {
            this.properties.numerics[property].value = this.element[property];
          }
        }
      }
    },
    generateFields() {
      for (let prop of Object.keys(this.properties.booleans)) {
        this.properties.booleans[prop].value = Boolean(
          this.properties.booleans[prop].value
        );
      }
      for (let prop of Object.keys(this.properties.enums)) {
        this.properties.enums[prop].value = utils.detranslate(
          this.properties.enums[prop].value
        );
      }

      for (let prop of Object.keys(this.properties.dateTimes)) {
        if (!this.properties.dateTimes[prop].value) {
          this.properties.dateTimes[prop].value = {};
        }
        if (!this.properties.dateTimes[prop].value.timezone) {
          this.properties.dateTimes[prop].value.timezone = "-03:00";
        }

        if (this.properties.dateTimes[prop].value) {
          const { year, month, day } = this.properties.dateTimes[prop].value;
          const propertyDate = DateTime.fromObject({
            year,
            month,
            day,
          }).toFormat("dd-MM-yyyy");
          const currentDate = DateTime.now().toFormat("dd-MM-yyyy");

          if (propertyDate === currentDate) {
            this.properties.dateTimes[prop].value = undefined;
          }
        }
      }

      let fields = {
        ...this.properties.strings,
        ...this.properties.dateTimes,
        ...this.properties.enums,
        ...this.properties.booleans,
        ...this.properties.numerics,
      };
      let objFields = Object.entries(fields).map(([k, v]) => {
        return { key: k, value: v.value };
      });

      return objFields.reduce(
        (obj, item) => Object.assign(obj, { [item.key]: item.value }),
        {}
      );
    },
    async getInstrospectionQuery(typename) {
      let variables = { typename: typename };
      try {
        let response = await this.$apollo.query({
          query: require(`@/graphql/introspectionQuery.gql`),
          variables: variables,
        });
        return response.data.__type;
      } catch (e) {
        console.log(e);
        return;
      }
    },
    getNonEditableProperties() {
      return utils.getNonEditableProperties(this.typename);
    },
    getEditableProperties() {
      return utils.getEditableProperties(this.typename);
    },
    translate(s) {
      return utils.translate(s);
    },
    trimString(s) {
      if (!(typeof s === "string")) return s;
      return utils.trimString(s);
    },
    __typenameToType(s) {
      return utils.__typenameToType(s);
    },
    routerReplace(args) {
      return utils.routerReplace(this, args);
    },
    isUser(s) {
      return utils.isUser(s);
    },
    close() {
      this.$emit("closed");
    },
    edited(response) {
      this.$emit("edited", {
        action: this.action,
        response: response,
        typename: this.__typenameToType(this.typename),
      });
      this.close();
    },
    async uploadImage(prop, blob) {
      let filename = uuidv4() + `.png`;
      const { data: uploadUrl } = await this.$apollo.mutate({
        mutation: require("@/graphql/awsS3PreSignedUploadUrl.gql"),
        variables: {
          filename: filename,
          contentType: `IMAGE_PNG`,
        },
      });

      if (uploadUrl.awsS3PreSignedUploadUrl.signedUrl) {
        var instance = axios.create();
        delete instance.defaults.headers.common["Authorization"];
        await instance.put(uploadUrl.awsS3PreSignedUploadUrl.signedUrl, blob, {
          headers: { "Content-Type": "image/png" },
        });
        this.properties.strings[prop] = {
          value: uploadUrl.awsS3PreSignedUploadUrl.baseUrl + filename,
        };
      }
    },
    changedDateTime(value, place) {
      this.properties.dateTimes[place].value = value;
    },
    changedSelectedTopic(value) {
      this.topics = value;
    },
    changedOlympicCourses(courses) {
      this.olympicCourses = courses;
    },
    changedSchoolCourses(courses) {
      this.schoolCourses = courses;
    },
    changedClasses(classes) {
      this.classes = classes;
    },
    changedSchool(val) {
      if (Array.isArray(val)) {
        this.schools = val;
      } else {
        this.school = val;
      }
    },
    parseIntAndDateTimeProperties() {
      for (let field in this.properties.numerics) {
        this.properties.numerics[field].value = parseInt(
          this.properties.numerics[field].value,
          10
        );
      }
      for (let field in this.properties.dateTimes) {
        if (typeof this.properties.dateTimes[field].value != "object") {
          this.properties.dateTimes[field].value = DateTime.fromISO(
            this.properties.dateTimes[field].value
          ).c;
        }
      }
    },
    canCreateSchoolClass() {
      if (this.properties.numerics.schoolYear.value == 0) {
        this.$store.commit(
          "setFeedBackText",
          "Não é possível criar uma turma sem ano escolar."
        );
        this.$store.commit("setFeedBackDialog", true);
        return false;
      }

      if (this.school === null && !this.$route.path.includes("escolas")) {
        this.$store.commit(
          "setFeedBackText",
          "Não é possível criar uma turma sem escola."
        );
        this.$store.commit("setFeedBackDialog", true);
        return false;
      }

      return true;
    },
    cleanVariables(variables) {
      for (let key of Object.keys(variables)) {
        if (variables[key] != undefined) {
          if (variables[key].length > 0) {
            variables[key] = this.trimString(variables[key]);
          }
        } else {
          delete variables[key];
        }
      }
      return variables;
    },
    async commitChanges() {
      if (this.isOlympics) {
        this.createOlympics();
        return;
      }
      if (["SchoolClass"].includes(this.typename)) {
        if (!this.canCreateSchoolClass()) {
          return;
        }
      }
      if (this.changedPassword) {
        this.password = await hashPassword(this.password);
      }
      this.parseIntAndDateTimeProperties();
      let fields = this.generateFields();
      let variables = {
        Id: this.Id,
        ...fields,
        password: this.password,
      };
      if (variables.name) {
        variables.normalizedName = utils.normalizeString(variables.name);
      }
      if (variables.email) {
        variables.email = variables.email.toLowerCase();
      }
      variables = this.cleanVariables(variables);
      let now = DateTime.local().c;
      now.timezone = "-03:00";
      variables.updatedAt = now;
      try {
        let response = await this.$apollo.mutate({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.typename
          )}/${this.add ? "create" : "update"}.gql`),
          variables: variables,
        });
        if (this.action.includes("Conectar")) {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/${this.$route.params.type}/merge${this.typename}.gql`),
            variables: {
              parentId: this.$route.params.id,
              childId: variables.Id,
            },
          });
        }
        await this.postCreation(response, variables);
      } catch (e) {
        console.log("Erro na criação/conexão ", e);
        alert(e);
        return;
      }
    },
    async createOlympics() {
      this.loading = true;
      let variables = {};
      let response = {};
      variables.Id = this.Id;
      this.parseIntAndDateTimeProperties();
      let fields = this.generateFields();
      fields.type = "OLYMPICS";
      variables = {
        ...variables,
        ...fields,
      };
      variables = this.cleanVariables(variables);
      let now = DateTime.local().c;
      now.timezone = "-03:00";
      variables.updatedAt = now;
      variables.Id = uuidv4();
      if (variables.name) {
        variables.normalizedName = utils.normalizeString(variables.name);
      }
      if (this.classes.length > 0) {
        try {
          response = await this.$apollo.mutate({
            mutation: require(`@/graphql/${this.__typenameToType(
              this.typename
            )}/${this.add ? "create" : "update"}.gql`),
            variables: variables,
          });
          if (this.action.includes("Conectar")) {
            await this.$apollo.mutate({
              mutation: require(`@/graphql/${this.$route.params.type}/merge${this.typename}.gql`),
              variables: {
                parentId: this.$route.params.id,
                childId: variables.Id,
              },
            });
          }
        } catch (e) {
          console.log("Erro na criação/conexão ", e);
          alert(e);
          return;
        }
      }
      if (this.olympicCourses.length > 0) {
        await this.mergeOlympicTopics(response.data.CreateTask.Id);
      }
      if (this.classes.length > 0) {
        await this.mergeSchoolClasses(variables.Id);
        await this.getStudentsFromClassesAndMergeToTask(variables.Id);
      }
      await this.mergeCreator(variables.Id);
      this.loading = false;
      this.edited(response);
    },

    async postCreation(response, variables) {
      this.loading = true;
      if (
        this.typename === "Task" &&
        variables.type === "ASSIGNMENT" &&
        this.add
      ) {
        this.createAndMergeTaskGoal(response.data.CreateTask.Id);
      }
      if (this.isCreateProfessorInSchoolClassProfile) {
        this.mergeProfessorToSchoolOfSchoolClass(variables);
      }
      // Caso de relação one-to-one com escola
      if (this.school) {
        if (this.school.length > 0) {
          await this.mergeSchool(variables.Id);
        }
      }
      // Caso de relação many-to-many com escola
      if (this.schools.length > 0) {
        await this.mergeSchools(variables.Id);
      }
      if (this.topics.length > 0) {
        await this.mergeTopics(variables.Id);
      }
      if (this.classes.length > 0) {
        await this.mergeSchoolClasses(variables.Id);
      }
      if (this.addAllStudentsFromSchoolClasses && this.typename == "Task") {
        await this.getStudentsFromClassesAndMergeToTask(variables.Id);
      }
      if (this.isCreateTask) {
        await this.mergeCreator(variables.Id);
      }
      if (this.schoolCourses.length > 0) {
        await this.mergeCourses(variables.Id);
      }
      this.loading = false;
      // Se criou na página de lista, após a criação vai para o perfil do elemento criado
      // eu sei que o timeout é feio
      if (this.$route.name == "lista-type") {
        setTimeout(() => {
          this.routerReplace(
            `/perfil/${this.__typenameToType(this.typename)}/${this.Id}`
          );
          this.close();
        }, 500);
      } else {
        this.edited(response);
      }
    },
    async mergeCourses(schoolId) {
      const coursesMerger = new jgLib.GqlBuilder();
      for (let courseId of this.schoolCourses) {
        coursesMerger.addMutation({
          mutation: require("@/graphql/escolas/mergeCourse.gql"),
          variables: {
            childId: courseId,
            parentId: schoolId,
          },
        });
      }
      try {
        await this.$apollo.mutate({
          mutation: coursesMerger.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro ao conectar com Tópicos ", e);
        alert(e);
        return;
      }
    },
    async getStudentsFromClassesAndMergeToTask(taskId) {
      if (this.classes.length > 0) {
        const studentsGetter = new jgLib.GqlBuilder();
        let allStudents = [];
        for (let schoolClass of this.classes) {
          studentsGetter.addQuery({
            query: require(`@/graphql/turmas/getStudents`),
            variables: { schoolClassId: schoolClass },
          });
        }
        try {
          allStudents = await this.$apollo.mutate({
            mutation: studentsGetter.generateQueryRequest(),
          });
        } catch (e) {
          console.log("Erro ao pegar alunos das turmas ", e);
          alert(e);
          return;
        }
        for (let query in allStudents.data) {
          const studentsMerger = new jgLib.GqlBuilder();
          for (let student of allStudents.data[query][0].students) {
            studentsMerger.addMutation({
              mutation: require(`@/graphql/atividades/mergeStudent.gql`),
              variables: {
                parentId: taskId,
                childId: student.Id,
              },
            });
          }
          if (allStudents.data[query][0].students.length > 0) {
            try {
              await this.$apollo.mutate({
                mutation: studentsMerger.generateMutationRequest(),
              });
            } catch (e) {
              console.log("Erro na conexão dos alunos a tarefa ", e);
              alert(e);
              return;
            }
          }
        }
      }
    },
    async checkEnumChanged(enumProp) {
      if (this.typename === "Task" && enumProp.name === "type") {
        this.isOlympics = enumProp.value === "OLYMPICS";
      }
      if (this.typename === "Professor" && enumProp.name === "role") {
        this.isProfessor = enumProp.value === "PROFESSOR";
        this.isManager = enumProp.value === "MANAGER";
      }
      if (this.typename == "Admin" && enumProp.name === "role") {
        this.isEmployee = enumProp.value === "EMPLOYEE";
      }
    },
    async setOlympicsSchool(schools) {
      this.classes = [];
      for (let schoolId of schools) {
        try {
          const { data } = await this.$apollo.query({
            query: require("@/graphql/escolas/getSchoolClasses.gql"),
            variables: {
              schoolId: schoolId,
            },
          });
          this.classes = this.classes.concat(
            data.School[0].schoolClasses.map((sc) => {
              return sc.Id;
            })
          );
        } catch (e) {
          console.log("Erro ao pegar turmas da escola ", e);
          alert(e);
          return;
        }
      }
    },
    async mergeOlympicTopics(taskId) {
      let olympicTopics = await this.getOlympicTopics();
      const olympicsTopicsIds = [];
      for (let courseTopics in olympicTopics) {
        for (let topic of olympicTopics[courseTopics]) {
          olympicsTopicsIds.push(topic.Id);
        }
      }
      try {
        this.$apollo.mutate({
          mutation: require("@/graphql/atividades/mergeTopicsTaskOlympics.gql"),
          variables: {
            taskId: taskId,
            topicsIds: olympicsTopicsIds,
          },
        });
      } catch (e) {
        console.log(e);
      }
      /*for (let courseTopics in olympicTopics) {
        let topicsMerger = new jgLib.GqlBuilder();
        for (let topic in olympicTopics[courseTopics]) {
          topicsMerger.addMutation({
            mutation: require("@/graphql/atividades/mergeTopic.gql"),
            variables: {
              childId: olympicTopics[courseTopics][topic].Id,
              parentId: parentId,
            },
          });
        }
        try {
          await this.$apollo.mutate({
            mutation: topicsMerger.generateMutationRequest(),
          });
        } catch (e) {
          console.log("Erro ao conectar com Tópicos ", e);
          alert(e);
          return;
        }
      }*/
    },
    async getOlympicTopics() {
      const queryBuilder = new jgLib.GqlBuilder();
      if (this.olympicCourses.length > 0) {
        for (let courseId of this.olympicCourses) {
          queryBuilder.addQuery({
            query: require("@/graphql/topicos/getTopicsByCourse.gql"),
            variables: { courseId: courseId },
          });
        }
        try {
          const { data: queries } = await this.$apollo.query({
            query: queryBuilder.generateQueryRequest(),
          });
          return queries;
        } catch (e) {
          console.log("Erro ao pegar tópicos dos Cursos das olimpíadas ", e);
          alert(e);
          return;
        }
      }
    },
    async createAndMergeTaskGoal(taskId) {
      try {
        let tgresponse = await this.$apollo.mutate({
          mutation: require(`@/graphql/atividades/createTaskGoal.gql`),
        });
        await this.$apollo.mutate({
          mutation: require(`@/graphql/atividades/mergeTaskGoal.gql`),
          variables: {
            parentId: taskId,
            childId: tgresponse.data.CreateTaskGoal.Id,
          },
        });
      } catch (e) {
        console.log(e);
        alert("Erro na criação da TaskGoal ", e);
        return;
      }
    },
    async mergeProfessorToSchoolOfSchoolClass(professor) {
      let schools = await this.getSchoolsOfSchoolClass(this.$route.params.id);
      for (let sch of schools) {
        try {
          await this.$apollo.mutate({
            mutation: require(`@/graphql/educadores/mergeSchool.gql`),
            variables: { parentId: professor.Id, childId: sch },
          });
        } catch (e) {
          console.log("Erro ao conectar a Escola ", e);
          alert(e);
          return;
        }
      }
    },
    async mergeSchool(parentId) {
      try {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.typename
          )}/mergeSchool.gql`),
          variables: { parentId: parentId, childId: this.school },
        });
      } catch (e) {
        console.log("Erro ao conectar a Escola ", e);
        alert(e);
        return;
      }
    },
    async mergeCreator(parentId) {
      try {
        await this.$apollo.mutate({
          mutation: require(`@/graphql/atividades/mergeCreator.gql`),
          variables: { taskId: parentId, userId: this.user.Id },
        });
      } catch (e) {
        console.log("Erro ao conectar o Criador ", e);
        alert(e);
        return;
      }
    },

    async mergeSchools(schoolManagerId) {
      const schoolsMerger = new jgLib.GqlBuilder();
      for (let schoolId of this.schools) {
        schoolsMerger.addMutation({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.typename
          )}/mergeSchool.gql`),
          variables: { parentId: schoolManagerId, childId: schoolId },
        });
        await this.getSchoolClassesOfSchool(schoolId);
      }
      try {
        await this.$apollo.mutate({
          mutation: schoolsMerger.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro ao conectar as Escolas ", e);
        alert(e);
        return;
      }
    },

    async getSchoolsOfSchoolClass(schoolClassId) {
      try {
        const { data } = await this.$apollo.query({
          query: require(`@/graphql/turmas/getSchools.gql`),
          variables: { schoolClassId: schoolClassId },
        });
        return data.SchoolClass[0].schools.map((sch) => {
          return sch.Id;
        });
      } catch (e) {
        console.log("Erro ao pegar os Escolas da Turma ", e);
        alert(e);
        return;
      }
    },

    async getSchoolClassesOfSchool(schoolId) {
      try {
        const { data } = await this.$apollo.query({
          query: require(`@/graphql/escolas/getSchoolClasses.gql`),
          variables: { schoolId: schoolId },
        });
        this.classes = this.classes.concat(
          data.School[0].schoolClasses.map((sc) => {
            return sc.Id;
          })
        );
      } catch (e) {
        console.log("Erro ao conectar as Escolas ", e);
        alert(e);
        return;
      }
    },

    async mergeSchoolClasses(parentId) {
      const schoolClassMerger = new jgLib.GqlBuilder();
      for (let schoolClassId of this.classes) {
        schoolClassMerger.addMutation({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.typename
          )}/mergeSchoolClass.gql`),
          variables: { parentId: parentId, childId: schoolClassId },
        });
      }
      try {
        await this.$apollo.mutate({
          mutation: schoolClassMerger.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro ao conectar as Turmas ", e);
        alert(e);
        return;
      }
    },
    async mergeTopics(parentId) {
      const topicsMerger = new jgLib.GqlBuilder();
      for (let topic of this.topics) {
        topicsMerger.addMutation({
          mutation: require(`@/graphql/${this.__typenameToType(
            this.typename
          )}/mergeTopic.gql`),
          variables: {
            parentId: parentId,
            childId: topic.Id,
          },
        });
      }
      try {
        await this.$apollo.mutate({
          mutation: topicsMerger.generateMutationRequest(),
        });
      } catch (e) {
        console.log("Erro ao conectar com Tópicos ", e);
        alert(e);
        return;
      }
    },
  },
};
</script>

<style lang="scss">
.v-dialog.v-dialog--active::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.v-dialog.v-dialog--active::-webkit-scrollbar-button {
  width: 14px;
  height: 8px;
}
.v-dialog.v-dialog--active::-webkit-scrollbar-thumb {
  background: #40aba8;
  border: 0px none transparent;
  border-radius: 0 24px 24px 0;

  &:hover {
    background: #318180;
  }
  &:active {
    background: #40aba8;
  }
}

.v-dialog.v-dialog--active::-webkit-scrollbar-track {
  background: transparent;
  border: 0px none transparent;
  border-radius: 0 24px 24px 0;

  &:hover {
    background: transparent;
  }

  &:active {
    background: transparent;
  }
}

.v-dialog.v-dialog--active::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
