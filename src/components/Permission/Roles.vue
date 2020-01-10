<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div>
        <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
      </div>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addRoledialogVisible" @close="clsAddFormDialog">
        <el-form
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoledialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 角色列表表格 -->
      <el-table :data="tableData" border style="width: 100%" stripe row-key="id">
        <el-table-column type="expand" width="50">
          <template slot-scope="scope">
            <!-- 一级权限循环 -->
            <el-row
              v-for="(item1st,i1) in scope.row.children"
              :key="item1st.id"
              :class="['bb',i1===0?'bt':'','vcenter']"
            >
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="delRight(scope,item1st.id)"
                >{{item1st.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限循环 -->
                <el-row
                  v-for="(item2nd,i2) in item1st.children"
                  :key="item2nd.id"
                  :class="[i2==0?'':'bt','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="delRight(scope,item2nd.id)"
                    >{{item2nd.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限循环 -->
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3th in item2nd.children"
                      :key="item3th.id"
                      @close="delRight(scope,item3th.id)"
                    >{{item3th.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑角色按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除角色按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRole(scope.row.id)"
            ></el-button>
            <!-- 分配权限按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSettingDialog(scope.row)"
              ></el-button>
            </el-tooltip>
            <!-- 设置角色权限对话框 -->
            <el-dialog
              title="提示"
              :visible.sync="settingDialogVisible"
              width="40%"
              @close="settingDialogVisible=false"
            >
              <!-- 树形控件 -->
              <el-tree
                ref="treeRef"
                :data="rightslist"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="dek"
                :props="defaultProps"
              ></el-tree>
              <span slot="footer" class="dialog-footer">
                <el-button @click="settingDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="settingRights(roleId)" :roleId="roleId">确 定</el-button>
              </span>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: [],
      settingDialogVisible: false,
      // 树形控件数据
      rightslist: [],
      dek: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '',
      rids: '',
      checkedKeys: [],
      halfCheckedKeys: [],
      // 添加角色数据
      addRoledialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }, { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取角色列表信息
    async queryRoles() {
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表信息失败')
      }
      this.tableData = res.data
    },
    // 删除指定权限
    async delRight(scope, rightId) {
      let result = await this.$confirm('确认永久删除该项么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        let res = await this.$axios.delete(`https://www.liulongbin.top:8888/api/private/v1roles/${scope.row.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        scope.row.children = res.data
        this.$message.success('删除成功')
      } else {
        this.$message.info('已取消操作')
      }
    },
    // 获取角色三级权限ID
    getDefaultNode(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefaultNode(item, arr)
      })
    },
    // 显示设置对话框
    async showSettingDialog(role) {
      this.dek = []
      let res = await this.$axios.get('https://www.liulongbin.top:8888/api/private/v1/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取树形数据
      this.rightslist = res.data
      this.getDefaultNode(role, this.dek)
      this.settingDialogVisible = true
      this.roleId = role.id
    },
    // 分配权限
    async settingRights(roleId) {
      let tree = this.$refs.treeRef
      this.checkedKeys = tree.getCheckedKeys()
      this.halfCheckedKeys = tree.getHalfCheckedKeys()
      this.rids = this.checkedKeys.concat(this.halfCheckedKeys).join(',')
      let res = await this.$axios.post(`https://www.liulongbin.top:8888/api/private/v1/roles/${roleId}/rights`, {
        rids: this.rids
      })
      if (res.meta.status !== 200) return this.$message.error('设置失败' + res.meta.msg)
      this.$message.success('设置成功')
      this.queryRoles()
      this.settingDialogVisible = false
    },
    // 显示添加角色对话框
    showAddRoleDialog() {
      this.addRoledialogVisible = true
    },
    // 添加角色
    addRole() {
      // 预校验
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('验证未通过')
        let res = await this.$axios.post('https://www.liulongbin.top:8888/api/private/v1/roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('角色添加失败' + res.meta.msg)
        this.$message.success('角色添加成功')
        this.queryRoles()
        this.addRoledialogVisible = false
      })
    },
    // 关闭添加角色对话框
    clsAddFormDialog() {
      this.addRoledialogVisible = false
      this.$refs.addRoleFormRef.resetFields()
    },
    // 删除角色
    async delRole(id) {
      let result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        let res = await this.$axios.delete(`https://www.liulongbin.top:8888/api/private/v1/roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.queryRoles()
      }
    }
  },
  created() {
    this.queryRoles()
  }
}
</script>
<style>
.el-dialog {
  margin-bottom: 0 !important;
}
</style>
<style lang="less" scoped>
.el-card {
  padding: 0;
}
.el-dialog {
  margin: 0 auto !important;
}
.vcenter {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 7px;
}
.bb {
  border-bottom: 1px solid #ccc;
}
.bt {
  border-top: 1px solid #ccc;
}
</style>
