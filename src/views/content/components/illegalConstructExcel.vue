<template>
  <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
    违建拆除
  </h5>
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
    <!-- 如需“确认导入”按钮可在此开启 -->
    <!-- <el-button type="primary" size="small" @click="confirmImport">确认导入</el-button> -->
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
// TODO: 换成你后端真实接口方法
import { addDemolitionRecord } from '@/api/content'

const emit = defineEmits(['close'])

/** 中文列头 → 后端字段名（不需要的列映射为 null） */
const HEADER_MAP = {
  '序号': null,
  '填报单位(form_6)': 'reportUnit',
  '填报时间(form_7)': 'reportDate',
  '所属街办(form_8)': 'street',
  '所属社区(form_9)': 'community',
  '违建名称(form_10)': 'illegalName',
  '违建地址(form_11)': 'illegalAddress',
  '公共区域住宅小区(form_18)': 'publicAreaOrCommunity',
  '违建位置(form_14)': 'illegalLocation',
  '违建用途(form_15)': 'illegalUsage',
  '拆除时间(form_27)': 'demolitionDate',
  '拆除面积（平方米）(form_19)': 'demolitionArea',
  '新增存量(form_20)': 'stockType',
  '是否涉及征地拆迁(form_21)': 'involvesLandDemolition',
  '涉及专项整治(form_23)': 'specialRectification',
  '安全隐患(form_24)': 'safetyHazard',
  '备注（自建房）(form_25)': 'remarkSelfBuilt',
}

/** 需要按“日期”处理的键（Excel 序列号 → 'YYYY-MM-DD'） */
const DATE_KEYS = new Set(['reportDate', 'demolitionDate'])

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

/** 生成空记录（全部可选） */
const makeEmptyRecord = () => ({
  reportUnit: null,              // 填报单位
  reportDate: null,              // 填报时间 (yyyy-MM-dd)
  street: null,                  // 所属街办
  community: null,               // 所属社区
  illegalName: null,             // 违建名称
  illegalAddress: null,          // 违建地址
  publicAreaOrCommunity: null,   // 公共区域/住宅小区
  illegalLocation: null,         // 违建位置
  illegalUsage: null,            // 违建用途
  demolitionDate: null,          // 拆除时间 (yyyy-MM-dd)
  demolitionArea: null,          // 拆除面积（平方米）
  stockType: null,               // 新增/存量
  involvesLandDemolition: null,  // 是否涉及征地拆迁
  specialRectification: null,    // 涉及专项整治
  safetyHazard: null,            // 安全隐患
  remarkSelfBuilt: null,         // 备注（自建房）
})

/** 补零工具 */
const pad = (n) => String(n).padStart(2, '0')
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

/** 把 Excel 值按需要转换为字符串（日期、数字等） */
const normalizeCell = (key, rawVal) => {
  let val = rawVal
  if (val === undefined || val === null) return null
  if (typeof val === 'string' && val.trim() === '') return null

  // Excel 序列号 → 日期字符串
  if (typeof val === 'number' && DATE_KEYS.has(key)) {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) {
      const jsDate = new Date(d.y, d.m - 1, d.d)
      return formatDate(jsDate) // yyyy-MM-dd
    }
  }

  // 其它直接转字符串（比如 “是/否”、“新增/存量”、“平方米数值”）
  return String(val).trim()
}

/** 读取 Excel 并逐条提交 */
const readExcelAndSubmit = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]

    // 与现有组件保持一致：第2行表头、第3行起数据
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    const headers = rows[1] || []
    const dataRows = rows.slice(2)

    const headerIndexMap = {}
    headers.forEach((h, i) => { headerIndexMap[String(h).trim()] = i })

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
        await addDemolitionRecord(rec) // ← 替换成你的真实接口
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

