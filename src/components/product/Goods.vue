<template>
  <div class="goods">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框与添加框 -->
    <el-input placeholder="请输入内容" v-model="query" class="input-with-select">
      <el-button slot="append" icon="el-icon-search"></el-button>
    </el-input>
    <el-button type="success" plain @click="$router.push('/goods/add')">添加商品</el-button>

    <!-- 表格组件 -->
    <el-table :data="goodList" style="width: 100%;">
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
      <el-table-column label="创建时间" prop="upd_time">
        <template slot-scope="scope">
          <span>{{scope.row.add_time | dateFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" plain icon="el-icon-edit" @click="editGoods(scope.row)"></el-button>
          <el-button type="danger" size="small" plain icon="el-icon-delete" @click="deleteGood(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      ref="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="current"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      background
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    return {
      query: '', // 查询关键字
      current: 1, // 当前页
      pageSize: 10, // 每页的条数
      total: 0, // 总数
      goodList: [] // 商品列表数据
    }
  },
  methods: {
    // 获取商品列表-分页
    async getGoodList () {
      const res = await this.axios.get('goods', {
        params: {
          query: this.query,
          pagenum: this.current,
          pagesize: this.pageSize
        }
      })
      const {meta, data} = res.data
      if (meta.status === 200) {
        this.total = data.total
        this.goodList = data.goods
      }
    },
    // 当前页发生改变
    handleCurrentChange (val) {
      this.current = val
      this.getGoodList()
    },
    // 每页条数发生改变
    handleSizeChange (val) {
      this.pageSize = val
      this.current = 1
      this.getGoodList()
    },
    // 处理索引问题
    indexMethod (index) {
      return (this.current - 1) * this.pageSize + index + 1
    },
    async deleteGood (good) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await this.axios.delete(`goods/${good.goods_id}`)
        const {meta} = res.data
        if (meta.status === 200) {
          // 重新渲染
          this.getGoodList()
          // 提示成功
          this.$message.success('删除商品成功了')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    editGoods (good) {
      this.$router.push('/goods/add?id=' + good.goods_id)
    }
  },
  created () {
    this.getGoodList()
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
