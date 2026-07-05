#!/bin/bash
# batch-generate.sh - 批量生成夏季国内城市攻略
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$PROJECT_ROOT"

CITIES=("泰安" "甘南" "恩施" "六盘水" "阿尔山" "青岛" "大连" "威海" "呼伦贝尔" "九寨沟" "丽江" "承德" "贵阳" "西宁" "伊犁" "张家界")

mkdir -p guides

SUCCESS=0
FAIL=0

for city in "${CITIES[@]}"; do
  echo "=========================================="
  echo "🚀 开始生成: $city"
  echo "=========================================="
  
  # Step 1: 构造 prompt
  if ! bash .qoder/skills/city-guide/scripts/build-prompt.sh "$city" 2>&1; then
    echo "❌ $city: prompt 构造失败"
    FAIL=$((FAIL + 1))
    continue
  fi
  
  # Step 2: 提取 city id
  CITY_ID=$(python3 -c "
import re
with open('src/data/cities.ts', 'r') as f:
    content = f.read()
pattern = r'^\s+(\w+):\s*\{[^}]*name:\s*' + chr(39) + re.escape('$city') + chr(39)
m = re.search(pattern, content, re.MULTILINE)
print(m.group(1) if m else '')
")
  
  if [ -z "$CITY_ID" ]; then
    echo "❌ $city: 无法提取 city id"
    FAIL=$((FAIL + 1))
    continue
  fi
  
  OUTPUT="guides/${CITY_ID}-guide.html"
  
  # 跳过已存在的
  if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
    echo "⏭️  $city: 已存在 $OUTPUT，跳过"
    SUCCESS=$((SUCCESS + 1))
    continue
  fi
  
  # Step 3: 生成 HTML
  echo "📝 正在生成 HTML..."
  if bl text chat \
    --model qwen3.6-plus \
    --max-tokens 8192 \
    --timeout 300 \
    --messages-file /tmp/city-guide-messages.json \
    --output text \
    > "$OUTPUT" 2>&1; then
    
    # 检查文件是否非空
    if [ -s "$OUTPUT" ]; then
      LINES=$(wc -l < "$OUTPUT")
      SIZE=$(wc -c < "$OUTPUT")
      echo "✅ $city: 成功 ($LINES 行, ${SIZE} bytes) -> $OUTPUT"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "❌ $city: 生成文件为空"
      rm -f "$OUTPUT"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "❌ $city: bl text chat 失败"
    rm -f "$OUTPUT"
    FAIL=$((FAIL + 1))
  fi
  
  echo ""
done

echo "=========================================="
echo "📊 批量生成完成"
echo "✅ 成功: $SUCCESS"
echo "❌ 失败: $FAIL"
echo "=========================================="
echo ""
echo "生成的文件："
ls -la guides/*.html 2>/dev/null || echo "无文件"
