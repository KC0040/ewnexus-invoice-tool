FROM python:3.11-slim

WORKDIR /pb

# Download PocketBase 0.30.4
RUN apt-get update && apt-get install -y --no-install-recommends wget unzip ca-certificates && \
    wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.30.4/pocketbase_0.30.4_linux_amd64.zip && \
    unzip -q pocketbase_0.30.4_linux_amd64.zip pocketbase && \
    chmod +x pocketbase && \
    rm pocketbase_0.30.4_linux_amd64.zip && \
    apt-get remove -y wget unzip && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# PocketBase hooks and migrations
COPY pocketbase/pb_hooks/       ./pb_hooks/
COPY pocketbase/pb_migrations/  ./pb_migrations/

# Python helper scripts
COPY pocketbase/r2_presign.py         ./
COPY pocketbase/run_recurring_invoices.py ./
COPY pocketbase/generate_next_invoice.py  ./

# PWA served from pb_public/ (PocketBase serves this at /)
COPY pwa/app.html       ./pb_public/index.html
COPY pwa/app.js         ./pb_public/app.js
COPY pwa/manifest.json  ./pb_public/manifest.json
COPY pwa/icon-192.png   ./pb_public/icon-192.png
COPY pwa/icon-512.png   ./pb_public/icon-512.png

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8090
VOLUME /pb/pb_data

ENTRYPOINT ["./docker-entrypoint.sh"]
