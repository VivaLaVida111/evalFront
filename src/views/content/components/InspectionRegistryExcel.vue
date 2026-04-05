<template>
  <el-row>
    <div class="el-form-item__content">
      <el-upload
          ref="uploadRef"
          accept=".xls,.xlsx"
          action="#"
          :auto-upload="false"
          :multiple="false"
          :limit="1"
          :file-list="fileList"
          :before-upload="beforeUpload"
          :on-remove="fileRemove"
          :on-change="fileChange"
      >
        <el-button size="small" type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">一次只能上传一个 xls/xlsx 文件，且不超过 10M</div>
        </template>
      </el-upload>
    </div>
  </el-row>

  <el-row>
<!--    <el-button size="small" @click="closeDialog">取 消</el-button>-->
    <!-- 提交按钮可去掉；如果你想保留，就把它作为“确认导入” -->
    <!-- <el-button type="primary" size="small" @click="confirmImport">确认导入</el-button> -->
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { addInspectionRecord } from "@/api/content"

const emit = defineEmits(['close'])

/** 中文列头 → 表单字段名 */
const HEADER_MAP = {
  '问题来源': 'resource',
  '巡查编号': 'inspectionNumber',
  '工地名称': 'siteName',
  '详细地址': 'detailSite',
  '所属街道': 'street',
  '问题属性': 'attribute',
  '巡查状态': 'patrolStatus',
  '巡查时间': 'patrolTime',
  '巡查人':   'patroller',
  '核查状态': 'checkStatus',
  '备注':     null              // 忽略
}

const fileList = ref([])
const uploadRef = ref(null)

/** 上传前校验 */
const beforeUpload = (file) => {
  const isXls  = file.type === 'application/vnd.ms-excel'
  const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const okType = isXls || isXlsx
  if (!okType) ElMessage.error('上传文件只能是xls/xlsx格式！')
  const okSize = file.size / 1024 / 1024 < 10
  if (!okSize) ElMessage.error('上传文件大小不超过10M！')
  return okType && okSize
}

/** 选择文件后解析 */
const fileChange = (file, list) => {
  if (list.length > 0) {
    fileList.value = [list[list.length - 1]]
  }
  const raw = file?.raw
  if (!raw) return
  readExcelFillForm(raw)
}

/** 创建一条空记录对象 */
const makeEmptyRecord = () => ({
  resource: null,
  inspectionNumber: null,
  siteName: null,
  detailSite: null,
  street: null,
  attribute: null,
  patrolStatus: null,
  patrolTime: null,
  patroller: null,
  patrolPic: null,
  checkStatus: null,
  reformPic: null,
  systemName: '扬尘治理'
})

/** 把 Excel 一行数据转成后端需要的 payload */
const toServerPayload = (row) => {
  const p = makeEmptyRecord()
  for (const [cnHeader, key] of Object.entries(HEADER_MAP)) {
    if (!key) continue
    const idx = row.headerIndexMap[cnHeader]
    if (idx === undefined) continue
    const val = row.values[idx]
    p[key] = val && String(val).trim() !== '' ? String(val).trim() : null
  }
  return p
}



// 格式化函数（补零）
const pad = (n) => String(n).padStart(2, '0')
const formatDate = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

/** 本地解析 Excel 并提交 */
const readExcelFillForm = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    const headers = rows[1] || []
    const dataRows = rows.slice(2)

    const headerIndexMap = {}
    headers.forEach((h, i) => headerIndexMap[h] = i)

    const batch = dataRows
        .filter(r => Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
        .map(values => {
          const rec = {
            resource: null,
            inspectionNumber: null,
            siteName: null,
            detailSite: null,
            street: null,
            attribute: null,
            patrolStatus: null,
            patrolTime: null,
            patroller: null,
            patrolPic: null,
            checkStatus: null,
            reformPic: null,
            systemName:'扬尘治理'
          }
          headers.forEach((cnHeader, idx) => {
            const key = HEADER_MAP[cnHeader]
            if (!key) return
            let val = values[idx]

            // 关键处理：patrolTime 是 Excel 日期序列号时，转成 yyyy-MM-dd HH:mm:ss
            if (key === 'patrolTime' && typeof val === 'number') {
              const d = XLSX.SSF.parse_date_code(val)
              if (d) {
                const jsDate = new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S)
                val = formatDate(jsDate)
              }
            }

            rec[key] = (val !== undefined && val !== null && String(val).trim() !== '') ? String(val).trim() : null
          })
          return rec
        })

    let ok = 0, fail = 0
    for (const rec of batch) {
      try {
        await addInspectionRecord(rec)
        ok++
      } catch (err) {
        fail++
        console.error('提交失败 payload =', rec, err.response?.data || err)
      }
    }

    ElMessage.success(`导入完成：成功 ${ok} 条，失败 ${fail} 条`)
  }
  reader.readAsArrayBuffer(file)
}
</script>
<!--<script setup>-->
<!--import { ref, reactive } from 'vue'-->
<!--import { ElMessage } from 'element-plus'-->
<!--import * as XLSX from 'xlsx'-->
<!--import {addInspectionRecord} from "@/api/content";-->

<!--const emit = defineEmits(['close'])-->

<!--/** 你的目标表单对象 */-->
<!--const inspectionRecord = reactive({-->
<!--  resource: '',-->
<!--  inspectionNumber: '',-->
<!--  siteName: '',-->
<!--  detailSite: '',-->
<!--  street: '',-->
<!--  attribute: '',-->
<!--  patrolStatus: '',-->
<!--  patrolTime: '',-->
<!--  patroller: '',-->
<!--  patrolPic: '',-->
<!--  checkStatus: '',-->
<!--  reformPic: ''-->
<!--})-->

