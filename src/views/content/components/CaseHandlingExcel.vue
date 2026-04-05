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
    <!-- 若需要“确认导入”按钮，这里再加 -->
    <!-- <el-button type="primary" size="small" @click="confirmImport">确认导入</el-button> -->
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
// TODO: 替换成你实际的 API 方法
import { addCaseRecord } from '@/api/content'   // 假设后端提供“新增案件办理记录”接口

const emit = defineEmits(['close'])

/** 中文列头 → 后端字段名（不需要的列映射为 null） */
const HEADER_MAP = {
  '序号': null,
  '案件类型': 'caseType',
  '执法程序（一般、简易、行政强制）': 'procedure',
  '案件名称/案由': 'caseTitle',
  '违法人姓名或违法企业名称': 'illegalName',
  '联系方式': 'contact',
  '违法人类别（自然人、个体工商户、企业的填法人姓名）': 'illegalCategory',
  '法人姓名': 'legalPerson',
  '统一社会信用代码': 'creditCode',
  '身份证号码': 'idNumber',
  '线索来源（日常巡查、上级交办、部门移交、举报投诉）': 'clueSource',
  '现场检查时间': 'checkTime',
  '违法地点': 'illegalAddress',
  '违法行为': 'illegalBehavior',
  '违法依据': 'illegalBasis',
  '处罚依据': 'punishBasis',
  '立案日期（年/月/日）': 'registerDate',            // 注意你的表头里有换行，这里保留
  '处罚决定书日期（年/月/日）': 'decisionDate',
  '结案日期（年/月/日）': 'closeDate',
  '上交月份': 'submitMonth',
  '处罚决定书编号': 'decisionNo',
  '承办单位': 'undertakeDept',
  '自由裁量权幅度（一般、减轻、从轻、从重、不予处罚、免于处罚）': 'discretionLevel',
  '是否公示': 'isPublic',
  '是否听证': 'isHearing',
  '是否召开案审会': 'isReviewMeeting',
  '是否重大行政执法案件': 'isMajorCase',
  '处罚类型（罚款、予以警告、拆除、未罚款、其他）': 'punishType',
  '罚款金额': 'fineAmount',
  '罚没收据编号': 'receiptNo',
  '办案人员': 'handlers',
  '是否有全过程记录': 'hasFullRecord',
  '备注': 'remark',
}

/** 哪些键需要按“日期/月份”处理（Excel 序列号 → 字符串） */
const DATE_KEYS = new Set(['checkTime', 'registerDate', 'decisionDate', 'closeDate'])
const MONTH_KEYS = new Set(['submitMonth'])

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

const fileRemove = () => { fileList.value = [] }

/** 选择文件后解析 */
const fileChange = (file, list) => {
  if (list.length > 0) fileList.value = [list[list.length - 1]]
  const raw = file?.raw
  if (!raw) return
  readExcelAndSubmit(raw)
}

/** 生成空记录（所有字段可选） */
const makeEmptyRecord = () => ({
  caseType: null,
  procedure: null,
  caseTitle: null,
  illegalName: null,
  contact: null,
  illegalCategory: null,
  legalPerson: null,
  creditCode: null,
  idNumber: null,
  clueSource: null,
  checkTime: null,
  illegalAddress: null,
  illegalBehavior: null,
  illegalBasis: null,
  punishBasis: null,
  registerDate: null,
  decisionDate: null,
  closeDate: null,
  submitMonth: null,
  decisionNo: null,
  undertakeDept: null,
  discretionLevel: null,
  isPublic: null,
  isHearing: null,
  isReviewMeeting: null,
  isMajorCase: null,
  punishType: null,
  fineAmount: null,
  receiptNo: null,
  handlers: null,
  hasFullRecord: null,
  remark: null,
})

/** 补零工具 */
const pad = (n) => String(n).padStart(2, '0')
const formatDateTime = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const formatYearMonth = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}`

/** 把 Excel 值按需要转换为字符串（日期、月份、数字等） */
const normalizeCell = (key, rawVal) => {
  let val = rawVal

  // 纯空处理
  if (val === undefined || val === null) return null
  if (typeof val === 'string' && val.trim() === '') return null

  // 日期/月份：Excel 序列号 -> JS Date -> 字符串
  if (typeof val === 'number') {
    if (DATE_KEYS.has(key) || MONTH_KEYS.has(key)) {
      const d = XLSX.SSF.parse_date_code(val)
      if (d) {
        const jsDate = new Date(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, d.S || 0)
        if (DATE_KEYS.has(key)) {
          // checkTime 通常要到时分秒；其它日期字段保留到日
          return key === 'checkTime'
              ? formatDateTime(jsDate)
              : formatDate(jsDate)
        }
        if (MONTH_KEYS.has(key)) return formatYearMonth(jsDate)
      }
    }
  }

  // 罚款金额等数字，保持字符串或数值均可；这里统一转成字符串，便于后端接收
  return String(val).trim()
}

/** 读取 Excel 并逐条提交 */
const readExcelAndSubmit = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]

    // 按“第二行是表头、第三行起是数据”的模式（保持与你原组件一致）
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    const headers = rows[1] || []
    const dataRows = rows.slice(2)

    // 建表头索引
    const headerIndexMap = {}
    headers.forEach((h, i) => { headerIndexMap[String(h).trim()] = i })

    // 组装批量 payload
    const batch = dataRows
        .filter(r => Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
        .map(values => {
          const rec = makeEmptyRecord()
          Object.entries(HEADER_MAP).forEach(([cnHeader, key]) => {
            if (!key) return
            const idx = headerIndexMap[cnHeader]
            if (idx === undefined) return
            rec[key] = normalizeCell(key, values[idx])
          })
          return rec
        })

    let ok = 0, fail = 0
    for (const rec of batch) {
      try {
        await addCaseRecord(rec)   // TODO: 替换成你的真实提交方法
        ok++
      } catch (err) {
        fail++
        console.error('提交失败 payload =', rec, err?.response?.data || err)
      }
    }

    ElMessage.success(`导入完成：成功 ${ok} 条，失败 ${fail} 条`)
  }
  reader.readAsArrayBuffer(file)
}
</script>
