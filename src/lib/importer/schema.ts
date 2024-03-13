enum SqliteStorageClasses {
  null = 'NULL',
  char = 'CHAR',
  real = 'REAL',
  integer = 'INTEGER',
  text = 'TEXT',
  blob = 'BLOB',
}

export type Schema = {
  filename: string
  table: string
  tableSchema: { [key: string]: SqliteStorageClasses }
}

export const schema: Schema[] = [
  {
    filename: 'agency.txt',
    table: 'agency',
    tableSchema: {
      agency_id: SqliteStorageClasses.char,
      agency_name: SqliteStorageClasses.char,
      agency_url: SqliteStorageClasses.char,
      agency_timezone: SqliteStorageClasses.char,
      agency_lang: SqliteStorageClasses.char,
      agency_phone: SqliteStorageClasses.char,
      agency_fare_url: SqliteStorageClasses.char,
      agency_email: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'stops.txt',
    table: 'stops',
    tableSchema: {
      stop_id: SqliteStorageClasses.char,
      stop_code: SqliteStorageClasses.char,
      stop_name: SqliteStorageClasses.char,
      tts_stop_name: SqliteStorageClasses.char,
      stop_desc: SqliteStorageClasses.char,
      stop_lat: SqliteStorageClasses.real,
      stop_lon: SqliteStorageClasses.real,
      zone_id: SqliteStorageClasses.char,
      stop_url: SqliteStorageClasses.char,
      location_type: SqliteStorageClasses.integer,
      parent_station: SqliteStorageClasses.char,
      stop_timezone: SqliteStorageClasses.char,
      wheelchair_boarding: SqliteStorageClasses.integer,
      level_id: SqliteStorageClasses.char,
      platform_code: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'routes.txt',
    table: 'routes',
    tableSchema: {
      route_id: SqliteStorageClasses.char,
      agency_id: SqliteStorageClasses.char,
      route_short_name: SqliteStorageClasses.char,
      route_long_name: SqliteStorageClasses.char,
      route_desc: SqliteStorageClasses.char,
      route_type: SqliteStorageClasses.integer,
      route_url: SqliteStorageClasses.char,
      route_color: SqliteStorageClasses.char,
      route_text_color: SqliteStorageClasses.char,
      route_sort_order: SqliteStorageClasses.char,
      continuous_pickup: SqliteStorageClasses.integer,
      continuous_drop_off: SqliteStorageClasses.integer,
      network_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'trips.txt',
    table: 'trips',
    tableSchema: {
      route_id: SqliteStorageClasses.char,
      service_id: SqliteStorageClasses.char,
      trip_id: SqliteStorageClasses.char,
      trip_headsign: SqliteStorageClasses.char,
      trip_short_name: SqliteStorageClasses.char,
      direction_id: SqliteStorageClasses.integer,
      block_id: SqliteStorageClasses.char,
      shape_id: SqliteStorageClasses.char,
      wheelchair_accessible: SqliteStorageClasses.integer,
      bikes_allowed: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'stop_times.txt',
    table: 'stop_times',
    tableSchema: {
      trip_id: SqliteStorageClasses.char,
      arrival_time: SqliteStorageClasses.char,
      departure_time: SqliteStorageClasses.char,
      stop_id: SqliteStorageClasses.char,
      stop_sequence: SqliteStorageClasses.char,
      stop_headsign: SqliteStorageClasses.char,
      pickup_type: SqliteStorageClasses.integer,
      drop_off_type: SqliteStorageClasses.integer,
      continuous_pickup: SqliteStorageClasses.integer,
      continuous_drop_off: SqliteStorageClasses.integer,
      shape_dist_traveled: SqliteStorageClasses.real,
      timepoint: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'calendar.txt',
    table: 'calendar',
    tableSchema: {
      service_id: SqliteStorageClasses.char,
      monday: SqliteStorageClasses.integer,
      tuesday: SqliteStorageClasses.integer,
      wednesday: SqliteStorageClasses.integer,
      thursday: SqliteStorageClasses.integer,
      friday: SqliteStorageClasses.integer,
      saturday: SqliteStorageClasses.integer,
      sunday: SqliteStorageClasses.integer,
      start_date: SqliteStorageClasses.integer,
      end_date: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'calendar_dates.txt',
    table: 'calendar_dates',
    tableSchema: {
      service_id: SqliteStorageClasses.char,
      date: SqliteStorageClasses.char,
      exception_type: SqliteStorageClasses.integer,
    },
  },
]