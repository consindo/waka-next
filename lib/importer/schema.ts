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
      start_date: SqliteStorageClasses.char,
      end_date: SqliteStorageClasses.char,
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
  {
    filename: 'fare_attributes.txt',
    table: 'fare_attributes',
    tableSchema: {
      fare_id: SqliteStorageClasses.char,
      price: SqliteStorageClasses.real,
      currency_type: SqliteStorageClasses.char,
      payment_method: SqliteStorageClasses.integer,
      transfers: SqliteStorageClasses.integer,
      agency_id: SqliteStorageClasses.char,
      transfer_duration: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'fare_rules.txt',
    table: 'fare_rules',
    tableSchema: {
      fare_id: SqliteStorageClasses.char,
      route_id: SqliteStorageClasses.char,
      origin_id: SqliteStorageClasses.char,
      destination_id: SqliteStorageClasses.char,
      contains_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'timeframes.txt',
    table: 'timeframes',
    tableSchema: {
      timeframe_group_id: SqliteStorageClasses.char,
      start_time: SqliteStorageClasses.char,
      end_time: SqliteStorageClasses.char,
      service_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'fare_media.txt',
    table: 'fare_media',
    tableSchema: {
      fare_media_id: SqliteStorageClasses.char,
      fare_media_name: SqliteStorageClasses.char,
      fare_media_type: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'fare_products.txt',
    table: 'fare_products',
    tableSchema: {
      fare_product_id: SqliteStorageClasses.char,
      fare_product_name: SqliteStorageClasses.char,
      fare_media_id: SqliteStorageClasses.char,
      amount: SqliteStorageClasses.real,
      currency: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'fare_leg_rules.txt',
    table: 'fare_leg_rules',
    tableSchema: {
      leg_group_id: SqliteStorageClasses.char,
      network_id: SqliteStorageClasses.char,
      from_area_id: SqliteStorageClasses.char,
      to_area_id: SqliteStorageClasses.char,
      from_timeframe_group_id: SqliteStorageClasses.char,
      to_timeframe_group_id: SqliteStorageClasses.char,
      fare_product_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'fare_transfer_rules.txt',
    table: 'fare_transfer_rules',
    tableSchema: {
      from_leg_group_id: SqliteStorageClasses.char,
      to_leg_group_id: SqliteStorageClasses.char,
      transfer_count: SqliteStorageClasses.integer,
      duration_limit: SqliteStorageClasses.integer,
      duration_limit_type: SqliteStorageClasses.integer,
      fare_transfer_type: SqliteStorageClasses.integer,
      fare_product_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'areas.txt',
    table: 'areas',
    tableSchema: {
      area_id: SqliteStorageClasses.char,
      area_name: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'stop_areas.txt',
    table: 'stop_areas',
    tableSchema: {
      area_id: SqliteStorageClasses.char,
      stop_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'networks.txt',
    table: 'networks',
    tableSchema: {
      network_id: SqliteStorageClasses.char,
      network_name: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'route_networks.txt',
    table: 'route_networks',
    tableSchema: {
      network_id: SqliteStorageClasses.char,
      route_id: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'shapes.txt',
    table: 'shapes',
    tableSchema: {
      shape_id: SqliteStorageClasses.char,
      shape_pt_lat: SqliteStorageClasses.real,
      shape_pt_lon: SqliteStorageClasses.real,
      shape_pt_sequence: SqliteStorageClasses.integer,
      shape_dist_traveled: SqliteStorageClasses.real,
    },
  },
  {
    filename: 'frequencies.txt',
    table: 'frequencies',
    tableSchema: {
      trip_id: SqliteStorageClasses.char,
      start_time: SqliteStorageClasses.char,
      end_time: SqliteStorageClasses.char,
      headway_secs: SqliteStorageClasses.integer,
      exact_times: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'transfers.txt',
    table: 'transfers',
    tableSchema: {
      from_stop_id: SqliteStorageClasses.char,
      to_stop_id: SqliteStorageClasses.char,
      from_route_id: SqliteStorageClasses.char,
      to_route_id: SqliteStorageClasses.char,
      from_trip_id: SqliteStorageClasses.char,
      to_trip_id: SqliteStorageClasses.char,
      transfer_type: SqliteStorageClasses.integer,
      min_transfer_time: SqliteStorageClasses.integer,
    },
  },
  {
    filename: 'pathways.txt',
    table: 'pathways',
    tableSchema: {
      pathway_id: SqliteStorageClasses.char,
      from_stop_id: SqliteStorageClasses.char,
      to_stop_id: SqliteStorageClasses.char,
      pathway_mode: SqliteStorageClasses.integer,
      is_bidirectional: SqliteStorageClasses.char,
      length: SqliteStorageClasses.real,
      traversal_time: SqliteStorageClasses.integer,
      stair_count: SqliteStorageClasses.integer,
      max_slope: SqliteStorageClasses.real,
      min_width: SqliteStorageClasses.real,
      signposted_as: SqliteStorageClasses.char,
      reversed_signposted_as: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'levels.txt',
    table: 'levels',
    tableSchema: {
      level_id: SqliteStorageClasses.char,
      level_index: SqliteStorageClasses.real,
      level_name: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'translations.txt',
    table: 'translations',
    tableSchema: {
      table_name: SqliteStorageClasses.char,
      field_name: SqliteStorageClasses.char,
      language: SqliteStorageClasses.char,
      translation: SqliteStorageClasses.char,
      record_id: SqliteStorageClasses.char,
      record_sub_id: SqliteStorageClasses.char,
      field_value: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'feed_info.txt',
    table: 'feed_info',
    tableSchema: {
      feed_publisher_name: SqliteStorageClasses.char,
      feed_publisher_url: SqliteStorageClasses.char,
      feed_lang: SqliteStorageClasses.char,
      default_lang: SqliteStorageClasses.char,
      feed_start_date: SqliteStorageClasses.char,
      feed_end_date: SqliteStorageClasses.char,
      feed_version: SqliteStorageClasses.char,
      feed_contact_email: SqliteStorageClasses.char,
      feed_contact_url: SqliteStorageClasses.char,
    },
  },
  {
    filename: 'attributions.txt',
    table: 'attributions',
    tableSchema: {
      attribution_id: SqliteStorageClasses.char,
      agency_id: SqliteStorageClasses.char,
      route_id: SqliteStorageClasses.char,
      trip_id: SqliteStorageClasses.char,
      organization_name: SqliteStorageClasses.char,
      is_producer: SqliteStorageClasses.integer,
      is_operator: SqliteStorageClasses.integer,
      is_authority: SqliteStorageClasses.integer,
      attribution_url: SqliteStorageClasses.char,
      attribution_email: SqliteStorageClasses.char,
      attribution_phone: SqliteStorageClasses.char,
    },
  },
]
