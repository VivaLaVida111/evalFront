<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        扣分事件查询
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
            prop="small_rules_percentage"
            label="小项占比"
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
      <div>
        <SubdivisionEntry :formData="formData" :submitVisible="false"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit(formData)">确认</el-button> 
        <el-button type="danger" @click="deleteRecord(formData)">删除</el-button>
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
import SubdivisionEntry from './SubdivisionEntry.vue';

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
const formData = reactive({
  id: null,
  street: "",
  bigRulesId: null,
  smallRulesId: null,
  remark: "",
  subtotal: 0,
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
      street.value;
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
          small_rules_percentage: null,
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
          small_rules_percentage: data[key].smallRules.percentage,
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

function resetFormData() {
  formData.id = null;
  formData.street = "";
  formData.bigRulesId = null;
  formData.smallRulesId = null;
  formData.remark = "";
  formData.subtotal = 0;
  formData.time = "";
}

function editRecord(record, index) {
  currentIndex.value = index;
  formData.id = record.id;
  formData.street = record.street;
  formData.bigRulesId = record.big_rules_id;
  formData.smallRulesId = record.small_rules_id;
  formData.remark = record.remark;
  formData.subtotal = record.subtotal;
  dialogVisible.value = true;
}

function confirmEdit(formData) {
  // 处理确认编辑逻辑
  detailsList.splice(currentIndex.value, 1, formData);
  dialogVisible.value = false;
  resetFormData();
}

function deleteRecord(formData) {
  // 处理删除逻辑
  //console.log("Deleting record with id:", id);
  detailsList.splice(currentIndex.value, 1);
  dialogVisible.value = false;
  resetFormData();
}
</script>

<style scoped>
.data-table .el-tooltip {
  white-space: pre-wrap;
}
</style>