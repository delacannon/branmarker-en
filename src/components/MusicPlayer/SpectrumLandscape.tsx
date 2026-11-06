import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, type Camera, type LineSegments } from 'three';
import { coverPalette } from '../palette';
import { BANDS, levels } from './spectrum';

/** rows of history: the newest spectrum nearest, older ones scrolling back to the horizon */
const ROWS = 40;
/** points per row: the bands, interpolated, so a ridge is not just 32 straight strokes */
const POINTS = BANDS * 2;
/** world units; the box is 1 high, centred on the origin, its back face at z -0.1 */
const WIDTH = 14;
const NEAR_Z = -0.35;
const FAR_Z = -10;
const FLOOR_Y = -0.5;
const MAX_HEIGHT = 0.35;
/** new row this often (seconds) */
const STEP = 1 / 20;

/**
 * Lines fade out with distance through a 4x4 Bayer ordered dither instead of alpha: pixels drop out in the
 * PC-98 way, no blending.
 */
const vertexShader = /* glsl */ `
  attribute float fade;
  attribute vec3 tint;
  varying float vFade;
  varying vec3 vTint;
  void main() {
    vFade = fade;
    vTint = tint;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  varying float vFade;
  varying vec3 vTint;
  float bayer4(vec2 p) {
    ivec2 i = ivec2(mod(p, 4.0));
    int idx = i.x + i.y * 4;
    int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
    return (float(m[idx]) + 0.5) / 16.0;
  }
  void main() {
    if (vFade <= bayer4(gl_FragCoord.xy)) discard;
    gl_FragColor = vec4(vTint, 1.0);
  }
`;

/** turn the landscape around the box so it always stretches away behind it, wherever the camera orbits */
function faceCamera(line: LineSegments, camera: Camera): void {
  line.rotation.y = Math.atan2(camera.position.x, camera.position.z);
}

/**
 * The history rows as line strips: x across the full width, y the band level, z back toward the horizon.
 * Hidden while every row is flat: nothing playing, or a paused song's last ridges have rolled away.
 */
function writeRows(line: LineSegments, history: Float32Array): void {
  line.visible = history.some((v) => v > 0.002);
  if (!line.visible) return;
  const geometry = line.geometry;
const pos = geometry.attributes.position as BufferAttribute;
  const a = pos.array as Float32Array;
  // band value at point p of row r: linear between band centres
  const height = (r: number, p: number) => {
    const x = (p / (POINTS - 1)) * (BANDS - 1);
    const b = Math.floor(x);
    const lo = history[r * BANDS + b];
    const hi = history[r * BANDS + Math.min(b + 1, BANDS - 1)];
    return FLOOR_Y + (lo + (hi - lo) * (x - b)) * MAX_HEIGHT;
  };
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    const z = NEAR_Z + (FAR_Z - NEAR_Z) * (r / (ROWS - 1));
    for (let p = 0; p < POINTS - 1; p++) {
      for (const q of [p, p + 1]) {
        a[i++] = -WIDTH / 2 + (q / (POINTS - 1)) * WIDTH;
        a[i++] = height(r, q);
        a[i++] = z;
      }
    }
  }
  pos.needsUpdate = true;
}

/** per-vertex colour: `palette` across the width (darker `bg` while it loads), blending into `bg` far away */
function writeTints(geometry: BufferGeometry, bg: Color, palette: Color[]): void {
  const tint = geometry.attributes.tint as BufferAttribute;
  const stops = palette.length ? palette : [bg.clone().multiplyScalar(0.55)];
  const at = (x: number) => {
    const f = x * (stops.length - 1);
    const i = Math.floor(f);
    return stops[i].clone().lerp(stops[Math.min(i + 1, stops.length - 1)], f - i);
  };
  const a = tint.array as Float32Array;
  const c = new Color();
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    // the palette holds through the middle distance, then sinks into the background
    const far = (r / (ROWS - 1)) ** 1.8;
    for (let p = 0; p < POINTS - 1; p++) {
      for (const q of [p, p + 1]) {
        c.copy(at(q / (POINTS - 1))).lerp(bg, far);
        a[i++] = c.r;
        a[i++] = c.g;
        a[i++] = c.b;
      }
    }
  }
  tint.needsUpdate = true;
}

/**
 * Soundtrack spectrum as a line landscape behind the box: 32 bands across the full width, each row a past
 * frame. Lines take the `cover`'s palette across the width and fade into the background `color` toward the
 * horizon, dithering away.
 */
export function SpectrumLandscape({ color, cover }: { color: string; cover: string }) {
  const historyRef = useRef(new Float32Array(BANDS * ROWS));
  const elapsed = useRef(0);
  const line = useRef<LineSegments>(null);
  const [palette, setPalette] = useState<Color[]>([]);

  useEffect(() => {
    let live = true;
    const hue = (c: Color) => c.getHSL({ h: 0, s: 0, l: 0 }).h;
    // hue order: the colours run across the landscape as a gradient
    void coverPalette(cover).then((p) => live && setPalette([...p].sort((a, b) => hue(a) - hue(b))));
    return () => {
      live = false;
    };
  }, [cover]);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    // line segments: per row POINTS-1 segments, 2 vertices each
    const verts = ROWS * (POINTS - 1) * 2;
    const fade = new Float32Array(verts);
    let v = 0;
    for (let r = 0; r < ROWS; r++) {
      const t = r / (ROWS - 1);
      // the nearest rows come in gently too, then a long fade to nothing at the horizon
      const f = Math.min(1, (r + 1) / 3) * (1 - t) ** 1.6;
      for (let p = 0; p < (POINTS - 1) * 2; p++) fade[v++] = f;
    }
    g.setAttribute('position', new BufferAttribute(new Float32Array(verts * 3), 3));
    g.setAttribute('fade', new BufferAttribute(fade, 1));
    g.setAttribute('tint', new BufferAttribute(new Float32Array(verts * 3), 3));
    return g;
  }, []);

  const material = useMemo(() => new ShaderMaterial({ vertexShader, fragmentShader }), []);

  // vertex colours: palette across the width (darker background colour until it loads), into the background far away
  useEffect(() => {
    if (line.current) writeTints(line.current.geometry, new Color(color), palette);
  }, [color, palette]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ camera }, delta) => {
    if (line.current) faceCamera(line.current, camera);
    elapsed.current += delta;
    if (elapsed.current < STEP) return;
    elapsed.current = 0;
    const history = historyRef.current;
    history.copyWithin(BANDS, 0, (ROWS - 1) * BANDS);
    history.set(levels, 0);

    if (line.current) writeRows(line.current, history);
  });

  return <lineSegments ref={line} geometry={geometry} material={material} frustumCulled={false} visible={false} />;
}
