/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVIATIONSTACK_API_KEY?: string;
  readonly VITE_AVIATIONSTACK_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
