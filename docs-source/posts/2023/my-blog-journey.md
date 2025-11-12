# 我的博客搭建之旅

> 发布时间：2023-08-01

## 为什么选择VuePress

在搭建个人博客的过程中，我考虑了多种方案，包括Hexo、Jekyll、Gatsby等，最终选择了VuePress，原因如下：

1. **基于Vue.js**：我对Vue.js比较熟悉，学习成本低
2. **Markdown优先**：支持使用Markdown编写内容，非常方便
3. **静态站点生成**：加载速度快，SEO友好
4. **丰富的插件生态**：可以轻松扩展功能
5. **优秀的文档**：官方文档详细，上手容易

## 搭建过程

### 1. 初始化项目

首先创建项目目录并初始化npm：

```bash
mkdir vuepress-blog
cd vuepress-blog
npm init -y
```

### 2. 安装VuePress

```bash
npm install -D vuepress@next
```

### 3. 创建基本目录结构

```
.
├── docs/
│   ├── .vuepress/
│   │   └── config.js
│   ├── README.md
│   └── posts/
└── package.json
```

### 4. 配置VuePress

在`docs/.vuepress/config.js`中配置博客的基本信息、导航栏和侧边栏。

### 5. 编写内容

使用Markdown格式编写博客文章，放在`docs/posts/`目录下。

### 6. 本地预览

```bash
npm run dev
```

### 7. 构建部署

```bash
npm run build
```

## 部署到GitHub Pages

1. 在GitHub上创建一个新的仓库
2. 修改`config.js`中的`base`配置为仓库名称
3. 使用GitHub Actions或手动部署脚本将构建后的文件推送到`gh-pages`分支

## 总结

通过VuePress搭建博客的过程非常顺利，整个系统运行稳定，编写体验良好。如果你也想搭建一个个人博客，我推荐尝试VuePress。