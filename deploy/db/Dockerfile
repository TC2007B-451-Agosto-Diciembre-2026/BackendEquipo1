FROM mysql:8.4
COPY db/schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY db/seed.sql /docker-entrypoint-initdb.d/02-seed.sql
