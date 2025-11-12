import { defaultTheme } from '@vuepress/theme-default'
import { path } from '@vuepress/utils'
import { viteBundler } from '@vuepress/bundler-vite'

export default {
  title: '我的博客',
  description: '使用VuePress搭建的个人博客',
  
  // 基础路径，部署到GitHub Pages时需要修改为仓库名称
  // 例如：如果你的仓库是 username.github.io/your-repo，则设置为 '/your-repo/'
  base: '/my-blog/',
  
  // 使用Vite作为bundler
  bundler: viteBundler(),
  
  // 主题配置
  theme: defaultTheme({
    // 导航栏
    navbar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '文章',
        link: '/posts/',
      },
      {
        text: '关于',
        link: '/about/',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/Panjiebin13/my-blog',
      },
    ],
    
    // 侧边栏
    sidebar: 'auto',
    
    // 编辑链接
    editLink: false,
    
    // 最后更新时间
    lastUpdated: false,
    
    // 贡献者
    contributors: false,
  }),
  
  // 插件配置
  plugins: [
    // 搜索插件
    [
      '@vuepress/plugin-search',
      {
        locales: {
          '/': {
            placeholder: '搜索',
          },
        },
      },
    ],
    
    // 返回顶部插件
    '@vuepress/plugin-back-to-top',
  ],
  
  // 构建配置
  dest: 'docs',
  
  // 开发服务器配置
  host: '0.0.0.0',
  port: 8080,
}