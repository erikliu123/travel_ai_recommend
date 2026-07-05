---
name: city-guide
description: 为旅游城市生成 AI 详细攻略 HTML 页面。使用 bl text chat 生成包含行程安排、景点、美食、住宿、交通等内容的专业旅游攻略。当用户要求为某个城市生成攻略、制作旅游指南、或提到 /city-guide 时使用。
---

# 城市旅游攻略生成器

为旅游城市生成专业的 AI 详细攻略 HTML 页面，类似扬州攻略的风格。

## 使用方式

```
/city-guide <城市名称>
```

示例：`/city-guide 伊春`、`/city-guide 青岛`

## 工作流程

### Step 1: 提取城市数据

从 `src/data/cities.ts` 中读取目标城市的完整数据：

```bash
# 用 grep 定位城市数据块，然后 read_file 读取完整内容
grep -n "城市id:" src/data/cities.ts
```

需要提取的字段：
- `name` / `province` / `description`
- `attractions`（景点列表）
- `pros` / `cons`
- `transport`（交通信息）
- `suggestedDays`（建议天数）
- `bestMonths` / `budgetLevel` / `tags`

### Step 2: 构造 prompt 并生成 HTML

1. 运行辅助脚本构造 messages JSON：

```bash
bash .qoder/skills/city-guide/scripts/build-prompt.sh "<城市名称>"
```

脚本会自动从 `cities.ts` 提取数据并生成 `/tmp/city-guide-messages.json`。

2. 使用 `bl text chat` 生成攻略：

```bash
bl text chat \
  --model qwen3.6-plus \
  --max-tokens 8192 \
  --timeout 300 \
  --messages-file /tmp/city-guide-messages.json \
  --output text \
  > guides/<city-id>-guide.html
```

### Step 3: 验证输出

```bash
# 检查文件是否生成且非空
ls -la guides/<city-id>-guide.html
# 在浏览器中打开预览
open guides/<city-id>-guide.html
```

### Step 4: 后续集成（提示用户）

生成完成后，提示用户：

1. 将 HTML 文件上传到 cloud.iflow.cn 获取公开 URL
2. 在 `src/data/cities.ts` 中为该城市添加 `guideUrl` 字段
3. 在 `src/components/AIGuides.tsx` 中添加攻略卡片条目

```typescript
// cities.ts 中添加
guideUrl: 'https://cloud.iflow.cn/sites/...',

// AIGuides.tsx 中添加
{
  id: '<city-id>',
  city: '<城市名>',
  title: '<城市名>旅游攻略',
  url: '<guideUrl>',
  icon: '<emoji>',
  description: '<一句话描述>',
},
```

## HTML 攻略要求

生成的 HTML 必须包含以下板块：

| 板块 | 说明 |
|------|------|
| 城市概述 | 城市简介 + 标签 badges |
| 每日行程 | 按天划分的时间线（上午/下午/晚上） |
| 景点详情 | 每个景点的介绍、推荐理由、Tips、门票 |
| 美食推荐 | 当地特色菜品 + 推荐餐厅 |
| 住宿推荐 | 不同档次（经济/舒适/高端）的酒店建议 |
| 交通指南 | 如何到达 + 市内交通 |
| 注意事项 | 天气、穿着、安全、高反等 |
| 预算参考 | 交通/住宿/餐饮/门票的费用估算 |

### HTML 样式规范

- 完整 HTML 文档，可直接在浏览器打开
- 内联 CSS 样式，不依赖外部资源
- 响应式设计（手机 + 电脑）
- 配色方案与城市特色匹配（如森林城市用绿色、海滨城市用蓝色）
- 中文内容，专业旅游网站风格

## 配色参考

| 城市类型 | 主色调 | 适用城市示例 |
|----------|--------|-------------|
| 森林/自然 | #2d6a4f 森林绿 | 伊春、阿尔山、恩施 |
| 海滨 | #0077b6 海洋蓝 | 青岛、大连、威海 |
| 草原 | #606c38 草原绿 | 呼伦贝尔、甘南、伊犁 |
| 历史/文化 | #774930 古铜色 | 泰安、承德、南京 |
| 高原/雪山 | #4a6fa5 高原蓝 | 九寨沟、西宁、丽江 |
| 异域/海外 | #e07a5f 暖橘色 | 北海道、圣托里尼、巴黎 |

## 注意事项

- 如果 `bl` 命令未安装，先运行 `npm install -g bailian-cli`
- 确保已认证：`bl auth status`
- `--max-tokens` 设为 8192 以确保生成完整的 HTML
- 生成后务必在浏览器中预览确认效果
