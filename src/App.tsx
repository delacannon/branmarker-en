import { Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { MathUtils, type EventDispatcher, type Group, type Vector3 } from 'three';
import { BoxFinishContext, GameBox } from './components/GameBox';
import { coverPalette } from './components/palette';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';
import { SongMarquee } from './components/MusicPlayer/SongMarquee';
import { SpectrumLandscape } from './components/MusicPlayer/SpectrumLandscape';
import { DownloadList } from './components/DownloadList';
import { PatchPanel } from './components/PatchPanel';
import { tracks } from './tracks';

const url = (file: string) => `${import.meta.env.BASE_URL}covers/${file}`;
const COVER = url('front.jpg');
const BACK = url('back.jpg');
const SIDE = url('side.jpg');
const [C1, C2] = ['rgb(214,203,178)', 'rgb(176,170,168)'];

const CAMERA_FOV = 45;
const HIDE_TEXT_BELOW = 1.25; // camera distance (default is 2): the heading fades out when zoomed in closer
const ORIGIN = { x: 0, y: 0, z: 0 } as unknown as Vector3;

/**
 * Three-point rig that moves with the camera: whatever face you look at is lit the same
 * (the world-fixed Environment leaves the side you spin to darker).
 */
function CameraLights() {
  const ref = useRef<Group>(null);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
    ref.current?.quaternion.copy(camera.quaternion);
  });
  return (
    <>
      <ambientLight intensity={0.4} />
      <group ref={ref}>
        <directionalLight position={[2, 1, 2]} intensity={1.8} />
        <directionalLight position={[-2, 0.5, 2]} intensity={0.8} />
        <directionalLight position={[0, 2, -1]} intensity={0.6} />
      </group>
    </>
  );
}

type Lighting = 'studio' | 'camera';

const WIGGLE_IDLE_MS = 1500;
const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Slow, small sway of the box while nobody drags or rotates it; eases out as soon as the camera is grabbed. */
function IdleWiggle({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const controls = useThree((state) => state.controls) as EventDispatcher<{ start: object; end: object }> | null;
  const lastActive = useRef(0);
  const dragging = useRef(false);
  const strength = useRef(0);

  useEffect(() => {
    if (!controls) return;
    const start = () => {
      dragging.current = true;
    };
    const end = () => {
      dragging.current = false;
      lastActive.current = performance.now();
    };
    controls.addEventListener('start', start);
    controls.addEventListener('end', end);
    return () => {
      controls.removeEventListener('start', start);
      controls.removeEventListener('end', end);
    };
  }, [controls]);

  useFrame(({ clock }, delta) => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    const idle = !dragging.current && performance.now() - lastActive.current > WIGGLE_IDLE_MS;
    // ease in slowly, get out of the way fast
    strength.current = MathUtils.damp(strength.current, idle ? 1 : 0, idle ? 0.8 : 6, delta);
    const t = clock.elapsedTime;
    group.rotation.y = Math.sin(t * 0.7) * 0.07 * strength.current;
    group.rotation.x = Math.sin(t * 0.53 + 1) * 0.025 * strength.current;
    group.position.y = Math.sin(t * 0.9) * 0.008 * strength.current;
  });

  return <group ref={ref}>{children}</group>;
}

const ZOOM_PER_PIXEL = 0.0015; // wheel delta -> distance factor (exp): 100 px of wheel = about 16%
const ZOOM_EASE = 9; // damping rate: the camera covers most of the way in ~0.25 s

