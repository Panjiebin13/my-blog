---
title: VuePress 2 中数学公式渲染问题解决方案
date: 2023-12-01
tags:
  - VuePress
  - 数学公式
  - KaTeX
  - 前端开发
---

# VuePress 2 中数学公式渲染问题解决方案

## 问题描述

在 VuePress 2 中渲染数学公式时，可能会遇到以下问题：
- 数学公式显示为原始 Markdown 格式（如 `$a^2 + b^2 = c^2$`）
- 使用官方推荐的 `@vuepress/plugin-markdown-math` 插件时出现版本冲突
- ESM 模块系统与 CommonJS 插件不兼容

## 问题分析

### 根本原因

1. **版本冲突**：`@vuepress/plugin-markdown-math` 已被官方废弃，其依赖的 `vuepress@2.0.0-rc.11` 与项目中安装的 `vuepress@2.0.0-rc.26` 不兼容。

2. **模块系统不兼容**：VuePress 2 使用 ESM 模块系统，而 `@mdit/plugin-katex` 是 CommonJS 模块，导致导入方式不兼容。

3. **配置方式错误**：在 VuePress 2 中，应该使用 `extendsMarkdown` 而不是 `markdown.config` 来配置 Markdown 插件。

## 解决方案

### 1. 卸载废弃插件

首先，卸载已废弃的 `@vuepress/plugin-markdown-math` 插件：

```bash
npm uninstall @vuepress/plugin-markdown-math
```

### 2. 安装官方推荐的 KaTeX 插件

安装官方推荐的 `@mdit/plugin-katex` 和 `katex`：

```bash
npm install -D @mdit/plugin-katex katex
```

### 3. 修改 VuePress 配置文件

在 `.vuepress/config.js` 中添加以下配置：

```javascript
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default {
  title: '我的博客',
  description: '使用VuePress搭建的个人博客',
  base: '/my-blog/',
  bundler: viteBundler(),
  
  theme: defaultTheme({
    // ... 主题配置
  }),
  
  plugins: [
    // ... 其他插件
  ],
  
  // 关键修改：异步加载 katexPlugin
  extendsMarkdown: async (md) => {
    const { katex } = await import('@mdit/plugin-katex')
    md.use(katex)
  },
  
  // 引入KaTeX样式
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
      }
    ]
  ],
  
  // ... 其他配置
}
```

### 4. 使用数学公式

现在，你可以在 Markdown 文件中使用数学公式了：

```markdown
# 数学公式测试

这是行内公式: $a^2 + b^2 = c^2$

这是块级公式:

$$
E = mc^2
$$
```

## 关键点解析

### 1. 为什么使用 `extendsMarkdown` 而不是 `markdown.config`？

在 VuePress 2 中，`extendsMarkdown` 是正确的方式来扩展 Markdown 功能，而 `markdown.config` 可能不会被正确调用。

### 2. 为什么使用动态导入？

由于 VuePress 2 使用 ESM 模块系统，而 `@mdit/plugin-katex` 是 CommonJS 模块，直接导入会导致兼容性问题。使用动态导入 `import('@mdit/plugin-katex')` 可以解决这个问题。

### 3. 为什么解构 `katex` 而不是使用默认导出？

查看 `@mdit/plugin-katex` 的源码可以发现，它导出的是一个名为 `katex` 的函数，而不是默认导出。因此，我们需要使用解构赋值来获取这个函数。

## 验证方法

1. 在 Markdown 文件中添加数学公式
2. 运行 `npm run build` 构建网站
3. 检查生成的 HTML 文件，确认数学公式是否被正确渲染

## 常见问题

### Q: 构建时出现 "Cannot read properties of undefined (reading 'apply')" 错误

A: 这通常是因为导入方式不正确。确保使用 `const { katex } = await import('@mdit/plugin-katex')` 而不是 `const katexPlugin = await import('@mdit/plugin-katex')`。

### Q: 数学公式仍然显示为原始 Markdown 格式

A: 检查以下几点：
1. 确认 `extendsMarkdown` 配置正确
2. 确认 KaTeX CSS 样式表已正确引入
3. 检查是否有其他插件干扰了数学公式渲染

## 总结

通过以上步骤，我们成功解决了 VuePress 2 中数学公式渲染的问题。关键在于：

1. 使用官方推荐的 `@mdit/plugin-katex` 插件
2. 正确配置 ESM 和 CommonJS 模块的兼容性
3. 使用 `extendsMarkdown` 而不是 `markdown.config`

希望这个解决方案能帮助到遇到类似问题的开发者！