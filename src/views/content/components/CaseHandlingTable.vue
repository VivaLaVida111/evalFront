<template>
  <el-container>
    <el-main>
      <el-form ref="form" label-width="80px">  
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="street" label="街道" width="150" fixed>
            <template #default="scope">
              {{ scope.row.street }}
            </template>
          </el-table-column>
          <el-table-column prop="caseNumber" label="案件编号" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.caseNumber" placeholder="请输入案件编号"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="处罚事由" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.reason" placeholder="请输入处罚事由"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入备注"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="filingTime" label="立案时间" width="220">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.filingTime"
                type="datetime"
                placeholder="选择立案时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
              ></el-date-picker>
            </template>
          </el-table-column>
          <el-table-column prop="closeTime" label="办结时间" width="220">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.closeTime"
                type="datetime"
                placeholder="选择办结时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
              ></el-date-picker>
            </template>
          </el-table-column>
          <!-- <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.closeTime ? 'success' : 'warning'">
                {{ scope.row.closeTime ? '已办结' : '未办结' }}
              </el-tag>
            </template>
          </el-table-column> -->
        </el-table>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { addCaseRecord, formatLocalDateTime } from '@/api/content.js';

const form = ref(null);

const streets = [
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
];

const createEmptyCaseRecord = (street) => {
  return {
    street: street,
    caseNumber: '',
    reason: '',
    remark: '',
    filingTime: formatLocalDateTime(),
    closeTime: ''
  };
};

// 初始化数据，每个街道一行
const tableData = ref([]);

onMounted(() => {
  initTableData();
});

const initTableData = () => {
  tableData.value = streets.map(street => createEmptyCaseRecord(street.value));
};

const submitForm = async () => {
  // 只提交有数据的行
  const validRows = tableData.value.filter(row => 
    row.caseNumber || row.reason || row.remark
  );
  
  if (validRows.length === 0) {
    ElMessage.warning('没有可提交的案件数据');
    return;
  }
  
  // Validate all valid rows
  const invalidRows = [];
  
  validRows.forEach((row, index) => {
    if (!row.caseNumber || !row.reason || !row.filingTime) {
      invalidRows.push(row.street);
    }
  });
  
  if (invalidRows.length > 0) {
    ElMessage.error(`${invalidRows.join(', ')} 的数据不完整，请检查`);
    return;
  }

  try {
    // Submit all valid rows
    const promises = validRows.map(record => addCaseRecord(record));
    await Promise.all(promises);
    
    ElMessage({
      message: '案件信息提交成功',
      type: 'success',
    });
    initTableData(); // 提交完成后初始化表格数据
  } catch (error) {
    console.error('提交案件信息失败：', error);
    ElMessage.error('提交失败，请重试');
  }
};
</script>

<style scoped>
.el-table {
  margin-bottom: 20px;
}
</style>