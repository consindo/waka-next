import { writable } from 'svelte/store'

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}

class Logger {
  stream = writable('')

  info(message: string) {
    console.log(message)
    this.stream.set(`[info] ${message}`)
  }

  error(message: string) {
    console.error(message)
    this.stream.set(`[error] ${message}`)
  }
}

export const logger = new Logger()
