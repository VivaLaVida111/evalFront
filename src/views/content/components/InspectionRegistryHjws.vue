<template>
    <el-container>
      <el-header style="font-size: 25px; padding: 5px; display: flex; align-items: center;">
        <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
          实地检查
        </h5>
        <el-button type="primary" @click="showOptionalEntry" style="margin-right: 10px;">选项式录入</el-button>
<!--        <el-button type="primary" @click="showTableEntry">表格式录入</el-button>-->
        <el-button type="primary" @click="showExcelEntry" style="margin-right: 10px;">一键式录入</el-button>
      </el-header>
      <div v-if="currentView === 'OptionalEntry'">
        <InspectionRegistryOptionalHjws />
      </div>
      <div v-if="currentView === 'ExcelEntry'">
        <InspectionRegistryExcelHjws />
      </div>
<!--      <div v-else-if="currentView === 'TableEntry'">-->
<!--        <InspectionRegistryTable />-->
<!--      </div>-->
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import InspectionRegistryOptional from './InspectionRegistryOptional.vue';
  import InspectionRegistryTable from './InspectionRegistryTable.vue';
  import InspectionRegistryExcel from "@/views/content/components/InspectionRegistryExcel.vue";
  import InspectionRegistryExcelHjws from "@/views/content/components/InspectionRegistryExcelHjws.vue";
  import InspectionRegistryOptionalHjws from "@/views/content/components/InspectionRegistryOptionalHjws.vue";
  
  const currentView = ref('OptionalEntry');
  
  const showOptionalEntry = () => {
    currentView.value = 'OptionalEntry';
  };
  const showExcelEntry = () => {
    currentView.value = 'ExcelEntry';
  };
  // const showTableEntry = () => {
  //   currentView.value = 'TableEntry';
  // };
  </script>