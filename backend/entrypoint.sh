#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Applying database migrations..."
python manage.py makemigrations
python manage.py migrate

# Check the environment variable flag
if [ "$SEED_DB" = "True" ]; then
    echo "SEED_DB is True. Running seeder..."
    python manage.py seed_db
else
    echo "SEED_DB is False or not set. Skipping seeder."
fi

echo "Starting Django development server..."
# Use exec to replace the shell with the Django process
exec python manage.py runserver 0.0.0.0:8000