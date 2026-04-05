<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px; display: flex; align-items: center;">
      <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
        体征运行情况导入 {{ roles ? `- ${roles}` : '' }}
      </h5>
      <el-button type="primary" @click="showOptionalEntry" style="margin-right: 10px;">选项式录入</el-button>
<!--      <el-button type="primary" @click="showTableEntry">表格式录入</el-button>-->
    </el-header>
    <!-- 传递 roles 参数给子组件 -->
    <div v-if="currentView === 'OptionalEntry'">
      <OptionalEntry :initialRole="roles" />
      <!-- 标题 + 导出按钮 -->
      <div style="display:flex; align-items:center; gap:12px; margin: 12px 0 4px;">
        <el-divider content-position="left" style="margin:0; flex:0 0 auto;">统计表</el-divider>
        <el-button type="primary" size="small" @click="exportXls" :disabled="!tableCfg">导出表格</el-button>
      </div>

      <!-- 根据角色选择不同表格 -->
      <GenericScoreTable
          v-if="tableCfg"
          :columns="tableCfg.columns"
          :rows="tableCfg.rows"
      />
    </div>

    <div v-else-if="currentView === 'TableEntry'">
      <TableEntry :initialRole="roles" />
    </div>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted,watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import OptionalEntry from "./OptionalEntry.vue";
import TableEntry from "./TableEntry.vue";
import GenericScoreTable from "@/views/content/components/GenericScoreTable.vue";
import * as XLSX from 'xlsx'
import {
  getInspectionRecordsBySystem,
  getStreetDailyStatics,
  getEnvChecks,
  getSignDoorData,
  getCityOrderCheckData, getSootTzData, getBikeTzData, getDdzhMaininfo,
  getSjtj
} from "@/api/content";
import {
  envChecks,
  streetStatics,
  signDoorRaw,
  inspectionRecordsMap,
  buildRoleRows, cityOrderShop, oilSootPatrol, bikeTzPatrol,ddzhMaininfo,
  cityManagementScore
} from '@/views/content/components/roleScoreConfig'

const tableCfg = computed(() => buildRoleRows(roles.value))


const route = useRoute();
const currentView = ref('OptionalEntry');


onMounted(async () => {
  try {
    const data = await getEnvChecks()
    envChecks.value = Array.isArray(data) ? data : (data?.data || [])
    // console.log('envChecks', envChecks.value)
  } catch (e) {
    console.error('获取环境卫生-实地检查失败：', e)
  }
})
// 从路由查询参数中获取roles
const roles = computed(() => {
  const r = route.query.roles
  // 如果是 ?roles=环境卫生 => 字符串
  // 如果是 ?roles=环境卫生&roles=网络理政 => 数组
  let val = Array.isArray(r) ? r[0] : r || ''
  if (typeof val === 'string') {
    val = val.trim()   // 去掉两侧空格
  }
  console.log('[roles] normalized =', val)
  return val
})
watchEffect(() => {
  console.log('[roles] route.query.roles =', route.query.roles)
  console.log('[roles] roles.value =', roles.value)
})

const showOptionalEntry = () => {
  currentView.value = 'OptionalEntry';
};

const showTableEntry = () => {
  currentView.value = 'TableEntry';
};

const flattenColumns = (cols, path = []) => {
  const out = []
  cols?.forEach(c => {
    const curPath = [...path, c.label]
    if (Array.isArray(c.children) && c.children.length) {
      out.push(...flattenColumns(c.children, curPath))
    } else {
      out.push({
        header: curPath.join(' - '),
        prop: c.prop || null
      })
    }
  })
  return out
}

// 导出 .xls
const exportXls = () => {
  if (!tableCfg?.value) return
  const cols = flattenColumns(tableCfg.value.columns)
  // 过滤掉没有 prop 的“纯分组列”
  const leafCols = cols.filter(c => !!c.prop)

  // 表头
  const headerRow = leafCols.map(c => c.header)

  // 数据
  const dataRows = (tableCfg.value.rows || []).map(row =>
      leafCols.map(c => row?.[c.prop] ?? '')
  )

  const aoa = [headerRow, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '统计表')

  // 文件名：角色名_统计表_YYYYMMDD.xls
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const roleName = (typeof roles?.value === 'string' && roles.value) ? roles.value : '表格'
  const fileName = `${roleName}_统计表_${yyyy}${mm}${dd}.xls`

  XLSX.writeFile(wb, fileName, { bookType: 'xls' })   // ⬅️ 导出为 .xls
}


