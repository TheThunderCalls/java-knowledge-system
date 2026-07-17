# 个人博客

> VuePress
>
> 官网文档：https://v1.vuepress.vuejs.org/zh/guide/
>
> 部署 github 访问网址：https://thethundercalls.github.io/

环境准备、项目初始化、Java 知识体系配置、推送 GitHub 与自动部署

## 快速上手

### 安装

#### 依赖环境

- Node.js
  - VuePress 依赖 Node.js 运行
  - 下载地址：https://nodejs.org/zh-cn/download
  - 包管理器：npm、pnpm、yarn等
- Git
  - git部署到GitHub
  - 下载地址：https://git-scm.com/install/windows



### 创建项目

#### 命令行创建

```bash
npm init vuepress vuepress-starter
```



#### 手动创建

1] 创建项目目录

2] 初始化项目

```bash
git init
# 永久切换到 淘宝 NPM 镜像 (npmmirror)
npm config set registry https://registry.npmmirror.com
# 安装 pnpm
npm install -g pnpm

pnpm init
```

3] 安装vuepress

```bash
# 安装 vuepress
pnpm add -D vuepress@next vue
# 安装打包工具和主题
pnpm add -D @vuepress/bundler-vite@next @vuepress/theme-default@next
```

4] 创建 `docs` 目录和 `docs/.vuepress` 目录

```bash
mkdir docs
mkdir docs/.vuepress
```

5] 创建 VuePress 配置文件 `docs/.vuepress/config.js`

```js
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme(),
})	
```

6] 创建文档

```bash
echo '# Hello VuePress' > docs/README.md
```

### 目录结构

```
├─ docs
│  ├─ .vuepress
│  │  └─ config.js
│  └─ README.md
└─ package.json
```

> `docs` 目录是你放置 Markdown 文件的地方，它同时也会作为 VuePress 的源文件目录

> `docs/.vuepress` 目录，即源文件目录下的 `.vuepress` 目录，是放置所有和 VuePress 相关的文件的地方。当前这里只有一个配置文件。默认还会在该目录下生成临时文件、缓存文件和构建输出文件，建议把它们添加到 `.gitignore` 文件中