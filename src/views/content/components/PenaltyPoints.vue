<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        扣分事件查询
      </h5>
    </el-header>
    <el-main>
      <!-- <el-select
          v-model="site_name_select_way"
          class="m-2"
          placeholder="选择街道"
          @change="changeDate"
          clearable
          size="large"
        >
          <el-option
            v-for="item in street_name_option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
      <el-date-picker
        v-model="changeValue"
        type="daterange"
        unlink-panels
        range-separator="到"
        start-placeholder="选择开始时间"
        end-placeholder="选择结束时间"
        :disabled-date="disabledDate"
        @change="changeDate"
        size="large"
        style="margin: 0.5rem 0 0.5rem"
      />
      <router-view :key="$route.fullPath">
        <el-table
          :data="detailsList"
          style="width: 100%"
          size="large"
          class="data-table"
        >
          <el-table-column
            prop="street"
            label="街道"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="big_rules"
            label="大项规则"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="big_rules_percentage"
            label="大项占比"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="small_rules"
            label="小项规则"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="small_rules_percentage"
            label="小项占比"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="subtotal"
            label="小计"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="time"
            label="时间"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
        </el-table>
      </router-view>
      <div class="float-end">
        <el-pagination
          background
          layout="->,total, prev, pager, next, jumper"
          :total="totalRecords"
          :current-page="currentPage"
          :page-size="8"
          @current-change="getTransport"
        />
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
// ==========================================================================================================sunny
import { ref, reactive, computed, watch } from "vue";
//===============================================================================================================
import axios from "axios";
import moment from "moment";
import getDetails from "@/api/content.js";
import { defineProps } from "vue";
import { params } from "@/store/store.js";

// ==========================================================================================================sunny
// const props = defineProps({
// street: String
// });

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
const route = useRoute();
const street = computed(() => {
  return isEmptyObject(route.query) ? "" : route.query.street;
});

let totalRecords = ref(1000);
let currentPage = ref(1);
// 禁选今天以后的日期以及没有数据的
const disabledDate = (time) => {
  return (
    time.getTime() < new Date("2022-03-12").getTime() ||
    time.getTime() > new Date().getTime()
  );
};
const queryCarNum = ref("");
const querySitename = ref("");
let site_name_select_way = ref("所有站点");

const street_name_option = [
  {
    value: "街道1",
    label: "街道1",
  },
  {
    value: "街道2",
    label: "街道2",
  },
  {
    value: "街道3",
    label: "街道3",
  },
  {
    value: "街道4",
    label: "街道4",
  },
  {
    value: "街道5",
    label: "街道5",
  },
  {
    value: "街道6",
    label: "街道6",
  },
  {
    value: "街道7",
    label: "街道7",
  },
  {
    value: "街道8",
    label: "街道8",
  },
  {
    value: "街道9",
    label: "街道9",
  },
  {
    value: "街道10",
    label: "街道10",
  },
  {
    value: "街道11",
    label: "街道11",
  },
  {
    value: "街道12",
    label: "街道12",
  },
  {
    value: "街道13",
    label: "街道13",
  },
];

//=============================================================

const transport_today =
  new Date().getFullYear() +
  "-" +
  (new Date().getMonth() + 1) +
  "-" +
  new Date().getDate();
var transport_start = transport_today;
console.log("transport_start" + transport_start);

const data_total = reactive([]);

const today = moment().format("YYYY-MM-DD");
const firstDayOfMonth = moment().startOf("month").format("YYYY-MM-DD");
let changeValue = ref([firstDayOfMonth, today]);
const detailsList = reactive([]);
function changeDate() {
  var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + "T00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + "T23:59:59";
  console.log(333, end);

  // end =  new Date();
  getPenaltyPoints(start, end, 1);
}

const getPenaltyPoints = (startTime, endTime, pageNum) => {
  var URL = "/api/details/period/";
  if (street.value === "") {
    URL += startTime + "/" + endTime + "/" + pageNum + "/8";
  } else {
    URL += startTime + "/" + endTime + "/" + pageNum + "/8" + "?street=" + street.value;
  }
  //console.log("URL: ", URL);
  axios({
    url: URL,
    method: "get",
    headers: {
              Authorization: "Bearer" + params.token,
              "Content-Type": " application/json",
            },
  }).then(function (resp) {
    var result = resp.data.data;
    console.log("getPenaltyPoints: ", result);
    detailsList.splice(0, detailsList.length);
    var data = result.records;
    for (var key in data) {
      var detail = null;
      if (data[key].id === null) {
        var detail = {
          big_rules: null,
          big_rules_percentage: null,
          small_rules: null,
          small_rules_percentage: null,
          subtotal: data[key].subtotal,
          time: null,
        };
      } else {
        var detail = {
          street: data[key].street,
          big_rules: data[key].bigRules.item,
          big_rules_percentage: data[key].bigRules.percentage,
          small_rules: data[key].smallRules.item,
          small_rules_percentage: data[key].smallRules.percentage,
          subtotal: data[key].subtotal,
          time: data[key].time,
        };
      }
      detailsList.push(detail);
    }
    totalRecords.value = result.total;
    currentPage.value = pageNum;
  });
};

changeDate();
watch(route, (to, from) => {
  // When route changes, execute logic, e.g., reload data
  changeDate();
});

const getTransport = (pageNum) => {
  // 当前页
  //currentPage.value = pageNum;
  var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + "T00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + "T23:59:59";
  getPenaltyPoints(start, end, pageNum);
};

function upDateList() {
  var time = new Date().getTime();
  // 获取当前时间，转化时间戳为正常格式
  var end =
    new Date().getHours().toString().padStart(2, 0) +
    ":" +
    new Date().getMinutes().toString().padStart(2, 0) +
    ":" +
    new Date().getSeconds().toString().padStart(2, 0);

  var start =
    new Date(time - 4 * 60 * 60 * 1000).getHours().toString().padStart(2, 0) +
    ":" +
    new Date(time - 4 * 60 * 60 * 1000).getMinutes().toString().padStart(2, 0) +
    ":" +
    new Date(time - 4 * 60 * 60 * 1000).getSeconds().toString().padStart(2, 0);

  if (queryCarNum.value == "" || queryCarNum.value == "全部") {
    // getCarWarning(start, end, 1, 10000);
  } else {
    searchCarWarning(queryCarNum.value, start, end);
  }
  // getLessCarWarning(start, end, 1, 10000);
}

upDateList();
// 每隔一分钟更新一次
setInterval(upDateList, 60000);
</script>
<style></style>
