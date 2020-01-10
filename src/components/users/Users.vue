<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="usersBox">
      <template>
        <el-row style="margin-top: 15px;" :gutter="20">
          <!-- 搜索用户 -->
          <el-col :span="8">
            <el-input
              placeholder="请输入内容"
              v-model="queryParams.query"
              clearable
              @clear="clearSearch"
            >
              <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
            </el-input>
          </el-col>
          <!-- 添加用户 -->
          <el-col :span="3">
            <el-button type="primary" @click="addUser">添加用户</el-button>
            <!-- 添加用户表单 -->
            <el-dialog title="添加用户" :visible.sync="addUserFormVisible">
              <el-form :model="addUserForm" ref="addUserFormRef" :rules="addUserFormRules">
                <el-form-item label="用户名" label-width="100px" prop="username">
                  <el-input v-model="addUserForm.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" label-width="100px" prop="password">
                  <el-input v-model="addUserForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" label-width="100px" prop="email">
                  <el-input v-model="addUserForm.email" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号" label-width="100px" prop="mobile">
                  <el-input v-model="addUserForm.mobile" autocomplete="off"></el-input>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddUserForm">取 消</el-button>
                <el-button type="primary" @click="submitAddUserForm">确 定</el-button>
              </div>
            </el-dialog>
            <!-- 编辑用户表单 -->
            <el-dialog title="编辑用户" :visible.sync="modifyUserFormVisible">
              <el-form :model="modifyUserForm" ref="modifyUserFormRef" :rules="modifyUserFormRules">
                <el-form-item label="用户名">
                  <el-input v-model="modifyUserForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="modifyUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                  <el-input v-model="modifyUserForm.mobile"></el-input>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="resetModifyUserForm">取 消</el-button>
                <el-button type="primary" @click="submitMdyUserForm(modifyUserForm.id)">确 定</el-button>
              </div>
            </el-dialog>
          </el-col>
        </el-row>
        <!-- 用户列表 -->
        <el-table :data="tableData" border style="width: 100%" stripe>
          <el-table-column type="index" width="50"></el-table-column>
          <el-table-column prop="username" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <!-- 利用作用域插槽获取状态值 -->
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="changeUserState(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop label="操作" width="180px">
            <!-- 编辑用户按钮 -->
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="modifyUser(scope.row.id)"
              ></el-button>
              <!-- 删除用户按钮 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id)"
              ></el-button>
              <!-- 设置用户角色按钮 -->
              <el-tooltip effect="dark" content="设置用户" placement="top" :enterable="false">
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="settingRole(scope.row)"
                ></el-button>
              </el-tooltip>
              <!-- 设置角色对话框 -->
              <el-dialog
                title="提示"
                :visible.sync="setRoledialogVisible"
                width="30%"
                @close="cancelSetRole"
              >
                <p>用户名: {{scopeCopy.username}}</p>
                <p>用户当前角色: {{scopeCopy.role_name}}</p>
                <span>设置新的用户角色:</span>
                <el-select v-model="value" placeholder="请选择用户角色">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
                  ></el-option>
                </el-select>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="setRoledialogVisible = false;cancelSetRole">取 消</el-button>
                  <el-button type="primary" @click="setNewRole(scopeCopy.id)">确 定</el-button>
                </span>
              </el-dialog>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    // 自定义验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      const emailReg = /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/
      if (!emailReg.test(value)) {
        return cb(new Error('邮箱格式有误,请重新输入'))
      }
      cb()
    }
    // 自定义验证手机号规则
    var checkMobile = (rule, value, cb) => {
      const mobileReg = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (!mobileReg.test(value)) {
        return cb(new Error('手机号格式有误,请重新输入'))
      }
      cb()
    }

    return {
      tableData: [],
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 添加用户数据
      addUserFormVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addUserFormRules: {
        username: [{ required: true, message: '请输入账户名', trigger: 'blur' }, { min: 3, max: 5, message: '长度在 3 到 8 个字符', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }],
        email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }]
      },
      // 编辑用户数据
      modifyUserFormVisible: false,
      modifyUserForm: {},
      // 编辑用户表单验证规则
      modifyUserFormRules: {
        email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }]
      },
      // 设置用户角色数据
      setRoledialogVisible: false,
      scopeCopy: '',
      options: [],
      value: ''
    }
  },
  methods: {
    //   获取用户列表
    async queryUsers() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/users', { params: this.queryParams })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败' + res.meta.msg)
      }
      this.tableData = res.data.users
      this.queryParams.pagenum = res.data.pagenum
      this.total = res.data.total
    },
    // 修改用户状态
    async changeUserState(userInfo) {
      let res = await this.$axios.put(`https://www.liulongbin.top:8888/api/private/v1/users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        this.$message.error('设置失败' + res.meta.msg)
        userInfo.mg_state = !userInfo.mg_state
        return
      }
      this.queryUsers()
    },
    // 搜索用户
    searchUser() {
      if (this.queryParams.query.trim() === '') return
      this.queryUsers()
    },
    // 清除输入框搜索记录
    clearSearch() {
      this.queryUsers()
    },
    // 改变当前显示条数
    handleSizeChange(pagesize) {
      this.queryParams.pagesize = pagesize
      this.queryUsers()
    },
    // 改变当前显示页码
    handleCurrentChange(page) {
      this.queryParams.pagenum = page
      this.queryUsers()
    },
    // 添加用户
    addUser() {
      this.addUserFormVisible = true
    },
    // 重置表单
    resetAddUserForm() {
      this.$refs.addUserFormRef.resetFields()
      this.addUserFormVisible = false
    },
    // 提交添加用户表单
    submitAddUserForm() {
      this.$refs.addUserFormRef.validate(async isPass => {
        if (!isPass) return
        let res = await this.$axios.post('https://www.liulongbin.top:8888/api/private/v1/users', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败' + res.meta.msg)
        }
        this.queryUsers()
        this.$message({
          type: 'success',
          message: '添加用户成功'
        })
        this.resetAddUserForm()
      })
    },
    // 编辑用户
    async modifyUser(id) {
      this.modifyUserFormVisible = true
      let res = await this.$axios.get(`https://www.liulongbin.top:8888/api/private/v1/users/${id}`)
      if (res.meta.status !== 200) return
      this.modifyUserForm = res.data
    },
    // 重置编辑用户表单
    resetModifyUserForm() {
      this.$refs.modifyUserFormRef.resetFields()
      this.modifyUserFormVisible = false
    },
    // 提交编辑用户表单
    submitMdyUserForm(id) {
      this.$refs.modifyUserFormRef.validate(async isPass => {
        if (!isPass) return this.$message.error('验证不通过')
        let res = await this.$axios.put(`https://www.liulongbin.top:8888/api/private/v1/users/${id}`, this.modifyUserForm)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败' + res.meta.msg)
        }
        this.$message.success('修改成功')
        this.modifyUserFormVisible = false
        this.queryUsers()
      })
    },
    // 删除用户
    async deleteUser(id) {
      let result = await this.$confirm('确认永久删除该用户么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        let res = await this.$axios.delete(`https://www.liulongbin.top:8888/api/private/v1/users/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.queryUsers()
        this.$message.success('删除用户成功')
      } else {
        this.$message.info('已取消操作')
      }
    },
    // 分配用户角色
    async settingRole(user) {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/roles')
      this.options = res.data
      this.scopeCopy = user
      this.setRoledialogVisible = true
    },
    // 设置新角色
    async setNewRole(id) {
      if (!this.value) return this.$message.warning('请选择用户角色')
      let res = await this.$axios.put(`https://www.liulongbin.top:8888/api/private/v1/users/${id}/role`, {
        rid: this.value
      })
      if (res.meta.status !== 200) return this.$message.error('设置失败')
      this.$message.success('设置成功')
      this.queryUsers()
      this.setRoledialogVisible = false
      this.value = ''
    },
    // 取消操作
    cancelSetRole() {
      this.setRoledialogVisible = false
      this.value = ''
    }
  },
  mounted() {
    this.queryUsers()
  }
}
</script>
<style lang="less" scoped>
.usersBox {
  background-color: #fff;
  padding: 5px 15px 15px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
  .el-table {
    font-size: 12px;
  }
  .el-pagination {
    margin-top: 15px;
  }
  .el-select {
    margin-left: 10px;
  }
}
</style>
