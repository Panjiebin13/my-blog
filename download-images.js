const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 配置
const docsSourceDir = path.join(__dirname, 'docs-source');
const publicDir = path.join(docsSourceDir, '.vuepress', 'public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

// 从命令行参数获取要处理的文件路径
const targetFile = process.argv[2]; // 第一个命令行参数

// 确保public目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`创建目录: ${publicDir}`);
}

// 递归查找所有Markdown文件
function findMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (path.extname(item).toLowerCase() === '.md') {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// 从Markdown文件中提取图片URL
function extractImageUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const urls = [];

  // 匹配 ![alt](url) 格式的图片
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const url = match[2];

    // 只处理HTTP/HTTPS URL，跳过相对路径和绝对路径
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.push({
        url,
        alt: match[1],
        fullMatch: match[0]
      });
    }
  }

  return urls;
}

// 下载图片并返回本地文件名
function downloadImage(url, altText) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    // 从URL生成文件名
    let filename = '';

    // 尝试从URL中获取文件名
    const urlPath = parsedUrl.pathname;
    const lastSegment = urlPath.split('/').pop();

    if (lastSegment && lastSegment.includes('.')) {
      // 如果URL路径中已有文件名和扩展名，使用它
      filename = lastSegment;
    } else {
      // 否则，使用alt文本或生成一个随机文件名
      const cleanAlt = altText.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 20);
      filename = cleanAlt || 'image';

      // 根据Content-Type添加扩展名（如果可能）
      // 这里默认使用.jpg，实际下载后可能需要调整
      filename += '.jpg';
    }

    // 确保文件名唯一
    let finalFilename = filename;
    let counter = 1;

    while (fs.existsSync(path.join(publicDir, finalFilename))) {
      const nameWithoutExt = path.parse(filename).name;
      const ext = path.parse(filename).ext;
      finalFilename = `${nameWithoutExt}_${counter}${ext}`;
      counter++;
    }

    const filePath = path.join(publicDir, finalFilename);
    const fileStream = fs.createWriteStream(filePath);

    protocol.get(url, (response) => {
      // 检查重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // 递归处理重定向
        return downloadImage(response.headers.location, altText)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP状态码: ${response.statusCode}`));
      }

      // 根据Content-Type调整文件扩展名
      const contentType = response.headers['content-type'];
      if (contentType) {
        let ext = '';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          ext = '.jpg';
        } else if (contentType.includes('png')) {
          ext = '.png';
        } else if (contentType.includes('gif')) {
          ext = '.gif';
        } else if (contentType.includes('svg')) {
          ext = '.svg';
        } else if (contentType.includes('webp')) {
          ext = '.webp';
        }

        if (ext && !finalFilename.endsWith(ext)) {
          // 关闭当前文件流，删除文件，使用新扩展名重新创建
          fileStream.destroy();
          fs.unlinkSync(filePath);

          const nameWithoutExt = path.parse(finalFilename).name;
          finalFilename = nameWithoutExt + ext;
          const newFilePath = path.join(publicDir, finalFilename);

          // 确保新文件名唯一
          let newCounter = 1;
          while (fs.existsSync(newFilePath)) {
            finalFilename = `${nameWithoutExt}_${newCounter}${ext}`;
            newFilePath = path.join(publicDir, finalFilename);
            newCounter++;
          }

          const newFileStream = fs.createWriteStream(newFilePath);
          response.pipe(newFileStream);

          newFileStream.on('finish', () => {
            console.log(`下载完成: ${url} -> ${finalFilename}`);
            resolve(finalFilename);
          });

          newFileStream.on('error', reject);
          return;
        }
      }

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        console.log(`下载完成: ${url} -> ${finalFilename}`);
        resolve(finalFilename);
      });

      fileStream.on('error', reject);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 更新Markdown文件中的图片链接
function updateMarkdownFile(filePath, imageReplacements) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (const replacement of imageReplacements) {
    content = content.replace(replacement.originalMatch, replacement.newMatch);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

// 主函数
async function main() {
  try {
    console.log('开始处理...');

    let markdownFiles = [];

    if (targetFile) {
      // 如果指定了目标文件，只处理该文件
      const fullPath = path.resolve(targetFile);
      if (fs.existsSync(fullPath) && path.extname(fullPath).toLowerCase() === '.md') {
        markdownFiles = [fullPath];
        console.log(`处理指定文件: ${fullPath}`);
      } else {
        console.error(`指定的文件不存在或不是Markdown文件: ${targetFile}`);
        process.exit(1);
      }
    } else {
      // 否则处理所有Markdown文件
      markdownFiles = findMarkdownFiles(docsSourceDir);
      console.log(`找到 ${markdownFiles.length} 个Markdown文件`);
    }

    let totalImagesDownloaded = 0;
    let totalFilesUpdated = 0;

    // 处理每个Markdown文件
    for (const filePath of markdownFiles) {
      const imageUrls = extractImageUrls(filePath);

      if (imageUrls.length === 0) {
        console.log(`文件 ${path.relative(docsSourceDir, filePath)} 中没有找到图片URL`);
        continue;
      }

      console.log(`处理文件: ${path.relative(docsSourceDir, filePath)} (${imageUrls.length} 张图片)`);

      const replacements = [];

      // 下载每张图片
      for (const imageInfo of imageUrls) {
        try {
          const filename = await downloadImage(imageInfo.url, imageInfo.alt);

          // 创建新的Markdown图片链接
          const newMatch = `![${imageInfo.alt}](/${filename})`;

          replacements.push({
            originalMatch: imageInfo.fullMatch,
            newMatch
          });

          totalImagesDownloaded++;
        } catch (error) {
          console.error(`下载图片失败: ${imageInfo.url} - ${error.message}`);
        }
      }

      // 更新Markdown文件
      if (replacements.length > 0) {
        updateMarkdownFile(filePath, replacements);
        totalFilesUpdated++;
        console.log(`更新文件: ${path.relative(docsSourceDir, filePath)}`);
      }
    }

    console.log('\n处理完成!');
    console.log(`总共下载图片: ${totalImagesDownloaded} 张`);
    console.log(`更新文件: ${totalFilesUpdated} 个`);
    console.log(`图片保存在: ${publicDir}`);

  } catch (error) {
    console.error('处理过程中发生错误:', error);
  }
}

// 运行脚本
main();
