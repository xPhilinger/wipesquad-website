/* Move the existing, server-driven badge section below the guild welcome card. */
(() => {
  'use strict';
  function relocate() {
    const welcome = document.getElementById('ws-guild-member-welcome');
    const badges = document.getElementById('ws-guild-badges');
    if (!welcome || !badges || badges.parentElement === welcome) return;
    badges.classList.add('ws-badges-compact');
    welcome.appendChild(badges);
  }
  function start() {
    relocate();
    const observer = new MutationObserver(relocate);
    observer.observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
