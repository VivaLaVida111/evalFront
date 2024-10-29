<template>
  <el-container class="dcontainer">
    <!-- 导航栏 -->
    <Header style="height: 8%;  background-color: #004B8C; " :icon="null">
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
             <div style="font-size:0.25rem; padding-right:10px;margin-top:0.05rem">{{ user.username + "（" + user.role + "）" }}</div>
            <el-icon style="font-size:0.25rem;position:absolute;right:0;top:0;;margin-top:0.05rem">
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
            <template v-if="item.submenu.length != 0">
              <el-sub-menu :index="idx + ''" :key="idx" collapse="true">
                <template #title>
                  <div
                    class="menu-img-default menu-img"
                    :style="getIcon(item.icon)"
                  ></div>
                  <!-- <el-image :src="require('@/assets/yyxt/' + item.icon)" class="menu-img"/> -->
                  <span style="font-size: .25rem">{{ item.title }}</span>
                </template>
                <el-menu-item
                  v-for="(subitem, subidx) in item.submenu"
                  :index="idx + '-' + subidx"
                  :key="subidx"
                  @click="displayContentWithQuery(subitem.to, subitem.query)"
                >
                  <div
                    class="menu-img-default menu-img"
                    :style="getIcon(item.icon)"
                  ></div>
                  <!-- <el-image :src="require('@/assets/yyxt/' + item.icon)" class="menu-img"/> -->
                  <span style="font-size: .25rem">{{ subitem.title }}</span>
                </el-menu-item>
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
                <!-- <el-image :src="require('@/assets/yyxt/' + item.icon)" class="menu-img"/> -->
                <span style="font-size: .25rem">{{ item.title }}</span>
              </el-menu-item>
            </template>
          </template>
          <!-- <el-menu-item>
              <el-icon><component :is="Link"></component></el-icon>
              <span style="font-size:20px"><a href="http://101.37.246.72/denglu_xzzf.exe" target="_blank">跳转主页</a></span>
            </el-menu-item> -->
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
  router.push("/content/penaltyPoints");
  //从地图主页跳转到content下的其他子组件
  if (route.query.carNumber) {
    var carNumber = route.query.carNumber;
    router.push({
      path: "/content/carDetailInfo",
      query: { carNumber: carNumber },
    });
  }
  if (route.query.station == 1) {

    router.push({
      path: "/content/Hongxing",

    });
  }
        if (route.query.station==2) {

    router.push({
      path: "/content/Xihua",
      
    });
  }
          if (route.query.station==3) {

    router.push({
      path: "/content/Wukuaishi",
      
    });
  }
          if (route.query.station==4) {

    router.push({
      path: "/content/Wulidun",
      
    });
  }
          if (route.query.station==5) {

    router.push({
      path: "/content/Honghuayan",
      
    });
  }
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
//   onMounted(()=>router.push('/xzzf/qdkq'))

// 这个应该从后台请求获得
const menuList = [
  // { icon: '02,01', title: '金牛区汇总统计分析', to: 'jinniu', submenu: [] },
  {
    icon: "02,14",
    title: "考评分数查询",
    to: "penaltyPoints",
    submenu: [
      { icon: "", title: "抚琴街道", to: "penaltyPoints", query: "抚琴街道"  },
      { icon: "", title: "西安路街道", to: "penaltyPoints", query: "西安路街道"  },
      { icon: "", title: "驷马桥街道", to: "penaltyPoints", query: "驷马桥街道"  },
      { icon: "", title: "荷花池街道", to: "penaltyPoints", query: "荷花池街道"  },
      { icon: "", title: "五块石街道", to: "penaltyPoints", query: "五块石街道"  },
      { icon: "", title: "九里堤街道", to: "penaltyPoints", query: "九里堤街道"  },
      { icon: "", title: "营门口街道", to: "penaltyPoints", query: "营门口街道"  },
      { icon: "", title: "茶店子街道", to: "penaltyPoints", query: "茶店子街道"  },
      { icon: "", title: "金泉街道", to: "penaltyPoints", query:  "金泉街道" },
      { icon: "", title: "沙河源街道", to: "penaltyPoints", query: "沙河源街道"  },
      { icon: "", title: "天回镇街道", to: "penaltyPoints", query: "天回镇街道"  },
      { icon: "", title: "西华街道", to: "penaltyPoints", query: "西华街道"  },
      { icon: "", title: "凤凰山街道", to: "penaltyPoints", query: "凤凰山街道"  }
    ],
  },

  // { icon: '03,16', title: '垃圾预测', to: 'qdkq', submenu: [] },
  { icon: "03,17", title: "评分规则", to: "ruleConfig", submenu: [] },
  { icon: "03,17", title: "扣分项录入", to: "subdivisionEntry", submenu: [] },
  /* { icon: "01,16", title: "车辆轨迹分析", to: "carRecord", submenu: [] },
  { icon: "03,09", title: "车辆预警分析", to: "carWarning", submenu: [] },
  {
    icon: "03,10",
    title: "垃圾渗滤液",
    to: "osmoticFluid",
      submenu: [
      { icon: "", title: "大站渗滤液汇总", to: "osmoticFluid" },
      { icon: "", title: "红星站渗滤液", to: "hongxingShenlvye" },
      { icon: "", title: "西华站渗滤液", to: "xihuaShenlvye" },
   
    ],
  },
  { icon: "02,14", title: "告警事件历史查询", to: "alarmEvent", submenu: [] }, */
];
function displayContent(name) {
  router.push({ name });
}
function displayContentWithQuery(name, params) {
  router.push({ path: name, query: {street: params} });
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
  font-size: .25rem;
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
  padding: .1875rem;
  font-size: .3125rem;
  margin-left: .125rem;
 
  white-space: nowrap;
  letter-spacing: .0375rem;
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
/* ============================================================= */
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
