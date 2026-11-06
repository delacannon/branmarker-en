import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, MathUtils, RepeatWrapping, ShaderMaterial, type Group, type Mesh } from 'three';
import { inkColor } from '../ink';
import { BANDS, levels, nowPlaying } from './spectrum';

const FONT = '"DotGothic16", "MS Gothic", monospace';
const TEXTURE_H = 256;
const FONT_PX = 200;
/** world size and place: a wide band in the distance, beyond the landscape's horizon */
const BAND_W = 70;
const BAND_H = 2;
const BAND_Y = 0.8;
const BAND_Z = -18;
const OPACITY = 0.28;
/** how far the text's colour goes from the background toward the ink colour: a soft blend, not a print */
const BLEND = 0.3;
/** band widths scrolled per second (leftward) */
const SPEED = 0.02;

/** "TITLE  ·  " once, white on transparent: it repeats across the band */
function strip(title: string): CanvasTexture {
  const text = `${title}   ·   `;
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = `${FONT_PX}px ${FONT}`;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(measure.measureText(text).width);
  canvas.height = TEXTURE_H;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${FONT_PX}px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, TEXTURE_H / 2 + FONT_PX * 0.06);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  return texture;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float repeat;
  uniform float offset;
  uniform float opacity;
  uniform vec3 color;
  varying vec2 vUv;
  void main() {
    float a = texture2D(map, vec2(vUv.x * repeat + offset, vUv.y)).a;
    // the band's ends dissolve: no hard edge at the sides
    float ends = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    gl_FragColor = vec4(color, a * ends * opacity);
  }
`;

/**
 * The playing song's name, huge and faint, scrolling sideways far behind the box. Fades in with a song and
 * out when it stops; breathes with the music like the other backdrops.
 */
export function SongMarquee({ color, background }: { color: string; background: string }) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [fontReady, setFontReady] = useState(false);
  const strength = useRef(0);
  const tint = useMemo(() => new Color(background).lerp(inkColor(color, background), BLEND), [color, background]);

  useEffect(() => {
    void document.fonts.load(`${FONT_PX}px "DotGothic16"`).finally(() => setFontReady(true));
  }, []);

  const texture = useMemo(() => (title && fontReady ? strip(title) : null), [title, fontReady]);
  useEffect(() => () => texture?.dispose(), [texture]);
  const material = useMemo(() => {
    if (!texture) return null;
    const image = texture.image as HTMLCanvasElement;
    return new ShaderMaterial({
      uniforms: {
        map: { value: texture },
        // copies of the strip across the band, at the band's aspect
        repeat: { value: (BAND_W / BAND_H) * (image.height / image.width) },
        offset: { value: 0 },
        opacity: { value: 0 },
        color: { value: tint },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, [texture, tint]);
  useEffect(() => () => material?.dispose(), [material]);

  useFrame(({ camera }, dt) => {
    // the name follows the track; the last one stays while it fades out
    const playing = nowPlaying.track?.name ?? null;
    if (playing && playing !== title) setTitle(playing);
    let loud = 0;
    for (let i = 0; i < BANDS; i++) loud += levels[i];
    const target = playing ? OPACITY * (0.75 + 0.5 * Math.min(1, (loud / BANDS) * 3)) : 0;
    strength.current = MathUtils.damp(strength.current, target, 2.5, dt);
    const uniforms = (mesh.current?.material as ShaderMaterial | undefined)?.uniforms;
    if (uniforms) {
      uniforms.offset.value = (uniforms.offset.value + dt * SPEED * uniforms.repeat.value) % 1;
      uniforms.opacity.value = strength.current;
    }
    // stays behind the box wherever the camera orbits, like the landscape
    if (group.current) group.current.rotation.y = Math.atan2(camera.position.x, camera.position.z);
  });

  if (!material) return null;
  return (
    <group ref={group}>
      <mesh ref={mesh} position={[0, BAND_Y, BAND_Z]} material={material}>
        <planeGeometry args={[BAND_W, BAND_H]} />
      </mesh>
    </group>
  );
}
