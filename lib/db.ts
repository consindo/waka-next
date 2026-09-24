import sqlite from 'node:sqlite'

import { SqlJSDB } from './db/sqljs'
import { NodeSqliteDB } from './db/nodesqlite'

export type DB = SqlJSDB | NodeSqliteDB
export const DB = 'DatabaseSync' in sqlite ? NodeSqliteDB : SqlJSDB
