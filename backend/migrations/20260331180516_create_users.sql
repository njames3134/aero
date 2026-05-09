CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE,

    strava_athlete_id BIGINT UNIQUE,

    created_at TIMESTAMP DEFAULT now()
);