/** Mouse-wheel zoom that eases: the wheel sets a target distance to the orbit target, the camera glides to it. */
function SmoothZoom() {
  const camera = useThree((state) => state.camera);
  const element = useThree((state) => state.gl.domElement);
  const controls = useThree((state) => state.controls) as (EventDispatcher & {
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    enableZoom: boolean;
    update(): void;
  }) | null;
  const goal = useRef<number | null>(null);

  useEffect(() => {
    goal.current = null;
    if (!controls) return;
    const onWheel = (e: WheelEvent) => {
      if (!controls.enableZoom) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const from = goal.current ?? camera.position.distanceTo(controls.target);
      // line mode (Firefox) reports lines, not pixels
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      goal.current = MathUtils.clamp(from * Math.exp(delta * ZOOM_PER_PIXEL), controls.minDistance, controls.maxDistance);
    };
    // capture: before OrbitControls' own wheel listener on the same element
    element.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => element.removeEventListener('wheel', onWheel, { capture: true });
  }, [camera, controls, element]);

  useFrame((_, dt) => {
    if (!controls || goal.current === null) return;
    const offset = camera.position.clone().sub(controls.target);
    const distance = offset.length();
    const next = MathUtils.damp(distance, goal.current, ZOOM_EASE, dt);
    if (Math.abs(next - goal.current) < 1e-4) goal.current = null;
    camera.position.copy(controls.target).add(offset.setLength(next));
    controls.update();
  });
  return null;
}

/** Reports when the camera gets closer to the orbit target than `threshold` (zoomed in a lot). */
function ZoomWatcher({ threshold, onChange }: { threshold: number; onChange: (near: boolean) => void }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as { target?: Vector3 } | null;
  const near = useRef(false);

  useFrame(() => {
    const distance = camera.position.distanceTo(controls?.target ?? ORIGIN);
    const isNear = distance < threshold;
    if (isNear !== near.current) {
      near.current = isNear;
      onChange(isNear);
    }
  });
  return null;
}

export default function App() {
  const [lighting, setLighting] = useState<Lighting>('studio');
  const [accent, setAccent] = useState('#ffffff');
  const [zoomedIn, setZoomedIn] = useState(false);

  useEffect(() => {
    let live = true;
    void coverPalette(COVER).then((p) => live && setAccent(p[0] ? `#${p[0].getHexString()}` : '#ffffff'));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyL') setLighting((l) => (l === 'studio' ? 'camera' : 'studio'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="app-container"
      style={{ background: `linear-gradient(180deg, ${C1} 0%, ${C2} 100%)`, '--accent': accent } as CSSProperties}
    >
      <div className="stage">
        <Canvas dpr={[1, 2]} flat gl={{ alpha: true, preserveDrawingBuffer: true }} camera={{ position: [0, 0, 2], fov: CAMERA_FOV }}>
          {/* L switches: world-fixed studio environment, or the camera-attached rig + glossy faces */}
          <BoxFinishContext.Provider value={lighting === 'camera' ? 'gloss' : 'matte'}>
            {lighting === 'camera' && <CameraLights />}
            {/* soundtrack spectrum as terrain under the box (flat while nothing plays) */}
            <SpectrumLandscape color={C2} cover={COVER} />
            <SongMarquee color={accent} background={C1} />
            <Suspense fallback={null}>
              <IdleWiggle>
                <GameBox cover={COVER} back={BACK} side={SIDE} />
              </IdleWiggle>
            </Suspense>
            {lighting === 'studio' && (
              <Environment background={false}>
                <Lightformer position={[0, 5, 0]} scale={10} intensity={4} />
                <Lightformer position={[5, 2, 5]} scale={8} intensity={3} />
                <Lightformer position={[-5, 2, 5]} scale={8} intensity={2} />
                <Lightformer position={[0, 2, -6]} scale={10} intensity={2.5} target={[0, 0, 0]} />
                <Lightformer position={[-6, 0, 0]} scale={10} intensity={1.8} target={[0, 0, 0]} />
                <Lightformer position={[6, 0, 0]} scale={8} intensity={1.5} target={[0, 0, 0]} />
              </Environment>
            )}
            <ZoomWatcher threshold={HIDE_TEXT_BELOW} onChange={setZoomedIn} />
            <SmoothZoom />
            <OrbitControls makeDefault minDistance={0.8} maxDistance={6} />
          </BoxFinishContext.Provider>
        </Canvas>
        <MusicPlayer tracks={tracks} />
        <DownloadList />
        <PatchPanel />
        <div className={zoomedIn ? 'game-heading hidden' : 'game-heading'}>
          <span className="game-company">D.O.</span>
          <span className="game-sep">/</span>
          <span className="game-name">Branmarker</span>
          <span className="game-ja">ブランマーカー</span>
          <span className="game-year">// 1992</span>
        </div>
      </div>
    </div>
  );
}
