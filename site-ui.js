
(() => {
 const header=document.querySelector('body > header');
 const nav=header?.querySelector('.nav nav');
 if(nav){
   nav.setAttribute('aria-label','Hauptnavigation');
   nav.innerHTML=`
     <a class="ws-home-link" href="index.html">Start</a>
     <div class="ws-menu">
       <button class="ws-menu-trigger" type="button" aria-expanded="false" aria-haspopup="true">Die Gilde <span aria-hidden="true">⌄</span></button>
       <div class="ws-menu-panel">
         <a href="gilde.html">Über WIPESQUAD</a><a href="raidkader.html">Raidkader</a><a href="kontakt.html">Kontakt</a>
       </div>
     </div>
     <div class="ws-menu">
       <button class="ws-menu-trigger" type="button" aria-expanded="false" aria-haspopup="true">Raids & Events <span aria-hidden="true">⌄</span></button>
       <div class="ws-menu-panel">
         <a href="dashboard.html">Live-Dashboard</a><a href="anmeldung.html">Raid-Anmeldung</a><a href="raidbot.html">Raid Manager</a>
       </div>
     </div>
     <a class="ws-login-link" href="login.html">Login</a>`;
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
     replacement.addEventListener('click',()=>{
       const open=nav.classList.toggle('open');
       replacement.setAttribute('aria-expanded',String(open));
       replacement.textContent=open?'✕ Schließen':'☰ Menü';
     });
   }
   const current=location.pathname.split('/').pop()||'index.html';
   nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page')});
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

 // V4.0: soft, feathered occlusion ONLY for glowing particles.
 // This prevents square black holes while leaving the firelight uninterrupted.
 (()=>{
   const layer=document.querySelector('.ws-ember-field');
   if(!layer)return;
   const selectors='.card,.step,.panel,.raid-panel,.raid-role,.raid-role-card,.raid-summary,.raid-overview,.raid-summary-side,.raid-full,.raid-list,.raid-toolbar,.raid-bottom,.raid-privacy,.ws-menu-panel,article,details,form,.btn,button,input,select,textarea,.hero-wappen';
   let scheduled=false;
   const render=()=>{
     scheduled=false;
     const w=innerWidth,h=innerHeight;
     if(w<1||h<1)return;
     const scale=.5,cv=document.createElement('canvas');
     cv.width=Math.ceil(w*scale);cv.height=Math.ceil(h*scale);
     const ctx=cv.getContext('2d');if(!ctx)return;
     ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
     for(const el of document.querySelectorAll(selectors)){
       if(el.closest('.ws-ember-field,.ws-firelight'))continue;
       const s=getComputedStyle(el),r=el.getBoundingClientRect();
       if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||r.width<4||r.height<4||r.bottom<0||r.top>h||r.right<0||r.left>w)continue;
       if(r.width>w*.9&&r.height>h*.65)continue;
       // Feather at the perimeter; never create hard rectangular cut-outs.
       const feather=Math.min(32,Math.max(14,Math.min(r.width,r.height)*.16));
       const x=r.left*scale,y=r.top*scale,ww=r.width*scale,hh=r.height*scale,f=feather*scale;
       ctx.save();ctx.globalCompositeOperation='destination-out';
       ctx.filter=`blur(${f}px)`;ctx.fillStyle='#fff';
       ctx.fillRect(x+f,y+f,Math.max(0,ww-2*f),Math.max(0,hh-2*f));
       ctx.restore();
     }
     layer.style.setProperty('--ws-soft-ember-mask',`url("${cv.toDataURL('image/png')}")`);
   };
   const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(render)};
   addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
   const root=document.querySelector('main')||document.body;
   new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
   schedule();
 })();

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
