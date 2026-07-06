# Xiangqiground

An interactive Xiangqi (Chinese Chess) board UI library.
Forked from [@lichess-org/chessground](https://github.com/lichess-org/chessground) and adapted for Xiangqi: board changed to 9 columns × 10 rows, chess roles replaced with Xiangqi roles, premove rules rewritten for Xiangqi mobility (蹩马腿, 塞象眼, 将帅对面, etc.), coordinate labels switched to Chinese/Arabic numerals, CSS prefix changed from `cg-` to `xq-`. Zero dependencies, no chess logic inside.

## Features

- 9×10 board with river, palace diagonals, and star marks
- Drag & drop and click-click move
- Premove with Xiangqi mobility rules (蹩马腿, 塞象眼, 将帅对面)
- SVG arrows, circles, and custom shapes
- Animation of pieces (moving and fading)
- Last move, check, move destinations, and premove destinations highlights
- FEN import/export (Xiangqi format)
- Coordinates with Chinese numerals (一二三…) and Arabic (1-9)
- Entirely configurable and reconfigurable at any time
- CSS-only styling — switch board/pieces by switching a class
- Fluid layout, resizable at any time
- Full mobile support (touchstart, touchmove, touchend)
- Well typed with TypeScript

## Installation

```sh
npm install xiangqiground
```

## Usage

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
ground.getFen();                // current position as Xiangqi FEN
ground.move('b0', 'c2');        // programmatic move
ground.toggleOrientation();     // flip board
ground.set({ fen: 'start' });   // reset to initial position
ground.set({ fen: initial, lastMove: undefined }); // reset and clear markers
```

See [API types](src/api.ts) and [Config types](src/config.ts) for full documentation.

### Roles

| Role | FEN letter | White (红) | Black (黑) |
|------|-----------|-----------|-----------|
| king | k | 帅 | 将 |
| advisor | a | 仕 | 士 |
| bishop | b | 相 | 象 |
| rook | r | 俥 | 车 |
| knight | n | 傌 | 马 |
| cannon | c | 炮 | 砲 |
| pawn | p | 兵 | 卒 |

### Board Coordinates

- Key format: `${File}${Rank}` — e.g. `a0`, `e9`, `i4`
- Files: `a`–`i` (9 columns)
- Ranks: `0`–`9` (10 rows, 0 = bottom for white)

## Development

```sh
pnpm install          # install dependencies
pnpm run dev          # vite dev server (opens test page)
pnpm run compile      # TypeScript compile
pnpm run dist         # compile + esbuild bundle
pnpm test             # vitest
pnpm run lint         # oxlint
pnpm run format       # oxfmt
```

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).

[中文](README.zh-CN.md)
