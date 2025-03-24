<template>
  <el-container class="dcontainer">
    <!-- 导航栏 -->
    <Header style="height: 8%; background-color: #004b8c" :icon="null">
      <!-- 系统名字 -->
      <template #title>
        <span class="text-title">金牛区城乡环境综合治理体征监测系统</span>
      </template>
      <!-- 时间 -->

      <template #time>
        <div class="text-week">今天是: {{ date }} {{ week }}</div>
      </template>

      <!-- 用户信息 -->
      <template #userinfo>
        <div class="router">
          <el-button
            class="buttonToMap"
            plain
            link
            color="fff"
            @click="toMap"
            size="large"
            >前往地图主页</el-button
          >
        </div>
        <el-dropdown>
          <span class="el-dropdown-link">
            <div
              style="
                font-size: 0.25rem;
                padding-right: 10px;
                margin-top: 0.05rem;
              "
            >
              {{ params.realname + "（" + params.role + "）" }}
            </div>
            <el-icon
              style="
                font-size: 0.25rem;
                position: absolute;
                right: 0;
                top: 0;
                margin-top: 0.05rem;
              "
            >
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </Header>

    <el-container class="data-container">
      <el-aside>
        <el-menu class="menu" default-active="1">
          <!--有二级菜单，则以子菜单的形式展示;没有二级菜单，则以菜单项显示-->
          <template v-for="(item, idx) in menuList">
            <template v-if="item.submenu.length > 0">
              <el-sub-menu :index="idx + ''" :key="idx" collapse="true">
                <!-- 一级标题 -->
                <template #title>
                  <div
                    class="menu-img-default menu-img"
                    :style="getIcon(item.icon)"
                  ></div>
                  <span style="font-size: 0.25rem">{{ item.title }}</span>
                </template>
                <template v-for="(subitem, subidx) in item.submenu">
                  <!-- 分两种情况，1.当用户是某大规则的管理员时（不包含总的管理者）只能看到按街道查询的内容，同时按街道查询下的内容只显示该规则的事件 -->
                  <!-- 2.当用户是普通浏览者或管理者时，既可以按街道查询，又可以按管理门类（大规则）查询；按街道查询时，显示该街道所有大规则的扣分；按管理门类查询时，显示该规则下所有街道的扣分 -->
                  <el-sub-menu
                    :index="idx + '-' + subidx"
                    :key="idx + '-' + subidx"
                    v-if="subitem.submenu && subitem.submenu.length && subitem.visible !== false"
                  >
                    <!-- 二级标题 -->
                    <template #title>
                      <span style="font-size: 0.20rem">{{
                        subitem.title
                      }}</span>
                    </template>
                    <el-menu-item
                      v-for="(subsubitem, subsubidx) in subitem.submenu"
                      :index="idx + '-' + subidx + '-' + subsubidx"
                      :key="idx + '-' + subidx + '-' + subsubidx"
                      @click="
                        displayContentWithQuery(subsubitem.to, subsubitem.street, subsubitem.roles)
                      "
                    >
                      <!-- 三级标题 -->
                      <span style="font-size: 0.15rem">{{
                        subsubitem.title
                      }}</span>
                    </el-menu-item>
                  </el-sub-menu>
                </template>
              </el-sub-menu>
            </template>
            <template v-else>
              <el-menu-item
                :index="idx + ''"
                :key="idx"
                @click="displayContent(item.to)"
              >
                <div
                  class="menu-img-default menu-img"
                  :style="getIcon(item.icon)"
                ></div>
                <span style="font-size: 0.25rem">{{ item.title }}</span>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { House, ArrowDown, Setting, Link } from "@element-plus/icons-vue";
import Header from "@/components/Header.vue";
import { ref, onMounted, reactive, onBeforeMount } from "vue";
import axios from "axios";
import { params } from "@/store/store.js";

// =========================================================

// 由于<script setup>使用动态组件时，:is属性的值是对象实例，而不是组件名
// 而menuList里的icon是组件名，因此这里做一个映射
const icons = {
  House,
  Setting,
};
const user = reactive({
  username: "张三",
  role: "管理员",
});
//日期 周
let date = new Date().toLocaleDateString();
var a = new Array("日", "一", "二", "三", "四", "五", "六");
var str = new Date().getDay();
var week = "星期" + a[str];
function toSystem(item) {
  router.push({ name: item.to, params: item.systemName });
}
//部门列表, 从后端获取
onMounted(() => {
  // 默认跳转到jinniu子组件
  //router.push("/content/penaltyPoints");
  router.push({ path: "/content/penaltyPoints", query: { roles: params.role } });
});

// 系统列表
const systems = ref([]);

//选中的部门
// -1表示全选，为默认值
const choosedDept = ref(-1);
const choosedDeptName = ref();
//选中部门对应的子系统

