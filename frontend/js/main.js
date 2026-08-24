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
  const navAuthGuestLogin = document.getElementById('navAuthGuestLogin');
  const navAuthUser = document.getElementById('navAuthUser');
  const navAuthUserLogout = document.getElementById('navAuthUserLogout');
  const navLoginBtn = document.getElementById('navLoginBtn');
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

  // ─── Forgot Password ────────────────────────────────────
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      if (!email) {
        loginError.textContent = 'Enter your email above, then click Forgot password.';
        loginError.style.color = '';
        return;
      }
      try {
        loginError.textContent = 'Sending reset email...';
        loginError.style.color = 'var(--ink-muted)';
        await Auth.sendPasswordReset(email);
        loginError.textContent = `Reset email sent to ${email}. Check your inbox.`;
        loginError.style.color = '#1E7A46';
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          loginError.textContent = 'No account found with this email.';
        } else if (err.code === 'auth/invalid-email') {
          loginError.textContent = 'Invalid email address.';
        } else {
          loginError.textContent = 'Could not send reset email. Try again.';
        }
        loginError.style.color = '';
      }
    });
  }

  // ─── Login form ──────────────────────────────────────────
  let loginInProgress = false;
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginInProgress) return; // Prevent double-submit
      loginInProgress = true;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';

      try {
        loginError.textContent = '';
        loginError.style.color = '';

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
          loginError.textContent = 'Please enter email and password.';
          return;
        }

        // Disable button during auth
        if (submitBtn) {
          submitBtn.textContent = 'Logging in...';
          submitBtn.disabled = true;
        }

        // Step 1: Firebase login
        await Auth.login(email, password);

        // Step 2: Check if user is approved for early access
        loginError.textContent = 'Checking access status...';
        loginError.style.color = 'var(--ink-muted)';

        let statusRes;
        try {
          statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(email)}`);
        } catch (networkErr) {
          // Network error — sign out and show error
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Could not verify access status. Check your connection and try again.';
          loginError.style.color = '';
          return;
        }

        const statusData = await statusRes.json().catch(() => ({}));
        const userStatus = statusData?.data?.status;

        if (statusRes.status === 404 || !userStatus) {
          await Auth.logout().catch(() => {});
          loginError.innerHTML = 'You haven\'t signed up for early access yet. <a href="#early-access" onclick="document.getElementById(\'authModal\').classList.remove(\'open\')" style="color:var(--red);text-decoration:underline;">Get Early Access first</a>';
          loginError.style.color = '';
          return;
        }
        if (userStatus === 'pending') {
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Your account is pending admin approval. You\'ll be able to log in once approved.';
          loginError.style.color = '';
          return;
        }
        if (userStatus === 'rejected') {
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Your early access request was not approved.';
          loginError.style.color = '';
          return;
        }

        // Step 3: Approved — create backend JWT session
        loginError.textContent = 'Setting up your session...';
        try {
          await Auth.createBackendSession(email, null);
        } catch (sessionErr) {
          console.warn('Backend session creation failed:', sessionErr.message);
          // Chat will retry session creation on first message
        }
        loginError.textContent = '';
        loginError.style.color = '';
        closeAuthModal();
      } catch (err) {
        loginError.textContent = friendlyError(err.code) || 'Something went wrong. Please try again.';
        loginError.style.color = '';
        try { await Auth.logout().catch(() => {}); } catch {}
      } finally {
        loginInProgress = false;
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
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

  // ─── Nav Login Button ─────────────────────────────────────
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('login');
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
  // Guard flag to prevent redirect during signup flow
  let isSigningUp = false;

  Auth.onAuthChange(async (user) => {
    // Skip redirect check during signup — signup creates a Firebase account
    // but the user isn't in the backend yet, so status check would fail
    if (isSigningUp) return;

    if (user) {
      // Check approval status, then redirect approved users to chat
      try {
        const statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(user.email)}`);
        const statusData = await statusRes.json();
        const userStatus = statusData?.data?.status;
        if (statusRes.ok && userStatus === 'approved') {
          // Approved user on landing page → create backend session, then redirect to chat
          try {
            await Auth.createBackendSession(user.email, user.uid);
          } catch (sessionErr) {
            console.warn('Backend session creation failed:', sessionErr.message);
          }
          window.location.href = '/chat.html';
          return;
        }
        // Not approved — sign out and show guest nav
        await Auth.logout();
      } catch {
        // Network error — show guest nav
      }
      showGuestNav();
    } else {
      showGuestNav();
    }
  });

  function showGuestNav() {
    if (navAuthGuest) navAuthGuest.style.display = 'block';
    if (navAuthGuestLogin) navAuthGuestLogin.style.display = 'block';
    if (navAuthUser) navAuthUser.style.display = 'none';
    if (navAuthUserLogout) navAuthUserLogout.style.display = 'none';
  }

  function showUserNav() {
    if (navAuthGuest) navAuthGuest.style.display = 'none';
    if (navAuthGuestLogin) navAuthGuestLogin.style.display = 'none';
    if (navAuthUser) navAuthUser.style.display = 'block';
    if (navAuthUserLogout) navAuthUserLogout.style.display = 'block';
  }

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
      isSigningUp = true; // Prevent onAuthChange from signing out during signup
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

      let firebaseUser = null;
      try {
        // Step 1: Create Firebase Auth account
        status.textContent = 'Creating your account...';
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        firebaseUser = cred.user;

        // Step 2: Update display name
        if (name) {
          await firebaseUser.updateProfile({ displayName: name });
        }

        // Step 3: Send email verification (non-blocking — don't fail if this errors)
        status.textContent = 'Sending verification email...';
        firebaseUser.sendEmailVerification().catch(() => {
          console.warn('Email verification could not be sent');
        });

        // Step 4: Save to backend early access table
        status.textContent = 'Registering for early access...';
        let res;
        try {
          res = await fetch(`${API}/early-access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              firebase_uid: firebaseUser.uid,
              name: name,
              source: 'website',
            }),
          });
        } catch (networkErr) {
          // Network error — delete Firebase account so user can re-register
          try {
            if (firebaseUser) await firebaseUser.delete();
          } catch (deleteErr) {
            console.warn('Could not delete Firebase account:', deleteErr);
          }
          await firebase.auth().signOut();
          status.textContent = 'Could not reach the server. Your account was not created. Please try again.';
          status.className = 'form-status error';
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Backend rejected — delete Firebase account so user can re-register
          try {
            if (firebaseUser) await firebaseUser.delete();
          } catch (deleteErr) {
            console.warn('Could not delete Firebase account:', deleteErr);
          }
          await firebase.auth().signOut();
          status.textContent = data.detail || 'Registration failed. Please try again.';
          status.className = 'form-status error';
          return;
        }

        // Step 5: Success — sign out and show pending screen
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
        // If Firebase account was created but something else failed, delete it
        if (firebaseUser) {
          try {
            await firebaseUser.delete();
          } catch (deleteErr) {
            console.warn('Could not delete Firebase account:', deleteErr);
          }
          try { await firebase.auth().signOut(); } catch {}
        }
        status.textContent = friendlyError(err.code) || 'Something went wrong. Please try again.';
        status.className = 'form-status error';
      } finally {
        isSigningUp = false;
      }
    });
  }

  // ─── Google Sign-Up (Early Access) ────────────────────────
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
      isSigningUp = true;
      status.textContent = 'Opening Google sign-in...';
      status.className = 'form-status';
      googleSignupBtn.disabled = true;

      try {
        const user = await Auth.signInWithGoogle();

        status.textContent = 'Registering for early access...';

        let res;
        try {
          res = await fetch(`${API}/early-access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              firebase_uid: user.uid,
              name: user.displayName || '',
              source: 'google',
            }),
          });
        } catch (networkErr) {
          try { await user.delete(); } catch {}
          await Auth.logout();
          status.textContent = 'Could not reach the server. Please try again.';
          status.className = 'form-status error';
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          await Auth.logout();
          status.textContent = data.detail || 'Registration failed. Please try again.';
          status.className = 'form-status error';
          return;
        }

        await Auth.logout();
        form.style.display = 'none';
        if (pendingApproval) {
          pendingApproval.style.display = 'block';
          pendingEmail.textContent = user.email;
        }
        status.textContent = '';

      } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
          status.textContent = '';
        } else {
          status.textContent = friendlyError(err.code) || 'Google sign-in failed. Please try again.';
          status.className = 'form-status error';
        }
        try { await Auth.logout(); } catch {}
      } finally {
        isSigningUp = false;
        googleSignupBtn.disabled = false;
      }
    });
  }

  // ─── Google Login (Auth Modal) ────────────────────────────
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      loginInProgress = true;
      loginError.textContent = 'Opening Google sign-in...';
      loginError.style.color = 'var(--ink-muted)';
      googleLoginBtn.disabled = true;

      try {
        const user = await Auth.signInWithGoogle();

        loginError.textContent = 'Checking access status...';

        let statusRes;
        try {
          statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(user.email)}`);
        } catch (networkErr) {
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Could not verify access status. Check your connection.';
          loginError.style.color = '';
          return;
        }

        const statusData = await statusRes.json().catch(() => ({}));
        const userStatus = statusData?.data?.status;

        if (!statusRes.ok || !userStatus || userStatus === 'pending') {
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Your account is pending admin approval.';
          loginError.style.color = '';
          return;
        }
        if (userStatus === 'rejected') {
          await Auth.logout().catch(() => {});
          loginError.textContent = 'Your early access request was not approved.';
          loginError.style.color = '';
          return;
        }

        // Approved — create backend JWT session
        loginError.textContent = 'Setting up your session...';
        try {
          await Auth.createBackendSession(user.email, user.uid);
        } catch (sessionErr) {
          console.warn('Backend session creation failed:', sessionErr.message);
        }
        loginError.textContent = '';
        closeAuthModal();

      } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
          loginError.textContent = '';
        } else {
          loginError.textContent = friendlyError(err.code) || 'Google sign-in failed. Please try again.';
          loginError.style.color = '';
        }
        try { await Auth.logout().catch(() => {}); } catch {}
      } finally {
        loginInProgress = false;
        googleLoginBtn.disabled = false;
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
      // Use Auth.authedFetch which handles backend JWT tokens
      const res = await Auth.authedFetch(`${API}/chat`, {
        method: 'POST',
        body: JSON.stringify({ conversationId, message: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));

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
