//常用工具库封装
import { useCookies } from "@vueuse/integrations/useCookies";
const tokenKey = "token";
const hwzyTokenKey = "hwzyToken";
const cookie = useCookies();

//获取token
export function getToken() {
  return cookie.get(tokenKey);
}

//设置token
export function setToken(token) {
  return cookie.set(tokenKey, token);
}

//清除token
export function removeToken() {
  return cookie.remove(tokenKey);
}

//设置hwzytoken
export function setHwzyToken(hwzyToken) {
  return cookie.set(hwzyTokenKey, hwzyToken);
}

//获取hwzytoken
export function getHwzyToken() {
  return cookie.get(hwzyTokenKey);
}

//清除hwzytoken
export function removeHwzyToken() {
  return cookie.remove(hwzyTokenKey);
}
