import { render, refresh, animateMove, updateMarkers } from './board';
import { bindEvents, unbindEvents } from './interaction';
import { createState, applyConfig, toggleOrientation as toggleOrient, getFen as getFenStr } from './state';
/**
 * chessground-xq api - 公开 API
 *
 * 仿 chessground 风格的 API：
 *   new XQGround(element, config)
 *   ground.set(config)
 *   ground.move(from, to)
 *   ground.setPieces(pieces)
 *   ground.selectSquare(key)
 *   ground.toggleOrientation()
 *   ground.setShapes(shapes)
 *   ground.getFen()
 *   ground.state        // readonly state
 *   ground.destroy()
 */
import type { Color, Key, Piece, Pieces, XQConfig, Shape, XQState } from './types';

/**
 * Chessground 工厂函数，兼容 @lichess-org/chessground 的函数式调用风格。
 * 用法：Chessground(element, config)    ← 不用 new！
 * 等价于：new XQGround(element, config)
 */
export function Chessground(element: HTMLElement, config?: XQConfig): XQGround {
  return new XQGround(element, config);
}

export class XQGround {
  private _state: XQState;
  private _element: HTMLElement;

  constructor(element: HTMLElement, config?: XQConfig) {
    this._element = element;
    this._state = createState(config);

    this._render();
  }

  /** 获取当前状态（只读副本） */
  get state(): Readonly<XQState> {
    return this._state;
  }

  /** 更新配置 */
  set(config: Partial<XQConfig>): void {
    applyConfig(this._state, config);
    this._render();
  }

  /** 走一步棋（带动画） */
  move(from: Key, to: Key): void {
    const piece = this._state.pieces.get(from);
    if (!piece) return;

    const captured = this._state.pieces.get(to);

    this._state.pieces.delete(from);
    this._state.pieces.set(to, piece);
    this._state.lastMove = [from, to];
    this._state.turnColor = this._state.turnColor === 'red' ? 'black' : 'red';
    this._state.selected = null;

    // 动画移动棋子 DOM
    animateMove(this._state, from, to, captured);
    // 更新标记（lastMove、selected）
    updateMarkers(this._state);
  }

  /** 设置新棋子集合 */
  setPieces(pieces: Pieces): void {
    this._state.pieces = new Map(pieces);
    this._state.selected = null;
    refresh(this._state);
  }

  /** 选中/取消选格 */
  selectSquare(key: Key | null): void {
    this._state.selected = key;
    refresh(this._state);
    if (this._state.events.select) {
      this._state.events.select(key);
    }
  }

  /** 翻转棋盘 */
  toggleOrientation(): void {
    toggleOrient(this._state);
    this._render();
  }

  /** 设置标注形状 */
  setShapes(shapes: Shape[]): void {
    this._state.drawable.shapes = [...shapes];
    refresh(this._state);
  }

  /** 添加标注形状 */
  addShape(shape: Shape): void {
    if (!this._state.drawable.shapes) {
      this._state.drawable.shapes = [];
    }
    this._state.drawable.shapes.push(shape);
    refresh(this._state);
  }

  /** 清除标注 */
  clearShapes(): void {
    this._state.drawable.shapes = [];
    refresh(this._state);
  }

  /** 获取 FEN 字符串 */
  getFen(orientation?: Color): string {
    return getFenStr(this._state, orientation);
  }

  /** 销毁，清理 DOM 和事件 */
  destroy(): void {
    unbindEvents(this._state);
    if (this._element.contains(this._state.domElements.boardEl!)) {
      this._element.removeChild(this._state.domElements.boardEl!);
    }
    this._state.domElements.boardEl = null;
    this._state.domElements.svgEl = null;
    this._state.domElements.piecesGroup = null;
    this._state.domElements.drawGroup = null;
    this._state.domElements.markersGroup = null;
  }

  /** 内部重新渲染 */
  private _render(): void {
    // 清除旧的棋盘元素
    if (this._state.domElements.boardEl) {
      this._element.removeChild(this._state.domElements.boardEl);
    }

    // 创建容器
    const boardEl = document.createElement('div');
    boardEl.className = 'xqg-container';
    boardEl.style.cssText =
      'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
    this._state.domElements.boardEl = boardEl;

    // 渲染棋盘
    const svg = render(this._state);
    boardEl.appendChild(svg);

    this._element.appendChild(boardEl);

    // 绑定事件
    unbindEvents(this._state); // 解绑旧事件
    bindEvents(this._state);
  }
}
