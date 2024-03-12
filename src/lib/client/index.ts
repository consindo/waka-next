import type { DB } from '$lib/db'

export class Client {
  db: DB

  constructor(props: { db: DB }) {
    if (props?.db === undefined) throw 'requires db to be passed in'
    this.db = props.db
  }

  getStops() {
    return this.db.exec('select 1 as number')
  }
}
