import { browser } from '$app/environment'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'

import { variables } from './variables'

let globalClient: Client
const databases: Record<string, DB> = {}

let resolveClient: (value: Client) => void

// use this if you need to wait for the client to load (i.e after page load)
export const waitForClient: Promise<Client> = new Promise((resolve) => (resolveClient = resolve))

// use this if you know the client is already loaded
export const getClient = () => {
  return globalClient
}

export const getDatabases = () => {
  return databases
}

export const createClient = async (region: Prefix, version: string, url: string) => {
  console.log('loading gtfs db')
  const db = new DB()

  try {
    const res = await fetch(url)
    if (!res.ok) throw `http: ${res.status}`
    const data = await res.arrayBuffer()
    console.log(data.byteLength)
    await db.connect()
    db.load(data)
    db.exec('select * from stops limit 1') // verifies the database actually works
    databases[`${region}:${version}`] = db

    if (globalClient === undefined) {
      globalClient = new Client()
    }
    globalClient.addRegion(region, db)

    resolveClient(globalClient)
    console.log('offline gtfs client ready')
  } catch (err) {
    throw { message: 'could not load gtfs db on client', err }
  }
}

export const isClientReady = () => {
  if (!browser) throw 'This function should not be run on the server!'
  if (globalClient === undefined) {
    createClient('zz-sample1', 'live', variables.gtfsEndpoint + '/gtfs.db') // runs in the background to not block the request
    return false
  }
  return true
}
