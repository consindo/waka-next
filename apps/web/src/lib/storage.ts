import { browser } from '$app/environment'

import { Client } from '@lib/client'
import { DB } from '@lib/db'

import { variables } from './variables'

let globalClient: Client

let resolveClient: (value: Client) => void

// use this if you need to wait for the client to load (i.e after page load)
export const waitForClient: Promise<Client> = new Promise((resolve) => (resolveClient = resolve))

// use this if you know the client is already loaded
export const getClient = () => {
  return globalClient
}

const createClient = async () => {
  console.log('loading gtfs db')
  const db = new DB()

  try {
    const res = await fetch(variables.gtfsDbEndpoint)
    if (!res.ok) throw `http: ${res.status}`
    const data = await res.arrayBuffer()
    await db.connect()
    db.load(data)
    db.exec('select * from stops limit 1') // verifies the database actually works

    const client = new Client()
    client.addRegion('zz-sample1', db)

    globalClient = client
    resolveClient(client)
    console.log('offline gtfs client ready')
  } catch (err) {
    throw { message: 'could not load gtfs db on client', err }
  }
}

export const isClientReady = () => {
  if (!browser) throw 'This function should not be run on the server!'
  if (globalClient === undefined) {
    createClient() // runs in the background to not block the request
    return false
  }
  return true
}
