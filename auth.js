(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getNextTarget() {
    var params = new URLSearchParams(window.location.search);
    var next = params.get('next');

    if (!next || next.charAt(0) !== '/' || next.indexOf('//') === 0 || next.indexOf('/login.html') === 0) {
      return '/index.html';
    }

    return next;
  }

  function updateLoginHiddenFields() {
    var path = window.location.pathname.toLowerCase();
    var isLoginPage = path.endsWith('/login.html') || path === '/login.html';
    var isRegisterPage = path.endsWith('/create-user.html') || path === '/create-user.html';
    if (!isLoginPage && !isRegisterPage) {
      return;
    }

    var form = document.querySelector(isRegisterPage ? '.register-form' : '.login-form');
    if (!form) {
      return;
    }

    var hiddenNext = form.querySelector('input[name="next"]');
    if (!hiddenNext) {
      hiddenNext = document.createElement('input');
      hiddenNext.type = 'hidden';
      hiddenNext.name = 'next';
      form.appendChild(hiddenNext);
    }

    hiddenNext.value = getNextTarget();
  }

  function injectLoggedInBadge(email) {
    var headerContainer = document.querySelector('.site-header .container');
    if (!headerContainer) {
      return;
    }

    var existing = document.getElementById('auth-user-status');
    if (existing) {
      return;
    }

    var badge = document.createElement('div');
    badge.id = 'auth-user-status';
    badge.className = 'auth-user-status';
    badge.innerHTML =
      '<span class="auth-user-email">Logged in as ' + escapeHtml(email) + '</span>' +
      '<form method="post" action="/auth/logout" class="auth-logout-form">' +
      '<button type="submit" class="btn btn-outline-secondary auth-logout-btn">Logout</button>' +
      '</form>';

    headerContainer.appendChild(badge);
  }

  function clearLoginQueryError() {
    var params = new URLSearchParams(window.location.search);
    if (!params.get('error')) {
      return;
    }

    // Keep next so users still return to intended page after retry.
    var next = params.get('next');
    var clean = '/login.html' + (next ? ('?next=' + encodeURIComponent(next)) : '');
    window.history.replaceState({}, document.title, clean);
  }

  function showLoginErrorIfPresent() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('error') !== 'invalid') {
      return;
    }

    var errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.classList.remove('hidden');
    }
  }

  function showRegisterErrorIfPresent() {
    var path = window.location.pathname.toLowerCase();
    var isRegisterPage = path.endsWith('/create-user.html') || path === '/create-user.html';
    if (!isRegisterPage) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var code = params.get('error');
    if (!code) {
      return;
    }

    var errorEl = document.getElementById('register-error');
    if (!errorEl) {
      return;
    }

    var messages = {
      missing: 'Please complete all fields.',
      weak: 'Password must be at least 8 characters.',
      nomatch: 'Passwords do not match.',
      exists: 'A user with that email already exists.'
    };

    errorEl.textContent = messages[code] || 'Unable to create user. Please try again.';
    errorEl.classList.remove('hidden');
  }

  function wireShowPasswordToggle() {
    var path = window.location.pathname.toLowerCase();
    var isLoginPage = path.endsWith('/login.html') || path === '/login.html';
    var isRegisterPage = path.endsWith('/create-user.html') || path === '/create-user.html';

    if (isLoginPage) {
      var passwordInput = document.getElementById('password');
      var toggle = document.getElementById('show-password');
      if (passwordInput && toggle) {
        toggle.addEventListener('change', function () {
          passwordInput.type = toggle.checked ? 'text' : 'password';
        });
      }
    }

    if (isRegisterPage) {
      var registerPassword = document.getElementById('register-password');
      var registerConfirm = document.getElementById('register-confirm-password');
      var registerToggle = document.getElementById('show-register-password');
      if (registerPassword && registerConfirm && registerToggle) {
        registerToggle.addEventListener('change', function () {
          var inputType = registerToggle.checked ? 'text' : 'password';
          registerPassword.type = inputType;
          registerConfirm.type = inputType;
        });
      }
    }
  }

  function initAuthUi() {
    updateLoginHiddenFields();
    showLoginErrorIfPresent();
    showRegisterErrorIfPresent();
    wireShowPasswordToggle();

    fetch('/api/me', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        var isLoginPage = window.location.pathname.toLowerCase().endsWith('/login.html') || window.location.pathname.toLowerCase() === '/login.html';

        if (!data || !data.authenticated) {
          if (isLoginPage) {
            clearLoginQueryError();
          }
          return;
        }

        if (isLoginPage) {
          window.location.replace(getNextTarget());
          return;
        }

        injectLoggedInBadge(data.email || 'user');
      })
      .catch(function () {
        // Keep page functional even when auth status cannot be fetched.
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUi);
  } else {
    initAuthUi();
  }
})();
