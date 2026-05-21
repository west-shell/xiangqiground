/**
 * chessground-xq types - 中国象棋类型定义
 */

/** 棋盘坐标键，格式 "x,y" (0-8, 0-9) */
export type Key = string;

/** 棋子颜色 */
export type Color = 'red' | 'black';

/** 棋子角色 */
export type Role = 'king' | 'advisor' | 'elephant' | 'rook' | 'knight' | 'cannon' | 'pawn';

/** 棋子 */
export interface Piece {
  role: Role;
  color: Color;
}

/** 棋子集合 */
export type Pieces = Map<Key, Piece>;

/** 坐标 */
export interface Pos {
  x: number;
  y: number;
}

/** 标注形状类型 */
export type Shape = CircleShape | ArrowShape;

/** 圆圈标注 */
export interface CircleShape {
  type: 'circle';
  pos: Key;
  color?: string;
  radius?: number;
}

/** 箭头标注 */
export interface ArrowShape {
  type: 'arrow';
  from: Key;
  to: Key;
  color?: string;
  opacity?: number;
}

/** 走子事件回调 */
export interface MoveEvent {
  from: Key;
  to: Key;
  captured?: Piece | null;
}

/** 棋谱记录 */
export interface MoveRecord {
  from: Key;
  to: Key;
  piece: Piece;
  captured?: Piece | null;
}

/** 可移动设置 */
export interface MovableOptions {
  free?: boolean;
  color?: Color | 'both' | null;
  dests?: Map<Key, Key[]>;
  showDests?: boolean;
  events?: {
    after?: (orig: Key, dest: Key, captured?: Piece | null) => void;
  };
}

/** 绘制设置 */
export interface DrawableOptions {
  enabled?: boolean;
  shapes?: Shape[];
  eraseOnClick?: boolean;
}

/** 动画设置 */
export interface AnimationOptions {
  enabled?: boolean;
  duration?: number;
}

/** 棋盘配置 */
export interface XQConfig {
  fen?: string;
  orientation?: Color;
  turnColor?: Color;
  pieces?: Pieces;
  lastMove?: [Key, Key] | null;
  check?: Key | null;
  selected?: Key | null;
  movable?: MovableOptions;
  drawable?: DrawableOptions;
  animation?: AnimationOptions;
  events?: {
    select?: (key: Key | null) => void;
    click?: (key: Key) => void;
  };
  viewOnly?: boolean;
  /** 自定义棋盘背景图 URL，如设置则用图片替代 SVG 绘制的棋盘 */
  boardImage?: string;
}

/** 棋盘内部状态 */
export interface XQState {
  pieces: Pieces;
  orientation: Color;
  turnColor: Color;
  lastMove: [Key, Key] | null;
  check: Key | null;
  selected: Key | null;
  movable: MovableOptions;
  drawable: DrawableOptions;
  animation: AnimationOptions;
  events: {
    select?: (key: Key | null) => void;
    click?: (key: Key) => void;
  };
  viewOnly: boolean;
  boardImage?: string;
  domElements: {
    boardEl: HTMLElement | null;
    svgEl: SVGSVGElement | null;
    defsEl: SVGDefsElement | null;
    piecesGroup: SVGGElement | null;
    drawGroup: SVGGElement | null;
    markersGroup: SVGGElement | null;
  };
}

/** 棋子角色与字符映射 */
export const ROLE_CHARS: Record<Role, string> = {
  king: 'K',
  advisor: 'A',
  elephant: 'B',
  rook: 'R',
  knight: 'N',
  cannon: 'C',
  pawn: 'P',
};

export const CHAR_ROLES: Record<string, Role> = {
  K: 'king',
  A: 'advisor',
  B: 'elephant',
  R: 'rook',
  N: 'knight',
  C: 'cannon',
  P: 'pawn',
  k: 'king',
  a: 'advisor',
  b: 'elephant',
  r: 'rook',
  n: 'knight',
  c: 'cannon',
  p: 'pawn',
};

/** 棋子unicode显示名 */
export const PIECE_NAMES: Record<string, string> = {
  K: '帅',
  A: '仕',
  B: '相',
  R: '俥',
  N: '傌',
  C: '炮',
  P: '兵',
  k: '将',
  a: '士',
  b: '象',
  r: '车',
  n: '马',
  c: '砲',
  p: '卒',
};

/** 将角色+颜色转为棋子字符 (小写=黑方, 大写=红方) */
export function pieceToChar(piece: Piece): string {
  const c = ROLE_CHARS[piece.role];
  return piece.color === 'red' ? c : c.toLowerCase();
}

/** 将棋子字符转为 Piece 对象 */
export function charToPiece(ch: string): Piece | null {
  const role = CHAR_ROLES[ch];
  if (!role) return null;
  return { role, color: ch === ch.toUpperCase() ? 'red' : 'black' };
}

/** 坐标转 Key */
export function posToKey(x: number, y: number): Key {
  return `${x},${y}`;
}

/** Key 转坐标 */
export function keyToPos(key: Key): Pos {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/** 9列纵线的字符标签 */
export const FILE_LABELS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 棋盘宽度 9列，高度10行 */
export const BOARD_COLS = 9;
export const BOARD_ROWS = 10;
