<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row style="margin-top: 15px;" :gutter="20">
        <!-- 搜索商品 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="clearSearch" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品 -->
        <el-col :span="3">
          <el-button type="primary" @click ='toAddPage'>添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delCommodity(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
// 引入日期格式化函数
import dateFormat from '../../utils/time.js'

export default {
  data() {
    return {
      tableData: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败' + res.meta.msg)
      this.tableData = res.data.goods
      this.total = res.data.total
      this.tableData.forEach(item => {
        item.add_time = dateFormat(item.add_time, 'yyyy-MM-dd hh:mm:ss')
      })
    },
    clearSearch() {
      this.queryInfo.query = ''
      this.getGoodsList()
    },
    // 搜索商品
    searchGoods() {
      if (this.queryInfo.query.trim() === '') {
        this.$message.error('请填写有效内容后搜索')
        return
      }
      this.getGoodsList()
    },
    // 显示条数改变
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 删除指定商品
    async delCommodity(id) {
      let result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (result !== 'confirm') return this.$message.info('已取消操作');
      let res = await this.$axios.delete(`https://www.liulongbin.top:8888/api/private/v1/goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败' + res.meta.msg);
      this.$message.success('已成功删除');
      this.getGoodsList()
    },
    // 点击添加商品按钮跳转添加商品页面
    toAddPage() {
      this.$router.push('/goods/add')
    }
  },

  created() {
    this.getGoodsList()
  }
}
</script>
<style lang="less" scoped>
.el-card {
  padding: 0;
}
.el-pagination {
  margin-top: 15px;
}
</style>
