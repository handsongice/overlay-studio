#!/bin/bash
# ============================================================
# Overlay Studio · Windows 一键打包脚本（macOS 上交叉打包）
# 用法：./scripts/package-win.sh
# 产物：release/Overlay Studio-win32-x64.zip（解压后双击 exe 即用）
# 说明：从华为云镜像下载 Electron 运行时（比 GitHub 快很多）
# ============================================================
set -e
cd "$(dirname "$0")/.."

echo "==> 1/4 构建 Web 产物"
npm run build

VER="40.10.2"
ZIP="/private/tmp/electron-win-${VER}.zip"
URL="https://mirrors.huaweicloud.com/electron/${VER}/electron-v${VER}-win32-x64.zip"
OUT="release/Overlay Studio-win32-x64"

echo "==> 2/4 下载 Windows 运行时（华为云镜像）"
if [ ! -f "$ZIP" ]; then
  curl -L --fail -o "$ZIP" "$URL"
fi

echo "==> 3/4 组装应用"
rm -rf "$OUT"
mkdir -p "$OUT"
unzip -q "$ZIP" -d "$OUT"
mkdir -p "$OUT/resources/app"
cp -R dist "$OUT/resources/app/dist"
cp -R electron "$OUT/resources/app/electron"
cat > "$OUT/resources/app/package.json" <<JSON
{
  "name": "overlay-studio",
  "version": "0.1.0",
  "private": true,
  "main": "electron/main.cjs",
  "description": "Overlay Studio — 特效叠加工作台"
}
JSON
mv "$OUT/electron.exe" "$OUT/Overlay Studio.exe"

echo "==> 4/4 压缩为 zip"
rm -f "release/Overlay Studio-win32-x64.zip"
ditto -c -k --sequesterRsrc --keepParent "$OUT" "release/Overlay Studio-win32-x64.zip"

echo "完成：release/Overlay Studio-win32-x64.zip"
