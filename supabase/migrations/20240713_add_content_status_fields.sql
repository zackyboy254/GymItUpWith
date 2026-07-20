-- Migration: add status flags for existing content tables
-- This script updates existing tables so active/disabled visibility can be controlled without recreating the schema.

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

UPDATE public.home_content
SET status = 'active'
WHERE status IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'home_content_status_check'
  ) THEN
    ALTER TABLE public.home_content
      ADD CONSTRAINT home_content_status_check CHECK (status IN ('active','disabled'));
  END IF;
END$$;

ALTER TABLE public.carousel_slides
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

UPDATE public.carousel_slides
SET status = 'active'
WHERE status IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'carousel_slides_status_check'
  ) THEN
    ALTER TABLE public.carousel_slides
      ADD CONSTRAINT carousel_slides_status_check CHECK (status IN ('active','disabled'));
  END IF;
END$$;

ALTER TABLE public.chat_links
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

UPDATE public.chat_links
SET status = 'active'
WHERE status IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chat_links_status_check'
  ) THEN
    ALTER TABLE public.chat_links
      ADD CONSTRAINT chat_links_status_check CHECK (status IN ('active','disabled'));
  END IF;
END$$;

CREATE POLICY IF NOT EXISTS "Allow public read active home_content" ON public.home_content
  FOR SELECT TO public USING (status = 'active');

CREATE POLICY IF NOT EXISTS "Allow public read active carousel_slides" ON public.carousel_slides
  FOR SELECT TO public USING (status = 'active');

CREATE POLICY IF NOT EXISTS "Allow public read active chat_links" ON public.chat_links
  FOR SELECT TO public USING (status = 'active');
