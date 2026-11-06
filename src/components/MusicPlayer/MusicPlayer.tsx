import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from '../../tracks';
import { isMp3, mp3, setOnMp3End } from './mp3';
import { BANDS, bandRanges, levels, nowPlaying, playerControl } from './spectrum';
import { connectVgmTap, resumeAudio, setOnTrackEnd, setOnTrackReady, vgmEngine, type VgmPlayer } from './vgm';

/**
 * Soundtrack of the game on screen (VGZ rips, else MP3s): prev / play-pause / stop / next; feeds the 3D spectrum landscape.
 * REC records the scene (60 fps, 16:9 1080p or 9:16 Short: the button beside it) while the current song plays once from its start, with its sound.
 */
export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const player = useRef<VgmPlayer | null>(null);
  const mp3Track = isMp3(tracks[index]?.url ?? '');
  // a newer load wins over a slow earlier one
  const loadId = useRef(0);
  // nothing plays until the first click; then index is the loaded track
  const started = useRef(false);

  const load = useCallback(
    async (i: number) => {
      const id = ++loadId.current;
      started.current = true;
      setIndex(i);
      try {
        if (isMp3(tracks[i].url)) {
          player.current?.pause();
          await mp3.play(tracks[i].url);
          if (id !== loadId.current) return;
          setPlaying(true);
          setError(null);
          return;
        }
        mp3.pause();
        const p = (player.current ??= await vgmEngine());
        if (id !== loadId.current) return;
        const start = async () => {
          if (id !== loadId.current) return;
          p.play();
          connectVgmTap();
          setError(null);
          // audio still suspended (autoplay policy): show ▶ so a click starts the sound
          setPlaying(await resumeAudio());
        };
        setOnTrackReady(() => void start());
        p.loadMusicFromURL(tracks[i].url, { track: 0 }, () => void start(), (msg) => {
          if (id === loadId.current) setError(msg || 'cannot play this track');
        });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [tracks],
  );

  const step = useCallback((by: number) => void load((index + by + tracks.length) % tracks.length), [index, load, tracks.length]);

  // no autoplay: ▶ loads the first track; stop when the game changes or the player hides
  useEffect(() => {
    const loads = loadId;
    return () => {
      loads.current++;
      player.current?.pause();
      mp3.pause();
    };
  }, []);

  useEffect(() => {
    const next = () => step(1);
    setOnTrackEnd(next);
    setOnMp3End(next);
    return () => {
      setOnTrackEnd(null);
      setOnTrackReady(null);
      setOnMp3End(null);
    };
  }, [step]);

  const toggle = async () => {
    if (!started.current) return load(index);
    const p = mp3Track ? mp3 : player.current;
    if (!p) return;
    if (playing) {
      p.pause();
      setPlaying(false);
      return;
    }
    p.resume();
    setPlaying(mp3Track || (await resumeAudio()));
  };

  /** back to the start: ▶ plays the current track from its beginning */
  const stop = () => {
    loadId.current++;
    started.current = false;
    player.current?.pause();
    mp3.pause();
    setPlaying(false);
  };

  useEffect(() => {
    playerControl.stop = stop;
    return () => {
      playerControl.stop = () => {};
    };
  });

  // what plays, for the MML backdrop
  useEffect(() => {
    nowPlaying.track = playing ? (tracks[index] ?? null) : null;
    return () => {
      nowPlaying.track = null;
    };
  }, [playing, index, tracks]);

  // spectrum into the shared levels, no React renders per frame
  useEffect(() => {
    let frame = 0;
    let ranges: [number, number][] = [];
    const draw = () => {
      const data = !playing ? null : mp3Track ? mp3.freq() : player.current?.getFreqByteData();
      if (data && ranges.length === 0) ranges = bandRanges(data.length);
      for (let i = 0; i < BANDS; i++) {
        let target = 0;
        if (data) {
          const [a, b] = ranges[i];
          for (let k = a; k < b; k++) target = Math.max(target, data[k]);
          // curve: FM output keeps most bins loud, this lets the bands breathe
          target = (target / 255) ** 2.2;
        }
        // fast attack, slow fall
        levels[i] = target > levels[i] ? target : levels[i] * 0.9;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      levels.fill(0);
    };
  }, [playing, mp3Track]);

  const track = tracks[index];
  return (
    <div className="music-player">
      <div className="music-row">
        <button onClick={() => step(-1)} aria-label="Previous song" title="Previous song">
          &#9198;
        </button>
        <button onClick={() => void toggle()} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={stop} aria-label="Stop" title="Stop">
          &#9209;
        </button>
        <button onClick={() => step(1)} aria-label="Next song" title="Next song">
          &#9197;
        </button>
        <div className="music-title" title={track?.name}>
          <span className="music-count">
            {index + 1}/{tracks.length}
          </span>
          {error ? <span className="music-error">{error}</span> : track?.name}
        </div>
      </div>
    </div>
  );
}
