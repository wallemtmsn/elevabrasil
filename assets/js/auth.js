/**
 * Eleva Brasil — Autenticação via Supabase
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://lksrbemlqbfmstzhjohx.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3JiZW1scWJmbXN0emhqb2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDcwMjIsImV4cCI6MjA5MDYyMzAyMn0.h7dm9AKXNxVmhUno3T_3ZEWxlxnb25mIyaNv6jdeF6I';

  // SDK carregado via CDN no HTML
  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  // ===== MODAL HELPERS =====
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(function () { modal.classList.add('active'); }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(function () {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }, 250);
  }

  function showToast(message, type) {
    var existing = document.getElementById('auth-toast');
    if (existing) existing.remove();

    var colors = {
      success: '#16a34a',
      error:   '#dc2626',
      info:    '#1e3a5f',
    };
    var bg = colors[type] || colors.info;

    var toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.style.cssText = [
      'position:fixed', 'top:24px', 'right:24px', 'z-index:9999',
      'background:' + bg, 'color:#fff',
      'padding:12px 20px', 'border-radius:12px',
      'box-shadow:0 8px 24px rgba(0,0,0,0.18)',
      'font-size:14px', 'font-weight:600',
      'display:flex', 'align-items:center', 'gap:10px',
      'max-width:320px', 'pointer-events:none',
      'transform:translateX(120%)',
      'transition:transform 0.3s cubic-bezier(.4,0,.2,1)',
    ].join(';');

    var icons = {
      success: '<svg style="width:18px;height:18px;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>',
      error:   '<svg style="width:18px;height:18px;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
      info:    '<svg style="width:18px;height:18px;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/></svg>',
    };

    toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
    document.body.appendChild(toast);

    setTimeout(function () { toast.style.transform = 'translateX(0)'; }, 10);
    setTimeout(function () {
      toast.style.transform = 'translateX(120%)';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  function setError(fieldId, message) {
    var el = document.getElementById(fieldId + '-error');
    if (el) { el.textContent = message; el.classList.remove('hidden'); }
  }

  function clearErrors(formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('[id$="-error"]').forEach(function (el) {
      el.textContent = '';
      el.classList.add('hidden');
    });
  }

  function setLoading(btnId, loading) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.7' : '1';
    btn.style.cursor = loading ? 'wait' : '';
  }

  function getInitials(nome) {
    var parts = (nome || '').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0] || 'U').substring(0, 2).toUpperCase();
  }

  // ===== UPDATE HEADER BUTTON =====
  function updateAuthButton(user, profile) {
    var btn = document.getElementById('auth-header-btn');
    var mobileBtn = document.getElementById('auth-mobile-btn');
    if (!btn) return;

    if (user && profile) {
      var initials = getInitials(profile.nome);
      btn.innerHTML =
        '<div class="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold text-white overflow-hidden">' +
          (profile.foto_url
            ? '<img src="' + profile.foto_url + '" class="w-full h-full object-cover">'
            : '<span>' + initials + '</span>') +
        '</div>' +
        '<span class="hidden sm:block">' + profile.nome.split(' ')[0] + '</span>' +
        '<svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
      btn.onclick = openUserMenu;

      if (mobileBtn) {
        mobileBtn.textContent = 'Meu Painel';
        mobileBtn.href = 'painel.html';
        mobileBtn.onclick = null;
      }
    } else {
      btn.innerHTML =
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>' +
        '<span>Entrar</span>';
      btn.onclick = function () { openModal('login-modal'); };

      if (mobileBtn) {
        mobileBtn.textContent = 'Entrar / Cadastrar';
        mobileBtn.href = '#';
        mobileBtn.onclick = function (e) { e.preventDefault(); openModal('login-modal'); };
      }
    }
  }

  // ===== USER DROPDOWN =====
  function openUserMenu() {
    var existing = document.getElementById('user-dropdown');
    if (existing) { existing.remove(); return; }

    var btn = document.getElementById('auth-header-btn');
    var rect = btn.getBoundingClientRect();

    var menu = document.createElement('div');
    menu.id = 'user-dropdown';
    menu.className = 'fixed z-[200] bg-white rounded-2xl shadow-2xl border border-steel-200 py-2 w-56';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';

    sb.auth.getUser().then(function (res) {
      var user = res.data && res.data.user;
      if (!user) return;
      sb.from('profiles').select('nome,email').eq('id', user.id).single().then(function (r) {
        var nome = r.data ? r.data.nome : user.email;
        menu.innerHTML =
          '<div class="px-4 py-3 border-b border-steel-100">' +
            '<p class="text-sm font-semibold text-navy-800 truncate">' + nome + '</p>' +
            '<p class="text-xs text-steel-500 truncate">' + user.email + '</p>' +
          '</div>' +
          '<a href="painel.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-steel-700 hover:bg-steel-50 transition-colors">' +
            '<svg class="w-4 h-4 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
            'Meu Perfil' +
          '</a>' +
          '<button id="dropdown-logout" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>' +
            'Sair' +
          '</button>';

        document.getElementById('dropdown-logout').onclick = function () {
          menu.remove();
          window.ElevaAuth.logout();
        };
      });
    });

    document.body.appendChild(menu);

    setTimeout(function () {
      document.addEventListener('click', function handler(e) {
        if (!menu.contains(e.target) && e.target !== btn) {
          menu.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 50);
  }

  // ===== LOGIN =====
  async function handleLogin(e) {
    e.preventDefault();
    clearErrors('login-form');

    var email = document.getElementById('login-email').value.trim().toLowerCase();
    var senha = document.getElementById('login-senha').value;

    if (!email) { setError('login-email', 'Informe seu e-mail.'); return; }
    if (!senha)  { setError('login-senha', 'Informe sua senha.'); return; }

    setLoading('login-submit', true);

    var { data, error } = await sb.auth.signInWithPassword({ email, password: senha });

    setLoading('login-submit', false);

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('login-senha', 'E-mail ou senha incorretos.');
      } else {
        setError('login-senha', error.message);
      }
      return;
    }

    var profile = await fetchProfile(data.user.id);
    closeModal('login-modal');
    showToast('Bem-vindo(a), ' + (profile ? profile.nome.split(' ')[0] : '') + '!', 'success');
    updateAuthButton(data.user, profile);
    setTimeout(function () { window.location.href = 'painel.html'; }, 1000);
  }

  // ===== CADASTRO =====
  async function handleCadastro(e) {
    e.preventDefault();
    clearErrors('cadastro-form');

    var nome     = document.getElementById('cad-nome').value.trim();
    var email    = document.getElementById('cad-email').value.trim().toLowerCase();
    var cpf      = document.getElementById('cad-cpf').value.replace(/\D/g, '');
    var telefone = document.getElementById('cad-telefone').value.trim();
    var senha    = document.getElementById('cad-senha').value;
    var confirma = document.getElementById('cad-confirma').value;
    var valid    = true;

    if (nome.length < 3)                          { setError('cad-nome',     'Informe seu nome completo.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ setError('cad-email',    'E-mail inválido.');           valid = false; }
    if (cpf.length !== 11)                         { setError('cad-cpf',      'CPF inválido.');              valid = false; }
    if (!telefone)                                 { setError('cad-telefone', 'Informe seu telefone.');       valid = false; }
    if (senha.length < 6)                          { setError('cad-senha',    'Mínimo 6 caracteres.');       valid = false; }
    if (senha !== confirma)                        { setError('cad-confirma', 'As senhas não coincidem.');    valid = false; }
    if (!valid) return;

    setLoading('cadastro-submit', true);

    // 1. Criar usuário no Supabase Auth
    var { data, error } = await sb.auth.signUp({ email, password: senha });

    if (error) {
      setLoading('cadastro-submit', false);
      if (error.message.includes('already registered')) {
        setError('cad-email', 'E-mail já cadastrado.');
      } else {
        setError('cad-email', error.message);
      }
      return;
    }

    // 2. Aguarda sessão estar ativa antes de inserir o perfil
    if (!data.session) {
      setLoading('cadastro-submit', false);
      setError('cad-email', 'Confirme seu e-mail antes de continuar. Verifique sua caixa de entrada.');
      return;
    }

    // 3. Inserir perfil na tabela profiles (sessão já ativa)
    var { error: profileError } = await sb.from('profiles').insert({
      id: data.user.id,
      nome,
      cpf,
      telefone,
    });

    setLoading('cadastro-submit', false);

    if (profileError) {
      if (profileError.message.includes('cpf')) {
        setError('cad-cpf', 'CPF já cadastrado.');
      } else {
        setError('cad-nome', profileError.message);
      }
      return;
    }

    var profile = { id: data.user.id, nome, cpf, telefone, foto_url: null };
    closeModal('cadastro-modal');
    showToast('Cadastro realizado! Bem-vindo(a), ' + nome.split(' ')[0] + '!', 'success');
    updateAuthButton(data.user, profile);
    setTimeout(function () { window.location.href = 'painel.html'; }, 1000);
  }

  // ===== FETCH PROFILE =====
  async function fetchProfile(userId) {
    var { data } = await sb.from('profiles').select('*').eq('id', userId).single();
    return data;
  }

  // ===== LOGOUT =====
  async function logout() {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.remove();
    await sb.auth.signOut();
    showToast('Você saiu da sua conta.', 'info');
    updateAuthButton(null, null);
    if (window.location.pathname.includes('painel')) {
      window.location.href = 'index.html';
    }
  }

  // ===== INIT =====
  async function init() {
    // Verifica sessão ativa
    var { data } = await sb.auth.getSession();
    var session = data && data.session;

    if (session) {
      var profile = await fetchProfile(session.user.id);
      updateAuthButton(session.user, profile);
    } else {
      updateAuthButton(null, null);
    }

    // Bind login form
    var loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Bind cadastro form
    var cadForm = document.getElementById('cadastro-form');
    if (cadForm) cadForm.addEventListener('submit', handleCadastro);

    // Adicionar id nos botões de submit
    var loginBtn = document.querySelector('#login-form button[type="submit"]');
    if (loginBtn) loginBtn.id = 'login-submit';
    var cadBtn = document.querySelector('#cadastro-form button[type="submit"]');
    if (cadBtn) cadBtn.id = 'cadastro-submit';

    // Switch modais
    document.addEventListener('click', function (e) {
      if (e.target.id === 'ir-para-cadastro' || e.target.closest('#ir-para-cadastro')) {
        e.preventDefault();
        closeModal('login-modal');
        setTimeout(function () { openModal('cadastro-modal'); }, 280);
      }
      if (e.target.id === 'ir-para-login' || e.target.closest('#ir-para-login')) {
        e.preventDefault();
        closeModal('cadastro-modal');
        setTimeout(function () { openModal('login-modal'); }, 280);
      }
    });

    // Fechar ao clicar no backdrop
    ['login-modal', 'cadastro-modal'].forEach(function (id) {
      var modal = document.getElementById(id);
      if (modal) modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(id);
      });
    });

    // ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal('login-modal');
        closeModal('cadastro-modal');
        var dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.remove();
      }
    });

    // Máscara CPF
    var cpfInput = document.getElementById('cad-cpf');
    if (cpfInput) {
      cpfInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.value = v;
      });
    }

    // Máscara Telefone
    var telInput = document.getElementById('cad-telefone');
    if (telInput) {
      telInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').substring(0, 11);
        if (v.length <= 10) {
          v = v.replace(/(\d{2})(\d)/, '($1) $2');
          v = v.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          v = v.replace(/(\d{2})(\d)/, '($1) $2');
          v = v.replace(/(\d{5})(\d)/, '$1-$2');
        }
        this.value = v;
      });
    }
  }

  // ===== PUBLIC API =====
  window.ElevaAuth = {
    openLogin:    function () { openModal('login-modal'); },
    openCadastro: function () { openModal('cadastro-modal'); },
    logout:       logout,
    getClient:    function () { return sb; },
    fetchProfile: fetchProfile,
    showToast:    showToast,
    getInitials:  getInitials,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();