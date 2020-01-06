FROM cypress/base:12.6.0 as base

# --------------------------------------------------

# From base as install_cypress
# Install Cypress and all the things it will use
# RUN npm install --save-dev cypress
# RUN npm install --save-dev cypress-plugin-retries
# RUN npm install --save-dev mocha@5.2.0 mochawesome mochawesome-merge mochawesome-report-generator

# --------------------------------------------------

From base as set_cypress_path
# Set path
ENV PATH=$PATH:/node_modules/cypress/bin
# Set workdir
WORKDIR /mnt/cypress

# --------------------------------------------------

# Run the command...
COPY ./package.json ./package-lock.json /mnt/cypress/
RUN npm ci
# RUN npm install
# CMD ["cypress", "run", "-s", "integration/*.js"]
CMD ["$(npm bin)/cypress", "-v"]
