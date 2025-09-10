<template>
  <el-main>
    <el-form ref="form" :model="tableData" label-width="80px">
      <el-form-item label="大规则">
        <el-select
          placeholder="选择大规则"
          clearable
          v-model="selectedBigRule"
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
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="street" label="街道" width="180">
          <template #default="scope">
            {{ scope.row.street }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="(smallRule, index) in smallRules"
          :key="index"
          :prop="smallRule.id.toString()"
        >
          <template #header>
            <div class="header-content" :title="smallRule.item">
              {{ smallRule.item }}
            </div>
          </template>
          <template #default="scope">
            <el-input-number
              v-model="scope.row.scores[index]"
              :step="0.1"
              placeholder="加减分值"
            ></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="总计">
          <template #default="scope">
            {{ 100 + scope.row.scores.reduce((sum, score) => sum + score, 0) }}
          </template>
        </el-table-column>
      </el-table>
      <el-form-item label="备注">
        <el-input
          v-model="remark"
          style="width: 1000px"
          type="textarea"
        ></el-input>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker
          v-model="selectedDate"
          type="datetime"
          placeholder="选择日期时间"
          format="YYYY-MM-DD HH:mm:ss"
          @change="handleDateChange"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-if="localSubmitVisible">
        <el-button type="primary" @click="submitForm">提交</el-button>
      </el-form-item>
    </el-form>
<!--    <div ref="chartContainer" style="width: 100%; height: 400px"></div>-->
  </el-main>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  getStreetStatistics,
  getDetailRules,
  addSubdivision,
  formatLocalDateTime,
} from "@/api/content.js";
import { ElMessage } from "element-plus";
import { params } from "@/store/store.js";
import moment from "moment";
import * as echarts from "echarts";

const props = defineProps({
  submitVisible: {
    type: Boolean,
    default: true,
  },
  initialRole: {
    type: String,
    default: ""
  }
});

const localSubmitVisible = ref(props.submitVisible);
const selectedDate = ref(null);
const remark = ref("");

const detailRules = ref([]);
const selectedBigRule = ref(null);

const chartContainer = ref(null);
let chartInstance = null;

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
  if (selectedBigRule.value !== null && selectedBigRule.value !== "") {
    const selectedRule = filteredDetailRules.value.find(
      (rule) => rule.bigRules.id === selectedBigRule.value
    );
    if (selectedRule) {
      return selectedRule.smallRules;
    }
  }
  return [];
});

const tableData = reactive(
  streets.value.map((street) => ({
    street: street.label,
    scores: new Array(smallRules.value.length).fill(0),
  }))
);

function onBigRulesChange() {
  tableData.forEach((row) => {
    row.scores = new Array(smallRules.value.length).fill(0);
  });
}

function handleDateChange(value) {
  if (value) {
    selectedDate.value = moment(value).format("YYYY-MM-DDTHH:mm:ss");
  } else {
    selectedDate.value = null;
  }
}

function validateFormData() {
  if (!selectedBigRule.value) {
    ElMessage({
      message: "请选择大规则",
      type: "error",
    });
    return false;
  }

  for (const row of tableData) {
    for (const [index, smallRule] of smallRules.value.entries()) {
      if (row.scores[index] === null || row.scores[index] === undefined) {
        ElMessage({
          message: `请填写街道 "${row.street}" 的小规则 "${smallRule.item}" 的加减分值`,
          type: "error",
        });
        return false;
      }
    }
  }

  return true;
}

function resetFormData() {
  selectedBigRule.value = null;
  tableData.forEach((row) => {
    row.scores = {};
  });
  remark.value = "";
  selectedDate.value = null;
}

function submitForm() {
  if (!validateFormData()) {
    return;
  }

  const records = tableData.flatMap((row) =>
    smallRules.value.map((smallRule, index) => ({
      street: row.street,
      bigRulesId: selectedBigRule.value,
      smallRulesId: smallRule.id,
      remark: remark.value,
      input: row.scores[index],
      time: selectedDate.value || formatLocalDateTime(),
    }))
  );

  // console.log("Form submitted:", records);

  Promise.all(records.map((record) => addSubdivision(record)))
    .then((results) => {
      if (results.every((result) => result)) {
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
    })
    .catch(() => {
      ElMessage({
        message: "提交失败",
        type: "error",
      });
    });
}

const today = moment().format("YYYY-MM-DD") + "T23:59:59";
const firstDayOfMonth = moment().startOf("month").format("YYYY-MM-DD") + "T00:00:00";
watch(
  () => selectedBigRule.value,
  async (newVal) => {
    if (newVal !== null && newVal !== "") {
      const statistics = await getStreetStatistics(
        firstDayOfMonth,
        today,
        newVal
      );
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
      text: "街道评分统计",
    },
    tooltip: {},
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: statistics.map((item) => item.street),
    },
    series: [
      {
        name: "分数",
        type: "bar",
        data: statistics.map((item) => item.score),
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
watch(
  () => detailRules.value,
  (newVal) => {
    if (newVal.length > 0 && props.initialRole) {
      const matchedRule = filteredDetailRules.value.find(
        rule => rule.bigRules.item === props.initialRole
      );
      if (matchedRule) {
        selectedBigRule.value = matchedRule.bigRules.id;
      }
    }
  }
);

watch(
  () => props.initialRole,
  (newVal) => {
    if (newVal && detailRules.value.length > 0) {
      const matchedRule = filteredDetailRules.value.find(
        rule => rule.bigRules.item === newVal
      );
      // 如果匹配到，就更新 selectedBigRule；否则清空
      selectedBigRule.value = matchedRule ? matchedRule.bigRules.id : null;
    }
  }
);
</script>

<style scoped>
.header-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>