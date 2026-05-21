import { refresh, animateMove, updateMarkers } from './board';
/**
 * chessground-xq interaction - 用户交互处理
 */
import type { Key, XQState } from './types';
import { keyToPos, posToKey, BOARD_COLS, BOARD_ROWS } from './types';

/** 根据鼠标/触摸事件计算点击的棋盘坐标 */
export function getKeyFromEvent(e: MouseEvent | TouchEvent, svgEl: SVGSVGElement): Key | null {
  const rect = svgEl.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

  // 使用 viewBox 计算比例
  const viewBox = svgEl.getAttribute('viewBox');
  if (!viewBox) return null;
  const vb = viewBox.split(/\s+/).map(Number);
  const [vbX, vbY, vbW, vbH] = vb;

  const scaleX = vbW / rect.width;
  const scaleY = vbH / rect.height;

  const svgX = (clientX - rect.left) * scaleX;
  const svgY = (clientY - rect.top) * scaleY;

  // 实际单元格大小（从 viewBox 计算）
  const cellSize = vbW / 10;
  const gridX = Math.round(svgX / cellSize) - 1;
  const gridY = Math.round(svgY / cellSize) - 1;

  if (gridX >= 0 && gridX < BOARD_COLS && gridY >= 0 && gridY < BOARD_ROWS) {
    return posToKey(gridX, gridY);
  }
  return null;
}

/** 绑定棋盘点击事件 */
export function bindEvents(state: XQState): void {
  const svgEl = state.domElements.svgEl;
  if (!svgEl) return;

  const handleClick = (e: MouseEvent) => {
    const key = getKeyFromEvent(e, svgEl);
    if (!key) return;

    // 如果启用了绘制模式，先处理标注绘制
    if (state.drawable.enabled && state.drawable.shapes) {
      // 点击清除标注
      if (state.drawable.eraseOnClick) {
        state.drawable.shapes = [];
        refresh(state);
      }
    }

    // 触发 click 事件
    if (state.events.click) {
      state.events.click(key);
      return;
    }

    // 默认行为：选棋走子
    if (state.viewOnly) return;

    handleSelection(state, key);
  };

  svgEl.addEventListener('click', handleClick);

  // 清理函数 - 通过 domElements 存储以便后续解绑
  (svgEl as any).__xqgClickHandler = handleClick;
}

/** 处理选棋/走子逻辑 */
function handleSelection(state: XQState, key: Key): void {
  const piece = state.pieces.get(key);

  if (state.selected) {
    // 已有选中的棋子
    const selectedPiece = state.pieces.get(state.selected);

    if (selectedPiece && isMovable(state, selectedPiece)) {
      if (key === state.selected) {
        // 点击同一位置 = 取消选择
        state.selected = null;
        if (state.events.select) state.events.select(null);
        refresh(state);
        return;
      }

      // 尝试走子
      const captured = state.pieces.get(key);

      // 如果目标位置有己方棋子，则切换选择
      if (captured && captured.color === selectedPiece.color) {
        state.selected = key;
        if (state.events.select) state.events.select(key);
        refresh(state);
        return;
      }

      // 执行走子
      state.pieces.delete(state.selected);
      state.pieces.set(key, selectedPiece);
      state.lastMove = [state.selected, key];

      // 更新行棋方
      state.turnColor = state.turnColor === 'red' ? 'black' : 'red';

      const from = state.selected;
      state.selected = null;
      if (state.events.select) state.events.select(null);

      // 触发走子回调
      if (state.movable.events?.after) {
        state.movable.events.after(from, key, captured);
      }

      // 动画移动棋子，更新标记
      animateMove(state, from, key, captured);
      updateMarkers(state);
    }
  } else {
    // 无选中棋子 - 尝试选中
    if (piece && isMovable(state, piece)) {
      state.selected = key;
      if (state.events.select) state.events.select(key);
      refresh(state);
    }
  }
}

/** 判断棋子是否可移动 */
function isMovable(state: XQState, piece: { color: string }): boolean {
  const mc = state.movable.color;
  if (!mc) return false;
  if (mc === 'both') return true;
  return mc === piece.color;
}

/** 解绑事件 */
export function unbindEvents(state: XQState): void {
  const svgEl = state.domElements.svgEl;
  if (svgEl && (svgEl as any).__xqgClickHandler) {
    svgEl.removeEventListener('click', (svgEl as any).__xqgClickHandler);
    delete (svgEl as any).__xqgClickHandler;
  }
}
