SELECT
  (SELECT start_date
   FROM calendar
   ORDER BY start_date DESC) AS feed_start_date,
  (SELECT end_date
   FROM calendar
   ORDER BY end_date ASC) AS feed_end_date;

