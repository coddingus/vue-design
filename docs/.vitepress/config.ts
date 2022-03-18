import { defineConfigWithTheme } from 'vitepress'
import type { Config as ThemeConfig } from '@vue/theme'
import baseConfig from '@vue/theme/config'
import path from 'path'
const nav = [
  { text: '首页', link: '/'},
  {
    text: '指南', link: '/guide/design/art', activeMatch: `^/guide/`,
  },
  {
    text: '相关链接',
    items: [
      { text: 'Vue.js 文档', link: 'https://vuejs.org' },
      { text: 'Vue.js 2 文档', link: 'https://v2.vuejs.org' }
    ]
  },
  { text: 'Github', link: 'https://github.com/coddingus/vue-design' },
]
const sidebar = {
  '/guide/': [{
    text: '框架设计概览',
    items: [
      { text: '权衡的艺术', link: '/guide/design/art'},
      { text: '框架设计的核心要素', link: '/guide/design/elements' },
      { text: 'Vue.js 3 的设计思路', link: '/guide/design/thinking' }
    ]
  }, {
    text: '响应系统',
    items: [
      { text: '响应系统的作用与实现', link: '/guide/reactivity/function-and-realization' },
      { text: '非原始值的响应式方案', link: '/guide/reactivity/non-original' },
      { text: '原始值的响应式方案', link: '/guide/reactivity/original' }
    ]
  }, {
    text: '渲染器',
    items: [
      { text: '渲染器的设计与实现', link: '/guide/render/design-and-implementation' },
      { text: '挂载与更新', link: '/guide/render/mount-and-update' },
      { text: '简单 Diff 算法', link: '/guide/render/simple-diff' },
      { text: '双端 Diff 算法', link: '/guide/render/double-ended-diff' },
      { text: '快速 Diff 算法', link: '/guide/render/fast-diff'}
    ]
  }, {
    text: '组件化',
    items: [
      { text: '组件的实现原理', link: '/guide/components/principle' },
      { text: '异步组件与函数式组件', link: '/guide/components/async-and-function' },
      { text: '内建组件和模块', link: '/guide/components/built-in-components-and-modules' }
    ]
  }, {
    text: '编译器',
    items: [
      { text: '编译器核心技术概览', link: '/guide/compile/overview' },
      { text: '解析器', link: '/guide/compile/parser' },
      { text: '编译优化', link: '/guide/compile/optimization' }
    ]
  },{
    text: '服务端渲染',
    items: [
      { text: '同构渲染', link: '/guide/ssr/isomorphic-rendering' }
    ]
  }],
}
export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  title: 'Vue.js 设计与实现',
  description: '《Vue.js 设计与实现》笔记',
  base: '/vue-design/',
  srcDir: 'src',
  outDir: '../dist',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  themeConfig: {
    // logo: '/logo.svg',
    nav,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/coddingus/vue-design' }
    ],


    footer: {
      copyright: `Copyright © 2022-${new Date().getFullYear()} Shibin You`
    }
  },
  vue: {
    reactivityTransform: true
  },
})

