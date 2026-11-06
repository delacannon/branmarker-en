/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** public URL of the R2 bucket (r2.dev subdomain or custom domain), without the key prefix */
  readonly VITE_ASSETS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:local-manuals' {
  /** dev only: game -> PDF file names in public/manuals (not yet synced to R2) */
  const manuals: Record<string, string[]>;
  export default manuals;
}

declare module 'virtual:local-mml' {
  /** dev only: game -> MML excerpt files (<track>.json) in public/mml (not yet synced to R2) */
  const mml: Record<string, string[]>;
  export default mml;
}

declare module 'virtual:local-music' {
  /** dev only: game -> track file names (VGZ/MP3) in public/music (not yet synced to R2) */
  const music: Record<string, string[]>;
  export default music;
}
