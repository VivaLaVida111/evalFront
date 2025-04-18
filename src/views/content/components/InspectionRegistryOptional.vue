<template>
  <el-container>
    <el-main>
      <el-form ref="form" :model="inspectionRecord" label-width="120px">
        <el-form-item label="问题来源">
          <el-select v-model="inspectionRecord.resource" placeholder="选择问题来源">
            <el-option
              v-for="source in sources"
              :key="source.value"
              :label="source.label"
              :value="source.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="巡查编号">
          <el-input v-model="inspectionRecord.inspectionNumber" style="width: 1000px" placeholder="请输入巡查编号"></el-input>
        </el-form-item>
        <el-form-item label="工地名称">
          <el-input v-model="inspectionRecord.siteName" style="width: 1000px" placeholder="请输入工地名称"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input
            v-model="inspectionRecord.detailSite"
            style="width: 1000px"
            type="textarea"
            rows="2"
            placeholder="请输入详细地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属街道">
          <el-select v-model="inspectionRecord.street" placeholder="选择街道">
            <el-option
              v-for="street in streets"
              :key="street.value"
              :label="street.label"
              :value="street.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="问题属性">
          <el-select v-model="inspectionRecord.atrribute" placeholder="选择问题属性">
            <el-option
              v-for="attr in attributes"
              :key="attr.value"
              :label="attr.label"
              :value="attr.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="巡查状态">
          <!-- <el-select v-model="inspectionRecord.patrolStatus" placeholder="选择巡查状态">
            <el-option
              v-for="status in patrolStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select> -->
          <el-input 
            v-model="inspectionRecord.patrolStatus" 
            placeholder="巡查状态"
            style="width: 1000px"
          ></el-input>
        </el-form-item>
        <el-form-item label="巡查时间">
          <el-date-picker
            v-model="inspectionRecord.patrolTime"
            type="datetime"
            placeholder="选择巡查时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="巡查人">
          <el-input v-model="inspectionRecord.patroller" style="width: 300px" placeholder="请输入巡查人姓名"></el-input>
        </el-form-item>
        <el-form-item label="核查状态">
          <el-select v-model="inspectionRecord.checkStatus" placeholder="选择核查状态">
            <el-option
              v-for="status in checkStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { addInspectionRecord, formatLocalDateTime } from '@/api/content.js';

const form = ref(null);

const sources = ref([
  { label: "市上巡查", value: "市上巡查" },
  { label: "区上巡查", value: "区上巡查" },
  { label: "街道自查", value: "街道自查" },
]);

const streets = ref([
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
]);

const attributes = ref([
  { label: "出入口是否冲洗干净", value: "出入口是否冲洗干净" },
  { label: "土石方开挖是否湿法作业", value: "土石方开挖是否湿法作业" },
  { label: "裸土是否完全覆盖", value: "裸土是否完全覆盖" },
  { label: "围挡喷淋是否开启", value: "围挡喷淋是否开启" },
  { label: "围挡有无破损脏污", value: "围挡有无破损脏污" },
  { label: "有无违规夜间施工", value: "有无违规夜间施工" },
  { label: "其他", value: "其他" },
]);

// const patrolStatuses = ref([
//   { label: "已立案", value: "已立案" },
//   { label: "处理中", value: "处理中" },
//   { label: "已办结", value: "已办结" },
// ]);

const checkStatuses = ref([
  { label: "已整改", value: "已整改" },
  { label: "未整改", value: "未整改" },
  { label: "无问题", value: "无问题" },
]);

const inspectionRecord = reactive({
  resource: '',
  inspectionNumber: '',
  siteName: '',
  detailSite: '',
  street: '',
  atrribute: '',
  patrolStatus: '',
  patrolTime: formatLocalDateTime(),
  patroller: '',
  patrolPic: '',
  checkStatus: '',
  reformPic: ''
});

const submitForm = async () => {
  // Validate form data
  if (!inspectionRecord.inspectionNumber) {
    ElMessage.error('请输入巡查编号');
    return;
  }
  if (!inspectionRecord.siteName) {
    ElMessage.error('请输入工地名称');
    return;
  }
  if (!inspectionRecord.street) {
    ElMessage.error('请选择所属街道');
    return;
  }
  if (!inspectionRecord.patrolTime) {
    ElMessage.error('请选择巡查时间');
    return;
  }
  if (!inspectionRecord.patroller) {
    ElMessage.error('请输入巡查人姓名');
    return;
  }

  try {
    await addInspectionRecord(inspectionRecord);
    ElMessage({
      message: '巡查记录提交成功',
      type: 'success',
    });
    resetForm();
  } catch (error) {
    console.error('提交巡查记录失败：', error);
    ElMessage.error('提交失败，请重试');
  }
};

const resetForm = () => {
  Object.assign(inspectionRecord, {
    resource: '',
    inspectionNumber: '',
    siteName: '',
    detailSite: '',
    street: '',
    atrribute: '',
    patrolStatus: '',
    patrolTime: formatLocalDateTime(),
    patroller: '',
    patrolPic: '',
    checkStatus: '',
    reformPic: ''
  });
};
</script>

<style scoped>
/* Add any custom styles here */
</style>