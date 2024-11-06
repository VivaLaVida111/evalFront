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

export function getDetails(start, end, street) {
    return request({
        url: '/details/period/' + start + '/' + end + '/' + street,
        method: 'get'
    })
}

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