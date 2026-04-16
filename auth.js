// Auth guard — include on every protected page AFTER supabase-js
(async function() {
  const SUPABASE_URL = 'https://kndadtevenphkiotunlc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZGFkdGV2ZW5waGtpb3R1bmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTEzMjAsImV4cCI6MjA5MTg4NzUyMH0.fTfFxbG7z1wjgqIa-jAnMqiHBlWG5KzTIPDE1Qh79gg';
  const authDb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await authDb.auth.getSession();

  if (!data.session) {
    window.location.href = 'login.html';
    return;
  }

  // Make user info available
  window.sssbUser = data.session.user;

  // Add user email + logout button to header
  const nav = document.querySelector('.header-nav');
  if (nav) {
    const userEl = document.createElement('span');
    userEl.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:12px;';
    userEl.innerHTML = `
      <span style="font-size:11px;color:var(--tan-light);font-weight:500;">${data.session.user.email.split('@')[0]}</span>
      <a href="#" onclick="logOut(event)" style="font-size:10px;color:var(--tan-light);text-decoration:underline;opacity:.7;">Logga ut</a>
    `;
    nav.appendChild(userEl);
  }

  window.logOut = async function(e) {
    e.preventDefault();
    await authDb.auth.signOut();
    window.location.href = 'login.html';
  };
})();
