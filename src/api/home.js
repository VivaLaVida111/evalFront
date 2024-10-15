import request from '@/utils/request'
export { get } from '@/api/common.js'



export function getPage(pageNum, pageSize) {
    return request({
        url: '/dump-records/page',
        method: 'get',
        params: {
            pageNum: pageNum,
            pageSize: pageSize		//user_id为接口请求关键字,7为参数值
        }
    })
}
export function getCarsLocation() {
    return request({
        url: '/gps-record/latest_location/all',
        method: 'get',

    })
}
export function getLogin(user) {
    return request({
        url: '/auth/login',
        method: 'post',
        data: user
    })
}
export function getBigRulesStatistics(start, end) {
    return request({
        url: '/details/bigRulesStatistics/' + start + '/' + end,
        method: 'get'
    })
}