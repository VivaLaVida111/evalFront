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
        <el-form-item label="加减分">
          <button 
            class="btn-decrement" 
            @click="decrement"
            :disabled="currentValue <= min"
          >-</button>
          <input
            v-model="caseRecord.score"
            type="number"
            :min="min" :max="max"
            :step="step"
            @change="validateInput"
            class="input-field"
          />
          <button 
            class="btn-increment" 
            @click="increment"
            :disabled="currentValue >= max"
          >+</button>
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
import { ref, reactive, toRefs, watch} from 'vue';
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

//表格数据
const caseRecord = reactive({
  street: '',
  caseNumber: '',
  reason: '',
  score: 0,
  remark: '',
  filingTime: formatLocalDateTime(),
  closeTime: ''
});

const submitForm = async () => {
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

//重置表单
const resetForm = () => {
  Object.assign(caseRecord, {
    street: '',
    caseNumber: '',
    reason: '',
    score: 0,
    remark: '',
    filingTime: formatLocalDateTime(),
    closeTime: ''
  });
};

//按钮参数
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: -100
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  }
})
const emit = defineEmits(['update:modelValue', 'change'])
const { modelValue, min, max } = toRefs(props)
// 监听外部值变化
watch(modelValue, (newVal) => {
  caseRecord.score = newVal
})
// 监听内部值变化
watch(caseRecord.score, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
})
//增加数
const increment = () => {
  if (caseRecord.score < max.value) {
    caseRecord.score += props.step
  }
}
//减少数
const decrement = () => {
  if (caseRecord.score > min.value) {
    caseRecord.score -= props.step
  }
}
//输入校验
const validateInput = () => {
  if (caseRecord.score > max.value) {
    caseRecord.score = max.value
  } else if (caseRecord.score < min.value) {
    caseRecord.score = min.value
  } else if (isNaN(caseRecord.score)) {
    caseRecord.score = 0
  }
}
</script>

<style scoped>
/* .el-form {
  max-width: 600px;
  margin: 0 auto;
} */


.score-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.input-field {
  width: 80px;
  height: 36px;
  margin: 0 8px;
  padding: 0 10px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #409eff;
}

.btn-increment, .btn-decrement {
  width: 36px;
  height: 36px;
  font-size: 16px;
  color: #606266;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-increment:hover, .btn-decrement:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.btn-increment:disabled, .btn-decrement:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}
</style>