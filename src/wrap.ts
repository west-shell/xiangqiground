import { type HeadlessState } from './state.js';
import { createDefs, createElement as createSVG, setAttributes } from './svg.js';
import { type Color, colors, type Elements } from './types.js';
import { createEl, setVisible } from './util.js';

export function renderWrap(element: HTMLElement, s: HeadlessState): Elements {
  // .xq-wrap (element passed to Chessground)
  //   xq-container
  //     xq-board
  //     svg.xq-shapes
  //       defs
  //       g
  //     svg.xq-custom-svgs
  //       g
  //     xq-auto-pieces
  //     coords.files
  //     piece.ghost

  element.innerHTML = '';

  // ensure the xq-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling chessground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('xq-wrap');

  for (const c of colors) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const container = createEl('xq-container');
  element.appendChild(container);

  const board = createEl('xq-board');
  container.appendChild(board);

  let shapesBelow: SVGElement | undefined;
  let shapes: SVGElement | undefined;
  let customBelow: SVGElement | undefined;
  let custom: SVGElement | undefined;
  let autoPieces: HTMLElement | undefined;

  if (s.drawable.visible) {
    [shapesBelow, shapes] = ['xq-shapes-below', 'xq-shapes'].map(cls => svgContainer(cls, true));
    [customBelow, custom] = ['xq-custom-below', 'xq-custom-svgs'].map(cls => svgContainer(cls, false));

    autoPieces = createEl('xq-auto-pieces');

    container.appendChild(shapesBelow);
    container.appendChild(customBelow);
    container.appendChild(shapes);
    container.appendChild(custom);
    container.appendChild(autoPieces);
  }

  if (s.coordinates) {
    const cnNs = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const arNs = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // 红在下：中文在下、数字在上；黑在下：反之
    const bottomSrc = s.orientation === 'white' ? cnNs : arNs;
    const topSrc = s.orientation === 'white' ? arNs : cnNs;
    // 下面倒序、上面正序
    const bottomFiles = [...bottomSrc].reverse();
    const topFiles = [...topSrc];

    container.appendChild(
      renderCoords(topFiles, 'files top', s.orientation === 'white' ? 'black' : 'white'),
    );
    container.appendChild(
      renderCoords(bottomFiles, 'files bottom', s.orientation === 'white' ? 'white' : 'black'),
    );
  }

  let ghost: HTMLElement | undefined;
  if (!s.viewOnly && s.draggable.enabled && s.draggable.showGhost) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return { board, container, wrap: element, ghost, shapes, shapesBelow, custom, customBelow };
}

function svgContainer(cls: string, isShapes: boolean) {
  const svg = setAttributes(createSVG('svg'), {
    class: cls,
    viewBox: isShapes ? '-4 -4.5 9 10' : '-3.5 -4 9 10',
    preserveAspectRatio: 'xMidYMid slice',
  });
  if (isShapes) svg.appendChild(createDefs());
  svg.appendChild(createSVG('g'));
  return svg;
}

function renderCoords(elems: readonly string[], className: string, firstColor: Color): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  elems.forEach((elem, i) => {
    const light = i % 2 === (firstColor === 'white' ? 0 : 1);
    f = createEl('coord', `coord-${light ? 'light' : 'dark'}`);
    f.textContent = elem;
    el.appendChild(f);
  });
  return el;
}
