<template>
  <div>
    <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
      扬尘治理实效
    </h5>
    <div ref="horizontal_bar1" style="width: 100%; height: 400px;"></div>
    <div ref="pie_chart" style="width: 100%; height: 300px;"></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import * as echarts from 'echarts';
import moment from "moment";
import { params } from "@/store/store.js";
import {getStreetStatistics,getDetailRules,getSmallRulesStatistics} from "@/api/content.js";


//获取所有大规则信息
const detailRules = ref([]);  
const rule_map = ["环境卫生","市容秩序","广告招牌","扬尘治理","固体废弃物处置及垃圾分类","数字化常态监管","网络理政","油烟治理","违法建设"];
const getDetailRules_fun = async () => {
  const data = await getDetailRules();
  detailRules.value = data;
};
//获取当前时间
var start = moment().startOf("month").format("YYYY-MM-DD");
var end = moment().add(1, 'days').format("YYYY-MM-DD");

//获取成效分析数据
const scoresList = reactive([]);
const streetsList = reactive([]);
const get_cxfx_Scores = async(startTime, endTime) => {
    // await getDetailRules_fun();
    // const role_id = detailRules.value[rule_map.indexOf(params.role)].bigRules.id;
    const data = await getStreetStatistics(startTime, endTime, 8);
    // console.log("Retrieved scores data:", data);
    
    scoresList.splice(0, scoresList.length);
    streetsList.splice(0, streetsList.length);
    
    for (var key in data) {
      scoresList.push(data[key].score);
      streetsList.push(data[key].street);
    }
};
//获取薄弱环节分析数据
const smallRulesStatistics = reactive([]);
const get_brhj_Scores = async(startTime, endTime) => {
  // await getDetailRules_fun();
  // const role_id = detailRules.value[rule_map.indexOf(params.role)].bigRules.id;
  const data = await getSmallRulesStatistics(startTime, endTime, 8); 
  smallRulesStatistics.splice(0, smallRulesStatistics.length);
  for (var key in data) {
    smallRulesStatistics.push(data[key]);
  }
};

//定义表配置
const horizontalOpt = {
  title: {
    text: "金牛区扬尘整治成效分析",
    left: "center",
    top: "0%",
    textStyle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
    },
  },
  xAxis: {
    max: "dataMax",
    // 关闭x轴动画
    animation: false
  },
  yAxis: {
    type: "category",
    data: streetsList,
    inverse: true,
    // 关闭动画
    animationDuration: 0,
    animationDurationUpdate: 0,
    max: 13
  },
  series: [
    {
      realtimeSort: false, // 关闭实时排序动画
      name: "街道",
      type: "bar",
      data: scoresList,
      label: {
        show: true,
        position: "right",
        valueAnimation: false // 关闭标签值的动画
      },
    },
  ],
  legend: {
    top: '5%',
    show: true,
  },
  grid: {
    left: "15%",
  },
  // 关闭所有动画
  animation: false,
  animationDuration: 0,
  animationDurationUpdate: 0,
  animationEasing: "linear",
  animationEasingUpdate: "linear",
};
//定义饼状图配置
const pieOpt = {
  title: {
    text: "金牛区扬尘整治薄弱环节分析",
    left: "center",
    top: "0%",
    textStyle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
    },
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    orient: "vertical",
    left: "left",
    textStyle: {
      color: "#333",
    },
  },
  series: [
    {
      type: "pie",
      radius: "100%",
      top: "10%",
      center: ["50%", "50%"], 
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
};
//创建表
const horizontal_bar1 = ref(null);
let horizontalBar = null;
const create_horizontal_bar = async () => {
  try {
    horizontalBar = echarts.init(horizontal_bar1.value);
    
    await get_cxfx_Scores(start, end);
    
    //根据分数排序数据（从高到低排序）
    const combinedData = streetsList.map((street, index) => ({
      street: street,
      score: scoresList[index]
    }));
    //倒序排序
    combinedData.sort((a, b) => b.score - a.score); 
    //重新提取排序后的数据
    const sortedStreets = combinedData.map(item => item.street);
    const sortedScores = combinedData.map(item => item.score);
    
    horizontalOpt.yAxis.data = sortedStreets;
    horizontalOpt.series[0].data = sortedScores; 
    
    horizontalBar.setOption(horizontalOpt);
    window.addEventListener("resize", horizontalBar.resize);
  } catch (error) {
    console.error("Failed to create horizontal bar chart:", error);
  }
};
//创建饼状图
const pie_chart = ref(null);
let pieChart = null;
const create_PieChart = async() => {
  try{
    pieChart = echarts.init(pie_chart.value);
    await get_brhj_Scores(start, end);
    pieOpt.series[0].data = smallRulesStatistics.map((item) => ({
      name: item.item,
      value: Math.abs(item.score),
    }));
    pieChart.setOption(pieOpt);
    window.addEventListener("resize", pieChart.resize);
  }catch (error) {
    console.error("Failed to create pie chart:", error);
  }
};

//挂载完成后,创建图表
onMounted(() => {
  create_horizontal_bar();
  create_PieChart();
});
</script>

<style>

</style>