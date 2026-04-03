-- ============================================================
-- Eleva Brasil — Setup de Cursos + Função get_users_email
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Função para admin buscar e-mails dos usuários
--    (auth.users não é acessível via chave anon)
CREATE OR REPLACE FUNCTION public.get_profiles_with_email()
RETURNS TABLE (
  id          UUID,
  nome        TEXT,
  cpf         TEXT,
  telefone    TEXT,
  empresa     TEXT,
  cargo       TEXT,
  bio         TEXT,
  foto_url    TEXT,
  role        TEXT,
  criado_em   TIMESTAMPTZ,
  email       TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id, p.nome, p.cpf, p.telefone, p.empresa, p.cargo, p.bio, p.foto_url, p.role, p.criado_em,
    u.email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE public.is_admin();
$$;

-- 2. Tabela de cursos
CREATE TABLE IF NOT EXISTS public.cursos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  descricao    TEXT,
  carga_horaria INTEGER,
  valor        NUMERIC(10,2),
  ativo        BOOLEAN NOT NULL DEFAULT true,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS em cursos
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler cursos ativos
CREATE POLICY "Cursos visíveis para autenticados"
  ON public.cursos FOR SELECT
  USING (ativo = true OR public.is_admin());

-- Só admin cria, edita e deleta cursos
CREATE POLICY "Admin gerencia cursos INSERT"
  ON public.cursos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin gerencia cursos UPDATE"
  ON public.cursos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin gerencia cursos DELETE"
  ON public.cursos FOR DELETE
  USING (public.is_admin());

-- 4. Trigger atualizado_em em cursos
CREATE TRIGGER trg_cursos_atualizado_em
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
