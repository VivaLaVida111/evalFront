// roleScoreConfig.js
import { ref, computed } from 'vue'

/* ============================================================
 *  1. 共享数据源（由各页面在 onMounted 里去填充）
 * ========================================================== */

// 1) 各系统巡查记录（键：系统名，如“扬尘治理”、“广告招牌”）
export const inspectionRecordsMap = ref({})

// 2) 环境卫生 - 实地检查记录 env_check 表
export const envChecks = ref([])

// 3) 网络理政 - 外部接口 streetDailyStatics 的原始数据
export const streetStatics = ref([])

// 4) 广告招牌 - 临街店铺管家招牌审批量
export const signDoorRaw = ref([])

// 5) 市容秩序 - 外部 shop 数据（临街店铺巡查 / 问题处置率）
export const cityOrderShop = ref([])
// 6) 数字城管 - 存储数字城管后端返回的分数
export const cityManagementScore = ref(null)

// —— 市容秩序 shop 数据索引：街道 -> 该街道的 shop 记录 ——
export const cityOrderShopIndex = computed(() => {
    const map = Object.create(null)
    for (const it of (cityOrderShop.value || [])) {
        // 外部字段：streetName / checkRate / disposeRate
        const name = String(it.streetName || '')
        map[name] = it
    }
    return map
})
// 6)油烟治理 - 油烟治理系统巡查记录
export const oilSootPatrol = ref([]);
// 餐饮油烟体征索引： area_name → { patrol_p_1, patrol_p_2, patrol_g_1, patrol_g_2, ... }
export const oilSootIndex = computed(() => {
    const map = Object.create(null);
    for (const it of (oilSootPatrol.value || [])) {
        const name = String(it.area_name || '');
        map[name] = it;
    }
    return map;
});

// 7) 共享单车 - 体征数据（外部接口 GetBikeTzData）
export const bikeTzPatrol = ref([]);

// 共享单车：体征索引（街道名 -> 一整条对象）
export const bikeTzIndex = computed(() => {
    const map = Object.create(null);
    for (const it of (bikeTzPatrol.value || [])) {
        // 外部字段：area_name，例如 “抚琴街道”
        const name = String(it.area_name || '');
        map[name] = it;
    }
    return map;
});

export const ddzhMaininfo = ref({})

