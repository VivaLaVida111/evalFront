import { createRouter, createWebHashHistory } from "vue-router";

//1.定义路由组件
import Login from '@/views/Login.vue'
import Home from '@/views/home/Home.vue'
import Content from '@/views/content/Content.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
//2.配置路由映射
const routes = [
  {
    path: "/",
    component: Home,
    meta: { requestAuth: false },
  },
  {
    path: "/login",
    component: Login,
    meta: { requestAuth: false },
  },
  {
    name: "home",
    path: "/home",
    component: Home,
    meta: { requestAuth: false },
    children: [
      {
        name: "map",
        path: "map", //子组件的path不以/开头
        component: Home, //() => import('@/views/home/components/MapView.vue')
      },
    ],
  },

  {
    name: "content",
    path: "/content",
    component: Content,
    meta: { requestAuth: false },
    children: [
      {
        name: "penaltyPoints",
        path: "penaltyPoints", // 子组件的path不以/开头
        component: () => import("@/views/content/components/PenaltyPoints.vue"),
      },
      {
        name: "ruleConfig",
        path: "ruleConfig", // 子组件的path不以/开头
        component: () => import("@/views/content/components/RuleConfig.vue"),
      },
      {
        name: "subdivisionEntry",
        path: "subdivisionEntry", // 子组件的path不以/开头
        component: () => import("@/views/content/components/SubdivisionEntry.vue"),
      },
    ],
  },
];

//3.创建路由实例
const router = createRouter({
    routes,
    // 没有#号
    // history: createWebHistory()
    // 有#号
    history: createWebHashHistory()
})

export default router;

