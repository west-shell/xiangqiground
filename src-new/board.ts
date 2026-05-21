/**
 * chessground-xq board - SVG 棋盘渲染
 */
import type { Key, Piece, XQState } from './types';
import { keyToPos, posToKey, PIECE_NAMES, pieceToChar } from './types';

const CELL_SIZE = 50;
const MARGIN = CELL_SIZE * 0.1;

/** 棋盘边距（外圈空白），设为半格大小 */
const PAD_RATIO = 0.5;

/** 计算棋盘总尺寸 */
export function boardDimensions(cellSize: number = CELL_SIZE) {
  const pad = cellSize * PAD_RATIO;
  const width = (9 - 1) * cellSize + pad * 2; // 8格 + 2倍边距
  const height = (10 - 1) * cellSize + pad * 2; // 9格 + 2倍边距
  return { width, height, cellSize, margin: cellSize * 0.1, pad };
}

/** 生成棋盘 SVG 标记路径 */
function markPath(cellSize: number): string {
  const s = cellSize * 0.44;
  const m = cellSize * 0.18;
  return `M ${-s},${-s + m} v ${-m} h ${m}
    M ${s - m},${-s} h ${m} v ${m}
    M ${s},${s - m} v ${m} h ${-m}
    M ${-s + m},${s} h ${-m} v ${-m}`;
}

/** 坐标转 SVG 像素位置 */
export function posToPixel(x: number, y: number, cellSize: number = CELL_SIZE): { px: number; py: number } {
  const pad = cellSize * PAD_RATIO;
  return { px: pad + x * cellSize, py: pad + y * cellSize };
}

/** Key 转 SVG 像素位置 */
export function keyToPixel(key: Key, cellSize: number = CELL_SIZE): { px: number; py: number } {
  const { x, y } = keyToPos(key);
  return posToPixel(x, y, cellSize);
}

/** CSS 变量：棋盤線條顏色 */
const LINE_CSS = 'var(--board-line, var(--text-normal, #555))';
/** CSS 变量：棋盤背景色 */
const BG_CSS = 'var(--board-background, var(--background-primary-alt, #f0d9a0))';

/**
 * 生成标准中国象棋棋盘网格的 SVG 内部内容（不含 <svg> 包装）。
 * 使用 CSS 变量支持主题切换。
 * @param cell 格子间距（默认 CELL_SIZE）
 * @param pad  边距（默认 CELL_SIZE * PAD_RATIO）
 * @param orientation 朝向 'red' | 'black'
 * @returns SVG 片段字符串（可直接作为 innerHTML 插入 SVG 元素）
 */
