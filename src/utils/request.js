import axios from "axios";
import { ElMessage } from "element-plus";
import { params } from "@/store/store.js";
const service = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

service.interceptors.request.use(
  (config) => {
    console.log(config.url);
    // 检查URL路径和params.token
    if (config.url !== "auth/login" && params.token) {
      // 修改请求头
      config.headers = {
        ...config.headers, // 展开现有的headers属性
        Authorization: `Bearer${params.token}`, // 添加或覆盖Authorization头
        "Content-Type": "application/json", // 添加或覆盖Content-Type头
      };
    }
    return config; // 返回修改后的配置
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    if (response.status == 200) {
      //使用response.data获取原始返回数据
      return response.data.data;
    } else {
      // ElMessage.error({
      //     showClose: true,
      //     message: '访问后台服务器出现问题'
      // })
      Promise.reject();
    }
  },
  (error) => {
    // ElMessage.error({
    //     showClose: true,
    //     message: '访问后台服务器出现问题'
    // })
    return Promise.reject(error);
  }
);

export default service;
