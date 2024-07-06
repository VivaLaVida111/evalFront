import axios from 'axios'
import { ElMessage } from 'element-plus'
const service = axios.create({
    baseURL: '/api',
    timeout: 15000
})

service.interceptors.response.use(
    response => {
        if(response.status == 200){
            //使用response.data获取原始返回数据
            return response.data.data
        }else{
            // ElMessage.error({
            //     showClose: true,
            //     message: '访问后台服务器出现问题'
            // })
            Promise.reject()
        }
    },
    error => {
        // ElMessage.error({
        //     showClose: true,
        //     message: '访问后台服务器出现问题'
        // })
        return Promise.reject(error);
    }
)

export default service