<template>
  <div class="text-center">
    <v-row no-gutters v-if="courses" class="ml-4">
      <v-col
        cols="1"
        v-for="(ka, i) in getKnowledgeAreas()"
        :key="i"
        class="mx-2"
      >
        <v-card
          flat
          height="20px"
          width="38px"
          class="ma-0 pa-0"
          :color="
            ka.mainColor
              ? `${ka.mainColor}`
              : ka.backgroundColor
              ? `${ka.backgroundColor}`
              : `grey-6`
          "
        >
          <v-row no-gutters>
            <v-col cols="12" class="mt-n1">
              <span
                :class="ka.backgroundColor ? `white--text tags ` : `tags `"
                >{{ ka.name.substring(0, 3) }}</span
              >
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ["courses"],
  data() {
    return {
      dialog: false,
    };
  },

  methods: {
    getKnowledgeAreas() {
      let c = [];
      for (let course of this.courses) {
        if (
          c.findIndex((ka) => {
            return ka.name === course.knowledgeArea.name;
          }) == -1
        ) {
          c.push(course.knowledgeArea);
        }
      }
      return c;
    },
  },
};
</script>
<style scoped>
.tags {
  /* body / 12-regular */
  font-family: Rubik;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 150%;
  text-transform: uppercase;

  /* identical to box height, or 18px */

  text-align: center;
}
</style>
