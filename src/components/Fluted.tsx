import { useEffect, useState } from 'react';

/**
 * Reeded-glass background: the image is cut into vertical strips and each strip
 * drifts up and down a little behind its neighbour, so a slow wave rolls across.
 * Each strip only paints its own slice, so it stays cheap to composite.
 */
export function Fluted({ src, stripWidth = 56, duration = 9, waves = 0.8 }: { src: string; stripWidth?: number; duration?: number; waves?: number }) {
  const [count, setCount] = useState(() => strips(stripWidth));
  useEffect(() => {
    const onResize = () => setCount(strips(stripWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [stripWidth]);

  return (
    <div className="absolute inset-0 flex">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative h-full flex-1 overflow-x-visible overflow-y-clip">
          <div
            className="flute absolute -inset-x-px -top-[6%] h-[112%]"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${count * 100}% 100%`,
              backgroundPositionX: `${count > 1 ? (i / (count - 1)) * 100 : 50}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${-((i / count) * waves * duration)}s`,
            }}
          />
          {/* Glass edge: a hairline highlight and a soft falloff across each reed. */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_0,rgba(255,255,255,0.008)_1px,transparent_40%,rgba(0,0,0,0.025)_100%)]" />
        </div>
      ))}
    </div>
  );
}

function strips(w: number) {
  if (typeof window === 'undefined') return 24;
  return Math.max(8, Math.min(36, Math.round(window.innerWidth / w)));
}
