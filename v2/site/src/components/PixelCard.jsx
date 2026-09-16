'use client'
/* eslint-disable */
/**
 * PixelCard — React Bits (JS-CSS variant), vendored from
 * https://reactbits.dev/r/PixelCard-JS-CSS.json
 *
 * Four adaptations, all required to run here; the Pixel class, the animation
 * and the variant machinery are untouched:
 *
 *   1. `'use client'` — it uses hooks, canvas and `performance.now()`.
 *   2. A `hubble` variant, so the pixels are brand colours rather than the
 *      library's Tailwind-ish sky/rose ramps.
 *   3. `tabIndex` is always -1. Upstream makes the card itself a tab stop so
 *      it can catch focus, which would add four stops that do nothing — the
 *      real target is the link inside. React's onFocus bubbles, so keeping the
 *      handlers and dropping the tab stop still lights the effect when the
 *      inner link is focused.
 *   4. The stylesheet keeps only what the effect needs — see PixelCard.css.
 *   5. Remaining props are spread onto the container, so a caller can give the
 *      card the attributes its own role needs — `aria-live` and `aria-hidden`
 *      on the calculator's running total. Spread first, so the four props
 *      above still win and adaptation 3 cannot be undone by accident.
 */
import { useEffect, useRef } from 'react';
import './PixelCard.css';

class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: '#f8fafc,#f1f5f9,#cbd5e1',
    noFocus: false
  },
  blue: {
    activeColor: '#e0f2fe',
    gap: 10,
    speed: 25,
    colors: '#e0f2fe,#7dd3fc,#0ea5e9',
    noFocus: false
  },
  yellow: {
    activeColor: '#fef08a',
    gap: 3,
    speed: 20,
    colors: '#fef08a,#fde047,#eab308',
    noFocus: false
  },
  pink: {
    activeColor: '#fecdd3',
    gap: 6,
    speed: 80,
    colors: '#fecdd3,#fda4af,#e11d48',
    noFocus: true
  },
  /* Brand/Blue 400 → a mid tint → Brand/Blue 200, scattering over the card's
     darker hover ground. */
  hubble: {
    activeColor: '#F0F4FF',
    gap: 6,
    speed: 45,
    colors: '#3164FF,#7FA3FF,#F0F4FF',
    noFocus: false
  },
  /* The two comparison-bar grounds. Each palette is three steps *lighter* than
     the band it scatters over, which is what `hubble` cannot do here: its
     darkest colour is Blue/400 itself, so over a Blue/400 ground a third of the
     pixels would be invisible and the field would read half as dense. */
  barBlue: {
    activeColor: '#F0F4FF',
    gap: 6,
    speed: 45,
    colors: '#7FA3FF,#B9CCFF,#F0F4FF',
    noFocus: true
  },
  barGreen: {
    activeColor: '#FAFCE2',
    gap: 6,
    speed: 45,
    colors: '#DAE356,#E9EF9B,#FAFCE2',
    noFocus: true
  }
};

export default function PixelCard({ variant = 'default', gap, speed, colors, noFocus, active, className = '', children, ...rest }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const animationRef = useRef(null);
  const timePreviousRef = useRef(performance.now());
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext('2d');

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(',');
    const pxs = [];
    for (let x = 0; x < width; x += parseInt(finalGap, 10)) {
      for (let y = 0; y < height; y += parseInt(finalGap, 10)) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];

        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;

        pxs.push(new Pixel(canvasRef.current, ctx, x, y, color, getEffectiveSpeed(finalSpeed, reducedMotion), delay));
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = fnName => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleAnimation = name => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  /* Adaptation 5: a driven mode.
   *
   * Upstream the effect only exists as a hover/focus response, which is right
   * for a card. The comparison bar's bands are not hover targets — they are a
   * chart — and the comp textures them at rest, so there the scatter has to be
   * something the section can *trigger*: it runs as the bar wipes in.
   *
   * Passing `active` takes over from the pointer entirely, rather than adding to
   * it, so hovering a driven card cannot re-fire or undo it. */
  const driven = active !== undefined;
  const activeRef = useRef(false);

  const onMouseEnter = () => handleAnimation('appear');
  const onMouseLeave = () => handleAnimation('disappear');
  const onFocus = e => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation('appear');
  };
  const onBlur = e => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation('disappear');
  };

  useEffect(() => {
    if (!driven) return;
    activeRef.current = !!active;
    /* Nothing to do for a card that has not been switched on yet — the pixels
       already start hidden, and running `disappear` would burn a frame loop
       animating nothing. */
    if (active) handleAnimation('appear');
    else if (pixelsRef.current.some(px => !px.isIdle)) handleAnimation('disappear');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driven, active]);

  useEffect(() => {
    initPixels();
    /* Re-initialising resets every pixel to hidden, so a driven card that is
       already on has to be put back — otherwise the field vanishes the first
       time the window is resized. */
    const observer = new ResizeObserver(() => {
      initPixels();
      if (activeRef.current) handleAnimation('appear');
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  return (
    <div
      {...rest}
      ref={containerRef}
      className={`pixel-card ${className}`}
      onMouseEnter={driven ? undefined : onMouseEnter}
      onMouseLeave={driven ? undefined : onMouseLeave}
      onFocus={driven || finalNoFocus ? undefined : onFocus}
      onBlur={driven || finalNoFocus ? undefined : onBlur}
      tabIndex={-1}
    >
      <canvas className="pixel-canvas" ref={canvasRef} />
      {children}
    </div>
  );
}
