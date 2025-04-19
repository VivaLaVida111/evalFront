<template>
  <el-container>
    <el-main>
      <div class="header">
        <span class="title">扬尘治理智能分析</span>
        <div class="date-picker">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="onDateChange"
          />
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-box">
          <div class="chart-title">问题来源分析</div>
          <div id="sourcePieChart" class="chart"></div>
        </div>
        
        <div class="chart-box">
          <div class="chart-title">问题类型统计</div>
          <div id="attributePieChart" class="chart"></div>
        </div>
        
        <div class="chart-box full-width">
          <div class="chart-title">巡查状态分析</div>
          <div id="patrolBarChart" class="chart"></div>
        </div>
        
        <div class="chart-box full-width">
          <div class="chart-title">整改完成统计</div>
          <div id="reformBarChart" class="chart"></div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as echarts from 'echarts';
import { getSourceStats, getAttributeStats, getPatrolByStreetStats, getCheckByStreetStats } from '@/api/content.js';

// 日期选择
const dateRange = ref([]);
const startDate = ref('');
const endDate = ref('');

// 图表
let sourcePieChart = null;
let attributePieChart = null;
let patrolBarChart = null;
let reformBarChart = null;
const sourceData = ref([]);
const attributeData = ref([]);
const patrolData = ref([]);
const reformData = ref([]);

// 计算日期格式
const formattedStartDate = computed(() => {
  if (!startDate.value) return '';
  return `${startDate.value}T00:00:00`;
});

const formattedEndDate = computed(() => {
  if (!endDate.value) return '';
  return `${endDate.value}T23:59:59`;
});

// 日期改变事件
const onDateChange = (val) => {
  if (val && val.length === 2) {
    startDate.value = val[0];
    endDate.value = val[1];
    fetchData();
  }
};

// 获取所有数据
const fetchData = async () => {
  await Promise.all([
    fetchSourceData(),
    fetchAttributeData(),
    fetchPatrolData(),
    fetchReformData()
  ]);
};

// 获取问题来源数据
const fetchSourceData = async () => {
  try {
    const response = await getSourceStats(formattedStartDate.value, formattedEndDate.value);
    
    if (response) {
      sourceData.value = response;
      initSourcePieChart();
    }
  } catch (error) {
    console.error('获取问题来源数据失败:', error);
  }
};

// 获取问题类型数据
const fetchAttributeData = async () => {
  try {
    const response = await getAttributeStats(formattedStartDate.value, formattedEndDate.value);
    
    if (response) {
      attributeData.value = response;
      initAttributePieChart();
    }
  } catch (error) {
    console.error('获取问题类型数据失败:', error);
  }
};

// 获取巡查状态数据
const fetchPatrolData = async () => {
  try {
    const response = await getPatrolByStreetStats(formattedStartDate.value, formattedEndDate.value);
    
    if (response) {
      patrolData.value = response;
      initPatrolBarChart();
    }
  } catch (error) {
    console.error('获取巡查状态数据失败:', error);
  }
};

// 获取整改完成数据
const fetchReformData = async () => {
  try {
    const response = await getCheckByStreetStats(formattedStartDate.value, formattedEndDate.value);
    
    if (response) {
      reformData.value = response;
      initReformBarChart();
    }
  } catch (error) {
    console.error('获取整改完成数据失败:', error);
  }
};

// 初始化问题来源饼图
const initSourcePieChart = () => {
  if (!sourceData.value || sourceData.value.length === 0) return;
  
  const chartDom = document.getElementById('sourcePieChart');
  if (!chartDom) return;
  
  if (sourcePieChart) {
    sourcePieChart.dispose();
  }
  
  sourcePieChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: sourceData.value.map(item => item.resource)
    },
    series: [
      {
        name: '问题来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: sourceData.value.map(item => ({
          name: item.resource,
          value: item.count
        }))
      }
    ]
  };
  
  sourcePieChart.setOption(option);
  window.addEventListener('resize', () => {
    sourcePieChart.resize();
  });
};

// 初始化问题类型饼图
const initAttributePieChart = () => {
  if (!attributeData.value || attributeData.value.length === 0) return;
  
  const chartDom = document.getElementById('attributePieChart');
  if (!chartDom) return;
  
  if (attributePieChart) {
    attributePieChart.dispose();
  }
  
  attributePieChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: attributeData.value.map(item => item.attribute)
    },
    series: [
      {
        name: '问题类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: attributeData.value.map(item => ({
          name: item.attribute,
          value: item.count
        }))
      }
    ]
  };
  
  attributePieChart.setOption(option);
  window.addEventListener('resize', () => {
    attributePieChart.resize();
  });
};

// 初始化巡查状态柱状图
const initPatrolBarChart = () => {
  if (!patrolData.value || patrolData.value.length === 0) return;
  
  const chartDom = document.getElementById('patrolBarChart');
  if (!chartDom) return;
  
  if (patrolBarChart) {
    patrolBarChart.dispose();
  }
  
  patrolBarChart = echarts.init(chartDom);
  
  const streets = patrolData.value.map(item => item.street);
  const totalData = patrolData.value.map(item => item.total);
  const patrolledData = patrolData.value.map(item => item.patrolledCount);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['应巡查次数', '已巡查次数'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: streets,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '巡查次数'
    },
    series: [
      {
        name: '应巡查次数',
        type: 'bar',
        data: totalData,
        itemStyle: {
          color: '#5470c6'
        },
        barWidth: '5%',
        barGap: '30%'
      },
      {
        name: '已巡查次数',
        type: 'bar',
        data: patrolledData,
        itemStyle: {
          color: '#91cc75'
        },
        barWidth: '5%'
      }
    ]
  };
  
  patrolBarChart.setOption(option);
  window.addEventListener('resize', () => {
    patrolBarChart.resize();
  });
};

// 初始化整改完成柱状图
const initReformBarChart = () => {
  if (!reformData.value || reformData.value.length === 0) return;
  
  const chartDom = document.getElementById('reformBarChart');
  if (!chartDom) return;
  
  if (reformBarChart) {
    reformBarChart.dispose();
  }
  
  reformBarChart = echarts.init(chartDom);
  
  // 计算每个街道的整改完成率
  const streets = reformData.value.map(item => item.street);
  const rateData = reformData.value.map(item => {
    if (item.total === 0) return 0;
    return parseFloat(((item.reformedCount / item.total) * 100).toFixed(2));
  });
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: streets,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '整改完成率',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '整改完成率',
        type: 'bar',
        data: rateData,
        itemStyle: {
          color: function(params) {
            // 根据完成率值设置不同的颜色
            if (params.value >= 80) {
              return '#67C23A'; // 绿色: 良好
            } else if (params.value >= 60) {
              return '#E6A23C'; // 黄色: 一般
            } else {
              return '#F56C6C'; // 红色: 较差
            }
          },
          borderRadius: [5, 5, 0, 0] // 柱状图顶部圆角
        },
        barWidth: '8%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  };
  
  reformBarChart.setOption(option);
  window.addEventListener('resize', () => {
    reformBarChart.resize();
  });
};

// 组件挂载时初始化
onMounted(() => {
  // 默认设置为当前月的日期范围
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  startDate.value = formatDate(firstDay);
  endDate.value = formatDate(lastDay);
  dateRange.value = [startDate.value, endDate.value];
  
  fetchData();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.date-picker {
  margin-left: auto;
}

.chart-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: calc(50% - 10px);
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}

.chart-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #303133;
  text-align: center;
}

.chart {
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-box {
    width: 100%;
  }
}
</style> 