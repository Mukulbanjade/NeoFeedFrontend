/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional; set the same value in Vercel and Lovable so every deploy hits the same backend. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
