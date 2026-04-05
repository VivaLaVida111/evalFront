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
import { addInspectionRecord } from '@/api/content'   // ← 按需替换为你的真实 API

const emit = defineEmits(['close'])

/** 中文列头 → 字段名（本板块） */
const HEADER_MAP = {
  '问题来源':       'resource',
  '检查编号':       'checkNumber',
  '检查时间':       'checkTime',      // DATETIME
  '所属街道':       'street',
  '详细地址':       'detailAddress',
  '存在问题':       'problemDesc',
  '问题照片':       'problemPic',
  '是否下发提示单': 'noticeIssued',
  '核查状态':       'checkStatus',
  '备注':           'note'
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
            checkNumber: null,
            checkTime: null,         // DATETIME
            street: null,
            detailAddress: null,
            problemDesc: null,
            problemPic: null,
            noticeIssued: null,
            checkStatus: null,
            note: null,
            systemName: '市容秩序'
          }
          headers.forEach((cnHeader, idx) => {
            const key = HEADER_MAP[cnHeader]
            if (!key) return
            let val = values[idx]

            // 检查时间：Excel 日期序列号 -> yyyy-MM-dd HH:mm:ss
            if (key === 'checkTime' && typeof val === 'number') {
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
        await addInspectionRecord(rec) // ← 替换为你的提交方法
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

// 工具：yyyy-MM-dd HH:mm:ss
const pad = (n) => String(n).padStart(2, '0')
const formatDate = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

/** 可选：移除文件 */
const fileRemove = (_file, list) => {
  if (list.length < 1) {
    // 可按需清空或重置状态
  }
}
</script>

<style scoped>
</style>