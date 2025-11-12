# GitHub Actions 配置

## 问题背景

在执行 `npm run build` 命令时，遇到了 Node.js 版本与 string-width 包不兼容的问题，导致构建失败。

### 错误信息
```
node_modules/string-width/index.js:16
throw new SyntaxError(`Invalid regular expression flags`);
^

SyntaxError: Invalid regular expression flags
```

### 错误原因
- 本地 Node.js 版本为 v22.13.0
- GitHub Actions 中使用的 Node.js 版本与 string-width 包不兼容
- 需要在 GitHub Actions 中明确指定 Node.js 版本

## 解决方案

创建 GitHub Actions 工作流文件，显式设置 Node.js 版本为 22。

### 实施步骤

1. 创建 `.github/workflows` 目录
2. 创建 `deploy.yml` 工作流文件
3. 配置工作流以使用 Node.js 22

### 工作流配置

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js 22
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
```

## 配置说明

### 触发条件
- 推送到 main 分支时
- 创建针对 main 分支的 pull request 时

### 工作流程
1. 检出代码
2. 设置 Node.js 22 环境
3. 安装依赖项
4. 构建项目
5. 部署到 GitHub Pages（仅在 main 分支）

### 关键配置点
- 明确指定 Node.js 版本为 '22'
- 使用 npm 缓存加速构建过程
- 仅在 main 分支时执行部署步骤

## 验证方法

1. 将代码推送到 GitHub
2. 检查 Actions 标签页中的工作流运行情况
3. 确认构建过程没有 Node.js 版本兼容性错误
4. 验证网站是否成功部署到 GitHub Pages

## 预期效果

1. 解决 Node.js 版本兼容性问题
2. 确保构建过程稳定可靠
3. 自动化部署流程，提高开发效率

## 后续建议

1. 定期更新 Node.js 版本以保持最新安全更新
2. 考虑添加构建测试步骤，确保代码质量
3. 监控构建性能，优化工作流程