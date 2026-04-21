---
name: dict-create
description: 快速创建字典项 - 根据用户提供的字典名称、值、编码等信息，通过项目API接口创建字典项
user_invocable: true
---

# 字典项创建技能

当用户需要创建字典项时，按以下流程操作：

## 1. 收集信息

向用户询问以下必要信息（如果用户未提供）：

- **fullName**: 字典名称（必填）
- **dictValue**: 字典值（必填，默认与 bizCode 相同）
- **bizCode**: 业务编码（必填，默认与 dictValue 相同）
- **parentId**: 父级ID（可选，默认 "0" 表示顶层字典分类）
- **sortNum**: 排序号（可选，默认 99）
- **enableFlag**: 是否启用（可选，默认 1）
- **description**: 描述（可选，默认空）

如果用户一次性提供了多个字典项（如用逗号分隔），则批量创建。

## 2. 确保 API 文件存在

检查 `src/api/common/dictionary.js` 是否存在。如果不存在，创建该文件：

```javascript
import request from '@/utils/request';

export function getDictionaryList(params) {
  return request({ url: '/base/dictionary/list', method: 'get', params });
}

export function addDictionary(data) {
  return request({ url: '/base/dictionary', method: 'post', data });
}

export function updateDictionary(id, data) {
  return request({ url: `/base/dictionary/${id}`, method: 'put', data });
}

export function deleteDictionary(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'delete' });
}

export function getDictionaryDetail(id) {
  return request({ url: `/base/dictionary/${id}`, method: 'get' });
}
```

## 3. 创建字典项

通过 node 脚本调用接口创建，需要用户提供 token 信息（从浏览器 Cookies 中获取 `tokenName` 和 `tokenValue`）。

### 关键规则

- **dictType 区分**：
  - 顶层字典分类（parentId 为 "0"）：`dictType: 'category'`
  - 子级字典项（parentId 为具体父级ID）：`dictType: '1'`
- **防重复提交**：后端有防重复提交机制，每条请求之间需间隔至少 **3秒**
- **创建顺序**：先创建父级分类，查询获取其 ID，再创建子项
- **认证方式**：请求头中添加 `{ [tokenName]: tokenValue }`，tokenName 和 tokenValue 从浏览器 Cookies 获取

### 脚本模板

```javascript
const axios = require('axios');
const BASE_URL = 'http://10.10.41.179:40000/api'; // 读取 .env.development 中的 VUE_APP_BASE_API
const TOKEN_NAME = '<tokenName>';
const TOKEN_VALUE = '<tokenValue>';

const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', [TOKEN_NAME]: TOKEN_VALUE }
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function create(item) {
  const payload = {
    parentId: item.parentId || '0',
    fullName: item.fullName,
    dictValue: item.dictValue || item.bizCode,
    bizCode: item.bizCode || item.dictValue,
    sortNum: item.sortNum || 99,
    enableFlag: 1,
    description: '',
    dictType: item.parentId && item.parentId !== '0' ? '1' : 'category'
  };
  const res = await http.post('/base/dictionary', payload);
  console.log(res.data.code === 1 ? '+ ' + item.fullName : 'x ' + item.fullName + ' - ' + res.data.msg);
  return res.data.code === 1;
}

async function findParentId(keyword) {
  const res = await http.get('/base/dictionary/list', { params: { keyword } });
  const list = res.data.data?.list || [];
  const found = list.find(d => d.fullName === keyword && d.parentId === '0');
  return found ? found.id : null;
}

// 用法: 先创建父级，sleep(3000)，查询父级ID，再逐条创建子项（每条间隔3秒）
```

## 4. 执行完成后

- 输出创建结果
- 删除临时脚本文件
- 验证数据：通过 `GET /base/dictionary/list?parentId=<父级ID>` 查询子项确认

## 接口参考

- 基础地址: `.env.development` 中的 `VUE_APP_BASE_API`
- 新增: `POST /base/dictionary`
- 查询分类列表: `GET /base/dictionary/list?keyword=xxx`
- 查询子项列表: `GET /base/dictionary/list?parentId=xxx`
- 查询详情: `GET /base/dictionary/{id}`
- 修改: `PUT /base/dictionary/{id}`
- 删除: `DELETE /base/dictionary/{id}`

## 已创建的字典项

| 分类 | bizCode | 子项 |
|------|---------|------|
| 物料类型 | materialType | 原材料(raw)、成品(product)、半成品(semi-product) |
| 货架类型 | shelfType | 5排3层2m*10m(5-3-2-10)、5排4层2m*10m(5-4-2-10)、5排5层2m*10m(5-5-2-10)、5排6层2m*10m(5-6-2-10) |
| 平衡区类型 | balanceAreaType | 本地(local)、代存(proxy) |
