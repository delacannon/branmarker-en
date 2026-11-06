/**
 * Applies the English patch to the Branmarker floppy images (.hdm), in the page. BPS patches for the files in each
 * disk's root directory. Every file is checked before anything is written, and read back after, so a disk is
 * never half-patched. Ported from tools/fat98.py of the translation project.
 */
export interface PatchFile {
  /** "<disk letter>/<file name>": A/MAP01 is MAP01 on disk A */
  path: string;
  patch: string;
  source: { size: number; crc32: string };
  target: { size: number; crc32: string };
}

export interface PatchManifest {
  lang: string;
  version: string;
  files: PatchFile[];
}

export interface PatchResult {
  path: string;
  status: 'patched' | 'already' | 'error';
  error?: string;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const hex = (crc: number) => crc.toString(16).padStart(8, '0');
const u16 = (d: Uint8Array, at: number) => d[at] | (d[at + 1] << 8);
const u32 = (d: Uint8Array, at: number) => (d[at] | (d[at + 1] << 8) | (d[at + 2] << 16) | (d[at + 3] << 24)) >>> 0;

function setU16(d: Uint8Array, at: number, value: number): void {
  d[at] = value & 255;
  d[at + 1] = (value >> 8) & 255;
}

function setU32(d: Uint8Array, at: number, value: number): void {
  for (let i = 0; i < 4; i++) d[at + i] = (value >>> (8 * i)) & 255;
}

function applyBps(source: Uint8Array, patch: Uint8Array): Uint8Array {
  if (patch.length < 16 || String.fromCharCode(...patch.subarray(0, 4)) !== 'BPS1') throw new Error('not a BPS patch');
  let p = 4;
  const varint = () => {
    let value = 0;
    let shift = 1;
    for (;;) {
      if (p >= patch.length) throw new Error('truncated BPS patch');
      const byte = patch[p++];
      value += (byte & 127) * shift;
      if (byte & 128) return value;
      shift *= 128;
      value += shift;
    }
  };
  const take = (length: number) => patch.subarray(p, (p += length));

  const sourceSize = varint();
  const targetSize = varint();
  take(varint()); // metadata
  const end = patch.length - 12;
  if (crc32(patch.subarray(0, patch.length - 4)) !== u32(patch, end + 8)) throw new Error('BPS patch is damaged (checksum)');
  if (source.length !== sourceSize || crc32(source) !== u32(patch, end)) throw new Error('this file is not the original the patch was made for');

  const out = new Uint8Array(targetSize);
  let written = 0;
  let sourceAt = 0;
  let targetAt = 0;
  while (p < end) {
    const command = varint();
    const length = Math.floor(command / 4) + 1;
    const action = command % 4;
    if (written + length > out.length) throw new Error('BPS patch writes past the target size');
    if (action === 0) {
      out.set(source.subarray(written, written + length), written);
      written += length;
    } else if (action === 1) {
      out.set(take(length), written);
      written += length;
    } else {
      const offset = varint();
      const delta = (offset & 1 ? -1 : 1) * Math.floor(offset / 2);
      if (action === 2) {
        sourceAt += delta;
        for (let i = 0; i < length; i++) out[written++] = source[sourceAt++];
      } else {
        targetAt += delta;
        for (let i = 0; i < length; i++) out[written++] = out[targetAt++];
      }
    }
  }
  if (written !== out.length || crc32(out) !== u32(patch, end + 4)) throw new Error('patched file checksum mismatch');
  return out;
}

// Branmarker's floppies: raw 77 cylinders × 2 heads × 8 sectors × 1024 B, FAT12 without a BPB
const SECTOR = 1024;
const IMAGE_SIZE = 77 * 2 * 8 * SECTOR;
const FAT1 = 1;
const FAT2 = 3;
const ROOT = 5;
const ROOT_ENTRIES = 192;
const DATA = 11; // cluster 2, one sector per cluster
const CLUSTERS = 77 * 2 * 8 - DATA + 2;

interface DirEntry {
  name: string;
  cluster: number;
  size: number;
  at: number;
}

const ASCII = new TextDecoder('ascii');

class Floppy {
  private img: Uint8Array;

  constructor(img: Uint8Array) {
    if (img.length !== IMAGE_SIZE) throw new Error('not a Branmarker disk image (a 1.25 MB .hdm is expected)');
    this.img = img;
  }

  private fat(cluster: number): number {
    const at = FAT1 * SECTOR + Math.floor((cluster * 3) / 2);
    const value = u16(this.img, at);
    return cluster & 1 ? value >> 4 : value & 0xfff;
  }

  private setFat(cluster: number, value: number): void {
    for (const sector of [FAT1, FAT2]) {
      const at = sector * SECTOR + Math.floor((cluster * 3) / 2);
      const old = u16(this.img, at);
      setU16(this.img, at, cluster & 1 ? (old & 0xf) | (value << 4) : (old & 0xf000) | value);
    }
  }

  private chain(first: number): number[] {
    const out: number[] = [];
    for (let c = first; c >= 2 && c < 0xff0 && out.length < CLUSTERS; c = this.fat(c)) out.push(c);
    return out;
  }

