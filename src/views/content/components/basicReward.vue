<!--<template>-->
<!--  <div class="basic-reward-container">-->
<!--    &lt;!&ndash; 页面标题 &ndash;&gt;-->
<!--    <div class="page-header">-->
<!--      <h2 class="page-title">基础激励</h2>-->
<!--    </div>-->

<!--    &lt;!&ndash; 表格区域 &ndash;&gt;-->
<!--    <div class="table-wrapper">-->
<!--      <el-table-->
<!--          :data="tableData"-->
<!--          border-->
<!--          stripe-->
<!--          style="width: 100%"-->
<!--          :header-cell-style="headerCellStyle"-->
<!--          :cell-style="cellStyle"-->
<!--      >-->
<!--        &lt;!&ndash; 街道列 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="street"-->
<!--            label="街道"-->
<!--            align="center"-->
<!--            min-width="120"-->
<!--        />-->

<!--        &lt;!&ndash; 投诉量列 - 可点击 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="complaint"-->
<!--            label="投诉量"-->
<!--            align="center"-->
<!--            min-width="100"-->
<!--        >-->
<!--          <template #header>-->
<!--            <span class="clickable-header" @click="openDialog('complaint')">-->
<!--              投诉量-->
<!--              <el-icon class="icon-hint"><View /></el-icon>-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; 态度满意率列 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="satisfaction"-->
<!--            label="态度满意率"-->
<!--            align="center"-->
<!--            min-width="120"-->
<!--        />-->

<!--        &lt;!&ndash; 网格上报事件列 - 可点击 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="gridReport"-->
<!--            label="网格上报事件"-->
<!--            align="center"-->
<!--            min-width="120"-->
<!--        >-->
<!--          <template #header>-->
<!--            <span class="clickable-header" @click="openDialog('grid')">-->
<!--              网格上报事件-->
<!--              <el-icon class="icon-hint"><View /></el-icon>-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; 典型问题整改列 - 可点击 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="problemRectification"-->
<!--            label="典型问题整改"-->
<!--            align="center"-->
<!--            min-width="120"-->
<!--        >-->
<!--          <template #header>-->
<!--            <span class="clickable-header" @click="openDialog('rectification')">-->
<!--              典型问题整改-->
<!--              <el-icon class="icon-hint"><View /></el-icon>-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; 是否达标列 &ndash;&gt;-->
<!--        <el-table-column-->
<!--            prop="isQualified"-->
<!--            label="是否达标"-->
<!--            align="center"-->
<!--            min-width="100"-->
<!--        >-->
<!--          <template #default="{ row }">-->
<!--            <span :class="row.isQualified === '是' ? 'status-yes' : 'status-no'">-->
<!--              {{ row.isQualified }}-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </el-table>-->
<!--    </div>-->

<!--    &lt;!&ndash; 投诉量详情弹窗 &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible.complaint"-->
<!--        title="各街道群众投诉量办理情况统计表"-->
<!--        width="900px"-->
<!--        destroy-on-close-->
<!--        :close-on-click-modal="true"-->
<!--        class="detail-dialog"-->
<!--    >-->
<!--      <el-table-->
<!--          :data="complaintDetailData"-->
<!--          border-->
<!--          stripe-->
<!--          style="width: 100%"-->
<!--          :header-cell-style="headerCellStyle"-->
<!--          :cell-style="cellStyle"-->
<!--          max-height="500px"-->
<!--      >-->
<!--        <el-table-column prop="street" label="街道" align="center" min-width="120" fixed />-->
<!--        <el-table-column prop="lastTwoYears" label="前两年同期" align="center" min-width="120" />-->
<!--        <el-table-column prop="currentMonth" label="当月" align="center" min-width="100" />-->
<!--        <el-table-column prop="change" label="变化情况" align="center" min-width="120" />-->
<!--        <el-table-column prop="qualified" label="是否达标" align="center" min-width="100">-->
<!--          <template #default="{ row }">-->
<!--            <span :class="row.qualified === '是' ? 'status-yes' : row.qualified === '否' ? 'status-no' : ''">-->
<!--              {{ row.qualified }}-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="remark" label="备注" align="center" min-width="150" />-->
<!--      </el-table>-->
<!--    </el-dialog>-->

