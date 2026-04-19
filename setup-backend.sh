#!/bin/bash
cd /home/vijay/git/globehack
mkdir -p backend/prisma
cd backend
echo "Installing backend dependencies..."
npm install
echo "Pushing Prisma schema to SQLite Database..."
npx prisma db push
echo "Running seed script..."
node seed.js
echo "=============================="
echo "Backend is ready! You can now start it with: node server.js"
echo "=============================="
