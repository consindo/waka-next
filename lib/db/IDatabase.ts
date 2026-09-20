export const parseGtfsDate = (date: string) => {
  date = date.toString()
  return new Date(Date.parse(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`))
}

export abstract class IDatabase {
  abstract connect(): Promise<void>

  abstract reset(): void

  abstract load(data: ArrayBuffer): void

  abstract run(query: string): void

  abstract export(): Uint8Array<ArrayBufferLike>

  abstract execObject(query: string, params?: string[]): Record<string, unknown>[]
}
