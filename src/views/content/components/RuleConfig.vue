<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">评分规则</h5>
    </el-header>
    <el-main>
      <el-table
        :data="detailRules"
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
            <span>{{ row.bigRules.item }}</span>
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
            <span>{{ row.bigRules.percentage }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <el-button @click="toggle(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="小规则项详情" v-model="dialogVisible" width="50%">
        <el-table
          v-if="selectedRule"
          :data="selectedRule.smallRules"
          style="width: 100%"
          size="large"
          class="data-table"
        >
          <el-table-column
            label="小规则项"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template #default="{ row }">
              <span>{{ row.item }}</span>
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from "vue";
import { getDetailRules } from "@/api/content.js";

const detailRules = reactive([]);
getDetailRules().then((data) => {
  detailRules.splice(0, detailRules.length);
  detailRules.push(...data);
});

const selectedRule = ref(null);
const dialogVisible = ref(false);

const toggle = (rule) => {
  selectedRule.value = rule;
  dialogVisible.value = true;
};
</script>

<style>
/* 确保 el-dialog 没有被隐藏或覆盖 */
.el-dialog {
  z-index: 9999 !important;
}
</style>
