
-- keep track of all users (id, tag, name)

CREATE TABLE users (
    user_pk SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    user_tag VARCHAR NOT NULL,
    user_name VARCHAR NOT NULL
);

-- From rememberMessage.js
-- 'content' is a VARCHAR and not TEXT because 
-- discord has a limit of 2000 chars per message (4000 for nitro users)
-- and VARCHAR has a limit of 10485760
CREATE TABLE messages (
    message_pk SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    timestamp TIMESTAMP
);

-- keep in mind, array size is just verbose and effectively does nothing
CREATE TABLE checkin_schedules (
    checkin_schedule_pk SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    utc_days VARCHAR[],
    utc_time INT[2],
    local_days VARCHAR[],
    local_time INT[2]
);

-- -
-- -
-- - I HAVE NOTHING FOR AVAILABILITY YET
-- -
-- -

-- from/to are dayjs strings. Ex: `JSON.stringify(dayjs())`
CREATE TABLE unavailabe_schedules (
    unavailable_pk SERIAL PRIMARY KEY,
    from_time VARCHAR,
    to_time VARCHAR,
    reason VARCHAR
);

-- this is not yet determined
-- instead of payload, consider using regular entries
CREATE TABLE checkin_queue
(
    checkin_q_pk UUID PRIMARY KEY,
    time_inserted TIMESTAMP,
    payload JSON
);

CREATE INDEX checkin_time_inserted_id
    ON checkin_queue (time_inserted ASC);

--------------------------                 EXAMPLE SQL QUERIES                 ----------------------



--------------------------              HOW TO USE A QUEUE IN SQL              ----------------------

-- inserting into queue
INSERT INTO checkin_queue (checkin_q_pk, time_inserted, payload)
VALUES (gen_random_uuid(), current_timestamp, '{
  "name": "example data",
  "description": "fifo queue read and write, no domain logic involved"
}');

-- pop from queue
DELETE
FROM checkin_queue item
WHERE item.checkin_q_pk =
      (SELECT item_inner.checkin_q_pk
       FROM checkin_queue item_inner
       ORDER BY item_inner.time_inserted ASC
           FOR UPDATE SKIP LOCKED
       LIMIT 1)
RETURNING item.checkin_q_pk, item.time_inserted, item.payload;