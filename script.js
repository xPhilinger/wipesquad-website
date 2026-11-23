document.querySelector('.nav-toggle')?.addEventListener('click',()=>document.querySelector('nav').classList.toggle('open'));
(()=>{const buttons=[...document.querySelectorAll('.raid-choice')], role=document.getElementById('role'),character=document.getElementById('character'),summary=document.getElementById('selection'),copy=document.getElementById('copy-signup');if(!role)return;let size='10';const update=()=>summary.textContent=`Auswahl: ${size}er-Raid · ${role.value}`;buttons.forEach(b=>b.addEventListener('click',()=>{size=b.dataset.size;buttons.forEach(x=>x.classList.toggle('selected',x===b));update()}));role.addEventListener('change',update);copy.addEventListener('click',async()=>{const value=`WIPESQUAD Raid-Anmeldung\nRaid: ${size}er\nCharakter: ${character.value.trim()||'(bitte eintragen)'}\nRolle: ${role.value}`;try{await navigator.clipboard.writeText(value);document.getElementById('copy-status').textContent='Angaben kopiert! Bitte im Discord beim Raidbot anmelden.'}catch{document.getElementById('copy-status').textContent='Kopieren nicht möglich. Bitte Angaben im Discord eingeben.'}})})();
// Login-Button auf allen Seiten, die script.js einbinden
(() => {
  const nav = document.querySelector('header .nav nav') || document.querySelector('header nav');
  if (!nav) return;
  nav.querySelectorAll('a[href="login.html"], a[href="/login.html"]').forEach(a => a.remove());
  const a = document.createElement('a');
  a.href = 'login.html';
  a.className = 'ws-login-link';
  a.textContent = 'Login';
  a.setAttribute('aria-label', 'Zum WIPESQUAD Login');
  nav.appendChild(a);
})();
