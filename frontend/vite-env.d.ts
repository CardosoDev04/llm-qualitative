/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string; // Add your custom environment variable here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}