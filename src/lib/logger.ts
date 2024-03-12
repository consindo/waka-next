import { writable } from 'svelte/store'

class Logger {
  stream = writable('')

  info(message: string) {
    console.log(message)
    this.stream.set(message)
  }
}

export const logger = new Logger()
