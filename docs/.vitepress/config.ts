import { defineConfig } from 'vitepress'
import { defineConfigWithTheme } from 'vitepress'

export default defineConfig({
  title: 'Vue.js 设计与实现',
  description: '《Vue.js 设计与实现》笔记',
  base: '/vue-design',
  srcDir: 'src',
  outDir: '../dist',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/design/art' },
      {
        text: '相关链接',
        items: [
          { text: 'Vue.js 文档', link: 'https://vuejs.org' },
          { text: 'Vue.js 2 文档', link: 'https://v2.vuejs.org' }
        ]
      },
      { text: 'Github', link: 'https://github.com/coddingus/vue-design' },
    ],
    sidebar: {
      '/guide/': [{
        text: '框架设计概览',
        children: [
          { text: '权衡的艺术', link: '/guide/design/art' },
          { text: '框架设计的核心要素', link: '/guide/design/elements' },
          { text: 'Vue.js 3 的设计思路', link: '/guide/design/thinking' }
        ]
      },{
        text: '响应系统',
        children: [
          { text: '响应系统的作用与实现', link: '/guide/reactivity/function-and-realization' },
          { text: '非原始值的响应式方案', link: '/guide/reactivity/non-original' },
          { text: '原始值的响应式方案', link: '/guide/reactivity/original' }
        ]
      }],
    },
    search: true
  },

})