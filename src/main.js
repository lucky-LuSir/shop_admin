// vue-quill-editor
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 引入Element-UI
import ElementUI from 'element-ui'

// 导入moment
import moment from 'moment'

// 引入Element-ui的样式
// import 'element-ui/lib/theme-chalk/index.css'

import Vue from 'vue'
import router from './router'
// 导入axios
import axios from 'axios'

import VueQuillEditor from 'vue-quill-editor'

import App from './App'

// 使用element-ui
Vue.use(ElementUI)

// 使用vue-quill-editor
Vue.use(VueQuillEditor)

// 把axios对象绑定到Vue原型中
Vue.prototype.axios = axios

// 给axios配置拦截器

// 添加请求拦截器,拦截器的作用：
// 在拦截器中可以获取到axios的配置，在config中修改东西
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // console.log('哈哈，我拦截到了请求', config)
  // 只需要给config配置baseURL 以及 headers
  config.baseURL = 'http://localhost:8888/api/private/v1/'
  config.headers.Authorization = localStorage.getItem('myToken')
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})
// 配置axios的通过配置
// axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// axios.defaults.headers.common['Authorization'] = localStorage.getItem('myToken')

Vue.config.productionTip = false

// 定义全局过滤器
Vue.filter('dateFilter', (input, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(input).format(format)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
