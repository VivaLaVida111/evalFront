<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        告警事件历史查询
      </h5>
    </el-header>
    <el-main>
      <el-select
        v-model="site_name_select_way"
        class="m-2"
        placeholder="选择站点"
        @change="changeDate"
        clearable
        size="large"
      >
        <el-option
          v-for="item in site_name_option"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-date-picker
        v-model="changeValue"
        type="daterange"
        unlink-panels
        range-separator="到"
        start-placeholder="选择开始时间"
        end-placeholder="选择结束时间"
        :disabled-date="disabledDate"
        :shortcuts="shortcuts"
        @change="changeDate"
        size="large"
        style="margin: 0.5rem 0 0.5rem"
      />

      <el-table
        :data="EventHistoryList.slice((currentPage - 1) * 8, currentPage * 8)"
        style="width: 100%"
        size="large"
        class="data-table"
      >
        <el-table-column
          prop="event_id"
          label="事件编号"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          prop="event_source"
          label="事件来源"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          prop="event_cause"
          label="事件详情"
          min-width="450"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          prop="event_time"
          label="发生时间"
          min-width="250"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          prop="event_duration"
          label="事件持续时长"
          min-width="250"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
      </el-table>
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
import { ref, reactive } from "vue";
//===============================================================================================================
import axios from "axios";
import moment from "moment";

// ==========================================================================================================sunny

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

const site_name_option = [
    {
    value: "所有站点",
    label: "所有站点",
  },
      {
    value: "大站",
    label: "大站",
  },
  {
    value: "红星",
    label: "红星",
  },
  {
    value: "西华",
    label: "西华",
  },
    {
    value: "小站",
    label: "小站",
  },
    {
    value: "红花堰",
    label: "红花堰",
  },
  {
    value: "五块石",
    label: "五块石",
  },
    {
    value: "五里墩",
    label: "五里墩",
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

const today = moment().format("YYYY-MM-DD")
let changeValue = ref(["2023-03-12", today]);
const EventHistoryList = reactive([]);
function changeDate() {

    var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + " 00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + " 23:59:59";
  
  console.log(333,end)
  
  // end =  new Date();
  queryAllWarning(start, end, 1);
}
const queryAllWarning = (startTime, endTime, pageNum) => {
  
 
  console.log(222, site_name_select_way.value)
  axios({
    url: "/api/event-query/getAllWarning",
    method: "post",
    data: {
      startTime: startTime,
      endTime: endTime,
      site_name: site_name_select_way.value
    },
  }).then(function (resp) {
    // console.log(222,"Bearer"+params.token);
    var data = resp.data.data;
    EventHistoryList.splice(0, EventHistoryList.length);
    // console.log(111, resp.data.data);
    for (var key in data) {
      var default_site = {
        event_source: data[key].eventSource,
        event_cause: data[key].eventCause,
        event_id: data[key].id,
        event_time: data[key].eventTime,
        event_duration: data[key].issueDuration,
      };
      EventHistoryList.push(default_site);
    }
    totalRecords.value = EventHistoryList.length;
    // pageCount = parseInt(EventHistoryList.length) % 5;
    currentPage.value = pageNum;
  });
};
queryAllWarning("", "", 1);
const getTransport = (pageNum) => {
  // 当前页
  currentPage.value = pageNum;
};

const searchCarWarning = (carNumber, start, end) => {
  axios({
    url: "/api/dump-record/car_data/" + carNumber + "/" + start + "/" + end,

    method: "get",
  }).then(function (resp) {
    if (resp.status == 200) {
      var data = resp.data.data;
      data_total.splice(0, data_total.length);

      for (var car in data) {
        if (querySitename.value == data[car].siteName) {
          if (carNumber == data[car].carNumber) {
            if (data[car].todayAmount == null) {
              data[car].todayAmount = 0;
            }
            if (data[car].todayAmount > data[car].predictAmount * 1.2) {
              console.log("高于预测值20%");
              var currentCar = {
                status: "高于预测值20%",
                day: start + " 至 " + end,
                siteName: data[car].siteName,
                carNumber: data[car].carNumber,
                todayAmount: data[car].todayAmount,
                predictAmount: data[car].predictAmount,
              };
            }
            if (data[car].todayAmount < data[car].predictAmount * 0.8) {
              console.log("低于预测值20%");
              var currentCar = {
                status: "低于预测值20%",
                day: start + " 至 " + end,
                siteName: data[car].siteName,
                carNumber: data[car].carNumber,
                todayAmount: data[car].todayAmount,
                predictAmount: data[car].predictAmount,
              };
            }
            if (
              data[car].todayAmount >= data[car].predictAmount * 0.8 &&
              data[car].todayAmount <= data[car].predictAmount * 1.2
            ) {
              var currentCar = {
                status: "正常",
                day: start + " 至 " + end,
                siteName: data[car].siteName,
                carNumber: data[car].carNumber,
                todayAmount: data[car].todayAmount,
                predictAmount: data[car].predictAmount,
              };
            }
          }
          data_total.push(currentCar);
        }
      }

      console.log("数据长度：" + data.length);
      totalRecords.value = data_total.length;
      pageCount = parseInt(data_total.length) % 10;
      currentPage.value = pageNum;
    }
  });
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
