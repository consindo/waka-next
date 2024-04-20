/* eslint-disable no-var */
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
      importResult?: {
        [region: string]: {
          status: string
          logs: string[]
        }
      }
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  var showSaveFilePicker: () => Promise<FileSystemFileHandle>
}

export {}
