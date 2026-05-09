CREATE TABLE IF NOT EXISTS activity_streams (
  activity_id BIGINT PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,

  time JSONB,
  distance JSONB,
  latlng JSONB,
  altitude JSONB,
  velocity JSONB,
  heartrate JSONB,
  cadence JSONB,
  watts JSONB,
  temp JSONB,
  moving JSONB,
  grade JSONB,

  fetched_at TIMESTAMP NOT NULL DEFAULT now()
);
