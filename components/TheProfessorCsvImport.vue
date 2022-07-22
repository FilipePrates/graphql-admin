<template>
  <v-container class="white">
    <v-row>
      <v-col cols="10">
        <strong>Lista de Educadores</strong>
      </v-col>
      <v-col cols="2" class="text-right">
        <button @click="$emit('close')">
          <unicon name="times" fill="#2E84E5"></unicon>
        </button>
      </v-col>
      <v-col class="pa-0">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="12">
        <a
          href="https://s3.amazonaws.com/jovensgenios.com/files-models/modelo-cadastro-de-educadores-simples.csv"
        >
          <span>Baixar modelo de arquivo de importação.</span>
        </a>
      </v-col>
      <v-col cols="12">
        <span
          >O arquivo de importação deve estar no formato
          <strong>CSV</strong>.</span
        >
      </v-col>
      <v-col cols="12">
        <input @change="uploadUsers" type="file" name="file" ref="files" />
      </v-col>
      <v-col cols="12" v-if="error">
        <span class="red--text">
          {{ error }}
        </span>
      </v-col>
      <v-col cols="12" v-if="!loading">
        <v-btn color="primary" @click="registerProfessors">Cadastrar</v-btn>
      </v-col>
      <v-col cols="12" v-else>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <span class="ml-2"
          >Carregando Educadores... Isso pode demorar alguns minutos.</span
        >
      </v-col>
      <v-col cols="12" v-if="!!success">
        <v-alert type="success" dismissible>{{ success }}</v-alert>
      </v-col>
      <v-col cols="12">
        <strong v-if="failedEmails && failedEmails.length > 0">
          Educadores que falharam no cadastro
        </strong>
      </v-col>
      <v-col cols="12" class="pb-0" v-for="email in failedEmails" :key="email">
        <span>{{ email }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import XLSX from "xlsx";
// import { DateTime } from "luxon";
// import GqlBuilder from "@jovens-genios/vue-components/src/classes/GqlBuilder";
// import { hashPassword } from "~/utils/passwordEncryptor.js";
// import { v4 as uuidv4 } from "uuid";
// import utils from "~/utils/utils.js";

import axios from "axios";

export default {
  name: "ProfessorCsvImport",
  data() {
    return {
      loading: false,
      excelData: [],
      batches: [],
      currentBatch: 0,
      USERS_PER_BATCH: 30,
      failedEmails: [],
      successAlert: false,
      error: "",
      success: undefined,
      url: "",
    };
  },

  watch: {
    error(newError) {
      if (newError) {
        console.log(newError);
      }
    },
  },
  methods: {
    async registerProfessors() {
      if (this.error !== "" || this.url === "") return;
      try {
        this.loading = true;
        let res = await this.$apollo.mutate({
          mutation: require("@/graphql/educadores/createWithCSVFile.gql"),
          variables: {
            url: this.url,
          },
        });
        this.success = `${res.data.registerProfessorByCSV} educadores cadastrados com sucesso!`;
      } catch (error) {
        console.log(error);
        this.error = `Erro inesperado: ${error}`;
      } finally {
        this.loading = false;
      }
    },

    async uploadUsers(event) {
      try {
        this.loading = true;
        let file = event.target.files[0];
        let csv = await this.readFile(file);
        let professors = this.convertCSVToJSON(csv);
        if (!this.validateFields(professors)) {
          return;
        }
        this.url = await this.uploadCSV(file);
        this.success = `${professors.length} educadores verificados e prontos para cadastro!`;
        this.error = "";
      } catch (error) {
        console.log(error);
        this.error = `Erro inesperado: ${error}`;
      } finally {
        this.loading = false;
      }
    },
    validateFields(professors) {
      if (!professors[0]) {
        this.error = "Arquivo vazio";
        return false;
      }
      let keys = Object.keys(professors[0]);

      if (!keys.includes("Nome")) {
        this.error = "Não encontrada coluna Nome";
        return false;
      }
      if (!keys.includes("Email")) {
        this.error = "Não encontrada coluna Email";
        return false;
      }
      if (!keys.includes("Escola ID")) {
        this.error = "Não encontrada coluna Escola ID";
        return false;
      }

      for (let professorIndex in professors) {
        if (professorIndex == professors.length - 1) continue;
        let professor = professors[professorIndex];
        if (!professor.Nome) {
          this.error = `Educador na linha ${
            parseInt(professorIndex) + 2
          } sem nome`;
          return false;
        }
        if (!professor.Email) {
          this.error = `Educador na linha ${
            parseInt(professorIndex) + 2
          } sem email`;
          return false;
        }
        if (!professor["Escola ID"]) {
          this.error = `Educador na linha ${
            parseInt(professorIndex) + 2
          } sem escola`;
          return false;
        }
        if (!this.validateEmail(professor.Email)) {
          this.error = `Educador na linha ${
            parseInt(professorIndex) + 2
          } com email inválido`;
          return false;
        }
        if (!this.validateUuid(professor["Escola ID"])) {
          this.error = `Educador na linha ${
            parseInt(professorIndex) + 2
          } com Escola ID inválido`;
          return false;
        }
      }
      return true;
    },

    validateEmail() {
      return true;
      // var re =
      //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      // return re.test(String(email).toLowerCase());
    },

    validateUuid(uuid) {
      const uuidBackSlashCleaned = uuid.replace(/(\r\n|\n|\r)/gm, "");

      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuidBackSlashCleaned
      );
    },

    readFile(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
          try {
            let fileData = reader.result;
            resolve(fileData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsBinaryString(file);
      });
    },

    convertCSVToJSON(csv) {
      let lines = csv.split("\n");
      let result = [];
      let headers = lines[0].split(",");
      for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }
      return result;
    },

    async uploadCSV(file) {
      // eslint-disable-next-line no-useless-catch
      try {
        let filename = file.name.trim().replaceAll(" ", "");
        let response = await this.$apollo.query({
          query: require("@/graphql/awsS3PreSignedUploadUrl.gql"),
          variables: {
            filename: filename,
            contentType: "TEXT_CSV",
          },
        });
        let instance = axios.create();
        delete instance.defaults.headers.common["Authorization"];

        await instance.put(
          response.data.awsS3PreSignedUploadUrl.signedUrl,
          file,
          // this.recorder.records[lastItem].blob,
          { headers: { "Content-Type": "text/csv" } }
        );

        let url = response.data.awsS3PreSignedUploadUrl.baseUrl + filename;
        return url;
      } catch (error) {
        throw error;
      }
    },

    // generateUsersBatches() {
    //   for (let i = 0; i < this.excelData.length; i += this.USERS_PER_BATCH) {
    //     this.batches.push(this.excelData.slice(i, i + this.USERS_PER_BATCH));
    //   }
    // },

    // async uploadUsers() {
    //   this.generateUsersBatches();
    //
    //   this.loading = true;
    //   try {
    //     for (let [index, batchprofessors] of this.batches.entries()) {
    //       this.currentBatch = index;
    //       let password = await hashPassword("1234");
    //       let builder = new GqlBuilder();
    //       for (let professor of batchprofessors) {
    //         let professorId = uuidv4();
    //         if (typeof professor["Data de nascimento"] == "number") {
    //           alert(
    //             'Erro, data de aniversário está como um número formatado como data. Faça =TEXT(F1;"dd/MM/yyyy")'
    //           );
    //         }
    //         let birthday = DateTime.fromFormat(
    //           professor["Data de nascimento"] || "01/01/2021",
    //           "dd/MM/yyyy"
    //         ).toISO();
    //         builder.addMutation({
    //           mutation: require("@/graphql/Educadores/createSimple.gql"),
    //           variables: {
    //             Id: professorId,
    //             name: professor.Nome,
    //             normalizedName: utils.normalizeString(professor.Nome),
    //             email: professor.Email.normalize("NFD")
    //               .replace(/[\u0300-\u036f]/g, "")
    //               .toLowerCase()
    //               .replaceAll(" ", ""),
    //             nickname:
    //               professor.apelido ||
    //               professor.Nome.split(" ")[0]
    //                 .toLowerCase()
    //                 .normalize("NFC")
    //                 .replace("`", ""),
    //             username: professor.Email.normalize("NFD")
    //               .replace(/[\u0300-\u036f]/g, "")
    //               .toLowerCase()
    //               .replaceAll(" ", ""),
    //             password: password,
    //             schoolYear: professor["Ano escolar"],
    //             birthday: birthday,
    //             createdAt: DateTime.local().toISO(),
    //           },
    //         });
    //         builder.addMutation({
    //           mutation: require("@/graphql/Educadores/mergeSchoolClass.gql"),
    //           variables: {
    //             parentId: professorId,
    //             childId: professor["Turma ID"],
    //           },
    //         });
    //       }
    //       await this.$apollo.mutate({
    //         mutation: builder.generateMutationRequest(),
    //       });
    //     }
    //
    //     this.successAlert = true;
    //   } catch (e) {
    //     console.error =e);
    //     // this.failedEmails = e.message.match(/`email` = '[a-z0-9@.]*'/g);
    //   } finally {
    //     this.loading = false;
    //     this.$router.go();
    //   }
    // },
  },
};
</script>

<style scoped></style>
