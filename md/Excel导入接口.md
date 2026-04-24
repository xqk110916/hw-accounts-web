# 入库--导入Excel文件

- 接口路径：`/api/busin/excelImport/import`
- 请求方法：`POST`
- 接口说明：支持xls和xlsx两种格式，导入类型支持：inbound（入库）

## 请求参数

| 参数名 | 说明 | 类型 | 必填 |
|--------|------|------|------|
| file | 文件 | file | ✅ |
| importType | 导入类型：inbound（入库）、outbound（出库） | string | ✅ |
| goodCodes | 材料编码，多个用`,`分隔 | string | ❌ |
| inboundImportType | 入库导入类型（1-2），只针对入库操作：1-信息导入1、2-信息导入2 | integer | ❌ |
| sheetIndex | sheet索引，从0开始 | integer | ❌ |
| sheetName | sheet名称 | string | ❌ |
| taskNum | 任务编号 | string | ❌ |

## 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | OK |
| 201 | Created |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |

## 响应结果

返回 `ImportResultVO` 对象