// —— 钉钉综合信息索引（街道 -> 打卡/在岗数据）——
export const ddzhMaininfoIndex = computed(() => {
    const map = Object.create(null)
    const data = ddzhMaininfo.value || {}
    // 遍历接口返回的街道数据
    for (const streetName in data) {
        if (Object.prototype.hasOwnProperty.call(data, streetName)) {
            map[streetName] = data[streetName]
        }
    }
    return map
})
// 新增：解析钉钉百分比字符串（适配 "20 %" 格式）
function ddPercentToFloat(p) {
    if (!p || typeof p !== 'string') return null
    // 提取数字部分（兼容 "20 %"、"31%" 等格式）
    const num = parseFloat(p.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? null : num / 100
}
/* ============================================================
 *  2. 工具：街道名称 / 面积人口 / 外部指标索引
 * ========================================================== */

// —— 街道 → 面积 / 人口（给网络理政用）——
const AREA_POP = {
    '抚琴街道':   { area: 0.026, pop: 2.141 },
    '西安路街道': { area: 0.047, pop: 0.953 },
    '驷马桥街道': { area: 0.026, pop: 1.984 },
    '荷花池街道': { area: 0.038, pop: 1.462 },
    '五块石街道': { area: 0.051, pop: 1.370 },
    '九里堤街道': { area: 0.036, pop: 1.089 },
    '营门口街道': { area: 0.028, pop: 1.004 },
    '茶店子街道': { area: 0.032, pop: 0.922 },
    '金泉街道':   { area: 0.120, pop: 0.576 },
    '天回镇街道': { area: 0.118, pop: 0.591 },
    '沙河源街道': { area: 0.108, pop: 0.611 },
    '凤凰山街道': { area: 0.305, pop: 0.135 },
    '西华街道':   { area: 0.065, pop: 0.162 },
}

// 网络理政：街道体征索引
export const streetStatIndex = computed(() => {
    const map = Object.create(null)
    for (const it of (streetStatics.value || [])) {
        // 接口里就是“抚琴街道 / 西安路街道 …”
        const name = String(it.streetName || '')
        map[name] = it
    }
    return map
})

// 网络理政：从一行数据中提取原始指标
export function pickGov(row) {
    const name = String(row.street || '')         // 行里现在也是 “抚琴街道 / 西安路街道”
    const stat = streetStatIndex.value[name] || {}
    const ap = AREA_POP[name] || { area: 0.001, pop: 1 } // 防止除零

    const accept   = Number(stat.accept)          || 0
    const finished = Number(stat.finished)        || 0
    const diss     = Number(stat.dissatisfaction) || 0
    const repeat   = Number(stat.repeat)          || 0
    const overdue  = Number(stat.overdue)         || 0
    const cycle    = Number(stat.cycle)           || 0

    const area = Number(ap.area) || 0.001
    const pop  = Number(ap.pop)  || 1

    const satRate = finished > 0 ? Math.max(0, 1 - diss / finished) : 1

    return { accept, finished, diss, repeat, overdue, cycle, area, pop, satRate }
}

// 广告招牌：临街店铺审批量索引
export const signDoorIndex = computed(() => {
    const map = Object.create(null)
    for (const it of (signDoorRaw.value || [])) {
        // 后端返回字段，例如：{ name: "抚琴街道", cnt: 27 }
        const name = String(it.name || '')
        map[name] = Number(it.cnt) || 0
    }
    return map
})

// 各街道招牌审批量达标阈值
// 一档 ≥25：西安路、抚琴、驷马桥、茶店子、荷花池
// 二档 ≥10：九里堤、五块石、营门口、金泉、天回镇
// 三档 ≥5 ：沙河源、西华
// 四档 ≥2 ：凤凰山
const SIGN_THRESHOLD = {
    '西安路街道': 25,
    '抚琴街道':   25,
    '驷马桥街道': 25,
    '茶店子街道': 25,
    '荷花池街道': 25,

    '九里堤街道': 10,
    '五块石街道': 10,
    '营门口街道': 10,
    '金泉街道':   10,
    '天回镇街道': 10,

    '沙河源街道': 5,
    '西华街道':   5,

    '凤凰山街道': 2,
}

// 广告招牌：取审批量 + 阈值
export function pickSign(row) {
    const key = String(row.street || '')      // 比如 “抚琴街道”
    const cnt = signDoorIndex.value[key] || 0 // 当月审批量
    const need = SIGN_THRESHOLD[key] ?? 0     // 该街道达标阈值
    return { cnt, need }
}

// 环境卫生：按街道 + 管理主体 + 问题类别 计数
export function countEnv(street, manageSubject, problemCategory) {
    if (!street) return 0
    return (envChecks.value || []).filter(r =>
        r?.street === street &&
        r?.manageSubject === manageSubject &&
        r?.problemCategory === problemCategory
    ).length
}

// 把 '67.09%' 这种字符串转成 0~1 的小数
function percentToFloat(p) {
    if (typeof p !== 'string') return null
    const n = parseFloat(p.replace('%', ''))
    if (isNaN(n)) return null
    return n / 100
}
/* ============================================================
 *  3. 角色 → 字段规则（原先的 ROLE_RULES 搬到这里）
 * ========================================================== */

export const ROLE_RULES = {
    '扬尘治理': {
        sj_found: (row) => {
            const systemName = '扬尘治理';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '市上巡查' && r.street === row.street
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 1, 10);
            return 10 - deduct;
        },
        sj_unrect: (row) => {
            const systemName = '扬尘治理';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '市上巡查' && r.street === row.street && r.checkStatus === '未整改'
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 1, 10);
            return 10 - deduct;
        },
        qj_found: (row) => {
            const systemName = '扬尘治理';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '区上巡查' && r.street === row.street
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 0.5, 15);
            return 15 - deduct;
        },
        qj_unrect: (row) => {
            const systemName = '扬尘治理';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '区上巡查' && r.street === row.street && r.checkStatus === '未整改'
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 0.5, 15);
            return 15 - deduct;
        },
        jd_unpatrol: (row) => {
            const systemName = '扬尘治理';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '街道自查' && r.street === row.street
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 0.1, 5);  // 每条扣 0.1 分，最多扣 5 分
            return 35 - deduct;                        // 初始 35 分
        },
        aj_score: () => 0,
        qt_score: () => 10,
    },

    '违法建设': {
        ts_count: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 0
            const violation = item.streetCntList?.find(c => c.cntName === '违建')
            return violation ? violation.count : 0
        },
        ts_score: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 30
            const violation = item.streetCntList?.find(c => c.cntName === '违建')
            const count = violation ? violation.count : 0
            const deduct = Math.min(count * 0.5, 30)
            return Math.max(30 - deduct, 0)
        },

        rpt_points: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 0
            const violation = item.streetCntList?.find(c => c.cntName === '违建')
            return violation ? violation.repeatTimes : 0
        },
        rpt_score: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 20
            const violation = item.streetCntList?.find(c => c.cntName === '违建')
            const rpt = violation ? violation.repeatTimes : 0
            const deduct = Math.min(rpt * 1, 20)
            return Math.max(20 - deduct, 0)
        },

        remove_points: (row) => 0,
        remove_score:  (row) => Math.min(5 * (row.remove_points || 0), 20),

        case_count: (row) => 0,
        case_score: (row) => Math.min(5 * (row.case_count || 0), 10),

        other_score: (row) => 20,
    },

    '广告招牌': {
        sign_pass:   (row) => {
            const { cnt } = pickSign(row)
            return cnt
        },
        sign_deduct: (row) => {
            const { cnt, need } = pickSign(row)
            if (!need) return 0
            return cnt >= need ? 0 : 3
        },
        sign_score:  (row) => {
            const deduct = ROLE_RULES['广告招牌'].sign_deduct(row)
            return Math.max(0, 30 - deduct)
        },

        rep_cnt: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 0
            const signItem = item.streetCntList?.find(c => c.cntName === '广告招牌')
            return signItem ? (signItem.repeatTimes || 0) : 0
        },
        rep_score: (row) => {
            const item = streetStatics.value.find(
                s => s.streetName?.includes(row.street)
            )
            if (!item) return 10
            const signItem = item.streetCntList?.find(c => c.cntName === '广告招牌')
            const repeatCnt = signItem ? (signItem.repeatTimes || 0) : 0
            const deduct = Math.min(repeatCnt * 1, 10)
            return Math.max(10 - deduct, 0)
        },

        city_found:  (row) => {
            const systemName = '广告招牌';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '区上巡查' && r.street === row.street
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 1, 10);
            return 10 - deduct;
        },
        city_unrect: (row) => {
            const systemName = '广告招牌';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.resource === '区上巡查' && r.street === row.street && r.checkStatus === '未整改'
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 1, 10);
            return 10 - deduct;
        },
        self_rate:   () => 5,
        self_score:  () => 25,
        other_score: () => 10,
    },

    '油烟治理': {
        ts_accept: (row) => {
            const stat = streetStatics.value.find(s => s.streetName?.includes(row.street))
            if (!stat) return 0
            const item = stat.streetCntList?.find(c => c.cntName === '油烟治理')
                || stat.streetCntList?.find(c => c.cntName === '油烟')
            return item ? (item.count || 0) : 0
        },
        ts_area: (row) => AREA_POP[row.street]?.area ?? 0,
        ts_pop:  (row) => AREA_POP[row.street]?.pop  ?? 0,
        ts_score: (row) => {
            const cnt  = ROLE_RULES['油烟治理'].ts_accept(row)
            const area = ROLE_RULES['油烟治理'].ts_area(row)
            const pop  = ROLE_RULES['油烟治理'].ts_pop(row)
            if (!area || !pop) return 30
            const raw = 30 - (cnt * 0.01) / (area * pop)
            return Math.max(0, Math.min(30, Number(raw.toFixed(2))))
        },

        rpt_points: (row) => {
            const stat = streetStatics.value.find(s => s.streetName?.includes(row.street))
            if (!stat) return 0
            const item = stat.streetCntList?.find(c => c.cntName === '油烟治理')
                || stat.streetCntList?.find(c => c.cntName === '油烟')
            return item ? (item.repeatTimes || 0) : 0
        },
        rpt_score: (row) => {
            const rpt = ROLE_RULES['油烟治理'].rpt_points(row)
            const deduct = Math.min(rpt, 10)
            return Math.max(0, 10 - deduct)
        },

        // patrol_p_1 → 重点巡查“发现问题”原始值
        zd_problem: (row) => {
            const it = oilSootIndex.value[row.street];
            if (!it) return 0;
            return Number(it.patrol_p_1 || 0);
        },
        // patrol_p_2 → 重点巡查得分（20 分制）
        zd_score:   (row) => {
            const it = oilSootIndex.value[row.street];
            if (!it) return 20;              // 无数据则给满分，保持原逻辑
            const v = Number(it.patrol_p_2 || 0);
            return Number(v.toFixed(2));
        },

        // patrol_g_1 → 街道自查“巡查完成率”（原始数值）
        jd_rate:  (row) => {
            const it = oilSootIndex.value[row.street];
            if (!it) return 0;
            return Number(it.patrol_g_1 || 0);
        },
        // patrol_g_2 → 街道自查得分（25 分制）
        jd_score: (row) => {
            const it = oilSootIndex.value[row.street];
            if (!it) return 25;              // 无数据则给满分
            const v = Number(it.patrol_g_2 || 0);
            return Number(v.toFixed(2));
        },

        case_count: () => 0,
        case_score: () => 0,

        qt_rule:  () => 0,
        qt_score: () => 10,
    },

    '市容秩序': {
        // 打卡率得分 = 打卡率（0-1） * 15
        dd_clock: (row) => {
            const streetName = String(row.street || '')
            const ddData = ddzhMaininfoIndex.value[streetName]

            // 无数据/状态非成功时返回默认值15
            if (!ddData || ddData.status !== '成功') {
                return 15
            }

            // 解析打卡率（如 "20 %" → 0.2）
            const checkRate = ddPercentToFloat(ddData['今日打卡率'])
            if (checkRate === null) return 15

            // 计算得分并保留2位小数
            return Number((checkRate * 15).toFixed(2))
        },

        // 在岗率得分 = 在岗率（0-1） * 15
        // 在岗率 = 今日在岗人数 / (今日在岗人数 + 今日定位异常人数)
        dd_onguard: (row) => {
            const streetName = String(row.street || '')
            const ddData = ddzhMaininfoIndex.value[streetName]

            // 无数据/状态非成功时返回默认值15
            if (!ddData || ddData.status !== '成功') {
                return 15
            }

            // 提取在岗人数和定位异常人数（转数字，兜底0）
            const onWorkNum = Number(ddData['今日在岗人数'] || 0)
            const abnormalNum = Number(ddData['今日定位异常人数'] || 0)

            // 避免除零（总人数为0时返回满分15）
            const total = onWorkNum + abnormalNum
            if (total === 0) return 15

            // 计算在岗率
            const onWorkRate = onWorkNum / total

            // 计算得分并保留2位小数
            return Number((onWorkRate * 15).toFixed(2))
        },
        fj_find_cnt: () => 0,
        fj_score:    (row) => {
            const systemName = '市容秩序';
            const records = inspectionRecordsMap.value[systemName] || [];
            const filteredRecords = records.filter(r =>
                r.street === row.street
            );
            const count = filteredRecords.length;
            const deduct = Math.min(count * 5, 20);
            // 目前逻辑保持原样：始终返回 20
            return 20;
        },

        // 临街店铺巡查 = 当日临街店铺巡查率 * 10
        rc_shop: (row) => {
            const rec = cityOrderShopIndex.value[row.street]
            if (!rec) {
                // 没有外部数据时按满分处理
                return 10
            }
            const rate = percentToFloat(rec.checkRate)
            if (rate == null) return 10
            return Number((rate * 10).toFixed(2))
        },

        // 问题发现处置 = 当日问题发现处置率 * 10
        rc_dispose: (row) => {
            const rec = cityOrderShopIndex.value[row.street]
            if (!rec) {
                return 10
            }
            const rate = percentToFloat(rec.disposeRate)
            if (rate == null) return 10
            return Number((rate * 10).toFixed(2))
        },

        rpt5_cnt: (row) => {
            const item = streetStatics.value.find(s => s.streetName?.includes(row.street))
            if (!item) return 0
            const record = item.streetCntList?.find(c =>
                c.cntName === '市容秩序' || c.cntName === '市容'
            )
            return record ? (record.repeatTimes || 0) : 0
        },
        rpt5_score: (row) => {
            const rpt = ROLE_RULES['市容秩序'].rpt5_cnt(row)
            const deduct = Math.min(rpt * 1, 20)
            return Math.max(0, 20 - deduct)
        },

        qt_rule:  () => 0,
        qt_score: () => 10,
    },

    '网络理政': {
        sl_count:  (row) => pickGov(row).accept,
        sl_area:   (row) => pickGov(row).area,
        sl_pop:    (row) => pickGov(row).pop,
        sl_score:  (row) => {
            const { accept, area, pop } = pickGov(row);
            const x = 30 - (accept * 0.002) / (area * pop);
            return Number(Math.max(0, Math.min(30, x)).toFixed(3));
        },

        sat_rate:  (row) => `${(pickGov(row).satRate * 100).toFixed(1)}%`,
        sat_score: (row) => Number((pickGov(row).satRate * 30).toFixed(2)),

        period_days:  (row) => Number(pickGov(row).cycle.toFixed(2)),
        period_score: (row) => {
            const { cycle } = pickGov(row);
            const x = (2 - cycle) * 10;
            return Number(Math.max(0, Math.min(10, x)).toFixed(2));
        },

        rpt5_cnt:   (row) => pickGov(row).repeat,
        rpt5_score: (row) => {
            const n = pickGov(row).repeat;
            return Math.max(0, 20 - Math.min(n, 20));
        },

        over_cnt:   (row) => pickGov(row).overdue,
        over_score: (row) => (pickGov(row).overdue > 0 ? 0 : 10),
    },

    '环境卫生': {
        clean_problem: (row) => {
            return countEnv(row.street, '环卫所', '环境卫生')
        },
        clean_score: (row) => {
            const cnt = countEnv(row.street, '环卫所', '环境卫生')
            const deduct = Math.min(cnt * 0.1, 20)
            const score = 20 - deduct
            return Number(score.toFixed(2))
        },

        garbage_points: (row) => {
            return countEnv(row.street, '车队', '垃圾分类')
        },
        garbage_score: (row) => {
            const cnt = countEnv(row.street, '车队', '垃圾分类')
            const deduct = Math.min(cnt * 0.5, 20)
            const score = 20 - deduct
            return Number(score.toFixed(2))
        },

        field_count: (row) => {
            return countEnv(row.street, '环卫所', '垃圾分类')
        },
        field_score: (row) => {
            const cnt = countEnv(row.street, '环卫所', '垃圾分类')
            const deduct = Math.min(cnt * 0.1, 20)
            const score = 20 - deduct
            return Number(score.toFixed(2))
        },

        road_count:  () => 0,
        road_score:  () => 20,

        dispose_rate:  () => '100%',
        dispose_score: () => 10,

        other_score: () => 10,
    },

    '共享单车': {
        // a_1 / a_2 -> 单车总量监控（数量 / 得分）
        zl_over_cnt: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 0;
            return Number(it.a_1 || 0);   // 数量
        },
        zl_score: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 30;           // 无数据给满分
            const v = Number(it.a_2 || 0);
            return Number(v.toFixed(2));  // 得分
        },

        // b_1 / b_2 -> 日常 P 点管理（数量 / 得分）
        rc_p_cnt: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 0;
            return Number(it.b_1 || 0);
        },
        rc_p_score: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 20;
            const v = Number(it.b_2 || 0);
            return Number(v.toFixed(2));
        },

        // c_1 / c_2 -> 重点点位 P 点管理（数量 / 得分）
        zd_p_cnt: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 0;
            return Number(it.c_1 || 0);
        },
        zd_p_score: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 30;
            const v = Number(it.c_2 || 0);
            return Number(v.toFixed(2));
        },

        // d_1 / d_2 -> 僵尸车（数量 / 得分）
        dead_cnt: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 0;
            return Number(it.d_1 || 0);
        },
        dead_score: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 10;
            const v = Number(it.d_2 || 0);
            return Number(v.toFixed(2));
        },

        // e_1 / e_2 -> 其他（规则值 / 得分）
        qt_rule: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 0;
            return Number(it.e_1 || 0);
        },
        qt_score: (row) => {
            const it = bikeTzIndex.value[row.street];
            if (!it) return 10;
            const v = Number(it.e_2 || 0);
            return Number(v.toFixed(2));
        },
    },

    '数字城管': {
        daily_score: (row) => {
            // 1. 防御性检查：若全局数据未加载或为空，直接返回满分 30
            if (!cityManagementScore.value || Object.keys(cityManagementScore.value).length === 0) {
                return 30;
            }
            const sName = row.street;
            const streetData = cityManagementScore.value[sName] || {};
            // 2. 提取数据，若该街道无此字段，依然兜底回满分
            const score = streetData['日常处置率得分'];
            return score !== undefined ? Number(score) : 30;
        },
        ontime_score: (row) => {
            if (!cityManagementScore.value || Object.keys(cityManagementScore.value).length === 0) {
                return 20; // 满分 20
            }
            const sName = row.street;
            const streetData = cityManagementScore.value[sName] || {};
            const score = streetData['按期处置率得分'];
            return score !== undefined ? Number(score) : 20;
        },
        rework_score: (row) => {
            if (!cityManagementScore.value || Object.keys(cityManagementScore.value).length === 0) {
                return 20; // 满分 20
            }
            const sName = row.street;
            const streetData = cityManagementScore.value[sName] || {};
            const score = streetData['返工率得分'];
            return score !== undefined ? Number(score) : 20;
        },
        overdue_score: (row) => {
            if (!cityManagementScore.value || Object.keys(cityManagementScore.value).length === 0) {
                return 20; // 满分 20
            }
            const sName = row.street;
            const streetData = cityManagementScore.value[sName] || {};
            const score = streetData['超期待处置率得分'];
            return score !== undefined ? Number(score) : 20;
        },
        delay_score: (row) => {
            if (!cityManagementScore.value || Object.keys(cityManagementScore.value).length === 0) {
                return 10; // 满分 10
            }
            const sName = row.street;
            const streetData = cityManagementScore.value[sName] || {};
            const score = streetData['延期率得分'];
            return score !== undefined ? Number(score) : 10;
        },
    },
}

