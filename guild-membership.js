/* WIPESQUAD V5.3: server-verified guild membership, no client-side role guessing. */
(() => {
  'use strict';
  const application = document.getElementById('account-application');
  const profile = document.getElementById('account-main');
  if (!application || !profile) return;
  const accountToken = sessionStorage.getItem('ws_account_session');
  const discordToken = sessionStorage.getItem('ws_session');
  if (!accountToken && !discordToken) return;
  const base = (window.WIPESQUAD_API_BASE || '').replace(/\/$/, '');
  const card = document.createElement('section');
  card.id = 'ws-guild-member-welcome';
  card.className = 'panel ws-member-welcome';
  card.hidden = true;
  card.innerHTML = '<div class="ws-kicker">WIPESQUAD · GILDENSTATUS</div><div class="ws-member-welcome-head"><span class="ws-member-welcome-icon" aria-hidden="true">⚔</span><div><h2>Willkommen bei WIPESQUAD</h2><p>Du bist bereits Mitglied unserer Gilde.</p><span class="ws-member-verified">✓ Gildenmitglied bestätigt</span></div></div><div class="ws-member-shortcuts"><a href="dashboard.html">⚔ Live-Raids <span aria-hidden="true">↗</span></a></div>';
  application.before(card);
  async function verified(token) {
    if (!token) return false;
    try {
      const response = await fetch(base + '/api/auth/me', {
        headers: { Authorization: 'Bearer ' + token }, cache: 'no-store'
      });
      if (!response.ok) return false;
      const result = await response.json();
      return Boolean(result && result.user && result.user.id);
    } catch (_) { return false; }
  }
  async function update() {
    // Only hide applications when the currently signed-in account has a verified linked guild identity.
    // Discord-only logins are also server-verified, but should not change the account application state.
    const member = accountToken ? await verified(accountToken) : await verified(discordToken);
    if (!member) return;
    application.hidden = true;
    application.style.display = 'none';
    card.hidden = false;
  }
  update();
})();
