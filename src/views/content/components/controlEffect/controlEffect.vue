<template>
  <div>
    <!-- 动态标题 -->
    <h5 class="card-title" style="font-size: 30px; padding: 5px;">
      {{ roleName }}治理实效
    </h5>

    <!-- 柱状图 -->
    <div ref="barRef" style="width:100%;height:400px;margin-bottom:80px;"></div>

    <!-- 街道选择 + 饼图 -->
    <div style="display:flex;align-items:center;gap:12px;margin:6px 0 8px;">
      <span style="color:#666;">选择街道：</span>
      <el-select
          v-model="selectedStreet"
          placeholder="选择街道"
          clearable
          style="width:240px"
      >
        <el-option
            v-for="s in streetList"
            :key="s"
            :value="s"
            :label="s"
        />
      </el-select>
    </div>

    <div ref="pieRef" style="width:100%;height:300px;"></div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, nextTick,watch } from "vue";
import * as echarts from "echarts";
import { buildRoleRows } from "@/views/content/components/roleScoreConfig";

// =====================================================
// 1. 基本绑定属性
// =====================================================
const props = defineProps({
  bigRulesId: { type: Number, required: true },
});

const MODULE_TITLE_MAP = {
  3: "环境卫生",
  4: "市容秩序",
  6: "广告招牌",
  8: "扬尘治理",
  17: "数字城管",
  18: "网络理政",
  19: "油烟治理",
  27: "违法建设",
  28: "共享单车",
};

const roleName = computed(() => MODULE_TITLE_MAP[props.bigRulesId] || "");

// =====================================================
// 2. buildRoleRows 数据读取
// =====================================================
import {
  envChecks,
  streetStatics,
  signDoorRaw,
  cityOrderShop,
  oilSootPatrol,
  bikeTzPatrol,
  inspectionRecordsMap
} from "@/views/content/components/roleScoreConfig";

const tableCfg = computed(() => {
  const name = roleName.value;
  if (!name) return null;

  // 🚀 关键：强制让 computed 感知这些数据变化
  envChecks.value;
  streetStatics.value;
  signDoorRaw.value;
  cityOrderShop.value;
  oilSootPatrol.value;
  bikeTzPatrol.value;
  inspectionRecordsMap.value;

  return buildRoleRows(name);
});

const isReady = computed(() => {
  return tableCfg.value && tableCfg.value.rows && tableCfg.value.rows.length > 0;
});

// 街道列表
const streetList = computed(() => {
  if (!isReady.value) return [];
  return tableCfg.value.rows.map((r) => r.street).filter(Boolean);
});

// 默认街道
const selectedStreet = ref("");

// =====================================================
// 3. 图表实例
// =====================================================
const barRef = ref(null);
const pieRef = ref(null);

let barChart = null;
let pieChart = null;

function initBarChart() {
  if (!barChart && barRef.value) {
    barChart = echarts.init(barRef.value);
    window.addEventListener("resize", () => barChart.resize());
  }
}

function initPieChart() {
  if (!pieChart && pieRef.value) {
    pieChart = echarts.init(pieRef.value);
    window.addEventListener("resize", () => pieChart.resize());
  }
}

// =====================================================
// 4. 绘制柱状图
// =====================================================
function renderBarChart() {
  const rows = tableCfg.value.rows;
  const combined = rows
      .map((r) => ({
        street: r.street,
        score: Number(r.total ?? 0) || 0,
      }))
      .sort((a, b) => b.score - a.score);

  const yData = combined.map((x) => x.street);
  const dData = combined.map((x) => x.score);

  const opt = {
    title: {
      text: "金牛区治理成效分析",
      left: "center",
      top: "0%",
      textStyle: { fontSize: 20, fontWeight: "bold", color: "#333" },
    },
    xAxis: { max: "dataMax" },
    yAxis: { type: "category", data: yData, inverse: true },
    series: [
      {
        type: "bar",
        data: dData,
        label: { show: true, position: "right" },
      },
    ],
    grid: { left: "15%" },
  };

  barChart.setOption(opt, true);
}
watch(selectedStreet, async () => {
  await nextTick();
  if (!pieChart) initPieChart();
  renderPieChart();
});
// =====================================================
// 5. 小项扣分配置
// =====================================================
const PIE_ITEMS_BY_ROLE = {
  扬尘治理: [
    { key: "sj_found", label: "市级巡查-发现问题", full: 10 },
    { key: "sj_unrect", label: "市级巡查-未整改等", full: 10 },
    { key: "qj_found", label: "区级巡查-发现问题", full: 15 },
    { key: "qj_unrect", label: "区级巡查-未整改等", full: 15 },
    { key: "jd_unpatrol", label: "街道自查-未按期巡查", full: 35 },
    { key: "aj_score", label: "案件办理", full: 5 },
    { key: "qt_score", label: "其他", full: 10 },
  ],
  违法建设: [
    { key: "ts_score", label: "投诉数量", full: 30 },
    { key: "rpt_score", label: "重复投诉点位", full: 20 },
    { key: "remove_score", label: "违建拆除", full: 20 },
    { key: "case_score", label: "案件办理", full: 10 },
    { key: "other_score", label: "其他", full: 20 },
  ],
  广告招牌: [
    { key: "sign_score", label: "招牌审批受理量", full: 30 },
    { key: "rep_score", label: "重复投诉点位", full: 10 },
    { key: "city_found", label: "区级巡查-发现问题", full: 10 },
    { key: "city_unrect", label: "区级巡查-未整改等", full: 10 },
    { key: "self_score", label: "街道自查", full: 30 },
    { key: "other_score", label: "其他", full: 10 },
  ],
  油烟治理: [
    { key: "ts_score", label: "网上投诉得分", full: 30 },
    { key: "rpt_score", label: "重复投诉点位", full: 10 },
    { key: "zd_score", label: "重点巡查", full: 20 },
    { key: "jd_score", label: "街道自查", full: 25 },
    { key: "case_score", label: "案件办理", full: 5 },
    { key: "qt_score", label: "其他", full: 10 },
  ],
  市容秩序: [
    { key: "dd_clock", label: "打卡情况", full: 15 },
    { key: "dd_onguard", label: "严管街在岗情况", full: 15 },
    { key: "fj_score", label: "队伍风纪检查", full: 20 },
    { key: "rc_shop", label: "临街店铺巡查", full: 10 },
    { key: "rc_dispose", label: "问题发现处置", full: 10 },
    { key: "rpt5_score", label: "重复投诉点位", full: 20 },
    { key: "qt_score", label: "其他", full: 10 },
  ],
  网络理政: [
    { key: "sl_score", label: "受理量", full: 30 },
    { key: "sat_score", label: "满意度", full: 30 },
    { key: "period_score", label: "办理周期", full: 10 },
    { key: "rpt5_score", label: "重复投诉点位", full: 20 },
    { key: "over_score", label: "超期", full: 10 },
  ],
  环境卫生: [
    { key: "road_score", label: "道路清扫", full: 20 },
    { key: "clean_score", label: "环卫保洁", full: 20 },
    { key: "garbage_score", label: "垃圾收运", full: 20 },
    { key: "field_score", label: "实地检查", full: 20 },
    { key: "dispose_score", label: "问题处置率", full: 10 },
    { key: "other_score", label: "其他", full: 10 },
  ],
  共享单车: [
    { key: "zl_score", label: "单车总量监控", full: 30 },
    { key: "rc_p_score", label: "日常P点管理", full: 20 },
    { key: "zd_p_score", label: "重点点位P点管理", full: 30 },
    { key: "dead_score", label: "僵尸车", full: 10 },
    { key: "qt_score", label: "其他", full: 10 },
  ],
  数字城管: [
    { key: "daily_score", label: "日常处置率", full: 30 },
    { key: "ontime_score", label: "按期处置率", full: 20 },
    { key: "rework_score", label: "返工率", full: 20 },
    { key: "overdue_score", label: "超期待处置率", full: 20 },
    { key: "delay_score", label: "延期率", full: 10 },
  ],
};

