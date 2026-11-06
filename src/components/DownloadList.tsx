import { useState } from 'react';
import { songs } from '../tracks';

const formatSize = (bytes: number): string =>
  bytes >= 1e6 ? `${Math.round(bytes / 1e6)} MB` : `${Math.ceil(bytes / 1e3)} KB`;

/** Soundtrack VGM rips, one link per song; starts collapsed where it would cover the box. */
export function DownloadList() {
  const [open, setOpen] = useState(() => !matchMedia('(max-width: 1100px)').matches);

  if (!open) {
    return (
      <button className="side-open" onClick={() => setOpen(true)}>
        ↓ Downloads
      </button>
    );
  }

  return (
    <aside className="side-panel" aria-label="Soundtrack downloads">
      <header className="side-header">
        <div>
          <h2>Soundtrack</h2>
          <p>{songs.length} tracks · VGM</p>
        </div>
        <button aria-label="Close downloads" title="Close" onClick={() => setOpen(false)}>
          ×
        </button>
      </header>
      <ol className="downloads-list">
        {songs.map(({ name, file, url, size }) => (
          <li key={name}>
            <span className="downloads-number">{name.slice(0, 2)}</span>
            <div className="downloads-song">
              <span className="downloads-name" title={name.slice(3)}>{name.slice(3)}</span>
              <span className="downloads-links">
                <a href={url} download={file} title={file}>
                  vgm
                  <small>{formatSize(size)}</small>
                </a>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
