<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="searchOrder"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAdress">修改地址</el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="queryLogistics"
            >查看物流</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressDialogVisible" @close="resetAdress">
        <el-form
          :model="addressForm"
          :rules="addressRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区县" prop="fuzzyAddress">
            <el-cascader
              expand-trigger="hover"
              :options="citiesData"
              :props="props"
              v-model="addressForm.selectedCity"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="detailAdress">
            <el-input v-model="addressForm.detailAdress"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 查看物流对话框 -->
      <el-dialog title="物流详情" :visible.sync=" logisticsDialogVisible">
        <!-- 物流时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="logisticsDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 引入省市县地址数据
import citydata from '../../utils/citydata'
// 引入时间线
import Timeline from './timeline/index.js'
import TimelineItem from './timeline-item/index.js'
import './timeline/timeline.css'
import './timeline-item/timeline-item.css'
export default {
  data() {
    return {
      // 订单列表数据
      orderList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 修改地址数据
      addressDialogVisible: false,
      addressForm: {
        fuzzyAddress: [],
        detailAdress: '',
        selectedCity: []
      },
      addressRules: {
        fuzzyAddress: [{ required: true, message: '请选择省市县', trigger: 'blur' }],
        detailAdress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      citiesData: [],
      props: {
        label: 'label',
        value: 'value',
        children: 'children'
      },
      // 查看物流对话框数据
      logisticsDialogVisible: false,
      activities: []
    }
  },
  methods: {
    //   获取订单数据
    async getOrderList() {
      let res = await this.$axios.get(`https://www.liulongbin.top:8888/api/private/v1/orders`, { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('订单数据获取失败')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 当前显示条数改变
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getOrderList()
    },
    // 当前页码改变
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getOrderList()
    },
    // 搜索指定订单信息
    searchOrder() {
      if (this.queryInfo.query.trim() === '') return
      this.getOrderList()
    },
    // 显示修改地址对话框
    showAdress() {
      this.citiesData = citydata
      this.addressDialogVisible = true
    },
    // 级联框选项值变化
    handleChange() {},
    // 修改地址对话框关闭
    resetAdress() {
      this.addressForm.selectedCity = []
      this.$refs.addressFormRef.resetFields()
    },
    // 点击查询物流按钮
    async queryLogistics() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.$message.success('获取物流信息成功')
      this.activities = res.data
      this.logisticsDialogVisible = true
    }
  },
  components: {
    'el-timeline': Timeline,
    'el-timeline-item': TimelineItem
  },
  created() {
    this.getOrderList()
  }
}
</script>
<style scoped>
.el-cascader {
  width: 100%;
}
</style>