// =====================================================
// 6. 绘制饼图
// =====================================================
function renderPieChart() {
  const name = roleName.value;
  const cfg = tableCfg.value;
  if (!name || !cfg || !selectedStreet.value) return;

  const row = cfg.rows.find((r) => r.street === selectedStreet.value);
  const items = PIE_ITEMS_BY_ROLE[name] || [];
  if (!row || items.length === 0) return;

  const pieData = items
      .map((it) => {
        const score = Number(row[it.key] ?? 0) || 0;
        const deduct = Math.max(0, it.full - score);
        return { name: it.label, value: deduct };
      })
      .filter((x) => x.value > 0);

  const total = pieData.reduce((s, x) => s + x.value, 0);
  const finalData = total > 0 ? pieData : [{ name: "无扣分", value: 1 }];

  const opt = {
    title: {
      text: `${selectedStreet.value}治理薄弱环节分析`,
      left: "center",
      top: "0%",
      textStyle: { fontSize: 20, fontWeight: "bold", color: "#333" },
    },
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        type: "pie",
        radius: "70%",
        center: ["50%", "55%"],
        data: finalData,
        label: { show: true, formatter: "{b}\n{c} 分（{d}%）" },
      },
    ],
  };

  pieChart.setOption(opt, true);
}

// =====================================================
// 7. 主动控制绘图（自动监听数据）
// =====================================================
watchEffect(async () => {
  if (!isReady.value) return;

  // 初始化图表（只会执行一次）
  await nextTick();
  initBarChart();
  initPieChart();

  // 如果未选街道，则自动选第一项
  if (!selectedStreet.value && streetList.value.length > 0) {
    selectedStreet.value = streetList.value[0];
  }

  renderBarChart();
  renderPieChart();
});

// 当切换街道时刷新饼图
watchEffect(() => {
  if (pieChart && selectedStreet.value) {
    renderPieChart();
  }
});

// =====================================================
</script>
<!--<template>-->
<!--  <div>-->
<!--    &lt;!&ndash; ✅ 动态标题 &ndash;&gt;-->
<!--    <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">-->
<!--      {{ roleName }}治理实效-->
<!--    </h5>-->

<!--    &lt;!&ndash; 原柱状图：完全不变 &ndash;&gt;-->
<!--    <div ref="horizontal_bar1" style="width: 100%; height: 400px; margin-bottom: 100px;"></div>-->

<!--    &lt;!&ndash; 仅对饼状图区域做改造：增加街道下拉 + 饼图容器 &ndash;&gt;-->
<!--    <div style="display:flex; align-items:center; gap:12px; margin: 6px 0 8px;">-->
<!--      <span style="color:#666;">选择街道：</span>-->
<!--      <el-select-->
<!--          v-model="selectedStreet"-->
<!--          placeholder="选择街道"-->
<!--          clearable-->
<!--          style="width: 240px"-->
<!--          @change="updatePieChart"-->
<!--      >-->
<!--        <el-option-->
<!--            v-for="s in streets"-->
<!--            :key="s"-->
<!--            :label="s"-->
<!--            :value="s"-->
<!--        />-->
<!--      </el-select>-->
<!--    </div>-->
<!--    <div ref="pie_chart" style="width: 100%; height: 300px;"></div>-->
<!--  </div>-->
<!--</template>-->
<!--<script setup>-->
<!--import { ref, onMounted, computed, watch } from "vue";-->
<!--import * as echarts from "echarts";-->
<!--import { buildRoleRows } from "@/views/content/components/roleScoreConfig";-->

