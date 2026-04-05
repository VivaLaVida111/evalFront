import request from '@/utils/request'
export { get } from '@/api/common.js'
export function getPage(pageNum, pageSize) {
    return request({
        url: '/dump-record/page',
        method: 'get',
        data: {
            pageNum: pageNum,
            pageSize: pageSize		//user_id为接口请求关键字,7为参数值
        }
    })
}
export function getScore(start, end) {
    return request({
        url: '/details/score' + start + '/' + end,
        method: 'get'
    })
}

export function getStreetStatistics(start, end, bigRuleId) {
    return request({
        url: '/details/streetStatistics/' + start + '/' + end + '/' + bigRuleId,
        method: 'get'
    })
}

export function getSmallRulesStatistics(start, end, bigRuleId) {
    return request({
        url: '/details/smallRuleStatistics/' + start + '/' + end + '/' + bigRuleId,
        method: 'get' 
    })
}

export function getStreetSmallRulesStatistics(start, end, bigRuleId, street) {
    return request({
        url: '/details/streetSmallRulesStatistics/' + start + '/' + end + '/' + bigRuleId + '/' + street,
        method: 'get'
    })
}

export function getDetails(start, end, street) {
    return request({
        url: '/details/period/' + start + '/' + end + '/' + street,
        method: 'get'
    })
}
//获取全部大规则
export function getDetailRules() {
    return request({
        url: '/big-rules/getDetailRules',
        method: 'get'
    })
}

export function getSelfRoles() {
    return request({
        url: '/auth/self_role_list',
        method: 'get'
    })
}
//add detail
export function addSubdivision(data) {
    return request({
        url: '/details/add',
        method: 'post',
        data
    })
}

export function deleteSubdivision(data) {
    return request({
        url: '/details/delete',
        method: 'post',
        data
    })
}

export function updateSubdivision(data) { 
    return request({
        url: '/details/update',
        method: 'post',
        data
    })
}

export function addBigRule(data) {
    return request({
        url: '/big-rules/add',
        method: 'post',
        data
    })
}

export function deleteBigRule(data) {
    return request({
        url: '/big-rules/delete',
        method: 'post',
        data
    })
}

export function updateBigRule(data) {   
    return request({
        url: '/big-rules/update',
        method: 'post',
        data
    })
}

export function addSmallRule(data) {
    return request({
        url: '/small-rules/add',
        method: 'post',
        data
    })
}

export function deleteSmallRule(data) {
    return request({
        url: '/small-rules/delete',
        method: 'post',
        data
    })
}

export function updateSmallRule(data) {
    return request({
        url: '/small-rules/update',
        method: 'post',
        data
    })
}
export function getStreetDailyStatics() {
    return request({
        url: '/extra/streetDailyStatics',
        method: 'get',

    })
}
export function formatLocalDateTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Case Record API functions
export function addCaseRecord(data) {
    return request({
        url: '/case-record',
        method: 'post',
        data
    })
}

export function getCaseRecords(params) {
    return request({
        url: '/case-record',
        method: 'get',
        params
    })
}

export function updateCaseRecord(data) {
    return request({
        url: '/case-record',
        method: 'patch',
        data
    })
}

export function deleteCaseRecord(id) {
    return request({
        url: '/case-record/' + id,
        method: 'delete'
    })
}

// Inspection Record API functions
export function addInspectionRecord(data) {
    return request({
        url: '/inspection-record',
        method: 'post',
        data
    })
}

export function getInspectionRecords(params) {
    return request({
        url: '/inspection-record',
        method: 'get',
        params
    })
}
export function getInspectionRecordsBySystem(params) {
    return request({
        url: '/inspection-record/by-system',
        method: 'get',
        timeout: 60000,
        params
    })
}
export function updateInspectionRecord(data) {
    return request({
        url: '/inspection-record',
        method: 'patch',
        data
    })
}

export function deleteInspectionRecord(id) {
    return request({
        url: '/inspection-record/' + id,
        method: 'delete'
    })
}

// 获取问题来源统计数据
export function getSourceStats(startTime, endTime) {
    return request({
        url: '/inspection-record/stats/resource',
        method: 'get',
        params: {
            startTime,
            endTime
        }
    })
}

// 获取问题类型统计数据
export function getAttributeStats(startTime, endTime) {
    return request({
        url: '/inspection-record/stats/attribute',
        method: 'get',
        params: {
            startTime,
            endTime
        }
    })
}

// 获取按街道巡查状态统计数据
export function getPatrolByStreetStats(startTime, endTime) {
    return request({
        url: '/inspection-record/stats/patrol-by-street',
        method: 'get',
        params: {
            startTime,
            endTime
        }
    })
}

// 获取按街道整改完成统计数据
export function getCheckByStreetStats(startTime, endTime) {
    return request({
        url: '/inspection-record/stats/check-by-street',
        method: 'get',
        params: {
            startTime,
            endTime
        }
    })
}

// Inspection Record API functions
export function addCityOrderRecord(data) {
    return request({
        url: '/city-order-record',
        method: 'post',
        data
    })
}


//实地检查
export function addEnvHealthSpotCheck(data) {
    return request({
        url: '/env-check',
        method: 'post',
        data
    })
}

export function addDemolitionRecord(data) {
    return request({
        url: '/demolition-record',
        method: 'post',
        data
    })
}

export function getDemolitionRecords() {
    return request({
        url: '/demolition-record',
        method: 'get'
    })
}

export function getEnvChecks(params) {
    return request({
        url: '/env-check',
        method: 'get',
        params
    })
}

// 临街店铺管家 —— 招牌审批量
export function getSignDoorData(month) {
    return request({
        url: '/extra/signDoorData',
        method: 'get',
        params: { month }
    })
}

export function getCityOrderCheckData() {
    return request({
        url: '/extra/cityOrderCheckData',
        method: 'get',
    })
}

// 餐饮油烟体征数据
export function getSootTzData(month) {
    return request({
        url: '/extra/sootTzData',
        method: 'get',
        params: { month },
    });
}

export function getBikeTzData(day) {
    return request({
        url: '/extra/bikeTzData',
        method: 'get',
        params: { day },
    });
}

export function getDdzhMaininfo() {
    return request({
        url: '/extra/mainInfo',
        method: 'get',
    });
}

export function getSjtj() {
    return request({
        url: '/extra/sjtj',
        method: 'get',
    });
}

export function getJylmComplaintList() {
    return request({
        url: '/jylm/complaint/list',
        method: 'get',
    });
}

// 上传投诉量数据
export function uploadJylmComplaint(data) {
    return request({
        url: '/jylm/complaint/upload',
        method: 'post',
        data: data // 对应后端 @RequestBody
    });
}