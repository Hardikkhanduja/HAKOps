FROM node:20-bookworm

# Install Python
RUN apt-get update \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Node backend
COPY src ./src

# Copy Python AWS/AI pipeline
COPY python-pipeline ./python-pipeline

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages \
    -r python-pipeline/requirements.txt

# Python pipeline configuration
ENV PYTHON_BIN=python3
ENV PIPELINE_DIR=/app/python-pipeline

EXPOSE 4000

CMD ["npm", "start"]
