#!/bin/sh
set -eu

psql \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --set=n8n_password="$N8N_DB_PASSWORD" <<-'EOSQL'
SELECT format('CREATE ROLE n8n LOGIN PASSWORD %L', :'n8n_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'n8n')
\gexec

SELECT 'CREATE DATABASE n8n_db OWNER n8n'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'n8n_db')
\gexec
EOSQL