// 跳转到to指定的子系统汇总页面
function show(to, subsysName) {
  if (to === "") {
    ll;
    ElMessage({
      showClose: true,
      message: "正在开发中...",
    });
  } else {
    router.push({ name: to, params: { subsysName } });
  }
}
function toMap() {
  router.push("/home");
}

// 设置子系统名字
const route = useRoute();
const subsysName = ref(route.params.subsysName);

// 导航栏的返回上一级按键
const router = useRouter();
function goback() {
  router.push("/home");
}
function logout() {
  //TODO 清除登录信息
  router.push("/login");
}

// 这个应该从后台请求获得
const menuList = [
  {
    icon: "02,14",
    title: "体征事件查询",
    to: "penaltyPoints",
    submenu: [
      {
        icon: "",
        title: "按街道查询",
        to: "",
        visible: true,
        submenu: [
          { icon: "", title: "全区", to: "penaltyPoints" },
          {
            icon: "",
            title: "抚琴街道",
            to: "penaltyPoints",
            street: "抚琴街道",
            visible: true,
          },
          {
            icon: "",
            title: "西安路街道",
            to: "penaltyPoints",
            street: "西安路街道",
            visible: true,
          },
          {
            icon: "",
            title: "驷马桥街道",
            to: "penaltyPoints",
            street: "驷马桥街道",
            visible: true,
          },
          {
            icon: "",
            title: "荷花池街道",
            to: "penaltyPoints",
            street: "荷花池街道",
            visible: true,
          },
          {
            icon: "",
            title: "五块石街道",
            to: "penaltyPoints",
            street: "五块石街道",
            visible: true,
          },
          {
            icon: "",
            title: "九里堤街道",
            to: "penaltyPoints",
            street: "九里堤街道",
            visible: true,
          },
          {
            icon: "",
            title: "营门口街道",
            to: "penaltyPoints",
            street: "营门口街道",
            visible: true,
          },
          {
            icon: "",
            title: "茶店子街道",
            to: "penaltyPoints",
            street: "茶店子街道",
            visible: true,
          },
          {
            icon: "",
            title: "金泉街道",
            to: "penaltyPoints",
            street: "金泉街道",
            visible: true,
          },
          {
            icon: "",
            title: "沙河源街道",
            to: "penaltyPoints",
            street: "沙河源街道",
            visible: true,
          },
          {
            icon: "",
            title: "天回镇街道",
            to: "penaltyPoints",
            street: "天回镇街道",
            visible: true,
          },
          {
            icon: "",
            title: "西华街道",
            to: "penaltyPoints",
            street: "西华街道",
            visible: true,
          },
          {
            icon: "",
            title: "凤凰山街道",
            to: "penaltyPoints",
            street: "凤凰山街道",
            visible: true,
          },
        ],
      },
      {
        icon: "",
        title: "按管理门类查询",
        to: "",
        visible: params.role === "viewer" || params.role.includes("管理者"),
        submenu: [
          {
            icon: "",
            title: "环境卫生",
            to: "penaltyPoints",
            roles: "环境卫生",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "市容秩序",
            to: "penaltyPoints",
            roles: "市容秩序",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "执法案件办理",
            to: "penaltyPoints",
            roles: "执法案件办理",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "广告招牌",
            to: "penaltyPoints",
            roles: "广告招牌",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "扬尘治理",
            to: "penaltyPoints",
            roles: "扬尘治理",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          // {
          //   icon: "",
          //   title: "园林绿化",
          //   to: "penaltyPoints",
          //   roles: "园林绿化",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "通讯设施治理",
          //   to: "penaltyPoints",
          //   roles: "通讯设施治理",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "河道沟渠环境治理",
          //   to: "penaltyPoints",
          //   roles: "河道沟渠环境治理",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "再生资源体系建设",
          //   to: "penaltyPoints",
          //   roles: "再生资源体系建设",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "工地治理",
          //   to: "penaltyPoints",
          //   roles: "工地治理",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "闲置地块脏乱差治理",
          //   to: "penaltyPoints",
          //   roles: "闲置地块脏乱差治理",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "油烟负面清单",
          //   to: "penaltyPoints",
          //   roles: "油烟负面清单",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          {
            icon: "",
            title: "固体废弃物处置及垃圾分类",
            to: "penaltyPoints",
            roles: "固体废弃物处置及垃圾分类",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "数字化常态监管",
            to: "penaltyPoints",
            roles: "数字化常态监管",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "网络理政",
            to: "penaltyPoints",
            roles: "网络理政",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          {
            icon: "",
            title: "油烟治理",
            to: "penaltyPoints",
            roles: "油烟治理",
            visible: params.role === "viewer" || params.role.includes("管理者"),
          },
          // {
          //   icon: "",
          //   title: "第三方测评",
          //   to: "penaltyPoints",
          //   roles: "第三方测评",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
          // {
          //   icon: "",
          //   title: "领导小组综合评价",
          //   to: "penaltyPoints",
          //   roles: "领导小组综合评价",
          //   visible: params.role === "viewer" || params.role.includes("管理者"),
          // },
        ],
      },
    ],
  },
  { icon: "03,17", title: "评分规则", to: "ruleConfig", submenu: [] },
  { icon: "03,17", title: "体征分数录入", to: "subdivisionEntry", submenu: [] },
];

function displayContent(name) {
  router.push({ name });
}

function displayContentWithQuery(name, street, roles) {
  if (roles != undefined && roles != "") {
    // 有roles参数，说明是按管理门类查询
    router.push({ path: name, query: { roles: roles } });
  } else if (street != undefined && street != "") {
    // 有street参数，说明是按街道查询；同时传递roles参数对大规则进行过滤：对应大规则的管理员只能看到该规则的事件，viewer和总的管理者可以看到所有规则的事件
    router.push({ path: name, query: { street: street, roles: params.role } });
  } else {
    // 无参数，传递roles参数对大规则进行过滤
    router.push({ path: name, query: { roles: params.role } });
  }
}

function getIcon(idxStr) {
  const len = -30;
  const x = parseInt(idxStr.split(",")[1] - 1) * len;
  const y = parseInt(idxStr.split(",")[0] - 1) * len;
  return {
    backgroundPositionX: x + "px",
    backgroundPositionY: y + "px",
  };
}
</script>

<style scoped src="@/assets/css/subsys.css"></style>
<style scoped>
/* .logo-title{
    font-size: x-large;
  color: #fff;
  line-height: 20px;
}
.content{
    padding: 15px;
  font-size: 40px;
  margin-left: 10px;
  margin-bottom: 10px;
  white-space: nowrap;
  letter-spacing: 3px;
} */
.menu-img-default {
  /**原图每个图标都是45 * 45，这里将其变成30 * 30,所以background-size的长宽都乘了2/3 */
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background-image: url("@/assets/nav-icon.png");
  background-size: calc(1000px * 2 / 3) calc(1000px * 2 / 3);
}

.mapDiv {
  width: 100%;
  height: 100%;
}

.closeIcon {
  margin-left: 20px;
}

.text-week {
  margin-left: 20px;
  font-size: 0.25rem;
  color: #fff;
  line-height: 1rem;
  width: 100%;
}

.text-title {
  margin-left: 20px;
  font-size: 0.4rem;
  color: #fff;
  line-height: 30px;
  width: 30%;
  padding: 5px;
}

.el-descriptions-item {
  font-size: 20px;
}

.el-card {
  width: auto;
  padding: 20px;
  margin-top: 20px;
  font-size: 25px;
}

.buttonToMap {
  font-size: 0.25rem;
  color: #fff;
}

.el-dropdown-link {
  font-size: 0.25rem;
}

.table {
  size: large;
  margin-bottom: 1em;
  font-size: 25px;
  line-height: 30px;
}

.item {
  padding: 10px;
}

.router {
  padding: 0.1875rem;
  font-size: 0.3125rem;
  margin-left: 0.125rem;

  white-space: nowrap;
  letter-spacing: 0.0375rem;
}

.content {
  padding: 25px;
  font-size: 40px;
  margin-left: 10px;
  margin-bottom: 10px;
  white-space: nowrap;
  letter-spacing: 3px;
}

.container {
  display: flex;
  flex-direction: column;
}

.navHeader {
  background-color: #fff;
  color: #004b8c;
  margin-left: -20px;
  margin-right: -20px;
  height: initial;
  display: flex;
}

.title {
  padding: 25px;
  font-size: 40px;
  margin-left: 10px;
  margin-bottom: 10px;
  white-space: nowrap;
  letter-spacing: 3px;
}

.subsys {
  /**保持子系统栏与标题栏背景色一致 */
  display: flex;
  flex-wrap: wrap;
  padding: 25px;
  text-align: center;
}

.classification {
  /**保持子系统栏与标题栏背景色一致 */
  display: flex;
  flex-wrap: wrap;
  padding: 25px;
  text-align: center;
}

.main {
  display: flex;
  flex-wrap: wrap;
  /*当屏幕尺寸变小时，各个子系统汇总模块自动换行*/
  justify-content: center;
}

.logo-title {
  font-size: x-large;
  color: #fff;
  line-height: 60px;
}

.background {
  display: flex;
  flex-wrap: wrap;
  width: 200;
}

.subdepts {
  padding: 0px;
  font-size: 25px;
  margin-left: -5px;
  margin-top: 40px;
  white-space: nowrap;
  float: left;
  text-decoration: underline;
}

:deep(.amap-logo) {
  display: none;
  opacity: 0 !important;
}

:deep(.amap-copyright) {
  opacity: 0;
}

#dotClass {
  width: 25px;
  height: 25px;
  margin-top: 2.2vh;
  background-color: #11e1b0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
#lamp {
  width: 25px;
  height: 25px;
  animation-name: imageAnim;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease;
  animation-play-state: running;
  background-image: radial-gradient(yellow, red);
}
@keyframes imageAnim {
  0% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
</style>
