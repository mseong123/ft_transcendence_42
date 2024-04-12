#!/bin/bash

# Start Ganache
ganache-cli -h 0.0.0.0 &

# Wait for Ganache to start
echo "Waiting for Ganache to start..."
until nc -z 127.0.0.1 8545; do
  sleep 1
done

echo "Ganache is now running and ready."

# Compile and migrate the smart contract using Truffle
truffle compile --network ganache
truffle migrate --network ganache

# Extract contract address from Truffle output
CONTRACT_ADDRESS=$(truffle networks --network ganache | grep -A1 'Tournament:' | awk '{print $2}')

# Update .env file in Django project with contract address
echo "CONTRACT_ADDR=${CONTRACT_ADDRESS}" >> /app_data/.env

# Note: sed does not have permission to edit temp file in host machine

# Keep the container running
tail -f /dev/null
