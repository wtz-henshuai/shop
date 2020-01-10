<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div>
        <el-button type="primary" @click="showAddCateForm">添加分类</el-button>
      </div>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCatedialogVisible"
        width="50%"
        @close="resetAddCateForm"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormrules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              expand-trigger="hover"
              :options="options"
              v-model="selectedOptions"
              :props="props"
              @change="handleChange"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddCateForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 树形表格区域 -->
      <tree-table
        class="myTreeTable"
        :data="data"
        show-index
        index-text="#"
        border
        stripe
        :selection-type="false"
        :expand-type="false"
        :columns="columns"
        v-loading="loading"
        element-loading-text="loading..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <!-- 是否有效 -->
        <template slot="isEffective" slot-scope="scope">
          {{scope.row.deleted}}
          <i
            class="el-icon-success"
            style="color:lightgreen"
            v-if="scope.row.cat_deleted===false"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!-- 删除用户按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: true,
      queryParams: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      data: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isEffective'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          prop: '',
          type: 'template',
          template: 'opt'
        }
      ],
      total: 0,
      // 添加分类数据
      addCatedialogVisible: false,
      addCateForm: {
        cat_pid: '',
        cat_name: '',
        cat_level: ''
      },
      addCateFormrules: {
        cat_name: [
          { required: true, message: '请输入父类名称', trigger: 'blur' }
        ]
      },
      options: [],
      selectedOptions: [],
      props: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      }
    };
  },
  methods: {
    // 获取商品分类
    async getCommodityCgy() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/categories', {
        params: this.queryParams
      });
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类信息失败'); }
      this.data = res.data.result;
      this.total = res.data.total;
      this.loading = false;
    },
    // 显示条数改变
    handleSizeChange(val) {
      this.loading = true;
      this.queryParams.pagesize = val;
      this.getCommodityCgy();
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.loading = true;
      this.queryParams.pagenum = val;
      this.getCommodityCgy();
    },
    // 展示添加分类表单
    async showAddCateForm() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/categories', { params: { type: 2 } });
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类信息失败' + res.meta.msg); }
      this.options = res.data;
      this.addCatedialogVisible = true;
    },
    // 级联选择器选项值变化
    handleChange(val) {
      this.addCateForm.cat_level = val.length;
      this.addCateForm.cat_pid = val[val.length - 1];
    },
    // 提交添加分类表单
    async submitAddCateForm() {
      if (this.selectedOptions.length === 0) {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
      if (!this.addCateForm.cat_name.trim()) { return this.$message.error('请输入有效内容'); }
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return this.message.error('验证失败');
        let res = await this.$axios.post('/categories', this.addCateForm);
        if (res.meta.status !== 201) { return this.$message.error('添加分类失败' + res.meta.msg); }
        this.$message.success('添加分类成功');
        this.getCommodityCgy();
        this.addCatedialogVisible = false;
      });
    },
    // 关闭对话框 重置表单
    resetAddCateForm() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedOptions = [];
    }
  },
  created() {
    this.getCommodityCgy();
  }
};
</script>
<style lang="less" scoped>
.el-card {
  padding: 0;
}
.myTreeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
