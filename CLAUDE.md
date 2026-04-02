# Eleva Brasil Treinamentos e Consultorias

Landing page estática com sistema de cadastro/login de alunos, integrado ao Supabase.

## Stack

- HTML5 semântico
- Tailwind CSS via CDN (configuração inline em `index.html` e `painel.html`)
- JavaScript vanilla (`assets/js/main.js`, `assets/js/auth.js`)
- Google Fonts: Inter (body) + Montserrat (headings)
- CSS customizado: `assets/css/styles.css`
- Supabase JS SDK via CDN (`@supabase/supabase-js@2`)

## Estrutura

```
index.html                        # Página principal + modais de login/cadastro
painel.html                       # Painel do aluno (perfil, foto, certificados, senha)
politica-de-privacidade.html      # Política de privacidade
supabase_setup.sql                # SQL de criação das tabelas (rodar no Supabase)
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
- **RLS:** habilitado com policies por `auth.uid()`
- **Confirmação de e-mail:** DESLIGADA (obrigatório para o cadastro funcionar sem erro de RLS)
- **Cliente no JS:** `window.ElevaAuth.getClient()` retorna o cliente Supabase

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
