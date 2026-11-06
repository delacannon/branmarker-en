/**
 * VGM/VGZ playback: Jürgen Wothke's ScriptNodePlayer with the libvgm WASM backend (static/lib/, copied
 * from phaser4-megadrive). The scripts are global and the player is a singleton, so they are loaded
 * once, the first time a soundtrack plays.
 */
export interface VgmPlayer {
  play(): void;
  pause(): void;
  resume(): void;
  loadMusicFromURL(url: string, options: { track: number }, onComplete: () => void, onFail: (msg: string) => void): void;
  /** analyser bins, 0..255 */
  getFreqByteData(): Uint8Array | null;
}

interface ScriptNodePlayerStatic {
  createInstance(
    adapter: unknown,
    basePath: string,
    files: string[],
    enableSpectrum: boolean,
    onReady: () => void,
    onTrackReady: () => void,
    onTrackEnd: () => void,
  ): void;
  getInstance(): VgmPlayer;
  getWebAudioContext(): AudioContext | null;
}

declare global {
  interface Window {
    WASM_SEARCH_PATH?: string;
    ScriptNodePlayer?: ScriptNodePlayerStatic;
    VgmBackendAdapter?: new () => unknown;
    spp_backend_state_VGM?: { notReady: boolean; adapterCallback?: () => void };
  }
}

const LIB = `${import.meta.env.BASE_URL}lib/`;

/** called when the playing track ends; the player UI sets it */
let onTrackEnd: (() => void) | null = null;
export const setOnTrackEnd = (fn: (() => void) | null): void => {
  onTrackEnd = fn;
};

/** called when a loaded track is ready to play (loadMusicFromURL's own callback does not fire reliably) */
let onTrackReady: (() => void) | null = null;
export const setOnTrackReady = (fn: (() => void) | null): void => {
  onTrackReady = fn;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/** the WASM module compiles asynchronously after backend_vgm.js runs */
function backendReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('VGM backend timeout')), 15000);
    const check = () => {
      const state = window.spp_backend_state_VGM;
      if (state && !state.notReady) {
        clearTimeout(timeout);
        resolve();
      } else setTimeout(check, 50);
    };
    check();
  });
}

let engine: Promise<VgmPlayer> | undefined;

/** whether the engine was asked for (no scripts are loaded just to record silence) */
export const vgmLoaded = (): boolean => engine !== undefined;

export function vgmEngine(): Promise<VgmPlayer> {
  engine ??= (async () => {
    window.WASM_SEARCH_PATH = LIB;
    await loadScript(`${LIB}scriptprocessor_player.min.js`);
    await loadScript(`${LIB}backend_vgm.js`);
    await backendReady();
    const { ScriptNodePlayer, VgmBackendAdapter } = window;
    if (!ScriptNodePlayer || !VgmBackendAdapter) throw new Error('VGM player scripts missing');
    return new Promise<VgmPlayer>((resolve) => {
      ScriptNodePlayer.createInstance(
        new VgmBackendAdapter(),
        '',
        [],
        true,
        () => resolve(ScriptNodePlayer.getInstance()),
        () => onTrackReady?.(),
        () => onTrackEnd?.(),
      );
    });
  })();
  // a failed load can be retried
  engine.catch(() => {
    engine = undefined;
  });
  return engine;
}

/**
 * Browsers start audio suspended until a user gesture; any click on the player counts.
 * Resolves whether sound is actually running.
 */
export async function resumeAudio(): Promise<boolean> {
  const ctx = window.ScriptNodePlayer?.getWebAudioContext();
  if (!ctx) return false;
  if (ctx.state !== 'running') await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 300))]);
  return ctx.state === 'running';
}

// recording: a copy of the output, taken after the player's analyser (its last node before the speakers)
let tap: MediaStreamAudioDestinationNode | null = null;
let tapped: AudioNode | null = null;

/** The analyser only exists once a first track was loaded: called again whenever one starts. */
export function connectVgmTap(): void {
  // _analyzerNode: ScriptNodePlayer internal, created once with the first track
  const node = (window.ScriptNodePlayer?.getInstance() as unknown as { _analyzerNode?: AudioNode } | undefined)?._analyzerNode;
  if (!tap || !node || node === tapped) return;
  node.connect(tap);
  tapped = node;
}

/** The VGM output as a track to record (a clone: stopping it leaves the tap usable for the next recording). */
export async function vgmAudioTrack(): Promise<MediaStreamTrack | null> {
  await vgmEngine();
  const ctx = window.ScriptNodePlayer?.getWebAudioContext();
  if (!ctx) return null;
  tap ??= ctx.createMediaStreamDestination();
  connectVgmTap();
  return tap.stream.getAudioTracks()[0]?.clone() ?? null;
}
