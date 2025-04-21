const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        //政务云
        // target: "https://175.153.176.27:18803/api",
        // target: 'http://101.37.246.72:9092',//服务器

        //市政务云
        target:"http://119.4.191.13:8883/api",
        //target: "http://localhost:8872", 
        changeOrigin: true,
        pathRewrite: {
          "^/api": "", //将url中起始的'/api'替换成''，比如将/api/getDeptList替换成/getDeptList
        },
      },

    },
  },
  transpileDependencies: ["date-week-range", "element-plus"],
});
