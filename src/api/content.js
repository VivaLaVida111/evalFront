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
export function getJinNniuToday(start,end,pageNum,pageSize) {
    return request({
        url: '/dump-record/period/' + start + '/'+end,
        method: 'get',
        // data: {
        //     pageNum: pageNum,
        //     pageSize: pageSize		//user_id为接口请求关键字,7为参数值
        // }
    })
}
export function getQuery(site_name, transporter, start, end, pageNum, pageSize) {
    return request({
        url: '/dump-record/page/' + site_name + '/' + transporter + '/' + start + '/' + end + '/' + pageNum + '/' + pageSize,
        method: 'get',
        // params: {
        //     pageNum: pageNum,
        //     pageSize: pageSize		//user_id为接口请求关键字,7为参数值
        // }
    })
}
export function getCarGps(car_number,start,end){
    return request({
        url: '/gps-record/track/'+car_number+'/'+start+'/'+end,
        method: 'get'
    })
}
export function getCars(){
    return request({
        url: '/car',
        method: 'get'
    })
}

export function getAllGps(){
    return request({
        url: '/gps-record/latest_location/all'+'/',
        method: 'get'
    })
}


// 车辆倾倒数据查询;若需全部站点数据,则site_name填all
export function getTransportCars(start, end,site_name, pageNum, pageSize) {
    return request({
        url: '/dump-record/dump_car/' + start + '/' + end + '/' + site_name + '/' + pageNum + '/' + pageSize,
        method: 'get',
        // params: {
        //     pageNum: pageNum,
        //     pageSize: pageSize		//user_id为接口请求关键字,7为参数值
        // }
    })
}

export function getAllGp(){
    return request({
        url: '/gps-record/latest_location/all'+'/',
        method: 'get'
    })
}

// export function getFlows() {
//         return request({
//           url: "/OsmoticFluid/shenlvye/getRecord",
//           method: "get",
//         });
// }

// export function getFlows_xihua() {
//         return request({
//           url: "/OsmoticFluid/shenlvye/getRecordByStation?station=xihua",
//           method: "get",
//         });
// }