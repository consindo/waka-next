SELECT
  (SELECT start_date
   FROM calendar
   ORDER BY start_date ASC) AS feed_start_date,

  (SELECT end_date
   FROM calendar
   ORDER BY end_date DESC) AS feed_end_date,

  (SELECT agency_timezone
   FROM agency) AS feed_timezone;
