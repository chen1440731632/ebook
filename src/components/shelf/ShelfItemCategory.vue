<template>
  <div class="shelf-item-category">
    <!-- 图书分类封面：九宫格 -->
    <div class="shelf-item-category-list" v-if="data.itemList.length > 0">
      <div class="shelf-item-category-item" v-for="(item, index) in data.itemList" :key="index">
        <img class="shelf-item-category-img" :src="item.cover" v-if="item.cover">
        <div class="shelf-item-book-bg-wrapper" v-else></div>
      </div>
    </div>
    <!-- 当分组中没有书籍的时候显示的封面 -->
    <div class="shelf-item-category-bg" v-else>
      <span class="icon-book2"></span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      data: Object
    },
    mounted() {
    //  console.log(this.data.itemList) //测试
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-item-category {
    width: 100%;
    height: 100%;
    overflow: hidden; // 隐藏多余的书
    // 图书分类封面：九宫格
    .shelf-item-category-list {
      display: flex;
      flex-flow: row wrap;
      align-content: flex-start;  // 表示剩下空间如何排列：默认时靠左居中，添加这个属性后靠顶部居左显示
      width: 100%;
      height: 100%;
      padding-top: px2rem(5);
      box-sizing: border-box;
      .shelf-item-category-item {
        flex: 0 0 33.33%;
        width: 33.33%;
        height: 33.33%;
        box-sizing: border-box;
        // 九宫格的第一列
        &:nth-child(3n+1) {
          padding: 0 px2rem(2.5) px2rem(5) px2rem(5);
        }
        // 九宫格的第二列
        &:nth-child(3n+2) {
          padding: 0 px2rem(2.5) px2rem(5) px2rem(2.5);
        }
        // 九宫格的第三列
        &:nth-child(3n+3) {
          padding: 0 px2rem(5) px2rem(5) px2rem(2.5);
        }
        .shelf-item-category-img {
          width: 100%;
          height: 100%;
        }
        .shelf-item-book-bg-wrapper {
          width: 100%;
          height: 100%;
          background-color: lightblue;
        }
      }
    }
    .shelf-item-category-bg {
      width: 100%;
      height: 100%;
      background: white;
      font-size: px2rem(30);
      color: #ccc;
      @include center;
    }
  }
</style>
