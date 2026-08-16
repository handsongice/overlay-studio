import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 相对路径：构建产物可在 file:// 下直接打开（Electron 桌面应用加载）
  base: "./",
  server: { port: 5173, strictPort: true },
});
