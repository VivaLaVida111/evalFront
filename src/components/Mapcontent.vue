<template>
  

  <div class="content-mid">
    <h5
      class="card-title"
      style="font-size: 22px; padding: 5px; text-align: center"
    >
      <li style="font-size: 22px; padding: 5px">
        金牛区垃圾数据：垃圾净重{{ total_jinniu.toFixed(2) }}吨
      </li>
      <li>红星垃圾站今日数据：垃圾净重{{ total_hongxing.toFixed(2) }}吨</li>
      <li>西华垃圾站今日数据：垃圾净重{{ total_xihua.toFixed(2) }}吨</li>
      <li>垃圾渗滤液今日流量：{{ today_flow.toFixed(2) }}方</li>
      <li>
        垃圾渗滤液本月累计流量：{{ Number(cumulative_flow).toFixed(2) }}方
      </li>
    </h5>
  </div>
  
</template>

<script setup>
import { reactive, ref, onBeforeMount } from "vue";
import { ScrollBoard, DigitalFlop } from "@kjgl77/datav-vue3";
import { BorderBox6 as DvBorderBox6 } from "@kjgl77/datav-vue3";
import { BorderBox7 as DvBorderBox7 } from "@kjgl77/datav-vue3";
import { getPage, getQuery} from "@/api/content.js";
import moment from "moment";
import axios from "axios";

import Charts from "@jiaminghi/charts";
var time = new Date().getTime();

const today =
  new Date().getFullYear() +
  "-" +
  (new Date().getMonth() + 1) +
  "-" +
  new Date().getDate();
const tomorrow =
  new Date(time + 1 * 24 * 60 * 60 * 1000).getFullYear() +
  "-" +
  (new Date(time + 1 * 24 * 60 * 60 * 1000).getMonth() + 1) +
  "-" +
  new Date(time + 1 * 24 * 60 * 60 * 1000).getDate();
const total_hongxing = ref(0);
const total_xihua = ref(0);
const total_jinniu = ref(0);
const yAxis_hongxing = ref([0, 0, 0, 0, 0, 0]);
const yAxis_xihua = ref([0, 0, 0, 0, 0, 0]);
const total_jinniu_fixed = ref("");
const key_map = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
];
let test = [1, 2, 2, 4, 5, 6];
var period_total = 0;
var current = 0;

const period_data = reactive({
  zero_four: 0,
  four_eight: 0,
  eight_twelve: 0,
  twelve_sixteen: 0,
  sixteen_twenty: 0,
  twenty_zero: 0,
});
const period_data_xihua = reactive({
  zero_four: 0,
  four_eight: 0,
  eight_twelve: 0,
  twelve_sixteen: 0,
  sixteen_twenty: 0,
  twenty_zero: 0,
});
yAxis_hongxing.value.splice(0, yAxis_hongxing.length);
yAxis_xihua.value.splice(0, yAxis_xihua.length);

var scroll_data_szcg_all = [];
// function refreshData() {
//   total_jinniu.value = 0;
  
//   getQuery("红星", "transporter", today, tomorrow, 1, 10000).then(function (
//     resp
//   ) {
   
//     total_hongxing.value = 0;
//     for (let i = 0; i < resp.length; i++) {
//       total_hongxing.value = resp[i].netWeight + total_hongxing.value;
//     }
//     total_hongxing.value =
//       Math.floor((total_hongxing.value / 1000) * 100) / 100;
//     total_jinniu.value = total_hongxing.value + total_jinniu.value;
//   });
//   getQuery("西华", "transporter", today, tomorrow, 1, 10000).then(function (
//     resp
//   ) {
//     total_xihua.value = 0;
//     for (let i = 0; i < resp.length; i++) {
//       total_xihua.value = resp[i].netWeight + total_xihua.value;
//     }
//     total_xihua.value = Math.floor((total_xihua.value / 1000) * 100) / 100;
//     total_jinniu.value = total_xihua.value + total_jinniu.value;

