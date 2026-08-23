/**
 * Pulse AI — Admin Dashboard Script
 * Manages early access sign-ups: view, approve, reject.
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
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statApproved = document.getElementById('statApproved');
  const statRejected = document.getElementById('statRejected');

  let currentFilter = 'pending';
  let adminKey = localStorage.getItem(ADMIN_STORAGE_KEY) || '';

  // ─── Init ──────────────────────────────────────────────────
  if (adminKey) {
    showDashboard();
  }

  // ─── Admin login ───────────────────────────────────────────
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = adminKeyInput.value.trim();
      if (!key) {
        adminLoginError.textContent = 'Please enter the admin key.';
        return;
      }
      adminKey = key;
      localStorage.setItem(ADMIN_STORAGE_KEY, key);
      showDashboard();
    });
  }

  // ─── Admin logout ──────────────────────────────────────────
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      adminKey = '';
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      adminDashboard.style.display = 'none';
      adminLogin.style.display = 'flex';
      adminLoginError.textContent = '';
    });
  }

  // ─── Show dashboard ────────────────────────────────────────
  async function showDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    await loadStats();
    await loadSignups();
  }

  // ─── Authed fetch ──────────────────────────────────────────
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
          adminKey = '';
          localStorage.removeItem(ADMIN_STORAGE_KEY);
          adminDashboard.style.display = 'none';
          adminLogin.style.display = 'flex';
          adminLoginError.textContent = 'Invalid admin key.';
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

  // ─── Tab filters ───────────────────────────────────────────
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      await loadSignups();
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
