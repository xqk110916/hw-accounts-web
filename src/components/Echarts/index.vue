<template lang="html">
  <div class="charts-box" :id="id">{{id}}</div>
</template>

<script>
export default {
  name: 'ECharts',
  data() {
    return {
    };
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  mounted() {
    console.log(this.options)
    let chart = this.$echarts.init(document.getElementById(this.id))
    let _this = this
    setTimeout(()=>{
      chart.setOption(_this.options);
    }, 300)
    window.addEventListener('resize',function() {chart.resize()});
  },
  methods: {
  },
};
</script>

<style lang="scss">
.charts-box{
  width: 100%;
  height: 100%;
}
</style>
