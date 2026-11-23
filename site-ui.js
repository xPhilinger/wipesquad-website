
(() => {
  const nav = document.querySelector('header .nav nav');
  if (nav) {
    nav.querySelectorAll('a[href="login.html"], a[href="/login.html"], .portal-nav-link, .ws-login-link').forEach(a => a.remove());
    const a = document.createElement('a');
    a.href = 'login.html'; a.className = 'ws-login-link'; a.textContent = 'Login';
    nav.appendChild(a);
  }
  const adminSidebar = document.querySelector('.sidebar .side-bottom');
  if (adminSidebar && !adminSidebar.querySelector('.ws-admin-login')) {
    const a=document.createElement('a');a.href='mitglied.html';a.className='ws-admin-login';a.textContent='↗ Mitgliederportal';
    adminSidebar.prepend(a);
  }
  document.body.classList.add('ws-ready');
  document.addEventListener('click', (event) => {
    const a = event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname && url.hash || !url.pathname.endsWith('.html')) return;
    event.preventDefault();
    document.body.classList.add('ws-leaving');
    setTimeout(() => { location.href = url.href; }, 180);
  });
})();
