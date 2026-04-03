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
painel.html                       # Painel do aluno (perfil, cursos, certificados, senha)
admin.html                        # Painel de administração (dashboard, alunos, cursos)
politica-de-privacidade.html      # Política de privacidade
supabase_setup.sql                # SQL de criação das tabelas iniciais
supabase_admin_setup.sql          # SQL do painel admin (coluna role + policies + função is_admin)
supabase_cursos_setup.sql         # SQL da tabela cursos + função get_profiles_with_email
supabase_video_setup.sql          # SQL para adicionar coluna video_url em cursos
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

## Tabela `public.cursos`

- Campos: `id`, `titulo`, `descricao`, `carga_horaria`, `valor`, `video_url`, `ativo`, `criado_em`, `atualizado_em`
- `video_url` — URL do player do Vimeo (ex: `https://player.vimeo.com/video/123456789`), exibida como `<iframe>` no painel do aluno
- RLS habilitado — apenas admin cria/edita/deleta; autenticados leem cursos ativos
- Gerenciada pelo admin via `admin.html`, visualizada pelo aluno via `painel.html`

### Função `public.get_profiles_with_email()`

- Faz JOIN entre `public.profiles` e `auth.users` para expor o e-mail
- `SECURITY DEFINER` — só retorna dados se o chamador for admin (`is_admin()`)
- Usada no admin para exibir e-mail na tabela de alunos e exportar CSV

## Painel Admin (`admin.html`)

- Acesso restrito: exige sessão ativa + `role = 'admin'` na tabela `profiles`
- **Dashboard:** total de alunos, novos nos últimos 7 e 30 dias, total de cursos ativos, cadastros recentes com e-mail
- **Gestão de alunos:** tabela com e-mail, CPF, telefone, empresa; busca em tempo real; edição e exclusão via modal; exportar CSV
- **Gestão de cursos:** criar, editar, desativar e excluir cursos; busca em tempo real
- Script embutido no próprio `admin.html` (não usa `auth.js`)

## Painel do Aluno (`painel.html`)

- Seções: Visão Geral, Meu Perfil, **Cursos Disponíveis**, Certificados, Segurança
- Cursos: carrega da tabela `cursos` (apenas ativos), exibe cards com título, descrição, carga horária e valor
- Seções dinâmicas controladas por `showSection(name)` — ao navegar para 'cursos' chama `loadCursos()`

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