// const inspectionRecordsMap = ref({})
onMounted(async () => {
  const systemName = roles.value;   // 当前页面系统，例如 "扬尘治理" / "广告招牌"
  try {
    const data = await getInspectionRecordsBySystem(systemName)
    inspectionRecordsMap.value[systemName] = data
    console.log(`✅ 已获取 ${systemName} 巡查记录：`, data)
  } catch (err) {
    console.error(`❌ 获取 ${systemName} 巡查记录失败:`, err)
  }
})



onMounted(async () => {
  try {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const month = `${now.getFullYear()}-${pad(now.getMonth())}`  // 形如 2025-10

    const resp = await getSignDoorData(month)
    // 后端返回 CommonResult<List<JSONObject>>
    signDoorRaw.value = resp
    console.log('✅ 已加载临街店铺管家招牌审批量：', signDoorRaw.value)
  } catch (e) {
    console.error('❌ 获取招牌审批量失败：', e)
  }
})

onMounted(async () => {
  try {
    const resp = await getCityOrderCheckData()
    // 后端返回的是 ResponseData<JSONObject>，data 里面再包一层 data
    // 即 resp.data.data.data.shop
    const root = resp.data?.data || {}
    const shop = resp.data.shop // 兼容一下结构
    console.log('[市容秩序] 外部 shop 数据：', shop)
    cityOrderShop.value = shop
  } catch (e) {
    console.error('[市容秩序] 拉取外部 shop 数据失败：', e)
    // 拉取失败时 cityOrderShop 为空，前面的规则会默认给 10 分
  }
})

onMounted(async () => {
  try {
    const resp = await getStreetDailyStatics()
    streetStatics.value = resp
    console.log("✅ 已加载街道体征统计：", streetStatics.value)
  } catch (err) {
    // --- 新增完整调试日志 ---
    console.error("❌ 获取街道体征统计失败:", err)

    if (err.response) {
      console.error("❌ 请求失败详情：", {
        url: err.config?.url,
        method: err.config?.method,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
      })
    } else if (err.request) {
      console.error("⚠️ 请求已发出但无响应：", {
        url: err.config?.url,
        method: err.config?.method,
        request: err.request,
      })
    } else {
      console.error("⚠️ 请求设置错误：", err.message)
    }
  }
})

onMounted(async () => {
  const today = new Date();
  today.setDate(today.getDate() - 1)
  const dayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  try {
    const resp = await getBikeTzData(dayStr);
    console.log('✅ 已加载共享单车体征数据：', resp);

    bikeTzPatrol.value = resp
    console.log('🚲 共享单车体征数据已加载：', bikeTzPatrol.value);
  } catch (e) {
    console.error('加载共享单车体征数据失败:', e);
  }
});
onMounted(() => {
  loadOilSootData();
});
const loadOilSootData = async () => {
  // 当前月份：yyyy-MM
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  console.log('当前月份：', monthStr)
  try {
    const resp = await getSootTzData(monthStr);
    console.log('✅ 已加载 餐饮油烟体征数据：', resp);
    const list = resp.data;

    oilSootPatrol.value = resp;

    console.log('🍳 餐饮油烟体征数据已加载：', oilSootPatrol.value);
  } catch (e) {
    console.error('加载餐饮油烟体征数据失败:', e);
  }
};
// 新增：加载钉钉综合信息（适配 code:2000）
onMounted(async () => {
  try {
    const resp = await getDdzhMaininfo()
    // 接口返回格式：{ code:2000, msg:"请求成功", data:{ 街道数据 } }
    if (resp) {
      ddzhMaininfo.value = resp
      console.log('✅ 已加载钉钉综合信息：', ddzhMaininfo.value)
    } else {
      console.warn('⚠ 钉钉综合信息接口返回格式异常：', resp)
      ddzhMaininfo.value = {}
    }
  } catch (e) {
    console.error('❌ 获取钉钉综合信息失败：', e)
    ddzhMaininfo.value = {}
  }
})

onMounted(async () => {
  try {
    const resp = await getSjtj() // 调用数字城管接口
    // 适配项目现有接口返回格式（参考其他接口：优先取 resp.data 或直接取 resp）
    const scoreData = resp.data || resp
    if (scoreData) {
      cityManagementScore.value = scoreData // 赋值给共享数据源，供 roleScoreConfig 使用
      console.log('✅ 已加载数字城管分数：', cityManagementScore.value)
    } else {
      console.warn('⚠ 数字城管接口返回格式异常：', resp)
      cityManagementScore.value = null // 兜底为 null，让 ROLE_RULES 返回静态分数
    }
  } catch (e) {
    console.error('❌ 获取数字城管分数失败：', e)
    cityManagementScore.value = null // 兜底为 null，保证系统稳定性
  }
})
</script>