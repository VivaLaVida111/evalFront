<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px; display: flex; align-items: center;">
      <h5 class="card-title" style="font-size: 30px; padding: 5px; margin-right: 20px;">
        体征运行情况导入 {{ roles ? `- ${roles}` : '' }}
      </h5>
      <el-button type="primary" @click="showOptionalEntry" style="margin-right: 10px;">选项式录入</el-button>
<!--      <el-button type="primary" @click="showTableEntry">表格式录入</el-button>-->
    </el-header>
    <!-- 传递 roles 参数给子组件 -->
    <div v-if="currentView === 'OptionalEntry'">
      <OptionalEntry :initialRole="roles" />
    </div>
    <div v-else-if="currentView === 'TableEntry'">
      <TableEntry :initialRole="roles" />
    </div>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import OptionalEntry from "./OptionalEntry.vue";
import TableEntry from "./TableEntry.vue";

const route = useRoute();
const currentView = ref('OptionalEntry');

// 从路由查询参数中获取roles
const roles = computed(() => {
  return route.query.roles || '';
});

const showOptionalEntry = () => {
  currentView.value = 'OptionalEntry';
};

const showTableEntry = () => {
  currentView.value = 'TableEntry';
};
</script>