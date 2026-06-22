/**
 * 跨平台 preinstall 钩子
 * - 确保 node_modules 目录存在
 * - 将 node_modules-zc-framework-ui.zip 解压到 node_modules/（zc-framework-ui 私有框架包）
 * 兼容 Windows（PowerShell Expand-Archive）与 macOS / Linux（系统 unzip）
 * 仅使用 Node 内置模块，保证在 node_modules 尚未安装时也能运行
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()
const nodeModulesDir = path.join(root, 'node_modules')
const zipFile = path.join(root, 'node_modules-zc-framework-ui.zip')

// 1. 确保 node_modules 目录存在（等价于 mkdir -p）
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir, { recursive: true })
}

// 2. zip 资产不存在则跳过（兼容未携带该资产的环境）
if (!fs.existsSync(zipFile)) {
  process.exit(0)
}

// 3. 按平台选择解压方式
try {
  if (process.platform === 'win32') {
    // Windows：调用 PowerShell Expand-Archive 解压
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${zipFile}' -DestinationPath '${nodeModulesDir}' -Force"`,
      { stdio: 'inherit' }
    )
  } else {
    // macOS / Linux：调用系统 unzip
    execSync(`unzip -o "${zipFile}" -d "${nodeModulesDir}"`, { stdio: 'inherit' })
  }
} catch (err) {
  console.error('[preinstall] 解压 zc-framework-ui 失败：', err.message)
  process.exit(1)
}