<!--// =================== 基本属性 & 模块名 ===================-->

<!--const props = defineProps({-->
<!--  bigRulesId: {-->
<!--    type: Number,-->
<!--    required: true,-->
<!--  },-->
<!--});-->
<!--const bigRulesId = props.bigRulesId;-->

<!--const MODULE_TITLE_MAP = Object.freeze({-->
<!--  3: "环境卫生",-->
<!--  4: "市容秩序",-->
<!--  6: "广告招牌",-->
<!--  8: "扬尘治理",-->
<!--  17: "数字城管",-->
<!--  18: "网络理政",-->
<!--  19: "油烟治理",-->
<!--  27: "违法建设",-->
<!--  28: "共享单车",-->
<!--});-->

<!--const roleName = computed(() => MODULE_TITLE_MAP[bigRulesId] || "");-->

<!--// 直接用我们公共配置里的规则生成行数据（所有分数都在这里）-->
<!--const tableCfg = computed(() => {-->
<!--  const name = roleName.value;-->
<!--  console.log("[debug] roleName:", name);-->
<!--  if (!name) return null;-->
<!--  const cfg = buildRoleRows(name);-->
<!--  console.log("[debug] tableCfg from buildRoleRows:", cfg);-->
<!--  // console.log("[chart] tableCfg:", name, cfg);-->
<!--  return cfg;-->
<!--});-->

<!--// 所有街道列表（从表格行里提取）-->
<!--const streets = computed(() => {-->
<!--  const rows = tableCfg.value?.rows || [];-->
<!--  return rows.map((r) => r.street).filter(Boolean);-->
<!--});-->

<!--// =================== 柱状图：用 total 分 ===================-->
<!--const isDataLoaded = ref(false);-->


<!--const horizontalOpt = {-->
<!--  title: {-->
<!--    text: "金牛区治理成效分析",-->
<!--    left: "center",-->
<!--    top: "0%",-->
<!--    textStyle: {-->
<!--      fontSize: 20,-->
<!--      fontWeight: "bold",-->
<!--      color: "#333",-->
<!--    },-->
<!--  },-->
<!--  xAxis: {-->
<!--    max: "dataMax",-->
<!--    animation: false,-->
<!--  },-->
<!--  yAxis: {-->
<!--    type: "category",-->
<!--    data: [],-->
<!--    inverse: true,-->
<!--    animationDuration: 0,-->
<!--    animationDurationUpdate: 0,-->
<!--    max: 13,-->
<!--  },-->
<!--  series: [-->
<!--    {-->
<!--      realtimeSort: false,-->
<!--      name: "街道",-->
<!--      type: "bar",-->
<!--      data: [],-->
<!--      label: {-->
<!--        show: true,-->
<!--        position: "right",-->
<!--        valueAnimation: false,-->
<!--      },-->
<!--    },-->
<!--  ],-->
<!--  legend: {-->
<!--    top: "5%",-->
<!--    show: true,-->
<!--  },-->
<!--  grid: {-->
<!--    left: "15%",-->
<!--  },-->
<!--  animation: false,-->
<!--  animationDuration: 0,-->
<!--  animationDurationUpdate: 0,-->
<!--  animationEasing: "linear",-->
<!--  animationEasingUpdate: "linear",-->
<!--};-->

<!--const horizontal_bar1 = ref();-->
<!--let horizontalBar = null;-->

<!--const create_horizontal_bar = () => {-->
<!--  const cfg = tableCfg.value;-->
<!--  console.log("[debug] tableCfg1:", cfg);-->
<!--  if (!cfg || !horizontal_bar1.value || !cfg.rows || cfg.rows.length === 0) return;-->

<!--  ensureHorizontalChart();-->

<!--  const rows = cfg.rows || [];-->
<!--  console.log("[debug] rows:", rows);-->

<!--  // 按街道和得分排序-->
<!--  const combined = rows.map((row) => ({-->
<!--    street: row.street,-->
<!--    score: Number(row.total ?? 0) || 0,-->
<!--  }));-->
<!--  combined.sort((a, b) => b.score - a.score);-->

<!--  const sortedStreets = combined.map((x) => x.street);-->
<!--  const sortedScores = combined.map((x) => x.score);-->

<!--  horizontalOpt.yAxis.data = sortedStreets;-->
<!--  horizontalOpt.series[0].data = sortedScores;-->

<!--  horizontalBar.setOption(horizontalOpt, true);-->
<!--  isDataLoaded.value = true;  // 数据加载完毕，更新状态-->
<!--};-->

<!--// =================== 饼状图：小规则扣分占比 ===================-->

