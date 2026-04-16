// Auth guard — checks localStorage session
(function() {
  const session = localStorage.getItem('sssb_session');

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = JSON.parse(session);
    window.sssbUser = user;

    // Add user info + logout to header
    const nav = document.querySelector('.header-nav');
    if (nav) {
      const userEl = document.createElement('span');
      userEl.style.cssText = 'display:flex;align-items:center;gap:10px;margin-left:14px;padding-left:14px;border-left:1px solid var(--tan);';
      userEl.innerHTML = `
        <span style="font-size:11px;color:var(--tan-light);font-weight:500;">${user.name || user.email.split('@')[0]}</span>
        <a href="#" onclick="event.preventDefault();localStorage.removeItem('sssb_session');window.location.href='login.html';" style="font-size:10px;color:var(--tan-light);text-decoration:underline;opacity:.7;">Logga ut</a>
      `;
      nav.appendChild(userEl);
    }
  } catch (e) {
    localStorage.removeItem('sssb_session');
    window.location.href = 'login.html';
  }
})();
