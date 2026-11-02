// Same silhouettes, eye spots and palette as Nest's Avatar.tsx, so site and app mascots match.
export type Shape = 'blob' | 'square' | 'pill' | 'triangle' | 'hex' | 'diamond' | 'leaf';
export type Eyes = 'dots' | 'happy' | 'wide' | 'sleepy';

export const SHAPES: Record<Shape, { d: string; round: number }> = {
  blob: { d: 'M50 7a43 43 0 1 1 0 86a43 43 0 1 1 0-86Z', round: 0 },
  square: { d: 'M34 10h32a24 24 0 0 1 24 24v32a24 24 0 0 1-24 24H34a24 24 0 0 1-24-24V34a24 24 0 0 1 24-24Z', round: 0 },
  pill: { d: 'M30 25h40a25 25 0 0 1 0 50H30a25 25 0 0 1 0-50Z', round: 0 },
  triangle: { d: 'M50 15L89 83H11Z', round: 14 },
  hex: { d: 'M50 10L84 29.5V70.5L50 90L16 70.5V29.5Z', round: 12 },
  diamond: { d: 'M50 12L88 50L50 88L12 50Z', round: 14 },
  leaf: { d: 'M50 6c4 6 34 34 34 57a34 34 0 0 1-68 0c0-23 30-51 34-57Z', round: 0 },
};

export const EYE_AT: Record<Shape, [number, number]> = {
  blob: [58, 42],
  square: [58, 44],
  pill: [60, 48],
  triangle: [54, 63],
  hex: [57, 46],
  diamond: [56, 47],
  leaf: [56, 61],
};

export const SHAPE_LIST: Shape[] = ['blob', 'square', 'hex', 'pill', 'diamond', 'leaf', 'triangle'];
export const EYES_LIST: Eyes[] = ['dots', 'happy', 'wide', 'sleepy'];
export const SHAPE_LABEL: Record<Shape, string> = {
  blob: 'Round', square: 'Square', pill: 'Pill', triangle: 'Triangle', hex: 'Hexagon', diamond: 'Diamond', leaf: 'Drop',
};
export const EYES_LABEL: Record<Eyes, string> = { dots: 'Curious', happy: 'Happy', wide: 'Wide-eyed', sleepy: 'Sleepy' };

export const COLORS = {
  brown: '#8a5a3b', red: '#e5484d', orange: '#f06f2c', amber: '#f2a533', green: '#4cbe6c',
  teal: '#3fb5a3', blue: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899', gray: '#6e6e76',
} as const;
export const COLOR_LIST = Object.values(COLORS);

/* ---------- Morphing: resample every silhouette to the same number of points ---------- */

const N = 96;
type Pt = [number, number];
const cache = new Map<Shape, Pt[]>();
let scratch: SVGPathElement | null = null;

function sample(shape: Shape): Pt[] {
  const hit = cache.get(shape);
  if (hit) return hit;
  if (!scratch) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    scratch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.appendChild(scratch);
    document.body.appendChild(svg);
  }
  scratch.setAttribute('d', SHAPES[shape].d);
  const len = scratch.getTotalLength();
  let pts: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const p = scratch.getPointAtLength((i / N) * len);
    pts.push([p.x, p.y]);
  }
  // Normalise winding so interpolation never turns a shape inside out.
  let area = 0;
  for (let i = 0; i < N; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % N];
    area += x1 * y2 - x2 * y1;
  }
  if (area < 0) pts = pts.reverse();
  cache.set(shape, pts);
  return pts;
}

/** Rotate `to` so its points line up with `from` (least total travel). */
function align(from: Pt[], to: Pt[]): Pt[] {
  let best = 0;
  let bestCost = Infinity;
  for (let off = 0; off < N; off++) {
    let cost = 0;
    for (let i = 0; i < N; i += 3) {
      const a = from[i];
      const b = to[(i + off) % N];
      cost += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    if (cost < bestCost) { bestCost = cost; best = off; }
  }
  return from.map((_, i) => to[(i + best) % N]);
}

export function morpher(from: Shape, to: Shape) {
  const a = sample(from);
  const b = align(a, sample(to));
  return (t: number) => {
    let d = '';
    for (let i = 0; i < N; i++) {
      const x = a[i][0] + (b[i][0] - a[i][0]) * t;
      const y = a[i][1] + (b[i][1] - a[i][1]) * t;
      d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    return d + 'Z';
  };
}
