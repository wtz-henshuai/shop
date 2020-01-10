import Vue from 'vue'
import './plugins/element.js'
import App from './App.vue'
import router from './router'
// 引入全局样式
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 引入Nprogress进度条
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
// 引入axios
import axios from 'axios'
// 将axios挂载到Vue原型对象上 全局使用
Vue.prototype.$axios = axios
// 配置根路径
axios.defaults.baseURL = 'http://www.liulongbin.top:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use(config => {
  Nprogress.start()
  config.headers['Authorization'] = window.sessionStorage.getItem('Token')
  return config
})
// axios响应拦截
axios.interceptors.response.use((res) => {
  let data = res.data
  Nprogress.done()
  return data
})
// 注册全局组件
Vue.use(VueQuillEditor)
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false
// 注册全局日期格式化过滤器
Vue.filter('dateFormat', function (creatTime) {
  const date = new Date(creatTime)
  let y = date.getFullYear()
  let M = (date.getMonth() + 1 + '').padStart(2, 0)
  let d = (date.getDate() + '').padStart(2, 0)
  let h = (date.getHours() + '').padStart(2, 0)
  let m = (date.getMinutes() + '').padStart(2, 0)
  let s = (date.getSeconds() + '').padStart(2, 0)
  return `${y}-${M}-${d} ${h}:${m}:${s}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