<!--// 每个模块要参与饼图的“小项”配置：key 对应行字段，full 为该项满分-->
<!--const PIE_ITEMS_BY_ROLE = {-->
<!--  扬尘治理: [-->
<!--    { key: "sj_found", label: "市级巡查-发现问题", full: 10 },-->
<!--    { key: "sj_unrect", label: "市级巡查-未整改等", full: 10 },-->
<!--    { key: "qj_found", label: "区级巡查-发现问题", full: 15 },-->
<!--    { key: "qj_unrect", label: "区级巡查-未整改等", full: 15 },-->
<!--    { key: "jd_unpatrol", label: "街道自查-未按期巡查", full: 35 },-->
<!--    { key: "aj_score", label: "案件办理", full: 5 },-->
<!--    { key: "qt_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  违法建设: [-->
<!--    { key: "ts_score", label: "投诉数量", full: 30 },-->
<!--    { key: "rpt_score", label: "重复投诉点位", full: 20 },-->
<!--    { key: "remove_score", label: "违建拆除", full: 20 },-->
<!--    { key: "case_score", label: "案件办理", full: 10 },-->
<!--    { key: "other_score", label: "其他", full: 20 },-->
<!--  ],-->
<!--  广告招牌: [-->
<!--    { key: "sign_score", label: "招牌审批受理量", full: 30 },-->
<!--    { key: "rep_score", label: "重复投诉点位", full: 10 },-->
<!--    { key: "city_found", label: "区级巡查-发现问题", full: 10 },-->
<!--    { key: "city_unrect", label: "区级巡查-未整改等", full: 10 },-->
<!--    { key: "self_score", label: "街道自查", full: 30 },-->
<!--    { key: "other_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  油烟治理: [-->
<!--    { key: "ts_score", label: "网上投诉得分", full: 30 },-->
<!--    { key: "rpt_score", label: "重复投诉点位", full: 10 },-->
<!--    { key: "zd_score", label: "重点巡查", full: 20 },-->
<!--    { key: "jd_score", label: "街道自查", full: 25 },-->
<!--    { key: "case_score", label: "案件办理", full: 5 },-->
<!--    { key: "qt_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  市容秩序: [-->
<!--    { key: "dd_clock", label: "打卡情况", full: 15 },-->
<!--    { key: "dd_onguard", label: "严管街在岗情况", full: 15 },-->
<!--    { key: "fj_score", label: "队伍风纪检查", full: 20 },-->
<!--    { key: "rc_shop", label: "临街店铺巡查", full: 10 },-->
<!--    { key: "rc_dispose", label: "问题发现处置", full: 10 },-->
<!--    { key: "rpt5_score", label: "重复投诉点位", full: 20 },-->
<!--    { key: "qt_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  网络理政: [-->
<!--    { key: "sl_score", label: "受理量", full: 30 },-->
<!--    { key: "sat_score", label: "满意度", full: 30 },-->
<!--    { key: "period_score", label: "办理周期", full: 10 },-->
<!--    { key: "rpt5_score", label: "重复投诉点位", full: 20 },-->
<!--    { key: "over_score", label: "超期", full: 10 },-->
<!--  ],-->
<!--  环境卫生: [-->
<!--    { key: "road_score", label: "道路清扫", full: 20 },-->
<!--    { key: "clean_score", label: "环卫保洁", full: 20 },-->
<!--    { key: "garbage_score", label: "垃圾收运", full: 20 },-->
<!--    { key: "field_score", label: "实地检查", full: 20 },-->
<!--    { key: "dispose_score", label: "问题处置率", full: 10 },-->
<!--    { key: "other_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  共享单车: [-->
<!--    { key: "zl_score", label: "单车总量监控", full: 30 },-->
<!--    { key: "rc_p_score", label: "日常P点管理", full: 20 },-->
<!--    { key: "zd_p_score", label: "重点点位P点管理", full: 30 },-->
<!--    { key: "dead_score", label: "僵尸车", full: 10 },-->
<!--    { key: "qt_score", label: "其他", full: 10 },-->
<!--  ],-->
<!--  数字城管: [-->
<!--    { key: "daily_score", label: "日常处置率", full: 30 },-->
<!--    { key: "ontime_score", label: "按期处置率", full: 20 },-->
<!--    { key: "rework_score", label: "返工率", full: 20 },-->
<!--    { key: "overdue_score", label: "超期待处置率", full: 20 },-->
<!--    { key: "delay_score", label: "延期率", full: 10 },-->
<!--  ],-->
<!--};-->

<!--const selectedStreet = ref("");-->
<!--const pie_chart = ref(null);-->
<!--let pieChart = null;-->

<!--const pieOpt = {-->
<!--  title: {-->
<!--    text: "金牛区治理薄弱环节分析",-->
<!--    left: "center",-->
<!--    top: "0%",-->
<!--    textStyle: {-->
<!--      fontSize: 20,-->
<!--      fontWeight: "bold",-->
<!--      color: "#333",-->
<!--    },-->
<!--  },-->
<!--  tooltip: {-->
<!--    trigger: "item",-->
<!--  },-->
<!--  legend: {-->
<!--    orient: "vertical",-->
<!--    left: "left",-->
<!--    textStyle: {-->
<!--      color: "#333",-->
<!--    },-->
<!--  },-->
<!--  series: [-->
<!--    {-->
<!--      type: "pie",-->
<!--      radius: "70%",-->
<!--      top: "10%",-->
<!--      center: ["50%", "55%"],-->
<!--      data: [],-->
<!--      label: { show: true, formatter: "{b}\n{c} 分（{d}%）" },-->
<!--      emphasis: {-->
<!--        itemStyle: {-->
<!--          shadowBlur: 10,-->
<!--          shadowOffsetX: 0,-->
<!--          shadowColor: "rgba(0, 0, 0, 0.5)",-->
<!--        },-->
<!--      },-->
<!--    },-->
<!--  ],-->
<!--};-->

<!--const updatePieChart = () => {-->
<!--  const cfg = tableCfg.value;-->
<!--  const name = roleName.value;-->
<!--  if (!cfg || !name || !pieChart || !selectedStreet.value) return;-->

<!--  const items = PIE_ITEMS_BY_ROLE[name] || [];-->
<!--  const row = (cfg.rows || []).find((r) => r.street === selectedStreet.value);-->
<!--  if (!row || items.length === 0) return;-->

<!--  // 计算每个小项的“扣分”：full - 当前得分-->
<!--  const pieData = items-->
<!--      .map((it) => {-->
<!--        const score = Number(row[it.key] ?? 0) || 0;-->
<!--        const full = it.full;-->
<!--        const deduct = Math.max(0, full - score);-->
<!--        return { name: it.label, value: deduct };-->
<!--      })-->
<!--      .filter((d) => d.value > 0);-->

<!--  const totalDeduct = pieData.reduce((s, x) => s + x.value, 0);-->
<!--  if (totalDeduct === 0) {-->
<!--    pieOpt.series[0].data = [{ name: "无扣分数据", value: 1 }];-->
<!--  } else {-->
<!--    pieOpt.series[0].data = pieData;-->
<!--  }-->

<!--  pieOpt.title.text = `${selectedStreet.value}治理薄弱环节分析`;-->
<!--  pieChart.setOption(pieOpt, true);-->
<!--};-->

<!--const pie_chart_refresher = () => {-->
<!--  if (!pieChart && pie_chart.value) {-->
<!--    pieChart = echarts.init(pie_chart.value);-->
<!--    window.addEventListener("resize", pieChart.resize);-->
<!--  }-->
<!--  updatePieChart();-->
<!--};-->

<!--const create_PieChart = () => {-->
<!--  pie_chart_refresher();-->
<!--};-->

<!--// =================== 联动：街道 / 图表初始化 ===================-->



<!--// watch(tableCfg, (cfg) => {-->
<!--//   console.log("✅ 已加载街镇数据1：", cfg);-->
<!--//   if (!cfg) return;-->
<!--//-->
<!--//   create_horizontal_bar();-->
<!--//   console.log("✅ 已加载街镇数据2：", cfg);-->
<!--//-->
<!--//   const list = streets.value;-->
<!--//   if (!selectedStreet.value && list.length > 0) {-->
<!--//     selectedStreet.value = list[0];-->
<!--//     updatePieChart();-->
<!--//   }-->
<!--// }, { immediate: true });-->
<!--watch(-->
<!--    tableCfg,-->
<!--    (cfg) => {-->
<!--      // 只有当 buildRoleRows 真正加载到 rows 时才开始绘图-->
<!--      if (!cfg || !cfg.rows || cfg.rows.length === 0) return;-->

<!--      console.log("🎯 tableCfg 有有效数据，开始渲染图表：", cfg);-->

<!--      // —— 初始化并绘制柱状图 ——-->
<!--      ensureHorizontalChart();-->
<!--      create_horizontal_bar();-->

<!--      // —— 默认选中第一个街道（仅第一次） ——-->
<!--      const list = streets.value || [];-->
<!--      if (!selectedStreet.value && list.length > 0) {-->
<!--        selectedStreet.value = list[0];-->
<!--      }-->

<!--      // —— 初始化并绘制饼图 ——-->
<!--      ensurePieChart();-->
<!--      updatePieChart();-->
<!--    },-->
<!--    { immediate: false }   // ❗关键：第一次不要立即触发（避免空数据绘图）-->
<!--);-->

<!--// onMounted(() => {-->
<!--//   // 确保图表初始化-->
<!--//   if (horizontal_bar1.value && !horizontalBar) {-->
<!--//     horizontalBar = echarts.init(horizontal_bar1.value);-->
<!--//     window.addEventListener("resize", horizontalBar.resize);-->
<!--//   }-->
<!--//   if (pie_chart.value && !pieChart) {-->
<!--//     pieChart = echarts.init(pie_chart.value);-->
<!--//     window.addEventListener("resize", pieChart.resize);-->
<!--//   }-->
<!--// });-->
<!--function ensureHorizontalChart() {-->
<!--  if (!horizontalBar && horizontal_bar1.value) {-->
<!--    horizontalBar = echarts.init(horizontal_bar1.value);-->
<!--    window.addEventListener("resize", horizontalBar.resize);-->
<!--  }-->
<!--}-->

<!--function ensurePieChart() {-->
<!--  if (!pieChart && pie_chart.value) {-->
<!--    pieChart = echarts.init(pie_chart.value);-->
<!--    window.addEventListener("resize", pieChart.resize);-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--/* 骨架屏样式 */-->
<!--.loading-skeleton {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  background: #e0e0e0;-->
<!--  animation: loading 1.5s infinite ease-in-out;-->
<!--}-->

<!--@keyframes loading {-->
<!--  0% { background: #e0e0e0; }-->
<!--  50% { background: #f0f0f0; }-->
<!--  100% { background: #e0e0e0; }-->
<!--}-->
<!--</style>-->
<!--&lt;!&ndash;<script setup>&ndash;&gt;-->
<!--&lt;!&ndash;import { reactive, ref, onMounted, computed } from "vue";&ndash;&gt;-->
<!--&lt;!&ndash;import * as echarts from 'echarts';&ndash;&gt;-->
<!--&lt;!&ndash;import moment from "moment";&ndash;&gt;-->
<!--&lt;!&ndash;import { params } from "@/store/store.js";&ndash;&gt;-->
<!--&lt;!&ndash;import { getStreetStatistics, getSmallRulesStatistics  , getStreetSmallRulesStatistics } from "@/api/content.js";&ndash;&gt;-->

<!--&lt;!&ndash;// =================== 原有：保持不变 ===================&ndash;&gt;-->
<!--&lt;!&ndash;const props = defineProps({&ndash;&gt;-->
<!--&lt;!&ndash;  bigRulesId: {&ndash;&gt;-->
<!--&lt;!&ndash;    type: Number,&ndash;&gt;-->
<!--&lt;!&ndash;    required: true&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;});&ndash;&gt;-->
<!--&lt;!&ndash;const bigRulesId = props.bigRulesId;&ndash;&gt;-->
<!--&lt;!&ndash;// ✅ 根据 ID 自动确定标题文字&ndash;&gt;-->
<!--&lt;!&ndash;const MODULE_TITLE_MAP = Object.freeze({&ndash;&gt;-->
<!--&lt;!&ndash;  3:  '环境卫生',&ndash;&gt;-->
<!--&lt;!&ndash;  4:  '市容秩序',&ndash;&gt;-->
<!--&lt;!&ndash;  6:  '广告招牌',&ndash;&gt;-->
<!--&lt;!&ndash;  8:  '扬尘治理',&ndash;&gt;-->
<!--&lt;!&ndash;  17: '数字城管',&ndash;&gt;-->
<!--&lt;!&ndash;  18: '网络理政',&ndash;&gt;-->
<!--&lt;!&ndash;  19: '油烟治理',&ndash;&gt;-->
<!--&lt;!&ndash;  27: '违法建设',&ndash;&gt;-->
<!--&lt;!&ndash;  28: '共享单车',&ndash;&gt;-->
<!--&lt;!&ndash;});&ndash;&gt;-->
<!--&lt;!&ndash;const moduleTitle = computed(() => MODULE_TITLE_MAP[props.bigRulesId] || '治理');&ndash;&gt;-->

<!--&lt;!&ndash;console.log("bigrulesid:", bigRulesId)&ndash;&gt;-->
<!--&lt;!&ndash;//获取所有大规则信息&ndash;&gt;-->
<!--&lt;!&ndash;const detailRules = ref([]);&ndash;&gt;-->
<!--&lt;!&ndash;// const rule_map = ["环境卫生","市容秩序","广告招牌","扬尘治理","固体废弃物处置及垃圾分类","数字化常态监管","网络理政","油烟治理","违法建设"];&ndash;&gt;-->
<!--&lt;!&ndash;//获取当前时间&ndash;&gt;-->
<!--&lt;!&ndash;var start = moment().startOf("month").format("YYYY-MM-DD");&ndash;&gt;-->
<!--&lt;!&ndash;var end = moment().add(1, 'days').format("YYYY-MM-DD");&ndash;&gt;-->

<!--&lt;!&ndash;//获取成效分析数据（柱状图）&ndash;&gt;-->
<!--&lt;!&ndash;const scoresList = reactive([]);&ndash;&gt;-->
<!--&lt;!&ndash;const streetsList = reactive([]);&ndash;&gt;-->
<!--&lt;!&ndash;const get_cxfx_Scores = async(startTime, endTime) => {&ndash;&gt;-->
<!--&lt;!&ndash;  const data = await getStreetStatistics(startTime, endTime, bigRulesId);&ndash;&gt;-->
<!--&lt;!&ndash;  scoresList.splice(0, scoresList.length);&ndash;&gt;-->
<!--&lt;!&ndash;  streetsList.splice(0, streetsList.length);&ndash;&gt;-->

<!--&lt;!&ndash;  for (var key in data) {&ndash;&gt;-->
<!--&lt;!&ndash;    scoresList.push(data[key].score);&ndash;&gt;-->
<!--&lt;!&ndash;    streetsList.push(data[key].street);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//获取薄弱环节分析数据（全区）——先保留，当前饼图改为按街道查询&ndash;&gt;-->
<!--&lt;!&ndash;const smallRulesStatistics = reactive([]);&ndash;&gt;-->
<!--&lt;!&ndash;const get_brhj_Scores = async(startTime, endTime) => {&ndash;&gt;-->
<!--&lt;!&ndash;  const data = await getSmallRulesStatistics(startTime, endTime, bigRulesId);&ndash;&gt;-->
<!--&lt;!&ndash;  smallRulesStatistics.splice(0, smallRulesStatistics.length);&ndash;&gt;-->
<!--&lt;!&ndash;  for (var key in data) {&ndash;&gt;-->
<!--&lt;!&ndash;    smallRulesStatistics.push(data[key]);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//定义表配置（柱状图）&ndash;&gt;-->
<!--&lt;!&ndash;const horizontalOpt = {&ndash;&gt;-->
<!--&lt;!&ndash;  title: {&ndash;&gt;-->
<!--&lt;!&ndash;    text: "金牛区治理成效分析",&ndash;&gt;-->
<!--&lt;!&ndash;    left: "center",&ndash;&gt;-->
<!--&lt;!&ndash;    top: "0%",&ndash;&gt;-->
<!--&lt;!&ndash;    textStyle: {&ndash;&gt;-->
<!--&lt;!&ndash;      fontSize: 20,&ndash;&gt;-->
<!--&lt;!&ndash;      fontWeight: "bold",&ndash;&gt;-->
<!--&lt;!&ndash;      color: "#333",&ndash;&gt;-->
<!--&lt;!&ndash;    },&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  xAxis: {&ndash;&gt;-->
<!--&lt;!&ndash;    max: "dataMax",&ndash;&gt;-->
<!--&lt;!&ndash;    // 关闭x轴动画&ndash;&gt;-->
<!--&lt;!&ndash;    animation: false&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  yAxis: {&ndash;&gt;-->
<!--&lt;!&ndash;    type: "category",&ndash;&gt;-->
<!--&lt;!&ndash;    data: streetsList,&ndash;&gt;-->
<!--&lt;!&ndash;    inverse: true,&ndash;&gt;-->
<!--&lt;!&ndash;    // 关闭动画&ndash;&gt;-->
<!--&lt;!&ndash;    animationDuration: 0,&ndash;&gt;-->
<!--&lt;!&ndash;    animationDurationUpdate: 0,&ndash;&gt;-->
<!--&lt;!&ndash;    max: 13&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  series: [&ndash;&gt;-->
<!--&lt;!&ndash;    {&ndash;&gt;-->
<!--&lt;!&ndash;      realtimeSort: false, // 关闭实时排序动画&ndash;&gt;-->
<!--&lt;!&ndash;      name: "街道",&ndash;&gt;-->
<!--&lt;!&ndash;      type: "bar",&ndash;&gt;-->
<!--&lt;!&ndash;      data: scoresList,&ndash;&gt;-->
<!--&lt;!&ndash;      label: {&ndash;&gt;-->
<!--&lt;!&ndash;        show: true,&ndash;&gt;-->
<!--&lt;!&ndash;        position: "right",&ndash;&gt;-->
<!--&lt;!&ndash;        valueAnimation: false // 关闭标签值的动画&ndash;&gt;-->
<!--&lt;!&ndash;      },&ndash;&gt;-->
<!--&lt;!&ndash;    },&ndash;&gt;-->
<!--&lt;!&ndash;  ],&ndash;&gt;-->
<!--&lt;!&ndash;  legend: {&ndash;&gt;-->
<!--&lt;!&ndash;    top: '5%',&ndash;&gt;-->
<!--&lt;!&ndash;    show: true,&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  grid: {&ndash;&gt;-->
<!--&lt;!&ndash;    left: "15%",&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  // 关闭所有动画&ndash;&gt;-->
<!--&lt;!&ndash;  animation: false,&ndash;&gt;-->
<!--&lt;!&ndash;  animationDuration: 0,&ndash;&gt;-->
<!--&lt;!&ndash;  animationDurationUpdate: 0,&ndash;&gt;-->
<!--&lt;!&ndash;  animationEasing: "linear",&ndash;&gt;-->
<!--&lt;!&ndash;  animationEasingUpdate: "linear",&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//定义饼状图配置（仅标题、半径等有小改）&ndash;&gt;-->
<!--&lt;!&ndash;const pieOpt = {&ndash;&gt;-->
<!--&lt;!&ndash;  title: {&ndash;&gt;-->
<!--&lt;!&ndash;    text: "金牛区治理薄弱环节分析",&ndash;&gt;-->
<!--&lt;!&ndash;    left: "center",&ndash;&gt;-->
<!--&lt;!&ndash;    top: "0%",&ndash;&gt;-->
<!--&lt;!&ndash;    textStyle: {&ndash;&gt;-->
<!--&lt;!&ndash;      fontSize: 20,&ndash;&gt;-->
<!--&lt;!&ndash;      fontWeight: "bold",&ndash;&gt;-->
<!--&lt;!&ndash;      color: "#333",&ndash;&gt;-->
<!--&lt;!&ndash;    },&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  tooltip: {&ndash;&gt;-->
<!--&lt;!&ndash;    trigger: "item",&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  legend: {&ndash;&gt;-->
<!--&lt;!&ndash;    orient: "vertical",&ndash;&gt;-->
<!--&lt;!&ndash;    left: "left",&ndash;&gt;-->
<!--&lt;!&ndash;    textStyle: {&ndash;&gt;-->
<!--&lt;!&ndash;      color: "#333",&ndash;&gt;-->
<!--&lt;!&ndash;    },&ndash;&gt;-->
<!--&lt;!&ndash;  },&ndash;&gt;-->
<!--&lt;!&ndash;  series: [&ndash;&gt;-->
<!--&lt;!&ndash;    {&ndash;&gt;-->
<!--&lt;!&ndash;      type: "pie",&ndash;&gt;-->
<!--&lt;!&ndash;      radius: "70%",         // 视觉更舒服&ndash;&gt;-->
<!--&lt;!&ndash;      top: "10%",&ndash;&gt;-->
<!--&lt;!&ndash;      center: ["50%", "55%"],&ndash;&gt;-->
<!--&lt;!&ndash;      data: [],&ndash;&gt;-->
<!--&lt;!&ndash;      label: { show: true, formatter: "{b}\n{c} 分（{d}%）" },&ndash;&gt;-->
<!--&lt;!&ndash;      emphasis: {&ndash;&gt;-->
<!--&lt;!&ndash;        itemStyle: {&ndash;&gt;-->
<!--&lt;!&ndash;          shadowBlur: 10,&ndash;&gt;-->
<!--&lt;!&ndash;          shadowOffsetX: 0,&ndash;&gt;-->
<!--&lt;!&ndash;          shadowColor: "rgba(0, 0, 0, 0.5)",&ndash;&gt;-->
<!--&lt;!&ndash;        },&ndash;&gt;-->
<!--&lt;!&ndash;      },&ndash;&gt;-->
<!--&lt;!&ndash;    },&ndash;&gt;-->
<!--&lt;!&ndash;  ],&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//创建表（柱状图）——保持不变&ndash;&gt;-->
<!--&lt;!&ndash;const horizontal_bar1 = ref(null);&ndash;&gt;-->
<!--&lt;!&ndash;let horizontalBar = null;&ndash;&gt;-->
<!--&lt;!&ndash;const create_horizontal_bar = async () => {&ndash;&gt;-->
<!--&lt;!&ndash;  try {&ndash;&gt;-->
<!--&lt;!&ndash;    horizontalBar = echarts.init(horizontal_bar1.value);&ndash;&gt;-->

<!--&lt;!&ndash;    await get_cxfx_Scores(start, end);&ndash;&gt;-->

<!--&lt;!&ndash;    //根据分数排序数据（从高到低排序）&ndash;&gt;-->
<!--&lt;!&ndash;    const combinedData = streetsList.map((street, index) => ({&ndash;&gt;-->
<!--&lt;!&ndash;      street: street,&ndash;&gt;-->
<!--&lt;!&ndash;      score: scoresList[index]&ndash;&gt;-->
<!--&lt;!&ndash;    }));&ndash;&gt;-->
<!--&lt;!&ndash;    //倒序排序&ndash;&gt;-->
<!--&lt;!&ndash;    combinedData.sort((a, b) => b.score - a.score);&ndash;&gt;-->
<!--&lt;!&ndash;    //重新提取排序后的数据&ndash;&gt;-->
<!--&lt;!&ndash;    const sortedStreets = combinedData.map(item => item.street);&ndash;&gt;-->
<!--&lt;!&ndash;    const sortedScores = combinedData.map(item => item.score);&ndash;&gt;-->

<!--&lt;!&ndash;    horizontalOpt.yAxis.data = sortedStreets;&ndash;&gt;-->
<!--&lt;!&ndash;    horizontalOpt.series[0].data = sortedScores;&ndash;&gt;-->

<!--&lt;!&ndash;    horizontalBar.setOption(horizontalOpt);&ndash;&gt;-->
<!--&lt;!&ndash;    window.addEventListener("resize", horizontalBar.resize);&ndash;&gt;-->
<!--&lt;!&ndash;  } catch (error) {&ndash;&gt;-->
<!--&lt;!&ndash;    console.error("Failed to create horizontal bar chart:", error);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;// =================== 下面是饼状图：最小增改 ===================&ndash;&gt;-->

<!--&lt;!&ndash;// 下拉街道（你也可以复用已有 streetsList，这里用静态表做选择更稳定）&ndash;&gt;-->
<!--&lt;!&ndash;const streets = [&ndash;&gt;-->
<!--&lt;!&ndash;  "抚琴街道","西安路街道","驷马桥街道","荷花池街道","五块石街道","九里堤街道",&ndash;&gt;-->
<!--&lt;!&ndash;  "营门口街道","茶店子街道","金泉街道","沙河源街道","天回镇街道","西华街道","凤凰山街道"&ndash;&gt;-->
<!--&lt;!&ndash;];&ndash;&gt;-->
<!--&lt;!&ndash;const selectedStreet = ref(streets[0]);&ndash;&gt;-->

<!--&lt;!&ndash;// 饼图实例&ndash;&gt;-->
<!--&lt;!&ndash;const pie_chart = ref(null);&ndash;&gt;-->
<!--&lt;!&ndash;let pieChart = null;&ndash;&gt;-->

<!--&lt;!&ndash;// 按街道更新饼图（当前用静态桩数据；等接口好了替换掉 mock）&ndash;&gt;-->
<!--&lt;!&ndash;const updatePieChart = async () => {&ndash;&gt;-->
<!--&lt;!&ndash;  const street = selectedStreet.value;&ndash;&gt;-->
<!--&lt;!&ndash;  if (!street || !pieChart) return;&ndash;&gt;-->

<!--&lt;!&ndash;  // ===== MOCK 数据：替换后端返回 =====&ndash;&gt;-->
<!--&lt;!&ndash;  // 例如“其他”扣了 0.2 分，“案件办理”扣了 0.4 分（取绝对值展示为扇区大小）&ndash;&gt;-->
<!--&lt;!&ndash;  // const data = [&ndash;&gt;-->
<!--&lt;!&ndash;  //   { item: "其他",     score: -0.2 },&ndash;&gt;-->
<!--&lt;!&ndash;  //   { item: "案件办理", score: -0.4 },&ndash;&gt;-->
<!--&lt;!&ndash;  // ];&ndash;&gt;-->
<!--&lt;!&ndash;  const resp = await getStreetSmallRulesStatistics(start, end,bigRulesId, street);&ndash;&gt;-->
<!--&lt;!&ndash;  console.log("resp",resp)&ndash;&gt;-->
<!--&lt;!&ndash;  const chartData = resp.map(it => ({ name: it.item, value: Math.abs(it.score) }));&ndash;&gt;-->

<!--&lt;!&ndash;  const total = chartData.reduce((s, x) => s + x.value, 0);&ndash;&gt;-->
<!--&lt;!&ndash;  if (total === 0) chartData.push({ name: "无数据", value: 1 });&ndash;&gt;-->

<!--&lt;!&ndash;  pieOpt.series[0].data = chartData;&ndash;&gt;-->
<!--&lt;!&ndash;  pieOpt.title.text = `${street}治理薄弱环节分析`;&ndash;&gt;-->
<!--&lt;!&ndash;  pieChart.setOption(pieOpt);&ndash;&gt;-->

<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//创建饼状图（初始化 & 首次渲染）&ndash;&gt;-->
<!--&lt;!&ndash;const pie_chart_refresher = () => {&ndash;&gt;-->
<!--&lt;!&ndash;  if (!pieChart) {&ndash;&gt;-->
<!--&lt;!&ndash;    pieChart = echarts.init(pie_chart.value);&ndash;&gt;-->
<!--&lt;!&ndash;    window.addEventListener("resize", pieChart.resize);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;  updatePieChart();&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->
<!--&lt;!&ndash;const create_PieChart = async () => {&ndash;&gt;-->
<!--&lt;!&ndash;  try{&ndash;&gt;-->
<!--&lt;!&ndash;    pie_chart_refresher();&ndash;&gt;-->
<!--&lt;!&ndash;  }catch (error) {&ndash;&gt;-->
<!--&lt;!&ndash;    console.error("Failed to create pie chart:", error);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;};&ndash;&gt;-->

<!--&lt;!&ndash;//挂载完成后,创建两个图表&ndash;&gt;-->
<!--&lt;!&ndash;onMounted(() => {&ndash;&gt;-->
<!--&lt;!&ndash;  create_horizontal_bar();    // 原柱状图&ndash;&gt;-->
<!--&lt;!&ndash;  create_PieChart();          // 新饼状图（带下拉）&ndash;&gt;-->
<!--&lt;!&ndash;});&ndash;&gt;-->
<!--&lt;!&ndash;</script>&ndash;&gt;-->

<!--&lt;!&ndash;<style>&ndash;&gt;-->
<!--&lt;!&ndash;</style>&ndash;&gt;-->

