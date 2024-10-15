<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        扣分项录入
      </h5>
    </el-header>
    <el-main>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="街道">
          <el-select placeholder="选择街道" clearable v-model="formData.street">
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
            v-model="formData.bigRulesId"
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
          <el-select
            placeholder="选择小规则"
            clearable
            v-model="formData.smallRulesId"
          >
            <el-option
              v-for="(smallRule, index) in smallRules"
              :key="index"
              :label="smallRule.item"
              :value="smallRule.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            style="width: 1000px"
            type="textarea"
          ></el-input>
        </el-form-item>
        <el-form-item label="加减分值">
          <el-input-number
            v-model="formData.subtotal"
            step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  getDetailRules,
  addSubdivision,
  formatLocalDateTime,
  getSelfRoles
} from "@/api/content.js";
import { ElMessage } from "element-plus";

const detailRules = ref([]);
const userRoles = ref([]);
getDetailRules().then((data) => {
  detailRules.value = data;
});

getSelfRoles().then((data) => {
  console.log("Roles data:", JSON.stringify(data));
  data = data[0];
  if (data.roleList && Array.isArray(data.roleList)) {
    if (data.roleList.some(role => role.name === "管理者")) {
      userRoles.value = ["管理者"];
    } else {
      userRoles.value = data.roleList.map(role => role.name);
    }
  } else {
    console.error("Invalid roleList data:", data.roleList);
  }
  console.log("User roles:", userRoles.value);
});

const filteredDetailRules = computed(() => {
  if (userRoles.value.includes("管理者")) {
    return detailRules.value;
  }
  return detailRules.value.filter(rule =>
    userRoles.value.includes(rule.bigRules.item)
  );
});


const formData = reactive({
  street: "",
  bigRulesId: null,
  smallRulesId: null,
  remark: "",
  subtotal: 0,
  time: "",
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

const smallRules = ref([]);

function onBigRulesChange(selectedBigRuleId) {
  const selectedRule = filteredDetailRules.value.find(rule => rule.bigRules.id === selectedBigRuleId);
  if (selectedRule) {
    smallRules.value = selectedRule.smallRules;
  } else {
    smallRules.value = [];
  }
}

function submitForm() {
  formData.time = formatLocalDateTime();
  console.log("Form submitted:", formData);
  addSubdivision(formData).then((data) => {
    if (data) {
      ElMessage({
        message: "提交成功",
        type: "success",
      });
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