//     total_jinniu.value = Math.floor(total_jinniu.value * 100) / 100;
//   });
// }
// setInterval(refreshData, 60000);

// ===========================================================================渗透液流量统计
const today_flow = ref(0);
const cumulative_flow = ref(0);
// const getCarWarning = () => {
//   axios({
//     url: "http://101.37.246.72:8084/shenlvye/getRecord",
//     method: "get",
//   }).then(function (resp) {
//     if (resp.status == 200) {
//       var data = resp.data.data;
//       // console.log("resp.message:" + resp.data.message)
//       //  carData.value = data;
//       today_flow.value = data.今日流量;
//       Cumulative_flow.value = data.累计流量;
//       console.log("today_flow:" + today_flow);
//     }
//   });
// };
// setInterval(getCarWarning, 60000)

const getSiteNameList = (pageNum, start, end, pageSize) => {
  axios({
    url:
      "/OsmoticFluid/shenlvye/getPeriodRecordByPage?pageNum=" +
      pageNum +
      "&start=" +
      start +
      "&end=" +
      end +
      "&pageSize=" +
      pageSize,
    method: "get",
  }).then(function (resp) {
    if (resp.status == 200) {
      var data = resp.data.data.records;

      console.log("data:" + data.length);

      var total = 0;

        total = total + today_flow.value;
 
      console.log("total:" + total);
      for (var key in data) {
        console.log("data[key].flow:" + data[key].flow);
        total = total + Number(data[key].flow);
      }
      cumulative_flow.value = Number(total);
    }
  });
};
// ==================================================================================

onBeforeMount(() => {
  //   getFlows().then(function (resp) {
  //   // var data = resp.data.data;
  //   // console.log("resp.message:" + resp.data.message)
  //   //  carData.value = data;
  //   today_flow.value = resp.今日流量;
  //   // cumulative_flow.value = resp.累计流量;
  //   console.log("today_flow:" + resp.今日流量);
  // });
   axios({
    url: "/OsmoticFluid/shenlvye/getRecord",
    method: "get",
  }).then(function (resp) {
    if (resp.status == 200) {
      var data = resp.data.data;
      today_flow.value = data.今日流量;
     console.log("today_flow:" + resp.今日流量);
    }
  });
  var start = moment().startOf("month").format("YYYY-MM-DD");
  var end = moment().format("YYYY-MM-DD");

  console.log("end:" + end);
  //统计一个月的总量
  getSiteNameList(1, start + "T23:59:00", end + "T23:59:00", 1000);



 
  getQuery("红星", "transporter", today, tomorrow, 1, 10000).then(function (
    resp
  ) {
    total_hongxing.value = 0;
    for (let i = 0; i < resp.length; i++) {
      total_hongxing.value = resp[i].netWeight + total_hongxing.value;
    }
    total_hongxing.value =
      Math.floor((total_hongxing.value / 1000) * 100) / 100;
    total_jinniu.value = total_hongxing.value + total_jinniu.value;
  });
  getQuery("西华", "transporter", today, tomorrow, 1, 10000).then(function (
    resp
  ) {
    total_xihua.value = 0;
    for (let i = 0; i < resp.length; i++) {
      total_xihua.value = resp[i].netWeight + total_xihua.value;
    }
    total_xihua.value = Math.floor((total_xihua.value / 1000) * 100) / 100;
    total_jinniu.value = total_xihua.value + total_jinniu.value;

    total_jinniu.value = Math.floor(total_jinniu.value * 100) / 100;
    total_jinniu_fixed.value = total_jinniu.value.toFixed(2);
  });
 
});

const config_ggzp = reactive({
  data: [],
  colors: ["#e062ae", "#fb7293", "#e690d1", "#32c5e9", "#96bfff"],
  unit: "店铺",
});

