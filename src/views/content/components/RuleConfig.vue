<template>
    <el-container>
      <el-header style="font-size: 25px; padding: 5px">
        <h5 class="card-title" style="font-size: 30px; padding: 5px">
          评分规则配置
        </h5>
      </el-header>
      <el-main>
        <!-- <el-select
          v-model="site_name_select_way"
          class="m-2"
          placeholder="选择街道"
          @change="changeDate"
          clearable
          size="large"
        >
          <el-option
            v-for="item in site_name_option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
        <el-table
            :data="scoreItems"
            style="width: 100%"
            size="large"
            class="data-table"
        >
            <el-table-column
                label="评分项"
                min-width="150"
                header-align="center"
                align="center"
                :show-overflow-tooltip="true"
            >
                <template #default="{ row }">
                    <span>{{ row.item }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="评分占比"
                min-width="150"
                header-align="center"
                align="center"
                :show-overflow-tooltip="true"
            >
                <template #default="{ row }">
                    <el-input-number v-model="row.percentage" :min="0" :max="100" />
                </template>
            </el-table-column>
        </el-table>
        
        
      </el-main>
    </el-container>
  </template>
  
<script setup>
    import { ref } from "vue";

    const scoreItems = ref([
        { item: "规则 1", percentage: 50 },
        { item: "规则 2", percentage: 30 },
        { item: "规则 3", percentage: 20 },
    ]);
</script>
   
<style></style>
  