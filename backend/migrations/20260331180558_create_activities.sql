CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    strava_activity_id BIGINT NOT NULL,

    activity_type TEXT,
    distance DOUBLE PRECISION,
    moving_time INTEGER,
    elapsed_time INTEGER,
    start_date TIMESTAMP,
    average_speed DOUBLE PRECISION,
    max_speed DOUBLE PRECISION,

    average_watts DOUBLE PRECISION,
    weighted_average_watts DOUBLE PRECISION,
    max_watts DOUBLE PRECISION,

    average_heartrate DOUBLE PRECISION,
    max_heartrate DOUBLE PRECISION,

    average_cadence DOUBLE PRECISION,

    total_elevation_gain DOUBLE PRECISION,
    elev_high DOUBLE PRECISION,
    elev_low DOUBLE PRECISION,

    summary_polyline TEXT,

    laps JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT now(),

    UNIQUE (user_id, strava_activity_id)
);

CREATE INDEX idx_activities_user_id
ON activities(user_id);
