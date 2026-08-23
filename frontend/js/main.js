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

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        // Step 1: Firebase login
        await Auth.login(email, password);

        // Step 2: Check if user is approved for early access
        loginError.textContent = 'Checking access status...';
        loginError.style.color = 'var(--ink-muted)';
        const statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(email)}`);
        const statusData = await statusRes.json();
        const userStatus = statusData?.data?.status;

        if (!statusRes.ok || !userStatus || userStatus === 'pending') {
          // Not signed up or pending — sign out and show message
          await Auth.logout();
          loginError.textContent = 'Your account is pending admin approval. You\'ll be able to log in once approved.';
          loginError.style.color = '';
          return;
        }
        if (userStatus === 'rejected') {
          await Auth.logout();
          loginError.textContent = 'Your early access request was not approved.';
          loginError.style.color = '';
          return;
        }

        // Step 3: Approved — grant access
        loginError.textContent = '';
        loginError.style.color = '';
        closeAuthModal();
      } catch (err) {
        loginError.textContent = friendlyError(err.code) || 'Something went wrong. Please try again.';
        loginError.style.color = '';
        // Make sure we're signed out if anything failed
        try { await Auth.logout(); } catch {}
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

  // ─── Auth state → redirect approved users to /chat ───────
  Auth.onAuthChange(async (user) => {
    if (user) {
      // Check approval status, then redirect approved users to chat
      try {
        const statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(user.email)}`);
        const statusData = await statusRes.json();
        const userStatus = statusData?.data?.status;
        if (statusRes.ok && userStatus === 'approved') {
          // Approved user on landing page → redirect to chat
          window.location.href = '/chat.html';
          return;
        }
        // Not approved — sign out
        await Auth.logout();
      } catch {
        // Network error — show guest nav
      }
      navAuthGuest.style.display = 'block';
      navAuthUser.style.display = 'none';
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
  const nameInput = document.getElementById('earlyAccessName');
  const emailInput = document.getElementById('earlyAccessEmail');
  const passwordInput = document.getElementById('earlyAccessPassword');
  const status = document.getElementById('earlyAccessStatus');
  const pendingApproval = document.getElementById('pendingApproval');
  const pendingEmail = document.getElementById('pendingEmail');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Creating your account...';
      status.className = 'form-status';

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput.value.trim();
      const password = passwordInput ? passwordInput.value : '';

      if (!email || !password) {
        status.textContent = 'Please fill in all fields.';
        status.className = 'form-status error';
        return;
      }

      if (password.length < 6) {
        status.textContent = 'Password must be at least 6 characters.';
        status.className = 'form-status error';
        return;
      }

      try {
        // Step 1: Create Firebase Auth account
        status.textContent = 'Creating your account...';
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);

        // Step 2: Update display name
        if (name) {
          await cred.user.updateProfile({ displayName: name });
        }

        // Step 3: Send email verification
        status.textContent = 'Sending verification email...';
        await cred.user.sendEmailVerification();

        // Step 4: Save to backend early access table
        status.textContent = 'Registering for early access...';
        const res = await fetch(`${API}/early-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            firebase_uid: cred.user.uid,
            name: name,
            source: 'website',
          }),
        });
        const data = await res.json();

        // Step 5: Sign out and show pending screen
        await firebase.auth().signOut();

        // Hide form, show pending approval
        form.style.display = 'none';
        if (pendingApproval) {
          pendingApproval.style.display = 'block';
          pendingEmail.textContent = email;
        }
        status.textContent = '';

      } catch (err) {
        console.error('Early access signup error:', err);
        status.textContent = friendlyError(err.code) || 'Something went wrong. Please try again.';
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
      } else if (res.status === 401 || res.status === 403) {
        addMessage('assistant', data.detail || 'Access denied. Your account may not be approved yet.');
        try { await Auth.logout(); } catch {}
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