// —— 角色 -> 表格配置（列结构 + 静态数据）——————
export const ROLE_TABLE_MAP = {
  '扬尘治理': {
    columns: [
      { label: '街办', prop: 'street', minWidth: 120 },
      { label: '市级巡查（20）', align: 'center', children: [
          { label: '发现问题（10）', prop: 'sj_found',  align: 'center', minWidth: 110 },
          { label: '未整改、未整改到位、虚假整改（10）', prop: 'sj_unrect', align: 'center', minWidth: 180 },
        ]},
      { label: '区级巡查（30）', align: 'center', children: [
          { label: '发现问题（15）', prop: 'qj_found',  align: 'center', minWidth: 110 },
          { label: '未整改、未整改到位、虚假整改（15）', prop: 'qj_unrect', align: 'center', minWidth: 180 },
        ]},
      { label: '街道自查（35）', align: 'center', children: [
          { label: '未按期巡查', prop: 'jd_unpatrol', align: 'center', minWidth: 110 },
        ]},
      { label: '案件办理（5）', align: 'center', children: [
          { label: '得分', prop: 'aj_score', align: 'center', minWidth: 80 },
        ]},
      { label: '其他（10）', align: 'center', children: [
          { label: '得分', prop: 'qt_score', align: 'center', minWidth: 80 },
        ]},

      { label: '得分', prop: 'total', align: 'center', minWidth: 80 },

    ],
    // rows: [
    //   { street: '抚琴街道'},
    //   { street: '西安路街道'},
    //   { street: '驷马桥街道'},
    //   { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
    //   { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
    //   { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    // ],
      rows: [
          {
              street: '抚琴街道',
              sj_found: 9.5,
              sj_unrect: 9.0,
              qj_found: 14.0,
              qj_unrect: 13.5,
              jd_unpatrol: 33.0,
              aj_score: 0,
              qt_score: 10,
              total: 89.0,
          },
          {
              street: '西安路街道',
              sj_found: 9.0,
              sj_unrect: 8.5,
              qj_found: 14.5,
              qj_unrect: 14.0,
              jd_unpatrol: 32.0,
              aj_score: 0,
              qt_score: 10,
              total: 88.0,
          },
          {
              street: '驷马桥街道',
              sj_found: 9.5,
              sj_unrect: 9.5,
              qj_found: 15.0,
              qj_unrect: 14.0,
              jd_unpatrol: 34.0,
              aj_score: 0,
              qt_score: 10,
              total: 92.0,
          },
          {
              street: '荷花池街道',
              sj_found: 8.5,
              sj_unrect: 8.0,
              qj_found: 13.5,
              qj_unrect: 13.0,
              jd_unpatrol: 31.0,
              aj_score: 0,
              qt_score: 10,
              total: 84.0,
          },
          {
              street: '五块石街道',
              sj_found: 9.0,
              sj_unrect: 9.0,
              qj_found: 14.0,
              qj_unrect: 13.5,
              jd_unpatrol: 32.5,
              aj_score: 0,
              qt_score: 10,
              total: 88.0,
          },
          {
              street: '九里堤街道',
              sj_found: 9.0,
              sj_unrect: 8.5,
              qj_found: 14.5,
              qj_unrect: 14.0,
              jd_unpatrol: 33.0,
              aj_score: 0,
              qt_score: 10,
              total: 89.0,
          },
          {
              street: '营门口街道',
              sj_found: 8.5,
              sj_unrect: 8.5,
              qj_found: 14.0,
              qj_unrect: 13.5,
              jd_unpatrol: 31.5,
              aj_score: 0,
              qt_score: 10,
              total: 86.0,
          },
          {
              street: '茶店子街道',
              sj_found: 9.5,
              sj_unrect: 9.0,
              qj_found: 15.0,
              qj_unrect: 14.5,
              jd_unpatrol: 34.5,
              aj_score: 0,
              qt_score: 10,
              total: 92.5,
          },
          {
              street: '金泉街道',
              sj_found: 9.0,
              sj_unrect: 8.5,
              qj_found: 13.5,
              qj_unrect: 13.0,
              jd_unpatrol: 32.0,
              aj_score: 0,
              qt_score: 10,
              total: 86.0,
          },
          {
              street: '天回镇街道',
              sj_found: 8.5,
              sj_unrect: 8.0,
              qj_found: 13.5,
              qj_unrect: 13.0,
              jd_unpatrol: 31.0,
              aj_score: 0,
              qt_score: 10,
              total: 84.0,
          },
          {
              street: '沙河源街道',
              sj_found: 9.0,
              sj_unrect: 9.0,
              qj_found: 14.0,
              qj_unrect: 13.5,
              jd_unpatrol: 32.5,
              aj_score: 0,
              qt_score: 10,
              total: 88.0,
          },
          {
              street: '凤凰山街道',
              sj_found: 9.5,
              sj_unrect: 9.0,
              qj_found: 14.5,
              qj_unrect: 14.0,
              jd_unpatrol: 33.5,
              aj_score: 0,
              qt_score: 10,
              total: 90.5,
          },
          {
              street: '西华街道',
              sj_found: 9.0,
              sj_unrect: 8.5,
              qj_found: 14.0,
              qj_unrect: 13.5,
              jd_unpatrol: 32.0,
              aj_score: 0,
              qt_score: 10,
              total: 87.0,
          },
      ],
  },


  '违法建设': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 违建投诉（50） = 投诉数量（30） + 重复投诉3次以上点位（20）
      { label: '违建投诉（50）', align: 'center', children: [
          { label: '投诉数量（30）', align: 'center', children: [
              { label: '数量', prop: 'ts_count', align: 'center', minWidth: 90 },
              { label: '得分', prop: 'ts_score', align: 'center', minWidth: 90 },
            ]},
          { label: '重复投诉3次以上点位（20）', align: 'center', children: [
              { label: '点位数量', prop: 'rpt_points', align: 'center', minWidth: 100 },
              { label: '得分',     prop: 'rpt_score',  align: 'center', minWidth: 90 },
            ]},
        ]},

      // 违建拆除（20）
      { label: '违建拆除（20）', align: 'center', children: [
          { label: '点位数', prop: 'remove_points', align: 'center', minWidth: 90 },
          { label: '得分',   prop: 'remove_score',  align: 'center', minWidth: 90 },
        ]},

      // 案件办理（10）
      { label: '案件办理（10）', align: 'center', children: [
          { label: '办结数量', prop: 'case_count', align: 'center', minWidth: 100 },
          { label: '得分',     prop: 'case_score', align: 'center', minWidth: 90 },
        ]},

      // 其他（20）
      { label: '其他（20）', align: 'center', children: [
          { label: '得分', prop: 'other_score', align: 'center', minWidth: 90 },
        ]},

      // 总分（保持现状：不在组件内计算）
      { label: '总分', prop: 'total', align: 'center', minWidth: 90 },
    ],

    // 示例静态行：可继续补齐其它街道
    rows: [
      // 与截图一致的三行示例
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

  '广告招牌': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 招牌审批受理量（30）
      { label: '招牌审批受理量（30）', align: 'center', children: [
          { label: '达标量', prop: 'sign_pass', align: 'center', minWidth: 90 },
          { label: '扣分',   prop: 'sign_deduct', align: 'center', minWidth: 80 },
          { label: '得分',   prop: 'sign_score', align: 'center', minWidth: 80 },
        ]},

      // 重复投诉3次以上点位（10）
      { label: '重复投诉3次以上点位（10）', align: 'center', children: [
          { label: '点位数量', prop: 'rep_cnt',   align: 'center', minWidth: 90 },
          { label: '得分',     prop: 'rep_score', align: 'center', minWidth: 80 },
      ]},

      // 巡查情况（50） = 市区巡查（20） + 街道自查（30）
      { label: '巡查情况（50）', align: 'center', children: [
          { label: '市区巡查（20）', align: 'center', children: [
              { label: '发现问题数量（10）', prop: 'city_found', align: 'center', minWidth: 120 },
              { label: '未整改、未整改到位、虚假整改（10）', prop: 'city_unrect', align: 'center', minWidth: 180 },
            ]},
          { label: '街道自查（30）', align: 'center', children: [
              { label: '扣分', prop: 'self_rate', align: 'center', minWidth: 110 },
              { label: '得分',       prop: 'self_score', align: 'center', minWidth: 80 },
            ]},
        ]},

      // 其他（10）
      { label: '其他（10）', align: 'center', children: [
          { label: '得分', prop: 'other_score', align: 'center', minWidth: 80 },
        ]},
      { label: '得分', prop: 'total', align: 'center', minWidth: 80 },

    ],
    rows: [
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

  '油烟治理': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 网上投诉（40） = 投诉数量（30） + 重复投诉点位（10）
      { label: '网上投诉（40）', align: 'center', children: [
          { label: '投诉数量（30）', align: 'center', children: [
              { label: '受理量', prop: 'ts_accept', align: 'center', minWidth: 80 },
              { label: '面积',   prop: 'ts_area',   align: 'center', minWidth: 80 },
              { label: '人口',   prop: 'ts_pop',    align: 'center', minWidth: 80 },
              { label: '得分',   prop: 'ts_score',  align: 'center', minWidth: 90 },
            ]},
          { label: '重复投诉3次以上点位（10）', align: 'center', children: [
              { label: '点位数量', prop: 'rpt_points', align: 'center', minWidth: 90 },
              { label: '得分',     prop: 'rpt_score',  align: 'center', minWidth: 90 },
            ]},
        ]},

      // 巡查情况（45） = 重点巡查（20） + 街道自查（25）
      { label: '巡查情况（45）', align: 'center', children: [
          { label: '重点巡查（20）', align: 'center', children: [
              { label: '发现问题', prop: 'zd_problem', align: 'center', minWidth: 100 },
              { label: '得分',     prop: 'zd_score',   align: 'center', minWidth: 90 },
            ]},
          { label: '街道自查（25）', align: 'center', children: [
              { label: '扣分', prop: 'jd_rate',  align: 'center', minWidth: 140 },
              { label: '得分',                 prop: 'jd_score', align: 'center', minWidth: 90 },
            ]},
        ]},

      // 案件办理（5）
      { label: '案件办理（5）', align: 'center', children: [
          { label: '办结（加分制）', prop: 'case_count', align: 'center', minWidth: 120 },
          { label: '得分',           prop: 'case_score', align: 'center', minWidth: 90 },
        ]},

      // 其他（10）
      { label: '其他（10）', align: 'center', children: [
          { label: '得分',         prop: 'qt_score', align: 'center', minWidth: 90 },
        ]},

      // 总分（保持现状：不在组件里计算）
      { label: '总分', prop: 'total', align: 'center', minWidth: 100 },
    ],

    rows: [
      // 示例行（抚琴、西安路、驷马桥）
      { street: '抚琴街道' },

      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

  '市容秩序': {
    columns: [
      { label: '街办', prop: 'street', minWidth: 120 },

      // 指挥调度系统平台使用（30） = 打卡情况(15) + 严管街在岗情况(15)
      { label: '指挥调度系统平台使用（30）', align: 'center', children: [
          { label: '打卡情况(15)',     prop: 'dd_clock',   align: 'center', minWidth: 110 },
          { label: '严管街在岗情况(15)', prop: 'dd_onguard', align: 'center', minWidth: 130 },
        ]},

      // 队伍风纪检查（20）
      { label: '队伍风纪检查（20）', align: 'center', children: [
          { label: '发现一起扣5分', prop: 'fj_find_cnt', align: 'center', minWidth: 120 },
          { label: '得分',         prop: 'fj_score',    align: 'center', minWidth: 90 },
        ]},

      // 日常巡查情况（20） = 临街店铺巡查(10) + 问题发现处置(10)
      { label: '日常巡查情况（20）', align: 'center', children: [
          { label: '临街店铺巡查(10)', prop: 'rc_shop',    align: 'center', minWidth: 120 },
          { label: '问题发现处置(10)', prop: 'rc_dispose', align: 'center', minWidth: 120 },
        ]},

      // 重复投诉5次以上点位（20）
      { label: '重复投诉5次以上点位（20）', align: 'center', children: [
          { label: '发现1起', prop: 'rpt5_cnt',   align: 'center', minWidth: 90 },
          { label: '得分',   prop: 'rpt5_score', align: 'center', minWidth: 90 },
        ]},

      // 其他（10）
      { label: '其他（10）', align: 'center', children: [
          { label: '得分',         prop: 'qt_score', align: 'center', minWidth: 90 },
        ]},

      // 总分（保持现状：不在组件里计算）
      { label: '总分', prop: 'total', align: 'center', minWidth: 100 },
    ],

    // 示例行 + 其他街道空白（会被规则自动补满分）
    rows: [
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },
  '网络理政': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 受理量（30）
      { label: '受理量（30）', align: 'center', children: [
          { label: '数量', prop: 'sl_count', align: 'center', minWidth: 80 },
          { label: '面积', prop: 'sl_area',  align: 'center', minWidth: 80 },
          { label: '人口', prop: 'sl_pop',   align: 'center', minWidth: 80 },
          { label: '得分', prop: 'sl_score', align: 'center', minWidth: 90 },
        ]},

      // 满意度（30）
      { label: '满意度（30）', align: 'center', children: [
          { label: '满意率', prop: 'sat_rate',  align: 'center', minWidth: 90 },
          { label: '得分',   prop: 'sat_score', align: 'center', minWidth: 90 },
        ]},

      // 办理周期（10）
      { label: '办理周期（10）', align: 'center', children: [
          { label: '2天为办结周期', prop: 'period_days',  align: 'center', minWidth: 120 },
          { label: '得分',         prop: 'period_score', align: 'center', minWidth: 90 },
        ]},

      // 重复投诉5次及以上（20）
      { label: '重复投诉5次及以上（20）', align: 'center', children: [
          { label: '数量', prop: 'rpt5_cnt',   align: 'center', minWidth: 80 },
          { label: '得分', prop: 'rpt5_score', align: 'center', minWidth: 90 },
        ]},

      // 超期（10）
      { label: '超期（10）', align: 'center', children: [
          { label: '发现一起', prop: 'over_cnt',   align: 'center', minWidth: 90 },
          { label: '得分',     prop: 'over_score', align: 'center', minWidth: 90 },
        ]},

      // 总分（保持现状：不在组件里计算）
      { label: '总分', prop: 'total', align: 'center', minWidth: 100 },
    ],

    // 示例静态行（其余街道留空，规则会补满分）
    rows: [
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

  '环境卫生': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 环卫作业（40） = 道路清扫(20) + 环卫保洁(20)
      { label: '环卫作业（40）', align: 'center', children: [
          { label: '道路清扫（20）', align: 'center', children: [
              { label: '数量', prop: 'road_count', align: 'center', minWidth: 90 },
              { label: '得分', prop: 'road_score', align: 'center', minWidth: 90 },
            ]},
          { label: '环卫保洁（20）', align: 'center', children: [
              { label: '问题数量', prop: 'clean_problem', align: 'center', minWidth: 100 },
              { label: '得分',     prop: 'clean_score',   align: 'center', minWidth: 90 },
            ]},
        ]},

      // 垃圾分类（40） = 垃圾收运(20) + 实地检查(20)
      { label: '垃圾分类（40）', align: 'center', children: [
          { label: '垃圾收运（20）', align: 'center', children: [
              { label: '点位数', prop: 'garbage_points', align: 'center', minWidth: 90 },
              { label: '得分',   prop: 'garbage_score',  align: 'center', minWidth: 90 },
            ]},
          { label: '实地检查（20）', align: 'center', children: [
              { label: '数量', prop: 'field_count', align: 'center', minWidth: 90 },
              { label: '得分', prop: 'field_score', align: 'center', minWidth: 90 },
            ]},
        ]},

      // 问题处置率（10）
      { label: '问题处置率（10）', align: 'center', children: [
          { label: '处置率', prop: 'dispose_rate', align: 'center', minWidth: 90 },
          { label: '得分',   prop: 'dispose_score', align: 'center', minWidth: 90 },
        ]},

      // 其他（10）
      { label: '其他（10）', align: 'center', children: [
          { label: '得分', prop: 'other_score', align: 'center', minWidth: 90 },
        ]},

      // 总分
      { label: '总分', prop: 'total', align: 'center', minWidth: 100 },
    ],

  rows: [
      {
          street: '抚琴街道',
          road_count: 12,
          road_score: 16.5,
          clean_problem: 3,
          clean_score: 16.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 90.5,
      },
      {
          street: '西安路街道',
          road_count: 10,
          road_score: 17.0,
          clean_problem: 2,
          clean_score: 16.5,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '85%',
          dispose_score: 8.5,
          other_score: 10,
          total: 92.0,
      },
      {
          street: '驷马桥街道',
          road_count: 11,
          road_score: 17.5,
          clean_problem: 2,
          clean_score: 17.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '85%',
          dispose_score: 8.5,
          other_score: 10,
          total: 93.0,
      },

      {
          street: '荷花池街道',
          road_count: 13,
          road_score: 16.0,
          clean_problem: 3,
          clean_score: 16.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 90.0,
      },
      {
          street: '五块石街道',
          road_count: 9,
          road_score: 16.5,
          clean_problem: 2,
          clean_score: 16.5,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 91.0,
      },
      {
          street: '九里堤街道',
          road_count: 8,
          road_score: 17.0,
          clean_problem: 2,
          clean_score: 16.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '85%',
          dispose_score: 8.5,
          other_score: 10,
          total: 91.5,
      },

      {
          street: '营门口街道',
          road_count: 10,
          road_score: 16.5,
          clean_problem: 3,
          clean_score: 16.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 90.5,
      },
      {
          street: '茶店子街道',
          road_count: 9,
          road_score: 17.5,
          clean_problem: 2,
          clean_score: 17.5,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '90%',
          dispose_score: 9.0,
          other_score: 10,
          total: 94.0,
      },
      {
          street: '金泉街道',
          road_count: 7,
          road_score: 16.0,
          clean_problem: 2,
          clean_score: 16.5,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 90.5,
      },

      {
          street: '天回镇街道',
          road_count: 8,
          road_score: 16.0,
          clean_problem: 3,
          clean_score: 16.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 90.0,
      },
      {
          street: '沙河源街道',
          road_count: 9,
          road_score: 17.0,
          clean_problem: 2,
          clean_score: 17.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '85%',
          dispose_score: 8.5,
          other_score: 10,
          total: 92.5,
      },
      {
          street: '凤凰山街道',
          road_count: 6,
          road_score: 17.5,
          clean_problem: 1,
          clean_score: 17.0,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '85%',
          dispose_score: 8.5,
          other_score: 10,
          total: 93.0,
      },
      {
          street: '西华街道',
          road_count: 7,
          road_score: 16.5,
          clean_problem: 2,
          clean_score: 16.5,
          garbage_points: 0,
          garbage_score: 20,
          field_count: 0,
          field_score: 20,
          dispose_rate: '80%',
          dispose_score: 8.0,
          other_score: 10,
          total: 91.0,
      },
  ],
  },

  '共享单车': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 单车总量监控（30）
      { label: '单车总量监控（30）', align: 'center', children: [
          { label: '数量', prop: 'zl_over_cnt', align: 'center', minWidth: 90 }, // 超额/统计数量
          { label: '得分', prop: 'zl_score',    align: 'center', minWidth: 90 },
        ]},

      // 日常P点管理（20）
      { label: '日常P点管理（20）', align: 'center', children: [
          { label: '发现P点爆点且30分钟内未处理，每处扣0.5分', prop: 'rc_p_cnt', align: 'center', minWidth: 220 },
          { label: '得分', prop: 'rc_p_score', align: 'center', minWidth: 90 },
        ]},

      // 重点点位P点管理（30）
      { label: '重点点位P点管理（30）', align: 'center', children: [
          { label: '发现重点点位P点爆点，每处扣0.5分', prop: 'zd_p_cnt', align: 'center', minWidth: 200 },
          { label: '得分', prop: 'zd_p_score', align: 'center', minWidth: 90 },
        ]},

      // 僵尸车（10）
      { label: '僵尸车（10）', align: 'center', children: [
          { label: '数量', prop: 'dead_cnt',   align: 'center', minWidth: 90 },
          { label: '得分', prop: 'dead_score', align: 'center', minWidth: 90 },
        ]},

      // 其他（10）
      { label: '其他（10）', align: 'center', children: [
          { label: '得分',         prop: 'qt_score', align: 'center', minWidth: 90 },
        ]},

      // 总得分（保持现状：不在组件里计算）
      { label: '总得分', prop: 'total', align: 'center', minWidth: 100 },
    ],

    // 示例行 + 其它街道空白（会被规则补满分）
    rows: [
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

  '数字城管': {
    columns: [
      { label: '街道', prop: 'street', minWidth: 120 },

      // 日常处置率（30）
      { label: '日常处置率（30）', align: 'center', children: [
          { label: '比率', prop: 'daily_rate', align: 'center', minWidth: 90 },
          { label: '得分', prop: 'daily_score', align: 'center', minWidth: 90 },
        ]},

      // 按期处置率（20）
      { label: '按期处置率（20）', align: 'center', children: [
          { label: '比率', prop: 'ontime_rate', align: 'center', minWidth: 90 },
          { label: '得分', prop: 'ontime_score', align: 'center', minWidth: 90 },
        ]},

      // 返工率（20）
      { label: '返工率（20）', align: 'center', children: [
          { label: '比率', prop: 'rework_rate', align: 'center', minWidth: 90 },
          { label: '得分', prop: 'rework_score', align: 'center', minWidth: 90 },
        ]},

      // 超期待处置率（20）
      { label: '超期待处置率（20）', align: 'center', children: [
          { label: '比率', prop: 'overdue_rate', align: 'center', minWidth: 90 },
          { label: '得分', prop: 'overdue_score', align: 'center', minWidth: 90 },
        ]},

      // 延期率（10）
      { label: '延期率（10）', align: 'center', children: [
          { label: '比率', prop: 'delay_rate', align: 'center', minWidth: 90 },
          { label: '得分', prop: 'delay_score', align: 'center', minWidth: 90 },
        ]},

      // 总分（保持现状：前端不计算）
      { label: '总分', prop: 'total', align: 'center', minWidth: 100 },
    ],

    rows: [
      { street: '抚琴街道'},
      { street: '西安路街道'},
      { street: '驷马桥街道'},

      { street: '荷花池街道' }, { street: '五块石街道' }, { street: '九里堤街道' },
      { street: '营门口街道' }, { street: '茶店子街道' }, { street: '金泉街道' },
      { street: '天回镇街道' }, { street: '沙河源街道' }, { street: '凤凰山街道' }, { street: '西华街道' },
    ],
  },

}

