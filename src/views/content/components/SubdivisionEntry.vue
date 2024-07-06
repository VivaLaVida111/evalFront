<template>
  <el-container>
    <el-header style="font-size: 25px; padding: 5px">
      <h5 class="card-title" style="font-size: 30px; padding: 5px">
        扣分项录入
      </h5>
    </el-header>
    <el-main>
      
        <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="街道">
                <el-select  placeholder="选择街道" clearable v-model="street">
                    <el-option
                        v-for="street in streets"
                        :key="street.value"
                        :label="street.label"
                        :value="street.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="扣分原因" >
                <el-input v-model="reason" style="width: 1000px;" type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="扣分值">
                <el-input-number v-model="form.score"></el-input-number>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">提交</el-button>
            </el-form-item>
        </el-form>

      
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from "vue";

const scoreItems = ref([
    { item: "Item 1", percentage: 50 },
    { item: "Item 2", percentage: 30 },
    { item: "Item 3", percentage: 20 },
]);

const form = reactive({
    street: ref(""),
    reason: "1",
    score: 0,
});
const street = ref("");
const reason = ref("");

const streets = ref([
    { label: "Street 1", value: "street1" },
    { label: "Street 2", value: "street2" },
    { label: "Street 3", value: "street3" },
]);

function submitForm() {
    console.log("Form submitted:", form.value);
}
</script>
