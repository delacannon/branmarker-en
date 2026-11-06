import { createContext, useContext, useMemo, useLayoutEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { MeshStandardMaterial, SRGBColorSpace, ClampToEdgeWrapping, type Texture } from 'three';

interface BoxTexturePaths {
  cover: string;
  back: string;
  side: string;
}

const SOLID_COLOR = '#000000';

/**
 * Printed faces: matte for the studio environment (its big light panels would glare on a glossy box), or
 * phaser4-megadrive's slight sheen for its camera-attached lights.
 */
export type BoxFinish = 'matte' | 'gloss';
export const BoxFinishContext = createContext<BoxFinish>('matte');
const FINISH = {
  matte: { roughness: 1, metalness: 0 },
  gloss: { roughness: 0.45, metalness: 0.02 },
} as const;

// url -> loaded texture, so textures of games browsed long ago can be freed (251 games would not fit in memory)
const registry = new Map<string, Texture>();

export function evictTextures(urls: string[]): void {
  const unique = [...new Set(urls)];
  for (const url of unique) {
    registry.get(url)?.dispose();
    registry.delete(url);
  }
  useTexture.clear(unique);
}

export function useBoxTextures(paths: BoxTexturePaths): MeshStandardMaterial[] {
  const finish = useContext(BoxFinishContext);
  const [coverTex, backTex, sideTex] = useTexture([
    paths.cover,
    paths.back,
    paths.side,
  ]);

  useLayoutEffect(() => {
    registry.set(paths.cover, coverTex);
    registry.set(paths.back, backTex);
    registry.set(paths.side, sideTex);
    coverTex.colorSpace = SRGBColorSpace;
    backTex.colorSpace = SRGBColorSpace;
    sideTex.colorSpace = SRGBColorSpace;
    sideTex.wrapS = ClampToEdgeWrapping;
    sideTex.wrapT = ClampToEdgeWrapping;
  }, [coverTex, backTex, sideTex, paths.cover, paths.back, paths.side]);

  return useMemo(() => {
    const solidMat = new MeshStandardMaterial({
      color: SOLID_COLOR,
      roughness: 0.3,
      metalness: 0.1,
    });
    const texMatProps = FINISH[finish];

    // BoxGeometry face order: [+X, -X, +Y, -Y, +Z, -Z]
    return [
      solidMat, // +X right
      new MeshStandardMaterial({ map: sideTex, ...texMatProps }), // -X left/spine
      solidMat, // +Y top
      solidMat, // -Y bottom
      new MeshStandardMaterial({ map: coverTex, ...texMatProps }), // +Z front
      new MeshStandardMaterial({ map: backTex, ...texMatProps }), // -Z back
    ];
  }, [coverTex, backTex, sideTex, finish]);
}
