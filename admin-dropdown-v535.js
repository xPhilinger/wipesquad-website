/* V5.35: dropdown state is presentation only; admin.js keeps authorization */
(()=>{'use strict';
 const nav=document.querySelector('.sidebar .side-nav');if(!nav)return;
 const groups=[...nav.querySelectorAll('.ws-nav-dropdown')];
 groups.forEach(group=>{
  group.addEventListener('toggle',()=>{if(group.open)groups.forEach(other=>{if(other!==group)other.open=false})});
  group.querySelectorAll('button[data-tab]').forEach(button=>button.addEventListener('click',()=>{group.open=true}));
 });
 const active=nav.querySelector('button[data-tab].active');if(active)active.closest('details')?.setAttribute('open','');
})();
