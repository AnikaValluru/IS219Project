const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname);
const USERS_FILE = path.join(__dirname, 'users.json');

const sessions = new Map();
const users = new Map();
const SESSION_COOKIE = 'auth_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const ALLOW_ANY_LOGIN = process.env.ALLOW_ANY_LOGIN === 'true';

const AUTH_EMAIL = process.env.DEMO_LOGIN_EMAIL || 'student@is219.local';
const AUTH_PASSWORD = process.env.DEMO_LOGIN_PASSWORD || 'password123';

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function saveUsersToDisk() {
  const payload = Array.from(users.entries()).map(([email, value]) => ({
    email,
    passwordHash: value.passwordHash,
    createdAt: value.createdAt,
  }));

  fs.writeFileSync(USERS_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

function seedDefaultUser() {
  users.set(AUTH_EMAIL.toLowerCase(), {
    passwordHash: hashPassword(AUTH_PASSWORD),
    createdAt: new Date().toISOString(),
  });
  saveUsersToDisk();
}

function loadUsersFromDisk() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      seedDefaultUser();
      return;
    }

    const content = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      seedDefaultUser();
      return;
    }

    parsed.forEach((item) => {
      if (!item || typeof item.email !== 'string' || typeof item.passwordHash !== 'string') {
        return;
      }

      users.set(item.email.toLowerCase(), {
        passwordHash: item.passwordHash,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      });
    });

    if (!users.size) {
      seedDefaultUser();
    }
  } catch (error) {
    users.clear();
    seedDefaultUser();
  }
}

loadUsersFromDisk();

app.use(express.urlencoded({ extended: false }));

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split('=');
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

function createSession(res, email) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    email,
    createdAt: Date.now(),
  });

  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  );
}

function clearSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];

  if (token) {
    sessions.delete(token);
  }

  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

function getActiveSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function sanitizeNextPath(candidatePath) {
  if (!candidatePath || typeof candidatePath !== 'string') {
    return '/index.html';
  }

  if (!candidatePath.startsWith('/')) {
    return '/index.html';
  }

  // Prevent open redirects such as //evil.example.com
  if (candidatePath.startsWith('//')) {
    return '/index.html';
  }

  if (candidatePath.startsWith('/login.html') || candidatePath.startsWith('/auth/')) {
    return '/index.html';
  }

  return candidatePath;
}

function requiresAuth(req) {
  const requestPath = req.path.toLowerCase();

  if (
    requestPath === '/login.html' ||
    requestPath === '/create-user.html' ||
    requestPath === '/auth/login' ||
    requestPath === '/auth/register' ||
    requestPath === '/api/health'
  ) {
    return false;
  }

  if (requestPath.startsWith('/images/') || requestPath.startsWith('/playwright-report/')) {
    return false;
  }

  const publicExtPattern = /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|map|txt|json)$/i;
  if (publicExtPattern.test(requestPath)) {
    return false;
  }

  return requestPath === '/' || requestPath.endsWith('.html');
}

app.use((req, res, next) => {
  const session = getActiveSession(req);
  req.user = session;

  if (!requiresAuth(req)) {
    return next();
  }

  if (!session) {
    const nextPath = encodeURIComponent(req.originalUrl || '/index.html');
    return res.redirect(`/login.html?next=${nextPath}`);
  }

  return next();
});

app.get('/login.html', (req, res, next) => {
  if (req.user) {
    const redirectTarget = sanitizeNextPath(req.query.next);
    return res.redirect(redirectTarget);
  }

  return next();
});

app.get('/create-user.html', (req, res, next) => {
  if (req.user) {
    const redirectTarget = sanitizeNextPath(req.query.next);
    return res.redirect(redirectTarget);
  }

  return next();
});

app.post('/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const redirectTarget = sanitizeNextPath(req.body.next);
  const expectedUser = users.get(email);

  const isValidCredential = ALLOW_ANY_LOGIN
    ? email.length > 0 && password.length > 0
    : Boolean(expectedUser) && expectedUser.passwordHash === hashPassword(password);

  if (!isValidCredential) {
    return res.redirect(`/login.html?error=invalid&next=${encodeURIComponent(redirectTarget)}`);
  }

  createSession(res, email);
  return res.redirect(redirectTarget);
});

app.post('/auth/register', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');
  const redirectTarget = sanitizeNextPath(req.body.next);

  if (!email || !password || !confirmPassword) {
    return res.redirect(`/create-user.html?error=missing&next=${encodeURIComponent(redirectTarget)}`);
  }

  if (password.length < 8) {
    return res.redirect(`/create-user.html?error=weak&next=${encodeURIComponent(redirectTarget)}`);
  }

  if (password !== confirmPassword) {
    return res.redirect(`/create-user.html?error=nomatch&next=${encodeURIComponent(redirectTarget)}`);
  }

  if (users.has(email)) {
    return res.redirect(`/create-user.html?error=exists&next=${encodeURIComponent(redirectTarget)}`);
  }

  users.set(email, {
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  saveUsersToDisk();
  createSession(res, email);
  return res.redirect(redirectTarget);
});

app.post('/auth/logout', (req, res) => {
  clearSession(req, res);
  return res.redirect('/login.html');
});

app.get('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    email: req.user.email,
  });
});

app.get('/api/users', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }

  const userList = Array.from(users.entries()).map(([email, value]) => ({
    email,
    createdAt: value.createdAt,
  }));

  return res.json({
    count: userList.length,
    users: userList,
  });
});

// Serve static files from the project root (index.html, styles.css, etc.)
app.use(express.static(STATIC_DIR));

// Simple API endpoint for health checks or future APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'project_sample' });
});

// Fallback to index.html for SPA-style routing (keeps static files served normally)
app.get('*', (req, res) => {
  if (req.user) {
    return res.sendFile(path.join(STATIC_DIR, 'index.html'));
  }

  const nextPath = encodeURIComponent(req.originalUrl || '/index.html');
  return res.redirect(`/login.html?next=${nextPath}`);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
