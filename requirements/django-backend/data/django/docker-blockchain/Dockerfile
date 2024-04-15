# Use an existing Node.js base image
FROM node:16

# Install netcat
RUN apt-get update && apt-get install -y netcat

# Copy Solidity smart contract file
COPY ./contracts/Tournament.sol ./contracts/Tournament.sol
COPY ./migrations/1_deploy_contracts.js ./migrations/1_deploy_contracts.js
COPY ./config/truffle-config.js .

# Install Ganache
RUN npm install -g ganache-cli

# Install Truffle
RUN npm install -g truffle@5.11.5

# Copy setup.sh script
COPY ./config/setup.sh .

# Make setup.sh executable
RUN chmod +x setup.sh

# Define entry point
ENTRYPOINT ["./setup.sh"]