/* ============================================================
 *  5. 统一 total：只把“纯分数字段”加和
 * ========================================================== */

const sumScores = (roleName, keys) => (row) => {
    const fns = ROLE_RULES[roleName]
    const s = keys.reduce((acc, k) => {
        const fn = fns[k]
        return acc + (typeof fn === 'function' ? Number(fn(row) || 0) : 0)
    }, 0)
    return Number(s.toFixed(2))
}

ROLE_RULES['扬尘治理'].total = sumScores('扬尘治理', [
    'sj_found','sj_unrect','qj_found','qj_unrect','jd_unpatrol','aj_score','qt_score'
])

ROLE_RULES['违法建设'].total = sumScores('违法建设', [
    'ts_score','rpt_score','remove_score','case_score','other_score'
])

ROLE_RULES['广告招牌'].total = sumScores('广告招牌', [
    'sign_score','rep_score','city_found','city_unrect','self_score','other_score'
])

ROLE_RULES['油烟治理'].total = sumScores('油烟治理', [
    'ts_score','rpt_score','zd_score','jd_score','case_score','qt_score'
])

ROLE_RULES['市容秩序'].total = sumScores('市容秩序', [
    'dd_clock','dd_onguard','fj_score','rc_shop','rc_dispose','rpt5_score','qt_score'
])

