/*
 * @Author: MingWei.Wu <wu_mingwei@yeah.net>
 * @Copyright: 2021-present, ZhongCheng, Inc. All rights reserved.
 * @Date: 2021-11-29 13:36:13
 * @LastEditTime: 2021-11-29 14:07:29
 * @LastEditors: MingWei.Wu
 */

// 提示信息(  成功<绿色>-警告<黄色>-危险<红色>  )
export const msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'success' });
};

export const msgWarning = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'warning' });
};

export const msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'error' });
};
