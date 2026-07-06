# Xiangqiground

交互式象棋棋盘 UI 库。

基于 [@lichess-org/chessground](https://github.com/lichess-org/chessground) 改写，适配象棋：棋盘改为 9 路 × 10 行，棋子角色替换为象棋角色，预走棋规则重写为象棋走法（蹩马腿、塞象眼、将帅对面等），坐标标签改为中文数字/阿拉伯数字，CSS 前缀从 `cg-` 改为 `xq-`。零依赖，不含棋规逻辑。

## 特性

- 棋盘含楚河汉界、九宫斜线、星位标记
- 拖拽走子与点击走子
- 预走棋，支持象棋走法规则（蹩马腿、塞象眼、将帅对面）
- SVG 箭头、圆圈、自定义图形
- 棋子动画（移动与淡出）
- 上一步、将军、可走位置、预走位置高亮
- FEN 导入/导出（象棋格式）
- 坐标标签：中文数字（一二三…）与阿拉伯数字（1-9）
- 随时可配置/重配置
- 纯 CSS 样式，切换 class 即可换肤
- 流式布局，随时可调整大小
- 完整移动端支持（touchstart, touchmove, touchend）
- TypeScript 类型完备

## 安装

```sh
npm install xiangqiground
```

## 用法

```ts
import { Chessground } from 'xiangqiground';
import 'xiangqiground/assets/chessground.base.css';
import 'xiangqiground/assets/chessground.board.css';
import 'xiangqiground/assets/chessground.xq.css';

const ground = Chessground(document.getElementById('board')!, {
  orientation: 'white',
  movable: { color: 'both', showDests: true },
  animation: { enabled: true, duration: 200 },
});
```

### API

```ts
ground.getFen();                // 当前局面 FEN
ground.move('b0', 'c2');        // 编程式走子
ground.toggleOrientation();     // 翻转棋盘
ground.set({ fen: 'start' });   // 重置为初始局面
ground.set({ fen: initial, lastMove: undefined }); // 重置并清除标记
```

完整文档见 [API 类型](src/api.ts) 和 [Config 类型](src/config.ts)。

### 棋子角色

| 角色 | FEN 字母 | 红方 | 黑方 |
|------|---------|------|------|
| king | k | 帅 | 将 |
| advisor | a | 仕 | 士 |
| bishop | b | 相 | 象 |
| rook | r | 俥 | 车 |
| knight | n | 傌 | 马 |
| cannon | c | 炮 | 砲 |
| pawn | p | 兵 | 卒 |

### 棋盘坐标

- Key 格式：`${列}${行}` — 如 `a0`、`e9`、`i4`
- 列：`a`–`i`（9 路）
- 行：`0`–`9`（10 行，红方视角 0 为底线）

## 开发

```sh
pnpm install          # 安装依赖
pnpm run dev          # Vite 开发服务器（打开测试页）
pnpm run compile      # TypeScript 编译
pnpm run dist         # 编译 + esbuild 打包
pnpm test             # vitest 测试
pnpm run lint         # oxlint 检查
pnpm run format       # oxfmt 格式化
```

## 许可证

GPL-3.0-or-later，详见 [LICENSE](LICENSE)。

[English](README.md)