export function generateBoardSVG(
  cell: number = CELL_SIZE,
  pad: number = CELL_SIZE * PAD_RATIO,
  orientation: 'red' | 'black' = 'red',
  showBg: boolean = true,
): string {
  const cols = 9,
    rows = 10;
  const w = (cols - 1) * cell + pad * 2;
  const h = (rows - 1) * cell + pad * 2;
  const lines: string[] = [];

  // 背景（有棋盘图片时不画背景矩形，否则图片会被遮住）
  if (showBg) {
    lines.push(`<rect width="${w}" height="${h}" fill="${BG_CSS}" rx="8"/>`);
  }

  // 外框
  const margin = cell * 0.1;
  lines.push(
    `<rect x="${pad - margin}" y="${pad - margin}" width="${(cols - 1) * cell + 2 * margin}" height="${(rows - 1) * cell + 2 * margin}" fill="none" stroke="${LINE_CSS}" stroke-width="3"/>`,
  );
  lines.push(
    `<rect x="${pad}" y="${pad}" width="${(cols - 1) * cell}" height="${(rows - 1) * cell}" fill="none" stroke="${LINE_CSS}" stroke-width="1"/>`,
  );

  // 横线
  for (let y = 0; y < rows; y++) {
    const yy = pad + y * cell;
    lines.push(
      `<line x1="${pad}" y1="${yy}" x2="${pad + (cols - 1) * cell}" y2="${yy}" stroke="${LINE_CSS}" stroke-width="1"/>`,
    );
  }

  // 上半部竖线
  for (let x = 0; x < cols; x++) {
    const xx = pad + x * cell;
    lines.push(
      `<line x1="${xx}" y1="${pad}" x2="${xx}" y2="${pad + 4 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
    );
  }

  // 下半部竖线
  for (let x = 0; x < cols; x++) {
    const xx = pad + x * cell;
    lines.push(
      `<line x1="${xx}" y1="${pad + 5 * cell}" x2="${xx}" y2="${pad + 9 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
    );
  }

  // 九宫斜线
  lines.push(
    `<line x1="${pad + 3 * cell}" y1="${pad}" x2="${pad + 5 * cell}" y2="${pad + 2 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
  );
  lines.push(
    `<line x1="${pad + 5 * cell}" y1="${pad}" x2="${pad + 3 * cell}" y2="${pad + 2 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
  );
  lines.push(
    `<line x1="${pad + 3 * cell}" y1="${pad + 7 * cell}" x2="${pad + 5 * cell}" y2="${pad + 9 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
  );
  lines.push(
    `<line x1="${pad + 5 * cell}" y1="${pad + 7 * cell}" x2="${pad + 3 * cell}" y2="${pad + 9 * cell}" stroke="${LINE_CSS}" stroke-width="1"/>`,
  );

  // 楚河汉界
  const riverY = pad + 4.5 * cell;
  lines.push(
    `<text x="${pad + 1.5 * cell}" y="${riverY}" font-size="${cell * 0.6}" fill="${LINE_CSS}" text-anchor="middle" dominant-baseline="middle" font-family="serif">楚 河</text>`,
  );
  lines.push(
    `<text x="${pad + 6.5 * cell}" y="${riverY}" font-size="${cell * 0.6}" fill="${LINE_CSS}" text-anchor="middle" dominant-baseline="middle" font-family="serif">漢 界</text>`,
  );

  // 星标
  const starPositions = [
    [1, 2],
    [7, 2],
    [1, 7],
    [7, 7],
    [2, 3],
    [4, 3],
    [6, 3],
    [2, 6],
    [4, 6],
    [6, 6],
  ];
  for (const [sx, sy] of starPositions) {
    const cx = pad + sx * cell;
    const cy = pad + sy * cell;
    const d = cell * 0.15;
    const d2 = cell * 0.08;
    lines.push(
      `<path d="M ${cx - d2},${cy - d - d2} v ${d} h ${-d} M ${cx + d2},${cy - d - d2} v ${d} h ${d} M ${cx + d2},${cy + d + d2} v ${-d} h ${d} M ${cx - d2},${cy + d + d2} v ${-d} h ${-d}" stroke="${LINE_CSS}" stroke-width="1" fill="none"/>`,
    );
  }

  // 边星
  const edgeStars = [
    [0, 3],
    [0, 6],
    [8, 3],
    [8, 6],
  ];
  for (const [ex, ey] of edgeStars) {
    const cx = pad + ex * cell;
    const cy = pad + ey * cell;
    const d = cell * 0.15;
    const d2 = cell * 0.08;
    if (ex === 0) {
      lines.push(
        `<path d="M ${cx + d2},${cy - d - d2} v ${d} h ${d} M ${cx + d2},${cy + d + d2} v ${-d} h ${d}" stroke="${LINE_CSS}" stroke-width="1" fill="none"/>`,
      );
    } else {
      lines.push(
        `<path d="M ${cx - d2},${cy - d - d2} v ${d} h ${-d} M ${cx - d2},${cy + d + d2} v ${-d} h ${-d}" stroke="${LINE_CSS}" stroke-width="1" fill="none"/>`,
      );
    }
  }

  // 坐标标签
  const topNums =
    orientation === 'red'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9']
      : ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
  const botNums =
    orientation === 'red'
      ? ['九', '八', '七', '六', '五', '四', '三', '二', '一']
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 0; i < 9; i++) {
    lines.push(
      `<text x="${pad + i * cell}" y="${pad * 0.6}" font-size="${cell * 0.25}" fill="${LINE_CSS}" text-anchor="middle" dominant-baseline="middle">${topNums[i]}</text>`,
    );
    lines.push(
      `<text x="${pad + i * cell}" y="${h - pad * 0.6}" font-size="${cell * 0.25}" fill="${LINE_CSS}" text-anchor="middle" dominant-baseline="middle">${botNums[i]}</text>`,
    );
  }

  return lines.join('\n');
}

/** 创建棋盘 SVG 元素 */
export function renderBoard(state: XQState): SVGSVGElement {
  const { cellSize, width, height } = boardDimensions(CELL_SIZE);
  const ns = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.classList.add('xqg-board');

  // 1. 棋盘背景图（最底层，拉伸填满整个 SVG）
  if (state.boardImage) {
    const image = document.createElementNS(ns, 'image');
    image.setAttribute('href', state.boardImage);
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', String(width));
    image.setAttribute('height', String(height));
    image.setAttribute('preserveAspectRatio', 'none');
    svg.appendChild(image);
  }

  // 2. 棋盘网格线（在背景图上层，SVG 精确绘制保证坐标对齐）
  // 有背景图时取消网格背景矩形，让图片完全露出
  svg.insertAdjacentHTML(
    'beforeend',
    generateBoardSVG(cellSize, cellSize * PAD_RATIO, state.orientation, !state.boardImage),
  );

  // 内嵌动画样式
  const style = document.createElementNS(ns, 'style');
  style.textContent = `
    .xqg-piece { transition: transform 0.18s ease; }
    .xqg-captured { opacity: 0; transform: scale(0.3); transition: opacity 0.15s ease, transform 0.15s ease; }
  `;
  svg.appendChild(style);

  // 标记组
  const markersGroup = document.createElementNS(ns, 'g');
  markersGroup.setAttribute('class', 'xqg-markers');
  svg.appendChild(markersGroup);

  // 棋子组
  const piecesGroup = document.createElementNS(ns, 'g');
  piecesGroup.setAttribute('class', 'xqg-pieces');
  svg.appendChild(piecesGroup);

  // 绘制组
  const drawGroup = document.createElementNS(ns, 'g');
  drawGroup.setAttribute('class', 'xqg-draw');
  svg.appendChild(drawGroup);

  return svg;
}

/** 渲染单个棋子 */
export function renderPiece(piece: Piece, key: Key, cellSize: number = CELL_SIZE): SVGGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const { px, py } = keyToPixel(key, cellSize);
  const pieceChar = pieceToChar(piece);
  const name = PIECE_NAMES[pieceChar] || pieceChar;
  const isRed = piece.color === 'red';

  const g = document.createElementNS(ns, 'g');
  g.setAttribute('transform', `translate(${px}, ${py})`);
  g.setAttribute('data-key', key);
  g.setAttribute('data-piece', pieceChar);
  g.setAttribute('class', `xqg-piece ${isRed ? 'red' : 'black'}`);

  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('r', String(cellSize * 0.45));
  circle.setAttribute('fill', isRed ? 'var(--piece-red, #b24747)' : 'var(--piece-black, #5166b2)');
  circle.setAttribute('stroke', 'var(--board-line, var(--text-normal))');
  circle.setAttribute('stroke-width', String(cellSize * 0.03));
  g.appendChild(circle);

  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', '0');
  text.setAttribute('y', '0');
  text.setAttribute('fill', 'white');
  text.setAttribute('font-size', String(cellSize * 0.55));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dy', '0.4em');
  text.textContent = name;
  g.appendChild(text);

  return g;
}

/** 更新棋子组（增量更新，保留已有 DOM 实现过渡动画） */
export function updatePieces(state: XQState): void {
  const group = state.domElements.piecesGroup;
  if (!group) return;
  const cellSize = CELL_SIZE;

  // 收集当前 DOM 中的棋子 key
  const existing = new Map<string, SVGGElement>();
  for (const child of Array.from(group.children)) {
    const g = child as SVGGElement;
    const key = g.getAttribute('data-key');
    if (key) existing.set(key, g);
  }

  // 需要保留的 key 集合
  const needed = new Set(state.pieces.keys());

  // 删除不需要的棋子
  for (const [key, el] of existing) {
    if (!needed.has(key)) {
      group.removeChild(el);
      existing.delete(key);
    }
  }

  // 添加/更新棋子
  for (const [key, piece] of state.pieces) {
    const existingEl = existing.get(key);
    if (existingEl) {
      // 更新已存在棋子的位置
      const { px, py } = keyToPixel(key, cellSize);
      existingEl.setAttribute('transform', `translate(${px}, ${py})`);
    } else {
      // 创建新棋子
      const el = renderPiece(piece, key, cellSize);
      group.appendChild(el);
    }
  }
}

/** 走子动画：直接操作 DOM 实现平滑过渡 */
export function animateMove(state: XQState, from: Key, to: Key, captured?: Piece | null): void {
  const group = state.domElements.piecesGroup;
  if (!group) return;
  const cellSize = CELL_SIZE;

  // 1. 处理吃子：消失动画
  if (captured) {
    const capturedEl = group.querySelector(`[data-key="${to}"]`) as SVGGElement | null;
    if (capturedEl) {
      capturedEl.classList.add('xqg-captured');
      capturedEl.addEventListener(
        'transitionend',
        () => {
          if (capturedEl.parentNode) capturedEl.parentNode.removeChild(capturedEl);
        },
        { once: true },
      );
    }
  }

  // 2. 移动棋子：只改 transform 和 data-key，CSS transition 自动补间
  const movingEl = group.querySelector(`[data-key="${from}"]`) as SVGGElement | null;
  if (movingEl) {
    const { px, py } = keyToPixel(to, cellSize);
    movingEl.setAttribute('data-key', to);
    movingEl.setAttribute('transform', `translate(${px}, ${py})`);
  }
}

/** 渲染 lastMove 标记 */
export function updateMarkers(state: XQState): void {
  const group = state.domElements.markersGroup;
  if (!group) return;
  const ns = 'http://www.w3.org/2000/svg';
  const cellSize = CELL_SIZE;

  while (group.firstChild) group.removeChild(group.firstChild);

  // Last Move 标记
  if (state.lastMove) {
    const [fromKey, toKey] = state.lastMove;

    // 起点方框
    const { px: fx, py: fy } = keyToPixel(fromKey, cellSize);
    const fromRect = document.createElementNS(ns, 'rect');
    fromRect.setAttribute('x', String(fx - cellSize * 0.2));
    fromRect.setAttribute('y', String(fy - cellSize * 0.2));
    fromRect.setAttribute('width', String(cellSize * 0.4));
    fromRect.setAttribute('height', String(cellSize * 0.4));
    fromRect.setAttribute(
      'fill',
      state.turnColor === 'red' ? 'var(--piece-black, #5166b2)' : 'var(--piece-red, #b24747)',
    );
    fromRect.setAttribute('opacity', '0.7');
    group.appendChild(fromRect);

    // 终点标记
    const { px: tx, py: ty } = keyToPixel(toKey, cellSize);
    const toPath = document.createElementNS(ns, 'path');
    toPath.setAttribute('d', markPath(cellSize));
    toPath.setAttribute('stroke', 'var(--board-line, var(--text-normal))');
    toPath.setAttribute('stroke-width', String(cellSize * 0.05));
    toPath.setAttribute('fill', 'none');
    toPath.setAttribute('transform', `translate(${tx}, ${ty})`);
    group.appendChild(toPath);
  }

  // Selected 高亮
  if (state.selected) {
    const { px, py } = keyToPixel(state.selected, cellSize);
    const selCircle = document.createElementNS(ns, 'circle');
    selCircle.setAttribute('cx', String(px));
    selCircle.setAttribute('cy', String(py));
    selCircle.setAttribute('r', String(cellSize * 0.48));
    selCircle.setAttribute('fill', 'none');
    selCircle.setAttribute('stroke', 'var(--color-accent, #ff6600)');
    selCircle.setAttribute('stroke-width', String(cellSize * 0.06));
    selCircle.setAttribute('opacity', '0.8');
    group.appendChild(selCircle);
  }

  // Check 标记
  if (state.check) {
    const { px, py } = keyToPixel(state.check, cellSize);
    const checkCircle = document.createElementNS(ns, 'circle');
    checkCircle.setAttribute('cx', String(px));
    checkCircle.setAttribute('cy', String(py));
    checkCircle.setAttribute('r', String(cellSize * 0.5));
    checkCircle.setAttribute('fill', 'none');
    checkCircle.setAttribute('stroke', 'red');
    checkCircle.setAttribute('stroke-width', String(cellSize * 0.06));
    checkCircle.setAttribute('opacity', '0.9');
    checkCircle.setAttribute('stroke-dasharray', String(cellSize * 0.1));
    group.appendChild(checkCircle);
  }

  // 合法目标高亮
  if (state.selected && state.movable.showDests && state.movable.color) {
    const piece = state.pieces.get(state.selected);
    if (piece && isMovable(state, piece)) {
      // 绘制合法目标位置
      // TODO: 使用运动规则生成 dests
    }
  }
}

/** 判断棋子是否可移动 */
function isMovable(state: XQState, piece: Piece): boolean {
  const mc = state.movable.color;
  if (!mc) return false;
  if (mc === 'both') return true;
  return mc === piece.color;
}

/** 渲染绘制形状（箭头、圆圈） */
export function renderDrawShapes(state: XQState): void {
  const group = state.domElements.drawGroup;
  if (!group || !state.drawable.enabled) return;
  const ns = 'http://www.w3.org/2000/svg';
  const cellSize = CELL_SIZE;

  while (group.firstChild) group.removeChild(group.firstChild);

  const shapes = state.drawable.shapes || [];
  for (const shape of shapes) {
    if (shape.type === 'circle') {
      const { px, py } = keyToPixel(shape.pos, cellSize);
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', String(px));
      circle.setAttribute('cy', String(py));
      circle.setAttribute('r', String(shape.radius || cellSize * 0.45));
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', shape.color || 'green');
      circle.setAttribute('stroke-width', String(cellSize * 0.04));
      circle.setAttribute('opacity', '0.6');
      group.appendChild(circle);
    } else if (shape.type === 'arrow') {
      const { px: fx, py: fy } = keyToPixel(shape.from, cellSize);
      const { px: tx, py: ty } = keyToPixel(shape.to, cellSize);

      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(fx));
      line.setAttribute('y1', String(fy));
      line.setAttribute('x2', String(tx));
      line.setAttribute('y2', String(ty));
      line.setAttribute('stroke', shape.color || 'green');
      line.setAttribute('stroke-width', String(cellSize * 0.08));
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', String(shape.opacity ?? 0.6));
      group.appendChild(line);

      // 箭头头部
      const angle = Math.atan2(ty - fy, tx - fx);
      const arrowLen = cellSize * 0.2;
      const arrowAngle = Math.PI / 6;
      const head1 = document.createElementNS(ns, 'line');
      head1.setAttribute('x1', String(tx));
      head1.setAttribute('y1', String(ty));
      head1.setAttribute('x2', String(tx - arrowLen * Math.cos(angle - arrowAngle)));
      head1.setAttribute('y2', String(ty - arrowLen * Math.sin(angle - arrowAngle)));
      head1.setAttribute('stroke', shape.color || 'green');
      head1.setAttribute('stroke-width', String(cellSize * 0.08));
      head1.setAttribute('stroke-linecap', 'round');
      group.appendChild(head1);

      const head2 = document.createElementNS(ns, 'line');
      head2.setAttribute('x1', String(tx));
      head2.setAttribute('y1', String(ty));
      head2.setAttribute('x2', String(tx - arrowLen * Math.cos(angle + arrowAngle)));
      head2.setAttribute('y2', String(ty - arrowLen * Math.sin(angle + arrowAngle)));
      head2.setAttribute('stroke', shape.color || 'green');
      head2.setAttribute('stroke-width', String(cellSize * 0.08));
      head2.setAttribute('stroke-linecap', 'round');
      group.appendChild(head2);
    }
  }
}

/** 完全重新渲染棋盘 */
export function render(state: XQState): SVGSVGElement {
  const svg = renderBoard(state);
  const piecesGroup = svg.querySelector('.xqg-pieces') as SVGGElement;
  const drawGroup = svg.querySelector('.xqg-draw') as SVGGElement;
  const markersGroup = svg.querySelector('.xqg-markers') as SVGGElement;

  state.domElements.svgEl = svg;
  state.domElements.piecesGroup = piecesGroup;
  state.domElements.drawGroup = drawGroup;
  state.domElements.markersGroup = markersGroup;

  updatePieces(state);
  updateMarkers(state);
  renderDrawShapes(state);

  return svg;
}

/** 刷新棋盘（增量更新） */
export function refresh(state: XQState): void {
  updatePieces(state);
  updateMarkers(state);
  renderDrawShapes(state);
}
