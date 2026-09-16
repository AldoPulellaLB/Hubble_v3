import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '@/lib/motion'

const vertexShader = /* glsl */ `
varying vec2 v_texcoord;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_texcoord = uv;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform float u_shapeSize;
uniform float u_shapeRatio;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;
uniform vec3 u_color;

#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif

#ifndef VAR
#define VAR 0
#endif

#ifndef FNC_COORD
#define FNC_COORD
vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
}
#endif

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}
float sdCircle(in vec2 st, in vec2 center) {
    return length(st - center) * 2.0;
}
float sdPoly(in vec2 p, in float w, in int sides) {
    float a = atan(p.x, p.y) + PI;
    float r = TWO_PI / float(sides);
    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
    return d * 2.0 - w;
}

float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
float fill(in float x) { return 1.0 - aastep(0.0, x); }
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}
float stroke(in float d, in float t) { return (1.0 - aastep(t, abs(d))); }
float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float strokeAA(float x, float size, float w, float edge) {
    float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;
    float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)
            - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main() {
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1., -1.) + 0.5;

    float size = u_shapeSize;
    float roundness = u_roundness;
    float borderSize = u_borderSize;
    float circleSize = u_circleSize;
    float circleEdge = u_circleEdge;

    float sdfCircle = fill(
        sdCircle(st, posMouse),
        circleSize,
        circleEdge
    );

    float sdf;
    if (VAR == 0) {
        // vec2(size, size * ratio) rather than vec2(size): the registry's square
        // is the only rectangle its scalar size can describe, and this one has
        // to trace a 1:2 handset.
        sdf = sdRoundRect(st, vec2(size, size * u_shapeRatio), roundness);
        sdf = strokeAA(sdf, 0.0, borderSize, sdfCircle) * 4.0;
    } else if (VAR == 1) {
        sdf = sdCircle(st, vec2(0.5));
        sdf = fill(sdf, 0.6, sdfCircle) * 1.2;
    } else if (VAR == 2) {
        sdf = sdCircle(st, vec2(0.5));
        sdf = strokeAA(sdf, 0.58, 0.02, sdfCircle) * 4.0;
    } else if (VAR == 3) {
        sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);
        sdf = fill(sdf, 0.05, sdfCircle) * 1.4;
    }

    vec3 color = u_color;
    float alpha = sdf;
    gl_FragColor = vec4(color.rgb, alpha);
}
`;

type Props = {
  className?: string
  /** 0 rounded rect, 1 filled circle, 2 circle outline, 3 triangle. */
  variation?: 0 | 1 | 2 | 3
  pixelRatioProp?: number
  shapeSize?: number
  /** Height of the rounded rect as a multiple of its width. 1 is a square,
   *  which is all the registry's scalar size can express. */
  shapeRatio?: number
  roundness?: number
  borderSize?: number
  circleSize?: number
  circleEdge?: number
  /** Stroke colour as a `#rrggbb` hex. The registry hard-codes white. */
  color?: string
}

/**
 * React Bits' ShapeBlur, ported from the registry's JS/CSS variant.
 *
 * A full-bleed WebGL quad drawing one signed-distance shape whose edge is only
 * revealed within a soft circle that follows the pointer — the shape is there
 * the whole time, but you only see the part the cursor is near.
 *
 * Changes from the registry source, all of them for this project:
 *  · typed, and the mouse listener is bound to the mount rather than the
 *    document, so the effect only tracks a pointer that is actually over it
 *  · it does not run at all under `prefers-reduced-motion`, and it renders on
 *    demand rather than on an unconditional rAF, so an idle section is not
 *    holding a WebGL loop open behind everything else on the page
 *  · `three` is already a dependency at the version the registry asks for
 */
/** `#rrggbb` to a 0..1 triple. Parsed here rather than via THREE.Color so the
 *  value reaches the shader as the sRGB the design specifies, with no colour
 *  management applied in between. */
