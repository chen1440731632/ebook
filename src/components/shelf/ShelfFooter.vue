<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
      <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
        <!-- 2：开启离线 -->
        <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload && !isLocal"></div>
        <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isAllDownload && !isLocal"></div>
        <!-- 3：移动到... -->
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <!-- 4：移除书架 -->
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <!-- 图标下的文字 -->
        <div class="tab-text" :class="{'remove-text': item.index === 4}">{{ label(item) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { storeShelfMixin } from '../../utils/mixin'
  import { saveBookShelf, removeLocalStorage, getDownTicket, saveDownTicket } from '../../utils/localStorage'
  import { download } from '../../api/store'
  import { removeLocalForage } from '../../utils/localForage'
  import { Toast } from 'mint-ui'

  export default {
    mixins: [storeShelfMixin],
    computed: {
      // 判断是否选择了书籍
      isSelected() {
        return this.shelfSelected && this.shelfSelected.length > 0
      },
      // 按钮对象数组
      tabs() {
        return [
          {
            label: this.$t('shelf.download'),
            label2: this.$t('shelf.delete'),
            index: 2
          },
          {
            label: this.$t('shelf.move'),
            index: 3
          },
          {
            label: this.$t('shelf.remove'),
            index: 4
          }
        ]
      },
      // 判断是否包含已经离线存储的图书（此时关闭所有离线相关的图标）
      isDownload() {
        if (!this.isSelected) {
          return false
        } else {
          return this.shelfSelected.some(item => item.cache)
        }
      },
      // 判断是否全部为离线（此时显示删除离线）
      isAllDownload() {
        if (!this.isSelected) {
          return false
        } else {
          return this.shelfSelected.every(item => item.cache)
        }
      },
      // 判断是否包含本地图书（只要有一本即为true）
      isLocal() {
        if (!this.isSelected) {
          return false
        } else {
          return this.shelfSelected.some(item => item.type === 4)
        }
      }
    },
    data() {
      return {
        popupMenu: null
      }
    },
    methods: {
      // 循环下载选择的所有图书
      async downloadSelectedBook() {
        for (let i = 0; i < this.shelfSelected.length; i++) {
          await this.downloadBook(this.shelfSelected[i])
            // 每本书下载完毕之后，就将该book的cache属性设置为true
            .then(book => {
              book.cache = true
            })
        }
      },

      // 下载电子书，返回一个promise对象
      downloadBook(book) {
        // 新建一个空白的toast对象（对话框）
        let text = ''
        const toast = this.toast({
          text
        })
        // 弹出一个持续显示的对话框
        toast.continueShow()
        return new Promise((resolve, reject) => {
          download(book, book => {  // 第2个参数onSucess：成功时调用的方法
            toast.remove() // 下载完成，移除隐藏持续显示的对话框（该方法是create-api提供的）
            resolve(book) // promise对象成功时调用resolve()方法
          }, reject, progressEvent => { // 第4个参数onProgress：当前下载的进度对象（持续更新）
            // 计算当前的下载进度 
            const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
            // 更新对话框中的文字
            text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
            toast.updateText(text)
          })
        })
      },

      // 从离线缓存中移除选择的书籍
      removeSelectedBook() {
        // 一次性移除所有的电子书
        Promise.all(this.shelfSelected.map(book => this.removeBook(book)))
          .then(books => {
            books.map(book => { //将每本book的cache属性设置为false
              book.cache = false
            })
            saveBookShelf(this.shelfList) // 更新书架上的书籍状态信息列表
            this.simpleToast(this.$t('shelf.removeDownloadSuccess')) // 弹出提示删除成功的对话框
          })
      },

      // 移除书籍，返回一个promise对象
      removeBook(book) {
        return new Promise((resolve, reject) => {
          // 移除本地存储的book对象信息
          removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
          // 移除本地离线缓存的书籍
          removeLocalForage(`${book.fileName}`)
          resolve(book)
        })
      },

      // 隐藏弹出框
      hidePopup() {
        this.popupMenu.hide()
      },

      // 点击弹出按钮后：隐藏弹出按钮=>关闭编辑模式=>将书架中的图书状态保存在本地
      onComplete() {
        this.hidePopup()
        this.setIsEditMode(false)
        saveBookShelf(this.shelfList)
      },

      // 点击离线缓存弹出框的事件处理
      async setDownload() {
        this.onComplete()
        if (this.isDownload) {  // 如果全部为下载的书籍，则从本地缓存中移除
          this.removeSelectedBook()
        } else {  
          // 判断当前的下载券是否足够
          if (parseInt(getDownTicket()) >= this.shelfSelected.length) {
            // 下载选择的图书
            saveDownTicket( parseInt(getDownTicket()) - this.shelfSelected.length)
          await this.downloadSelectedBook() // await：等待该异步方法执行完毕之后，再执行下面的事件
          saveBookShelf(this.shelfList) // 更新书架上的书籍状态信息列表
          this.simpleToast(this.$t('shelf.setDownloadSuccess')) // 弹出下载完成的对话框
          } else if (parseInt(getDownTicket()) < 1) {
            Toast({
                  message: '您目前没有下载券，请先去兑换',
                  duration: 2000
                })
          } else {
            Toast({
                  message: '您目前拥有的下载券不足够本次全部的下载，请减少电子书的数量或者兑换更多的下载券',
                  duration: 2000
                })
          }
          
        }
      },

      // 点击将选择的图书移出书架
      removeSelected() {
        this.setShelfList(this.shelfList
          .filter(book => { // 将选择的书籍从书架列表中过滤掉
            if (book.itemList) { // 如果是在书架页面的话，同理上面
              book.itemList = book.itemList.filter(subBook => this.shelfSelected.indexOf(subBook) < 0)
            }
            return this.shelfSelected.indexOf(book) < 0
          }))
        // 选择的图书中存在离线缓存的图书时，移出书架的同时删除本地的离线缓存
        if (this.shelfSelected.find(item => item.cache===true) != undefined) {  
          this.removeSelectedBook()
        }
        this.setShelfSelected([])
        this.onComplete()
      },

      // 离线缓存弹出框
      showDownload() {
        this.popupMenu = this.popup({
          title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
          btn: [
            {
              text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
              click: () => {
                this.setDownload()
              }
            },
            {
              text: this.$t('shelf.cancel'),
              click: () => {
                this.hidePopup()
              }
            }
          ]
        }).show()
      },

      // 移出书架弹出框
      showRemove() {
        let title
        if (this.shelfSelected.length === 1) {  // 当只选择了一本书的时候，提示书名
          title = this.$t('shelf.removeBookTitle').replace('$1', `《${this.shelfSelected[0].title}》`)
        } else {  // 当选择了多本书的时候，提示"所选图书"
          title = this.$t('shelf.removeBookTitle').replace('$1', this.$t('shelf.selectedBooks'))
        }
        this.popupMenu = this.popup({
          title: title,
          btn: [
            {
              text: this.$t('shelf.removeBook'),
              type: 'danger',
              click: () => {
                this.removeSelected()
              }
            },
            {
              text: this.$t('shelf.cancel'),
              click: () => {
                this.hidePopup()
              }
            }
          ]
        }).show()
      },

      // 点击底层按钮，显示对应的弹出框
      onTabClick(item) {
        if (!this.isSelected) { // 没有选择图书的时候，没有点击事件发生
          return
        }
        switch (item.index) {
          case 2:
              if (!this.isDownload) { // 当为默认的图书的时候，显示离线缓存
                this.showDownload()
              } else if (this.isAllDownload&&!this.isLocal) { // 全部为不是本地图书的缓存，则显示删除缓存
                this.showDownload()
              } else if(this.isLocal&&this.isDownload || !this.isAllDownload) { // 包含已缓存或者本地图书，不显示操作
                return 
              }
            break
          case 3:
            this.dialog().show()
            break
          case 4:
            this.showRemove()
            break
          default:
            break
        }
      },
      // 动态显示图标下的文字
      label(item) {
        switch (item.index) {
          case 2:
          if (!this.isDownload) { // 当为默认的图书的时候，显示离线缓存
            return item.label
          } else if (this.isAllDownload&&!this.isLocal) { // 全部为不是本地图书的缓存，则显示删除缓存
            return item.label2
          } else if(this.isLocal&&this.isDownload || !this.isAllDownload) { // 包含已缓存或者本地图书，不显示操作
            return null
          }
          default:
            return item.label
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .shelf-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 120;
    display: flex;
    width: 100%;
    height: px2rem(48);
    background: white;
    box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, .1);
    .shelf-footer-tab-wrapper {
      flex: 1;
      width: 25%;
      height: 100%;
      .shelf-footer-tab {
        width: 100%;
        height: 100%;
        opacity: .5;
        @include columnCenter;
        &.is-selected {
          opacity: 1;
        }
        .tab-icon {
          font-size: px2rem(20);
          color: #666;
        }
        .tab-text {
          margin-top: px2rem(5);
          font-size: px2rem(12);
          color: #666;
          &.remove-text {
            color: $color-pink;
          }
        }
        .icon-shelf {
          color: $color-pink;
        }
      }
    }
  }
</style>
