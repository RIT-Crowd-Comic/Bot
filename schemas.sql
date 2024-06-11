
-- keep track of all users (id, tag, name)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    user_tag VARCHAR NOT NULL,
    user_name VARCHAR NOT NULL,
    deleted_at TIMESTAMP
);

-- From rememberMessage.js
-- 'content' is a VARCHAR and not TEXT because 
-- discord has a limit of 2000 chars per message (4000 for nitro users)
-- and VARCHAR has a limit of 10485760
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    timestamp TIMESTAMP,
    deleted_at TIMESTAMP
);

-- keep in mind, array size is just verbose and effectively does nothing
CREATE TABLE checkin_schedules (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    utc_days VARCHAR[],
    utc_time INT[2],
    local_days VARCHAR[],
    local_time INT[2],
    deleted_at TIMESTAMP
);

-- -
-- -
-- - I HAVE NOTHING FOR AVAILABILITY YET
-- -
-- -

-- from/to are dayjs strings. Ex: `JSON.stringify(dayjs())`
CREATE TABLE unavailable_schedules (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    from_time VARCHAR,
    to_time VARCHAR,
    reason VARCHAR,
    deleted_at TIMESTAMP
);

-- this is not yet determined
-- instead of payload, consider using regular entries
CREATE TABLE checkin_queue
(
    checkin_q_pk UUID PRIMARY KEY,
    time_inserted TIMESTAMP,
    payload JSON,
);

CREATE INDEX checkin_q_time_inserted_id
    ON checkin_queue (time_inserted ASC);

-- this is for rose thorn bud responses
CREATE TABLE checkin_responses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    rose VARCHAR,
    thorn VARCHAR,
    bud VARCHAR,
    timestamp TIMESTAMP,
    deleted_at TIMESTAMP
);

--------------------------                 EXAMPLE SQL QUERIES                 ----------------------

-- create or update user
-- technically transaction is not needed since there are 
-- only single statements
BEGIN touch_user;
    IF EXISTS (
        SELECT * FROM users WITH (
            UPDLOCK, SERIALIZABLE
        )
        WHERE user_id = $1
    )
        UPDATE users
        SET user_tag = $2, user_name = $3
        WHERE user_id = $1
    ELSE
        INSERT INTO users (user_id, user_tag, user_name)
        VALUES ($1, $2, $3);
COMMIT touch_user;

--------------------------              HOW TO USE A QUEUE IN SQL              ----------------------

-- inserting into queue
INSERT INTO checkin_queue (checkin_q_pk, time_inserted, payload)
VALUES (gen_random_uuid(), CURRENT_TIMESTAMP, '{
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