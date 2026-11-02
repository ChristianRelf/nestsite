import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { EYE_AT, SHAPES, morpher, type Eyes, type Shape } from '../lib/shapes';

const pop = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

function Eye({ kind, x, ink }: { kind: Eyes; x: number; ink: string }) {
  switch (kind) {
    case 'happy':
      return <path d={`M${x - 5} 3q5-8 10 0`} fill="none" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />;
    case 'wide':
      return <circle cx={x} cy={0} r="6" fill={ink} />;
    case 'sleepy':
      return <path d={`M${x - 5} 1.5l10-2`} fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />;
    default:
      return <path d={`M${x - 2} 6L${x + 2} -6`} fill="none" stroke={ink} strokeWidth="8" strokeLinecap="round" />;
  }
}

let lastPointer = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', () => (lastPointer = performance.now()), { passive: true });
}

export interface MascotProps {
  shape: Shape;
  color: string;
  eyes?: Eyes;
  size?: number;
  /** Eyes follow the pointer. */
  track?: boolean;
  /** Blinks and glances around on its own. */
  alive?: boolean;
  /** Increment to make it hop. */
  hop?: number;
  /** Fixed gaze, -1..1 on each axis (overrides tracking). */
  gaze?: [number, number] | null;
  className?: string;
  /** Eye colour; defaults to white. */
  eyeColor?: string;
}

export function Mascot({ shape, color, eyes = 'dots', size = 48, track = false, alive = true, hop = 0, gaze = null, className, eyeColor = '#fff' }: MascotProps) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const body = useRef<SVGPathElement>(null);
  const prevShape = useRef(shape);
  const [blink, setBlink] = useState(false);

  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const lx = useSpring(lookX, { stiffness: 260, damping: 22 });
  const ly = useSpring(lookY, { stiffness: 260, damping: 22 });
  const ex = useMotionValue(EYE_AT[shape][0]);
  const ey = useMotionValue(EYE_AT[shape][1]);
  const [initialShape] = useState(shape);

  // Morph between silhouettes.
  useEffect(() => {
    const from = prevShape.current;
    if (from === shape) return;
    prevShape.current = shape;
    const path = body.current;
    const f = morpher(from, shape);
    const r0 = SHAPES[from].round;
    const r1 = SHAPES[shape].round;
    const opts = { type: 'spring', stiffness: 170, damping: 16 } as const;
    const a = animate(0, 1, {
      ...opts,
      onUpdate: (t) => {
        path?.setAttribute('d', f(t));
        path?.setAttribute('stroke-width', String(Math.max(0, r0 + (r1 - r0) * Math.min(1, t))));
      },
      onComplete: () => path?.setAttribute('d', SHAPES[shape].d),
    });
    const b = animate(ex, EYE_AT[shape][0], opts);
    const c = animate(ey, EYE_AT[shape][1], opts);
    return () => { a.stop(); b.stop(); c.stop(); };
  }, [shape, ex, ey]);

  // Blinking.
  useEffect(() => {
    if (!alive || reduced) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, 1800 + Math.random() * 4200);
    };
    loop();
    return () => clearTimeout(t);
  }, [alive, reduced]);

  // Fixed gaze.
  useEffect(() => {
    if (!gaze) return;
    lookX.set(gaze[0] * 6);
    lookY.set(gaze[1] * 5);
  }, [gaze?.[0], gaze?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pointer tracking.
  useEffect(() => {
    if (!track || reduced || gaze) return;
    const onMove = (e: PointerEvent) => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const ax = e.clientX - (r.left + r.width / 2);
      const ay = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(ax, ay) || 1;
      const k = Math.min(1, dist / 180);
      lookX.set((ax / dist) * 6.5 * k);
      lookY.set((ay / dist) * 5.5 * k);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [track, reduced, gaze, lookX, lookY]);

  // Idle glancing when the pointer is still (or on touch screens).
  useEffect(() => {
    if (!alive || reduced || gaze) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!track || performance.now() - lastPointer > 2800) {
          if (Math.random() < 0.55) {
            lookX.set((Math.random() - 0.5) * 12);
            lookY.set((Math.random() - 0.5) * 9);
          } else {
            lookX.set(0);
            lookY.set(0);
          }
        }
        loop();
      }, 1200 + Math.random() * 2200);
    };
    loop();
    return () => clearTimeout(t);
  }, [alive, reduced, track, gaze, lookX, lookY]);

  // Hop.
  useEffect(() => {
    if (!hop || reduced || !wrap.current) return;
    animate(wrap.current, { y: [0, -size * 0.22, 0], scaleY: [1, 1.06, 0.92, 1], scaleX: [1, 0.96, 1.06, 1] }, { duration: 0.55, ease: 'easeOut' });
  }, [hop, reduced, size]);

  const canBlink = eyes === 'dots' || eyes === 'wide';

  return (
    <motion.div ref={wrap} className={className} style={{ width: size, height: size, flexShrink: 0, transformOrigin: '50% 100%' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', display: 'block' }} aria-hidden="true">
        <path
          ref={body}
          d={SHAPES[initialShape].d}
          strokeWidth={SHAPES[initialShape].round}
          strokeLinejoin="round"
          style={{ fill: color, stroke: color, transition: 'fill .35s ease, stroke .35s ease' }}
        />
        <motion.g style={{ x: ex, y: ey }}>
          <motion.g style={{ x: lx, y: ly }}>
            <motion.g style={pop} animate={{ scaleY: blink && canBlink ? 0.1 : 1 }} transition={{ duration: 0.07 }}>
              <AnimatePresence initial={false}>
                <motion.g
                  key={eyes}
                  style={pop}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                >
                  <Eye kind={eyes} x={-8} ink={eyeColor} />
                  <Eye kind={eyes} x={8} ink={eyeColor} />
                </motion.g>
              </AnimatePresence>
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
