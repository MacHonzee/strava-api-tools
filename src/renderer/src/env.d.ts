/// <reference types="vite/client" />

// preload.d.ts
declare global {
  interface Window {
    api: {
      db: {
        get: (id: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
        put: (doc: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }>
      }
    }
  }
}

export {}
