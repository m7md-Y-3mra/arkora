#!/bin/sh
set -e

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

if [ "$RUN_SEEDERS" = "true" ]; then
    # Seeding is demo data only; a failure must not take the site down.
    php artisan db:seed --force || echo "WARNING: db:seed failed, continuing boot"
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
