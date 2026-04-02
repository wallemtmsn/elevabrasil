-- ============================================================
-- Eleva Brasil — Setup Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de perfis (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL,
  cpf         TEXT        NOT NULL UNIQUE,
  telefone    TEXT        NOT NULL,
  empresa     TEXT,
  cargo       TEXT,
  bio         TEXT,
  foto_url    TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies: cada usuário só vê e edita o próprio perfil
CREATE POLICY "Usuário lê o próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário insere o próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "Usuário atualiza o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuário deleta o próprio perfil"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 4. Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_atualizado_em
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- 5. Storage bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- 6. Policy de storage: usuário gerencia a própria foto
CREATE POLICY "Avatar upload pelo próprio usuário"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar update pelo próprio usuário"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar delete pelo próprio usuário"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar público para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');