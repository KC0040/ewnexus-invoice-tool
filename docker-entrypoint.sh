#!/bin/sh
set -e

# Start R2 presign service in background (port 8092, internal only)
python3 /pb/r2_presign.py &

# Recurring invoice cron — runs every hour in background
(while true; do
  python3 /pb/run_recurring_invoices.py 2>/dev/null || true
  sleep 3600
done) &

# Start PocketBase (foreground, handles SIGTERM)
exec /pb/pocketbase serve --http=0.0.0.0:8090
