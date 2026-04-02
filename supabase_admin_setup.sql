-- ============================================================
-- Eleva Brasil — Setup do Painel Admin
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar coluna role na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'aluno'
  CHECK (role IN ('aluno', 'admin'));

-- 2. Policy: admin pode ler todos os perfis
CREATE POLICY "Admin lê todos os perfis"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 3. Policy: admin pode atualizar qualquer perfil
CREATE POLICY "Admin atualiza qualquer perfil"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. Policy: admin pode deletar qualquer perfil
CREATE POLICY "Admin deleta qualquer perfil"
  ON public.profiles FOR DELETE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Promover um usuário a admin (substitua pelo e-mail real)
-- UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
