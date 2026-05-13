# AI 协作实践记录 - 旅游攻略网站开发

## 项目概述

从零开始构建一个从杭州出发的旅游攻略组合网站，使用 React + Vite + Tailwind CSS + TypeScript 技术栈，部署到阿里云服务器。

**项目地址**: `/Users/liujiahong/travel`
**服务器**: `root@118.31.106.132:8080`
**技术栈**: React 18 + Vite 6 + Tailwind CSS + TypeScript + Nginx

---

## 完整对话历史与实践要点

### Phase 1: 项目初始化

**用户需求**:
> 帮我做一个旅游的攻略组合网站：分春夏秋冬，每个季节选出10个城市，以及五一假和国庆假也要单独选，可以选重复的城市，要求：1. 每个城市要有典型景点介绍和风光照、2. 这个城市的优缺点 3. 从杭州出发的时间（飞机/高铁）

**实践要点**:
- 使用 `ImageGen` 工具为每个城市生成风景照（banner + 城市图）
- 设计系统使用 CSS 自定义属性 + `data-season` 属性实现动态主题切换
- 数据结构设计：`CityInfo` 接口包含 attractions[], pros[], cons[], transport 等字段

### Phase 2: 云服务器部署

**用户需求**:
> 帮我把这个在云服务器上也部署下

**实践过程**:
1. 初始 SSH 到 `admin@118.31.106.132` 失败（仅支持密钥认证）
2. 用户提供 `ssh root@118.31.106.132` 成功
3. 阿里云 Linux 3 服务器，Nginx 1.20.1，Node v20.20.0
4. 构建后部署到 `/var/www/travel-guide`，Nginx 端口 8080

**部署命令**:
```bash
npm run build
ssh root@118.31.106.132 "rm -rf /var/www/travel-guide/*"
scp -r dist/* root@118.31.106.132:/var/www/travel-guide/
```

**经验教训**: 首次部署需要先确认服务器的用户认证方式，不要假设密码认证可用。

### Phase 3: 新增春节假期 + 浙里游

**用户需求**:
> 在帮我补充一个春节假期的旅游攻略吧，然后再有一个浙里游，浙江内部的旅游资源总结

**实践要点**:
- 扩展 `SeasonKey` 类型：添加 `'springfestival' | 'zhejiang'`
- 生成 2 张新 banner 图片
- 各添加 10 个城市数据
- 更新 `SeasonNav` 组件的颜色配置

### Phase 4: 图片缺失问题排查

**用户反馈**:
> 长白山和大连、腾冲的图有缺失，请补充

**第一次尝试**: 生成图片并上传到 public 目录，用户仍看不到
> 好像我还是没看到最新的图，还有扬州，承德的图也弄一下

**关键 Bug 发现**:
> 按照你说的还是没有图片，你是不是不会改前端啊

**根因分析**:
- `cities.ts` 中 `image` 字段为空字符串 `''`
- 前端逻辑：`image` 为空时显示渐变色占位符，不渲染 `<img>`
- 生成了图片文件但数据文件中路径未更新

**修复方案**: 使用 Python 脚本批量更新所有空 image 字段为正确路径
```python
# 批量修复 image 字段
for city in cities_to_fix:
    pattern = rf"(id: '{city}',.*?image: )''(,)"
    content = re.sub(pattern, rf"\1'/images/cities/city-{city}.png'\2", content, flags=re.DOTALL)
```

**经验教训**: 生成图片后必须同步更新数据文件中的引用路径，不能只放文件。

### Phase 5: 春节城市优化

**用户反馈**:
> 春节假期的城市选的很敷衍。描述的最佳时间都对不上，重新选一下吧

**实践要点**: 需要根据季节特点选择城市，不能随意拼凑。

后续用户要求:
> 春节不要推荐北京、重庆旅游，再选两个城市，然后广州和凤凰古城缺图片

- 生成广州、凤凰古城图片
- 用开封、大理（春节版）替换北京、重庆

### Phase 6: CDN 加速

**用户需求**: 给图片开 CDN 加速

**选择方案**: Nginx 缓存优化
- HTML: no-cache
- 图片: 1小时缓存 + must-revalidate（原30天 immutable）
- 静态资源: 7天 immutable

### Phase 7: 浙里游优化

