<template>
  <el-container>
    <el-main>
      <el-form ref="form" :model="caseRecord" label-width="120px">
        <el-form-item label="所属街道">
          <el-select v-model="caseRecord.street" placeholder="选择街道">
            <el-option
              v-for="street in streets"
              :key="street.value"
              :label="street.label"
              :value="street.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="案件编号">
          <el-input v-model="caseRecord.caseNumber" style="width: 1000px" placeholder="请输入案件编号"></el-input>
        </el-form-item>
        <el-form-item label="处罚事由">
          <el-input
            v-model="caseRecord.reason"
            style="width: 1000px"
            type="textarea"
            rows="3"
            placeholder="请输入处罚事由"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="caseRecord.remark"
            style="width: 1000px"
            type="textarea"
            rows="2"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
        <el-form-item label="立案时间">
          <el-date-picker
            v-model="caseRecord.filingTime"
            type="datetime"
            placeholder="选择立案时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="办结时间">
          <el-date-picker
            v-model="caseRecord.closeTime"
            type="datetime"
            placeholder="选择办结时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { addCaseRecord, formatLocalDateTime } from '@/api/content.js';

const form = ref(null);

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

const caseRecord = reactive({
  street: '',
  caseNumber: '',
  reason: '',
  remark: '',
  filingTime: formatLocalDateTime(),
  closeTime: ''
});

const submitForm = async () => {
  // Validate form data
  if (!caseRecord.street) {
    ElMessage.error('请选择所属街道');
    return;
  }
  if (!caseRecord.caseNumber) {
    ElMessage.error('请输入案件编号');
    return;
  }
  if (!caseRecord.reason) {
    ElMessage.error('请输入处罚事由');
    return;
  }
  if (!caseRecord.filingTime) {
    ElMessage.error('请选择立案时间');
    return;
  }

  try {
    await addCaseRecord(caseRecord);
    ElMessage({
      message: '案件信息提交成功',
      type: 'success',
    });
    resetForm();
  } catch (error) {
    console.error('提交案件信息失败：', error);
    ElMessage.error('提交失败，请重试');
  }
};

const resetForm = () => {
  Object.assign(caseRecord, {
    street: '',
    caseNumber: '',
    reason: '',
    remark: '',
    filingTime: formatLocalDateTime(),
    closeTime: ''
  });
};
</script>

<style scoped>
/* .el-form {
  max-width: 600px;
  margin: 0 auto;
} */
</style>