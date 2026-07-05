#!/bin/bash
# batch-generate.sh - 批量生成所有城市攻略
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$PROJECT_ROOT"

mkdir -p public/guides

# 用 Python 提取所有城市名称（去重，跳过已有攻略的）
CITIES_JSON=$(python3 -c "
import re, os, json

with open('src/data/cities.ts', 'r') as f:
    content = f.read()

# 提取所有城市条目：找 '  id: { ... name: '城市名' }' 模式
# 匹配顶层 key 和对应的 name 字段（在 attractions 之前）
blocks = re.split(r'(?=^  \w)', content, flags=re.MULTILINE)

existing = set()
guides_dir = 'public/guides'
if os.path.isdir(guides_dir):
    for f in os.listdir(guides_dir):
        if f.endswith('-guide.html'):
            existing.add(f.replace('-guide.html', ''))

seen_names = set()
cities = []

for block in blocks:
    # 匹配城市 id
    id_match = re.match(r'^  (\w+):\s*\{', block)
    if not id_match:
        continue
    city_id = id_match.group(1)
    
    # 跳过非城市条目（季节、专题等）
    skip_ids = ['spring', 'summer', 'autumn', 'winter', 'mayday', 'national', 
                'springfestival', 'zhejiang', 'transport', 'seasonInfo', 'seasonCities',
                'allCities']
    if city_id in skip_ids:
        continue
    
    # 提取城市 name（在 attractions 之前的第一个 name 字段）
    # 截取 attractions 之前的内容
    before_attr = block.split('attractions')[0] if 'attractions' in block else block
    name_match = re.search(r\"name:\s*'([^']+)'\", before_attr)
    if not name_match:
        continue
    city_name = name_match.group(1)
    
    # 跳过已生成的
    if city_id in existing:
        continue
    # 去重（如 dali 和 dali_spring 都叫大理）
    if city_name in seen_names:
        continue
    seen_names.add(city_name)
    cities.append({'id': city_id, 'name': city_name})

print(json.dumps(cities, ensure_ascii=False))
")

TOTAL=$(echo "$CITIES_JSON" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "📋 共 $TOTAL 个城市待生成"
echo ""

SUCCESS=0
FAIL=0
INDEX=0

echo "$CITIES_JSON" | python3 -c "
import sys, json
cities = json.load(sys.stdin)
for c in cities:
    print(f\"{c['id']}|{c['name']}\")
" | while IFS='|' read -r city_id city_name; do
  INDEX=$((INDEX + 1))
  echo "=========================================="
  echo "🚀 [$INDEX/$TOTAL] 开始生成: $city_name ($city_id)"
  echo "=========================================="
  
  # Step 1: 构造 prompt
  if ! bash .qoder/skills/city-guide/scripts/build-prompt.sh "$city_name" 2>&1; then
    echo "❌ $city_name: prompt 构造失败"
    FAIL=$((FAIL + 1))
    continue
  fi
  
  OUTPUT="public/guides/${city_id}-guide.html"
  
  # 再次检查是否已存在
  if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
    echo "⏭️  $city_name: 已存在，跳过"
    SUCCESS=$((SUCCESS + 1))
    continue
  fi
  
  # Step 2: 生成 HTML
  echo "📝 正在生成 HTML..."
  if bl text chat \
    --model qwen3.6-plus \
    --max-tokens 8192 \
    --timeout 300 \
    --messages-file /tmp/city-guide-messages.json \
    --output text \
    > "$OUTPUT" 2>&1; then
    
    if [ -s "$OUTPUT" ]; then
      LINES=$(wc -l < "$OUTPUT")
      SIZE=$(wc -c < "$OUTPUT")
      echo "✅ $city_name: 成功 ($LINES 行, ${SIZE} bytes)"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "❌ $city_name: 生成文件为空"
      rm -f "$OUTPUT"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "❌ $city_name: bl text chat 失败"
    rm -f "$OUTPUT"
    FAIL=$((FAIL + 1))
  fi
  
  echo ""
  echo "📊 进度: 成功 $SUCCESS / 失败 $FAIL / 总计 $TOTAL"
  echo ""
done

echo "=========================================="
echo "📊 批量生成完成"
echo "=========================================="
echo ""
echo "已生成的攻略文件："
ls public/guides/*.html 2>/dev/null | wc -l
