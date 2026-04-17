-- Guideline 002: PostgreSQL features that stay out of Drizzle (or supplement it).
-- Expand with partial unique indexes, triggers, generated columns, RLS prep as domains grow.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
