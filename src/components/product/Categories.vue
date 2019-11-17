<template>
  <div class="categories">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加分类 -->
    <el-button type="success" plain @click="showAddDialog">添加分类</el-button>
    <!-- 表格组件 -->
    <el-table
      :data="categoryList"
      style="width:100%"
      v-loading.body="loading">
      <!-- treeKey指定节点的key值，只有指定了，才能确定展开的节点是哪个 -->
      <el-table-tree-column
        prop="cat_name"
        label="分类名称"
        childKey="children"
        treeKey="cat_id"
        levelKey="cat_level"
        :indent-size="40"
        parentKey="cat_pid"
        >
      </el-table-tree-column>
      <el-table-column prop="cat_deleted" label="是否禁用">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_deleted">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="cat_level" label="排序"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" plain icon="el-icon-edit"></el-button>
          <el-button type="danger" size="small" plain icon="el-icon-delete" @click="deleteCategory(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[2, 4, 6, 8]"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
      :current-page="current"
      :total="total">
    </el-pagination>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="增加分类"
      :visible.sync="addDialogVisible"
      width="40%">
      <el-form
        ref="addForm"
        :model="addForm"
        label-width="80px"
        :rules="rules">
        <!-- 表单项 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <el-cascader
            :options="categoryList2"
            :props="props"
            change-on-select
            v-model="addForm.cat_pid"
            placeholder="请选择父级分类"
            >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
// 导入
import ElTreeGrid from 'element-tree-grid'
// 注册全局组件
// Vue.component(ElTreeGrid.name, ElTreeGrid)

export default {
  data () {
    return {
      current: 1, // 当前页
      pageSize: 2, // 每页的条数
      total: 0, // 总条数
      loading: true, // 加载的状态
      addDialogVisible: false, // 添加分类对话框，默认隐藏
      addForm: {
        cat_name: '',
        cat_pid: [],
        cat_level: 0
      },
      rules: {
        cat_name: [
          {required: true, message: '请输入商品分类', trigger: 'blur'}
        ]
      },
      categoryList: [],
      categoryList2: [], // 添加用到的分类数据
      props: { // 设置显示的属性
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      }
    }
  },
  methods: {
    // 获取分类列表
    async getCategoryList () {
      const res = await this.axios.get('categories', {
        params: {
          type: 3,
          pagenum: this.current,
          pagesize: this.pageSize
        }
      })
      const {meta, data} = res.data
      // console.log(data)
      if (meta.status === 200) {
        setTimeout(() => {
          this.categoryList = data.result
          // console.log(this.categoryList)
          this.total = data.total
          // 关闭loading状态
          this.loading = false
        }, 500)
      }
    },
    // 当前页发生改变
    handleCurrentChange (val) {
      this.loading = true
      this.current = val
      this.getCategoryList()
    },
    // 每页的条数发生改变
    handleSizeChange (val) {
      this.loading = true
      this.pageSize = val
      this.current = 1
      this.getCategoryList()
    },
    // 显示添加分类对话框
    async showAddDialog () {
      this.addDialogVisible = true
      // 获取所有的2级的分类数据
      const res = await this.axios.get('categories', {
        params: {
          type: 2
        }
      })
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.categoryList2 = data
        console.log(this.categoryList2)
      }
    },
    // 添加分类
    async addCategory () {
      let {cat_name: catName, cat_pid: catPid} = this.addForm
      const res = await this.axios.post('categories', {
        cat_pid: catPid[catPid.length - 1] ? catPid[catPid.length - 1] : 0,
        cat_name: catName,
        cat_level: catPid.length
      })
      const {meta} = res.data
      if (meta.status === 201) {
        // 重置表单
        this.$refs.addForm.resetFields()
        // 重新渲染
        this.getCategoryList()
        // 隐藏
        this.addDialogVisible = false
        // 提示
        this.$message.success('恭喜你，添加成功了')
      }
    },
    // 删除分类
    async deleteCategory (category) {
      // console.log(category)
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 发送ajax请求删除
        const res = await this.axios.delete(`categories/${category.cat_id}`)
        const {meta} = res.data
        if (meta.status === 200) {
          this.getCategoryList()
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  components: {
    'el-table-tree-column': ElTreeGrid
  }
}
</script>

<style>
.el-breadcrumb {
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
}
</style>
