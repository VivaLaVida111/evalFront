<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        体征分数录入
      </h5>
    </el-header>
    <OptionalEntry />
  </el-container>
</template>

<script setup>
// TODO：
// 因为现在要实现两种录入逻辑，一种是选项式录入。一种是表格录入，所以要把这个录入部分拆分成两个组件，另外横向柱状图也要独立成一个组件
import OptionalEntry from "./OptionalEntry.vue";



</script>