<!--    &lt;!&ndash; 网格事件上报办理情况弹窗 &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible.grid"-->
<!--        title="各街道网格事件上报办理情况统计表"-->
<!--        width="900px"-->
<!--        destroy-on-close-->
<!--        :close-on-click-modal="true"-->
<!--        class="detail-dialog"-->
<!--    >-->
<!--      <el-table-->
<!--          :data="gridDetailData"-->
<!--          border-->
<!--          stripe-->
<!--          style="width: 100%"-->
<!--          :header-cell-style="headerCellStyle"-->
<!--          :cell-style="cellStyle"-->
<!--          max-height="500px"-->
<!--      >-->
<!--        <el-table-column prop="street" label="街道" align="center" min-width="120" fixed />-->
<!--        <el-table-column prop="reportEvent" label="上报事件" align="center" min-width="120" />-->
<!--        <el-table-column prop="handleStatus" label="办结情况" align="center" min-width="120" />-->
<!--        <el-table-column prop="efficiency" label="办结有效率" align="center" min-width="120" />-->
<!--        <el-table-column prop="qualified" label="是否达标" align="center" min-width="100">-->
<!--          <template #default="{ row }">-->
<!--            <span :class="row.qualified === '是' ? 'status-yes' : row.qualified === '否' ? 'status-no' : ''">-->
<!--              {{ row.qualified }}-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="remark" label="备注" align="center" min-width="150" />-->
<!--      </el-table>-->
<!--    </el-dialog>-->

<!--    &lt;!&ndash; 典型问题整改点位质量指数弹窗 &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible.rectification"-->
<!--        title="各街道典型问题整改点位质量指数情况统计表"-->
<!--        width="900px"-->
<!--        destroy-on-close-->
<!--        :close-on-click-modal="true"-->
<!--        class="detail-dialog"-->
<!--    >-->
<!--      <el-table-->
<!--          :data="rectificationDetailData"-->
<!--          border-->
<!--          stripe-->
<!--          style="width: 100%"-->
<!--          :header-cell-style="headerCellStyle"-->
<!--          :cell-style="cellStyle"-->
<!--          max-height="500px"-->
<!--      >-->
<!--        <el-table-column prop="street" label="街道" align="center" min-width="120" fixed />-->
<!--        <el-table-column prop="targetScore" label="指标达标分数" align="center" min-width="130" />-->
<!--        <el-table-column prop="difficulty" label="管理难度系数" align="center" min-width="130" />-->
<!--        <el-table-column prop="qualityIndex" label="点位质量指数" align="center" min-width="130" />-->
<!--        <el-table-column prop="qualified" label="是否达标" align="center" min-width="100">-->
<!--          <template #default="{ row }">-->
<!--            <span :class="row.qualified === '是' ? 'status-yes' : row.qualified === '否' ? 'status-no' : ''">-->
<!--              {{ row.qualified }}-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="remark" label="备注" align="center" min-width="150" />-->
<!--      </el-table>-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref } from 'vue'-->
<!--import { View } from '@element-plus/icons-vue'-->

