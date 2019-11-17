<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="logo"></div>
        <div class="logout">
          欢迎光临
          <a href="javascript:;" @click="logout">退出</a>
        </div>
        <div class="title">
          <h3>电商后台管理系统</h3>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <!-- el-menu: 导航菜单的组件 -->
          <!-- default-active：默认高亮的菜单 -->
          <!-- open close 展开和关闭的事件 -->

          <!-- el-submenu: 子菜单 -->
          <!-- el-menu-item-group: 子菜单中分组 -->
          <!-- el-menu-item：子菜单中的每一项 -->
          <!-- unique-opened: 保证只能打开一个子菜单 -->
          <!-- router: 如果router为true，那么index就会作为路由的连接 -->
          <el-menu
            unique-opened
            router
            :default-active="'/' + $route.path.split('/')[1]"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
            <el-submenu :index="'/' + menu.path" v-for="menu in menuList" :key="menu.id">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{menu.authName}}</span>
              </template>
              <!-- 当给el-menu指定了router -->
              <el-menu-item :index="'/' + item.path" v-for="item in menu.children" :key="item.id">
                <i class="el-icon-menu"></i>
                <span slot="title">{{item.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <keep-alive>
            <!-- 这里是会被缓存的视图组件 -->
            <!-- $route.meta.keepAlive：如果是true，
            说明是缓存组件，通过keep-alive这个标签把缓存组件显示出来 -->
            <router-view v-if="$route.meta.keepAlive">
            </router-view>
          </keep-alive>

          <!-- 这里是不被缓存的视图组件 -->
          <router-view v-if="!$route.meta.keepAlive">
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menuList: []
    }
  },
  methods: {
    // 退出功能
    async logout () {
      try {
        await this.$confirm('你确定要退出系统吗?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 1. 删除localStorage中的myToken
        localStorage.removeItem('myToken')
        // 2. 跳转到登录组件
        this.$router.push('login')
        // 3. 给一个退出的提示
        this.$message.success('退出成功了')
      } catch (e) {
        this.$message({
          type: 'info',
          message: '退出取消了'
        })
      }
    },
    // 获取左侧栏菜单
    async getMenuList () {
      const res = await this.axios.get('menus')
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.menuList = data
        // console.log(this.menuList)
      }
    }
  },
  created () {
    this.getMenuList()
  }

}
</script>

<style lang="less" scoped>
.home {
  height: 100%;
  > .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #b3c1cd;
    .logo {
      float: left;
      width: 180px;
      height: 60px;
      background: url(../assets/logo.png) no-repeat center center;
      background-size: contain;
    }

    .logout {
      float: right;
      width: 180px;
      height: 60px;
      line-height: 60px;
      font-size: 16px;
      font-weight: 700;
      text-align: right;

      a {
        color: darkorange;
      }
    }

    .title {
      overflow: hidden;
      height: 60px;
      line-height: 60px;
      color: #fff;
      text-align: center;
      font-size: 24px;
    }
  }

  .el-aside {
    background-color: #545C64;
    .el-submenu {
      width: 200px;
    }
  }

  .el-main {
    background-color: #EAEEF1;
  }
}
</style>
