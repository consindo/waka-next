import type { DB } from '$lib/db'

type Prefix = `${string}-${string}`
type PrefixInput = Prefix | 'all'

export class Client {
  db: Record<Prefix, DB> = {}

  #runQuery = (prefix: PrefixInput, query: string) => {
    const databases: Prefix[] = prefix === 'all' ? (Object.keys(this.db) as Prefix[]) : [prefix]
    return databases.flatMap((i) => this.db[i].execObject(query).map((j) => ({ prefix: i, ...j })))
  }

  addRegion(prefix: Prefix, db: DB) {
    this.db[prefix] = db
  }

  getStops(prefix: PrefixInput) {
    return this.#runQuery(prefix, 'select 1 as number')
  }
}
