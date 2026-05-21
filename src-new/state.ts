/**
 * chessground-xq state - 状态管理
 */
import type {
  Color,
  Key,
  Piece,
  Pieces,
  XQConfig,
  XQState,
  Shape,
  MovableOptions,
  DrawableOptions,
  AnimationOptions,
} from './types';
import { charToPiece, posToKey, BOARD_COLS, BOARD_ROWS } from './types';

/** 默认配置 */
export function defaultConfig(): XQConfig {
  return {
    orientation: 'red',
    turnColor: 'red',
    lastMove: null,
    check: null,
    selected: null,
    movable: {
      free: false,
      color: null,
      dests: undefined,
      showDests: true,
    },
    drawable: {
      enabled: true,
      shapes: [],
      eraseOnClick: true,
    },
    animation: {
      enabled: true,
      duration: 200,
    },
    events: {},
    viewOnly: false,
  };
}

/** 从 FEN 字符串加载棋子 */
export function piecesFromFen(fen: string): Pieces {
  const pieces: Pieces = new Map();
  const rows = fen.trim().split(/\s+/)[0].split('/');
  rows.forEach((row, y) => {
    let x = 0;
    for (const ch of row) {
      if (/[1-9]/.test(ch)) {
        x += parseInt(ch);
      } else if (/[a-zA-Z]/.test(ch)) {
        const piece = charToPiece(ch);
        if (piece) pieces.set(posToKey(x, y), piece);
        x++;
      }
    }
  });
  return pieces;
}

/** 默认初始局面（红方在 bottom） */
export const DEFAULT_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';

/** 创建初始状态 */
export function createState(config?: XQConfig): XQState {
  const cfg = { ...defaultConfig(), ...config };

  let pieces: Pieces;
  if (cfg.pieces) {
    pieces = new Map(cfg.pieces);
  } else if (cfg.fen) {
    pieces = piecesFromFen(cfg.fen);
  } else {
    pieces = piecesFromFen(DEFAULT_FEN);
  }

  // 根据 orientation 翻转棋子
  if (cfg.orientation === 'black') {
    pieces = orientPieces(pieces, 'black');
  }

  return {
    pieces,
    orientation: cfg.orientation || 'red',
    turnColor: cfg.turnColor || 'red',
    lastMove: cfg.lastMove || null,
    check: cfg.check || null,
    selected: cfg.selected || null,
    movable: { ...defaultConfig().movable, ...cfg.movable } as MovableOptions,
    drawable: { ...defaultConfig().drawable, ...cfg.drawable } as DrawableOptions,
    animation: { ...defaultConfig().animation, ...cfg.animation } as AnimationOptions,
    events: { ...cfg.events },
    viewOnly: cfg.viewOnly || false,
    boardImage: cfg.boardImage,
    domElements: {
      boardEl: null,
      svgEl: null,
      defsEl: null,
      piecesGroup: null,
      drawGroup: null,
      markersGroup: null,
    },
  };
}

/** 翻转棋子 */
function orientPieces(pieces: Pieces, orientation: Color): Pieces {
  const oriented = new Map<Key, Piece>();
  for (const [key, piece] of pieces) {
    const [x, y] = key.split(',').map(Number);
    oriented.set(posToKey(BOARD_COLS - 1 - x, BOARD_ROWS - 1 - y), piece);
  }
  return oriented;
}

/** 应用配置更新到状态 */
export function applyConfig(state: XQState, config: Partial<XQConfig>): void {
  if (config.fen) {
    state.pieces = orientPieces(piecesFromFen(config.fen), state.orientation);
  }
  if (config.pieces) {
    state.pieces = new Map(config.pieces);
  }
  if (config.orientation !== undefined) {
    state.orientation = config.orientation;
  }
  if (config.turnColor !== undefined) {
    state.turnColor = config.turnColor;
  }
  if (config.lastMove !== undefined) {
    state.lastMove = config.lastMove;
  }
  if (config.check !== undefined) {
    state.check = config.check;
  }
  if (config.selected !== undefined) {
    state.selected = config.selected;
  }
  if (config.movable) {
    state.movable = { ...state.movable, ...config.movable };
  }
  if (config.drawable) {
    state.drawable = { ...state.drawable, ...config.drawable };
  }
  if (config.animation) {
    state.animation = { ...state.animation, ...config.animation };
  }
  if (config.events) {
    state.events = { ...state.events, ...config.events };
  }
  if (config.viewOnly !== undefined) {
    state.viewOnly = config.viewOnly;
  }
  if (config.boardImage !== undefined) {
    state.boardImage = config.boardImage;
  }
}

/** 切换棋盘朝向 */
export function toggleOrientation(state: XQState): void {
  const newOrientation: Color = state.orientation === 'red' ? 'black' : 'red';
  const newPieces: Pieces = new Map();
  for (const [key, piece] of state.pieces) {
    const [x, y] = key.split(',').map(Number);
    newPieces.set(posToKey(BOARD_COLS - 1 - x, BOARD_ROWS - 1 - y), piece);
  }
  state.orientation = newOrientation;
  state.pieces = newPieces;
}

/** 获取当前 FEN（以红方视角） */
export function getFen(state: XQState, orientation: Color = 'red'): string {
  let pieces = state.pieces;
  if (orientation !== state.orientation) {
    pieces = orientPieces(pieces, orientation);
  }
  const rows: string[] = [];
  for (let y = 0; y < BOARD_ROWS; y++) {
    let row = '';
    let empty = 0;
    for (let x = 0; x < BOARD_COLS; x++) {
      const piece = pieces.get(posToKey(x, y));
      if (!piece) {
        empty++;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        const c = piece.color === 'red' ? piece.role.charAt(0).toUpperCase() : piece.role.charAt(0);
        row +=
          c === 'K'
            ? piece.color === 'red'
              ? 'K'
              : 'k'
            : c === 'A'
              ? piece.color === 'red'
                ? 'A'
                : 'a'
              : c === 'B'
                ? piece.color === 'red'
                  ? 'B'
                  : 'b'
                : c === 'R'
                  ? piece.color === 'red'
                    ? 'R'
                    : 'r'
                  : c === 'N'
                    ? piece.color === 'red'
                      ? 'N'
                      : 'n'
                    : c === 'C'
                      ? piece.color === 'red'
                        ? 'C'
                        : 'c'
                      : c === 'P'
                        ? piece.color === 'red'
                          ? 'P'
                          : 'p'
                        : c;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  return rows.join('/');
}
