import sqlite from 'node:sqlite'

import { SqlJSDB } from './db/sqljs'
import { NodeSqliteDB } from './db/nodesqlite'

export const DB = 'DatabaseSync' in sqlite ? NodeSqliteDB : SqlJSDB