<!--/** 中文列头 → 表单字段名 */-->
<!--const HEADER_MAP = {-->
<!--  '问题来源': 'resource',-->
<!--  '巡查编号': 'inspectionNumber',-->
<!--  '工地名称': 'siteName',-->
<!--  '详细地址': 'detailSite',-->
<!--  '所属街道': 'street',-->
<!--  '问题属性': 'attribute',-->
<!--  '巡查状态': 'patrolStatus',-->
<!--  '巡查时间': 'patrolTime',-->
<!--  '巡查人':   'patroller',-->
<!--  '核查状态': 'checkStatus',-->
<!--  '备注':     null              // 若不需要可忽略；需要就加上对应字段-->
<!--}-->

<!--const fileList = ref([])-->
<!--const uploadRef = ref(null)-->

<!--/** 上传前（保留原有大小/类型校验，方便使用） */-->
<!--const beforeUpload = (file) => {-->
<!--  const isXls  = file.type === 'application/vnd.ms-excel'-->
<!--  const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'-->
<!--  const okType = isXls || isXlsx-->
<!--  if (!okType) ElMessage.error('上传文件只能是xls/xlsx格式！')-->
<!--  const okSize = file.size / 1024 / 1024 < 10-->
<!--  if (!okSize) ElMessage.error('上传文件大小不超过10M！')-->
<!--  return okType && okSize-->
<!--}-->

<!--/** 选择文件后：本地解析→填充 inspectionRecord */-->
<!--const fileChange = (file, list) => {-->
<!--  if (list.length > 0) {-->
<!--    fileList.value = [list[list.length - 1]]-->
<!--  }-->
<!--  const raw = file?.raw-->
<!--  if (!raw) return-->
<!--  readExcelFillForm(raw)-->
<!--}-->

<!--/** 复制一份空表单对象 */-->
<!--const makeEmptyRecord = () => ({-->
<!--  resource: '',-->
<!--  inspectionNumber: '',-->
<!--  siteName: '',-->
<!--  detailSite: '',-->
<!--  street: '',-->
<!--  attribute: '',-->
<!--  patrolStatus: '',-->
<!--  patrolTime: '',-->
<!--  patroller: '',-->
<!--  patrolPic: '',-->
<!--  checkStatus: '',-->
<!--  reformPic: ''-->
<!--})-->

<!--/** 本地解析 Excel：第一行是 key，第二行及以后是多行 value（字符串） */-->
<!--const readExcelFillForm = (file) => {-->
<!--  const reader = new FileReader();-->
<!--  reader.onload = async (e) => {-->
<!--    const data = new Uint8Array(e.target.result);-->
<!--    const wb = XLSX.read(data, { type: 'array' });-->
<!--    const ws = wb.Sheets[wb.SheetNames[0]];-->

<!--    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });-->
<!--    const headers = rows[0] || [];-->
<!--    const dataRows = rows.slice(1); // 从第2行开始都是数据-->

<!--    // 映射为多条记录-->
<!--    const batch = dataRows-->
<!--        .filter(r => Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')) // 跳过全空行-->
<!--        .map((values) => {-->
<!--          const rec = makeEmptyRecord();-->
<!--          headers.forEach((cnHeader, idx) => {-->
<!--            const key = HEADER_MAP[cnHeader];-->
<!--            if (!key) return; // 未映射的列跳过（如“备注”）-->
<!--            rec[key] = String(values[idx] ?? '');-->
<!--          });-->
<!--          // 巡查时间兜底-->
<!--          if (!rec.patrolTime) rec.patrolTime = formatLocalDateTime?.() || '';-->
<!--          return rec;-->
<!--        });-->

<!--    // 顺序提交，统计成功/失败-->
<!--    let ok = 0, fail = 0;-->
<!--    for (const rec of batch) {-->
<!--      try {-->
<!--        await addInspectionRecord(rec);-->
<!--        ok += 1;-->
<!--      } catch (err) {-->
<!--        console.error('提交失败：', rec, err);-->
<!--        fail += 1;-->
<!--      }-->
<!--    }-->

<!--    ElMessage.success(`导入完成：成功 ${ok} 条，失败 ${fail} 条`);-->
<!--  };-->
<!--  reader.readAsArrayBuffer(file);-->
<!--};-->

<!--const submitForm = async () => {-->
<!--  try {-->
<!--    await addInspectionRecord(inspectionRecord);-->
<!--    ElMessage({-->
<!--      message: '巡查记录提交成功',-->
<!--      type: 'success',-->
<!--    });-->
<!--  } catch (error) {-->
<!--    console.error('提交巡查记录失败：', error);-->
<!--    ElMessage.error('提交失败，请重试');-->
<!--  }-->
<!--};-->

<!--// /** 移除文件 */-->
<!--// const fileRemove = (_file, list) => {-->
<!--//   if (list.length < 1) {-->
<!--//     // 可按需清空表单-->
<!--//     // Object.keys(inspectionRecord).forEach(k => { inspectionRecord[k] = '' })-->
<!--//   }-->
<!--// }-->
<!--//-->
<!--// /** 取消并清空 */-->
<!--// const closeDialog = () => {-->
<!--//   uploadRef.value && uploadRef.value.clearFiles()-->
<!--//   fileList.value = []-->
<!--//   emit('close', false)-->
<!--// }-->
<!--</script>-->
<style scoped>

</style>