<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px; display: flex; align-items: center;">
      <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
        案件办理录入
      </h5>
      <el-button type="primary" @click="showOptionalEntry" style="margin-right: 10px;">选项式录入</el-button>
      <el-button type="primary" @click="showTableEntry">表格式录入</el-button>
    </el-header>
    <div v-if="currentView === 'OptionalEntry'">
      <CaseHandlingOptional />
    </div>
    <div v-else-if="currentView === 'TableEntry'">
      <CaseHandlingTable />
    </div>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import CaseHandlingOptional from "./CaseHandlingOptional.vue";
import CaseHandlingTable from "./CaseHandlingTable.vue";

const currentView = ref('OptionalEntry');

const showOptionalEntry = () => {
  currentView.value = 'OptionalEntry';
};

const showTableEntry = () => {
  currentView.value = 'TableEntry';
};
</script>