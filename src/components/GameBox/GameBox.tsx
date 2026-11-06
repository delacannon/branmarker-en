import { useState, useEffect } from 'react';
import { useBoxTextures } from './useBoxTextures';
import { MeshStandardMaterial, type Texture } from 'three';
import { useSpring, animated } from '@react-spring/three';

interface GameBoxProps {
  cover: string;
  back: string;
  side: string;
}

// Real: 19cm W × 26cm H × 5cm D → normalized
const WIDTH = 0.73;
const HEIGHT = 1;
/** without a spine scan (the side is the cover again) */
const DEFAULT_DEPTH = 0.19;
/** box depths a spine snaps to (every 0.02): the scan's proportions, not stretched, but few box sizes */
const DEPTHS = [0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26];

const aspect = (texture: Texture | null | undefined): number | null => {
  const image = texture?.image as { width?: number; height?: number } | undefined;
  return image?.width && image.height ? image.width / image.height : null;
};

/**
 * The depth whose spine matches the scans: the spine's width beside the front's, as the box shows the
 * front at WIDTH whatever its scan's proportions (a narrow front scan would make the spine look thin).
 */
function spineDepth(side: Texture | null | undefined, front: Texture | null | undefined): number {
  const sideAspect = aspect(side);
  const frontAspect = aspect(front);
  if (!sideAspect || !frontAspect) return DEFAULT_DEPTH;
  const depth = WIDTH * (sideAspect / frontAspect);
  return DEPTHS.reduce((best, d) => (Math.abs(d - depth) < Math.abs(best - depth) ? d : best));
}

// Indent dimensions
const BORDER = 0.012;
const INDENT = 0.008;

// Opening seam
const SEAM_HEIGHT = 0.003;
const SEAM_DEPTH = 0.002;

const borderMat = new MeshStandardMaterial({
  color: '#000000',
  roughness: 0.3,
  metalness: 0.1,
});
const seamMat = new MeshStandardMaterial({
  color: '#000000',
  roughness: 0.2,
  metalness: 0.1,
});

export function GameBox({ cover, back, side }: GameBoxProps) {
  const materials = useBoxTextures({ cover, back, side });
  const depth = side === cover ? DEFAULT_DEPTH : spineDepth(materials[1].map, materials[4].map);
  // 0 = front, 1 = side, 2 = back
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setViewIndex((i) => (i + 1) % 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rotations = [0, Math.PI * 0.65, Math.PI];
  const { rotationY } = useSpring({
    rotationY: rotations[viewIndex],
    config: { mass: 1, tension: 120, friction: 20 },
  });

  // Main box reduced by indent on top, bottom, and right side
  const mainW = WIDTH - INDENT;
  const mainH = HEIGHT - INDENT * 2;

  return (
    <animated.group rotation-y={rotationY}>
      {/* Main box body - shifted left and centered vertically */}
      <mesh material={materials} position={[-INDENT / 2, 0, 0]}>
        <boxGeometry args={[mainW, mainH, depth]} />
      </mesh>

      {/* === TOP BORDER === */}
      {/* Front */}
      <mesh
        material={borderMat}
        position={[0, HEIGHT / 2 - INDENT / 2, depth / 2 - BORDER / 2]}
      >
        <boxGeometry args={[WIDTH, INDENT, BORDER]} />
      </mesh>
      {/* Back */}
      <mesh
        material={borderMat}
        position={[0, HEIGHT / 2 - INDENT / 2, -depth / 2 + BORDER / 2]}
      >
        <boxGeometry args={[WIDTH, INDENT, BORDER]} />
      </mesh>
      {/* Left only */}
      <mesh
        material={borderMat}
        position={[-WIDTH / 2 + BORDER / 2, HEIGHT / 2 - INDENT / 2, 0]}
      >
        <boxGeometry args={[BORDER, INDENT, depth - BORDER * 2]} />
      </mesh>

      {/* === BOTTOM BORDER === */}
      {/* Front */}
      <mesh
        material={borderMat}
        position={[0, -HEIGHT / 2 + INDENT / 2, depth / 2 - BORDER / 2]}
      >
        <boxGeometry args={[WIDTH, INDENT, BORDER]} />
      </mesh>
      {/* Back */}
      <mesh
        material={borderMat}
        position={[0, -HEIGHT / 2 + INDENT / 2, -depth / 2 + BORDER / 2]}
      >
        <boxGeometry args={[WIDTH, INDENT, BORDER]} />
      </mesh>
      {/* Left only */}
      <mesh
        material={borderMat}
        position={[-WIDTH / 2 + BORDER / 2, -HEIGHT / 2 + INDENT / 2, 0]}
      >
        <boxGeometry args={[BORDER, INDENT, depth - BORDER * 2]} />
      </mesh>

      {/* === RIGHT SIDE BORDER (+X) === */}
      <mesh
        material={borderMat}
        position={[WIDTH / 2 - INDENT / 2, 0, depth / 2 - BORDER / 2]}
      >
        <boxGeometry args={[INDENT, HEIGHT - INDENT * 2, BORDER]} />
      </mesh>
      <mesh
        material={borderMat}
        position={[WIDTH / 2 - INDENT / 2, 0, -depth / 2 + BORDER / 2]}
      >
        <boxGeometry args={[INDENT, HEIGHT - INDENT * 2, BORDER]} />
      </mesh>

      {/* === OPENING SEAM (top line) === */}
      <mesh
        material={seamMat}
        position={[
          -INDENT / 2,
          HEIGHT / 2 - INDENT,
          depth / 2 + SEAM_DEPTH / 2,
        ]}
      >
        <boxGeometry args={[mainW, SEAM_HEIGHT, SEAM_DEPTH]} />
      </mesh>
      <mesh
        material={seamMat}
        position={[
          -INDENT / 2,
          HEIGHT / 2 - INDENT,
          -depth / 2 - SEAM_DEPTH / 2,
        ]}
      >
        <boxGeometry args={[mainW, SEAM_HEIGHT, SEAM_DEPTH]} />
      </mesh>
      <mesh
        material={seamMat}
        position={[-WIDTH / 2 - SEAM_DEPTH / 2, HEIGHT / 2 - INDENT, 0]}
      >
        <boxGeometry args={[SEAM_DEPTH, SEAM_HEIGHT, depth]} />
      </mesh>
      <mesh
        material={seamMat}
        position={[WIDTH / 2 - INDENT + SEAM_DEPTH / 2, HEIGHT / 2 - INDENT, 0]}
      >
        <boxGeometry args={[SEAM_DEPTH, SEAM_HEIGHT, depth]} />
      </mesh>
    </animated.group>
  );
}
