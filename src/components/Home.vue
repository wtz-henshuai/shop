<template>
  <el-container class="myContainer">
    <!-- 顶部logo栏 -->
    <el-header>
      <div class="logo">
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'" class="myAside">
        <div class="collapseBar" @click='toCollapse'>|||</div>
        <!-- 侧边栏 -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse-transition='false'
          :collapse="isCollapse"
          router
          :default-active='activePath'
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuCategories" :key="item.id">
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click='savePath(subItem.path)'>
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      activePath: '',
      isCollapse: false,
      menuCategories: [],
      icons: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      }
    };
  },
  methods: {
    // 退出登录
    logout() {
      // 确认删除框
      this.$confirm('确认退出么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '退出成功!'
          });
          // 清除sessionStorge中Token
          sessionStorage.removeItem('Token');
          // 跳转登录页面
          this.$router.push('/login');
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    // 折叠侧边菜单栏
    toCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存当前路径
    savePath(path) {
      window.sessionStorage.setItem('activePath', '/' + path);
      this.activePath = '/' + path;
    }

  },
  mounted() {
    // 获取侧边栏分类信息

    (async () => {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/menus');
      if (res.meta.status !== 200) {
        return this.$message.error('获取侧边栏信息失败' + res.meta.msg);
      }
      this.menuCategories = res.data;
    })();
    // 获取侧边栏当前高亮二级菜单
    this.activePath = sessionStorage.getItem('activePath')
  }
};
</script>
<style lang="less" scoped>
.myContainer {
  height: 100%;
  .el-header {
    background-color: #373d41;
    color: #fff;
    line-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .logo {
      img {
        vertical-align: middle;
        margin-right: 10px;
      }
    }
  }

  .el-aside {
    width: 200px;
    background-color: #333744;
    color: #333;
    .collapseBar {
      background-color: #4a5064;
      text-align: center;
      line-height: 24px;
      letter-spacing: 2px;
      color: #fff;
      cursor: pointer;
      padding-bottom: 2px;
      user-select: none;
    }
    .el-menu {
      border-right: 0;
      .el-menu-item {
        user-select: none;
      }
    }
    .iconfont {
      margin-right: 10px;
    }
  }

  .el-main {
    background-color: #e9eef3;
    color: #333;
    padding:20px;
    margin: 0;
  }
}
</style>
