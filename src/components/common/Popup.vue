<template>
  <div class="popup" v-if="popupVisible">
  <transition name="fade">
    <div class="popup-bg" @click.stop.prevent="hide" v-show="popupVisible"></div>
  </transition>
  <transition name="popup-slide-up">
    <div class="popup-wrapper" v-show="visible">
      <div class="popup-title" v-if="title && title.length > 0">{{title}}</div>
       <label class="popup-btn"
            for='my_file'
            v-if="local && !test"
            :class="{'danger': true}"
            @click="onImpClick">导入本地epub电子书
      </label>
      <input type="file" name="file" @change="changeFile" id='my_file' v-show="false" />
      <div class="popup-btn"
           v-if="local && test"
           :class="{'danger': true}"
           @click="sendAjax">确认导入
      </div>
      <div class="popup-btn"
           :class="{'danger': item.type==='danger'}"
           v-for="(item, index) in btn"
           :key="index"
           @click="item.click">{{item.text}}
      </div>
    </div>
  </transition>
</div>
</template>

<script>
  import { storeShelfMixin } from '../../utils/mixin'
  import { importShelf } from '../../utils/store'
  import { saveBookShelf } from '../../utils/localStorage'
  import {
    sendAjax, importEook
  } from '../../api/store'
  export default {
    name: 'popup',
    mixins: [storeShelfMixin],
    props: {
      title: String,
      btn: Array,
      local: Boolean
    },
    data() {
      return {
        popupVisible: false,
        visible: false,
        test: false
      }
    },
    methods: {
      // 为了两个动画的完整性，利用setTimeout()
      // 将整个组件和弹出层dom 的显示和隐藏 递进
      show() {
        this.popupVisible = true
        setTimeout(() => {
          this.visible = true
        })
      },
      hide() {
        this.visible = false
        setTimeout(() => {
          this.popupVisible = false
        }, 200)
      },
      sendAjax: function() {
        let fileName = this.file.name.replace(/\..*/, '').toString()
        importEook(this.file, fileName)
        this.setShelfList(importShelf(fileName))
        this.hide()
        this.test = !this.test
      },
      changeFile: function(e) {
        this.file = e.target.files[0];
      },
      onImpClick() {
        this.test = !this.test
      }
    },
    mounted() {
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);
    .popup-bg {
      width: 100%;
      height: 100%;
    }
    .popup-wrapper {
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 2000;
      width: 100%;
      background: white;
      .popup-title {
        width: 100%;
        height: px2rem(44);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(12);
        line-height: px2rem(14);
        padding: px2rem(15);
        box-sizing: border-box;
        color: #999;
        @include center;
      }
      .popup-btn {
        width: 100%;
        height: px2rem(60);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(16);
        color: #666;
        font-weight: bold;
        @include center;
        &.danger {
          color: $color-pink;
        }
      }
    }
  }
</style>
