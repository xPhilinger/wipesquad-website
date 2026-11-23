/* V5.12: Move existing navigation into the verified guild welcome card. */
(() => {
  'use strict';
  function move() {
    const welcome=document.getElementById('ws-guild-member-welcome');
    const links=document.getElementById('ws-quick-links');
    if(!welcome||!links||links.parentElement===welcome)return;
    const old=welcome.querySelector('.ws-member-shortcuts');
    if(old)old.remove(); // Live-Raids already exists in the moved navigation.
    links.classList.add('ws-guild-navigation');
    const badges=welcome.querySelector('#ws-guild-badges');
    if(badges)welcome.insertBefore(links,badges);
    else welcome.appendChild(links);
  }
  function init(){move();const root=document.querySelector('main')||document.body;
    const observer=new MutationObserver(move);
    observer.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
