import { type HeadlessState } from './state.js';
import type * as cg from './types.js';
import { type Mobility, type MobilityContext } from './types.js';
import * as util from './util.js';

const pawn: Mobility = (ctx: MobilityContext) =>
  util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) <= 1 &&
  (util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) === 1
    ? ctx.dest.pos[1] === ctx.orig.pos[1] + (ctx.color === 'white' ? 1 : -1)
    : util.pawnDirAdvance(...ctx.orig.pos, ...ctx.dest.pos, ctx.color === 'white'));

const knight: Mobility = (ctx: MobilityContext) => util.knightDir(...ctx.orig.pos, ...ctx.dest.pos);

const bishop: Mobility = (ctx: MobilityContext) => util.bishopDir(...ctx.orig.pos, ...ctx.dest.pos);

const rook: Mobility = (ctx: MobilityContext) => util.rookDir(...ctx.orig.pos, ...ctx.dest.pos);

const cannon: Mobility = (ctx: MobilityContext) =>
  util.rookDir(...ctx.orig.pos, ...ctx.dest.pos);

const advisor: Mobility = (ctx: MobilityContext) =>
  util.bishopDir(...ctx.orig.pos, ...ctx.dest.pos);

const elephant: Mobility = (ctx: MobilityContext) =>
  util.bishopDir(...ctx.orig.pos, ...ctx.dest.pos);

const king: Mobility = (ctx: MobilityContext) =>
  util.kingDirNonCastling(...ctx.orig.pos, ...ctx.dest.pos);

const mobilityByRole: Record<string, Mobility> = {
  pawn, knight, bishop, rook, cannon, advisor, elephant, king,
};

export function premove(state: HeadlessState, key: cg.Key): cg.Key[] {
  const pieces = state.pieces;
  const piece = pieces.get(key);
  if (!piece || piece.color === state.turnColor) return [];
  const color = piece.color,
    friendlies = new Map([...pieces].filter(([_, p]) => p.color === color)),
    enemies = new Map([...pieces].filter(([_, p]) => p.color === util.opposite(color))),
    orig = { key, pos: util.key2pos(key) },
    mobility: Mobility = (ctx: MobilityContext) =>
      (mobilityByRole[piece.role]?.(ctx) ?? true) && state.premovable.additionalPremoveRequirements(ctx),
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
