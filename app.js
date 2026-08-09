// Frontend Logic for Blog Platform API Interactive Dashboard
// Manages authentication tokens, API requests, and live UI updates

// Global App State
let activeToken = localStorage.getItem('blog_jwt_token') || null;
let currentUser = JSON.parse(localStorage.getItem('blog_user_info') || 'null');

// DOM Elements
const authStatusText = document.getElementById('authStatusText');
const statusDot = document.getElementById('statusDot');
const logoutBtn = document.getElementById('logoutBtn');
const tokenDisplay = document.getElementById('tokenDisplay');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');
const createPostForm = document.getElementById('createPostForm');
const postsList = document.getElementById('postsList');
const loadingPosts = document.getElementById('loadingPosts');
const consoleOutput = document.getElementById('consoleOutput');

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateAuthStateUI();
  fetchPosts();
});

// Switch between Login and Register tabs
function switchAuthTab(tab) {
  if (tab === 'login') {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// Update UI elements based on authentication status
function updateAuthStateUI() {
  if (activeToken && currentUser) {
    statusDot.className = 'status-dot dot-online';
    authStatusText.textContent = `Logged in as @${currentUser.username}`;
    logoutBtn.classList.remove('hidden');
    tokenDisplay.textContent = `Bearer ${activeToken}`;
  } else {
    statusDot.className = 'status-dot dot-offline';
    authStatusText.textContent = 'Not Logged In (Guest)';
    logoutBtn.classList.add('hidden');
    tokenDisplay.innerHTML = `<span class="token-placeholder">No active JWT session. Log in or register to get a Bearer token.</span>`;
  }
}

// Helper to log HTTP activity in live console
function logToConsole(method, url, status, responseData) {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${method} ${url} -> Status ${status}\nResponse: ${JSON.stringify(responseData, null, 2)}\n\n`;
  consoleOutput.textContent = logMessage + consoleOutput.textContent;
}

// Clear live console
function clearConsole() {
  consoleOutput.textContent = 'Console cleared.';
}

// Show toast notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ----------------------------------------------------
// AUTHENTICATION HANDLERS
// ----------------------------------------------------

// Handle User Login (POST /login)
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    logToConsole('POST', '/login', res.status, data);

    if (data.success) {
      activeToken = data.token;
      currentUser = data.user;
      localStorage.setItem('blog_jwt_token', data.token);
      localStorage.setItem('blog_user_info', JSON.stringify(data.user));

      updateAuthStateUI();
      showToast(`Welcome back, ${data.user.username}!`, 'success');
      loginForm.reset();
      fetchPosts(); // Refresh posts to update authorization action buttons
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Network error during login', 'error');
  }
});

// Handle User Registration (POST /register)
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    logToConsole('POST', '/register', res.status, data);

    if (data.success) {
      activeToken = data.token;
      currentUser = data.user;
      localStorage.setItem('blog_jwt_token', data.token);
      localStorage.setItem('blog_user_info', JSON.stringify(data.user));

      updateAuthStateUI();
      showToast(`Registration successful! Welcome @${data.user.username}`, 'success');
      registerForm.reset();
      switchAuthTab('login');
      fetchPosts();
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    showToast('Network error during registration', 'error');
  }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
  activeToken = null;
  currentUser = null;
  localStorage.removeItem('blog_jwt_token');
  localStorage.removeItem('blog_user_info');
  updateAuthStateUI();
  showToast('Logged out successfully', 'info');
  fetchPosts();
});

// Copy JWT Token to clipboard
function copyJwtToken() {
  if (!activeToken) {
    showToast('No active token to copy', 'error');
    return;
  }
  navigator.clipboard.writeText(activeToken);
  showToast('JWT Token copied to clipboard!', 'success');
}

// ----------------------------------------------------
// BLOG POSTS CRUD HANDLERS
// ----------------------------------------------------

// Fetch all posts (GET /posts - Public)
async function fetchPosts() {
  loadingPosts.classList.remove('hidden');
  postsList.innerHTML = '';

  try {
    const res = await fetch('/posts');
    const data = await res.json();
    logToConsole('GET', '/posts', res.status, data);

    loadingPosts.classList.add('hidden');

    if (data.success && data.data.length > 0) {
      data.data.forEach((post) => renderPostCard(post));
    } else {
      postsList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px;"></i>
          <p>No blog posts found. Be the first to publish one above!</p>
        </div>
      `;
    }
  } catch (error) {
    loadingPosts.classList.add('hidden');
    showToast('Error fetching blog posts', 'error');
  }
}

