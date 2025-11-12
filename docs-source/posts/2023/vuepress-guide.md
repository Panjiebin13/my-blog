# VuePress入门指南

> 发布时间：2023-07-15

## 什么是VuePress

VuePress是一个以Vue驱动的静态网站生成器，它使用Markdown作为内容格式，并利用Vue组件系统来构建页面。

## 核心特性

1. **Markdown扩展**：支持在Markdown中使用Vue组件
2. **Vue驱动**：享受Vue + webpack开发环境带来的所有便利
3. **性能优秀**：每个页面预渲染为静态HTML，具有极好的加载性能
4. **SEO友好**：服务器端渲染(SSR)有利于搜索引擎优化
5. **插件系统**：丰富的插件生态，可以轻松扩展功能

## 快速开始

### 安装

```bash
# 全局安装
npm install -g vuepress@next

# 或者在项目中安装
npm install -D vuepress@next
```

### 基本用法

1. 创建项目目录结构：

```
.
├── docs
│   ├── .vuepress
│   │   └── config.js
│   └── README.md
└── package.json
```

2. 在`docs/README.md`中写入内容：

```markdown
# Hello VuePress

---
home: true
actionText: 开始使用
actionLink: /guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 开发环境带来的所有便利，又可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 将每个页面预渲染为静态的 HTML，同时每个页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
```

3. 在`docs/.vuepress/config.js`中配置：

```javascript
module.exports = {
  title: '我的网站',
  description: '这是我的网站描述'
}
```

4. 启动开发服务器：

```bash
vuepress dev docs-source
```

## 配置文件详解

VuePress的配置文件位于`docs/.vuepress/config.js`，主要配置项包括：

- `title`：网站标题
- `description`：网站描述
- `base`：部署的基础路径
- `theme`：主题配置
- `plugins`：插件配置

## 主题定制

VuePress提供了默认主题，也支持自定义主题。默认主题的主要配置项包括：

- `navbar`：导航栏配置
- `sidebar`：侧边栏配置
- `editLink`：编辑链接配置
- `lastUpdated`：最后更新时间配置

## 插件使用

VuePress有丰富的插件生态，常用的插件包括：

- `@vuepress/plugin-search`：搜索功能
- `@vuepress/plugin-back-to-top`：返回顶部
- `@vuepress/plugin-medium-zoom`：图片缩放

## 总结

VuePress是一个强大而灵活的静态网站生成器，特别适合构建技术文档和个人博客。它的学习曲线平缓，文档完善，社区活跃，是一个值得尝试的工具。