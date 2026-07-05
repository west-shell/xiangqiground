import { type HeadlessState } from './state.js';
import type * as cg from './types.js';
import { type Mobility, type MobilityContext } from './types.js';
import * as util from './util.js';

const pawn: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;
  const forward = ctx.color === 'white' ? 1 : -1;
  const dx = util.diff(x1, x2);
  const dy = y2 - y1;

  if (dx + Math.abs(dy) !== 1 || dx > 1) return false;

  if (dy === forward) return true;
  if (dy === 0) return util.hasCrossedRiver(ctx.orig.pos, ctx.color);
  return false;
};

const knight: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;
  const dx = util.diff(x1, x2);
  const dy = util.diff(y1, y2);

  if (dx * dy !== 2) return false;

  // Horse-leg blocking (蹩马腿)
  const legX = dx === 2 ? x1 + (x2 > x1 ? 1 : -1) : x1;
  const legY = dy === 2 ? y1 + (y2 > y1 ? 1 : -1) : y1;
  const legKey = util.pos2key([legX, legY]);
  return !(legKey && ctx.allPieces.has(legKey));
};

const rook: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;
  if (!util.rookDir(x1, y1, x2, y2)) return false;
  return !util.squaresBetween(x1, y1, x2, y2).some(k => ctx.allPieces.has(k));
};

const cannon: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;
  if (!util.rookDir(x1, y1, x2, y2)) return false;

  const between = util.squaresBetween(x1, y1, x2, y2);
  const piecesBetween = between.filter(k => ctx.allPieces.has(k));
  const destPiece = ctx.allPieces.get(ctx.dest.key);

  if (destPiece && destPiece.color !== ctx.color) return piecesBetween.length === 1; // capture over exactly one screen
  return piecesBetween.length === 0; // non-capture: slide freely
};

const advisor: Mobility = (ctx: MobilityContext) => {
  if (util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) !== 1) return false;
  if (util.diff(ctx.orig.pos[1], ctx.dest.pos[1]) !== 1) return false;
  return util.isInPalace(ctx.dest.pos, ctx.color);
};

const bishop: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;

  if (util.diff(x1, x2) !== 2 || util.diff(y1, y2) !== 2) return false;
  if (!util.isInOwnHalf(ctx.dest.pos, ctx.color)) return false;

  // Elephant-eye blocking (塞象眼)
  const eyeKey = util.pos2key([(x1 + x2) / 2, (y1 + y2) / 2]);
  return !(eyeKey && ctx.allPieces.has(eyeKey));
};

const king: Mobility = (ctx: MobilityContext) => {
  const [x1, y1] = ctx.orig.pos;
  const [x2, y2] = ctx.dest.pos;

  if (util.diff(x1, x2) + util.diff(y1, y2) !== 1) return false;
  if (!util.isInPalace(ctx.dest.pos, ctx.color)) return false;

  // Flying general check (将帅对面)
  let enemyKingPos: cg.Pos | undefined;
  for (const [k, p] of ctx.allPieces) {
    if (p.role === 'king' && p.color !== ctx.color) {
      enemyKingPos = util.key2pos(k);
      break;
    }
  }
  if (!enemyKingPos || x2 !== enemyKingPos[0]) return true;

  return util
    .squaresBetween(x2, y2, enemyKingPos[0], enemyKingPos[1])
    .some(k => k !== ctx.orig.key && ctx.allPieces.has(k));
};

const mobilityByRole: Record<string, Mobility> = {
  pawn,
  knight,
  rook,
  cannon,
  advisor,
  bishop,
  king,
};

export function premove(state: HeadlessState, key: cg.Key): cg.Key[] {
  const pieces = state.pieces;
  const piece = pieces.get(key);
  if (!piece || piece.color === state.turnColor) return [];
  const color = piece.color,
    friendlies = new Map([...pieces].filter(([_, p]) => p.color === color)),
    enemies = new Map([...pieces].filter(([_, p]) => p.color === util.opposite(color))),
    orig = { key, pos: util.key2pos(key) },
    mobility: Mobility = (ctx: MobilityContext) => mobilityByRole[piece.role]?.(ctx) ?? true,
    partialCtx = {
      orig,
      role: piece.role,
      allPieces: pieces,
      friendlies: friendlies,
      enemies: enemies,
      color: color,
      rookFilesFriendlies: [],
      lastMove: state.lastMove,
    };
  return util.allPosAndKey.filter(dest => mobility({ ...partialCtx, dest })).map(pk => pk.key);
}
