<template>
  <!-- 导航栏 -->
  <el-header class="header" style="height:1.5rem ;background-image: url(/images/head_bg.png); no-repeat;background-size: 100% 100%;" >
    <!-- 商标栏-->
    <el-row>
      <!--商标-->
      <el-col :span="11">
        <div style="margin-top:.1875rem">
          <el-page-header class="page-header" @back="goback" :icon="null">
            <!-- <template #icon>
              <slot name="icon"></slot>
            </template> -->
            <template #title>
              <slot name="title"></slot>
            </template>

            <template #content>
              <slot name="content"></slot>
            </template>
          </el-page-header>
        </div>
      </el-col>
      <!-- 时间 -->
      
      <el-col :span="5" class="time">
        <slot name="time"></slot>
      </el-col>
            <el-col :span="3" class="warning">
        <slot name="warning"></slot>
      </el-col>
      <!--用户信息-->
      <el-col :span="5" class="userinfo">
        <slot name="userinfo"></slot>
      </el-col>
    </el-row>
  </el-header>
</template>

<script setup>
import "@/assets/js/flexible.js";
// 向父组件抛出事件，由父组件决定如何处理
const emit = defineEmits(['back'])
function goback() {
  emit('back');
}
</script>

<style scoped>
.header {
  font-size: .275rem;
  /* background-color: #004B8C; */
  color: #fff;
  /* height: .8125rem; */
}

:deep(.page-header div::after) {
  content: none;
}

.el-menu {
  border-bottom: none;
}

.el-menu-item {
  line-height: .5rem;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.userinfo {
  font-size: 0.25rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.userinfo .el-dropdown-link) {
  color: #fff;
  font-size: 0.25rem;
}
</style>