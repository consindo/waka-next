import { browser } from '$app/environment'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'

import { variables } from './variables'

type Fetch = typeof fetch

let regions: { region: Prefix; url: string }[] = []
let globalClient: Client
const databases: Record<string, DB> = {}

// allows a function to wait for a function to be ready (i.e after page load)
const promises: Record<Prefix, Promise<Client>> = {}
const resolvers: Record<Prefix, (value: Client) => void> = {}
export const waitForClient = (prefix: Prefix) => {
  // sets up a promise and attempts to resolve it with data
  if (promises[prefix] === undefined) {
    let rejectRequest: () => void
    promises[prefix] = new Promise((resolve, reject) => {
      resolvers[prefix] = resolve
      rejectRequest = reject
    })

    if (globalClient && globalClient.hasRegion(prefix)) {
      resolvers[prefix](globalClient)
    } else {
      getRegions(fetch).then((regions) => {
        const region = regions.find((i) => i.region === prefix)
        if (region === undefined) {
          rejectRequest()
        } else {
          createClient(region.region, 'live', region.url).catch(() => rejectRequest())
        }
      })
    }
  }
  return promises[prefix]
}

// use this if you know the client is already loaded
export const getClient = () => {
  return globalClient
}

export const getDatabases = () => {
  return databases
}

export const getRegions = async (fetch: Fetch) => {
  if (regions.length > 0) return regions // don't refresh until page reload

  const data = await fetch('/api/regions').then((r) => r.json())
  regions = data.regions

  // the default region
  if (browser) {
    const region = regions[0]
    createClient(region.region, 'live', region.url)
  }

  return regions
}

export const createClient = async (prefix: Prefix, version: string, url: string) => {
  console.log('loading gtfs for', `${prefix}:${version}`)
  const db = new DB()

  try {
    // the static server may server unqualified url's
    if (url.startsWith('/')) {
      url = variables.gtfsEndpoint + url
    }
    const res = await fetch(url)
    if (!res.ok) throw `http: ${res.status}`
    const data = await res.arrayBuffer()

    await db.connect()
    db.load(data)
    db.exec('select * from stops limit 1') // verifies the database actually works
    databases[`${prefix}:${version}`] = db

    if (globalClient === undefined) {
      globalClient = new Client()
    }
    globalClient.addRegion(prefix, db)

    // resolve a promise if something is waiting on it
    if (resolvers[prefix]) {
      resolvers[prefix](globalClient)
    }

    console.log('offline gtfs client ready')
  } catch (err) {
    throw { message: 'could not load gtfs db on client', err }
  }
}

export const isClientReady = (prefix: Prefix, fetch: Fetch) => {
  if (!browser) throw 'This function should not be run on the server!'
  if (globalClient === undefined || !globalClient.hasRegion(prefix)) {
    getRegions(fetch)
    return false
  }
  return true
}
