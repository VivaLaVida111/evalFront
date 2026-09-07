// import router from "@/router";
// import { getToken, removeToken } from "@/composables/auth";
// import store from "@/store/index.js";
// import { setToken } from "@/composables/auth";
// import { params } from "@/store/store.js";
// import { getLogin } from "@/api/home.js";
//
// const Base64 = require("js-base64").Base64;
// router.beforeEach(async (to, from, next) => {
//   //获取token
//   const token = getToken();
//   if (!token && to.path != "/login") {
//     // 忘记密码页面直接放行
//     if (to.path == "/forget-password") {
//       return next();
//     }
//     const hash = window.location.hash;
//
//    //免密登录处理url中的查询参数
//     if (hash.includes("?")) {
//       const paramsString = hash.split("?")[1]; // 获取问号后面的部分
//       const urlParams = new URLSearchParams(paramsString);
//       console.log("urlParams:" + urlParams);
//
//     } else {
//       return next({ path: "/login" });
//     }
//   }
//   //防止重复登录
//   if (token && to.path == "/login") {
//     router.push("/login");
//     removeToken();
//   }
//
//   if (token) {
//     await store.dispatch("getInfo");
//   }
//   //放行
//   next();
// });
import router from "@/router";
import { getToken, removeToken } from "@/composables/auth";
import store from "@/store/index.js";
import { setToken } from "@/composables/auth";
import { params } from "@/store/store.js";
import { getLogin } from "@/api/home.js";

const Base64 = require("js-base64").Base64;

router.beforeEach(async (to, from, next) => {
  console.log("[permission] 路由守卫触发", {
    fromPath: from.fullPath,
    toPath: to.fullPath,
    toQuery: to.query,
    hasToken: !!getToken(),
    currentURL: window.location.href
  });

  const token = getToken();

  // 1. 目标是 login 页:无条件放行,让 Login.vue 自己处理免密逻辑
  //    特别注意:不能在这里因为 token 存在就跳走 login 页,
  //    因为免密登录场景下需要在 Login 页重新走流程
  if (to.path === "/login") {
    return next();
  }

  // 2. 目标是免密登录路径(忘记密码等):放行
  if (to.path === "/forget-password") {
    return next();
  }

  // 3. 没 token 且目标不是 login:跳到 login,但保留原 query
  if (!token) {
    // 关键:如果当前 URL 里有 phone 等免密参数,要带过去
    const hash = window.location.hash;
    if (hash.includes("?")) {
      const queryString = hash.split("?")[1];
      console.log("[permission] 无 token,带 query 跳 login:", queryString);
      return next({ path: "/login", query: Object.fromEntries(new URLSearchParams(queryString)) });
    }
    console.log("[permission] 无 token,跳 login");
    return next({ path: "/login" });
  }

  // 4. 有 token:刷新用户信息后放行
  try {
    await store.dispatch("getInfo");
  } catch (e) {
    console.warn("[permission] getInfo 失败:", e);
    // getInfo 失败说明 token 失效了,清掉并跳 login(同样保留 query)
    removeToken();
    const hash = window.location.hash;
    if (hash.includes("?")) {
      const queryString = hash.split("?")[1];
      return next({ path: "/login", query: Object.fromEntries(new URLSearchParams(queryString)) });
    }
    return next({ path: "/login" });
  }

  next();
});