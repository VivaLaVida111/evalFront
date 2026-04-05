<template>
  <el-container>
    <el-main>
      <el-form ref="form" :model="cityOrderRecord" label-width="120px">
        <!-- 问题来源 -->
        <el-form-item label="问题来源">
          <el-select v-model="cityOrderRecord.resource" placeholder="选择问题来源">
            <el-option
                v-for="src in sources"
                :key="src.value"
                :label="src.label"
                :value="src.value"
            />
          </el-select>
        </el-form-item>

        <!-- 巡查编号 -->
        <el-form-item label="巡查编号">
          <el-input
              v-model="cityOrderRecord.checkNumber"
              style="width: 1000px"
              placeholder="请输入巡查编号"
          />
        </el-form-item>

        <!-- 检查时间 -->
        <el-form-item label="检查时间">
          <el-date-picker
              v-model="cityOrderRecord.checkTime"
              type="datetime"
              placeholder="选择检查时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <!-- 所属街道 -->
        <el-form-item label="所属街道">
          <el-select v-model="cityOrderRecord.street" placeholder="选择街道">
            <el-option
                v-for="s in streets"
                :key="s.value"
                :label="s.label"
                :value="s.value"
            />
          </el-select>
        </el-form-item>

        <!-- 详细地址 -->
        <el-form-item label="详细地址">
          <el-input
              v-model="cityOrderRecord.detailAddress"
              style="width: 1000px"
              type="textarea"
              rows="2"
              placeholder="请输入详细地址"
          />
        </el-form-item>

        <!-- 问题描述 -->
        <el-form-item label="问题描述">
          <el-input
              v-model="cityOrderRecord.problemDesc"
              style="width: 1000px"
              type="textarea"
              rows="3"
              placeholder="请输入问题描述"
          />
        </el-form-item>

        <!-- 问题图片（URL/文件名） -->
        <el-form-item label="问题图片">
          <el-input
              v-model="cityOrderRecord.problemPic"
              style="width: 1000px"
              placeholder="请输入图片URL或文件名（可选）"
          />
        </el-form-item>

        <!-- 是否下达通知 -->
        <el-form-item label="是否下达通知">
          <el-select v-model="cityOrderRecord.noticeIssued" placeholder="是否下达通知">
            <el-option v-for="opt in yesNoOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <!-- 核查状态 -->
        <el-form-item label="核查状态">
          <el-select v-model="cityOrderRecord.checkStatus" placeholder="选择核查状态">
            <el-option
                v-for="st in checkStatuses"
                :key="st.value"
                :label="st.label"
                :value="st.value"
            />
          </el-select>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
              v-model="cityOrderRecord.note"
              style="width: 1000px"
              type="textarea"
              rows="2"
              placeholder="请输入备注（可选）"
          />
        </el-form-item>

        <!-- 提交/重置 -->
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { formatLocalDateTime, addCityOrderRecord } from '@/api/content.js' // ⬅️ 按你项目实际 API 名称

const form = ref(null)

// 选项：问题来源
const sources = ref([
  { label: '市级巡查', value: '市级巡查' },
  { label: '区级巡查', value: '区级巡查' },
])

// 选项：是否
const yesNoOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' }
]

// 选项：核查状态（沿用你的风格）
const checkStatuses = ref([
  { label: '已整改', value: '已整改' },
  { label: '未整改', value: '未整改' },
])

// 选项：街道（沿用你已有清单）
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
])

// 表单数据（字段名与你前端 Excel rec 一致）
const cityOrderRecord = reactive({
  resource: '',
  checkNumber: '',
  checkTime: formatLocalDateTime(), // 默认当前时间（ISO 带 T）
  street: '',
  detailAddress: '',
  problemDesc: '',
  problemPic: '',
  noticeIssued: '',
  checkStatus: '',
  note: '',
  systemName: '市容秩序'
})

// 提交按钮
const submit = () => {
  submitForm()
  resetForm()
}

// 提交表单到后端
const submitForm = async () => {
  // 基础校验：按你巡查登记风格，做几个关键项
  if (!cityOrderRecord.street) {
    ElMessage.error('请选择所属街道')
    return
  }
  if (!cityOrderRecord.checkTime) {
    ElMessage.error('请选择检查时间')
    return
  }
  if (!cityOrderRecord.resource) {
    ElMessage.error('请选择问题来源')
    return
  }

  try {
    await addCityOrderRecord(cityOrderRecord) // 按你的后端接口方法
    ElMessage({ message: '市容秩序记录提交成功', type: 'success' })
  } catch (error) {
    // 生成可读的快照（避免 Proxy）
    const payload = JSON.parse(JSON.stringify(cityOrderRecord))
    console.error('提交失败：', error)
    console.log('cityOrderRecord payload =>', payload) // 在控制台输出表单数据
    ElMessage.error('提交失败，请重试')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(cityOrderRecord, {
    resource: '',
    checkNumber: '',
    checkTime: formatLocalDateTime(),
    street: '',
    detailAddress: '',
    problemDesc: '',
    problemPic: '',
    noticeIssued: '',
    checkStatus: '',
    note: ''
  })
}
</script>

<style scoped>
/* 加减分输入框样式 */
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