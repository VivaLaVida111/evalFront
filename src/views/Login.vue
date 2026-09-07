<!--<template>-->
<!--  <div class="login-container">-->
<!--    <div class="login-header">-->
<!--      <div class="login-header-title">成都市金牛区综合行政执法局</div>-->
<!--    </div>-->
<!--    <div class="login-box">-->
<!--      <img class="login-box-logo" alt="" src="@/assets/login/login-logo.png" />-->
<!--      <div class="login-box-title">城乡环境综合治理体征监测系统</div>-->
<!--      <input-->
<!--        v-model="params.username"-->
<!--        class="username-input"-->
<!--        type="text"-->
<!--        placeholder="请输入用户名"-->
<!--      />-->
<!--      <input-->
<!--        v-model="params.password"-->
<!--        class="password-input"-->
<!--        type="password"-->
<!--        placeholder="请输入密码"-->
<!--      />-->
<!--      <input-->
<!--        class="remember-password"-->
<!--        type="checkbox"-->
<!--        @change="changeRememberUser"-->
<!--      />-->
<!--      <div class="remember-password-text">记住密码</div>-->
<!--      &lt;!&ndash; <a href="#/forget-password" class="forget-password-text" >忘记密码？</a> &ndash;&gt;-->

<!--      &lt;!&ndash; <el-button-->
<!--        class="forget-password-text"-->
<!--        plain-->
<!--        link-->
<!--        color="#ffffff"-->
<!--        @click="forgetPassword"-->
<!--        size="large"-->
<!--        >忘记密码？-->
<!--      </el-button> &ndash;&gt;-->

<!--      <el-button class="login-btn" type="primary" color="#0B9ED9" @click="login"-->
<!--        >登录</el-button-->
<!--      >-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->
<template>
  <div></div>
</template>
<script setup>
import { ElButton } from "element-plus";
import router from "@/router";
import { ref, onMounted, reactive, h } from "vue";
import { ElMessage, ElDialog, tabBarProps } from "element-plus";
import { params } from "@/store/store.js";
import { getLogin,getPswFreeLogin } from "@/api/home.js";

// import { useCookies } from '@vueuse/integrations/useCookies'
import { setToken } from "@/composables/auth";
import { useStore } from "vuex";

const store = useStore();

const Base64 = require("js-base64").Base64;
// const params = reactive({
//   username: "",
//   password: "123"
// })
// 封装一个带重试的登录函数
async function loginWithRetry(phone, maxRetries = 3, retryDelay = 800) {
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await getPswFreeLogin(phone);
      if (res?.token) {
        if (i > 0) {
          console.log(`[login] 第 ${i + 1} 次尝试成功`);
        }
        return res;
      }
      // 没拿到 token 但也没抛异常
      lastError = new Error("登录返回无 token");
    } catch (err) {
      lastError = err;
      console.warn(`[login] 第 ${i + 1} 次尝试失败:`, err.message);

      // 如果不是网络/服务端错误(比如是参数错误),不重试
      const status = err?.response?.status;
      if (status && status < 500 && status !== 408) {
        throw err;
      }
    }

    // 不是最后一次,等待后重试
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, retryDelay));
    }
  }

  throw lastError;
}

// 工具函数:延时
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 工具函数:把日志同时写到 console 和 localStorage(跨页面跳转也能看)
function debugLog(label, data) {
  const timestamp = new Date().toISOString();
  const logEntry = { time: timestamp, label, data };

  // 控制台
  console.log(`[${timestamp}] ${label}:`, data);

  // 持久化(跨跳转可见)
  try {
    const logs = JSON.parse(localStorage.getItem("__debug_logs") || "[]");
    logs.push(logEntry);
    // 只保留最近 100 条
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem("__debug_logs", JSON.stringify(logs));
  } catch (e) {
    console.error("写日志失败:", e);
  }
}

