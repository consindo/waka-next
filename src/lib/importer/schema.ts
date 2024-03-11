enum SqliteStorageClasses {
  null = 'NULL',
  char = 'CHAR',
  real = 'REAL',
  integer = 'INTEGER',
  text = 'TEXT',
  blob = 'BLOB',
}

type TableSchema = {
  name: string
  schema: { [key: string]: SqliteStorageClasses }
}

export const schema: TableSchema[] = [
  {
    name: 'stops',
    schema: {
      stop_name: SqliteStorageClasses.char,
      parent_station: SqliteStorageClasses.char,
      stop_code: SqliteStorageClasses.char,
      stop_id: SqliteStorageClasses.char,
      stop_lat: SqliteStorageClasses.real,
      stop_lon: SqliteStorageClasses.real,
      location_type: SqliteStorageClasses.char,
      platform_code: SqliteStorageClasses.char,
    },
  },
]
