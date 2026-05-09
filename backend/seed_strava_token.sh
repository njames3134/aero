#!/usr/bin/env bash
set -e

ENV_FILE="../.env"

if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "❌ .env not found at $ENV_FILE"
  exit 1
fi

# Validate required env vars
: "${STRAVA_ACCESS_TOKEN:?Missing STRAVA_ACCESS_TOKEN}"
: "${STRAVA_REFRESH_TOKEN:?Missing STRAVA_REFRESH_TOKEN}"
: "${DB_NAME:=aero}"
: "${DB_USER:=postgres}"
: "${DB_CONTAINER:=db}"

USER_ID=1

echo "🧑 Seeding user..."

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
INSERT INTO users (id, email, strava_athlete_id)
VALUES (
    $USER_ID,
    'dev@example.com',
    123456
)
ON CONFLICT (id) DO NOTHING;
EOF

echo "🔑 Seeding Strava token..."

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
INSERT INTO strava_tokens (
    user_id,
    access_token,
    refresh_token,
    expires_at,
    scope
)
VALUES (
    $USER_ID,
    '$STRAVA_ACCESS_TOKEN',
    '$STRAVA_REFRESH_TOKEN',
    NOW() + interval '6 hours',
    'read,activity:read'
)
ON CONFLICT (user_id)
DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expires_at = EXCLUDED.expires_at,
    scope = EXCLUDED.scope;
EOF

echo "✅ Dev seed complete (user + strava token)"