ROLE_RULES['网络理政'].total = sumScores('网络理政', [
    'sl_score','sat_score','period_score','rpt5_score','over_score'
])

ROLE_RULES['环境卫生'].total = sumScores('环境卫生', [
    'road_score','clean_score','garbage_score','field_score','dispose_score','other_score'
])

ROLE_RULES['共享单车'].total = sumScores('共享单车', [
    'zl_score','rc_p_score','zd_p_score','dead_score','qt_score'
])

ROLE_RULES['数字城管'].total = sumScores('数字城管', [
    'daily_score','ontime_score','rework_score','overdue_score','delay_score'
])

/* ============================================================
 *  6. buildRoleRows：组件调用入口
 * ========================================================== */

export function buildRoleRows(roleName) {
    console.log('[buildRoleRows] called with roleName =', roleName)
    console.log('[buildRoleRows] ROLE_TABLE_MAP keys =', Object.keys(ROLE_TABLE_MAP))

    const cfg = ROLE_TABLE_MAP[roleName]
    if (!cfg) {
        console.warn('[buildRoleRows] ⚠ 未找到 cfg，roleName =', roleName)
        return null
    }
    const rules = ROLE_RULES[roleName] || {}
    const rows = (cfg.rows || []).map((r) => {
        const filled = { ...r }
        for (const key in rules) {
            const fn = rules[key]
            if (
                typeof fn === 'function' &&
                (filled[key] === undefined || filled[key] === null || filled[key] === '')
            ) {
                filled[key] = fn(filled)
            }
        }
        return filled
    })

    console.log('[buildRoleRows] ✅ 返回的 rows 示例：', rows[0])
    return { ...cfg, rows }
}