const config_xzzf = reactive({
  data: [],
  colors: ["#e062ae", "#fb7293", "#e690d1", "#32c5e9", "#96bfff"],
  unit: "案件",
});
const config_hongxing = reactive({
  title: {
    text: "",
  },
  xAxis: {
    name: "时间段",
    data: [
      "0点-4点",
      "4点-8点",
      "8点-12点",
      "12点-16点",
      "16点-20点",
      "20点-24点",
    ],
    axisLabel: {
      style: {
        fontSize: 16,
        fill: "#FFFFFF",
      },
    },
    axisTick: {
      style: {
        fontSize: 16,
        fill: "#FFFFFF",
      },
    },
    nameTextStyle: {
      fontSize: 16,
      fill: "#FFFFFF",
    },
  },
  yAxis: {
    name: "垃圾净重/吨",
    data: "value",
    min: 0,
    interval: 100,
    axisLabel: {
      style: {
        textBaseline: "top",
        fontSize: 15,
        fill: "#FFFFFF",
      },
    },
    nameTextStyle: {
      fontSize: 16,
      fill: "#FFFFFF",
    },
  },
  series: [
    {
      data: yAxis_hongxing,
      type: "line",
      label: {
        show: true,
        formatter: "{value} 吨",
        style: {
          fill: "#FFFFFF",
        },
      },
    },
  ],
});
const config_xihua = reactive({
  title: {
    text: "",
  },
  xAxis: {
    name: "时间段",
    data: [
      "0点-4点",
      "4点-8点",
      "8点-12点",
      "12点-16点",
      "16点-20点",
      "20点-24点",
    ],
    axisLabel: {
      style: {
        fontSize: 16,
        fill: "#FFFFFF",
      },
    },
    axisTick: {
      style: {
        fontSize: 16,
        fill: "#FFFFFF",
      },
    },
    nameTextStyle: {
      fontSize: 16,
      fill: "#FFFFFF",
    },
  },
  yAxis: {
    name: "垃圾净重/吨",
    data: "value",
    min: 0,
    interval: 50,
    axisLabel: {
      style: {
        textBaseline: "top",
        fontSize: 15,
        fill: "#FFFFFF",
      },
    },
    nameTextStyle: {
      fontSize: 16,
      fill: "#FFFFFF",
    },
  },
  series: [
    {
      data: yAxis_xihua,
      type: "line",
      label: {
        show: true,
        formatter: "{value} 吨",
        style: {
          fill: "#FFFFFF",
        },
      },
    },
  ],
});
</script>

<style scoped>
/* .content {
    position: absolute;
    top: 7vh;

    display: flex;
    z-index: 20;
} */

.content-l {
  left: 0;

  width: 25vw;
  padding: 3vh;
  display: flex;
  flex-direction: column;
  height: 80vh;
  position: absolute;
  z-index: 20;
  user-select: none;
  color: white;
  background-color: #000000;
}

.content-l-top {
  height: 150px;
}

/* .content-mid {
  width: 100%;
  height: 12vh;
  background-color: black;
  position: absolute;
  z-index: 20;
  display: flex;
  flex-flow: wrap;
  user-select: none;
  opacity: 1;
  color: white;
  margin: auto;
} */
.card-title {
  width: 50%;
  margin: auto;
}

.content-r {
  right: 0;
  width: 25vw;
  /* background-color: rgba(0, 11, 61, 0.5); */
  background-color: #000000;
  padding-left: 3vh;
  padding-top: 3vh;
  padding-bottom: 3vh;
  padding-right: 1vh;
  display: flex;
  flex-direction: column;
  height: 80vh;
  position: absolute;
  z-index: 20;
  user-select: none;
  opacity: 1;
  color: white;
}

:deep(.DigitalFlop) {
  width: 25vw;
}

/* ===========================sunny */
.chart {
  height: 100px;
  width: 50px;
  background: burlywood;
}

li {
  list-style-type: none;
}
/* ============================ */
</style>
