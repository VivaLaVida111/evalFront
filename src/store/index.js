import { createStore } from "vuex";
import {
  setToken,
  removeToken,
  getToken
} from "@/composables/auth";
import axios from "axios";
import { params } from "@/store/store";

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      //用户信息
      user: {},
    };
  },
  mutations: {
    //记录用户信息
    SET_USERINFO(state, user) {
      state.user = user;
    },
  },
  actions: {
    //登录
    //第一个 "login" 是一个 Vuex action，用于组织和触发登录逻辑，以及处理响应和状态管理。
    //第二个 "login" 是~/api/manager文件中定义的方法，执行实际的登录请求，将用户名和密码发送到服务器。
    login({ commit }, { name, password }) {
      return new Promise((resolve, reject) => {
        axios
          .post("/api/auth/login", {
            name,
            password,
          })
          .then((res) => {
            console.log("登录成功！获取到token：", res.token);
            //存储token
            setToken(res.token);
            resolve(res);
          })
          .catch((err) => reject(err));
      });
    },
    //获取当前登录用户信息
    //commit用于提交mutation
    getInfo({ commit }) {
      const token = getToken();
      //Promise对象，用于异步处理用户信息的获取
      return new Promise((resolve, reject) => {
        
        axios({
          url: "/api/auth/getInfo",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          data: {},
        })
          .then(function (resp) {
            
            console.log("用户信息", resp.data.data);
            params.username = resp.data.data.name;
            //params.roleId = resp.data.data.role_id;
            params.realname = resp.data.data.real_name;
            params.role = resp.data.data.roles;
            params.isLogin = true;
            params.token = token;
            resolve(resp);
          })
          .catch((err) => reject(err));
        
      });
    },
    //退出登录
    logout({ commit }) {
      //移除cookie里的token  这个封装在auth.js中
      removeToken();
      //清除当前用户的状态
      commit("SET_USERINFO", {});
    },
  },
});
export default store;
