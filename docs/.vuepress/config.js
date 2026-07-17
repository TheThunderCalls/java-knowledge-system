import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  // ===== GitHub Pages 关键配置（普通仓库必填）=====
  base: '/java-knowledge-system/',
  title: 'Java 知识体系',
  description: 'Java 学习笔记',
  bundler: viteBundler(),
  theme: defaultTheme(),
})