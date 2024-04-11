/* eslint-disable no-var */
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
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
