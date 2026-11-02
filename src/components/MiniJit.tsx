import { EYE_AT, SHAPES, type Shape } from '../lib/shapes';

/** A still jit: same silhouette and eye spot as <Mascot>, no timers or listeners. For bullets and lots-at-once. */
export function MiniJit({ shape, color, size = 16, className, happy = false }: { shape: Shape; color: string; size?: number; className?: string; happy?: boolean }) {
  const [x, y] = EYE_AT[shape];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ overflow: 'visible' }} aria-hidden="true">
      <path d={SHAPES[shape].d} fill={color} stroke={color} strokeWidth={SHAPES[shape].round} strokeLinejoin="round" />
      <g transform={`translate(${x} ${y})`} stroke="#fff" strokeWidth={happy ? 6 : 9} strokeLinecap="round" fill="none">
        {happy ? (
          <>
            <path d="M-13 3q5-8 10 0" />
            <path d="M3 3q5-8 10 0" />
          </>
        ) : (
          <>
            <path d="M-10 6L-6 -6" />
            <path d="M6 6L10 -6" />
          </>
        )}
      </g>
    </svg>
  );
}
