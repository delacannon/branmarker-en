/**
 * MP3 playback for soundtracks without a VGM rip (khinsider): one shared <audio> routed through an analyser,
 * so the spectrum works like the VGM one. crossOrigin: the bucket sends CORS headers, without them the
 * analyser would only read silence.
 */
let audio: HTMLAudioElement | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;
// recording: a copy of the output after the analyser
let tap: MediaStreamAudioDestinationNode | null = null;

/** called when the playing track ends; the player UI sets it */
let onEnded: (() => void) | null = null;
export const setOnMp3End = (fn: (() => void) | null): void => {
  onEnded = fn;
};

function element(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.addEventListener('ended', () => onEnded?.());
  const ctx = new AudioContext();
  const source = ctx.createMediaElementSource(audio);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser).connect(ctx.destination);
  tap = ctx.createMediaStreamDestination();
  analyser.connect(tap);
  bins = new Uint8Array(analyser.frequencyBinCount);
  audio.addEventListener('play', () => void ctx.resume());
  return audio;
}

export const mp3 = {
  async play(url: string): Promise<void> {
    const el = element();
    el.src = url;
    await el.play();
  },
  pause: () => audio?.pause(),
  resume: () => void audio?.play(),
  /** the output as a track to record (a clone: stopping it leaves the tap usable for the next recording) */
  audioTrack(): MediaStreamTrack | null {
    element();
    return tap?.stream.getAudioTracks()[0]?.clone() ?? null;
  },
  freq(): Uint8Array | null {
    if (!analyser || !bins) return null;
    analyser.getByteFrequencyData(bins);
    return bins;
  },
};

export const isMp3 = (url: string): boolean => /\.mp3(\?|$)/i.test(url);