export function useRoleRows(roleName) {
    return computed(() => {
        const cfg = ROLE_TABLE_MAP[roleName];
        if (!cfg) return null;

        const rules = ROLE_RULES[roleName] || {};

        // 🚀 响应式：每次 envChecks/streetStatics/... 更新时，自动重算 rows
        const rows = (cfg.rows || []).map((r) => {
            const filled = { ...r };
            for (const key in rules) {
                const fn = rules[key];
                if (typeof fn === 'function') {
                    filled[key] = fn(filled);
                }
            }
            return filled;
        });

        return { ...cfg, rows };
    });
}
import {
    getInspectionRecordsBySystem,
    getStreetDailyStatics,
    getEnvChecks,
    getSignDoorData,
    getCityOrderCheckData,
    getSootTzData,
    getBikeTzData
} from "@/api/content";

// 一个安全调用包装器：接口失败不会阻断整个流程
async function safeCall(name, apiFunc, args = [], fallback = []) {
    console.time(name);  // 计时开始
    try {
        const res = await apiFunc(...args);
        console.timeEnd(name);  // 计时结束
        console.log(`✔ 接口成功: ${name}`);
        return res;
    } catch (e) {
        console.timeEnd(name);
        console.error(`❌ 接口失败: ${name}`, e);
        return fallback;
    }
}

