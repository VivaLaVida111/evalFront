import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueAMap, { initAMapApiLoader } from '@vuemap/vue-amap';
import '@vuemap/vue-amap/dist/style.css'
import VueTianditu from "vue-tianditu";
import DataVVue3 from '@kjgl77/datav-vue3'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


initAMapApiLoader({
    key: '61ad75101d54a5371d872c69fdce0d3f'
})

//全局引入echarts
import * as echarts from 'echarts';
//挂载echarts方法
//vue2.0版本
// Vue.prototype.$echarts = echarts;
//vue3.0版本
//app.config.globalProperties.$echarts = echarts;
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import 'dayjs/locale/zh-cn';
import weekRange from 'date-picker-week-range'
import DateWeekRange from 'date-week-range'
import './assets/font/iconfont.css'




createApp(App)
    .use(router)
    .use(ElementPlus, {
          locale: zhCn,
    })
    .use(weekRange)
    .use(DateWeekRange)
    .use(VueAMap)
    .use(DataVVue3)
    .use(VueTianditu, {
        v: "4.0", //目前只支持4.0版本
        tk: "6ee41245f1a0d9acb64e891964a7738e"
    })
    .mount('#app')
    //挂载echarts
    .config.globalProperties.$echarts = echarts;

//引入高德地图