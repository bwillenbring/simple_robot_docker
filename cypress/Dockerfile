FROM cypress/base:12.6.0 as base

# --------------------------------------------------

From base as install_cypress
# Set workdir
RUN mkdir /mnt/cypress
COPY ./package.json ./package-lock.json /mnt/cypress/
WORKDIR /mnt/cypress
# Install Cypress and all the things it will use
RUN npm ci --production
# RUN npm install --save-dev cypress@3.6.0
# RUN npm install --save-dev cypress-plugin-retries
# RUN npm install --save-dev mocha@5.2.0 mochawesome mochawesome-merge mochawesome-report-generator

# --------------------------------------------------

From install_cypress as set_cypress_path
# Set path
# ENV PATH=$PATH:/node_modules/cypress/bin

# --------------------------------------------------

# Run the command...
# CMD ["cypress", "run", "-s", "integration/*.js"]
# CMD ["echo", "Dockerfile done"]
