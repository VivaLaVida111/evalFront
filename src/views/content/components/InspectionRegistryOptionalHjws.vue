<template>
  <el-container>
    <el-main>
      <el-form ref="form" :model="envCheckRecord" label-width="120px">
        <!-- 管理主体（环卫所 / 车队） -->
        <el-form-item label="管理主体">
          <el-select v-model="envCheckRecord.manageSubject" placeholder="选择管理主体">
            <el-option
                v-for="m in manageSubjects"
                :key="m.value"
                :label="m.label"
                :value="m.value"
            />
          </el-select>
        </el-form-item>

        <!-- 检查时间 -->
        <el-form-item label="检查时间">
          <el-date-picker
              v-model="envCheckRecord.checkTime"
              type="datetime"
              placeholder="选择检查时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <!-- 所属街道 -->
        <el-form-item label="所属街道">
          <el-select v-model="envCheckRecord.street" placeholder="选择街道">
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
              v-model="envCheckRecord.detailAddress"
              style="width: 1000px"
              type="textarea"
              rows="2"
              placeholder="请输入详细地址"
          />
        </el-form-item>

        <!-- 问题类别（环境卫生 / 垃圾分类） -->
        <el-form-item label="问题类别">
          <el-select v-model="envCheckRecord.problemCategory" placeholder="选择问题类别">
            <el-option
                v-for="c in problemCategories"
                :key="c.value"
                :label="c.label"
                :value="c.value"
            />
          </el-select>
        </el-form-item>

        <!-- 存在问题 -->
        <el-form-item label="存在问题">
          <el-input
              v-model="envCheckRecord.problemDesc"
              style="width: 1000px"
              type="textarea"
              rows="3"
              placeholder="请填写现场存在的问题"
          />
        </el-form-item>

        <!-- 问题照片（URL/文件名） -->
        <el-form-item label="问题照片">
          <el-input
              v-model="envCheckRecord.problemPic"
              style="width: 1000px"
              placeholder="填写图片URL或文件名（可选）"
          />
        </el-form-item>

        <!-- 检查人 -->
        <el-form-item label="检查人">
          <el-input
              v-model="envCheckRecord.inspector"
              style="width: 300px"
              placeholder="请输入检查人姓名"
          />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
              v-model="envCheckRecord.note"
              style="width: 1000px"
              type="textarea"
              rows="2"
              placeholder="备注（可选）"
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
import { formatLocalDateTime, addEnvHealthSpotCheck } from '@/api/content.js'
// ↑ 提交接口名可按你后端实际命名替换，例如 addEnvCheckRecord

const form = ref(null)

// 选项：管理主体
const manageSubjects = [
  { label: '环卫所', value: '环卫所' },
  { label: '车队',   value: '车队' }
]

// 选项：问题类别
const problemCategories = [
  { label: '环境卫生', value: '环境卫生' },
  { label: '垃圾分类', value: '垃圾分类' }
]

// 选项：街道（沿用你项目的清单）
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

// 表单数据
const envCheckRecord = reactive({
  manageSubject: '',
  checkTime: formatLocalDateTime(), // 默认当前时间 (YYYY-MM-DDTHH:mm:ss)
  street: '',
  detailAddress: '',
  problemCategory: '',
  problemDesc: '',
  problemPic: '',
  inspector: '',
  note: ''
})

// 提交
const submit = () => {
  submitForm()
  resetForm()
}

// 提交到后端
const submitForm = async () => {
  // 基础校验（与之前风格一致）
  if (!envCheckRecord.manageSubject) {
    ElMessage.error('请选择管理主体')
    return
  }
  if (!envCheckRecord.checkTime) {
    ElMessage.error('请选择检查时间')
    return
  }
  if (!envCheckRecord.street) {
    ElMessage.error('请选择所属街道')
    return
  }
  if (!envCheckRecord.problemCategory) {
    ElMessage.error('请选择问题类别')
    return
  }
  try {
    await addEnvHealthSpotCheck(envCheckRecord)
    ElMessage({ message: '实地检查记录提交成功', type: 'success' })
  } catch (error) {
    // 打印可读快照，便于调试
    const payload = JSON.parse(JSON.stringify(envCheckRecord))
    console.error('提交失败：', error)
    console.log('envCheckRecord payload =>', payload)
    ElMessage.error('提交失败，请重试')
  }
}

// 重置
const resetForm = () => {
  Object.assign(envCheckRecord, {
    manageSubject: '',
    checkTime: formatLocalDateTime(),
    street: '',
    detailAddress: '',
    problemCategory: '',
    problemDesc: '',
    problemPic: '',
    inspector: '',
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