function hexToVec3(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export default function ShapeBlur({
  className = '',
  variation = 0,
  pixelRatioProp = 2,
  shapeSize = 1.2,
  shapeRatio = 1,
  roundness = 0.4,
  borderSize = 0.05,
  circleSize = 0.3,
  circleEdge = 0.5,
  color = '#ffffff',
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || prefersReducedMotion()) return;

    let active = true;
    let animationFrameId = 0;
    let time = 0,
      lastTime = 0;

    const vMouse = new THREE.Vector2();
    const vMouseDamp = new THREE.Vector2();
    const vResolution = new THREE.Vector2();

    let w = 1,
      h = 1;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const geo = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_mouse: { value: vMouseDamp },
        u_resolution: { value: vResolution },
        u_pixelRatio: { value: pixelRatioProp },
        u_shapeSize: { value: shapeSize },
        u_shapeRatio: { value: shapeRatio },
        u_roundness: { value: roundness },
        u_borderSize: { value: borderSize },
        u_circleSize: { value: circleSize },
        u_circleEdge: { value: circleEdge },
        u_color: { value: hexToVec3(color) }
      },
      defines: { VAR: variation },
      transparent: true
    });
    materialRef.current = material;

    const quad = new THREE.Mesh(geo, material);
    scene.add(quad);

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
    };

    /* Bound to the section rather than the document: the registry listens
       globally, which keeps the shape chasing a cursor that is nowhere near it.
       The section rather than the mount, so the shape reacts across the whole
       composition and not only where the quad happens to sit. */
    const host: HTMLElement = mount.closest('section') ?? mount.parentElement ?? mount;
    host.addEventListener('pointermove', onPointerMove);

    const resize = () => {
      if (!active) return;
      w = mount.clientWidth;
      h = mount.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);

      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);

      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();

      quad.scale.set(w, h, 1);
      vResolution.set(w, h).multiplyScalar(dpr);
      material.uniforms.u_pixelRatio.value = dpr;
    };

    resize();
    window.addEventListener('resize', resize);

    const ro = new ResizeObserver(() => {
      if (!active) return;
      resize();
    });
    ro.observe(mount);

    /* The registry runs its rAF for the life of the page. This one only runs
       while the section is actually on screen: a WebGL context rendering behind
       a section nobody is looking at is pure cost, and this page has a frame
       sequence and a scroll-scrubbed title wipe competing for the same frames. */
    let onScreen = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting === onScreen) return
        onScreen = e.isIntersecting
        if (onScreen) update()
        else cancelAnimationFrame(animationFrameId)
      },
      { rootMargin: '200px' },
    )
    io.observe(host)

    const update = () => {
      if (!active || !onScreen) return;
      time = performance.now() * 0.001;
      const dt = time - lastTime;
      lastTime = time;

      /* `damp` per axis, spelled out rather than indexed by string key —
         Vector2 has no index signature. */
      vMouseDamp.x = THREE.MathUtils.damp(vMouseDamp.x, vMouse.x, 8, dt);
      vMouseDamp.y = THREE.MathUtils.damp(vMouseDamp.y, vMouse.y, 8, dt);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(update);
    };

    return () => {
      active = false;

      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geo.dispose();
      material.dispose();
      materialRef.current = null;
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [variation]);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    /* u_pixelRatio is deliberately not synced from the prop. `resize` sets it
       from the display's own ratio, and it has to stay in step with
       u_resolution or the shader's mouse coordinate lands in the wrong place —
       the registry overwrites it here and breaks tracking on any display whose
       ratio is not the prop's default of 2. */
    mat.uniforms.u_shapeSize.value = shapeSize;
    mat.uniforms.u_shapeRatio.value = shapeRatio;
    mat.uniforms.u_roundness.value = roundness;
    mat.uniforms.u_borderSize.value = borderSize;
    mat.uniforms.u_circleSize.value = circleSize;
    mat.uniforms.u_circleEdge.value = circleEdge;
    mat.uniforms.u_color.value = hexToVec3(color);
  }, [shapeSize, shapeRatio, roundness, borderSize, circleSize, circleEdge, color]);

  /* No inline width/height. The registry hard-codes `100%`, and an inline
     declaration outranks any class the caller passes — so a consumer that sizes
     this with `inset` gets an element that is moved but never resized. Sizing
     belongs to the caller's stylesheet. */
  return <div className={className} ref={mountRef} aria-hidden="true" />
}
