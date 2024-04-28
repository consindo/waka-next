SELECT *,

  (SELECT agency_timezone
   FROM agency) AS feed_timezone
FROM feed_info LIMIT 1;
