'use strict';
(async()=>{
 const host=document.querySelector('#v7-extras');if(!host)return;
 const base=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');
 const add=(tag,text,parent)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
 try{
  const [s,p]=await Promise.all([fetch(base+'/api/stats',{cache:'no-store'}),fetch(base+'/api/pvp',{cache:'no-store'})]);
  if(!s.ok||!p.ok)throw Error('API nicht erreichbar');
  const stats=await s.json(),pvp=await p.json();
  add('h2','⚔️ WIPESQUAD · Gildenaktivität',host);
  add('p',`Raidtermine: ${stats.raids} · Bosskills: ${stats.bosskills} · PvP-Events: ${stats.pvp_events}`,host);
  add('h2','🏹 Kommende PvP-Events',host);
  if(!pvp.events.length)add('p','Aktuell keine PvP-Events geplant.',host);
  for(const e of pvp.events){const row=add('div','',host);row.className='v7-event';add('strong',e.title,row);add('span',new Date(e.starts_at).toLocaleString('de-DE')+' · '+e.registered+'/'+e.slots+' angemeldet',row);}
 }catch(e){add('p','Zusatzstatistiken sind momentan nicht verfügbar.',host);}
})();
