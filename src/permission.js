import router from "@/router";
import { getToken, removeToken, removeHwzyToken } from "@/composables/auth";
import store from "@/store/index.js";
import { setToken } from "@/composables/auth";
import { params } from "@/store/store.js";
import { getLogin } from "@/api/home.js";

const Base64 = require("js-base64").Base64;
router.beforeEach(async (to, from, next) => {
  //获取token
  const token = getToken();
  if (!token && to.path != "/login") {
    // 忘记密码页面直接放行
    if (to.path == "/forget-password") {
      return next();
    }
    const hash = window.location.hash;

   //免密登录处理url中的查询参数
    if (hash.includes("?")) {
      const paramsString = hash.split("?")[1]; // 获取问号后面的部分
      const urlParams = new URLSearchParams(paramsString);
      console.log("urlParams:" + urlParams);
     
    } else {
      return next({ path: "/login" });
    }
  }
  //防止重复登录
  if (token && to.path == "/login") {
    router.push("/login");
    removeToken();
    removeHwzyToken();
  }

  if (token) {
    await store.dispatch("getInfo");
  }
  //放行
  next();
});
