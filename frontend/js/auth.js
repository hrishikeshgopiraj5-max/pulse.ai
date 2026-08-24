/**
 * Pulse AI — Firebase Authentication + Backend JWT Bridge
 *
 * Handles user registration, login, logout, and auth state.
 * Uses Firebase JS SDK (loaded via CDN in index.html) for user identity.
 * Uses backend JWT tokens for API chat access.
 */

const Auth = (() => {
  'use strict';

  let currentUser = null;
  let onAuthChangeCallbacks = [];
  let backendToken = null;
  let backendRefreshToken = null;

  const BACKEND_TOKEN_KEY = 'pulse_backend_token';
  const BACKEND_REFRESH_KEY = 'pulse_backend_refresh';

  // ─── Initialize Firebase ──────────────────────────────────
  const firebaseConfig = {
    apiKey: "AIzaSyBeMI1vx2zfsR9tnp0kaUlabEklWMXWybw",
    authDomain: "pulse-ai-9cace.firebaseapp.com",
    projectId: "pulse-ai-9cace",
    storageBucket: "pulse-ai-9cace.firebasestorage.app",
    messagingSenderId: "1075537507614",
    appId: "1:1075537507614:web:72951ce6dac2dd7228c50f",
    measurementId: "G-HDNLQP1NN9"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // ─── Restore backend tokens from localStorage ─────────────
  try {
    backendToken = localStorage.getItem(BACKEND_TOKEN_KEY);
    backendRefreshToken = localStorage.getItem(BACKEND_REFRESH_KEY);
  } catch {}

  // ─── Auth state listener ──────────────────────────────────
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    onAuthChangeCallbacks.forEach((cb) => cb(user));
  });

  function onAuthChange(callback) {
    onAuthChangeCallbacks.push(callback);
    if (currentUser !== null) callback(currentUser);
  }

  // ─── Register ─────────────────────────────────────────────
  async function register(email, password, displayName) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    if (displayName) {
      await cred.user.updateProfile({ displayName });
    }
    return cred.user;
  }

  // ─── Login ────────────────────────────────────────────────
  async function login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  // ─── Password Reset ─────────────────────────────────────
  async function sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email);
  }

  // ─── Google Sign-In ──────────────────────────────────────
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const cred = await auth.signInWithPopup(provider);
    return cred.user;
  }

  // ─── Logout ───────────────────────────────────────────────
  async function logout() {
    await auth.signOut();
    // Clear backend tokens
    backendToken = null;
    backendRefreshToken = null;
    try {
      localStorage.removeItem(BACKEND_TOKEN_KEY);
      localStorage.removeItem(BACKEND_REFRESH_KEY);
    } catch {}
  }

  // ─── Get Firebase ID token (for session creation) ─────────
  async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  // ─── Get backend JWT token ────────────────────────────────
  async function getBackendToken() {
    // If we have a stored token, return it
    if (backendToken) return backendToken;

    // If no user, no token
    const user = auth.currentUser;
    if (!user) return null;

    // Try to create a session with the backend
    try {
      const session = await createBackendSession(user.email, user.uid);
      if (session) return session.accessToken;
    } catch (err) {
      console.warn('Failed to create backend session:', err.message);
    }

    return null;
  }

  // ─── Create backend session (Firebase → JWT bridge) ───────
  async function createBackendSession(email, firebaseUid) {
    const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';

    const res = await fetch(`${API}/auth/firebase-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firebase_uid: firebaseUid }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || 'Failed to create session');
    }

    // Store tokens
    backendToken = data.data.accessToken;
    backendRefreshToken = data.data.refreshToken;

    try {
      localStorage.setItem(BACKEND_TOKEN_KEY, backendToken);
      localStorage.setItem(BACKEND_REFRESH_KEY, backendRefreshToken);
    } catch {}

    return data.data;
  }

  // ─── Refresh backend token ────────────────────────────────
  async function refreshBackendToken() {
    if (!backendRefreshToken) return null;

    const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: backendRefreshToken }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Refresh token is invalid — clear everything
        backendToken = null;
        backendRefreshToken = null;
        try {
          localStorage.removeItem(BACKEND_TOKEN_KEY);
          localStorage.removeItem(BACKEND_REFRESH_KEY);
        } catch {}
        return null;
      }

      backendToken = data.data.accessToken;
      backendRefreshToken = data.data.refreshToken;

      try {
        localStorage.setItem(BACKEND_TOKEN_KEY, backendToken);
        localStorage.setItem(BACKEND_REFRESH_KEY, backendRefreshToken);
      } catch {}

      return backendToken;
    } catch {
      return null;
    }
  }

  // ─── Get current user ─────────────────────────────────────
  function getUser() {
    return auth.currentUser;
  }

  function isLoggedIn() {
    return !!auth.currentUser;
  }

  // ─── Authed fetch (uses backend JWT for API calls) ────────
  async function authedFetch(url, options = {}) {
    let token = await getBackendToken();

    // If token is expired, try refreshing
    if (token) {
      const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
      // If the caller didn't set Content-Type, set it
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';

      const res = await fetch(url, { ...options, headers });

      // If 401, try refreshing token and retrying once
      if (res.status === 401) {
        const newToken = await refreshBackendToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        }
      }

      return res;
    }

    // No token — send request anyway (middleware will reject if needed)
    const headers = { ...options.headers };
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    return fetch(url, { ...options, headers });
  }

  return {
    register,
    login,
    signInWithGoogle,
    sendPasswordReset,
    logout,
    getIdToken,
    getBackendToken,
    createBackendSession,
    getUser,
    isLoggedIn,
    onAuthChange,
    authedFetch,
  };
})();
