/**
 * Pulse AI — Main Client-Side Script
 * Handles: sticky header, mobile nav, auth modal, early-access form, chat widget
 */

(function () {
  'use strict';

  const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';

  // ─── Sticky header ───────────────────────────────────────
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  });

  // ─── Mobile navigation ───────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });

  // ─── Auth Modal ──────────────────────────────────────────
  const authModal = document.getElementById('authModal');
  const authBackdrop = document.getElementById('authBackdrop');
  const authClose = document.getElementById('authClose');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');
  const navAuthGuest = document.getElementById('navAuthGuest');
  const navAuthUser = document.getElementById('navAuthUser');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  function openAuthModal(tab = 'login') {
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
    switchTab(tab);
  }

  function closeAuthModal() {
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
    loginError.textContent = '';
    registerError.textContent = '';
  }

  function switchTab(tab) {
    authTabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    loginForm.style.display = tab === 'login' ? 'flex' : 'none';
    registerForm.style.display = tab === 'register' ? 'flex' : 'none';
  }

  authTabs.forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  if (authClose) authClose.addEventListener('click', closeAuthModal);
  if (authBackdrop) authBackdrop.addEventListener('click', closeAuthModal);

  // ─── Login form ──────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      try {
        await Auth.login(
          document.getElementById('loginEmail').value.trim(),
          document.getElementById('loginPassword').value
        );
        closeAuthModal();
      } catch (err) {
        loginError.textContent = friendlyError(err.code);
      }
    });
  }

  // ─── Register form ───────────────────────────────────────
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerError.textContent = '';
      try {
        await Auth.register(
          document.getElementById('registerEmail').value.trim(),
          document.getElementById('registerPassword').value,
          document.getElementById('registerName').value.trim()
        );
        closeAuthModal();
      } catch (err) {
        registerError.textContent = friendlyError(err.code);
      }
    });
  }

  // ─── Logout ──────────────────────────────────────────────
  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await Auth.logout();
    });
  }

  // ─── Auth state → update nav ─────────────────────────────
  Auth.onAuthChange((user) => {
    if (user) {
      navAuthGuest.style.display = 'none';
      navAuthUser.style.display = 'block';
    } else {
      navAuthGuest.style.display = 'block';
      navAuthUser.style.display = 'none';
    }
  });

  // ─── Firebase error messages ─────────────────────────────
  function friendlyError(code) {
    const map = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

  // ─── Helper: authed fetch ────────────────────────────────
  async function authedFetch(url, options = {}) {
    const token = await Auth.getIdToken();
    const headers = { ...options.headers, 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  }

  // ─── Early-access form ───────────────────────────────────
  const form = document.getElementById('earlyAccessForm');
  const emailInput = document.getElementById('earlyAccessEmail');
  const status = document.getElementById('earlyAccessStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Joining...';
      status.className = 'form-status';

      try {
        const res = await fetch(`${API}/early-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput.value.trim() }),
        });
        const data = await res.json();

        if (res.ok) {
          status.textContent = data.message || "You're on the list.";
          status.className = 'form-status success';
          form.reset();
        } else {
          status.textContent = data.detail || 'Something went wrong.';
          status.className = 'form-status error';
        }
      } catch {
        status.textContent = 'Could not reach the server.';
        status.className = 'form-status error';
      }
    });
  }

  // ─── Chat Widget ─────────────────────────────────────────
  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const chatSend = document.getElementById('chatSend');

  let conversationId = null;
  let isSending = false;

  function toggleChat() {
    if (!Auth.isLoggedIn()) {
      openAuthModal('login');
      return;
    }
    const isOpen = chatPanel.classList.toggle('open');
    chatPanel.setAttribute('aria-hidden', !isOpen);
    chatToggle.setAttribute('aria-label', isOpen ? 'Close assistant' : 'Open assistant');
    if (isOpen) chatInput.focus();
  }

  if (chatToggle) chatToggle.addEventListener('click', toggleChat);
  if (chatClose) chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
    chatPanel.setAttribute('aria-hidden', 'true');
  });

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.textContent = content;
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg assistant';
    div.id = 'chatTyping';
    const dots = document.createElement('div');
    dots.className = 'chat-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';
    div.appendChild(dots);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (isSending || !text.trim()) return;
    if (!Auth.isLoggedIn()) {
      openAuthModal('login');
      return;
    }

    isSending = true;
    chatSend.disabled = true;

    addMessage('user', text.trim());
    chatInput.value = '';
    showTyping();

    try {
      const res = await authedFetch(`${API}/chat`, {
        method: 'POST',
        body: JSON.stringify({ conversationId, message: text.trim() }),
      });
      const data = await res.json();

      removeTyping();

      if (res.ok && data.data) {
        conversationId = data.data.conversationId;
        addMessage('assistant', data.data.message.content);
      } else if (res.status === 401) {
        addMessage('assistant', 'Please log in to use the chat.');
        openAuthModal('login');
      } else {
        addMessage('assistant', data.detail || 'Something went wrong.');
      }
    } catch {
      removeTyping();
      addMessage('assistant', 'Could not reach the server.');
    }

    isSending = false;
    chatSend.disabled = false;
    chatInput.focus();
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value);
      }
    });
  }
})();
