#!/bin/sh
set -e

# Ensure superuser exists — uses PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD env vars.
# 'superuser upsert' creates if not exists, updates password if already exists.
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  /pb/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir=/pb/pb_data 2>/dev/null || true
fi

# Start R2 presign service in background (port 8092, internal only)
python3 /pb/r2_presign.py &

# Recurring invoice cron — runs every hour in background
(while true; do
  python3 /pb/run_recurring_invoices.py 2>/dev/null || true
  sleep 3600
done) &

# Start PocketBase (foreground, handles SIGTERM)
exec /pb/pocketbase serve --http=0.0.0.0:8090
