<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        体征事件查询
      </h5>
    </el-header>
    <el-main>
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
            min-width="131"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="big_rules"
            label="大项规则"
            min-width="131"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="big_rules_percentage"
            label="大项占比"
            min-width="75"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="small_rules"
            label="小项规则"
            min-width="131"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="input"
            label="小项扣分"
            min-width="75"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="subtotal"
            label="小计"
            min-width="75"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="time"
            label="时间"
            min-width="131"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <!-- 操作列 -->
          <el-table-column
            label="操作"
            min-width="100"
            header-align="center"
            align="center"
          >
            <template #default="{ row, $index }">
              <el-button
                v-if="canEdit(row.big_rules)"
                type="primary"
                @click="editRecord(row, $index)"
              >
                编辑
              </el-button>
            </template>
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
    <!-- 编辑对话框 -->
    <el-dialog title="编辑记录" v-model="dialogVisible" width="50%">
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
          <el-select
            placeholder="选择小规则"
            clearable
            v-model="localFormData.smallRulesId"
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
            v-model="localFormData.remark"
            style="width: 1000px"
            type="textarea"
          ></el-input>
        </el-form-item>
        <el-form-item label="加减分值">
          <el-input-number
            v-model="localFormData.input"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit(localFormData)"
          >确认</el-button
        >
        <el-button type="danger" @click="deleteRecord(localFormData)"
          >删除</el-button
        >
      </span>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import axios from "axios";
import moment from "moment";
import { useRoute } from "vue-router";
import { params } from "@/store/store.js";
import {
  getDetailRules,
  addSubdivision,
  formatLocalDateTime,
  deleteSubdivision,
  updateSubdivision
} from "@/api/content.js";
import { ElMessage } from "element-plus";
import SubdivisionEntry from "./SubdivisionEntry.vue";

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

const route = useRoute();
const street = computed(() => {
  return isEmptyObject(route.query) ? "" : route.query.street;
});

let totalRecords = ref(1000);
let currentPage = ref(1);
const disabledDate = (time) => {
  return (
    time.getTime() < new Date("2022-03-12").getTime() ||
    time.getTime() > new Date().getTime()
  );
};

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
const dialogVisible = ref(false);
const currentIndex = ref(-1);
const currentRecord = reactive({});
const localFormData = reactive({
  id: null,
  street: "",
  bigRulesId: null,
  smallRulesId: null,
  remark: "",
  input: 0,
  time: "",
});

function changeDate() {
  var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + "T00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + "T23:59:59";
  getPenaltyPoints(start, end, 1);
}

