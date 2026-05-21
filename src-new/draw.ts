/**
 * chessground-xq draw - 交互式绘制层（箭头和圆圈标注）
 *
 * 用户按住 Shift + 拖拽 画箭头
 * 用户按住 Ctrl + 点击 画圆圈
 */
import type { Key, XQState, Shape, ArrowShape, CircleShape } from './types';
import { keyToPos, posToKey } from './types';

/** 绘制状态 */
interface DrawState {
  active: boolean;
  startKey: Key | null;
  currentKey: Key | null;
  type: 'arrow' | 'circle' | null;
}

let drawState: DrawState = { active: false, startKey: null, currentKey: null, type: null };

/** 获取当前鼠标位置对应的 Key */
function keyFromSvgPoint(svgEl: SVGSVGElement, clientX: number, clientY: number): Key | null {
  const rect = svgEl.getBoundingClientRect();
  const viewBox = svgEl.getAttribute('viewBox');
  if (!viewBox) return null;
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

  const scaleX = vbW / rect.width;
  const scaleY = vbH / rect.height;

  const svgX = (clientX - rect.left) * scaleX;
  const svgY = (clientY - rect.top) * scaleY;

  const cellSize = vbW / 10;
  const gridX = Math.round(svgX / cellSize) - 1;
  const gridY = Math.round(svgY / cellSize) - 1;

  if (gridX >= 0 && gridX < 9 && gridY >= 0 && gridY < 10) {
    return posToKey(gridX, gridY);
  }
  return null;
}

/** 绑定绘制事件 */
export function bindDrawEvents(state: XQState): void {
  const svgEl = state.domElements.svgEl;
  if (!svgEl || !state.drawable.enabled) return;

  const handleMouseDown = (e: MouseEvent) => {
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const key = keyFromSvgPoint(svgEl, e.clientX, e.clientY);
    if (!key) return;

    drawState = {
      active: true,
      startKey: key,
      currentKey: key,
      type: e.shiftKey ? 'arrow' : 'circle',
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!drawState.active || drawState.type !== 'arrow') return;

    const key = keyFromSvgPoint(svgEl, e.clientX, e.clientY);
    if (!key) return;

    drawState.currentKey = key;

    // 实时绘制箭头预览
    const shapes: Shape[] = [];
    if (state.drawable.shapes) {
      shapes.push(...state.drawable.shapes);
    }

    // 移除旧的临时箭头（最后一个）
    const lastTemp = shapes[shapes.length - 1];
    if (
      lastTemp?.type === 'arrow' &&
      (lastTemp as ArrowShape).from === drawState.startKey &&
      !(lastTemp as ArrowShape).color
    ) {
      shapes.pop();
    }

    shapes.push({ type: 'arrow', from: drawState.startKey!, to: key, opacity: 0.3 });
    state.drawable.shapes = shapes;
    // We need a quick way to refresh just the draw layer
    // For now, we'll use the full render approach
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!drawState.active) return;

    const key = keyFromSvgPoint(svgEl, e.clientX, e.clientY);
    if (!key) {
      drawState = { active: false, startKey: null, currentKey: null, type: null };
      return;
    }

    const shapes: Shape[] = state.drawable.shapes || [];

    if (drawState.type === 'arrow' && drawState.startKey && key !== drawState.startKey) {
      // 移除临时预览
      const lastTemp = shapes[shapes.length - 1];
      if (
        lastTemp?.type === 'arrow' &&
        (lastTemp as ArrowShape).from === drawState.startKey &&
        !(lastTemp as ArrowShape).color
      ) {
        shapes.pop();
      }
      shapes.push({ type: 'arrow', from: drawState.startKey, to: key });
    } else if (drawState.type === 'circle') {
      shapes.push({ type: 'circle', pos: key });
    }

    state.drawable.shapes = shapes;

    drawState = { active: false, startKey: null, currentKey: null, type: null };
  };

  svgEl.addEventListener('mousedown', handleMouseDown);
  svgEl.addEventListener('mousemove', handleMouseMove);
  svgEl.addEventListener('mouseup', handleMouseUp);

  (svgEl as any).__xqgDrawHandlers = {
    mousedown: handleMouseDown,
    mousemove: handleMouseMove,
    mouseup: handleMouseUp,
  };
}

/** 解绑绘制事件 */
export function unbindDrawEvents(state: XQState): void {
  const svgEl = state.domElements.svgEl;
  if (svgEl && (svgEl as any).__xqgDrawHandlers) {
    const handlers = (svgEl as any).__xqgDrawHandlers;
    svgEl.removeEventListener('mousedown', handlers.mousedown);
    svgEl.removeEventListener('mousemove', handlers.mousemove);
    svgEl.removeEventListener('mouseup', handlers.mouseup);
    delete (svgEl as any).__xqgDrawHandlers;
  }
}
