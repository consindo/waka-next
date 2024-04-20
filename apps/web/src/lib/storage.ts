import { browser } from '$app/environment'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'

import { variables } from './variables'

type Fetch = typeof fetch
type Region = {
  region: Prefix
  bounds: [[number, number], [number, number]]
  url: string
  etag: string
  size: number
  shapesUrl?: string
  shapesEtag?: string
  shapesSize?: number
}

let regions: Region[] = []
let globalClient: Client
const databases: Record<string, DB> = {}

const saveData = (): boolean =>
  browser && 'connection' in navigator && (navigator.connection as { saveData: boolean }).saveData

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
        if (region === undefined || saveData()) {
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

export const getRegions = async (fetch: Fetch, loadRegion = createClient) => {
  if (regions.length > 0) return regions // don't refresh until page reload

  const data = await fetch('/api/regions').then((r) => r.json())
  regions = data.regions as Region[]

  // loads all regions that are in the area if the low data mode isn't on
  const geo: { latitude: number; longitude: number } = data.userLocation
  if (browser && !saveData() && geo.latitude !== 0 && geo.longitude !== 0) {
    regions
      .filter(
        (i) =>
          geo.longitude < i.bounds[0][0] &&
          geo.longitude > i.bounds[1][0] &&
          geo.latitude < i.bounds[0][1] &&
          geo.latitude > i.bounds[1][1]
      )
      .forEach((region) => {
        loadRegion(region.region, 'live', region.url, region.shapesUrl)
      })
  }

  return regions
}

export const createClient = async (
  prefix: Prefix,
  version: string,
  url: string,
  shapesUrl?: string
) => {
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
    console.log('offline gtfs client ready')

    let shapesData: Blob | undefined
    if (shapesUrl) {
      const shapesRes = await fetch(shapesUrl)
      shapesData = await shapesRes.blob()
    }
    globalClient.addRegion(prefix, db, shapesData)
    console.log('offline shapes ready')

    // resolve a promise if something is waiting on it
    if (resolvers[prefix]) {
      resolvers[prefix](globalClient)
    }
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