**用户反馈**:
> 浙里游里面，也有一些不对，普陀山包括在舟山里面了吧，再选一个地方

- 移除 putuoshan（与 zhoushan 重复）
- 添加安吉（anji）

### Phase 8: 新增国外城市

**用户需求**:
> 春夏秋冬和长期里，再新增5个国外旅游城市推荐

**实践**:
- 添加 11 个国外城市：京都、北海道、圣托里尼、曼谷、马尔代夫、皇后镇、巴黎、阿姆斯特丹、罗马、济州岛、新加坡
- 每个季节分配不同的 5 个国外城市
- 生成 11 张国外城市风景照

### Phase 9: 个性化定制

**用户需求**:
> 所有成都和武汉的推荐都去掉，我在这两个地方呆了太久

- 从所有季节中移除 chengdu、wuhan
- 用其他城市替代（重庆、杭州→北海等）
- 从 `allCities` 中删除这两个城市的数据

### Phase 10: 多轮迭代优化

**用户需求**:
> 1. 浙里游不需要有外国城市
> 2. 五一假期、国庆、春节的国外城市推荐有点雷同，最好去重
> 3. 国外城市也需要拉一些图片
> 4. 春季的杭州也需要去除掉，换成新的，只有浙里游里面才能有浙江城市

**实践要点**:
- 浙里游保持纯国内（纯浙江）
- 三个假期的国外城市各自不同组合
- 春季移除杭州（浙江城市），新增北海（广西）
- 生成所有国外城市 + 北海的图片

### Phase 11: 用户体验大升级

**用户给出的客观测评问题**:
1. 分类缺失：未对目的地进行分类
2. 无响应式适配：仅适配桌面端
3. 无交互反馈：卡片 hover 无动效
4. 无搜索/筛选功能
5. 无辅助功能：缺少返回顶部、分页等

**实现方案**:

**1. 分类标签系统**
- 给 `CityInfo` 添加 `tags?: string[]` 字段
- 为所有城市添加 3 个标签（如 "海边度假"、"亲子游"、"赏花胜地"）
- 使用 Python 脚本批量更新 71 个城市数据

**2. 搜索筛选组件**
- 创建 `SearchFilter.tsx`：搜索框 + 标签筛选 + 结果计数
- 支持按名称、省份、景点搜索
- 支持按标签筛选

**3. 响应式布局**
- 手机：2列网格，卡片高度自适应
- 平板：2-3列
- 桌面：3-4列
- 所有组件添加 `sm:` `md:` 断点适配

**4. 交互动效**
- 卡片 hover：上浮 4px + 阴影加深 + 图片放大 10%
- 卡片点击：scale(0.95) 按下反馈
- 添加 `active:scale-95` 类

**5. 辅助功能**
- `ScrollToTop.tsx`：滚动 400px 后显示返回顶部按钮
- 分页：每页 8 个，"加载更多"按钮
- 空状态友好提示

**新增文件**:
- `src/components/SearchFilter.tsx`
- `src/components/ScrollToTop.tsx`

**修改文件**:
- `src/components/CityGrid.tsx`（搜索、筛选、分页逻辑）
- `src/components/CityCard.tsx`（标签展示、响应式、交互动效）
- `src/components/HeroBanner.tsx`（响应式优化）
- `src/components/SeasonNav.tsx`（响应式优化）
- `src/components/CityModal.tsx`（响应式优化）
- `src/App.tsx`（添加 ScrollToTop）
- `src/index.css`（优化 city-card hover 效果）
- `src/data/cities.ts`（添加 tags 字段）

### Phase 12: 性能优化

**用户测评**:
> 1. Banner轮播优化：当前仅单张Banner，无轮播效果
> 2. 图片加载性能优化：Banner大图未做压缩，部分卡片图片分辨率过高

**实现方案**:

**1. 图片 WebP 转换**
- 使用 Pillow 将所有 PNG 转为 WebP
- Banner: 2MB → 220KB（减少 88%）
- 城市图片: 2MB → 80KB（减少 95%）
- 总体积减少约 90%

**2. Banner 轮播**
- 重写 `HeroBanner.tsx` 为轮播组件
- 每个季节 3 张图（1 banner + 2 城市风景）
- 5秒自动轮播
- hover 显示左右切换箭头
- 底部圆点指示器
- 淡入淡出切换效果
- 非首图懒加载

