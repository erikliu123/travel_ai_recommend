#!/bin/bash
# build-prompt.sh - 从 cities.ts 提取城市数据并构造 bl text chat 的 messages JSON
# 用法: bash build-prompt.sh <城市中文名>
# 示例: bash build-prompt.sh 伊春

set -euo pipefail

CITY_NAME="${1:?请提供城市名称，如: bash build-prompt.sh 伊春}"
CITIES_FILE="src/data/cities.ts"
OUTPUT_FILE="/tmp/city-guide-messages.json"
PROJECT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
CITIES_PATH="$PROJECT_ROOT/$CITIES_FILE"

if [ ! -f "$CITIES_PATH" ]; then
  echo "错误: 找不到 $CITIES_FILE" >&2
  exit 1
fi

# 用 Python 从 cities.ts 提取城市数据并生成 messages JSON
python3 - "$CITIES_PATH" "$CITY_NAME" << 'PYEOF'
import sys, json, re

cities_path = sys.argv[1]
city_name = sys.argv[2]

with open(cities_path, 'r') as f:
    content = f.read()

# 找到城市数据块：从 "  cityId: {" 到下一个 "  word: {" 或 "export"
# 先通过 name 找到城市
name_pattern = re.compile(r"^\s+(\w+):\s*\{[^}]*name:\s*'" + re.escape(city_name) + "'", re.MULTILINE)
m = name_pattern.search(content)
if not m:
    print(f"错误: 找不到城市 '{city_name}'", file=sys.stderr)
    sys.exit(1)

city_id = m.group(1)
start = m.start()

# 找城市块结尾（下一个同级 key）
rest = content[m.end():]
next_block = re.search(r'^\s{2}\w+:\s*\{|^export ', rest, re.MULTILINE)
end = m.end() + next_block.start() if next_block else len(content)
city_block = content[start:end]

def extract_str(field):
    p = re.search(field + r":\s*'([^']*)'", city_block)
    return p.group(1) if p else ''

def extract_num(field):
    p = re.search(field + r':\s*(\d+)', city_block)
    return int(p.group(1)) if p else 0

def extract_array(field):
    p = re.search(field + r":\s*\[([^\]]*)\]", city_block)
    if not p:
        return []
    return re.findall(r"'([^']*)'", p.group(1))

name = extract_str('name')
province = extract_str('province')
description = extract_str('description')
best_months = extract_str('bestMonths')
suggested_days = extract_num('suggestedDays')
budget_level = extract_num('budgetLevel')
tags = extract_array('tags')
pros = extract_array('pros')
cons = extract_array('cons')

# 景点
attractions = []
attr_block = re.search(r'attractions:\s*\[(.*?)\],\s*\n', city_block, re.DOTALL)
if attr_block:
    for am in re.finditer(r"name:\s*'([^']*)',\s*description:\s*'([^']*)'", attr_block.group(1)):
        attractions.append((am.group(1), am.group(2)))

# 交通
transport = {}
for field in ['flight', 'train', 'trainNote']:
    p = re.search(field + r":\s*'([^']*)'", city_block)
    if p:
        transport[field] = p.group(1)

# 根据标签自动判断配色
def pick_color(tags):
    tag_str = '、'.join(tags)
    if any(k in tag_str for k in ['海边', '海滨', '度假']):
        return '海滨蓝色(#0077b6)'
    elif '草原' in tag_str:
        return '草原绿色(#606c38)'
    elif any(k in tag_str for k in ['森林', '自然', '避暑']):
        return '森林绿色(#2d6a4f)'
    elif any(k in tag_str for k in ['历史', '文化', '古迹']):
        return '古铜色(#774930)'
    elif any(k in tag_str for k in ['高原', '雪山']):
        return '高原蓝色(#4a6fa5)'
    else:
        return '森林绿色(#2d6a4f)'

color_theme = pick_color(tags)

# 构造景点文本
attr_text = ''
for i, (aname, adesc) in enumerate(attractions, 1):
    attr_text += f'{i}. {aname} - {adesc}\n'

# 构造 prompt
user_prompt = f"""请为【{name}】生成一份详细的夏季旅游攻略 HTML 页面。

城市基本信息：
- 名称：{name}（{province}）
- 简介：{description}
- 建议游玩天数：{suggested_days}天
- 最佳月份：{best_months}
- 预算级别：{budget_level}（1=经济 2=适中 3=较高）
- 标签：{'、'.join(tags)}

推荐景点：
{attr_text}
优点：{'、'.join(pros)}
缺点：{'、'.join(cons)}

交通信息：
- 飞机：{transport.get('flight', '无直达')}
- 高铁：{transport.get('train', '无直达')}
- 备注：{transport.get('trainNote', '')}

请生成一份完整的 HTML 旅游攻略页面，要求：
1. 使用中文
2. 风格类似专业旅游网站的攻略页面
3. 包含以下板块：
   - 城市概述（含标签 badges）
   - {suggested_days}天详细行程安排（每天的时间线：上午/下午/晚上）
   - 每个景点的详细介绍（含推荐理由、游玩Tips、门票信息）
   - 美食推荐（当地特色菜品和推荐餐厅）
   - 住宿推荐（经济/舒适/高端不同档次）
   - 交通指南（如何到达、市内交通）
   - 注意事项（天气、穿着、安全等）
   - 预算参考（交通/住宿/餐饮/门票费用估算）
4. HTML 需是完整的、可直接在浏览器打开的页面
5. 使用内联 CSS 样式，设计美观现代
6. 配色以{color_theme}为主色调，呼应{name}的旅游特色
7. 响应式设计，适配手机和电脑
8. 不要使用任何外部图片链接，用 CSS 渐变或纯色代替

请直接输出完整的 HTML 代码，不要包含 markdown 代码块标记。"""

messages = [
    {
        "role": "system",
        "content": "你是一位资深旅游规划师，擅长为中国热门旅游目的地制作详细的旅游攻略。你的攻略内容详实、实用性强，包含具体的时间安排、费用参考和实用Tips。请直接输出 HTML 代码，不要包裹在 markdown 代码块中。"
    },
    {
        "role": "user",
        "content": user_prompt
    }
]

output_file = '/tmp/city-guide-messages.json'
with open(output_file, 'w') as f:
    json.dump(messages, f, ensure_ascii=False, indent=2)

print(f'✅ messages JSON 已生成: {output_file}')
print(f'📍 城市: {name} ({city_id})')
print(f'🎨 配色主题: {color_theme}')
print(f'📝 景点数: {len(attractions)} | 标签: {"、".join(tags)}')
print(f'👍 优点: {len(pros)} | 👎 缺点: {len(cons)}')
print()
print(f'下一步运行：')
print(f'  bl text chat --model qwen3.6-plus --max-tokens 8192 --messages-file {output_file} --output text > guides/{city_id}-guide.html')
PYEOF