// Render a single post card in DOM
function renderPostCard(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card';
  postCard.id = `post-${post._id}`;

  const authorName = post.author ? post.author.username : 'Unknown Author';
  const authorId = post.author ? (post.author._id || post.author) : null;
  const isOwner = currentUser && authorId && currentUser.id === authorId;
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const tagsHtml = post.tags && post.tags.length > 0
    ? post.tags.map((t) => `<span class="post-tag">#${t.trim()}</span>`).join(' ')
    : '';

  postCard.innerHTML = `
    <div class="post-header">
      <h4 class="post-title">${escapeHtml(post.title)}</h4>
      <div class="post-actions">
        ${
          isOwner
            ? `
            <button class="btn btn-outline btn-sm" onclick="editPost('${post._id}', '${escapeHtml(post.title)}', '${escapeHtml(post.content)}')">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deletePost('${post._id}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          `
            : `
            <span class="badge ${currentUser ? 'badge-tech' : 'badge-tech'}" title="Only author can edit or delete">
              ${isOwner ? 'Author' : 'Read Only'}
            </span>
          `
        }
      </div>
    </div>
    <div class="post-meta">
      <span><i class="fa-solid fa-user"></i> <span class="author-tag">@${authorName}</span></span>
      <span><i class="fa-solid fa-calendar"></i> ${formattedDate}</span>
    </div>
    <div class="post-body">${escapeHtml(post.content)}</div>
    <div class="post-tags-list">${tagsHtml}</div>
  `;

  postsList.appendChild(postCard);
}

// Create new post (POST /posts - Protected)
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!activeToken) {
    showToast('Authorization required! Please log in first.', 'error');
    return;
  }

  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const tagsString = document.getElementById('postTags').value.trim();
  const tags = tagsString ? tagsString.split(',').map((t) => t.trim()) : [];

  try {
    const res = await fetch('/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ title, content, tags }),
    });

    const data = await res.json();
    logToConsole('POST', '/posts', res.status, data);

    if (data.success) {
      showToast('Blog post published successfully!', 'success');
      createPostForm.reset();
      fetchPosts();
    } else {
      showToast(data.error || 'Failed to create post', 'error');
    }
  } catch (error) {
    showToast('Network error creating post', 'error');
  }
});

// Edit existing post (PUT /posts/:id - Protected / Owner only)
async function editPost(id, currentTitle, currentContent) {
  if (!activeToken) {
    showToast('Authorization required! Please log in first.', 'error');
    return;
  }

  const newTitle = prompt('Edit Post Title:', currentTitle);
  if (newTitle === null) return; // Cancelled

  const newContent = prompt('Edit Post Content:', currentContent);
  if (newContent === null) return; // Cancelled

  try {
    const res = await fetch(`/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });

    const data = await res.json();
    logToConsole('PUT', `/posts/${id}`, res.status, data);

    if (data.success) {
      showToast('Post updated successfully!', 'success');
      fetchPosts();
    } else {
      showToast(data.error || 'Failed to update post', 'error');
    }
  } catch (error) {
    showToast('Error updating post', 'error');
  }
}

// Delete post (DELETE /posts/:id - Protected / Owner only)
async function deletePost(id) {
  if (!activeToken) {
    showToast('Authorization required! Please log in first.', 'error');
    return;
  }

  if (!confirm('Are you sure you want to delete this blog post?')) return;

  try {
    const res = await fetch(`/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });

    const data = await res.json();
    logToConsole('DELETE', `/posts/${id}`, res.status, data);

    if (data.success) {
      showToast('Post deleted successfully!', 'success');
      fetchPosts();
    } else {
      showToast(data.error || 'Failed to delete post', 'error');
    }
  } catch (error) {
    showToast('Error deleting post', 'error');
  }
}

// Helper to escape HTML characters
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
