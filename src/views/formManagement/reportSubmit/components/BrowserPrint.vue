<template>
  <div class="browser-print">
    <div ref="printTarget" class="browser-print__target">
      <slot />
    </div>
  </div>
</template>

<script>
import { openBrowserPrint } from './browserPrint.js'
import { REPORT_PRINT_STYLES } from './reportPrintStyles.js'

export default {
  name: 'BrowserPrint',
  props: {
    title: {
      type: String,
      default: '打印',
    },
    styles: {
      type: String,
      default: () => REPORT_PRINT_STYLES,
    },
  },
  methods: {
    print(target) {
      const element = target || this.$refs.printTarget
      return openBrowserPrint(element, {
        title: this.title,
        styles: this.styles,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.browser-print,
.browser-print__target {
  width: 100%;
}
</style>