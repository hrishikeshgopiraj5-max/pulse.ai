/**
 * Pulse AI — Firebase Authentication
 *
 * Handles user registration, login, logout, and auth state.
 * Uses Firebase JS SDK (loaded via CDN in index.html).
 */

const Auth = (() => {
  'use strict';

  let currentUser = null;
  let onAuthChangeCallbacks = [];

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

  // ─── Logout ───────────────────────────────────────────────
  async function logout() {
    await auth.signOut();
  }

  // ─── Get ID token (for API calls) ─────────────────────────
  async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  // ─── Get current user ─────────────────────────────────────
  function getUser() {
    return auth.currentUser;
  }

  function isLoggedIn() {
    return !!auth.currentUser;
  }

  return {
    register,
    login,
    logout,
    getIdToken,
    getUser,
    isLoggedIn,
    onAuthChange,
  };
})();
