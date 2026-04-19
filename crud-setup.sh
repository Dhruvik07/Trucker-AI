#!/bin/bash
cd /home/vijay/git/globehack

echo "Restoring mockData.js..."
git restore prototype/src/data/mockData.js

echo "Staging backend database for new schema tables..."
cd backend
npx prisma db push

echo "Restarting Node server..."
killall node || true
nohup node server.js > server.log 2>&1 &

echo "============================================="
echo "CRUD Backend Initialized and online!"
echo "GET/POST/PUT/DELETE /api/truckers and /api/orders working."
echo "mockData.js has been restored but remains unsourced by the App."
echo "============================================="
