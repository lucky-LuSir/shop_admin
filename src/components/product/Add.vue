<template>
  <div class="goods-add">
    <!-- 步骤条 -->
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤 1" description="基本信息"></el-step>
      <el-step title="步骤 2" description="商品图片"></el-step>
      <el-step title="步骤 3"  description="商品内容"></el-step>
    </el-steps>

    <!-- 标签页 -->
    <el-tabs tab-position="left" v-model="activeName" @tab-click="changeTab">
      <el-tab-pane name="basic" label="基本信息">
        <el-form ref="addForm" :model="addForm" label-width="80px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="options"
                v-model="addForm.goods_cat"
                :props="props">
              </el-cascader>
          </el-form-item>
          <el-form-item label="是否促销" prop="is_promote">
            <el-radio v-model="addForm.is_promote" label="true">是</el-radio>
            <el-radio v-model="addForm.is_promote" label="false">否</el-radio>
          </el-form-item>
          <el-form-item label="是否促销">
            <el-button type="primary" @click="next(1, 'pic')">下一步</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="pic" label="商品图片">
        <!-- el-upload: 文件上传组件 -->
        <!-- action：图片上传的url地址 -->
        <!-- handlePreview：预览的回调函数 -->
        <!-- :on-remove="handleRemove"移除的回调函数 -->
        <!-- :file-list 上传的文件列表 -->
        <!-- list-type：上传的图片类型 -->
        <el-upload
          class="upload-demo"
          action="http://localhost:8888/api/private/v1/upload"
          :headers="headers"
          :on-remove="handleRemove"
          :file-list="fileList"
          :on-success="handleSuccess"
          list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
        <el-button type="primary" @click="next(2, 'content')">下一步</el-button>
      </el-tab-pane>
      <el-tab-pane name="content" label="商品内容">
        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
        <el-button type="primary" @click="addGood">添加</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data () {
    return {
      active: 0,
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        is_promote: '1',
        pics: []
      },
      fileList: [],
      activeName: 'basic',
      options: [],
      props: {
        value: 'cat_id',
        label: 'cat_name'
      },
      headers: {
        Authorization: localStorage.getItem('myToken')
      }
    }
  },
  methods: {
    changeTab (tab) {
      this.active = +tab.index
    },
    next (active, activeName) {
      this.active = active
      this.activeName = activeName
    },
    handleRemove (file, fileList) {
      let idx = this.addForm.pics.findIndex(item => item === file.response.data.tmp_path)
      this.addForm.pics.splice(idx, 1)
    },
    handleSuccess (res, file, fileList) {
      const {meta, data} = res
      if (meta.status === 200) {
        this.addForm.pics.push({pic: data.tmp_path})
      }
    },
    async addGood () {
      // 表单校验
      const res = await this.axios.post('goods', {
        ...this.addForm,
        goods_cat: this.addForm.goods_cat.join()
      })
      const {meta} = res.data
      if (meta.status === 201) {
        // 成功了
        this.$router.push('/goods')
        // 提示
        this.$message.success('添加商品成功了')
      }
    }
  },
  // 钩子函数中获取数据
  async created () {
    const res = await this.axios.get('categories?type=3')
    const {meta, data} = res.data
    if (meta.status === 200) {
      this.options = data
    }
    // 如果id值，说明是修改
    let id = this.$route.query.id
    if (!id) {
      return
    }
    const res2 = await this.axios.get(`goods/${id}`)
    if (res2.data.meta.status === 200) {
      let result = res2.data.data
      console.log(result)
      this.addForm.goods_name = result.goods_name
      this.addForm.goods_price = result.goods_price
      this.addForm.goods_weight = result.goods_weight
      this.addForm.goods_number = result.goods_number
      this.addForm.goods_introduce = result.goods_introduce
      result.pics.forEach(item => {
        console.log(item)
        this.fileList.push({url: item.pics_mid})
        console.log(this.fileList)
      })
      result.goods_cat.split(',').forEach(item => {
        this.addForm.goods_cat.push(+item)
      })
      this.addForm.is_promote = result.is_promote
    }
  }

}
</script>

<style lang="less">
.quill-editor {
  .ql-editor {
    min-height: 300px;
  }
  background-color: #fff;
}
</style>
