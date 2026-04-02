# Eleva Brasil Treinamentos e Consultorias

Landing page estática com sistema de cadastro/login de alunos, integrado ao Supabase.

## Stack

- HTML5 semântico
- Tailwind CSS via CDN (configuração inline em cada `.html`)
- JavaScript vanilla (`assets/js/main.js`, `assets/js/auth.js`)
- Google Fonts: Inter (body) + Montserrat (headings)
- CSS customizado: `assets/css/styles.css`
- Supabase JS SDK via CDN (`@supabase/supabase-js@2`)

## Estrutura

```
index.html                        # Página principal + modais de login/cadastro
painel.html                       # Painel do aluno (perfil, foto, certificados, senha)
admin.html                        # Painel de administração (dashboard + gestão de alunos)
politica-de-privacidade.html      # Política de privacidade
supabase_setup.sql                # SQL de criação das tabelas iniciais
supabase_admin_setup.sql          # SQL do painel admin (coluna role + policies + função is_admin)
assets/
  css/styles.css                  # Estilos customizados
  js/main.js                      # Scripts da landing page
  js/auth.js                      # Autenticação via Supabase (login, cadastro, logout)
  img/                            # Imagens (logo, cursos, equipamentos)
```

## Supabase

- **Projeto:** elevabrasil
- **URL:** `https://lksrbemlqbfmstzhjohx.supabase.co`
- **Tabela principal:** `public.profiles` — perfil do aluno vinculado ao `auth.users`
- **Storage bucket:** `avatars` — fotos de perfil (público para leitura)
- **RLS:** habilitado com policies por `auth.uid()` e função `public.is_admin()`
- **Confirmação de e-mail:** DESLIGADA (obrigatório para o cadastro funcionar sem erro de RLS)
- **Cliente no JS:** `window.ElevaAuth.getClient()` retorna o cliente Supabase

### Coluna `role` em `profiles`

- Valores: `'aluno'` (padrão) ou `'admin'`
- Para promover um usuário a admin:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';
  ```

### Função `public.is_admin()`

Criada com `SECURITY DEFINER` para evitar recursão infinita nas policies RLS.
**Nunca substituir a subquery direta em policies de SELECT/UPDATE/DELETE em `profiles`** — causa `infinite recursion detected in policy for relation "profiles"`.

### Policies ativas em `profiles`

| Policy | Operação | Regra |
|--------|----------|-------|
| Usuário lê o próprio perfil | SELECT | `auth.uid() = id OR is_admin()` |
| Usuário insere o próprio perfil | INSERT | `auth.uid() = id` |
| Usuário atualiza o próprio perfil | UPDATE | `auth.uid() = id` |
| Usuário deleta o próprio perfil | DELETE | `auth.uid() = id` |
| Admin atualiza qualquer perfil | UPDATE | `auth.uid() = id OR is_admin()` |
| Admin deleta qualquer perfil | DELETE | `auth.uid() = id OR is_admin()` |

## Painel Admin (`admin.html`)

- Acesso restrito: exige sessão ativa + `role = 'admin'` na tabela `profiles`
- **Dashboard:** total de alunos, novos nos últimos 7 e 30 dias, cadastros recentes
- **Gestão de alunos:** tabela completa, busca em tempo real, edição e exclusão via modal
- Script embutido no próprio `admin.html` (não usa `auth.js`)

## Cores (Tailwind custom)

| Token           | Valor       | Uso                     |
|-----------------|-------------|-------------------------|
| `navy-500`      | `#1e3a5f`   | Cor principal (azul)    |
| `brand-red`     | `#c41e3a`   | Destaque / CTA          |
| `brand-red-dark`| `#a01830`   | Hover em botões red     |
| `steel-*`       | cinzas      | Texto e backgrounds     |

## Convenções

- Sempre em **pt-BR**
- Sem build step — editar HTML/CSS/JS diretamente
- Tailwind classes inline no HTML; classes customizadas em `styles.css`
- Imagens em `assets/img/` com nomes descritivos em kebab-case
- **Nunca usar `classList.add()` com classes Tailwind em JS dinâmico** — o CDN não gera classes em runtime. Usar `element.style` ou `Object.assign(el.style, {...})` para estilos aplicados via JavaScript
- Elementos dinâmicos (toasts, modais criados via JS) sempre com estilos inline
