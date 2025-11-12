@echo off
echo 正在构建VuePress站点...
npm run build

echo 正在进入生成的文件夹...
cd dist

echo 正在初始化git仓库...
git init
git add -A
git commit -m "deploy"

echo 正在推送到GitHub Pages...
git push -f https://github.com/Panjiebin13/my-blog.git main:gh-pages

echo 部署完成!
pause