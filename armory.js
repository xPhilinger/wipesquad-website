(()=>{'use strict';
const root=document.getElementById('characters');if(!root)return;
const api=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const armoryUrl=name=>'https://armorywowforever.com/de/c/forever/eu/pvp/'+encodeURIComponent(name.trim().replace(/\s+/g,'-'));
const drawn=new Set();
async function loadCard(name,host){
 const box=document.createElement('section');box.className='ws-armory-card';host.append(box);
 const link=armoryUrl(name);box.innerHTML='<div class="ws-armory-name">'+esc(name)+'</div><p class="ws-armory-note">Armory wird geladen …</p><a href="'+link+'" target="_blank" rel="noopener noreferrer">Vollständige Armory öffnen ↗</a>';
 try{
  const response=await fetch(api+'/api/armory?name='+encodeURIComponent(name),{cache:'no-store'});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Armory nicht verfügbar');
  const fields=[['Level',data.level],['Gearscore',data.gearscore],['Itemlevel',data.itemlevel],['Talente',data.talents],['Gesundheit',data.health],['Mana',data.mana]];
  const stats=fields.filter(x=>x[1]!==null&&x[1]!==undefined&&x[1]!=='').map(([k,v])=>'<div class="ws-armory-stat"><strong>'+esc(v)+'</strong><small>'+esc(k)+'</small></div>').join('');
  box.innerHTML='<div class="ws-armory-name">'+esc(data.name||name)+'</div><p class="ws-armory-sub">'+esc([data.race,data.class_name].filter(Boolean).join(' · '))+'</p>'+(stats?'<div class="ws-armory-stats">'+stats+'</div>':'<p class="ws-armory-note">Keine Charakterwerte auslesbar.</p>')+'<a href="'+link+'" target="_blank" rel="noopener noreferrer">Vollständige Armory öffnen ↗</a>';
 }catch(e){const p=box.querySelector('.ws-armory-note');if(p){p.className='ws-armory-error';p.textContent='Live-Daten momentan nicht abrufbar.'}}
}
const observer=new MutationObserver(()=>{if(!root.isConnected)return;const rows=[...root.children].filter(x=>x.tagName==='P');for(const row of rows){if(row.dataset.armoryDone)continue;const label=row.querySelector('span');if(!label)continue;const name=(label.textContent||'').split(' · ')[0].trim();if(!name)continue;row.dataset.armoryDone='1';const holder=document.createElement('div');row.after(holder);loadCard(name,holder)}});
observer.observe(root,{childList:true});
})();