onMounted(async () => {
  // ============ 阶段 1:进入页面,记录初始状态 ============
  debugLog("===== 进入 Login 页 =====", "");
  debugLog("完整 URL", window.location.href);
  debugLog("hash", window.location.hash);
  debugLog("search", window.location.search);
  debugLog("referrer", document.referrer);
  debugLog("localStorage 全部内容", JSON.stringify(localStorage));
  debugLog("cookies", document.cookie);

  //await sleep(1500); // 暂停 1.5 秒,让你看清楚初始状态

  // ============ 阶段 2:解析 URL ============
  const hash = window.location.hash;

  if (!hash.includes("?")) {
    debugLog("❌ hash 不包含 ?,准备跳回主系统", hash);
    //await sleep(3000); // 跳走前停 3 秒
    window.location.replace("https://119.4.191.13:8891/#/login");
    return;
  }

  const paramsString = hash.split("?")[1];
  debugLog("解析出的 paramsString", paramsString);

  const urlParams = new URLSearchParams(paramsString);
  const phone = urlParams.get("phone");
  debugLog("解析出的 phone", phone);

  if (!phone) {
    debugLog("❌ phone 为空,准备跳回主系统", "");
    //await sleep(3000);
    window.location.replace("https://119.4.191.13:8891/#/login");
    return;
  }

  //await sleep(1500);

  // ============ 阶段 3:清理旧状态 ============
  debugLog("清理前 localStorage", JSON.stringify(localStorage));

  // 把可能残留的所有认证相关字段都清掉
  // ⚠️ 但保留 __debug_logs 不要清掉
  const debugLogs = localStorage.getItem("__debug_logs");

  localStorage.removeItem("token");
  localStorage.removeItem("Admin-Token");
  localStorage.removeItem("Authorization");
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userId");
  localStorage.removeItem("realName");
  localStorage.removeItem("roles");
  sessionStorage.clear();

  // 把日志放回去
  if (debugLogs) localStorage.setItem("__debug_logs", debugLogs);

  debugLog("清理后 localStorage", JSON.stringify(localStorage));

  //await sleep(1500);

  // ============ 阶段 4:调用免密登录接口 ============
  debugLog("准备调用免密登录接口,phone", phone);

  try {
    const startTime = Date.now();
    const res = await getPswFreeLogin(phone);
    const elapsed = Date.now() - startTime;

    debugLog(`登录接口返回 (耗时 ${elapsed}ms)`, JSON.stringify(res));

    //await sleep(2000); // 看清楚返回内容

    // ============ 阶段 5:处理登录结果 ============
    if (res?.token) {
      debugLog("✅ 登录成功,准备写入 token", res.token.substring(0, 30) + "...");

      params.isLogin = true;
      params.token = res.token;
      params.role = res.roles;
      setToken(res.token);
      localStorage.setItem("username", phone);

      debugLog("写入后 localStorage", JSON.stringify(localStorage));

      //await sleep(2000); // 跳转前停 2 秒

      debugLog("准备 router.replace 到 map", "");
      router.replace({ name: "map" });
    } else {
      debugLog("❌ 登录失败,返回内容里没有 token", JSON.stringify(res));
      ElMessage({ message: "自动登录失败(无 token),即将返回主系统", type: "error" });

      //await sleep(3000); // 跳转前停 3 秒
      window.location.replace("https://119.4.191.13:8891/#/login");
    }
  } catch (err) {
    // ============ 阶段 6:接口异常 ============
    debugLog("❌ 免密登录接口异常", {
      message: err?.message,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      responseData: err?.response?.data,
      requestUrl: err?.config?.url,
      requestHeaders: err?.config?.headers,
    });

    ElMessage({ message: "登录请求失败,即将返回主系统", type: "error" });

    //await sleep(5000); // 异常分支多停一会儿,关键现场
    window.location.replace("https://119.4.191.13:8891/#/login");
  }
});
// onMounted(async () => {
//   const hash = window.location.hash;
//
//   if (!hash.includes("?")) {
//     window.location.replace("https://119.4.191.13:8891/#/login");
//     return;
//   }
//
//   const paramsString = hash.split("?")[1];
//   const urlParams = new URLSearchParams(paramsString);
//   const phone = urlParams.get("phone");
//
//   if (!phone) {
//     window.location.replace("https://119.4.191.13:8891/#/login");
//     return;
//   }
//
//   localStorage.removeItem("username");
//   localStorage.removeItem("password");
//
//   console.log("获取到的phone:", phone);
//
//   try {
//     const res = await getPswFreeLogin(phone);
//     console.log("登录接口返回:", res);
//
//     // axios 拦截器已经把 ResponseData 的 data 字段解包出来了
//     // 所以 res 直接就是 { token, tokenHead, name }
//     if (res?.token) {
//       params.isLogin = true;
//       params.token = res.token;
//       params.role = res.roles;
//       setToken(res.token);
//       localStorage.setItem("username", phone);
//
//       router.replace({ name: "map" });
//     } else {
//       console.warn("登录失败,后端返回:", res);
//       ElMessage({ message: "自动登录失败,即将返回主系统", type: "error" });
//       setTimeout(() => {
//         window.location.replace("https://119.4.191.13:8891/#/login");
//       }, 1500);
//     }
//   } catch (err) {
//     console.error("免密登录异常:", err);
//     ElMessage({ message: "登录请求失败,即将返回主系统", type: "error" });
//     setTimeout(() => {
//       window.location.replace("https://119.4.191.13:8891/#/login");
//     }, 1500);
//   }
// });

const rememberUser = ref(false);
const changeRememberUser = () => {
  rememberUser.value = !rememberUser.value;
  console.log(rememberUser.value);
};
const login = () => {
  var user = {
    name: params.username,
    password: params.password,
  };
  getLogin(user).then((data) => {
    if (data.error_message == "success") {
      console.log("检验密码：" + data.isValidPassword);
      // if (data.isValidPassword == "false") {
      //   ElMessage({
      //     message: h("p", null, [
      //       h("span", null, "您的密码为初始密码，为保证登录安全请重设密码！"),
      //     ]),
      //     type: "error",
      //   });
      //   params.token = data.token;
      //   setToken(data.token);

      //   router.push("/changepsw");
      //   localStorage.setItem("username", params.username);
      // } 
      //else {
        if (rememberUser.value == true) {
          localStorage.setItem("username", params.username);
          localStorage.setItem("password", params.password);
        }
        params.isLogin = true;
        params.token = data.token;
        params.role = data.roles;

        //将token存储到cookie里面
        // const cookie = useCookies();
        // cookie.set("token",data.token);
        setToken(data.token);

        //console.log(data.role_id)
        router.push({ name: "map" });
        localStorage.setItem("username", params.username);
      //}
    } else {
      ElMessage({
        message: h("p", null, [h("span", null, data.error_message)]),
        type: "error",
      });
    }
  });
};

