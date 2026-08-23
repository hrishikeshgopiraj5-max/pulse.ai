/**
 * Pulse AI — Admin Dashboard Script
 * Manages early access sign-ups: view, approve, reject.
 * Includes analytics dashboard for tracking medical topics.
 *
 * SECURITY: Admin key is verified against the backend before showing dashboard.
 * The key is never shown or stored unencrypted.
 */

(function () {
  'use strict';

  const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';
  const ADMIN_STORAGE_KEY = 'pulse_admin_key';

  const adminLogin = document.getElementById('adminLogin');
  const adminDashboard = document.getElementById('adminDashboard');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminKeyInput = document.getElementById('adminKey');
  const adminLoginError = document.getElementById('adminLoginError');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminTableWrap = document.getElementById('adminTableWrap');
  const analyticsPanel = document.getElementById('analyticsPanel');
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statApproved = document.getElementById('statApproved');
  const statRejected = document.getElementById('statRejected');

  let currentFilter = 'pending';
  let adminKey = '';

  // ─── SECURITY: Always start with login screen ─────────────
  // Never auto-login from localStorage — always verify against backend
  showLogin();

  // ─── Admin login form ─────────────────────────────────────
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      adminLoginError.textContent = '';

      const key = adminKeyInput.value.trim();
      if (!key) {
        adminLoginError.textContent = 'Please enter the admin key.';
        return;
      }

      // Show loading state
      const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Verifying...';
      submitBtn.disabled = true;

      try {
        // CRITICAL: Verify the key against the backend BEFORE showing dashboard
        const verifyRes = await fetch(`${API}/early-access/admin/verify`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': key,
          },
        });

        if (verifyRes.ok) {
          // Key is valid — store and show dashboard
          adminKey = key;
          localStorage.setItem(ADMIN_STORAGE_KEY, key);
          showDashboard();
        } else if (verifyRes.status === 401 || verifyRes.status === 403) {
          adminLoginError.textContent = 'Invalid admin key. Please check and try again.';
          adminKeyInput.value = '';
          adminKeyInput.focus();
        } else if (verifyRes.status === 503) {
          adminLoginError.textContent = 'Admin authentication is not configured on the server. Contact the developer.';
        } else {
          adminLoginError.textContent = 'Something went wrong. Please try again.';
        }
      } catch (err) {
        adminLoginError.textContent = 'Could not reach the server. Check your connection.';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ─── Admin logout ──────────────────────────────────────────
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      adminKey = '';
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      showLogin();
    });
  }

  // ─── Show/hide screens ────────────────────────────────────
  function showLogin() {
    adminLogin.style.display = 'flex';
    adminDashboard.style.display = 'none';
    adminLoginError.textContent = '';
    adminKeyInput.value = '';
  }

  async function showDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    await loadStats();
    await loadSignups();
  }

  // ─── Authed fetch (sends admin key with every request) ────
  async function adminFetch(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
        ...(options.headers || {}),
      },
    });
  }

  // ─── Load stats ────────────────────────────────────────────
  async function loadStats() {
    try {
      const res = await adminFetch(`${API}/early-access/count`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Session expired or key revoked — force re-login
          adminKey = '';
          localStorage.removeItem(ADMIN_STORAGE_KEY);
          showLogin();
          adminLoginError.textContent = 'Session expired. Please log in again.';
          return;
        }
        return;
      }
      const data = await res.json();
      const counts = data.counts || {};
      statTotal.textContent = counts.total ?? data.count ?? '—';
      statPending.textContent = counts.pending ?? '—';
      statApproved.textContent = counts.approved ?? '—';
      statRejected.textContent = counts.rejected ?? '—';
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  // ─── Load signups ──────────────────────────────────────────
  async function loadSignups() {
    try {
      const filterParam = currentFilter ? `?status=${currentFilter}` : '';
      const res = await adminFetch(`${API}/early-access${filterParam}`);
      if (!res.ok) return;

      const data = await res.json();
      const signups = data.data?.data || [];

      if (signups.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No ${currentFilter || 'sign-ups'} found.</td></tr>`;
        return;
      }

      adminTableBody.innerHTML = signups.map((s) => `
        <tr data-id="${s.id}">
          <td><strong>${escapeHtml(s.name || '—')}</strong></td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.source || '—')}</td>
          <td><span class="status-badge ${s.status}">${s.status}</span></td>
          <td>${formatDate(s.subscribedAt)}</td>
          <td class="actions-cell">
            ${s.status === 'pending' ? `
              <button class="action-btn approve" data-action="approve" data-id="${s.id}">Approve</button>
              <button class="action-btn reject" data-action="reject" data-id="${s.id}">Reject</button>
            ` : ''}
            ${s.status === 'approved' ? `
              <button class="action-btn reject" data-action="reject" data-id="${s.id}">Revoke</button>
            ` : ''}
            ${s.status === 'rejected' ? `
              <button class="action-btn approve" data-action="approve" data-id="${s.id}">Approve</button>
            ` : ''}
          </td>
        </tr>
      `).join('');

      // Bind action buttons
      adminTableBody.querySelectorAll('.action-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          await performAction(action, id);
        });
      });
    } catch (err) {
      console.error('Failed to load signups:', err);
    }
  }

  // ─── Approve / Reject ──────────────────────────────────────
  async function performAction(action, id) {
    try {
      const res = await adminFetch(`${API}/early-access/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ admin_note: `Admin ${action}` }),
      });

      if (res.ok) {
        await loadStats();
        await loadSignups();
      } else {
        const data = await res.json();
        alert(data.detail || `Failed to ${action} user.`);
      }
    } catch (err) {
      alert(`Network error. Could not ${action} user.`);
    }
  }

  // ─── Load analytics ────────────────────────────────────────
  async function loadAnalytics() {
    try {
      const res = await adminFetch(`${API}/early-access/analytics`);
      if (!res.ok) return;

      const data = await res.json();
      const analytics = data.data || {};

      document.getElementById('analyticsTotal').textContent = analytics.totalQueries || 0;
      document.getElementById('analyticsBlocked').textContent = analytics.nonMedicalBlocked || 0;
      document.getElementById('analyticsEmergency').textContent = analytics.emergencyDetected || 0;

      const topicsContainer = document.getElementById('analyticsTopics');
      const topics = analytics.topTopics || [];
      if (topics.length === 0) {
        topicsContainer.innerHTML = '<p class="table-empty">No data yet. Queries will appear as users chat.</p>';
      } else {
        topicsContainer.innerHTML = topics.map((t) => `
          <div class="topic-bar">
            <span class="topic-name">${escapeHtml(t.topic)}</span>
            <div class="topic-bar-bg">
              <div class="topic-bar-fill" style="width: ${Math.min(100, (t.count / topics[0].count) * 100)}%"></div>
            </div>
            <span class="topic-count">${t.count}</span>
          </div>
        `).join('');
      }

      const recentContainer = document.getElementById('analyticsRecent');
      const recent = analytics.recentQueries || [];
      if (recent.length === 0) {
        recentContainer.innerHTML = '<p class="table-empty">No recent queries.</p>';
      } else {
        recentContainer.innerHTML = recent.map((q) => `
          <div class="recent-query">
            <span class="recent-msg">${escapeHtml(q.message)}</span>
            <span class="recent-topics">${q.topics.slice(0, 3).map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`).join('')}</span>
            ${q.emergency ? '<span class="emergency-badge">EMERGENCY</span>' : ''}
            <span class="recent-time">${formatDate(q.timestamp)}</span>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }

  // ─── Tab filters ───────────────────────────────────────────
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;

      if (currentFilter === 'analytics') {
        adminTableWrap.style.display = 'none';
        analyticsPanel.style.display = 'block';
        await loadAnalytics();
      } else {
        adminTableWrap.style.display = 'block';
        analyticsPanel.style.display = 'none';
        await loadSignups();
      }
    });
  });

  // ─── Helpers ───────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
})();
