import Vue from 'vue'
import Router from 'vue-router'
// import Login from './components/Login'
// import Home from './components/Home'
// import Welcome from './components/Welcome'
// import Users from './components/users/Users'
// import Rights from './components/Permission/Rights'
// import Roles from './components/Permission/Roles'
// import Categories from './components/commodity/Categories'
// import CateParams from './components/commodity/CateParams'
// import Goods from './components/commodity/Goods'
// import AddCommodity from './components/commodity/AddCommodity'
// import Orders from './components/orders/Orders'
// import Reports from './components/reports/Reports'
Vue.use(Router)
// const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Login')
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Home')
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Welcome')
const Users = () => import(/* webpackChunkName: "Users-Rights-Roles" */ './components/users/Users')
const Rights = () => import(/* webpackChunkName: "Users-Rights-Roles" */ './components/Permission/Rights')
const Roles = () => import(/* webpackChunkName: "Users-Rights-Roles" */ './components/Permission/Roles')
const Categories = () => import(/* webpackChunkName: "Categories-CateParams" */ './components/commodity/Categories')
const CateParams = () => import(/* webpackChunkName: "Categories-CateParams" */ './components/commodity/CateParams')
const Goods = () => import(/* webpackChunkName: "Goods-AddCommodity" */ './components/commodity/Goods')
const AddCommodity = () => import(/* webpackChunkName: "Goods-AddCommodity" */ './components/commodity/AddCommodity')
const Orders = () => import(/* webpackChunkName: "Orders-Reports" */ './components/orders/Orders')
const Reports = () => import(/* webpackChunkName: "Orders-Reports" */ './components/reports/Reports')
const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      redirect: '/welcome',
      component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Categories },
        { path: '/params', component: CateParams },
        { path: '/goods', component: Goods },
        { path: '/goods/add', component: AddCommodity },
        { path: '/orders', component: Orders },
        { path: '/reports', component: Reports }
      ]
    }
  ]
})
// 登录拦截
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 根据Token判断登录状态
  if (to.path !== '/login') {
    const tokenStr = sessionStorage.getItem('Token')
    // 没有Token强制跳转登录页面
    if (!tokenStr) return next('/login')
  }
  next()
})
export default router
