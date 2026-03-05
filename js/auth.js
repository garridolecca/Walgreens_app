/* ============================================================
   Walgreens Strategic Intelligence Platform — Auth Layer
   Client-side authentication gate with SHA-256 hashed credentials.
   NOTE: Client-side auth is NOT a substitute for server-side
   security. This provides a basic access barrier for a static site.
   ============================================================ */

const AUTH = {
  HASH: 'f70f753c63880d2a70d7d95b6290e0d70a254bd02f8ae5288895ae42bb62cb61',
  SESSION_KEY: 'wal_auth',
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  MAX_ATTEMPTS: 5,
  LOCKOUT_MS: 5 * 60 * 1000, // 5-minute lockout after max attempts
};

(function () {
  const attemptsKey = 'wal_auth_attempts';
  const lockoutKey = 'wal_auth_lockout';

  function getAttempts() {
    return parseInt(sessionStorage.getItem(attemptsKey) || '0', 10);
  }
  function setAttempts(n) {
    sessionStorage.setItem(attemptsKey, String(n));
  }
  function isLockedOut() {
    const until = parseInt(sessionStorage.getItem(lockoutKey) || '0', 10);
    if (until && Date.now() < until) return true;
    if (until && Date.now() >= until) {
      sessionStorage.removeItem(lockoutKey);
      setAttempts(0);
    }
    return false;
  }

  async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isAuthenticated() {
    const session = sessionStorage.getItem(AUTH.SESSION_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      if (Date.now() - data.ts > AUTH.TIMEOUT_MS) {
        sessionStorage.removeItem(AUTH.SESSION_KEY);
        return false;
      }
      return data.ok === true;
    } catch {
      return false;
    }
  }

  function refreshSession() {
    const session = sessionStorage.getItem(AUTH.SESSION_KEY);
    if (session) {
      try {
        const data = JSON.parse(session);
        data.ts = Date.now();
        sessionStorage.setItem(AUTH.SESSION_KEY, JSON.stringify(data));
      } catch { /* ignore */ }
    }
  }

  function showApp() {
    document.getElementById('login-gate').style.display = 'none';
    document.getElementById('app-container').style.display = '';
  }

  function showError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  window.doLogin = async function () {
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';

    if (isLockedOut()) {
      showError('Too many failed attempts. Please wait 5 minutes.');
      return;
    }

    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;

    if (!user || !pass) {
      showError('Please enter both username and password.');
      return;
    }

    const hash = await sha256(user + ':' + pass);
    if (hash === AUTH.HASH) {
      setAttempts(0);
      sessionStorage.setItem(AUTH.SESSION_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
      showApp();
    } else {
      const attempts = getAttempts() + 1;
      setAttempts(attempts);
      if (attempts >= AUTH.MAX_ATTEMPTS) {
        sessionStorage.setItem(lockoutKey, String(Date.now() + AUTH.LOCKOUT_MS));
        showError('Too many failed attempts. Locked out for 5 minutes.');
      } else {
        showError('Invalid credentials. Attempt ' + attempts + ' of ' + AUTH.MAX_ATTEMPTS + '.');
      }
    }
  };

  window.doLogout = function () {
    sessionStorage.removeItem(AUTH.SESSION_KEY);
    location.reload();
  };

  // On load: check session
  if (isAuthenticated()) {
    showApp();
    // Refresh session on user activity
    ['click', 'keydown', 'scroll'].forEach(evt =>
      document.addEventListener(evt, refreshSession, { passive: true })
    );
  }

  // Periodic session timeout check
  setInterval(function () {
    if (document.getElementById('app-container').style.display !== 'none' && !isAuthenticated()) {
      alert('Session expired. Please log in again.');
      location.reload();
    }
  }, 60000);
})();
