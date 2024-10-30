import { ref, onMounted, reactive, h } from 'vue';
export const params = reactive({
    username: "",
    password: "",
    role: "",
    token: "",
    isLogin: false,
    roleId: "",
    realname: "",
})