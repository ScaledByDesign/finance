#!/bin/sh
set -e

# Check if we're in demo mode
if [ "$NEXT_PUBLIC_DEMO_MODE" = "true" ]; then
  echo "Running in DEMO MODE - skipping database setup"
else
  echo "Waiting for database to be ready..."

  # Try connecting to database with timeout
  max_attempts=30
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if pg_isready -h postgres -p 5432 -U financeuser -d financedb > /dev/null 2>&1; then
      echo "Database is ready!"

      # Try to run Prisma commands
      echo "Generating Prisma client..."
      npx prisma generate || echo "Warning: Prisma generate failed, continuing..."

      echo "Pushing schema to database..."
      npx prisma db push --skip-generate || echo "Warning: Prisma db push failed, continuing..."

      break
    else
      echo "Database is unavailable - waiting... (attempt $((attempt + 1))/$max_attempts)"
      sleep 2
      attempt=$((attempt + 1))
    fi
  done

  if [ $attempt -eq $max_attempts ]; then
    echo "Warning: Could not connect to database after $max_attempts attempts"
    echo "Continuing in demo mode..."
  fi
fi

echo "Starting application..."
exec "$@"