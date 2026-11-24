
(() => {
 const header=document.querySelector('body > header');
 const nav=header?.querySelector('.nav nav');
 if(nav){
   header.classList.add('ws-rc5-header','ws-rune-header');
   const brand=header.querySelector('.brand');
   if(brand){brand.innerHTML='<img src="assets/wipesquad-wappen.webp" alt=""><span class="ws-brand-name"><img class="ws-brand-wordmark" src="assets/wipesquad-wordmark.png?v=511" alt="WIPESQUAD"></span>';}
   const band=document.createElement('div');band.className='ws-rune-band';band.setAttribute('aria-hidden','true');
   for(let i=0;i<48;i++){const rune=document.createElement('span');rune.textContent=['ᚠ','ᚱ','ᚦ','ᛟ','ᛉ','ᚷ','ᛏ','ᛞ'][i%8];rune.style.setProperty('--rune-delay',`${-(i%9)*.37}s`);band.append(rune);}header.append(band);
   nav.setAttribute('aria-label','Hauptnavigation');
   nav.innerHTML=`
     <a class="ws-home-link" href="index.html">Start</a>
     <div class="ws-menu">
       <button class="ws-menu-trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="ws-menu-guild">Die Gilde <span aria-hidden="true">⌄</span></button>
       <div class="ws-menu-panel" id="ws-menu-guild">
         <a href="gilde.html">Über WIPESQUAD</a><a href="raidkader.html">Raidkader</a><a href="kontakt.html">Kontakt</a>
       </div>
     </div>
     <div class="ws-menu">
       <button class="ws-menu-trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="ws-menu-raids">Raids & Events <span aria-hidden="true">⌄</span></button>
       <div class="ws-menu-panel" id="ws-menu-raids">
         <a href="dashboard.html">Live-Dashboard</a><a href="anmeldung.html">Raid-Anmeldung</a><a href="raidbot.html">Raid Manager</a>
       </div>
     </div>
     <a class="ws-login-link" href="login.html">Login</a>`;
   // Both existing login methods use sessionStorage on this origin.
   // Keep credentials where the account system expects them; never copy tokens into HTML.
   const authLink=nav.querySelector('.ws-login-link');
   const icon=(path)=>`<svg class="ws-rc5-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
   const paths={
     'gilde.html':'<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/>',
     'raidkader.html':'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0112 0v3M16 5a3 3 0 010 6m2 3a5 5 0 013 5"/>',
     'kontakt.html':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
     'dashboard.html':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
     'anmeldung.html':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5"/>',
     'raidbot.html':'<path d="m4 3 16 16m0-16L4 19M3 15l6 6m6-18 6 6M3 9l6-6m6 18 6-6"/>'
   };
   nav.querySelectorAll('.ws-menu-panel a').forEach(a=>{const p=paths[a.getAttribute('href')];if(p)a.insertAdjacentHTML('afterbegin',icon(p));});
   const updateAuthLink=()=>{
     let signedIn=false;
     try { signedIn=Boolean(sessionStorage.getItem('ws_account_session') || sessionStorage.getItem('ws_session')); }
     catch(e) { signedIn=false; }
     if(!authLink)return;
     authLink.href=signedIn?'mitglied.html':'login.html';
     authLink.textContent=signedIn?'Mein Dashboard':'Login';
     authLink.insertAdjacentHTML('afterbegin',icon(paths['dashboard.html']));
     if(location.pathname.split('/').pop()===authLink.getAttribute('href'))authLink.setAttribute('aria-current','page');else authLink.removeAttribute('aria-current');
     authLink.setAttribute('aria-label',signedIn?'Mein Dashboard öffnen':'Anmelden');
   };
   updateAuthLink();
   window.addEventListener('pageshow',updateAuthLink);
   window.addEventListener('focus',updateAuthLink);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateAuthLink()});
   // Account logout handlers may clear the session without navigating immediately.
   document.addEventListener('click',event=>{
     if(event.target.closest('#account-logout, #logout, [data-action="logout"]')){
       requestAnimationFrame(updateAuthLink);
       setTimeout(updateAuthLink,150);
     }
   });
   const menus=[...nav.querySelectorAll('.ws-menu')];
   const closeAll=(except)=>menus.forEach(m=>{
     if(m!==except){m.classList.remove('is-open');m.querySelector('button').setAttribute('aria-expanded','false');}
   });
   menus.forEach(m=>{
     const btn=m.querySelector('button');
     btn.addEventListener('click',()=>{
       const open=!m.classList.contains('is-open');closeAll(m);
       m.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',String(open));
     });
   });
   document.addEventListener('click',e=>{if(!e.target.closest('.ws-menu'))closeAll();});
   document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();nav.querySelector('.ws-menu-trigger:focus')?.blur();}});
   const toggle=header.querySelector('.nav-toggle');
   if(toggle){
     // Prevent legacy handler from toggling twice; use a new independent toggle.
     const replacement=toggle.cloneNode(true);toggle.replaceWith(replacement);
     replacement.setAttribute('aria-expanded','false');
     replacement.setAttribute('aria-controls','ws-primary-navigation');
     replacement.setAttribute('aria-label','Navigation öffnen');
     nav.id='ws-primary-navigation';
     replacement.addEventListener('click',()=>{
       const open=nav.classList.toggle('open');
       replacement.setAttribute('aria-expanded',String(open));
       replacement.textContent=open?'✕ Schließen':'☰ Menü';
       replacement.setAttribute('aria-label',open?'Navigation schließen':'Navigation öffnen');
       if(!open)closeAll();
     });
   }
   const current=location.pathname.split('/').pop()||'index.html';
   nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page')});
   menus.forEach(m=>{if(m.querySelector('a[aria-current=page]'))m.classList.add('has-active-page')});
 }
 const adminSidebar=document.querySelector('.sidebar .side-bottom');
 if(adminSidebar&&!adminSidebar.querySelector('.ws-admin-login')){
   const a=document.createElement('a');a.href='mitglied.html';a.className='ws-admin-login';a.textContent='↗ Mitgliederportal';adminSidebar.prepend(a);
 }

 // Subtle decorative embers; deterministic positions, no external assets or libraries.
 if(!document.querySelector('.ws-ember-field') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const field=document.createElement('div');field.className='ws-ember-field';field.setAttribute('aria-hidden','true');
   for(let i=0;i<76;i++){
     const p=document.createElement('i');p.className='ws-ember';
     p.style.setProperty('--x',((i*37+13)%97+1)+'%');
     p.style.setProperty('--size',(4.5+(i%6)*1.05)+'px');
     p.style.setProperty('--duration',(10+(i*7)%16)+'s');
     p.style.setProperty('--delay',(-((i*11)%25))+'s');
     p.style.setProperty('--drift',(-65+(i*29)%130)+'px');
     p.style.setProperty('--alpha',(.72+(i%5)*.055).toFixed(2));
     field.appendChild(p);
   }
   document.body.prepend(field);
   // Low, soft flame-light across every page, not only the homepage.
   const fire=document.createElement('div');fire.className='ws-firelight';fire.setAttribute('aria-hidden','true');
   document.body.prepend(fire);

 }

 document.body.classList.add('ws-entering');
 document.body.classList.add('ws-ready');
 document.addEventListener('click',event=>{
   const a=event.target.closest('a[href]');
   if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
   const url=new URL(a.href,location.href);
   if(url.origin!==location.origin||(url.pathname===location.pathname&&url.hash)||!url.pathname.endsWith('.html'))return;
   event.preventDefault();
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){location.href=url.href;return;}
   document.body.classList.add('ws-leaving');
   setTimeout(()=>{location.href=url.href},170);
 });
})();
