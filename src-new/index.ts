/**
 * chessground-xq - 中国象棋棋盘渲染库
 *
 * 仿 chessground 风格的 API：
 *   - 配置驱动的 XQGround 类
 *   - SVG 棋盘渲染
 *   - 点击走子交互
 *   - 箭头/圆圈标注系统
 *   - 翻转/选中等操作
 */

export { XQGround } from './api';
export { Chessground } from './api';
export type {
  Key,
  Color,
  Role,
  Piece,
  Pieces,
  Pos,
  Shape,
  CircleShape,
  ArrowShape,
  XQConfig,
  XQState,
  MovableOptions,
  DrawableOptions,
  AnimationOptions,
} from './types';
export {
  posToKey,
  keyToPos,
  pieceToChar,
  charToPiece,
  PIECE_NAMES,
  ROLE_CHARS,
  CHAR_ROLES,
  BOARD_COLS,
  BOARD_ROWS,
} from './types';
export { piecesFromFen, getFen, DEFAULT_FEN } from './state';
export { boardDimensions, posToPixel, keyToPixel, generateBoardSVG, renderPiece } from './board';
