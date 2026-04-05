<!--<template>-->
<!--  <el-table :data="rows" border style="width: 100%" header-align="center" size="large">-->
<!--    <RenderCol v-for="(c,i) in columns" :key="i" :col="c" />-->
<!--  </el-table>-->
<!--</template>-->

<!--<script setup>-->
<!--import { defineProps } from 'vue'-->
<!--defineProps({ rows: Array, columns: Array })-->

<!--const RenderCol = {-->
<!--  name: 'RenderCol',-->
<!--  props: { col: { type: Object, required: true } },-->
<!--  render() {-->
<!--    const c = this.col-->
<!--    const hasChildren = Array.isArray(c.children) && c.children.length > 0-->
<!--    const fmtSlot = c.formatter-->
<!--        ? { default: (scope) => c.formatter(scope.row, scope.column, scope.row?.[c.prop], scope.$index) }-->
<!--        : {}-->
<!--    return (-->
<!--        <el-table-column label={c.label} prop={c.prop} min-width={c.minWidth} align={c.align || 'center'}>-->
<!--          { hasChildren-->
<!--              ? c.children.map((cc,idx)=><RenderCol col={cc} key={idx}/>)-->
<!--              : (fmtSlot.default ? fmtSlot.default : null)-->
<!--          }-->
<!--        </el-table-column>-->
<!--    )-->
<!--  }-->
<!--}-->
<!--</script>-->
<template>
  <el-table
      ref="scoreTable"
      :data="rows"
      border
      header-align="center"
      size="large"
      style="width: 100%"
  >
    <!-- 使用更稳定的 key，减少首次布局抖动 -->
    <RenderCol
        v-for="(c, i) in columns"
        :key="c.key || c.prop || c.label || i"
        :col="c"
    />
  </el-table>
</template>

<script setup>
import { defineProps, ref, nextTick, onMounted, watch } from 'vue'

// 需要在 watch 里访问 props，所以接到一个变量里
const props = defineProps({ rows: Array, columns: Array })

const scoreTable = ref(null)

// 首次挂载后强制做一次布局
onMounted(() => nextTick(() => scoreTable.value?.doLayout()))

// 当列结构或数据变化（切换 roles / 异步填充）时，重算布局
watch(
    () => [props.columns, props.rows],
    () => nextTick(() => scoreTable.value?.doLayout()),
    { deep: true }
)

const RenderCol = {
  name: 'RenderCol',
  props: { col: { type: Object, required: true } },
  render() {
    const c = this.col
    const hasChildren = Array.isArray(c.children) && c.children.length > 0
    const fmtSlot = c.formatter
        ? { default: (scope) => c.formatter(scope.row, scope.column, scope.row?.[c.prop], scope.$index) }
        : {}

    // ✅ 关键修复：JSX 属性使用 camelCase（minWidth / showOverflowTooltip）
    return (
        <el-table-column
            key={c.key || c.prop || c.label}                  /* 稳定 vnode */
            label={c.label}
            prop={c.prop}
            minWidth={c.minWidth ?? 100}                      /* camelCase */
            align={c.align || 'center'}
            showOverflowTooltip={c.showOverflowTooltip ?? false} /* camelCase，可选 */
            fixed={c.fixed}                                   /* 可选：'left' | 'right' */
        >
          { hasChildren
              ? c.children.map((cc, idx) => <RenderCol col={cc} key={cc.key || cc.prop || cc.label || idx} />)
              : (fmtSlot.default ? fmtSlot.default : null)
          }
        </el-table-column>
    )
  }
}
</script>
<style scoped>

</style>