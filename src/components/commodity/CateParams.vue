<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div>
        <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
        <!-- 选择商品分类 -->
        <div class="chooseCate">
          <span>选择商品分类:</span>
          <el-cascader
            expand-trigger="hover"
            :options="options"
            :props="props"
            v-model="selectedOptions"
            @change="handleChange"
          ></el-cascader>
        </div>
      </div>
      <!-- Tab栏 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="showAddParamsForm">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border>
            <!-- 属性标签 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="primary"
                  closable
                  @close="delAttr(scope.row,index)"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="item.attr_id"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态参数表格 -->
        <el-tab-pane label="静态参数" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="showAddParamsForm">添加参数</el-button>
          <el-table :data="onlyData" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="primary"
                  closable
                  @close="delAttr(scope.row,index)"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="item.attr_id"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加'+titleTxt"
        :visible.sync="addParamsdialogVisible"
        width="50%"
        @close="resetAddParamsForm"
      >
        <!-- 添加参数表单 -->
        <el-form
          :model="addParamsForm"
          :rules="addParamsRules"
          ref="addParamsFormRef"
          label-width="100px"
        >
          <el-form-item :label="titleTxt" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddParamsForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数对话框 -->
      <el-dialog
        :title="'修改'+titleTxt"
        :visible.sync="editParamsdialogVisible"
        width="50%"
        @close="resetEditParamsForm"
      >
        <!-- 修改参数表单 -->
        <el-form
          :model="editParamsForm"
          :rules="editParamsRules"
          ref="editParamsFormRef"
          label-width="100px"
        >
          <el-form-item :label="titleTxt" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditParamsForm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      options: [],
      selectedOptions: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: 'many',
      isDisabled: true,
      onlyData: [],
      manyData: [],
      // 添加参数表单的数据,
      addParamsdialogVisible: false,
      addParamsForm: {
        attr_name: '',
        attr_sel: ''
      },
      addParamsRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 修改参数表单的数据
      editParamsdialogVisible: false,
      editParamsForm: {
        attr_name: '',
        attr_sel: '',
        attrId: ''
      },
      editParamsRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateData()
  },
  methods: {
    // 获取商品分类数据
    async getCateData() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      this.options = res.data
    },
    // 获取分类参数列表
    async getCateParams() {
      let res = await this.$axios.get(`https://www.liulongbin.top:8888/api/private/v1/categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取分类参数失败' + res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'only') {
        this.onlyData = res.data
      } else {
        this.manyData = res.data
      }
    },
    // 级联选择器选项框值变化
    handleChange(val) {
      if (val.length !== 3) {
        this.isDisabled = true
        this.onlyData = []
        this.manyData = []
        return
      }
      this.getCateParams()

      this.isDisabled = false
    },
    // 点击Tab栏标签切换
    handleClick() {
      this.getCateParams()
    },
    // 展示添加参数表单的对话框
    showAddParamsForm() {
      this.addParamsdialogVisible = true
    },
    // 提交添加参数表单
    submitAddParamsForm() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('验证失败')
        let res = await this.$axios.post(`https://www.liulongbin.top:8888/api/private/v1/categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加失败' + res.meta.msg)
        this.$message.success('添加成功')
        this.getCateParams()
        this.addParamsdialogVisible = false
      })
    },
    // 关闭添加参数的对话框时重置表单
    resetAddParamsForm() {
      this.$refs.addParamsFormRef.resetFields()
      this.addParamsdialogVisible = false
    },
    // 展示编辑修改参数的对话框
    showEditDialog(cate) {
      this.editParamsForm.attr_name = cate.attr_name
      this.editParamsForm.attrId = cate.attr_id
      this.editParamsdialogVisible = true
    },
    // 提交修改参数表单
    submitEditParamsForm() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('验证失败')
        let res = await this.$axios.put(`https://www.liulongbin.top:8888/api/private/v1/categories/${this.cateId}/attributes/${this.editParamsForm.attrId}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败' + res.meta.msg)
        this.$message.success('修改成功')
        this.getCateParams()
        this.editParamsdialogVisible = false
      })
    },
    // 关闭修改参数对话框时重置表单
    resetEditParamsForm() {
      this.editParamsdialogVisible = false
      this.$refs.editParamsFormRef.resetFields()
    },
    // 删除参数
    async delParams(attrId) {
      let result = await this.$confirm('确认永久删除该属性么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        let res = await this.$axios.delete(`https://www.liulongbin.top:8888/api/private/v1categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败' + res.meta.msg)
        this.$message.info('该属性已删除')
        this.getCateParams()
      }
    },
    // 标签输入框内容确定
    async handleInputConfirm(attrObj) {
      if (!attrObj.inputValue.trim() === '') {
        attrObj.attr_vals.push(attrObj.inputValue)
        let res = await this.$axios.put(`https://www.liulongbin.top:8888/api/private/v1categories/${attrObj.cat_id}/attributes/${attrObj.attr_id}`, {
          attr_name: attrObj.attr_name,
          attr_sel: attrObj.attr_sel,
          attr_vals: attrObj.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) return this.$message.error('提交失败' + res.meta.msg)
      }
      attrObj.inputVisible = false
      attrObj.inputValue = ''
    },
    // 删除标签
    async delAttr(attrObj, index) {
      attrObj.attr_vals.splice(index, 1)
      let res = await this.$axios.put(`categories/${attrObj.cat_id}/attributes/${attrObj.attr_id}`, {
        attr_name: attrObj.attr_name,
        attr_sel: attrObj.attr_sel,
        attr_vals: attrObj.attr_vals.join(' ')
      })
      if (res.meta.status === 200) {
        this.$message.success('删除成功')
      }
    },
    // 点击New Tag+ 显示Input输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    // 分类ID
    cateId() {
      if (this.selectedOptions.length !== 3) {
        return null
      }
      return this.selectedOptions[2]
    },
    // 修改动态参数或静态属性
    titleTxt() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-card {
  padding: 0;
  .chooseCate {
    margin-top: 15px;
    .el-cascader {
      margin-left: 15px;
    }
  }
  .el-tag {
    margin: 0 5px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
