/**
 * Pulse AI — Chat Page Script
 * Full-page chat interface for approved users.
 */

(function () {
  'use strict';

  const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';

  // ─── Elements ──────────────────────────────────────────────
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatTopbarTitle = document.getElementById('chatTopbarTitle');
  const conversationsList = document.getElementById('conversationsList');
  const newChatBtn = document.getElementById('newChatBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const chatSidebar = document.getElementById('chatSidebar');

  let currentConversationId = null;
  let isSending = false;

  // ─── Auth gate ─────────────────────────────────────────────
  Auth.onAuthChange(async (user) => {
    if (!user) {
      window.location.href = '/';
      return;
    }

    // Check approval status
    try {
      const statusRes = await fetch(`${API}/early-access/status?email=${encodeURIComponent(user.email)}`);
      const statusData = await statusRes.json();
      const userStatus = statusData?.data?.status;
      if (!statusRes.ok || !userStatus || userStatus !== 'approved') {
        await Auth.logout();
        window.location.href = '/';
        return;
      }
    } catch {
      // Network error — let them stay, chat will handle 403s
    }

    // Show user info
    const displayName = user.displayName || user.email.split('@')[0];
    userName.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // Load conversations
    loadConversations();
  });

  // ─── Sidebar toggle (mobile) ───────────────────────────────
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      chatSidebar.classList.add('open');
    });
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      chatSidebar.classList.remove('open');
    });
  }

  // ─── Load conversations list ───────────────────────────────
  async function loadConversations() {
    try {
      const token = await Auth.getIdToken();
      const res = await fetch(`${API}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const conversations = data.data?.conversations || [];

      if (conversations.length === 0) {
        conversationsList.innerHTML = '<p class="conversations-empty">No conversations yet.</p>';
        return;
      }

      conversationsList.innerHTML = conversations.map((c) => `
        <div class="conv-item ${c.id === currentConversationId ? 'active' : ''}" data-id="${c.id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="conv-title">${escapeHtml(c.title || 'New Chat')}</span>
          <button class="conv-delete" data-id="${c.id}" aria-label="Delete conversation">&times;</button>
        </div>
      `).join('');

      // Bind click handlers
      conversationsList.querySelectorAll('.conv-item').forEach((el) => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('conv-delete')) return;
          loadConversation(el.dataset.id);
          chatSidebar.classList.remove('open');
        });
      });

      conversationsList.querySelectorAll('.conv-delete').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await deleteConversation(btn.dataset.id);
        });
      });
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  // ─── Load a specific conversation ──────────────────────────
  async function loadConversation(id) {
    try {
      const token = await Auth.getIdToken();
      const res = await fetch(`${API}/chat/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const conversation = data.data?.conversation;
      if (!conversation) return;

      currentConversationId = id;
      chatTopbarTitle.textContent = conversation.title || 'Chat';

      // Clear messages and render
      chatMessages.innerHTML = '';
      conversation.messages.forEach((msg) => {
        addMessage(msg.role, msg.content, false);
      });

      // Update active state in sidebar
      conversationsList.querySelectorAll('.conv-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === id);
      });

      scrollToBottom();
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }

  // ─── Delete conversation ───────────────────────────────────
  async function deleteConversation(id) {
    try {
      const token = await Auth.getIdToken();
      await fetch(`${API}/chat/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (currentConversationId === id) {
        currentConversationId = null;
        chatTopbarTitle.textContent = 'New Chat';
        chatMessages.innerHTML = '';
        renderWelcome();
      }

      loadConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  }

  // ─── New chat ──────────────────────────────────────────────
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      currentConversationId = null;
      chatTopbarTitle.textContent = 'New Chat';
      chatMessages.innerHTML = '';
      renderWelcome();
      chatSidebar.classList.remove('open');
    });
  }

  // ─── Welcome screen ────────────────────────────────────────
  function renderWelcome() {
    chatMessages.innerHTML = `
      <div class="chat-welcome">
        <svg viewBox="0 0 64 64" width="56" height="56"><circle cx="32" cy="32" r="30" fill="#DC2F3D"/><path d="M8 32H22L27 18L36 46L41 32H56" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h2>How can I help you today?</h2>
        <p>Ask me anything about health, wellness, or symptoms.<br>I'll provide general guidance — never a diagnosis.</p>
        <div class="welcome-suggestions">
          <button class="suggestion-btn" data-msg="What are common causes of persistent headaches?">Common causes of headaches</button>
          <button class="suggestion-btn" data-msg="When should I see a doctor about chest pain?">When to see a doctor</button>
          <button class="suggestion-btn" data-msg="What are the early signs of diabetes?">Early signs of diabetes</button>
        </div>
      </div>
    `;
    bindSuggestionBtns();
  }

  // ─── Suggestion buttons ────────────────────────────────────
  function bindSuggestionBtns() {
    chatMessages.querySelectorAll('.suggestion-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sendMessage(btn.dataset.msg);
      });
    });
  }

  bindSuggestionBtns();

  // ─── Add message to DOM ────────────────────────────────────
  function addMessage(role, content, animate = true) {
    // Remove welcome screen if present
    const welcome = chatMessages.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    if (!animate) div.style.animation = 'none';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = role === 'user' ? (userName?.textContent?.charAt(0) || 'U') : 'P';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.textContent = content;

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ─── Typing indicator ──────────────────────────────────────
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg assistant';
    div.id = 'chatTyping';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = 'P';

    const dots = document.createElement('div');
    dots.className = 'chat-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';

    div.appendChild(avatar);
    div.appendChild(dots);
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  // ─── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    if (isSending || !text.trim()) return;

    const user = Auth.getUser();
    if (!user) {
      window.location.href = '/';
      return;
    }

    isSending = true;
    chatSend.disabled = true;

    addMessage('user', text.trim());
    chatInput.value = '';
    autoResizeInput();
    showTyping();

    try {
      const token = await Auth.getIdToken();
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId: currentConversationId, message: text.trim() }),
      });
      const data = await res.json();

      removeTyping();

      if (res.ok && data.data) {
        currentConversationId = data.data.conversationId;
        chatTopbarTitle.textContent = data.data.message.content.substring(0, 50) + (data.data.message.content.length > 50 ? '...' : '');
        addMessage('assistant', data.data.message.content);
        loadConversations();
      } else if (res.status === 401 || res.status === 403) {
        addMessage('assistant', data.detail || 'Access denied. Please log in again.');
        setTimeout(async () => {
          await Auth.logout();
          window.location.href = '/';
        }, 2000);
      } else {
        addMessage('assistant', data.detail || 'Something went wrong. Please try again.');
      }
    } catch {
      removeTyping();
      addMessage('assistant', 'Could not reach the server. Please check your connection and try again.');
    }

    isSending = false;
    chatSend.disabled = false;
    chatInput.focus();
  }

  // ─── Form submit ───────────────────────────────────────────
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(chatInput.value);
    });
  }

  // ─── Auto-resize textarea ──────────────────────────────────
  function autoResizeInput() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  }

  if (chatInput) {
    chatInput.addEventListener('input', autoResizeInput);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value);
      }
    });
  }

  // ─── Logout ────────────────────────────────────────────────
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await Auth.logout();
      window.location.href = '/';
    });
  }

  // ─── Helpers ───────────────────────────────────────────────
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
