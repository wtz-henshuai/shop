<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 权限列表区域 -->
    <el-card>
      <template>
        <el-table :data="tableData" border style="width: 100%" stripe>
          <el-table-column type="index" width="50"></el-table-column>
          <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
          <el-table-column prop="path" label="路径" width="180"></el-table-column>
          <el-table-column prop="level" label="权限等级">
            <template slot-scope="scope">
              <el-tag type='primary' v-if="scope.row.level==0">一级</el-tag>
              <el-tag type='success' v-else-if="scope.row.level==1">二级</el-tag>
              <el-tag type='warning' v-else>三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: []
    };
  },
  methods: {
    // 获取权限列表数据
    async getRightsData() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1rights/list');
      if (res.meta.status !== 200) { return this.$message.error('获取权限列表数据失败'); }
      this.tableData = res.data;
    }
  },
  created() {
    this.getRightsData();
  }
};
</script>
<style lang="less" scoped>
</style>