**3. 数据更新**
- `seasonInfo` 添加 `banners: string[]` 字段
- 所有 image/banner 路径从 .png 改为 .webp

---

## 关键经验总结

### 1. 数据与视图一致性
**问题**: 生成图片后忘记更新数据文件，导致前端不显示
**教训**: 任何资源文件的生成/移动都必须同步更新数据引用

### 2. 批量操作技巧
**最佳实践**: 使用 Python + regex 批量更新 TypeScript 数据文件
```python
import re
content = re.sub(pattern, replacement, content, flags=re.DOTALL)
```

### 3. 部署流程标准化
```bash
# 1. 本地构建
npm run build

# 2. 清理远程目录
ssh root@HOST "rm -rf /var/www/travel-guide/*"

# 3. 上传构建产物
scp -r dist/* root@HOST:/var/www/travel-guide/

# 4. 上传新图片（如有）
scp public/images/**/*.webp root@HOST:/var/www/travel-guide/images/
```

### 4. 响应式设计原则
- 移动优先：基础样式针对手机，用 `sm:` `md:` `lg:` 逐步增强
- 网格布局：`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- 间距适配：`p-3 sm:p-4 md:p-6`
- 字体大小：`text-sm sm:text-base md:text-lg`

### 5. 性能优化 checklist
- [ ] 图片转 WebP/AVIF
- [ ] 图片懒加载 (`loading="lazy"`)
- [ ] 首屏图片优先加载 (`loading="eager"`)
- [ ] 合理压缩比（banner 80%，卡片 75%）
- [ ] Nginx gzip 压缩
- [ ] 静态资源缓存策略

### 6. 用户反馈驱动开发
- 不要预设用户需求，严格按反馈迭代
- 每次修改后验证效果
- 保持简洁，避免过度设计

---

## 技术决策记录

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 状态管理 | useState vs Redux vs Context | useState | 简单场景不需要全局状态 |
| 样式方案 | Tailwind vs CSS Modules vs styled-components | Tailwind CSS | 快速开发，设计系统统一 |
| 部署方式 | Vercel vs 自建 Nginx vs Docker | Nginx | 已有云服务器，可控性强 |
| 图片格式 | WebP vs AVIF vs JPEG | WebP | 浏览器兼容性好，压缩率高 |
| 分页方案 | 传统分页 vs 无限滚动 vs 加载更多 | 加载更多 | 移动端友好，实现简单 |
| 轮播实现 | 手动 vs 第三方库 | 手动实现 | 功能简单，不需要重型库 |

---

## 项目文件结构

```
travel/
├── public/images/
│   ├── banner-*.webp          # 季节 banner（8个 × 220KB）
│   └── cities/
│       └── city-*.webp        # 城市图片（71个 × 80KB）
├── src/
│   ├── components/
│   │   ├── App.tsx            # 主应用
│   │   ├── HeroBanner.tsx     # 轮播横幅
│   │   ├── SeasonNav.tsx      # 季节导航
│   │   ├── CityGrid.tsx       # 城市网格 + 搜索筛选 + 分页
│   │   ├── CityCard.tsx       # 城市卡片
│   │   ├── CityModal.tsx      # 城市详情弹窗
│   │   ├── SearchFilter.tsx   # 搜索筛选组件
│   │   ├── ScrollToTop.tsx    # 返回顶部
│   │   └── Footer.tsx         # 页脚
│   ├── data/
│   │   └── cities.ts          # 所有城市数据（71个城市）
│   └── index.css              # 设计系统 + CSS 变量
├── dist/                      # 构建产物
└── vibe_images/               # ImageGen 原始输出
```

---

## 数据统计

- **城市总数**: 71（国内 + 国外）
- **季节/假期分类**: 8个（春夏秋冬、五一、国庆、春节、浙里游）
- **国外城市**: 11个（日本×2、希腊、泰国、马尔代夫、新西兰、法国、荷兰、意大利、韩国、新加坡）
- **分类标签**: 20+ 种（海边度假、草原风光、亲子游等）
- **生成图片**: 80+ 张
- **代码文件**: 12 个核心文件
- **部署次数**: 15+ 次

---

*记录时间: 2026-04-16*
*协作 AI: Qoder*
