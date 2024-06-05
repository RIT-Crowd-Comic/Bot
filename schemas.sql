
-- keep track of all users (id, tag, name)

CREATE TABLE users (
    _id SERIAL PRIMARY KEY, 
    user_id VARCHAR NOT NULL, 
    user_tag VARCHAR NOT NULL,
    user_name VARCHAR NOT NULL
);

-- From rememberMessage.js
-- 'content' is a VARCHAR and not TEXT because 
-- discord has a limit of 2000 chars per message (4000 for nitro users)
-- and VARCHAR has a limit of 10485760
CREATE TABLE messages (
    _id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    content VARCHAR NOT NULL
    timestamp TIMESTAMP
);

-- keep in mind, array size is just verbose and effectively does nothing
CREATE TABLE checkin_schedules (
    _id SERIAL PRIMARY KEY,
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
    _id SERIAL PRIMARY KEY,
    from: VARCHAR,
    to: VARCHAR,
    reason: VARCHAR
)
