import Vue from 'vue'
import Router from 'vue-router'

// 引入Login.vue组件
// import Login from '@/components/Login'
const Login = () => import(/* webpackChunkName: "login" */ '@/components/Login')
// 引入Home.vue组件
// import Home from '@/components/Home'
const Home = () => import(/* webpackChunkName: "home" */ '@/components/Home')

// 引入Users.vue组件
// import Users from '@/components/users/Users'
const Users = () => import(/* webpackChunkName: "users" */ '@/components/users/Users')

// 导入Rights.vue组件
// import Rights from '@/components/rights/Rights'
const Rights = () => import(/* webpackChunkName: "rights" */ '@/components/rights/Rights')

// 导入Roles.vue组件
// import Roles from '@/components/rights/Roles'
const Roles = () => import(/* webpackChunkName: "roles" */ '@/components/rights/Roles')

// 导入商品分类组件
// import Categories from '@/components/product/Categories'
const Categories = () => import(/* webpackChunkName: "categories" */ '@/components/product/Categories')

// 导入商品列表组件
// import Goods from '@/components/product/Goods'
const Goods = () => import(/* webpackChunkName: "goods" */ '@/components/product/Goods')

// 导入组件
// import GoodsAdd from '@/components/product/Add'
const GoodsAdd = () => import(/* webpackChunkName: "goods" */ '@/components/product/Add')

Vue.use(Router)

const router = new Router({
  // 启动了history模式，路径中就看不到很丑的#
  mode: 'history',
  // 在vue中，一般来说通过实例去访问某个属性的
  // vm.xxxx  vm.$set  vm.$refs  vm.$router
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    // users是home的一个子组件
    {
      path: '/home',
      name: 'home',
      component: Home,
      // 配置home的子组件
      children: [
        {
          path: '/users',
          name: 'users',
          component: Users
        },
        {
          path: '/rights',
          name: 'rights',
          component: Rights
        },
        {
          path: '/roles',
          name: 'roles',
          component: Roles
        },
        {
          path: '/categories',
          name: 'categories',
          component: Categories
        },
        {
          path: '/goods',
          name: 'goods',
          component: Goods
        },
        {
          path: '/goods/add',
          name: 'goods-add',
          component: GoodsAdd,
          meta: {
            // 开启了组件的缓存
            keepAlive: true
          }
        }
      ]
    }
  ]
})

// 给router配置导航守卫
// to: 去哪儿
// from: from 哪儿来
// next() :  next()：放行   next('/login') 去login组件
router.beforeEach((to, from, next) => {
  let token = localStorage.getItem('myToken')
  // console.log('to', to)
  // console.log('from', from)
  // 如果已经就是要去login了，就不需要拦截了
  if (to.path === '/login' || token) {
    // 有token，放行
    next()
  } else {
    next('/login')
  }
})

export default router
