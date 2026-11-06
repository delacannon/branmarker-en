import { useRef, useState, type DragEvent } from 'react';
import { diskOf, patchDisk, type PatchManifest, type PatchResult } from './patcher';

const VERSION = '2026.11.06';
const base = `${import.meta.env.BASE_URL}patch/`;
const IMAGE = /\.hdm$/i;

type Status =
  | { kind: 'idle' }
  | { kind: 'working'; name: string }
  | { kind: 'done'; names: string[]; missing: string[]; results: PatchResult[] }
  | { kind: 'already'; missing: string[]; results: PatchResult[] }
  | { kind: 'failed'; message: string; results: PatchResult[] };

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cannot load ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

function save(data: Uint8Array, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data as BlobPart]));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

async function run(files: File[]): Promise<Status> {
  const manifest = (await (await fetch(`${base}manifest.json`)).json()) as PatchManifest;
  const entries = await Promise.all(
    manifest.files.map(async (f) => [f.patch, await fetchBytes(`${base}${f.patch}`)] as const),
  );
  const patches = new Map(entries);
  const results: PatchResult[] = [];
  const saved: { disk: Uint8Array; name: string }[] = [];
  const done = new Set<string>();
  // every disk is checked on its own; nothing is saved unless all of them pass
  for (const file of files) {
    const { disk, results: found } = patchDisk(manifest, new Uint8Array(await file.arrayBuffer()), patches);
    if (!found.length) continue; // disk D: nothing to change
    results.push(...found);
    if (found.some((r) => r.status === 'error')) {
      return { kind: 'failed', message: `Nothing was written: ${file.name} is not the original disk.`, results };
    }
    for (const r of found) done.add(diskOf({ path: r.path } as never));
    if (disk && found.some((r) => r.status === 'patched')) {
      saved.push({ disk, name: file.name.replace(/(\.[^.]+)$/, `-${manifest.lang}$1`) });
    }
  }
  if (!results.length) {
    return { kind: 'failed', message: 'These are not Branmarker disks A, B, C or E.', results };
  }
  const missing = [...new Set(manifest.files.map(diskOf))].filter((d) => !done.has(d));
  if (!saved.length) return { kind: 'already', missing, results };
  saved.forEach(({ disk, name }, i) => setTimeout(() => save(disk, name), i * 400)); // browsers allow a few downloads in a row
  return { kind: 'done', names: saved.map((s) => s.name), missing, results };
}

function ResultList({ results }: { results: PatchResult[] }) {
  return (
    <ul className="patch-results">
      {results.map(({ path, status, error }) => (
        <li key={path} className={status}>
          {path}
          <span>{status === 'error' ? error : status === 'already' ? 'already patched' : 'patched'}</span>
        </li>
      ))}
    </ul>
  );
}

/** The English translation patch; starts collapsed where it would cover the box. */
export function PatchPanel() {
  const [open, setOpen] = useState(() => !matchMedia('(max-width: 1100px)').matches);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const patch = async (list: FileList | File[] | undefined) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const bad = files.find((f) => !IMAGE.test(f.name));
    if (bad) {
      setStatus({ kind: 'failed', message: `${bad.name} is not a .hdm disk image.`, results: [] });
      return;
    }
    setStatus({ kind: 'working', name: files.length > 1 ? `${files.length} disks` : files[0].name });
    await new Promise((resolve) => setTimeout(resolve, 20)); // let "Patching…" paint
    try {
      setStatus(await run(files));
    } catch (e) {
      setStatus({ kind: 'failed', message: (e as Error).message, results: [] });
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    void patch(e.dataTransfer.files);
  };

  if (!open) {
    return (
      <button className="side-open right" onClick={() => setOpen(true)}>
        EN Patch
      </button>
    );
  }

  const working = status.kind === 'working';
  return (
    <aside className="side-panel right" aria-label="English patch">
      <header className="side-header">
        <div>
          <h2>English Patch</h2>
          <p>Version {VERSION}</p>
        </div>
        <button aria-label="Close patch panel" title="Close" onClick={() => setOpen(false)}>
          ×
        </button>
      </header>
      <div className="patch-body">
        <p>Play Branmarker in English. You need your own copy of the five floppy disk images.</p>
        <dl className="patch-applies">
          <dt>Applies to</dt>
          <dd>
            Branmarker (D.O., 1992)
            <br />
            PC-98 floppy version: Disk A, B, C and E (.hdm). Disk D is not changed.
          </dd>
          <dt>Tested</dt>
          <dd>On emulator only</dd>
        </dl>
        <button
          className={over ? 'patch-drop over' : 'patch-drop'}
          disabled={working}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          {working ? `Patching ${status.name}…` : 'Drop disk images here'}
          <small>{working ? 'Please wait' : 'disks A, B, C and E (.hdm), or click to choose'}</small>
        </button>
        <input
          ref={input}
          type="file"
          accept=".hdm"
          multiple
          hidden
          onChange={(e) => {
            void patch(e.target.files ?? undefined);
            e.target.value = '';
          }}
        />
        <p className="patch-note">Stays on your computer: nothing is uploaded. Your original image is not changed.</p>

        {status.kind === 'done' && (
          <div className="patch-status done" role="status">
            <b>Patched</b> {status.names.join(', ')} saved to your downloads.
            {status.missing.length > 0 && <p>Still to patch: disk {status.missing.join(', ')}.</p>}
            <ResultList results={status.results} />
          </div>
        )}
        {status.kind === 'already' && (
          <div className="patch-status" role="status">
            <b>Already patched</b> Mount these images as they are.
            {status.missing.length > 0 && <p>Still to patch: disk {status.missing.join(', ')}.</p>}
            <ResultList results={status.results} />
          </div>
        )}
        {status.kind === 'failed' && (
          <div className="patch-status failed" role="alert">
            {status.message}
            <ResultList results={status.results} />
          </div>
        )}

        <h3>Then mount them</h3>
        <ul>
          <li><b>np21w:</b> FDD → Drive 0 → Open… (disk A; swap the others in when asked), then Emulate → Reset</li>
          <li><b>T98-Next:</b> mount disk A in the first floppy drive, then reset</li>
        </ul>

        <a className="patch-kofi" href="https://ko-fi.com/alammo" target="_blank" rel="noreferrer">
          ♥ Support on Ko-fi
        </a>
      </div>
    </aside>
  );
}
