#!/bin/bash
# ============================================================
# Overlay Studio · macOS 一键打包脚本
# 用法：./scripts/package-mac.sh
# 产物：release/Overlay Studio.app（双击即用，无需安装任何依赖）
# ============================================================
set -e
cd "$(dirname "$0")/.."

echo "==> 1/3 构建 Web 产物"
npm run build

echo "==> 2/3 打包 macOS 应用"
npx electron-packager . "Overlay Studio" \
  --platform=darwin --arch=arm64 \
  --icon=build/icon.icns \
  --out=release --overwrite --electron-version=40.10.2

echo "==> 3/3 完成"
echo "应用已生成：release/Overlay Studio.app"
echo "提示：如需 Intel Mac，把脚本中的 --arch=arm64 改为 --arch=x64 再运行。"
