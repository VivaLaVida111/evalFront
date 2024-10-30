<template>
  <div class="login-container">
    <div class="login-header">
      <div class="login-header-title">成都市金牛区综合行政执法局</div>
    </div>
    <div class="login-box">
      <img class="login-box-logo" alt="" src="@/assets/login/login-logo.png" />
      <div class="login-box-title">城乡环境综合治理体征监测系统</div>
      <input
        v-model="params.username"
        class="username-input"
        type="text"
        placeholder="请输入用户名"
      />
      <input
        v-model="params.password"
        class="password-input"
        type="password"
        placeholder="请输入密码"
      />
      <input
        class="remember-password"
        type="checkbox"
        @change="changeRememberUser"
      />
      <div class="remember-password-text">记住密码</div>
      <!-- <a href="#/forget-password" class="forget-password-text" >忘记密码？</a> -->

      <!-- <el-button
        class="forget-password-text"
        plain
        link
        color="#ffffff"
        @click="forgetPassword"
        size="large"
        >忘记密码？
      </el-button> -->

      <el-button class="login-btn" type="primary" color="#0B9ED9" @click="login"
        >登录</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ElButton } from "element-plus";
import router from "@/router";
import { ref, onMounted, reactive, h } from "vue";
import { ElMessage, ElDialog, tabBarProps } from "element-plus";
import { params } from "@/store/store.js";
import { getLogin } from "@/api/home.js";

// import { useCookies } from '@vueuse/integrations/useCookies'
import { setToken } from "@/composables/auth";
import { useStore } from "vuex";

const store = useStore();

const Base64 = require("js-base64").Base64;
// const params = reactive({
//   username: "",
//   password: "123"
// })

onMounted(() => {
  // 获取整个哈希部分（包括 #）
  const hash = window.location.hash;

  // 如果哈希部分包含参数，则可以从中提取参数
  if (hash.includes("?")) {
    const paramsString = hash.split("?")[1]; // 获取问号后面的部分
    const urlParams = new URLSearchParams(paramsString);
    console.log("urlParams:" + urlParams);
    // 获取参数值

    const username = urlParams.get("username");
    console.log("获取到的username!!=" + username);
    const password = urlParams.get("password");
    if (username && password) {
      params.username = Base64.decode(username);
      params.password = Base64.decode(password);
      login();
    }
  } else {
    if (localStorage.getItem("username"))
      params.username = localStorage.getItem("username");
    if (localStorage.getItem("password"))
      params.password = localStorage.getItem("password");
  }
});

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
