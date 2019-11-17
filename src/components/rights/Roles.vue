<template>
<div class="roles">
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 添加角色 -->
  <el-button type="success" plain class="mb_10" @click="showAddDialog">添加角色</el-button>
  <!-- 表格 -->
  <el-table :data="roleList" style="width: 100%" type="expand">
    <el-table-column type="expand">
      <template slot-scope="scope">
        <!-- 一级分类 -->
        <el-row v-if="scope.row.children.length === 0">
          <span>暂无权限请分配</span>
        </el-row>
        <el-row class="mb_10" v-for="level1 in scope.row.children" :key="level1.id">
          <el-col :span="4">
            <el-tag closable @close="deleteRight(scope.row, level1.id)">{{level1.authName}}</el-tag>
            <i class="el-icon-arrow-right"></i>
          </el-col>
          <el-col :span="20">
            <!-- 二级分类 -->
            <el-row class="mb_10" v-for="level2 in level1.children" :key="level2.id">
              <el-col :span="4">
                <el-tag type="success" closable @close="deleteRight(scope.row, level2.id)">{{level2.authName}}</el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="20">
                <!-- 三级分类 -->
                <span v-for="level3 in level2.children" :key="level3.id">
                  <el-tag class="mr_10" type="warning" closable @close="deleteRight(scope.row, level3.id)">{{level3.authName}}</el-tag>
                </span>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column type="index"></el-table-column>
    <el-table-column prop="roleName" label="角色名称"></el-table-column>
    <el-table-column prop="roleDesc" label="描述"></el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button type="primary" size="small" plain icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
        <el-button type="danger" size="small" plain icon="el-icon-delete" @click="delRole(scope.row)"></el-button>
        <el-button type="success" size="small" plain icon="el-icon-check" @click="showAssignDialog(scope.row)">分配权限</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    title="增加角色"
    :visible.sync="addDialogVisible"
    width="40%">
    <el-form
      ref="addForm"
      :model="addForm"
      label-width="80px"
      :rules="addRules">
      <!-- 表单项 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addRole">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 编辑 -->
  <el-dialog
    title="编辑角色"
    :visible.sync="editDialogVisible"
    width="40%">
    <el-form
      ref="editForm"
      :model="editForm"
      label-width="80px"
      :rules="addRules">
      <!-- 表单项 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editRole">确 定</el-button>
    </span>
  </el-dialog>

  <!-- 分配权限 -->
  <el-dialog
    title="分配权限"
    :visible.sync="assignDialogVisible"
    width="40%">
    <!-- 属性菜单 -->
    <!-- data:数据 -->
    <!-- show-checkbox:是否显示checkbox -->
    <!-- default-expand-all:是否展开所有 -->
    <!-- node-key -->
    <el-tree
      :data="rightList"
      show-checkbox
      default-expand-all
      node-key="id"
      ref="tree"
      highlight-current
      :props="defaultProps">
    </el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="assignDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="assignRight">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [], // 角色列表
      addDialogVisible: false, // 添加对话框是否显示
      addForm: { // 添加的表单数据
        roleName: '',
        roleDesc: ''
      },
      addRules: {
        roleName: [
          {required: true, message: '角色名称不能为空', trigger: 'blur'}
        ]
      },
      editDialogVisible: false, // 编辑对话框
      editForm: { // 添加的表单数据
        roleName: '',
        roleDesc: '',
        id: ''
      },
      assignDialogVisible: false, // 分配权限对话框显示
      rightList: [], // 所有的权限数据列表
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '' // 当前角色的id
    }
  },
  methods: {
    // 获取角色列表
    async getRoleList () {
      const res = await this.axios.get('roles')
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.roleList = data
      }
    },
    // 删除角色
    async delRole (role) {
      try {
        // 1. 弹出提示框
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 2. 发送ajax请求
        const res = await this.axios.delete(`roles/${role.id}`)
        if (res.data.meta.status === 200) {
          // 重新渲染
          this.getRoleList()
          // 提示信息
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    // 显示添加对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 添加角色
    addRole () {
      this.$refs.addForm.validate(async valid => {
        if (valid) {
          // 发送ajax请求
          const res = await this.axios.post('roles', this.addForm)
          if (res.data.meta.status === 201) {
            // 隐藏模态框
            this.addDialogVisible = false
            // 提示成功
            this.$message.success('添加成功')
            // 重置样式
            this.$refs.addForm.resetFields()
            // 重新渲染
            this.getRoleList()
          }
        } else {
          return false
        }
      })
    },
    // 显示编辑对话框
    showEditDialog (role) {
      this.editDialogVisible = true
      this.editForm.id = role.id
      this.editForm.roleName = role.roleName
      this.editForm.roleDesc = role.roleDesc
    },
    editRole () {
      this.$refs.editForm.validate(async valid => {
        const res = await this.axios.put(`roles/${this.editForm.id}`, this.editForm)
        if (res.data.meta.status === 200) {
          // 隐藏
          this.editDialogVisible = false
          // 重置
          this.$refs.editForm.resetFields()
          // 渲染
          this.getRoleList()
          // 提示
          this.$message.success('修改角色成功')
        }
      })
    },
    // 删除权限
    async deleteRight (role, rightId) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 发送ajax请求，删除
        const res = await this.axios.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.data.meta.status === 200) {
          role.children = res.data.data
          this.$message.success('删除成功了')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    // 展示分配权限的对话框
    async showAssignDialog (role) {
      this.assignDialogVisible = true
      // 获取所有的权限列表
      const res = await this.axios.get(`rights/tree`)
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.rightList = data
      }
      this.roleId = role.id
      // 需要获取到所有的三级权限
      const temprights = []
      role.children.forEach(level1 => {
        level1.children.forEach(level2 => {
          level2.children.forEach(level3 => {
            temprights.push(level3.id)
          })
        })
      })
      this.$refs.tree.setCheckedKeys(temprights)
    },
    // 分配权限
    async assignRight () {
      // 获取到tree中选中的节点信息
      const checkedRights = this.$refs.tree.getCheckedKeys()
      const halfRights = this.$refs.tree.getHalfCheckedKeys()
      const all = [...checkedRights, ...halfRights]

      // 发送ajax请求
      const res = await this.axios.post(`roles/${this.roleId}/rights`, {
        rids: all.join()
      })
      if (res.data.meta.status === 200) {
        // 关闭对话框
        this.assignDialogVisible = false
        // 重新渲染
        this.getRoleList()
        // 提示
        this.$message.success('权限分配成功')
      }
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style>
.el-breadcrumb {
  height: 30px;
  line-height: 30px;
}
.mb_10 {
  margin-bottom: 10px;
}

.mr_10 {
  margin-right: 10px;
}
</style>
