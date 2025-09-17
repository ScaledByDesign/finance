-- Initial database setup
-- This file is executed when the PostgreSQL container is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Grant usage on schema
GRANT ALL ON SCHEMA public TO financeuser;