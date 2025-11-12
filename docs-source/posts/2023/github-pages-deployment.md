# GitHub Pages部署教程

> 发布时间：2023-06-30

## 什么是GitHub Pages

GitHub Pages是GitHub提供的静态网页托管服务，可以直接从GitHub仓库中的文件托管个人、组织或项目的网站。

## 部署方式

### 方式一：使用GitHub Actions自动部署

1. 在项目根目录创建`.github/workflows/deploy.yml`文件：

```yaml
name: Build and Deploy
on:
  push:
    branches:
      - main
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-source/.vuepress/dist
```

2. 在GitHub仓库设置中启用GitHub Pages：
   - 进入仓库的Settings页面
   - 找到Pages选项
   - Source选择"gh-pages branch"
   - 保存设置

### 方式二：使用手动部署脚本

1. 创建部署脚本`deploy.sh`：

```bash
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs-source/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

cd -
```

2. 给脚本添加执行权限：

```bash
chmod +x deploy.sh
```

3. 运行部署脚本：

```bash
npm run deploy
```

## 配置VuePress

在`docs/.vuepress/config.js`中配置`base`路径：

```javascript
module.exports = {
  // 如果部署到 https://<USERNAME>.github.io/<REPO>/
  base: '/<REPO>/',
  
  // 其他配置...
}
```

## 自定义域名

如果你想使用自定义域名，可以在GitHub仓库的根目录或`docs`目录下创建`CNAME`文件，内容为你的域名：

```
yourdomain.com
```

## 常见问题

### 1. 页面样式丢失

通常是因为`base`路径配置不正确，确保`config.js`中的`base`与你的GitHub Pages路径匹配。

### 2. 404错误

检查你的文件路径和链接是否正确，确保所有文件都已正确部署。

### 3. 构建失败

检查你的Node.js版本和依赖是否正确安装，查看构建日志获取更多信息。

## 总结

GitHub Pages是部署静态博客的绝佳选择，特别是对于使用VuePress构建的博客。通过GitHub Actions可以实现自动化部署，大大简化了发布流程。