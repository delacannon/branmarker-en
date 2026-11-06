export interface Track {
  name: string;
  url: string;
}

export interface SongFiles {
  name: string;
  file: string;
  url: string;
  size: number;
}

const base = import.meta.env.BASE_URL;

// name, then the VGM's byte size
const SONGS: { name: string; vgm: number }[] = [
  { name: "01 Title - Opening Theme", vgm: 195497 },
  { name: "02 Prologue - Story Scenes", vgm: 431538 },
  { name: "03 Prologue Finale - Final Map", vgm: 472199 },
  { name: "04 Map 01 Theme", vgm: 353005 },
  { name: "05 Town Theme", vgm: 355270 },
  { name: "06 Map 03 Theme", vgm: 180740 },
  { name: "07 Map 04-05 Theme", vgm: 184568 },
  { name: "08 Map 06-10 Theme", vgm: 117455 },
  { name: "09 Map 11-14 Theme", vgm: 936102 },
  { name: "10 Map 15-17 Theme", vgm: 488042 },
  { name: "11 Map 18-23 Theme", vgm: 298114 },
  { name: "12 Battle Theme", vgm: 415376 },
  { name: "13 Battle Theme 2", vgm: 141974 },
  { name: "14 Boss - Event Theme", vgm: 260407 },
  { name: "15 Event Theme 2", vgm: 352751 },
  { name: "16 Jingle 1", vgm: 23128 },
  { name: "17 Jingle 2", vgm: 17660 },
  { name: "18 Jingle 3", vgm: 28619 },
  { name: "19 Ending Theme", vgm: 265018 },
  { name: "20 Ending Theme 2", vgm: 48090 },
];

export const songs: SongFiles[] = SONGS.map(({ name, vgm }) => {
  const file = `${name}.vgm`;
  return { name, file, url: `${base}music/${encodeURIComponent(file)}`, size: vgm };
});

export const tracks: Track[] = songs.map(({ name, url }) => ({ name, url }));
