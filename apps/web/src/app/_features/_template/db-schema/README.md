# Database Boundary

Do not place browser-owned database schema in this Vite feature folder.

For a real ERP feature, keep persistent schema and migrations in the backend or database package, then expose only client contracts through this feature's `services/` and `types/` folders. This directory exists as a reminder for feature authors who copy the template during module discovery.
