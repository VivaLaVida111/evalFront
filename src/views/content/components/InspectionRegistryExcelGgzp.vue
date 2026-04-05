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
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { addInspectionRecord } from "@/api/content" // 按你现有写法保留

const emit = defineEmits(['close'])

/** 中文列头 → 字段名（新版块） */
const HEADER_MAP = {
  '问题来源':     'resource',
  '巡查编号':     'inspectionNumber',
  '下发时间':     'issuedTime',
  '整改时间':     'rectifyTime',
  '所属街办':     'streetOffice',
  '详细地址':     'detailAddress',
  '存在问题':     'problemDesc',
  '整改前照片':   'beforePic',
  '整改后照片':   'afterPic',
  '是否按期整改': 'rectifiedOnTime',
  '情况说明':     'remarkDesc',
  '备注':         'note'  // 如果不需要可以改为 null 忽略
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

/** 创建一条空记录对象（新版块字段） */
const makeEmptyRecord = () => ({
  resource: null,
  inspectionNumber: null,
  issuedTime: null,        // DATETIME
  rectifyTime: null,       // DATETIME
  streetOffice: null,
  detailAddress: null,
  problemDesc: null,
  beforePic: null,
  afterPic: null,
  rectifiedOnTime: null,
  remarkDesc: null,
  note: null
})

/** 把 Excel 一行数据转成提交 payload（仅字段替换） */
const toServerPayload = (row) => {
  const p = makeEmptyRecord()
  for (const [cnHeader, key] of Object.entries(HEADER_MAP)) {
    if (!key) continue
    const idx = row.headerIndexMap[cnHeader]
    if (idx === undefined) continue
    let val = row.values[idx]

    // // 下发时间 / 整改时间：支持 Excel 数字日期 → 字符串 'yyyy-MM-dd HH:mm:ss'
    // if ((key === 'issuedTime' || key === 'rectifyTime') && typeof val === 'number') {
    //   const d = XLSX.SSF.parse_date_code(val)
    //   if (d) {
    //     const js = new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S)
    //     val = formatDate(js)
    //   }
    // }

    p[key] = (val !== undefined && val !== null && String(val).trim() !== '')
        ? String(val).trim()
        : null
  }
  return p
}

// 格式化函数（yyyy-MM-dd HH:mm:ss）
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
            issuedTime: null,
            rectifyTime: null,
            streetOffice: null,
            detailAddress: null,
            problemDesc: null,
            beforePic: null,
            afterPic: null,
            rectifiedOnTime: null,
            remarkDesc: null,
            note: null
          }
          headers.forEach((cnHeader, idx) => {
            const key = HEADER_MAP[cnHeader]
            if (!key) return
            let val = values[idx]

            // 下发时间 / 整改时间：Excel 日期序列号 -> yyyy-MM-dd HH:mm:ss
            if ((key === 'issuedTime' || key === 'rectifyTime') && typeof val === 'number') {
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

/** 可选：移除文件 */
const fileRemove = (_file, list) => {
  if (list.length < 1) {
    // nothing
  }
}
</script>

<style scoped>
</style>
