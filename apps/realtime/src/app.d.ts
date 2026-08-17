import type { RealtimeCache } from '$lib/realtime'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      name: string
      message: string
      stack?: string
      code?: number | string
    }
    interface Locals {
      realtimeCache: RealtimeCache
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
