<template>
  <div class="important-reward-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">重点激励</h2>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <!-- 表格主标题 -->
      <div class="table-main-title">金牛区重点整治点位验收情况统计表</div>

      <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
      >
        <!-- 序号列 -->
        <el-table-column
            type="index"
            label="序号"
            align="center"
            width="80"
        />

        <!-- 批次列 -->
        <el-table-column
            prop="batch"
            label="批次"
            align="center"
            min-width="100"
        />

        <!-- 点位列 -->
        <el-table-column
            prop="point"
            label="点位"
            align="center"
            min-width="150"
        />

        <!-- 街道列 -->
        <el-table-column
            prop="street"
            label="街道"
            align="center"
            min-width="120"
        />

        <!-- 类别列 -->
        <el-table-column
            prop="category"
            label="类别"
            align="center"
            min-width="100"
        />

        <!-- 验收情况列 -->
        <el-table-column
            prop="acceptance"
            label="验收情况"
            align="center"
            min-width="120"
        >
          <template #default="{ row }">
            <span :class="getAcceptanceClass(row.acceptance)">
              {{ row.acceptance }}
            </span>
          </template>
        </el-table-column>

        <!-- 备注列 -->
        <el-table-column
            prop="remark"
            label="备注"
            align="center"
            min-width="150"
        />
      </el-table>

      <!-- 备注说明 -->
      <div class="table-note">
        <p>
          备注：合格的排列在表格前面，<span class="highlight-green">标绿</span>。
          不合格的排列在表格后面，同一街道的尽可能排在一起。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 初始化5行空数据，展示表格结构
const tableData = ref([
  { batch: '', point: '', street: '', category: '', acceptance: '', remark: '' },
  { batch: '', point: '', street: '', category: '', acceptance: '', remark: '' },
  { batch: '', point: '', street: '', category: '', acceptance: '', remark: '' },
  { batch: '', point: '', street: '', category: '', acceptance: '', remark: '' },
  { batch: '', point: '', street: '', category: '', acceptance: '', remark: '' }
])

// 表头样式
const headerCellStyle = () => {
  return {
    backgroundColor: '#f5f7fa',
    color: '#303133',
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '12px 0'
  }
}

// 单元格样式
const cellStyle = () => {
  return {
    padding: '10px 0',
    fontSize: '13px',
    height: '48px'
  }
}

// 验收情况样式（预留，用于后续数据填充）
const getAcceptanceClass = (value) => {
  if (value === '合格') return 'status-qualified'
  if (value === '不合格') return 'status-unqualified'
  return ''
}
</script>

<style scoped>
.important-reward-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.table-wrapper {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-main-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ebeef5;
}

.table-note {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.highlight-green {
  background-color: #67c23a;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-qualified {
  color: #67c23a;
  font-weight: 600;
}

.status-unqualified {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}
</style>