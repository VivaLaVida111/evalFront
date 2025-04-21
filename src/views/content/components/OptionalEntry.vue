<template>
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
          <el-checkbox-group v-model="localFormData.smallRulesIds">
            <el-row v-for="(smallRule, index) in smallRules" :key="index" :gutter="20">
              <el-col :span="24">
                <el-checkbox :label="smallRule.id">
                  {{ smallRule.item }}
                </el-checkbox>
              </el-col>
              <el-col :span="24" v-if="localFormData.smallRulesIds.includes(smallRule.id)">
                <el-form-item :label="加减分值">
                  <el-input-number
                    v-model="localFormData.scores[smallRule.id]"
                    :step="0.1"
                    placeholder="加减分值"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="localFormData.remark"
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
      <div ref="chartContainer" style="width: 100%; height: 400px"></div>
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
  import * as echarts from "echarts";
  import { params } from "@/store/store.js";
  import moment from "moment";
  
  const props = defineProps({
    formData: {
      type: Object,
      default: () => ({
        street: "",
        bigRulesId: null,
        smallRulesIds: [],
        scores: {},
        remark: "",
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
  const selectedDate = ref(null);
  const chartContainer = ref(null);
  let chartInstance = null;
  
  const today = moment().format("YYYY-MM-DD") + "T23:59:59";
  const firstDayOfMonth = moment().startOf("month").format("YYYY-MM-DD") + "T00:00:00";
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
  // 街道数据
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
    if (localFormData.bigRulesId !== null && localFormData.bigRulesId !== "") {
      const selectedRule = filteredDetailRules.value.find(
        (rule) => rule.bigRules.id === localFormData.bigRulesId
      );
      if (selectedRule) {
        return selectedRule.smallRules;
      }
    }
    return [];
  });
  
  function onBigRulesChange() {
    localFormData.smallRulesIds = [];
    localFormData.scores = {};
  }
  
  function handleDateChange(value) {
    if (value) {
      selectedDate.value = moment(value).format("YYYY-MM-DDTHH:mm:ss");
    } else {
      selectedDate.value = null;
    }
  }
  
  function getSmallRuleItem(id) {
    const rule = smallRules.value.find((rule) => rule.id === id);
    return rule ? rule.item : "";
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
    if (localFormData.smallRulesIds.length === 0) {
      ElMessage({
        message: "请选择至少一个小规则",
        type: "error",
      });
      return false;
    }
  
    for (const id of localFormData.smallRulesIds) {
      if (
        localFormData.scores[id] === null ||
        localFormData.scores[id] === undefined
      ) {
        ElMessage({
          message: `请填写小规则 "${getSmallRuleItem(id)}" 的加减分值`,
          type: "error",
        });
        return false;
      }
    }
  
    return true;
  }
  
  function resetFormData() {
    localFormData.street = "";
    // localFormData.bigRulesId = null;
    localFormData.smallRulesIds = [];
    localFormData.scores = {};
    localFormData.remark = "";
    localFormData.input = 0;
    localFormData.time = "";
    selectedDate.value = null;
  }
  
  function submitForm() {
    if (!validateFormData()) {
      return;
    }
  
    const records = localFormData.smallRulesIds.map((smallRulesId) => ({
      street: localFormData.street,
      bigRulesId: localFormData.bigRulesId,
      smallRulesId,
      remark: localFormData.remark,
      input: localFormData.scores[smallRulesId],
      time: selectedDate.value || formatLocalDateTime(),
    }));
  
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
  </script>