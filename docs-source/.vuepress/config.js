import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default {
  title: '我的博客',
  description: '使用VuePress搭建的个人博客',
  base: '/my-blog/',
  bundler: viteBundler(),
  
  theme: defaultTheme({
    navbar: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '关于', link: '/about/' },
      { text: 'GitHub', link: 'https://github.com/Panjiebin13/my-blog' },
    ],
    sidebar: 'auto',
    editLink: false,
    lastUpdated: false,
    contributors: false,
    sidebarDepth: 2,
    subSidebar: 'auto',
  }),
  
  plugins: [
    ['@vuepress/plugin-search', { locales: { '/': { placeholder: '搜索' } } }],
    '@vuepress/plugin-back-to-top',
    ['@vuepress/plugin-toc', {
      headerDepth: 2,
      component: 'Toc',
    }],
  ],
  
  // ✅ 关键修改：异步加载 katexPlugin
  extendsMarkdown: async (md) => {
    const { katex } = await import('@mdit/plugin-katex')
    md.use(katex)
  },
  
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
      }
    ]
  ],
  
  dest: 'docs',
  host: '0.0.0.0',
  port: 8080,
}