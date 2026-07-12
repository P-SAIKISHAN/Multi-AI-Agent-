# Build command (execute from project root directory):
#   docker build -t multi-ai-agent -f app/Dockerfile .
# Run command:
#   docker run -d -p 9999:9999 --env-file .env multi-ai-agent

## Parent image
FROM python:3.10-slim

## Essential environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

## Work directory inside the docker container
WORKDIR /app

## Installing system dependancies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

## Copying ur all contents from local to app
COPY . .

## Run setup.py with increased timeout and retries to prevent connection failures
RUN pip install --no-cache-dir --default-timeout=1000 --retries 5 -e .

# Exposed ports (Backend & static server is served on 9999)
EXPOSE 9999

# Run the app
CMD ["python", "app/main.py"]