# LessonCraft-AI 项目重构设计方案

## 概述

对厦门市第九中学教案本（LessonCraft-AI）项目进行重构，主要解决代码结构混乱、API 密钥硬编码、教学环节固定不可扩展等问题。

## 目标

1. API 密钥 XOR 混淆加密存储
2. 清理项目遗留文件（oldsrc/、硬编码密钥）
3. JS 模块化（ES Module，职责拆分）
4. 教学环节动态增删
5. 环境变量配置（config.js + config.example.js）

## 目录结构

```
LessonCraft-AI/
├── index.html                  # 改用 <script type="module" src="js/main.js">
├── styles.css                  # 不变
├── config.js                   # 环境变量（已 gitignore）
├── config.example.js           # 配置示例（供参考，提交 Git）
├── .gitignore                  # 忽略 config.js
├── js/
│   ├── main.js                 # 入口模块，初始化所有功能
│   ├── core/
│   │   ├── navigation.js       # 导航高亮 + 平滑滚动
│   │   ├── persistence.js      # localStorage 持久化（API Key XOR 加解密）
│   │   ├── data.js             # 数据收集、JSON 导入导出
│   │   └── date.js             # 日期显示
│   ├── ai/
│   │   ├── api.js              # DeepSeek API 调用（从 config.js 读取配置）
│   │   └── generation.js       # AI 生成 UI 绑定
│   ├── pdf/
│   │   └── export.js           # PDF 导出（含 HTML 模板）
│   ├── ui/
│   │   └── teaching-process.js # 教学环节动态增删
│   └── utils/
│       ├── crypto.js           # XOR 混淆 + Base64 加解密工具
│       └── config-loader.js    # 加载 config.js 配置
```

## 模块设计与数据流

### 入口 main.js
- DOMContentLoaded → 依次调用各模块的 `init()`
- 暴露 `clearAllData()`, `exportData()`, `importData()`, `printLessonPlan()` 到全局

### core/navigation.js
- 监听滚动事件，高亮当前导航链接
- 为锚点链接绑定平滑滚动，考虑导航栏高度偏移

### core/date.js
- 填充封面日期显示

### utils/crypto.js
- `generateKey()` — 生成随机 16 位密钥
- `encrypt(text, key)` — XOR 加密 + Base64 编码
- `decrypt(encoded, key)` — Base64 解码 + XOR 解密
- 存储流程：密钥存 sessionStorage（标签页级存活），API Key 加密后存 localStorage

### core/persistence.js
- 读取/保存所有表单数据到 localStorage
- 对 `api-key` 字段：读时解密，写时加密
- 教学环节行：动态遍历所有行，不限制固定数量
- 兼容旧版本数据格式

### utils/config-loader.js
- 动态加载 `config.js`（通过 import），提供默认值兜底

### ai/api.js
- `callDeepSeekAPI(apiKey, coverData)` — 调用 DeepSeek API
- 从 config-loader 获取 API URL、模型、temperature、max_tokens

### ai/generation.js
- 绑定 AI 生成按钮事件
- 验证必填项（学科、年级）
- 显示/隐藏加载状态
- 填充 AI 返回内容到表单

### ui/teaching-process.js
- 添加"添加环节"和"删除环节"按钮
- 新增行：克隆模板行，动态递增索引
- 删除行：删除最后一行（至少保留一行）
- 持久化适配动态行

### pdf/export.js
- 收集所有表单数据（含动态行）
- 生成 HTML 模板
- iframe + srcdoc + print 导出 PDF

### data.js
- collectLessonData()，exportToJSON()，importFromJSON()
- 与 PDF 导出的数据收集逻辑统一，避免重复

## 清理清单

- 删除 `oldsrc/` 目录
- 删除 `script-core.js`
- 删除 `script-ai.js`
- 删除硬编码 API Key（`script-ai.js:22`）
- `index.html` 移除旧的 `<script>` 标签，新增 `<script type="module">`

## 配置管理

### config.js（gitignore）
```js
export const CONFIG = {
  API_BASE_URL: 'https://api.deepseek.com/v1',
  API_MODEL: 'deepseek-chat',
  API_TEMPERATURE: 0.7,
  API_MAX_TOKENS: 4000,
  DEFAULT_TOPIC_PREFIX: '教学',
  STORAGE_PREFIX: 'lessonPlan_',
};
```

### .gitignore
```
config.js
```

## 不受影响的部分

- UI/样式（styles.css 完全不变）
- 页面结构（index.html 仅修改 script 引用）
- 交互行为（用户操作流程不变）
