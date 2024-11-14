<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        考评分数录入
      </h5>
    </el-header>
    <el-main>
      <el-form ref="form" :model="localFormData" label-width="80px">
        <el-form-item label="街道">
          <el-select
            placeholder="选择街道"
            clearable
            v-model="localFormData.street"
          >
            <el-option
              v-for="street in streets"
              :key="street.value"
              :label="street.label"
              :value="street.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="大规则">
          <el-select
            placeholder="选择大规则"
            clearable
            v-model="localFormData.bigRulesId"
            @change="onBigRulesChange"
          >
            <el-option
              v-for="(rule, index) in filteredDetailRules"
              :key="index"
              :label="rule.bigRules.item"
              :value="rule.bigRules.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="小规则">
          <el-radio-group v-model="localFormData.smallRulesId">
            <el-radio
              v-for="(smallRule, index) in smallRules"
              :key="index"
              :label="smallRule.id"
            >
              {{ smallRule.item }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="localFormData.remark"
            style="width: 1000px"
            type="textarea"
          ></el-input>
        </el-form-item>
        <el-form-item label="加减分值">
          <el-input-number
            v-model="localFormData.subtotal"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item v-if="localSubmitVisible">
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
      <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
  getDetailRules,
  addSubdivision,
  formatLocalDateTime,
  getStreetStatistics,
} from "@/api/content.js";
import { ElMessage } from "element-plus";
import { params } from "@/store/store.js";
import * as echarts from "echarts";
import moment from "moment";

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({
      street: "",
      bigRulesId: null,
      smallRulesId: null,
      remark: "",
      subtotal: 0,
      time: "",
    }),
  },
  submitVisible: {
    type: Boolean,
    default: true,
  },
});

const localFormData = reactive({ ...props.formData });
const localSubmitVisible = ref(props.submitVisible);
const chartContainer = ref(null);
let chartInstance = null;

watch(
  () => props.formData,
  (newVal) => {
    Object.assign(localFormData, newVal);
  },
  { deep: true }
);

watch(
  () => props.submitVisible,
  (newVal) => {
    localSubmitVisible.value = newVal;
  }
);

const detailRules = ref([]);

getDetailRules().then((data) => {
  detailRules.value = data;
});

const filteredDetailRules = computed(() => {
  if (params.role.includes("管理者")) {
    return detailRules.value;
  }
  return detailRules.value.filter((rule) =>
    params.role.includes(rule.bigRules.item)
  );
});

const streets = ref([
  { label: "抚琴街道", value: "抚琴街道" },
  { label: "西安路街道", value: "西安路街道" },
  { label: "驷马桥街道", value: "驷马桥街道" },
  { label: "荷花池街道", value: "荷花池街道" },
  { label: "五块石街道", value: "五块石街道" },
  { label: "九里堤街道", value: "九里堤街道" },
  { label: "营门口街道", value: "营门口街道" },
  { label: "茶店子街道", value: "茶店子街道" },
  { label: "金泉街道", value: "金泉街道" },
  { label: "沙河源街道", value: "沙河源街道" },
  { label: "天回镇街道", value: "天回镇街道" },
  { label: "西华街道", value: "西华街道" },
  { label: "凤凰山街道", value: "凤凰山街道" },
]);

const smallRules = computed(() => {
  if (localFormData.bigRulesId !== null && localFormData.bigRulesId !== '') {
    const selectedRule = filteredDetailRules.value.find(
      (rule) => rule.bigRules.id === localFormData.bigRulesId
    );
    if (selectedRule) {
      return selectedRule.smallRules;
    }
  }
  return [];
});

const today = moment().format("YYYY-MM-DD");
const firstDayOfMonth = moment().startOf("month").format("YYYY-MM-DD");
let changeValue = ref([firstDayOfMonth, today]);
function changeDate() {
  var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + "T00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + "T23:59:59";
  //getPenaltyPoints(start, end, 1);
}

watch(
  () => localFormData.bigRulesId,
  async (newVal) => {
    if (newVal !== null && newVal !== '') {
      const statistics = await getStreetStatistics(firstDayOfMonth, today, newVal);
      renderChart(statistics);
    } else {
      clearChart();
    }
  }
);

function renderChart(statistics) {
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
  }

  statistics.sort((a, b) => a.score - b.score);

  const option = {
    title: {
      text: '街道评分统计',
    },
    tooltip: {},
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: statistics.map(item => item.street),
    },
    series: [
      {
        name: '分数',
        type: 'bar',
        data: statistics.map(item => item.score),
      },
    ],
  };

  chartInstance.setOption(option);
}

function clearChart() {
  if (chartInstance) {
    chartInstance.clear();
  }
}

function onBigRulesChange() {
  localFormData.smallRulesId = null;
}

function validateFormData() {
  if (!localFormData.street) {
    ElMessage({
      message: "请选择街道",
      type: "error",
    });
    return false;
  }
  if (!localFormData.bigRulesId) {
    ElMessage({
      message: "请选择大规则",
      type: "error",
    });
    return false;
  }
  if (!localFormData.smallRulesId) {
    ElMessage({
      message: "请选择小规则",
      type: "error",
    });
    return false;
  }

  if (
    localFormData.subtotal === null ||
    localFormData.subtotal === undefined ||
    localFormData.subtotal === 0
  ) {
    ElMessage({
      message: "请填写加减分值",
      type: "error",
    });
    return false;
  }
  return true;
}

function resetFormData() {
  localFormData.street = "";
  localFormData.bigRulesId = null;
  localFormData.smallRulesId = null;
  localFormData.remark = "";
  localFormData.subtotal = 0;
  localFormData.time = "";
}

function submitForm() {
  if (!validateFormData()) {
    return;
  }
  localFormData.time = formatLocalDateTime();
  console.log("Form submitted:", localFormData);
  addSubdivision(localFormData).then((data) => {
    if (data) {
      ElMessage({
        message: "提交成功",
        type: "success",
      });
      resetFormData(); // 重置表单数据
    } else {
      ElMessage({
        message: "提交失败",
        type: "error",
      });
    }
    console.log("addSubdivision:  " + data);
  });
}
</script>