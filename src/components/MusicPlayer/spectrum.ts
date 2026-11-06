/** Spectrum of whatever plays, shared between the player (writes it each frame) and the 3D landscape (reads it). */
export const BANDS = 32;

/** 0..1 per band, low to high frequencies; all zero when nothing plays */
export const levels = new Float32Array(BANDS);

/** analyser bin range of each band, log-spaced: FM music lives in the low bins */
export function bandRanges(bins: number): [number, number][] {
  const lo = 1;
  const hi = Math.max(lo + BANDS, Math.floor(bins * 0.7));
  return Array.from({ length: BANDS }, (_, i) => {
    const a = Math.floor(lo * (hi / lo) ** (i / BANDS));
    const b = Math.max(a + 1, Math.floor(lo * (hi / lo) ** ((i + 1) / BANDS)));
    return [a, b];
  });
}

/** the track sounding right now (null when stopped or paused): the player writes it, the MML backdrop reads it */
export const nowPlaying: { track: { name: string; mml?: string } | null } = { track: null };

/** set by the mounted player, for whatever needs the song silenced */
export const playerControl: { stop: () => void } = { stop: () => {} };
