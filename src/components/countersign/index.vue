<!--
 * @Descripttion: 
 * @Author: zhangkai
 * @Date: 2024-03-21 09:30:22
 * @LastEditors: zhangkai
 * @LastEditTime: 2024-03-26 10:59:07
-->
<!--
 * @Author: wangguixing
 * @Date: 2023-09-07 15:28:25
 * @LastEditors: zhangkai
 * @LastEditTime: 2024-03-22 14:04:30
 * @FilePath: \party-construction-web\src\components\partyCustTitle\index.vue
-->
<template>
  <div :class="configProps.setting.custHidden ? 'countersign' : ''">
    <!-- 详情 -->
    <div class="counter" v-if="formRenderType == 'DETAIL_PAGE' || assemblyProps.readonly">
      <!-- {{ assemblyProps.defaultValue }} -->
      <div class="counter_item" v-for="(item, index) in assemblyProps.defaultValue" :key="index">
        <p>
          {{ item.comments }}
        </p>
        <div class="counter_left">
          <span v-for="(items, indexs) in item.approval" :key="indexs">{{ items.name }}</span>
          <span>{{ item.approvaltime }}</span>
        </div>
      </div>
    </div>
    <!-- 新增编辑 -->
    <div v-else class="counter">
      <div class="counter_item" v-for="(item, index) in oldformData" :key="index">
        <p>
          {{ item.comments }}
        </p>
        <div class="counter_left">
          <span v-if="item.approval.length > 0" v-for="(items, indexs) in item.approval" :key="indexs">{{ items.name }}</span>
          <span>{{ item.approvaltime }}</span>
        </div>
      </div>
      <div>
        <!-- <div class="counter_font">
          <span style="width: 80px">审批意见：</span> -->
        <el-input v-bind="{ ...setting }" type="textarea" v-model="comments" placeholder="请输入审批意见" @change="changecomment"></el-input>
        <!-- </div> -->

        <div class="counter_sign">
          <!-- <span class="counter_sign_left">审批人：</span> -->
          <theme-peoplePicker
            v-bind="{ ...peopleSetting, ...setting, styleProp: { height: '32px' } }"
            v-model="approval"
            @input="projectManagerInput"
          ></theme-peoplePicker>
          <!-- <span class="counter_sign_left">审批日期：</span> -->
          <el-date-picker
            v-bind="{ ...setting }"
            v-model="approvaltime"
            style="width: 46%"
            type="datetime"
            placeholder="选择日期时间"
            @change="timeChange"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request';

export default {
  name: 'countersign',
  props: {
    drawingWidgetList: Array,
    configProps: Object,
  },
  data() {
    return {
      assemblyProps: {},
      val: '',
      comments: '',
      approval: [],
      approvaltime: '',
      peopleSetting: {
        treeRequest: query => request({ url: '/base/selector/listChild', method: 'get', params: { ...query } }),
        listUserByNode: query => request({ url: '/base/selector/filter/listUserByNode', method: 'post', data: { ...query } }),
        userListSearch: query => request({ url: '/base/selector/filter/search', method: 'post', data: { ...query } }),
        multiple: true,
      },
      componentsId: 'f_2341727',
      setting: {},
      oldformData: {},
    };
  },
  inject: ['formRenderType', 'formConfig', 'getLowcodeFormData', 'getLowcodeEngineData'],
  watch: {
    configProps: {
      immediate: true,
      handler(v, o) {
        console.log(v, o, '让他有');
        if (v.tag !== 'countersign') {
          return;
        }
        this.setting = v.setting;
        this.assemblyProps = {
          ...v,
          ...v.setting,
        };
      },
    },
    currentFormData: {
      deep: true,
      handler(v, o) {
        console.log(v, o, '如图儿童椅');
        if (v !== o) {
          const { componentsDbField, setting } = this.configProps;
        }
      },
    },
    currentEngineData: {
      deep: true,
      handler(v, o) {
        console.log(v, o, '而特特');
        if (v !== o) {
          const { componentsDbField, setting } = this.configProps;
        }
      },
    },
    val: {
      deep: true,
      handler(v, o) {
        console.log(v, '电饭锅电饭锅');
        this.$emit('configChange', { ...this.configProps, defaultValue: v });
      },
    },
  },
  computed: {
    currentFormData() {
      if (this.getLowcodeFormData && typeof this.getLowcodeFormData === 'function') {
        const config = this.getLowcodeFormData();
        console.log(config, '发给很过分');
        if (config) {
          return config;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    },
    currentEngineData() {
      if (this.getLowcodeEngineData && typeof this.getLowcodeEngineData === 'function') {
        const config = this.getLowcodeEngineData();

        if (config.formData) {
          console.log(config, '获取到数据');
          this.oldformData = JSON.parse(config.formData[this.assemblyProps.componentsId]);
          return config;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    },
  },
  mounted() {},
  methods: {
    projectManagerInput(val) {
      console.log(val, this.assemblyProps, '发给大富大贵1');
      this.qulist();
    },
    changecomment(val) {
      console.log(val, this.assemblyProps, '发给大富大贵2');
      this.qulist();
    },
    timeChange() {
      console.log(this.approvaltime, this.assemblyProps, '发给大富大贵3');
      this.qulist();
    },
    qulist() {
      let v = [
        {
          comments: this.comments,
          approval: this.approval,
          approvaltime: this.approvaltime,
        },
      ];
      console.log(v, '发给大富大贵4');
      if (this.comments != '' && this.approval.length > 0 && this.approvaltime != '') {
        this.$emit('configChange', { ...this.configProps, defaultValue: v });
      } else {
        this.$emit('configChange', { ...this.configProps, defaultValue: '' });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep {
  .theme-peoplepicker__wrapper {
    width: 46%;
  }
}
.counter {
  border: 1px solid #dcdfe6;
  padding: 10px;
  .counter_item {
    display: flex;
    align-items: center;
    height: 96px;
    padding: 0 10px;
    margin-bottom: 15px;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
    border: 1px dashed #dcdfe6;
    p {
      width: 80%;
    }
    .counter_left {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 20%;
    }
  }
  .counter_font {
    font-size: 13px;
    color: #666;
    display: flex;
  }
  .counter_sign {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    width: 100%;
    .counter_sign_left {
      width: 80px;
      font-size: 13px;
      color: #666;
    }
  }
}
</style>
