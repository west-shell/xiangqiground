import { anim, render } from './anim.js';
import * as board from './board.js';
import { applyAnimation, type Config, configure } from './config.js';
import { cancel as dragCancel, dragNewPiece } from './drag.js';
import { type DrawShape } from './draw.js';
import { explosion } from './explosion.js';
import { write as fenWrite } from './fen.js';
import { type State } from './state.js';
import type * as cg from './types.js';

export interface Api {
  // 重新配置实例。接受所有配置选项，除 viewOnly 和 drawable.visible 外。
  // 如果启用了动画，棋盘将相应地执行动画效果。
  set(config: Config): void;

  // 读取 chessground 状态；写入操作需自行承担风险。
  state: State;

  // 获取 FEN 字符串表示的当前局面（仅包含棋子，不含标志位）
  // 例如：rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
  getFen(): cg.FEN;

  // 切换棋盘视角
  toggleOrientation(): void;

  // 以编程方式执行一步走棋
  move(orig: cg.Key, dest: cg.Key): void;

  // 在棋盘上添加和/或移除任意棋子
  setPieces(pieces: cg.PiecesDiff): void;

  // 以编程方式点击一个格子
  selectSquare(key: cg.Key | null, force?: boolean): void;

  // 在棋盘上放置一个新棋子
  newPiece(piece: cg.Piece, key: cg.Key): void;

  // 执行当前的预走棋（premove），如果有的话；如果预走棋被执行则返回 true
  playPremove(): boolean;

  // 取消当前的预走棋（premove），如果有的话
  cancelPremove(): void;

  // 执行当前的预放置（predrop），如果有的话；如果预放置被执行则返回 true
  playPredrop(validate: (drop: cg.Drop) => boolean): boolean;

  // 取消当前的预放置（predrop），如果有的话
  cancelPredrop(): void;

  // 取消当前正在进行的走棋操作
  cancelMove(): void;

  // 取消当前走棋并阻止后续操作
  stop(): void;

  // 让格子爆炸（原子象棋模式）
  explode(keys: cg.Key[]): void;

  // 以编程方式绘制用户自定义图形
  setShapes(shapes: DrawShape[]): void;

  // 以编程方式绘制自动生成的图形
  setAutoShapes(shapes: DrawShape[]): void;

  // 获取 DOM 坐标位置对应的格子名称（比如 "e4"）
  getKeyAtDomPos(pos: cg.NumberPair): cg.Key | undefined;

  // 仅在 CSS 改变了棋盘宽高比时有用（用于 3D 效果）
  redrawAll: cg.Redraw;

  // 用于 crazyhouse 模式和棋盘编辑器
  dragNewPiece(piece: cg.Piece, event: cg.MouchEvent, force?: boolean): void;

  // 解绑所有事件
  //（对于 scroll 和 mousemove 这类文档级别的事件尤其重要）
  destroy: cg.Unbind;
}

// 有关 API 类型和文档，请参见 dts/api.d.ts
export function start(state: State, redrawAll: cg.Redraw): Api {
  function toggleOrientation(): void {
    board.toggleOrientation(state);
    redrawAll();
  }

  return {
    set(config): void {
      if (config.orientation && config.orientation !== state.orientation) toggleOrientation();
      applyAnimation(state, config);
      (config.fen ? anim : render)(state => configure(state, config), state);
    },

    state,

    getFen: () => fenWrite(state.pieces),

    toggleOrientation,

    setPieces(pieces): void {
      anim(state => board.setPieces(state, pieces), state);
    },

    selectSquare(key, force): void {
      if (key) anim(state => board.selectSquare(state, key, force), state);
      else if (state.selected) {
        board.unselect(state);
        state.dom.redraw();
      }
    },

    move(orig, dest): void {
      anim(state => board.baseMove(state, orig, dest), state);
    },

    newPiece(piece, key): void {
      anim(state => board.baseNewPiece(state, piece, key), state);
    },

    playPremove(): boolean {
      if (state.premovable.current) {
        if (anim(board.playPremove, state)) return true;
        // 如果预走棋无法执行，则重绘以清除预走棋的状态
        state.dom.redraw();
      }
      return false;
    },

    playPredrop(validate): boolean {
      if (state.predroppable.current) {
        const result = board.playPredrop(state, validate);
        state.dom.redraw();
        return result;
      }
      return false;
    },

    cancelPremove(): void {
      render(board.unsetPremove, state);
    },

    cancelPredrop(): void {
      render(board.unsetPredrop, state);
    },

    cancelMove(): void {
      render(state => {
        board.cancelMove(state);
        dragCancel(state);
      }, state);
    },

    stop(): void {
      render(state => {
        board.stop(state);
        dragCancel(state);
      }, state);
    },

    explode(keys: cg.Key[]): void {
      explosion(state, keys);
    },

    setAutoShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.autoShapes = shapes), state);
    },

    setShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.shapes = shapes.slice()), state);
    },

    getKeyAtDomPos(pos): cg.Key | undefined {
      return board.getKeyAtDomPos(pos, board.whitePov(state), state.dom.bounds());
    },

    redrawAll,

    dragNewPiece(piece, event, force): void {
      dragNewPiece(state, piece, event, force);
    },

    destroy(): void {
      board.stop(state);
      state.dom.unbind?.();
      state.dom.destroyed = true;
    },
  };
}
