<template>
    <div id="item">
        <el-avatar class="logo" :src="require('@/assets/home/'+logo)" size="small"></el-avatar>
        <el-tooltip
            placement="top-start"
            effect="light"
            :content="name"
            >
            <span :class="styleName" >{{name}}</span>
        </el-tooltip>
    </div>
</template>
<script setup>

defineProps({
    logo: String,
    name: String,
    styleName: String
})

</script>

<style scoped>
#item{
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    margin-left: 20px;
} 
#item{
    position: relative;
    text-decoration: none;
    font-size: 20px;
    color: #333;
        }
#item:before{
    content: "";
    position: absolute;
    left: 0;
    bottom:-5px;
    height: 3px;
    width: 100%;
    background: #4285f4;
    transform: scale(0);
    transition: all 0.3s;
        }
#item:hover:before{
    transform: scale(1);
        }
.logo{
    margin-right: 10px;
}
.className{
    font-size: 23px;
    display: inline-block;
    width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.subsysName{
    font-size: 20px;
    padding: 3px;
    display: inline-block;
}
</style>