#!/bin/bash

echo "Stopping bot..."

pm2 stop fcfs-bot

cd /root/fcfs-bot
echo "Updating Code..."
git pull
rm -rf scripts
echo "Updating dependencies..."
yarn install --production=true
echo "Done!"
cd /
echo "Starting bot..."
pm2-runtime start fcfs-bot