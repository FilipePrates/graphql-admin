<template>
  <div
    class="
      blue-8
      filter-tab
      d-flex
      flex-column
      elevation-1
      gray-2--text
      font-weight-medium
    "
    style="width: 460px; height: 800px; position: fixed; left: 0; top: 80px"
  >
    <div class="text-center my-1">Filtros</div>
    <v-divider></v-divider>
    <div
      class="mx-2 d-flex align-center"
      v-for="filter in filters"
      :key="filter.name"
    >
      <div class="mr-4">{{ filter.name }}:</div>
      <ApolloQuery v-if="filter.query" :query="filter.query">
        <template v-slot="{ result: { data } }">
          <v-combobox
            v-if="data"
            :items="data.list"
            :item-text="filter.text"
            :item-value="filter.id"
            v-model="selected[filter.parameter]"
            @input="input('object')"
          />
        </template>
      </ApolloQuery>
      <v-text-field
        v-else-if="filter.type == 'int'"
        v-model="selected[filter.parameter]"
        type="number"
        @input="input('int')"
      />
      <v-checkbox v-else />
    </div>
  </div>
</template>

<script>
import filters from "~/utils/filters";

export default {
  props: {
    children: {
      type: String,
      default: null,
    },
  },

  data: () => ({
    selected: {},
  }),

  computed: {
    context() {
      if (this.$route.params.id) return "profile";
      else return "list";
    },
    type() {
      return this.$route.params.type;
    },
    filters() {
      let prop = this.children ? this.children : "list";
      if (filters[this.type][prop]) {
        return filters[this.type][prop];
      } else return [];
    },
  },

  methods: {
    input(type) {
      let filterObject = {};
      let keys = Object.keys(this.selected);
      for (let key of keys) {
        let properties = key.split("/");
        if (this.selected[key] != "") {
          if (type == "object")
            this.assign(
              filterObject,
              properties,
              this.selected[key][properties[properties.length - 1]]
            );
          else if (type == "int")
            filterObject["filter"] = this.assign(
              filterObject,
              properties,
              parseInt(this.selected[key])
            );
          else
            filterObject["filter"] = this.assign(
              filterObject,
              properties,
              this.selected[key]
            );
        }
      }
      this.$emit("input", filterObject);
    },
    clearEmpties(o) {
      for (var k in o) {
        if (!o[k] || typeof o[k] !== "object") {
          continue;
        }

        this.clearEmpties(o[k]);
        if (Object.keys(o[k]).length === 0) {
          delete o[k];
        }
      }
    },
    assign(obj, keyPath, value) {
      let lastKeyIndex = keyPath.length - 1;
      for (var i = 0; i < lastKeyIndex; ++i) {
        let key = keyPath[i];
        if (!(key in obj)) {
          obj[key] = {};
        }
        obj = obj[key];
      }
      obj[keyPath[lastKeyIndex]] = value;
    },
  },
};
</script>

<style lang="sass">
.filter-tab
  border-radius: 0px 20px 20px 0px
</style>