const loginByName = (name) => {
  console.log("loginByName 被调用，name:", name);
  getPswFreeLogin(name).then((data) => {
    console.log("getPswFreeLogin 返回:", data);
    if (data.error_message == "success") {
      params.isLogin = true;
      params.token = data.token;
      params.role = data.roles;
      setToken(data.token);
      localStorage.setItem("username", name);
      router.push({ name: "map" });
    } else {
      ElMessage({
        message: h("p", null, [h("span", null, "自动登录失败，请手动登录")]),
        type: "error",
      });
    }
  });
};
const forgetPassword = () => {
  router.push("/forget-password");
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-image: url("@/assets/login/login-background.png");
  background-size: 100% 100%;
}

.login-header {
  width: 100vw;
  height: 8.1vh;
  margin: auto auto;
  background-image: url("@/assets/login/login-header.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding-top: 1.5vh;
}

.login-header-title {
  width: 32.1vw;
  height: 5.1vh;
  font-size: 0.375rem;
  color: #ffffff;
  font-family: Alibaba PuHuiTi;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 85, 255, 0.75);
  margin-left: auto;
  margin-right: auto;
}

.login-box {
  width: 35vw;
  height: 53.7vh;
  background-image: url("@/assets/login/login-border.png");
  background-size: cover;
  margin-top: 14.5vh;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.login-box-title {
  width: 9vw;
  height: 4.2vh;
  font-family: PingFangSC-Medium;
  font-size: 0.25rem;
  color: #ffffff;
  position: absolute;
  top: 14vh;
  right: 13.1vw;
  left: 14vw;
}

.login-box-logo {
  width: 1.7vw;
  height: 3vh;
  position: absolute;
  top: 13.4vh;
  left: 12vw;
  right: 20.2vw;
  margin-right: 0.4vw;
}

.username-input {
  width: 18.7vw;
  height: 1.8vh;
  position: absolute;
  top: 20.4vh;
  left: 7.1vw;
  background: rgba(62, 181, 228, 0.25);
  border: 1px solid #22aee6;
  outline: none;
  color: #ffffff;
  font-size: 0.225rem;
  background-image: url("@/assets/login/username.png");
  background-repeat: no-repeat;
  background-position: left 0.8vw top 0.5vh;
  padding-left: 2.1vw;
  padding-top: 1.3vh;
  padding-bottom: 1.3vh;
}

.username-input::-webkit-input-placeholder {
  color: #ffffff;
  font-size: 0.225rem;
}

.password-input {
  width: 18.7vw;
  height: 1.8vh;
  position: absolute;
  top: 27vh;
  left: 7.1vw;
  background: rgba(62, 181, 228, 0.25);
  border: 1px solid #22aee6;
  outline: none;
  color: #ffffff;
  font-size: 0.225rem;

  background-image: url("@/assets/login/password.png");
  background-repeat: no-repeat;
  background-position: left 0.8vw top 0.5vh;
  padding-left: 2.1vw;
  padding-top: 1.3vh;
  padding-bottom: 1.3vh;
}

.password-input::-webkit-input-placeholder {
  color: #ffffff;
  font-size: 0.225rem;
}

input[type="checkbox"] {
  width: 0.7vw;
  height: 1.3vh;
  position: absolute;
  top: 32.9vh;
  left: 7.1vw;
  background: rgba(62, 181, 228, 0.25) !important;
  border: 1px solid #22aee6 !important;
}

input[type="checkbox"]::after {
  width: 0.7vw;
  height: 1.3vh;
  position: absolute;
  top: 32.9vh;
  left: 7.1vw;
  background: rgba(62, 181, 228, 0.25) !important;
  border: 1px solid #22aee6;
}

.remember-password-text {
  width: 5vw;
  height: 1.9vh;
  position: absolute;
  top: 32.6vh;
  left: 8.2vw;
  color: #ffffff;
  font-size: 0.2rem;
  font-family: PingFangSC-Regular;
}

.forget-password-text {
  width: 5vw;
  height: 1.9vh;
  position: absolute;
  top: 32.6vh;
  left: 16.4vw;
  color: #ffffff;
  font-size: 0.2rem;
  font-family: PingFangSC-Regular;
}

.login-btn {
  width: 20.8vw;
  height: 4.4vh;
  position: absolute;
  top: 36.7vh;
  left: 7.1vw;
  font-size: 0.2rem;
}
</style>
