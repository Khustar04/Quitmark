-- Migration: Add category column to habits table
-- Idempotent: safe to run multiple times
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
