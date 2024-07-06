import request from '@/utils/request.js'

export function get(url, params) {
    return request({
        method: 'get',
        url,
        params,
    })
}