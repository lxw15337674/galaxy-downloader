# 通用媒体下载器

这是一个基于 [Next.js](https://nextjs.org) 开发的通用媒体下载工具，支持从 Bilibili、抖音、小红书等平台下载视频和音频。

## 功能特点

- 🎵 支持 Bilibili 视频/音频下载
- 🎬 支持抖音无水印视频下载及音频提取
- 📷 支持小红书视频笔记和图文笔记下载
- 🔍 自动识别平台链接
- 🎨 现代化的用户界面设计
- 💾 本地下载历史记录
- 🌍 多语言支持（简体中文、繁体中文、英文）

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可看到应用界面。

## 使用方法

1. 复制视频链接（支持 Bilibili、抖音、小红书等平台）
2. 粘贴到输入框中
3. 点击解析按钮
4. 选择下载音频或视频
5. 等待下载完成，文件会自动保存

### 支持的链接格式

- **Bilibili**: `https://www.bilibili.com/video/BV...` 或 `https://b23.tv/...`
- **抖音**: `https://www.douyin.com/...` 或 `https://v.douyin.com/...`
- **小红书**: `https://www.xiaohongshu.com/explore/...` 或 `https://xhslink.com/...`

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- FFmpeg.wasm (浏览器端音频提取)
- JSZip (图片打包下载)

## 本地开发

1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## SEO 配置

部署时建议配置以下环境变量，避免预发环境被收录并确保 canonical 正确：

- `NEXT_PUBLIC_SITE_URL`: 当前环境站点地址（例如 `https://downloader.bhwa233.com`）
- `SEO_INDEXABLE`: 是否允许索引，`true` / `false`

默认策略：

- 在 Vercel 生产环境自动允许索引
- 在预览环境默认不允许索引
- 可通过 `SEO_INDEXABLE` 显式覆盖

## SEO 监控建议

建议每周检查以下指标，持续验证本仓库内的 SEO 配置是否生效：

1. Search Console 的 `索引页面` 与 `未编入索引原因`
2. `sitemap.xml` 提交状态与抓取成功率
3. Core Web Vitals（LCP、INP、CLS）趋势
4. 重点页面（首页、FAQ、Guides）的展示量与点击量
5. 多语言页面的 `hreflang` 与 canonical 是否一致

## 部署

推荐使用 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署，它是 Next.js 的创建者提供的托管服务。

更多部署相关信息，请查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
