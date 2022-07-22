export default {
  redes: {
    list: [],
  },
  escolas: {
    list: [
      {
        parameter: "schoolClasses_some/courses_some/courseId",
        query: require("~/graphql/escolas/list.gql"),
        text: "name",
        value: "courseId",
        name: "Disciplinas Contratadas",
      },
    ],
    Turmas: [
      {
        parameter: "filter/schoolYear",
        type: "int",
        name: "Ano Escolar",
      },
    ],
  },
  turmas: {
    list: [
      {
        parameter: "filter/schoolYear",
        type: "int",
        name: "Ano Escolar",
      },
    ],
    alunos: [
      {
        parameter: "schoolClassesFilter/schoolYear",
        type: "int",
        name: "Ano Escolar",
      },
    ],
  },
  alunos: {
    list: [
      {
        parameter: "schoolYear",
        type: "int",
        name: "Ano Escolar",
      },
    ],
  },
};
