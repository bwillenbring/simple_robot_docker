FROM cypress/base:12.6.0 as base

# --------------------------------------------------

From base as install_cypress
# Set workding dir to what's in the existing image
WORKDIR /
RUN mkdir /mnt/cypress

# --------------------------------------------------

From install_cypress as set_cypress_path
# Set path
ENV PATH=$PATH:/node_modules/cypress/bin
# Set workdir
WORKDIR /mnt/cypress

# --------------------------------------------------

# Run the command...
CMD ["echo", "Dockerfile done"]
