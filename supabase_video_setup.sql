-- ============================================================
-- Eleva Brasil — Adicionar campo video_url em cursos
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS video_url TEXT;
