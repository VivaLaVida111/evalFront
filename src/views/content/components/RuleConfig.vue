<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        评分规则
        <el-button
          v-if="params.role.includes('管理者')"
          type="primary"
          @click="showAddDialog"
          style="margin-left: 20px"
        >
          新建
        </el-button>
      </h5>
    </el-header>
    <el-main>
      <el-table
        :data="detailRules"
        style="width: 100%"
        size="large"
        class="data-table"
      >
        <el-table-column
          label="评分项"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <el-input
              v-if="row.editing"
              v-model="row.bigRules.item"
              placeholder="请输入评分项"
            />
            <span v-else>{{ row.bigRules.item }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="评分占比"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <el-input
              v-if="row.editing"
              v-model="row.bigRules.percentage"
              placeholder="请输入评分占比"
            />
            <span v-else>{{ row.bigRules.percentage }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="详情"
          min-width="150"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <el-button @click="toggle(row)">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="150"
          header-align="center"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              v-if="canEdit(row.bigRules.item)"
              type="primary"
              @click="editRow(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canEdit(row.bigRules.item)"
              type="danger"
              @click="deleteRow(row)"
            >
              删除
            </el-button>
            <el-button
              v-if="row.editing"
              type="success"
              @click="updateRow(row)"
            >
              保存
            </el-button>
            <el-button
              v-if="row.editing"
              @click="cancelEdit(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="小规则项详情" v-model="dialogVisible" width="50%">
        <el-table
          v-if="selectedRule"
          :data="selectedRule.smallRules"
          style="width: 100%"
          size="large"
          class="data-table"
        >
          <!-- 序号列 -->
          <el-table-column
            label="序号"
            min-width="50"
            header-align="center"
            align="center"
          >
            <template #default="{ $index }">
              <span>{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <!-- 小规则项列 -->
          <el-table-column
            label="小规则项"
            min-width="150"
            header-align="center"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template #default="{ row }">
              <el-input
                v-if="row.editing"
                v-model="row.item"
                placeholder="请输入小规则项"
              />
              <span v-else>{{ row.item }}</span>
            </template>
          </el-table-column>
          <!-- 操作列 -->
          <el-table-column
            label="操作"
            min-width="150"
            header-align="center"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                v-if="canEdit(selectedRule.bigRules.item)"
                type="primary"
                @click="editSmallRule(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canEdit(selectedRule.bigRules.item)"
                type="danger"
                @click="deleteSmallRow(row)"
              >
                删除
              </el-button>
              <el-button
                v-if="row.editing"
                type="success"
                @click="updateSmallRow(row)"
              >
                保存
              </el-button>
              <el-button
                v-if="row.editing"
                @click="cancelSmallRuleEdit(row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            v-if="canEdit(selectedRule.bigRules.item)"
            type="primary"
            @click="showAddSmallRuleDialog"
          >
            新建
          </el-button>
        </span>
      </el-dialog>

      <el-dialog title="新建评分规则" v-model="addDialogVisible" width="50%">
        <el-form :model="newRule">
          <el-form-item label="评分项">
            <el-input v-model="newRule.item" placeholder="请输入评分项" />
          </el-form-item>
          <el-form-item label="评分占比">
            <el-input v-model="newRule.percentage" placeholder="请输入评分占比" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewRule">确定</el-button>
        </span>
      </el-dialog>

      <el-dialog title="新建小规则项" v-model="addSmallRuleDialogVisible" width="50%">
        <el-form :model="newSmallRule">
          <el-form-item label="小规则项">
            <el-input v-model="newSmallRule.item" placeholder="请输入小规则项" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addSmallRuleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewSmallRule">确定</el-button>
        </span>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  getDetailRules,
  addBigRule,
  deleteBigRule,
  updateBigRule,
  addSmallRule,
  deleteSmallRule,
  updateSmallRule,
} from "@/api/content.js";
import { params } from "@/store/store.js";

const detailRules = reactive([]);
onMounted(() => {
  getDetailRules().then((data) => {
    detailRules.splice(0, detailRules.length);
    detailRules.push(...data);
  });
});

const selectedRule = ref(null);
const dialogVisible = ref(false);
const addDialogVisible = ref(false);
const addSmallRuleDialogVisible = ref(false);
const newRule = reactive({
  item: "",
  percentage: "",
  deleted: false,
});
const newSmallRule = reactive({
  item: "",
  deleted: false,
  parentId: null,
});

const toggle = (rule) => {
  console.log(rule);
  selectedRule.value = rule;
  dialogVisible.value = true;
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};

const showAddSmallRuleDialog = () => {
  addSmallRuleDialogVisible.value = true;
};

const addNewRule = () => {
  addBigRule(newRule).then(() => {
    //detailRules.push(data);
    addDialogVisible.value = false;
    newRule.item = "";
    newRule.percentage = "";
  });
};

const addNewSmallRule = () => {
  newSmallRule.parentId = selectedRule.value.bigRules.id;
  addSmallRule(newSmallRule).then(() => {
    //selectedRule.value.smallRules.push(data);
    addSmallRuleDialogVisible.value = false;
    newSmallRule.item = "";
    newSmallRule.parentId = null;
  });
};

const editRow = (row) => {
  row.editing = true;
};

const cancelEdit = (row) => {
  row.editing = false;
  getDetailRules().then((data) => {
    detailRules.splice(0, detailRules.length);
    detailRules.push(...data);
  });
};

const updateRow = (row) => {
  var form = {
    id: row.bigRules.id,
    item: row.bigRules.item,
    percentage: row.bigRules.percentage,
  }
  updateBigRule(form).then(() => {
    row.editing = false;
  });
};

const deleteRow = (row) => {
  var form = {
    id: row.bigRules.id,
    item: row.bigRules.item,
    percentage: row.bigRules.percentage,
  }
  deleteBigRule(form).then(() => {
    const index = detailRules.indexOf(row);
    if (index > -1) {
      detailRules.splice(index, 1);
    }
  });
};

const editSmallRule = (row) => {
  row.editing = true;
};

const cancelSmallRuleEdit = (row) => {
  row.editing = false;
  getDetailRules().then((data) => {
    detailRules.splice(0, detailRules.length);
    detailRules.push(...data);
  });
};

const updateSmallRow = (row) => {
  // var form = {
  //   id: row.id,
  //   item: row.item,
  //   parentId: selectedRule.value.bigRules.id
  // }
  updateSmallRule(row).then(() => {
    row.editing = false;
  });
};

const deleteSmallRow = (row) => {
  deleteSmallRule(row).then(() => {
    const index = selectedRule.value.smallRules.indexOf(row);
    if (index > -1) {
      selectedRule.value.smallRules.splice(index, 1);
    }
  });
};

function canEdit(ruleName) {
  return params.role.includes(ruleName) || params.role.includes("管理者");
}
</script>

<style>
/* 确保 el-dialog 没有被隐藏或覆盖 */
.el-dialog {
  z-index: 9999 !important;
}
.long-text {
  white-space: pre-wrap;
  word-break: break-word;
}

</style>