  private list(): DirEntry[] {
    const out: DirEntry[] = [];
    for (let i = 0; i < ROOT_ENTRIES; i++) {
      const at = ROOT * SECTOR + i * 32;
      const e = this.img.subarray(at, at + 32);
      if (e[0] === 0) break;
      if (e[0] === 0xe5 || e[11] & 0x18) continue;
      const base = ASCII.decode(e.subarray(0, 8)).trimEnd();
      const ext = ASCII.decode(e.subarray(8, 11)).trimEnd();
      out.push({ name: ext ? `${base}.${ext}` : base, cluster: u16(e, 26), size: u32(e, 28), at });
    }
    return out;
  }

  find(name: string): DirEntry | null {
    return this.list().find((e) => e.name.toUpperCase() === name.toUpperCase()) ?? null;
  }

  read(entry: DirEntry): Uint8Array {
    const out = new Uint8Array(entry.size);
    let done = 0;
    for (const c of this.chain(entry.cluster)) {
      if (done >= entry.size) break;
      const at = (DATA + c - 2) * SECTOR;
      const length = Math.min(SECTOR, entry.size - done);
      out.set(this.img.subarray(at, at + length), done);
      done += length;
    }
    if (done < entry.size) throw new Error(`${entry.name}: cluster chain shorter than the file`);
    return out;
  }

  write(entry: DirEntry, data: Uint8Array): void {
    for (const c of this.chain(entry.cluster)) this.setFat(c, 0);
    const needed = Math.ceil(data.length / SECTOR);
    const chain: number[] = [];
    for (let c = 2; c < CLUSTERS && chain.length < needed; c++) if (this.fat(c) === 0) chain.push(c);
    if (chain.length < needed) throw new Error(`disk full: ${entry.name} needs ${needed} clusters, ${chain.length} free`);
    chain.forEach((c, i) => {
      this.setFat(c, i + 1 < needed ? chain[i + 1] : 0xfff);
      const at = (DATA + c - 2) * SECTOR;
      this.img.fill(0, at, at + SECTOR);
      this.img.set(data.subarray(i * SECTOR, (i + 1) * SECTOR), at);
    });
    setU16(this.img, entry.at + 26, chain[0] ?? 0);
    setU32(this.img, entry.at + 28, data.length);
    entry.size = data.length;
    entry.cluster = chain[0] ?? 0;
  }
}

function patchFile(file: PatchFile, current: Uint8Array, patch: Uint8Array): { out: Uint8Array; result: PatchResult } {
  const crc = hex(crc32(current));
  if (current.length === file.target.size && crc === file.target.crc32) {
    return { out: current, result: { path: file.path, status: 'already' } };
  }
  if (current.length !== file.source.size || crc !== file.source.crc32) {
    const error = `not the original file (size ${current.length}, crc32 ${crc}; expected ${file.source.size}, ${file.source.crc32})`;
    return { out: current, result: { path: file.path, status: 'error', error } };
  }
  try {
    return { out: applyBps(current, patch), result: { path: file.path, status: 'patched' } };
  } catch (e) {
    return { out: current, result: { path: file.path, status: 'error', error: (e as Error).message } };
  }
}

/** the disk letter of a manifest path: "B/OPENG" is on disk B */
export const diskOf = (file: PatchFile): string => file.path.split('/')[0].toUpperCase();

/**
 * Patches `image` in place with the manifest's files that live on this disk (the others belong to the other
 * disks and are not reported). `disk` is null, and nothing was written, when no file is here or any failed its check.
 */
export function patchDisk(
  manifest: PatchManifest,
  image: Uint8Array,
  patches: Map<string, Uint8Array>,
): { disk: Uint8Array | null; results: PatchResult[] } {
  const disk = new Floppy(image);
  const found = new Map<PatchFile, DirEntry>();
  for (const file of manifest.files) {
    const entry = disk.find(file.path.split('/').pop()!);
    if (entry) found.set(file, entry);
  }
  // disk B has its own DOS.SYS and DATA.SYS: a file that is not ours but shares a name belongs to another disk,
  // unless this disk's other files say it is the same disk (then it is a damaged or different dump)
  const checked = [...found].map(([file, entry]) => ({ file, entry, ...patchFile(file, disk.read(entry), patches.get(file.patch)!) }));
  const letters = new Set(checked.filter((c) => c.result.status !== 'error').map((c) => diskOf(c.file)));
  const mine = letters.size ? checked.filter((c) => letters.has(diskOf(c.file))) : checked;
  const results = mine.map((c) => c.result);
  const writes = mine.filter((c) => c.result.status === 'patched').map((c) => ({ entry: c.entry, out: c.out }));
  if (!results.length || results.some((r) => r.status === 'error')) return { disk: null, results };
  for (const { entry, out } of writes) disk.write(entry, out);
  for (const { file, entry } of mine) {
    if (hex(crc32(disk.read(entry))) !== file.target.crc32) {
      throw new Error(`${file.path}: verify after writing failed`);
    }
  }
  return { disk: image, results };
}
