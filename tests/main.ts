import { Chessground as XQGround, DEFAULT_FEN } from '../src-new/';
import { Chessground } from '../src/chessground';
import { allKeys } from '../src/util';
import type { Key } from '../src/types';

// ---- DOM 引用 ----
const xqContainer = document.getElementById('board-container-xq')!;
const chessContainer = document.getElementById('board-container-chess')!;
const fenOutput = document.getElementById('fen-output') as HTMLTextAreaElement;
const statusEl = document.getElementById('status')!;
const turnEl = document.getElementById('turn-indicator')!;

// ---- 创建中国象棋棋盘（chessground-xq）----
const xqGround = XQGround(xqContainer, {
    fen: DEFAULT_FEN,
    orientation: 'red',
    movable: { color: 'both', showDests: true },
    animation: { enabled: true, duration: 200 },
    boardImage: '/board_bg.jpg',
});

// ---- 创建国际象棋棋盘（@lichess-org/chessground）----
const chessGround = Chessground(chessContainer, {
    orientation: 'white',
    coordinates: false,
    movable: { color: 'both', showDests: true },
    animation: { enabled: true, duration: 200 },
});

// 走子后更新信息
chessGround.set({
    movable: {
        events: {
            after: (_from: Key, _to: Key) => {
                updateInfo();
            },
        },
    },
});

// ---- 信息更新 ----
function updateInfo() {
    const s = chessGround.state;
    fenOutput.value = chessGround.getFen();
    const turnText = s.turnColor === 'white' ? '🔴 红方' : '⚫ 黑方';
    turnEl.textContent = `走棋方: ${turnText}`;
    statusEl.textContent = `棋子: ${s.pieces.size} | 最后一步: ${s.lastMove ? s.lastMove.join('→') : '无'}`;
}

// ---- 随机步 ----
function randomMove() {
    const s = chessGround.state;
    const currentColor = s.turnColor;

    // 收集当前颜色的所有棋子
    const myPieces: Key[] = [];
    for (const [key, piece] of s.pieces) {
        if (piece.color === currentColor) myPieces.push(key);
    }
    if (myPieces.length === 0) return;

    // 随机选一个棋子
    const from = myPieces[Math.floor(Math.random() * myPieces.length)];

    // 生成一些目标位置（简单版：从所有交叉点中随机选一个不同的）
    const targets = allKeys.filter(k => k !== from);

    // 随机选一个目标
    const to = targets[Math.floor(Math.random() * targets.length)];
    chessGround.move(from, to);
    updateInfo();
}

// ---- 翻转 ----
function flipBoard() {
    chessGround.toggleOrientation();
    updateInfo();
}

// ---- 重置 ----
function resetBoard() {
    chessGround.set({ fen: DEFAULT_FEN });
    updateInfo();
}

// ---- 绑定按钮 ----
document.getElementById('btn-random')!.addEventListener('click', randomMove);
document.getElementById('btn-flip')!.addEventListener('click', flipBoard);
document.getElementById('btn-reset')!.addEventListener('click', resetBoard);

// 初始更新
updateInfo();
