FROM python:3.9.18-alpine3.18

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev \
    build-base

# Set working directory
WORKDIR /app

# Copy requirements first for better cache utilization
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2-binary gunicorn

# Copy application code
COPY . .

# Set production environment variables
ENV FLASK_APP=app
ENV FLASK_ENV=production

# Run migrations and start the application
CMD flask db upgrade && gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120