export async function preloadAllScoreData() {
    console.log("🌐 开始全局数据预加载 ...");

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    // 昨日日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth()+1)}-${pad(yesterday.getDate())}`;

    // ========== 1. 环境卫生 ==========
    envChecks.value = await safeCall(
        "getEnvChecks",
        getEnvChecks,
        [],
        []
    );

    // ========== 2. 招牌审批 ==========
    signDoorRaw.value = await safeCall(
        "getSignDoorData(招牌审批量)",
        getSignDoorData,
        [month],
        []
    );

    // ========== 3. 市容秩序 ==========
    const cityResp = await safeCall(
        "getCityOrderCheckData(市容秩序)",
        getCityOrderCheckData,
        [],
        { data: { shop: [] } }
    );
    cityOrderShop.value = cityResp.data?.shop || [];

    // ========== 4. 街道体征 ==========
    streetStatics.value = await safeCall(
        "getStreetDailyStatics(街道体征)",
        getStreetDailyStatics,
        [],
        []
    );

    // ========== 5. 共享单车 ==========
    bikeTzPatrol.value = await safeCall(
        "getBikeTzData(单车体征)",
        getBikeTzData,
        [dayStr],
        []
    );

    // ========== 6. 餐饮油烟（可能超时） ==========
    oilSootPatrol.value = await safeCall(
        "getSootTzData(餐饮油烟)",
        getSootTzData,
        [month],
        []
    );

    // ========== 7. 巡查记录（全部系统） ==========
    const allInspection = await safeCall(
        "getInspectionRecordsBySystem(全部系统)",
        getInspectionRecordsBySystem,
        ["全部系统"],
        {}
    );

    // 修复关键错误：写入 inspectionRecordsMap
    inspectionRecordsMap.value = allInspection || {};

    console.log("🌐 全部接口调用结束（包含成功与失败）");
}
