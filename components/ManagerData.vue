<template>
  <div>
    <div v-if="!getLoading">
      <v-row>
        <v-col cols="2" class="">
          <v-select
            v-model="indexFilter"
            :items="itemsIndexFilter"
            label="Select an Index"
            solo
            background-color="blue"
            :prepend-inner-icon="'mdi-bullseye'"
          />
        </v-col>
        <v-col cols="2" class="">
          <v-select
            v-model="topicsFilter"
            :items="itemsTopicFilter"
            :disabled="!indexFilter"
            :label="indexFilter ? 'Select a Topic' : 'none'"
            solo
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="onlySelectedFilterIsIndex">
          <v-data-table
            :headers="headerIndexSelected"
            :items="itemsListOfIndexSelected"
            disable-sort
            :loading="getLoading"
            no-data-text="No results"
            hide-default-footer
            class="elevation-2"
          >
          </v-data-table>
        </v-col>
        <v-col v-else>
          <v-data-table
            :headers="headerTopicSelect"
            :items="itemsListOfTopicSelecedOrNothingSeleced"
            :loading="getLoading"
            no-data-text="No results"
            disable-sort
            hide-default-footer
            class="elevation-2"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </div>
    <div v-else-if="getError" style="margin-top: 20%;">
      <v-row justify="center">
        <v-col cols="3">
          <v-alert type="error" prominent>Error fetchnig data</v-alert>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      indexFilter: null,
      topicsFilter: null
    };
  },
  computed: {
    ...mapGetters({
      getData: "managerData/getData",
      getDefinations: "managerData/getDefinations",
      getLoading: "managerData/getLoading",
      getError: "managerData/getError"
    }),
    onlySelectedFilterIsIndex() {
      if (this.indexFilter && !this.topicsFilter) {
        return true;
      }
      return false;
    },
    itemsIndexFilter() {
      const obj = {};
      this.getDefinations.forEach(element => {
        if (!obj[element.index]) {
          obj[element.index] = element.index.toLowerCase();
        }
      });
      const array = Object.keys(obj).map(ele => ({ text: ele, value: ele }));
      return array;
    },
    itemsTopicFilter() {
      if (this.indexFilter) {
        const obj = {};
        const array = this.getDefinations.filter(
          ele => ele.index === this.indexFilter
        );
        array.forEach(element => {
          if (!obj[element.topic]) {
            obj[element.topic] = element.topic.toLowerCase();
          }
        });
        const list = Object.keys(obj).map(ele => ({ text: ele, value: ele }));
        return list;
      }
      return [];
    },
    headerIndexSelected() {
      if (this.indexFilter) {
        const obj = {};
        const array = this.getDefinations.filter(
          ele => ele.index === this.indexFilter
        );
        array.forEach(element => {
          if (!obj[element.topic]) {
            obj[element.topic] = element.topic.toLowerCase();
          }
        });
        const list = Object.keys(obj).map(ele => ({ text: ele, value: ele }));
        return [{ text: "Manager", value: "manager" }, ...list];
      }
      return [];
    },
    headerTopicSelect() {
      if (this.indexFilter && this.topicsFilter) {
        const obj = {};
        const array = this.getDefinations.filter(
          ele => ele.topic === this.topicsFilter
        );
        array.forEach(element => {
          if (!obj[element.subTopic]) {
            obj[element.subTopic] = element.subTopic.toLowerCase();
          }
        });
        const list = Object.keys(obj).map(ele => ({
          text: ele,
          value: ele.toLowerCase()
        }));

        return [{ text: "Manager", value: "manager" }, ...list];
      } else {
        const obj = {};
        this.getDefinations.forEach(element => {
          if (!obj[element.subTopic]) {
            obj[element.subTopic] = element.subTopic.toLowerCase();
          }
        });
        const list = Object.keys(obj).map(ele => ({
          text: ele,
          value: ele.toLowerCase()
        }));
        return [{ text: "Manager", value: "manager" }, ...list];
      }
    },
    itemsListOfIndexSelected() {
      if (this.indexFilter) {
        const array = this.headerIndexSelected;
        const mapped = array.map(ele => {
          if (ele.value !== "manager") {
            const obj = { ...ele };
            const find = this.getDefinations.find(el => el.topic === ele.text);
            obj["subTopic"] = find.subTopic;
            return obj;
          } else {
            return ele;
          }
        });
        let newData = [];
        const newMapped = mapped.forEach(ele => {
          if (ele.value !== "manager") {
            const arr = this.getData.filter(el =>
              JSON.stringify(el).includes(ele.subTopic)
            );
            newData = [...newData, ...arr];
          }
        });
        const obj = {};
        this.getData.forEach(ele => {
          obj[ele.manager] = ele.manager;
        });
        const computedData = Object.keys(obj).map(el => {
          const newObj = {};
          const array = newData.filter(ele => ele.manager === el);
          array.forEach(ele => {
            newObj.manager = ele.manager;
            const ob = mapped.find(el => el.subTopic === ele.parameter);
            newObj[ob.text] = ele.score;
          });
          return newObj;
        });
        const objAggregate = {};
        computedData.forEach(ele => {
          Object.keys(ele).forEach(element => {
            objAggregate[element] =
              parseInt(objAggregate[element] ? objAggregate[element] : 0) +
              parseInt(ele[element]);
          });
        });
        Object.keys(objAggregate).forEach(ele => {
          if (ele !== "manager") {
            objAggregate[ele] = objAggregate[ele] / computedData.length;
          }
        });
        objAggregate.manager = "Aggregate";
        return [...computedData, objAggregate];
      } else return [];
    },
    itemsListOfTopicSelecedOrNothingSeleced() {
      if (this.indexFilter && this.topicsFilter) {
        const obj = {};
        this.headerTopicSelect.forEach(element => {
          if (element.value !== "manager") {
            obj[element.text] = this.getData.filter(
              ele => ele.parameter === element.text
            );
          }
        });
        let array = [];
        Object.keys(obj).forEach(ele => {
          const arrr = obj[ele].map(el => {
            const newObj = {};
            newObj.manager = el.manager;
            newObj[el.parameter.toLowerCase()] = el.score;
            return newObj;
          });
          array = arrr;
        });
        const objAggregate = {};
        array.forEach(ele => {
          Object.keys(ele).forEach(element => {
            objAggregate[element] =
              parseInt(objAggregate[element] ? objAggregate[element] : 0) +
              parseInt(ele[element]);
          });
        });
        Object.keys(objAggregate).forEach(ele => {
          if (ele !== "manager") {
            objAggregate[ele] = objAggregate[ele] / array.length;
          }
        });
        objAggregate.manager = "Aggregate";
        return [...array, objAggregate];
      } else {
        const obj = {};
        this.getData.forEach(ele => {
          if (!obj[ele.manager]) {
            obj[ele.manager] = ele.manager;
          }
        });
        const array = Object.keys(obj).map(ele => {
          const filtered = this.getData.filter(
            element => element.manager === ele
          );
          return filtered;
        });
        const newArray = array.map(ele => {
          const object = {};
          ele.forEach(element => {
            object[element.parameter.toLowerCase()] = element.score;
            if (!object.manager) {
              object.manager = element.manager;
            }
          });
          return object;
        });
        const objAggregate = {};
        newArray.forEach(ele => {
          Object.keys(ele).forEach(element => {
            objAggregate[element] =
              parseInt(objAggregate[element] ? objAggregate[element] : 0) +
              parseInt(ele[element]);
          });
        });
        Object.keys(objAggregate).forEach(ele => {
          if (ele !== "manager") {
            objAggregate[ele] = objAggregate[ele] / newArray.length;
          }
        });
        objAggregate.manager = "Agrregate";
        return [...newArray, objAggregate];
      }
    }
  },
  mounted() {
    this.fetchManagerData();
  },
  methods: {
    ...mapActions({
      fetchManagerData: "managerData/fetchManagerData"
    })
  }
};
</script>