<!--// 基础激励表格数据-->
<!--const tableData = ref([-->
<!--  { street: '抚琴街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '西安路街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '驷马桥街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '荷花池街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '五块石街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '九里堤街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '营门口街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '茶店子街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '金泉街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '天回镇街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '沙河源街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '凤凰山街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' },-->
<!--  { street: '西华街道', complaint: '是', satisfaction: '是', gridReport: '是', problemRectification: '是', isQualified: '是' }-->
<!--])-->

<!--// 弹窗显示控制（统一管理）-->
<!--const dialogVisible = ref({-->
<!--  complaint: false,-->
<!--  grid: false,-->
<!--  rectification: false-->
<!--})-->

<!--// 打开对应弹窗-->
<!--const openDialog = (type) => {-->
<!--  dialogVisible.value[type] = true-->
<!--}-->

<!--// 生成空数据行-->
<!--const generateEmptyData = () => {-->
<!--  const streets = [-->
<!--    '抚琴街道', '西安路街道', '驷马桥街道', '荷花池街道', '五块石街道',-->
<!--    '九里堤街道', '营门口街道', '茶店子街道', '金泉街道', '天回镇街道',-->
<!--    '沙河源街道', '凤凰山街道', '西华街道'-->
<!--  ]-->
<!--  return streets.map(street => ({ street }))-->
<!--}-->

<!--// 投诉量详情数据-->
<!--const complaintDetailData = ref(generateEmptyData().map(item => ({-->
<!--  ...item,-->
<!--  lastTwoYears: '',-->
<!--  currentMonth: '',-->
<!--  change: '',-->
<!--  qualified: '',-->
<!--  remark: ''-->
<!--})))-->

<!--// 网格事件上报详情数据-->
<!--const gridDetailData = ref(generateEmptyData().map(item => ({-->
<!--  ...item,-->
<!--  reportEvent: '',-->
<!--  handleStatus: '',-->
<!--  efficiency: '',-->
<!--  qualified: '',-->
<!--  remark: ''-->
<!--})))-->

<!--// 典型问题整改详情数据-->
<!--const rectificationDetailData = ref(generateEmptyData().map(item => ({-->
<!--  ...item,-->
<!--  targetScore: '',-->
<!--  difficulty: '',-->
<!--  qualityIndex: '',-->
<!--  qualified: '',-->
<!--  remark: ''-->
<!--})))-->

<!--// 表头样式-->
<!--const headerCellStyle = () => {-->
<!--  return {-->
<!--    backgroundColor: '#f5f7fa',-->
<!--    color: '#303133',-->
<!--    fontWeight: 'bold',-->
<!--    fontSize: '14px',-->
<!--    padding: '12px 0'-->
<!--  }-->
<!--}-->

<!--// 单元格样式-->
<!--const cellStyle = () => {-->
<!--  return {-->
<!--    padding: '10px 0',-->
<!--    fontSize: '13px'-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.basic-reward-container {-->
<!--  padding: 20px;-->
<!--  background-color: #f0f2f5;-->
<!--  min-height: 100vh;-->
<!--}-->

<!--.page-header {-->
<!--  margin-bottom: 20px;-->
<!--  background-color: #fff;-->
<!--  padding: 20px;-->
<!--  border-radius: 8px;-->
<!--  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);-->
<!--}-->

<!--.page-title {-->
<!--  margin: 0;-->
<!--  font-size: 24px;-->
<!--  font-weight: 600;-->
<!--  color: #303133;-->
<!--  text-align: center;-->
<!--}-->

<!--.table-wrapper {-->
<!--  background-color: #fff;-->
<!--  padding: 20px;-->
<!--  border-radius: 8px;-->
<!--  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);-->
<!--}-->

<!--/* 可点击表头样式 */-->
<!--.clickable-header {-->
<!--  cursor: pointer;-->
<!--  color: #409eff;-->
<!--  display: inline-flex;-->
<!--  align-items: center;-->
<!--  gap: 4px;-->
<!--  transition: all 0.3s;-->
<!--  font-weight: bold;-->
<!--}-->

<!--.clickable-header:hover {-->
<!--  color: #66b1ff;-->
<!--  transform: scale(1.05);-->
<!--}-->

<!--.icon-hint {-->
<!--  font-size: 14px;-->
<!--}-->

<!--/* 状态样式 */-->
<!--.status-yes {-->
<!--  color: #67c23a;-->
<!--  font-weight: 600;-->
<!--}-->

<!--.status-no {-->
<!--  color: #f56c6c;-->
<!--  font-weight: 600;-->
<!--}-->

<!--/* 表格悬停效果 */-->
<!--:deep(.el-table__row:hover) {-->
<!--  background-color: #f5f7fa !important;-->
<!--}-->

<!--/* 边框样式优化 */-->
<!--:deep(.el-table) {-->
<!--  border-radius: 6px;-->
<!--  overflow: hidden;-->
<!--}-->

<!--/* 弹窗样式 */-->
<!--:deep(.detail-dialog .el-dialog__header) {-->
<!--  background-color: #f5f7fa;-->
<!--  margin-right: 0;-->
<!--  padding: 20px;-->
<!--  border-bottom: 1px solid #ebeef5;-->
<!--}-->

<!--:deep(.detail-dialog .el-dialog__title) {-->
<!--  font-weight: bold;-->
<!--  font-size: 18px;-->
<!--  color: #303133;-->
<!--}-->

<!--:deep(.detail-dialog .el-dialog__body) {-->
<!--  padding: 20px;-->
<!--}-->
<!--</style>-->
<template>
  <div class="basic-reward-container">
    <div class="page-header">
      <h2 class="page-title">基础激励</h2>
    </div>

    <div class="table-wrapper">
      <el-table
          :data="computedMainTableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
      >
        <el-table-column prop="street" label="街道" align="center" min-width="120" />

        <el-table-column prop="complaint" label="投诉量" align="center" min-width="100">
          <template #header>
            <span class="clickable-header" @click="openDialog('complaint')">
              投诉量
              <el-icon class="icon-hint"><View /></el-icon>
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="satisfaction" label="态度满意率" align="center" min-width="120" />

        <el-table-column prop="gridReport" label="网格上报事件" align="center" min-width="120">
          <template #header>
            <span class="clickable-header" @click="openDialog('grid')">
              网格上报事件
              <el-icon class="icon-hint"><View /></el-icon>
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="problemRectification" label="典型问题整改" align="center" min-width="120">
          <template #header>
            <span class="clickable-header" @click="openDialog('rectification')">
              典型问题整改
              <el-icon class="icon-hint"><View /></el-icon>
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="isQualified" label="是否达标" align="center" min-width="100">
          <template #default="{ row }">
            <span :class="row.isQualified === '是' ? 'status-yes' : 'status-no'">
              {{ row.isQualified }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
        v-model="dialogVisible.complaint"
        title="各街道群众投诉量办理情况统计表"
        width="1000px"
        destroy-on-close
        class="detail-dialog"
    >
      <div class="upload-action-bar">
        <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleComplaintUpload"
            :show-file-list="false"
            accept=".xlsx, .xls"
        >
          <template #trigger>
            <el-button type="primary" icon="Upload">上传投诉量 Excel</el-button>
          </template>
        </el-upload>
        <span class="upload-tip">上传后将自动同步至后端并刷新主表状态</span>
      </div>

      <el-table :data="complaintDetailData" border stripe max-height="500px">
        <el-table-column prop="street" label="街道" align="center" min-width="120" fixed />
        <el-table-column prop="lastTwoYears" label="前两年同期" align="center" min-width="120" />
        <el-table-column prop="currentMonth" label="当月" align="center" min-width="100" />
        <el-table-column prop="change" label="变化情况" align="center" min-width="120" />
        <el-table-column prop="qualified" label="是否达标" align="center" min-width="100">
          <template #default="{ row }">
            <span :class="row.qualified === '是' ? 'status-yes' : 'status-no'">
              {{ row.qualified || '否' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center" min-width="150" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="dialogVisible.grid" title="各街道网格事件上报办理情况统计表" width="900px">
      <el-table :data="gridDetailData" border stripe>
        <el-table-column prop="street" label="街道" align="center" />
        <el-table-column prop="qualified" label="是否达标" align="center" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="dialogVisible.rectification" title="各街道典型问题整改点位质量指数统计表" width="900px">
      <el-table :data="rectificationDetailData" border stripe>
        <el-table-column prop="street" label="街道" align="center" />
        <el-table-column prop="qualified" label="是否达标" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { View, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import axios from 'axios'
import {getJylmComplaintList, uploadJylmComplaint} from "@/api/content";

// --- 基础数据定义 ---
const streets = [
  '抚琴街道', '西安路街道', '驷马桥街道', '荷花池街道', '五块石街道',
  '九里堤街道', '营门口街道', '茶店子街道', '金泉街道', '天回镇街道',
  '沙河源街道', '凤凰山街道', '西华街道'
]

const dialogVisible = ref({
  complaint: false,
  grid: false,
  rectification: false
})

// 子表原始数据
const complaintDetailData = ref([])
const gridDetailData = ref(streets.map(s => ({ street: s, qualified: '是' })))
const rectificationDetailData = ref(streets.map(s => ({ street: s, qualified: '是' })))

// --- 核心：主表联动计算 (已增加防御性检查) ---
const computedMainTableData = computed(() => {
  // 确保数据是数组，否则返回空状态
  const cList = Array.isArray(complaintDetailData.value) ? complaintDetailData.value : []

  return streets.map(name => {
    const cItem = cList.find(i => i.street === name)

    // 目前只根据投诉量决定
    const cStatus = cItem?.qualified || '否'
    const sStatus = '是'
    const gStatus = '是' // 待后续扩展
    const rStatus = '是' // 待后续扩展

    return {
      street: name,
      complaint: cStatus,
      satisfaction: sStatus,
      gridReport: gStatus,
      problemRectification: rStatus,
      isQualified: (cStatus === '是' && sStatus === '是' && gStatus === '是' && rStatus === '是') ? '是' : '否'
    }
  })
})

// --- 后端交互逻辑 ---

// 1. 初始化加载
const fetchAllData = async () => {
  try {
    const res = await getJylmComplaintList();

    // 根据你提供的控制台截图，数据就在 res.data 中
    if (res && res.code === 2000 && Array.isArray(res.data)) {
      complaintDetailData.value = res.data;
      console.log('投诉量数据加载成功:', complaintDetailData.value);
    } else {
      console.warn('后端返回格式异常或无数据，执行初始化逻辑');
      // 兜底：生成初始化的街道列表
      complaintDetailData.value = streets.map(s => ({
        street: s,
        lastTwoYears: '',
        currentMonth: '',
        change: '',
        qualified: '否',
        remark: ''
      }));
    }
  } catch (error) {
    console.error('获取投诉量列表失败:', error);
    // 失败时也必须保证数据是数组，防止计算属性报错
    complaintDetailData.value = streets.map(s => ({ street: s, qualified: '否' }));
  }
};

// --- 核心：解析并上传 Excel ---
const handleComplaintUpload = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 1. 映射 Excel 数据
      const formattedData = jsonData.map(row => ({
        street: row['街道'] || '',
        lastTwoYears: row['前两年同期'] || '',
        currentMonth: row['当月'] || '',
        change: row['变化情况'] || '',
        qualified: row['是否达标'] || '否',
        remark: row['备注'] || ''
      }))

      // 2. 调用规范的上传接口
      const response = await uploadJylmComplaint(formattedData)

      // 3. 根据你的 ResponseData 结构判断
      if (response.code === 200 || response.success) {
        ElMessage.success(response.msg || '数据上传成功')
        await fetchAllData() // 刷新本地数据
      } else {
        ElMessage.error('上传失败：' + response.msg)
      }
    } catch (err) {
      ElMessage.error('解析或上传出错，请检查文件格式')
    }
  }
  reader.readAsArrayBuffer(file.raw)
}
const openDialog = (type) => { dialogVisible.value[type] = true }

onMounted(() => {
  fetchAllData()
})

// 表格样式函数
const headerCellStyle = () => ({ backgroundColor: '#f5f7fa', color: '#303133', fontWeight: 'bold' })
const cellStyle = () => ({ padding: '10px 0' })
</script>

<style scoped>
.basic-reward-container { padding: 20px; background-color: #f0f2f5; min-height: 100vh; }
.page-header { margin-bottom: 20px; background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; }
.table-wrapper { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }

/* 交互样式 */
.clickable-header { cursor: pointer; color: #409eff; display: inline-flex; align-items: center; gap: 4px; font-weight: bold; }
.status-yes { color: #67c23a; font-weight: 600; }
.status-no { color: #f56c6c; font-weight: 600; }

.upload-action-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8f9fb;
  border-radius: 4px;
}
.upload-tip { font-size: 12px; color: #909399; }

:deep(.detail-dialog .el-dialog__header) { background-color: #f5f7fa; margin-right: 0; padding: 20px; border-bottom: 1px solid #ebeef5; }
</style>