#!/bin/bash
# parallel-generate.sh - 并行生成城市攻略（5个同时）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$PROJECT_ROOT"

mkdir -p public/guides

# 提取待生成的城市列表
CITIES_JSON=$(python3 -c "
import re, os, json

with open('src/data/cities.ts', 'r') as f:
    content = f.read()

blocks = re.split(r'(?=^  \w)', content, flags=re.MULTILINE)

existing = set()
for f in os.listdir('public/guides'):
    if f.endswith('-guide.html'):
        existing.add(f.replace('-guide.html', ''))

seen_names = set()
cities = []
skip_ids = ['spring', 'summer', 'autumn', 'winter', 'mayday', 'national', 
            'springfestival', 'zhejiang', 'transport']

for block in blocks:
    id_match = re.match(r'^  (\w+):\s*\{', block)
    if not id_match:
        continue
    city_id = id_match.group(1)
    if city_id in skip_ids:
        continue
    before_attr = block.split('attractions')[0] if 'attractions' in block else block
    name_match = re.search(r\"name:\s*'([^']+)'\", before_attr)
    if not name_match:
        continue
    city_name = name_match.group(1)
    if city_id in existing:
        continue
    if city_name in seen_names:
        continue
    seen_names.add(city_name)
    cities.append({'id': city_id, 'name': city_name})

print(json.dumps(cities, ensure_ascii=False))
")

TOTAL=$(echo "$CITIES_JSON" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "📋 共 $TOTAL 个城市待生成"
echo "🚀 并行数: 5"
echo ""

# 生成函数
generate_city() {
    local city_id=$1
    local city_name=$2
    local output="public/guides/${city_id}-guide.html"
    local temp_json="/tmp/city-guide-${city_id}.json"
    
    # 构造 prompt
    if bash .qoder/skills/city-guide/scripts/build-prompt.sh "$city_name" > /dev/null 2>&1; then
        cp /tmp/city-guide-messages.json "$temp_json"
        
        # 生成 HTML
        if bl text chat \
            --model qwen3.6-plus \
            --max-tokens 8192 \
            --timeout 300 \
            --messages-file "$temp_json" \
            --output text \
            > "$output" 2>/dev/null; then
            
            if [ -s "$output" ]; then
                local size=$(wc -c < "$output")
                echo "✅ $city_name ($city_id) - ${size} bytes"
                rm -f "$temp_json"
                return 0
            fi
        fi
        rm -f "$output" "$temp_json"
    fi
    echo "❌ $city_name ($city_id)"
    return 1
}

export -f generate_city

# 并行执行（5个一组）
echo "$CITIES_JSON" | python3 -c "
import sys, json
cities = json.load(sys.stdin)
for c in cities:
    print(f\"{c['id']}|{c['name']}\")
" | xargs -P 5 -I {} bash -c '
    IFS="|" read -r city_id city_name <<< "{}"
    generate_city "$city_id" "$city_name"
'

echo ""
echo "=========================================="
echo "✅ 并行生成完成"
echo "已生成: $(ls public/guides/*.html 2>/dev/null | wc -l) 个攻略"
echo "=========================================="
