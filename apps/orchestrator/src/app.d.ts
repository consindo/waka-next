import type { Client } from '@lib/client'

import type { ConfigManager } from '$lib/configManager'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      client: Client
      configManager: ConfigManager
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
