<template>
  <div class="scroll-box">
    <el-button
      v-if="showScrollBtns"
      size="mini"
      icon="el-icon-d-arrow-left"
      @click="handleScrolltTo('left')"
    ></el-button>
    <!-- 横向滚动条 -->
    <el-scrollbar
      id="scroll-container"
      class="scroll-container"
      ref="scrollContainer"
      :vertical="false"
      @wheel.native.prevent="handleScroll"
    >
      <!-- 插槽 -->
      <slot />
    </el-scrollbar>
    <el-button
      v-if="showScrollBtns"
      size="mini"
      icon="el-icon-d-arrow-right"
      @click="handleScrolltTo('right')"
    ></el-button>
  </div>
</template>

<script>
const tagAndTagSpacing = 4 // tagAndTagSpacing

export default {
  name: 'ScrollPane',
  data() {
    return {
      left: 0,
      scrollEle: '',
      showScrollBtns: false,
    }
  },
  props: {
    scrollData: [Array],
  },
  watch: {
    // 判断是否需要产生滚动条
    scrollData() {
      this.setScrollBtnsStatus()
    },
  },
  computed: {
    scrollWrapper() {
      return this.$refs.scrollContainer.$refs.wrap
    },
  },
  mounted() {
    this.scrollWrapper.addEventListener('scroll', this.emitScroll, true)
    window.onresize = () => {
      this.setScrollBtnsStatus()
    }
  },
  methods: {
    // 获取滚动条的状态
    setScrollBtnsStatus() {
      const scrollEle = this.$refs.scrollContainer.wrap // 滚动容器
      const wrapWidth = scrollEle.clientWidth // 容器宽度
      const targetEles = document.getElementsByClassName('tags-view-item')
      const targetElesArr = Array.from(targetEles)
      const { length: len } = targetElesArr
      if (len > 0) {
        const scrollLastChild = targetEles[len - 1] // 最后一个子元素
        const OFL = scrollLastChild.offsetLeft // 最后一个子元素 距离滚动容器的 左边距
        const scrollLastChildWidth = scrollLastChild.clientWidth // 最后一个子元素的自身宽度
        this.showScrollBtns = wrapWidth < OFL + scrollLastChildWidth
      } else {
        this.showScrollBtns = false
      }
    },
    // 滚动到制定方向位置
    handleScrolltTo(dir) {
      const moveWidthPerCount = this.scrollWrapper.clientWidth / 2
      if (dir === 'left') {
        if (this.scrollWrapper.scrollLeft > 0) {
          this.scrollWrapper.scrollLeft -= moveWidthPerCount
        } else {
          this.scrollWrapper.scrollLeft = 0
        }
      }
      if (dir === 'right') {
        if (this.scrollWrapper.scrollLeft) {
        }
        this.scrollWrapper.scrollLeft += moveWidthPerCount
      }
    },
    // 滚动事件
    handleScroll(e) {
      const eventDelta = e.wheelDelta || -e.deltaY * 40
      this.scrollWrapper.scrollLeft =
        this.scrollWrapper.scrollLeft + eventDelta / 4
    },
    // 监听滚动事件
    emitScroll() {
      this.$emit('scroll')
    },
    // 移动到指定目标tag
    moveToTarget(currentTag) {
      console.log(this.$refs.scrollContainer.$el.offsetLeft)
      const $container = this.$refs.scrollContainer.$el
      const $containerWidth = $container.offsetWidth
      const $scrollWrapper = this.scrollWrapper
      const tagList = this.$parent.$refs.tag

      let firstTag = null
      let lastTag = null

      // find first tag and last tag
      if (tagList.length > 0) {
        firstTag = tagList[0]
        lastTag = tagList[tagList.length - 1]
      }

      if (firstTag === currentTag) {
        $scrollWrapper.scrollLeft = 0
      } else if (lastTag === currentTag) {
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
      } else {
        // find preTag and nextTag
        const currentIndex = tagList.findIndex((item) => item === currentTag)
        const prevTag = tagList[currentIndex - 1]
        const nextTag = tagList[currentIndex + 1]

        // the tag's offsetLeft after of nextTag
        const afterNextTagOffsetLeft =
          nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing

        // the tag's offsetLeft before of prevTag
        const beforePrevTagOffsetLeft =
          prevTag.$el.offsetLeft - tagAndTagSpacing

        if (
          afterNextTagOffsetLeft >
          $scrollWrapper.scrollLeft + $containerWidth
        ) {
          $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
        } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
          $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
        }
      }
    },
  },
  beforeDestroy() {
    this.scrollWrapper.removeEventListener('scroll', this.emitScroll)
  },
}
</script>

<style lang="scss" scoped>
.scroll-box {
  width: 100%;
  display: flex;
  align-items: center;
  .scroll-container {
    padding-right: 10px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;

    ::v-deep {
      .el-scrollbar__bar {
        bottom: 0px;
      }
      .el-scrollbar__wrap {
        height: 49px;
        margin-bottom: 0 !important;
        margin-right: 0 !important;
        overflow: hidden;
        .el-scrollbar__view {
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
