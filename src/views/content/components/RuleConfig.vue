<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        运行规则
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
          label="运行项目"
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
          v-if="false"
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

<!--      <el-dialog title="小规则项详情" v-model="dialogVisible" width="50%">-->
<!--        <el-table-->
<!--          v-if="selectedRule"-->
<!--          :data="selectedRule.smallRules"-->
<!--          style="width: 100%"-->
<!--          size="large"-->
<!--          class="data-table"-->
<!--        >-->
<!--          &lt;!&ndash; 序号列 &ndash;&gt;-->
<!--          <el-table-column-->
<!--            label="序号"-->
<!--            min-width="50"-->
<!--            header-align="center"-->
<!--            align="center"-->
<!--          >-->
<!--            <template #default="{ $index }">-->
<!--              <span>{{ $index + 1 }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          &lt;!&ndash; 小规则项列 &ndash;&gt;-->
<!--          <el-table-column-->
<!--            label="小规则项"-->
<!--            min-width="150"-->
<!--            header-align="center"-->
<!--            align="center"-->
<!--            :show-overflow-tooltip="true"-->
<!--          >-->
<!--            <template #default="{ row }">-->
<!--              <el-input-->
<!--                v-if="row.editing"-->
<!--                v-model="row.item"-->
<!--                placeholder="请输入小规则项"-->
<!--              />-->
<!--              <span v-else>{{ row.item }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          &lt;!&ndash; 操作列 &ndash;&gt;-->
<!--          <el-table-column-->
<!--            label="操作"-->
<!--            min-width="150"-->
<!--            header-align="center"-->
<!--            align="center"-->
<!--          >-->
<!--            <template #default="{ row }">-->
<!--              <el-button-->
<!--                v-if="canEdit(selectedRule.bigRules.item)"-->
<!--                type="primary"-->
<!--                @click="editSmallRule(row)"-->
<!--              >-->
<!--                编辑-->
<!--              </el-button>-->
<!--              <el-button-->
<!--                v-if="canEdit(selectedRule.bigRules.item)"-->
<!--                type="danger"-->
<!--                @click="deleteSmallRow(row)"-->
<!--              >-->
<!--                删除-->
<!--              </el-button>-->
<!--              <el-button-->
<!--                v-if="row.editing"-->
<!--                type="success"-->
<!--                @click="updateSmallRow(row)"-->
<!--              >-->
<!--                保存-->
<!--              </el-button>-->
<!--              <el-button-->
<!--                v-if="row.editing"-->
<!--                @click="cancelSmallRuleEdit(row)"-->
<!--              >-->
<!--                取消-->
<!--              </el-button>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--        <span slot="footer" class="dialog-footer">-->
<!--          <el-button @click="dialogVisible = false">关闭</el-button>-->
<!--          <el-button-->
<!--            v-if="canEdit(selectedRule.bigRules.item)"-->
<!--            type="primary"-->
<!--            @click="showAddSmallRuleDialog"-->
<!--          >-->
<!--            新建-->
<!--          </el-button>-->
<!--        </span>-->
<!--      </el-dialog>-->
      <el-dialog title="小规则项详情" v-model="dialogVisible" width="60%">
        <div v-if="selectedRule" class="rule-text-box">
          <div class="rule-title">运行项目：{{ selectedRule.bigRules.item }}</div>
          <div class="rule-content">{{ detailText }}</div>
        </div>
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
import { ref, reactive, onMounted, computed } from "vue";
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
  // console.log(rule);
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

const RULE_TEXTS = {
  环境卫生: `为进一步解决金牛区环境卫生管理存在的突出问题，做实做细日常工作，提升金牛区环境卫生管理水平。
一、体征构成（100分）
由道路清扫（20）、作业质量（20）、垃圾收运（20）、实地检查（20）、问题处置率（10）和其他（10）六部分构成。
二、道路清扫（20分）
由“金牛城市管家”中的“环卫作业运行管家”中提取数据。一、二、三级道路（区域）应于每日早晨7点前完成普扫作业，四级道路（区域）每日早晨9点前完成普扫作业，发现1条道路1天内未在规定时间内完成普扫，扣0.1分，累计扣分，最高扣分不超过20分。
三、环卫保洁（20分）
由本系统“实地检查”板块导入。发现一起“管理主体”为“环卫所”的“环境卫生”问题扣0.1分，累计扣分制，最高扣分不超过20分。
四、垃圾收运（20分）
由本系统“实地检查”板块导入。发现一起“管理主体”为“车队”的“垃圾分类”问题扣0.5分，累计扣分制，最高扣分不超过20分。
五、实地检查（20分）
由本系统“实地检查”板块导入。发现一起“管理主体”为“环卫所”的“垃圾分类”问题扣0.1分，累计扣分制，最高扣分不超过20分。
六、问题处置率（10分）
由“金牛城市管家”中的“垃圾全生命周期管家”和“环卫作业运行管家”中提取数据。当日，发现问题处置率为0%的，扣0.3分；0%<问题处置率<50%，扣0.25分；50%≦问题处置率<75%，扣0.15分；75%≦问题处置率<90%，扣0.1分；问题处置率≥90%，不扣分。
七、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由环境卫生板块管理员说明情况。`,

  油烟治理: `为进一步解决金牛区餐饮油烟管理存在的突出问题，做实做细日常工作，提升金牛区餐饮油烟治理成效。
一、体征构成（100分）
由网上投诉数量（30）、重复投诉3次以上点位（10）、重点巡查（20）、街道自查（25）、案件办理（5）和其他（10）六部分构成。
二、网上投诉数量（30分）
从网络理政中心提取数据，得分=30-（投诉数量*0.01）/（面积*人口）。举例：抚琴街道当月投诉量为10件，得分=30-（10*0.01）/（0.026*2.141）=28.20。
三、重复投诉3次以上点位（10分）
从网络理政中心提取数据。当月出现一起重复投诉3次以上点位，扣1分，累计扣分，最高扣分不超过10分。
四、重点巡查（20分）
从“金牛城市管家”中“餐饮油烟管家—重点巡查统计”中提取数据，当日发现一起餐饮油烟管理存在的问题，即扣0.05分，累计扣分制，最高扣分不超过20分。
五、街道自查（25分）
从“金牛城市管家”中“餐饮油烟管家”中提取数据。每半月未完成巡查进度的100%，扣3分；全月未完成巡查进度100%的，扣3分，均未达到要求的，扣6分。
六、案件办理（5分）
加分制。从本系统“案件办理”板块中提取数据。发现一起新办结案件则+1分，当月累计加分不超过5分，无新办结案件则此项为0分。
七、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由餐饮油烟治理板块管理员说明情况。`,

  共享单车: `为进一步解决金牛区共享单车市容秩序管控存在的突出问题，做实做细日常工作，提升金牛区共享单车市容秩序管理水平。
一、体征构成（100分）
由单车总量监控（30）、日常P点爆点（20）、重点点位P点爆点（30）、僵尸车（10）和其他（10）五部分构成。
二、单车总量监控（30分）
由“单车统计”板块导入。超出金牛区各街道额定总量每200辆扣0.1分，向下取整，累计叠加扣分制，最高扣分不超过30分。比如，西安路街道当日单车共9050辆，定额为8300辆，超出了750辆，扣0.3分。
三、日常P点管理（20分）
由“P点管理”板块导入。发现发现P点爆点且30分钟内未处理消除爆点情况，每处扣0.5分，累计扣分制，最高扣分不超过20分。
四、重点点位P点管理（30分）
由“P点管理”板块导入。发现重点点位P点爆点，每处扣0.5分，累计扣分制，最高扣分不超过30分。
五、僵尸车（10分）
由“僵尸车”板块导入。区域内每发现100辆僵尸车扣0.1分，向下取整，累计叠加扣分制，最高扣分不超过10分。比如，西安路街道当日发现僵尸车250辆，当日扣分0.2分。
六、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由市容秩序板块管理员说明情况。`,

  广告招牌: `为进一步解决金牛区广告招牌治理存在的突出问题，做实做细日常工作，提升金牛区广告招牌治理成效。
一、体征构成（100分）
由招牌审批量（30）、重复投诉3次以上点位（10）、市区巡查（20）、街道自查（30）和其他（10）五部分构成。
二、招牌审批量（30分）
从金牛城市管家“临街店铺管家”中提取数据，根据各街办现有商铺数量分为四档：第一档：4000个以上商铺的街道（西安路、抚琴、驷马桥、茶店子、荷花池、）：每月审批量≥25块；第二档：2000-3999个商铺的街道（九里堤、五块石、营门口、金泉、天回镇）：每月审批量≥10块；第三档：1000-1999个商铺的街道（沙河源、西华）每月审批量≥5块；1000个以下商铺的街道（凤凰山）每月审批量≥2块。若当月未达标扣3分；达标不扣分。
三、重复投诉3次以上点位（10分）
从网络理政中心提取数据。当月出现一起重复投诉3次以上点位，扣1分，累计扣分，最高扣分不超过10分。
四、区级巡查（20分）
从本系统中“巡查登记”板块中提取数据。由“发现问题数量”（10分）和“发现问题未整改、未整改到位和虚假整改”（10分）两部分构成。
1.市区巡查“发现问题数量”运行规则为，发现1起，扣1分，累计扣分制，最高扣分不超过10分；
2.市区巡查“发现问题未整改、未整改到位和虚假整改”运行规则为，发现1起，扣1分，累计扣分制，最高扣分不超过10分（且此项规则扣分值≦“发现问题数量”扣分值）。
五、街道自查（30分）
从指挥调度系统导入。每半月未完成临街店铺招牌巡查率的50%，或全月未完成临街店铺招牌巡查100%的，扣5分，均未达到要求的，扣10分。
六、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由广告招牌治理板块管理员说明情况。`,

  市容秩序: `为进一步解决金牛区市容秩序管控存在的突出问题，做实做细日常工作，提升金牛区市容秩序管理水平。
一、体征构成（100分）
由指挥调度系统平台使用（30）、队伍风纪检查（20）、日常巡查（20）、重复投诉5次以上点位（20）和其他（10）五部分构成。
二、指挥调度系统平台使用（30分）
由指挥调度系统导入。分为打卡情况（15）和严管街在岗情况（15）两部分构成。
1.打卡情况=当日指挥调度系统打卡率*15。
2.严管街在岗情况=当日严管街在岗率*15。
三、队伍风纪检查（20分）
由本系统“队伍风纪”板块导入。发现一起队伍风纪问题扣5分，累计扣分制，最高扣分不超过20分。
四、日常巡查（20分）
由指挥调度系统导入。分为“临街店铺巡查”（10）和“问题发现处置”（10）两部分构成。
1.临街店铺巡查=当日临街店铺巡查率*10。
2.问题发现处置=当日问题发现处置率*10。
五、充分投诉5次以上点位（20分）
由网络理政中心导入。发现一起重复投诉5次以上点位扣1分，累计扣分制，最高扣分不超过20分。
六、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由市容秩序板块管理员说明情况。`,

  数字城管: `为解决金牛区数字化常态监管存在的突出问题，做实做细日常工作，进一步提升金牛区数字城管工作水平。
一、体征构成（100分）
全部从“综管服”系统导入，由日常处置率（30）、按期处置率（20）、返工率（20）、超期待处置率（20）和延期率（10）五部分构成。
二、日常处置率（30分）
得分=日常处置率*30，日常处置率=（处置数/应处置数）×100%。
三、按期处置率（20分）
得分=按期处置率*20，按期处置率=（按期处置数/应处置数）×100%。
四、返工率（20分）
得分=（1-返工率）×20，返工率=（返工数/应结案数）×100%。
五、超期待处置率（20分）
得分=（1-超期待处置率）×20，超期待处置率=（超期待处置数/应处置数）×100%。
六、延期率（10分）
得分=（1-延期率）×10，延期率=（延期数/应处置数）×100%。`,

  网络理政: `为提升市民群众对城管管理工作的满意度，做实做细日常工作，提升金牛区城市管理的智慧化治理效能。
一、体征构成（100分）
数据全部从网络理政平台导入。由受理量（30）、满意度（30）、办理周期（10）、重复投诉5次级以上（20）和超期（10）五部分构成。
二、受理量（30分）
得分=30-（投诉数量*0.002）/（面积*人口），举例：驷马桥当月投诉量为100件，得分=30-（100*0.002）/（0.026*2.141）=26.407。
三、满意度（30分）
得分=满意率*30
四、办理周期（10分）
得分=（2-办理周期）*10，0分≦得分≦10分，2天内办完为办件周期要求。举例：驷马桥街道7月1日中午12时接到投诉，7月2日晚上12点受理，办理周期=1.5天，则得分=（2-1.5）*10=5分
五、重复投诉5次及以上（20分）
发现一起重复投诉5次以上点位扣1分，累计扣分制，最高扣分不超过20分。
六、超期（10分）
发现一起超期件，扣10分，最高扣分不超过10分。`,

  违法建设: `为解决金牛区违法建设治理存在的突出问题，做实做细日常工作，进一步提升金牛区违法建设治理成效。
一、体征构成（100分）
由违建投诉数量（30）、重复投诉3次以上点位（20）、违建拆除（20）、案件办理（10）和其他（20）五部分构成。
二、违建投诉数量（30分）
从网络理政中心提取数据。当月出现一起投诉，扣0.5分，累计扣分，最高扣分不超过30分。
三、重复投诉3次以上点位（20分）
从网络理政中心提取数据。当月出现一起重复投诉3次以上点位，扣1分，累计扣分，最高扣分不超过20分。
四、违建拆除（20分）
加分制！从本系统中“违建拆除”板块中提取数据。拆除一处违法建设，加5分，拆除存量违法建设的，叠加2分，拆除≥300㎡的违法建设的，叠加2分。累计加分制，最高加分不超过20分。
比如，2025年6月，抚琴街道拆除一处新增违法建设且≥300㎡的违法建设，当月得分=5+2=7分；2025年7月，抚琴街道拆除一处≥300㎡存量的违法建设，当月得分=5+2+2=9分。
五、案件办理（10分）
加分制！从本系统中“案件办理”板块中提取数据。办结一处违法建设案件的，加5分，累计加分，最高加分不超过10分。
六、其他（20分）
原则上此项不扣分。如需扣分需手动录入，由违法建设治理板块管理员说明情况。`,

  扬尘治理: `为进一步解决金牛区扬尘管控存在的突出问题，做实做细日常工作，提升金牛区扬尘治理水平。
一、体征构成（100分）
由市级巡查（20）、区级巡查（30）、街道自查（35）、案件办理（5）和其他（10）五部分构成。
二、市级巡查（20分）
本系统“巡查登记”板块中提取数据。由“发现问题数量”（10分）和“发现问题未整改、未整改到位和虚假整改”（10分）两部分构成。
1.市级巡查“发现问题数量”运行规则为，发现1起，扣1分，累计扣分制，最高扣分不超过10分；
2.市级巡查“发现问题未整改、未整改到位和虚假整改”运行规则为，发现1起，扣1分，累计扣分制，最高扣分不超过10分（此项规则扣分值≦“发现问题数量”扣分值）。
三、区级巡查（30分）
本系统“巡查登记”板块中提取数据。由“发现问题数量”（15分）和“发现问题未整改、未整改到位和虚假整改”（15分）两部分构成。
1.区级巡查“发现问题数量”运行规则为，发现1起，扣0.5分，累计扣分制，最高扣分不超过15分；
2.区级巡查“发现问题未整改、未整改到位和虚假整改”运行规则为，发现1起，扣0.5分，累计扣分制，最高扣分不超过15分（此项规则扣分值≦“发现问题数量”扣分值）。
四、街道自查（35分）
由指挥调度系统导入，一个工地一天应巡查两次的工作要求，街道未按要求进行巡查，每日扣0.1分，累计扣分制，最高扣分不超过5分。
五、案件办理（5分）
加分制！本系统“案件办理”板块中提取数据。发现一起新办结案件则+1分，当月累计加分不超过5分，无新办结案件则此项为0分。
六、其他（10分）
原则上此项不扣分。如需扣分需手动录入，由扬尘治理板块管理员说明情况。`,
}

// 当前弹窗正文
const detailText = computed(() => {
  const name = selectedRule.value?.bigRules?.item
  return RULE_TEXTS[name] ?? '暂无该运行项目的说明。'
})
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
.rule-text-box {
  max-height: 60vh;   /* 弹窗内最大高度 */
  overflow-y: auto;   /* 内容超出时滚动 */
  padding: 12px 4px 4px 4px;
}

.rule-title {
  font-weight: 600;
  margin-bottom: 8px;
  text-align: left;
}

.rule-content {
  white-space: pre-wrap;  /* 按原文本换行显示 */
  line-height: 1.6;
  font-size: 14px;
  color: #333;
  text-align: left;
}
</style>