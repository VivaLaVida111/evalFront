<template>
  <el-container>
    <el-main>
      <el-form ref="form" label-width="80px">  
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="street" label="街道" width="120" fixed>
            <template #default="scope">
              {{ scope.row.street }}
            </template>
          </el-table-column>
          <el-table-column prop="resource" label="问题来源" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.resource" placeholder="问题来源">
                <el-option
                  v-for="source in sources"
                  :key="source.value"
                  :label="source.label"
                  :value="source.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="inspectionNumber" label="巡查编号" width="120">
            <template #default="scope">
              <el-input v-model="scope.row.inspectionNumber" placeholder="请输入巡查编号"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="siteName" label="工地名称" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.siteName" placeholder="请输入工地名称"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="detailSite" label="详细地址" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailSite" placeholder="请输入详细地址"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="atrribute" label="问题属性" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.atrribute" placeholder="问题属性">
                <el-option
                  v-for="attr in attributes"
                  :key="attr.value"
                  :label="attr.label"
                  :value="attr.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="patrolStatus" label="巡查状态" width="120">
            <template #default="scope">
              <!-- <el-select v-model="scope.row.patrolStatus" placeholder="巡查状态">
                <el-option
                  v-for="status in patrolStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select> -->
              <el-input v-model="scope.row.patrolStatus" placeholder="巡查状态"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="patrolTime" label="巡查时间" width="180">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.patrolTime"
                type="datetime"
                placeholder="选择巡查时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
              ></el-date-picker>
            </template>
          </el-table-column>
          <el-table-column prop="patroller" label="巡查人" width="120">
            <template #default="scope">
              <el-input v-model="scope.row.patroller" placeholder="请输入巡查人"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="checkStatus" label="核查状态" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.checkStatus" placeholder="核查状态">
                <el-option
                  v-for="status in checkStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="initTableData">重置</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { addInspectionRecord, formatLocalDateTime } from '@/api/content.js';

const form = ref(null);

const sources = [
  { label: "市上巡查", value: "市上巡查" },
  { label: "区上巡查", value: "区上巡查" },
  { label: "街道自查", value: "街道自查" },
];

const streets = [
  { label: "抚琴街道", value: "抚琴街道" },
  { label: "西安路街道", value: "西安路街道" },
  { label: "驷马桥街道", value: "驷马桥街道" },
  { label: "荷花池街道", value: "荷花池街道" },
  { label: "五块石街道", value: "五块石街道" },
  { label: "九里堤街道", value: "九里堤街道" },
  { label: "营门口街道", value: "营门口街道" },
  { label: "茶店子街道", value: "茶店子街道" },
  { label: "金泉街道", value: "金泉街道" },
  { label: "沙河源街道", value: "沙河源街道" },
  { label: "天回镇街道", value: "天回镇街道" },
  { label: "西华街道", value: "西华街道" },
  { label: "凤凰山街道", value: "凤凰山街道" },
];

const attributes = [
  { label: "出入口是否冲洗干净", value: "出入口是否冲洗干净" },
  { label: "土石方开挖是否湿法作业", value: "土石方开挖是否湿法作业" },
  { label: "裸土是否完全覆盖", value: "裸土是否完全覆盖" },
  { label: "围挡喷淋是否开启", value: "围挡喷淋是否开启" },
  { label: "围挡有无破损脏污", value: "围挡有无破损脏污" },
  { label: "有无违规夜间施工", value: "有无违规夜间施工" },
  { label: "其他", value: "其他" },
];

// const patrolStatuses = [
//   { label: "已立案", value: "已立案" },
//   { label: "处理中", value: "处理中" },
//   { label: "已办结", value: "已办结" },
// ];

const checkStatuses = [
  { label: "已整改", value: "已整改" },
  { label: "未整改", value: "未整改" },
  { label: "无问题", value: "无问题" },
];

const createEmptyInspectionRecord = (street) => {
  return {
    resource: '',
    inspectionNumber: '',
    siteName: '',
    detailSite: '',
    street: street,
    atrribute: '',
    patrolStatus: '',
    patrolTime: formatLocalDateTime(),
    patroller: '',
    patrolPic: '',
    checkStatus: '',
    reformPic: ''
  };
};

// 初始化表格数据，每个街道一行
const tableData = ref([]);

onMounted(() => {
  initTableData();
});

const initTableData = () => {
  // 创建每个街道对应的一行数据
  tableData.value = streets.map(street => createEmptyInspectionRecord(street.value));
};

const submitForm = async () => {
  // 只提交有数据的行
  const validRows = tableData.value.filter(row => 
    row.inspectionNumber || row.siteName || row.resource
  );
  
  if (validRows.length === 0) {
    ElMessage.warning('没有可提交的巡查记录数据');
    return;
  }
  
  // 验证所有有效行的必填字段
  const invalidRows = [];
  
  validRows.forEach((row, index) => {
    if (!row.inspectionNumber || !row.siteName || !row.patrolTime || !row.patroller) {
      invalidRows.push(row.street);
    }
  });
  
  if (invalidRows.length > 0) {
    ElMessage.error(`${invalidRows.join(', ')} 的数据不完整，请检查必填字段`);
    return;
  }

  try {
    // 提交所有有效行
    const promises = validRows.map(record => addInspectionRecord(record));
    await Promise.all(promises);
    
    ElMessage({
      message: '巡查记录提交成功',
      type: 'success',
    });
    initTableData(); // 提交完成后初始化表格数据
  } catch (error) {
    console.error('提交巡查记录失败：', error);
    ElMessage.error('提交失败，请重试');
  }
};
</script>

<style scoped>
.el-table {
  margin-bottom: 20px;
}
</style>