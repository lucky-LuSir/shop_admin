<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框与添加框 -->
    <el-input placeholder="请输入内容" v-model="query" class="input-with-select">
      <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
    </el-input>
    <el-button type="success" plain @click="showAddDialog">添加用户</el-button>

    <!-- el-table:表格组件 -->
    <!-- :data='tableData' 表格显示的数据 -->
    <!-- el-table-column：表格的一列 -->
    <!-- prop： 当前列要显示的数据 ，userList内的数据-->
    <!-- label：表头 -->
    <!-- width: 这一列的宽度 -->
    <el-table
      :data="userList"
      style="width: 100%">
      <el-table-column
        prop="username"
        label="姓名"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话"
        width="200">
      </el-table-column>
      <el-table-column
        prop="mg_state"
        label="用户状态"
        width="200">
        <!-- 1. 表示表格的自定义列模板，意味着这一列显示的数据自己来定义了 -->
        <!-- 2. 通过scope.row可以获取到当前行的数据 -->
        <template slot-scope="scope">
          <!-- scope.row可以获取到整行的数据 -->
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeState(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
         <template slot-scope="scope">
            <el-button type="primary" size="small" plain icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
            <el-button type="danger" size="small" plain icon="el-icon-delete" @click="deleteUser(scope.row)"></el-button>
            <el-button type="success" size="small" plain icon="el-icon-check" @click="showAssignDialog(scope.row)">分配角色</el-button>
         </template>
      </el-table-column>
    </el-table>
    <!-- el-pagination:分页组件 -->
    <!-- background：带背景 -->
    <!-- layout：分页组件显示的内容 -->
    <!-- total：设置总条数 -->
    <!-- page-size:设置每页的条数 -->
    <!-- current-change：页数改变的时候，触发 -->
    <!-- :page-sizes: 可以选择条数数据 [2,3,4,5] -->
    <!-- size-change： 当每页的条数发生改变的时候，触发 -->
    <!-- :current-page:当前页 -->
    <el-pagination
      background
      :page-sizes="[2, 4, 6, 8]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :current-page="current"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
      >
    </el-pagination>
    <!-- 增加用户的对话框 -->
    <!-- el-dialog:对话框组件 -->
    <!-- title: 标题 -->
    <!-- width：30% 对话框的宽度 -->
    <el-dialog
      title="增加用户"
      :visible.sync="addDialogVisible"
      width="40%">
      <!-- model: 添加表单的数据 -->
      <!-- label-width:指定label的宽度 -->
      <el-form
        ref="addForm"
        :model="addForm"
        label-width="70px"
        :rules="addRules">
        <!-- 表单项 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="40%">
      <!-- model: 添加表单的数据 -->
      <!-- label-width:指定label的宽度 -->
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="70px"
        :rules="addRules">
        <!-- 表单项 -->
        <el-form-item label="用户名">
          <el-tag type="info">{{editForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 给用户分配角色对话框 -->
    <el-dialog
      title="分配角色权限"
      :visible.sync="assignDialogdalVisible"
      width="40%">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="用户名">
          <el-tag type="info">{{assignForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表">
          <el-select v-model="assignForm.rid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogdalVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      query: '', // 关键字
      current: 1, // 当前页
      pageSize: 2, // 每页的条数
      total: 0, // 总的条数
      addDialogVisible: false, // 添加对话框，默认不显示
      addForm: { // 添加用户的表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addRules: { // 添加用户的校验规则
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          // { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱的格式', trigger: 'blur' }
        ],
        mobile: [
          // { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机格式', trigger: 'blur' }
        ]
      },
      editDialogVisible: false, // 修改的对话框，默认不显示
      editForm: {
        username: '',
        email: '',
        mobile: '',
        id: ''
      },
      assignDialogdalVisible: false, // 分配角色对话框，默认false
      assignForm: {
        username: '',
        rid: '',
        id: ''
      },
      roleList: [], // 角色列表
      userList: [] // 用户的数据
    }
  },
  methods: {
    // 获取用户列表数据
    async getUserList () {
      // 发送ajax请求，获取到用户列表的数据
      const res = await this.axios({
        method: 'get',
        url: 'users',
        // 如果是get请求的参数，要不就拼到url后面
        // 使用params参数，不能使用data
        params: {
          query: this.query,
          pagenum: this.current,
          pagesize: this.pageSize
        }
      })
      const {meta, data} = res.data
      if (meta.status === 200) {
        // 获取到数据了
        this.userList = data.users
        this.total = data.total
      }
    },
    // 当前页发生改变的事件
    handleCurrentChange (val) {
      // 修改当前页
      this.current = val
      // 重新发送请求
      this.getUserList()
    },
    // 每页条数发生改变的事件
    handleSizeChange (val) {
      // 修改每页的条数
      this.pageSize = val
      // 当前页应该变成1
      this.current = 1
      // 重新发送请求
      this.getUserList()
    },
    // 搜索功能的实现
    search () {
      // 重新显示第一页
      this.current = 1
      // 搜索
      this.getUserList()
    },
    // 启用禁用功能
    async changeState (user) {
      // 发送ajax请求
      const res = await this.axios.put(`users/${user.id}/state/${user.mg_state}`)
      const {meta: {status}} = res.data
      if (status === 200) {
        this.$message.success('修改用户状态成功')
      } else {
        this.$message.error('修改用户状态失败')
      }
    },
    // 删除用户的功能
    async deleteUser (user) {
      try {
        // 1.给一个确认框
        await this.$confirm('你确定要删除这个用户吗?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 2.发送ajax请求
        const res = await this.axios.delete(`users/${user.id}`)
        const {status} = res.data.meta
        if (status === 200) {
          // 如果当前页只有一条数据了，需要让页数减1
          if (this.userList.length === 1) {
            this.current--
          }
          // 1. 重新渲染
          this.getUserList()
          // 2. 给个提示
          this.$message.success('恭喜你，删除成功')
        }
      } catch (e) {
        this.$message.error('取消删除')
      }
    },
    // 显示添加对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 添加用户的方法
    addUser () {
      // 1. 表单校验
      this.$refs.addForm.validate(async valid => {
        if (valid) {
          // 2. 发送ajax请求，添加数据
          const res = await this.axios.post('users', this.addForm)
          if (res.data.meta.status === 201) {
            // 1. 关闭模态框
            this.addDialogVisible = false
            // 2. 重置样式
            this.$refs.addForm.resetFields()
            // 3. 重新渲染
            // 添加成功了一条，总数需要+1,算一下总条数
            this.total++
            this.current = Math.ceil(this.total / this.pageSize)
            this.getUserList()
            // 4. 提示
            this.$message.success('恭喜你，添加用户成功了')
          } else {
            this.$message.error(res.data.meta.msg)
          }
        } else {
          return false
        }
      })
    },
    // 显示修改的dialog
    showEditDialog (user) {
      this.editDialogVisible = true
      this.editForm.username = user.username
      this.editForm.email = user.email
      this.editForm.mobile = user.mobile
      this.editForm.id = user.id
    },
    // 修改用户
    editUser () {
      // 1. 表单验证
      this.$refs.editForm.validate(async valid => {
        if (valid) {
          // 2. 发送ajax请求，修改用户
          const res = await this.axios.put(`users/${this.editForm.id}`, this.editForm)
          if (res.data.meta.status === 200) {
            // 1. 关闭模态框
            this.editDialogVisible = false
            // 2. 重置样式
            this.$refs.editForm.resetFields()
            // 3. 重新渲染
            this.getUserList()
            // 4. 提示成功
            this.$message.success('恭喜你，用户修改成功')
          }
        } else {
          return false
        }
      })
    },
    // 显示分配角色对话框
    async showAssignDialog (user) {
      this.assignDialogdalVisible = true
      this.assignForm.username = user.username
      this.assignForm.id = user.id
      // 回显 this.assignForm.rid
      const temp = await this.axios.get(`users/${user.id}`)
      if (temp.data.meta.status === 200) {
        if (temp.data.data.rid === -1) {
          temp.data.data.rid = ''
        }
        this.assignForm.rid = temp.data.data.rid
      }
      // 获取角色列表
      const res = await this.axios.get('roles')
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.roleList = data
        console.log(this.roleList)
      }
    },
    async assignRole () {
      if (this.assignForm.rid === '') {
        this.$message.error('请选择角色')
        return
      }
      const res = await this.axios.put(`users/${this.assignForm.id}/role`, this.assignForm)
      const {meta} = res.data
      if (meta.status === 200) {
        // 关闭模态框
        this.assignDialogdalVisible = false
        // 重新渲染
        this.getUserList()
        // 提示消息
        this.$message.success('分配角色成功')
      }
    }
  },
  // created钩子函数
  created () {
    this.getUserList()
  }
}
</script>

<style>
.input-with-select {
  width: 300px;
  margin-bottom: 10px;
  margin-top: 10px;
}
</style>