const getPenaltyPoints = (startTime, endTime, pageNum) => {
  var URL = "/api/details/period/";
  if (street.value === "") {
    URL += startTime + "/" + endTime + "/" + pageNum + "/8";
  } else {
    URL +=
      startTime +
      "/" +
      endTime +
      "/" +
      pageNum +
      "/8" +
      "?street=" +
      street.value +
      "&roles=" +
      params.role;
  }
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
          id: null,
          big_rules: null,
          big_rules_percentage: null,
          small_rules: null,
          input: null,
          subtotal: data[key].subtotal,
          time: null,
        };
      } else {
        var detail = {
          id: data[key].id,
          street: data[key].street,
          big_rules: data[key].bigRules.item,
          big_rules_percentage: data[key].bigRules.percentage,
          big_rules_id: data[key].bigRules.id,
          small_rules: data[key].smallRules.item,
          input: data[key].input,
          small_rules_id: data[key].smallRules.id,
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
  var start = moment(changeValue.value[0]).format("YYYY-MM-DD") + "T00:00:00";
  var end = moment(changeValue.value[1]).format("YYYY-MM-DD") + "T23:59:59";
  getPenaltyPoints(start, end, pageNum);
};

function canEdit(bigRules) {
  return params.role.includes(bigRules) || params.role.includes("管理者");
}

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
  if (localFormData.bigRulesId !== null) {
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
    localFormData.input === null ||
    localFormData.input === undefined ||
    localFormData.input === 0
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
  localFormData.id = null;
  localFormData.street = "";
  localFormData.bigRulesId = null;
  localFormData.smallRulesId = null;
  localFormData.remark = "";
  localFormData.input = 0;
  localFormData.time = "";
}

function editRecord(record, index) {
  currentIndex.value = index;
  localFormData.id = record.id;
  localFormData.street = record.street;
  localFormData.bigRulesId = record.big_rules_id;
  localFormData.smallRulesId = record.small_rules_id;
  localFormData.remark = record.remark;
  localFormData.input = record.input;
  localFormData.time = record.time;
  dialogVisible.value = true;
}

function validateModifyDate(time) {
  //console.log("time:", time);
  const startOfLastMonth = moment().subtract(12, 'months').startOf('month');
  const endOfThisMonth = moment().endOf('month');
  const modifyDate = moment(time);
  var res = modifyDate.isBetween(startOfLastMonth, endOfThisMonth, null, '[]');
  //console.log("isBetween result:", res);

  if (!res) {
    ElMessage({
      message: "只能修改上个月以及本月的数据",
      type: "error",
    });
  }
  return res;
}

function confirmEdit(localFormData) {
  // 处理确认编辑逻辑
  if (!validateFormData()) {
    return;
  }
  if(!validateModifyDate(localFormData.time)) {
    return;
  }

  // console.log("localFormData: ", localFormData);
  // detailsList.splice(currentIndex.value, 1, localFormData);
  const updatedRecord = { ...localFormData }; // 创建一个新的对象，复制 localFormData 的值
  updatedRecord.time = formatLocalDateTime();
  console.log("updatedRecord: ", updatedRecord);
  updateSubdivision(updatedRecord).then((data) => {
    if (data) {
      ElMessage({
        message: "修改成功",
        type: "success",
      });
      detailsList.splice(currentIndex.value, 1, parseFormData(updatedRecord));
      dialogVisible.value = false;
      resetFormData();
    } else {
      ElMessage({
        message: "修改失败",
        type: "error",
      });
    }
  });
  // splice插入的是对象的引用，所以这里需要创建一个新的对象
  // detailsList.splice(currentIndex.value, 1, parseFormData(updatedRecord));
  // dialogVisible.value = false;
  // resetFormData();
}

function parseFormData(formData) {
  return {
    id: formData.id,
    street: formData.street,
    big_rules: filteredDetailRules.value.find(rule => rule.bigRules.id === formData.bigRulesId)?.bigRules.item || '',
    big_rules_percentage: filteredDetailRules.value.find(rule => rule.bigRules.id === formData.bigRulesId)?.bigRules.percentage || '',
    big_rules_id: formData.bigRulesId,
    small_rules: smallRules.value.find(rule => rule.id === formData.smallRulesId)?.item || '',
    //small_rules_percentage: smallRules.value.find(rule => rule.id === formData.smallRulesId)?.percentage || '',
    input: formData.input,
    small_rules_id: formData.smallRulesId,
    subtotal: formData.input * big_rules_percentage / 100,
    time: formData.time,
    remark: formData.remark,
  };
}

function deleteRecord(localFormData) {
  // 处理删除逻辑
  //console.log("Deleting record with id:", id);
  if(!validateModifyDate(localFormData.time)) {
    return;
  }
  deleteSubdivision(localFormData).then((data) => {
    if (data) {
      ElMessage({
        message: "删除成功",
        type: "success",
      });
      detailsList.splice(currentIndex.value, 1);
      dialogVisible.value = false;
      resetFormData();
    } else {
      ElMessage({
        message: "删除失败",
        type: "error",
      });
    }
  });
  // detailsList.splice(currentIndex.value, 1);
  // dialogVisible.value = false;
  // resetFormData();
}
</script>

<style scoped>
.data-table .el-tooltip {
  white-space: pre-wrap;
}
</style>
