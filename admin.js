'use strict';
const api=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');let token='',state=null,legacy=null,plan={},rosterRequests=[];const $=id=>document.getElementById(id);
function status(t){$('status').textContent=t;const toast=$('toast');if(toast){toast.textContent=t;toast.hidden=false;clearTimeout(window._toastTimeout);window._toastTimeout=setTimeout(()=>toast.hidden=true,4800)}}function el(tag,txt,cls){const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e}function btn(label,fn,cls=''){const b=el('button',label,cls);b.type='button';b.onclick=fn;return b}
async function req(path,method='GET',body){const r=await fetch(api+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d}
async function action(path,body,confirmText){if(confirmText&&!confirm(confirmText))return;try{await req(path,'POST',body);await load();status('Änderung erfolgreich gespeichert.')}catch(e){status('Fehler: '+e.message)}}
async function load(){[state,legacy]=await Promise.all([req('/api/admin/v8'),req('/api/admin')]);try{const q=await req('/api/admin/roster-requests');rosterRequests=q.requests||[]}catch(e){rosterRequests=[];console.warn(e)}render();status('Verbunden · '+new Date().toLocaleTimeString('de-DE'))}
$('connect').onclick=()=>location.href='login.html';
async function initAuth(){token=sessionStorage.getItem('ws_session')||sessionStorage.getItem('ws_account_session')||'';if(!token)return;try{const me=await req('/api/auth/me');if(!['admin','officer','raidlead'].includes(me.user.level))throw Error('Deine Discord-Rolle erlaubt keine Raidverwaltung.');await load();$('login').hidden=true;$('management').hidden=false;$('shell').classList.add('connected');$('connection-text').textContent=me.user.name+' · '+me.user.level;$('logout').hidden=false}catch(e){status(e.message);if(e.message.includes('Nicht angemeldet')||e.message.includes('HTTP 401'))sessionStorage.removeItem('ws_session')}}
initAuth();
$('reload').onclick=()=>load().catch(e=>status(e.message));$('logout').onclick=async()=>{try{await req('/api/auth/logout','POST')}catch(e){}sessionStorage.removeItem('ws_session');location.href='login.html'};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));['overview','raids','setup','create','pvp','pvp-create','pvp-teams','players','armory','logs'].forEach(x=>$('tab-'+x).hidden=x!==b.dataset.tab);$('section-title').textContent=b.textContent.trim();document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-current',x===b?'page':'false'))});
function render(){const future=state.raids.filter(x=>!x.cancelled&&new Date(x.starts_at)>new Date()).length;const stats=[['Raidtermine',state.raids.length],['Kommende Raids',future],['Anmeldungen',state.signups.length],['Charaktere',state.characters_total],['Ersatzspieler',state.waitlist.length],['PvP-Events',state.pvp.filter(x=>!x.cancelled).length]];$('stats').replaceChildren(...stats.map(([k,v])=>{const e=el('div',undefined,'stat');e.append(el('strong',String(v)),el('small',k));return e}));const current=$('event-select').value;$('event-select').replaceChildren(...state.raids.map(x=>{const o=el('option','#'+x.id+' · '+x.title+' · '+new Date(x.starts_at).toLocaleString('de-DE')+(x.cancelled?' (abgesagt)':''));o.value=x.id;return o}));if(state.raids.some(x=>String(x.id)===current))$('event-select').value=current;$('event-select').onchange=renderEvent;renderEvent();plan=structuredClone(state.templates);renderPlan();renderPvp();renderPvpTeams();renderOverview();renderPlayers();renderArmory();renderRosterRequests();renderLogs()}
function renderEvent(){const root=$('event-detail');root.replaceChildren();const e=state.raids.find(x=>String(x.id)===$('event-select').value);if(!e)return root.append(el('p','Noch keine Raidtermine vorhanden.'));const panel=el('div',undefined,'subpanel');panel.append(el('h3','Raidtermin bearbeiten'));const title=el('input');title.value=e.title;const desc=el('textarea');desc.value=e.description||'';const time=el('input');time.type='datetime-local';const d=new Date(e.starts_at);time.value=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')+'T'+[String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0')].join(':');panel.append(label('Titel',title),label('Beschreibung',desc),label('Beginn (lokale Zeit)',time));panel.append(btn('Termin speichern',()=>action('/api/admin/v8',{action:'edit_raid',event_id:e.id,title:title.value,description:desc.value,starts_at:new Date(time.value).toISOString()})));if(!e.cancelled)panel.append(btn('Raid absagen',()=>action('/api/admin',{action:'cancel_raid',id:e.id},'Raid wirklich absagen?'),'danger'));root.append(panel);
const eventSignups=state.signups.filter(s=>Number(s.event_id)===Number(e.id));
const signup=el('div',undefined,'subpanel');
signup.append(el('h3','Fest angemeldete Spieler ('+eventSignups.length+'/'+e.size+')'));
for(const s of eventSignups){const line=el('div',undefined,'item');const labelText=el('span',s.character+' · '+s.class_name+'/'+s.spec+' · '+s.role+' · ID '+s.user_id);const controls=el('div');const att=state.attendance.find(a=>Number(a.event_id)===Number(e.id)&&String(a.user_id)===String(s.user_id));const select=el('select');select.style.width='150px';for(const v of ['offen','anwesend','verspätet','abwesend']){const o=el('option',v);o.value=v;select.append(o)}select.value=att?.status||'offen';select.onchange=()=>action('/api/admin/v8',{action:'set_attendance',event_id:e.id,user_id:s.user_id,status:select.value});controls.append(select,btn('Entfernen',()=>action('/api/admin/v8',{action:'remove_signup',event_id:e.id,user_id:s.user_id},'Spieler wirklich entfernen?'),'compact danger'));line.append(labelText,controls);signup.append(line)}
// Permanent approved roster members for this raid size are shown here as a separate group.
// They are NOT inserted into event_signups and therefore do not count as event confirmations.
const rosterForEvent=(state.raid_roster||[]).filter(r=>Number(r.size)===Number(e.size));
const rosterOnly=rosterForEvent.map(r=>{const ch=(state.guild_characters||[]).find(c=>String(c.user_id)===String(r.user_id)&&String(c.name).toLocaleLowerCase('de')===String(r.character).toLocaleLowerCase('de'));if(!ch)return null;const role=state.classes?.[ch.class_name]?.[ch.spec]||'Rolle nicht zugeordnet';return {...r,class_name:ch.class_name||'Klasse unbekannt',spec:ch.spec||'Spec unbekannt',role}}).filter(r=>r&&!eventSignups.some(s=>String(s.user_id)===String(r.user_id)&&String(s.character).toLocaleLowerCase('de')===String(r.character).toLocaleLowerCase('de')));
const rosterHeading=el('h4','Angenommene Kaderspieler ('+rosterOnly.length+')');rosterHeading.style.marginTop='18px';signup.append(rosterHeading);
if(!rosterOnly.length)signup.append(el('p','Keine zusätzlichen angenommenen Kaderspieler für diese Raidgröße.','muted'));
for(const r of rosterOnly){const line=el('div',undefined,'item');line.append(el('span',r.character+' · '+r.class_name+' / '+r.spec+' · '+r.role));const tag=el('span','Kaderplatz · Termin nicht bestätigt','tag');line.append(tag);signup.append(line)}
root.append(signup);
const waiting=el('div',undefined,'subpanel');waiting.append(el('h3','Warteliste ('+state.waitlist.filter(s=>s.event_id===e.id).length+')'));for(const s of state.waitlist.filter(s=>s.event_id===e.id)){const line=el('div',undefined,'item');line.append(el('span',s.character+' · '+s.class_name+'/'+s.spec+' · '+s.role),btn('Entfernen',()=>action('/api/admin/v8',{action:'remove_waitlist',event_id:e.id,user_id:s.user_id},'Von Warteliste entfernen?'),'compact danger'));waiting.append(line)}waiting.append(btn('Passenden Ersatz nachrücken lassen',()=>action('/api/admin/v8',{action:'promote_waitlist',event_id:e.id}),'ghost'));root.append(waiting);
const log=el('div',undefined,'subpanel');log.append(el('h3','Bosskills & Loot'));for(const k of state.kills.filter(k=>k.event_id===e.id))log.append(el('div','✓ '+k.boss,'item'));for(const l of state.loot.filter(l=>l.event_id===e.id))log.append(el('div',l.character+' erhielt '+l.item+(l.boss?' · '+l.boss:''),'item'));const boss=el('input');boss.placeholder='Bossname';log.append(label('Bosskill hinzufügen',boss),btn('Bosskill speichern',()=>action('/api/admin/v8',{action:'add_kill',event_id:e.id,boss:boss.value})));const ch=el('input'),item=el('input'),lootBoss=el('input');ch.placeholder='Charakter';item.placeholder='Gegenstand';lootBoss.placeholder='Boss (optional)';log.append(label('Charakter',ch),label('Gegenstand',item),label('Boss',lootBoss),btn('Loot eintragen',()=>action('/api/admin/v8',{action:'add_loot',event_id:e.id,character:ch.value,item:item.value,boss:lootBoss.value})));root.append(log)}
function label(text,input){const l=el('label',text);l.append(input);return l}
function specs(){return Object.entries(state.classes).flatMap(([cl,sp])=>Object.keys(sp).map(s=>({cl,sp:s})))}
function renderPlan(){const size=$('size').value,rows=plan[size]||[],root=$('template-rows');root.replaceChildren();rows.forEach((r,i)=>{const line=el('div',undefined,'template-row');const choices=el('select');for(const x of specs()){const opt=el('option',x.cl+' / '+x.sp);opt.value=x.cl+'|'+x.sp;choices.append(opt)}choices.value=r.class+'|'+r.spec;choices.onchange=()=>{const [cl,sp]=choices.value.split('|');r.class=cl;r.spec=sp};const count=el('input');count.type='number';count.min='1';count.max=size;count.value=r.count;count.oninput=()=>{r.count=Number(count.value);updateTotal()};line.append(choices,count,btn('×',()=>{rows.splice(i,1);renderPlan()},'compact danger'));root.append(line)});updateTotal()}
function updateTotal(){const size=Number($('size').value),rows=plan[size]||[],total=rows.reduce((n,r)=>n+Number(r.count||0),0);$('template-total').textContent='Belegte Wunschplätze: '+total+' / '+size;$('template-total').className=total===size?'good':'bad';$('save-template').disabled=total!==size}
$('size').onchange=renderPlan;$('add-spec').onclick=()=>{const s=specs()[0];plan[$('size').value].push({class:s.cl,spec:s.sp,count:1});renderPlan()};$('save-template').onclick=()=>action('/api/admin',{action:'set_template',size:Number($('size').value),rows:plan[$('size').value]});
$('create').onclick=()=>action('/api/admin',{action:'create_raid',title:$('new-title').value,size:Number($('new-size').value),date:$('new-date').value,time:$('new-time').value,channel_id:$('new-channel').value,description:$('new-description').value});
function renderPvp(){const root=$('pvp-list');root.replaceChildren();for(const p of state.pvp){const card=el('div',undefined,'ws-pvp-team-card');card.append(el('strong','#'+p.id+' · '+p.title),el('p',new Date(p.starts_at).toLocaleString('de-DE')+' · '+p.slots+' Plätze'+(p.cancelled?' · abgesagt':''),'muted'));const users=(state.pvp_signups||[]).filter(s=>s.event_id===p.id);card.append(el('p','Teilnehmer: '+users.length+' / '+p.slots));for(const u of users){const line=el('div',undefined,'item');line.append(el('span','Discord-ID '+u.user_id),btn('Entfernen',()=>action('/api/admin/v8',{action:'remove_pvp_signup',pvp_id:p.id,user_id:u.user_id},'Teilnehmer wirklich entfernen?'),'compact danger'));card.append(line)}if(!p.cancelled)card.append(btn('PvP-Event absagen',()=>action('/api/admin/v8',{action:'cancel_pvp',pvp_id:p.id},'PvP-Event wirklich absagen?'),'danger'));root.append(card)}if(!state.pvp.length)root.append(el('p','Noch keine PvP-Events vorhanden.','muted'))}
$('pvp-create-button').onclick=()=>{const date=$('pvp-new-date').value,time=$('pvp-new-time').value;if(!date||!time)return status('Datum und Uhrzeit eingeben.');const starts=new Date(date+'T'+time);if(Number.isNaN(starts.getTime()))return status('Ungültiges Datum.');action('/api/admin/v8',{action:'create_pvp',title:$('pvp-new-title').value,slots:Number($('pvp-new-slots').value),starts_at:starts.toISOString(),channel_id:$('pvp-new-channel').value})};
$('pvp-team-create').onclick=()=>action('/api/admin/v8',{action:'create_pvp_team',name:$('pvp-team-name').value,mode:$('pvp-team-mode').value});
function renderPvpTeams(){const root=$('pvp-team-list');root.replaceChildren();for(const t of (state.pvp_teams||[])){const card=el('div',undefined,'ws-pvp-team-card');const members=(state.pvp_team_members||[]).filter(m=>m.team_id===t.id);card.append(el('h3',t.name+' · '+t.mode),el('p','Teamleiter: '+(t.leader_id||'nicht festgelegt')+' · Mitglieder: '+members.length+'/'+({'2v2':2,'3v3':3,'5v5':5,'Schlachtfeld':40}[t.mode]||'?'),'muted'));const list=el('div',undefined,'ws-pvp-members');for(const m of members){const chip=el('div',undefined,'ws-pvp-member');chip.append(el('span',m.user_id+(t.leader_id===m.user_id?' ★':'')),btn('×',()=>action('/api/admin/v8',{action:'remove_pvp_team_member',team_id:t.id,user_id:m.user_id},'Mitglied entfernen?'),'compact danger'),btn('Leiter',()=>action('/api/admin/v8',{action:'set_pvp_team_leader',team_id:t.id,user_id:m.user_id}),'compact ghost'));list.append(chip)}card.append(list);const controls=el('div',undefined,'ws-pvp-controls');const input=el('input');input.placeholder='Discord-Nutzer-ID';input.inputMode='numeric';controls.append(input,btn('Mitglied hinzufügen',()=>action('/api/admin/v8',{action:'add_pvp_team_member',team_id:t.id,user_id:input.value})));const rename=el('input');rename.value=t.name;controls.append(rename,btn('Umbenennen',()=>action('/api/admin/v8',{action:'rename_pvp_team',team_id:t.id,name:rename.value}),'ghost'),btn('Team auflösen',()=>action('/api/admin/v8',{action:'delete_pvp_team',team_id:t.id},'Team und Zuordnungen endgültig entfernen?'),'danger'));card.append(controls);root.append(card)}if(!(state.pvp_teams||[]).length)root.append(el('p','Noch keine PvP-Teams erstellt.','muted'))}

function renderOverview(){const now=new Date();const raids=state.raids.filter(r=>!r.cancelled&&new Date(r.starts_at)>now).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));const root=$('upcoming');root.replaceChildren();if(!raids.length)root.append(el('p','Noch keine kommenden Raidtermine. Erstelle deinen ersten Raid über „Raid erstellen“.','empty'));for(const r of raids.slice(0,6)){const card=el('button',undefined,'raid-tile');card.type='button';const top=el('div',undefined,'raid-tile-top');top.append(el('span',r.size+' SPIELER','tag'),el('span',new Date(r.starts_at).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}),'muted'));card.append(top,el('strong',r.title),el('span',state.signups.filter(s=>s.event_id===r.id).length+' / '+r.size+' angemeldet','muted'));card.onclick=()=>{$('event-select').value=String(r.id);document.querySelector('[data-tab="raids"]').click()};root.append(card)}const counts={};for(const s of state.signups){counts[s.role]=(counts[s.role]||0)+1}const roles=$('role-summary');roles.replaceChildren();for(const [role,n] of Object.entries(counts))roles.append(el('div',role+' · '+n,'role-chip'));if(!Object.keys(counts).length)roles.append(el('p','Noch keine Terminanmeldungen.','muted'));$('overview-updated').textContent='Letzte Aktualisierung: '+new Date().toLocaleTimeString('de-DE')}
function renderPlayers(){const root=$('players-list');root.replaceChildren();const term=$('player-search').value.trim().toLocaleLowerCase('de');const entries=state.signups.filter(s=>[s.character,s.class_name,s.spec,s.role,String(s.user_id)].join(' ').toLocaleLowerCase('de').includes(term));$('player-count').textContent=entries.length+' Einträge';if(!entries.length)root.append(el('p','Keine passenden Terminanmeldungen gefunden.','empty'));for(const s of entries){const raid=state.raids.find(r=>r.id===s.event_id);const line=el('div',undefined,'player-row');const left=el('div');left.append(el('strong',s.character),el('small',s.class_name+' · '+s.spec+' · '+s.role));const right=el('span',raid?.title||'Raid #'+s.event_id,'tag');line.append(left,right);root.append(line)}for(const size of [10,20,40]){const group=(state.raid_roster||[]).filter(r=>Number(r.size)===size);const section=el('section',undefined,'ws-v541-roster-group');section.append(el('h3','Fester '+size+'er-Raidkader ('+group.length+'/'+size+')'));for(const r of group){const ch=(state.guild_characters||[]).find(c=>String(c.user_id)===String(r.user_id)&&c.name===r.character);const description=r.character+' · '+(ch?.class_name||'')+' / '+(ch?.spec||'');if(term&&!description.toLocaleLowerCase('de').includes(term))continue;section.append(el('div',description,'player-row'))}root.append(section)}}

function renderRosterRequests(){
 const parent=$('tab-players');if(!parent)return;let panel=$('ws-v541-requests');if(!panel){panel=el('section',undefined,'ws-v541-roster-group');panel.id='ws-v541-requests';parent.insertBefore(panel,$('player-count'))}panel.replaceChildren();const pending=rosterRequests.filter(r=>r.status==='pending');panel.append(el('h3','🔔 Raidkader-Anfragen ('+pending.length+' offen)'));if(!pending.length)panel.append(el('p','Keine offenen Anfragen.','muted'));
 for(const q of pending){const card=el('article',undefined,'ws-v541-request');card.append(el('strong',q.character+' · '+q.size+'er-Kader'),el('p',(q.class_name||'Klasse unbekannt')+' · '+(q.spec||'Spec unbekannt'),'muted'));const stats=el('div','Armory-Daten werden geladen …','ws-v541-stats');card.append(stats);const link=el('a','Vollständige Armory ↗');link.href='https://armorywowforever.com/de/c/forever/eu/pvp/'+encodeURIComponent(q.character.trim().replace(/\s+/g,'-'));link.target='_blank';link.rel='noopener noreferrer';card.append(link);
 const buttons=el('div');for(const [decision,label,cls] of [['approved','✓ Annehmen','compact'],['rejected','✕ Ablehnen','compact danger']])buttons.append(btn(label,async()=>{try{await req('/api/admin/roster-requests','POST',{id:q.id,decision});await load();status('Anfrage '+(decision==='approved'?'angenommen':'abgelehnt'))}catch(e){status('Fehler: '+e.message)}},cls));card.append(buttons);panel.append(card);
 fetch(api+'/api/armory?name='+encodeURIComponent(q.character),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('nicht verfügbar');return r.json()}).then(d=>{stats.replaceChildren();for(const [key,val] of [['Level',d.level],['Gearscore',d.gearscore],['Itemlevel',d.itemlevel],['Talente',d.talents],['Gesundheit',d.health],['Mana',d.mana]])if(val!==null&&val!==undefined&&val!=='')stats.append(el('span',key+': '+val));if(!stats.children.length)stats.textContent='Keine Charakterwerte verfügbar.'}).catch(()=>stats.textContent='Armory derzeit nicht erreichbar.');
 }
 const summary=$('stats');if(summary){let notice=$('ws-v541-notice');if(!notice){notice=el('button',undefined,'stat');notice.id='ws-v541-notice';notice.type='button';summary.append(notice)}notice.textContent='🔔 '+pending.length+' Kaderanfragen';notice.onclick=()=>document.querySelector('[data-tab="players"]')?.click()}
}

$('player-search').oninput=()=>{if(state)renderPlayers()};
function renderLogs(){const root=$('log-list');root.replaceChildren();for(const k of state.kills.slice().reverse().slice(0,25)){const raid=state.raids.find(r=>r.id===k.event_id);root.append(el('div','⚔ Boss besiegt: '+k.boss+' · '+(raid?.title||'#'+k.event_id),'log-entry'))}for(const l of state.loot.slice().reverse().slice(0,25)){root.append(el('div','✦ '+l.item+' → '+l.character+(l.boss?' · '+l.boss:''),'log-entry'))}if(!root.children.length)root.append(el('p','Noch keine Bosskills oder Loot-Einträge.','empty'))}
$('overview-refresh').onclick=()=>load().catch(e=>status(e.message));
$('quick-create').onclick=()=>document.querySelector('[data-tab="create"]').click();
$('quick-plan').onclick=()=>document.querySelector('[data-tab="setup"]').click();

// V5.38 – Guild Armory: read-only, no Discord IDs, no main markers or deletion.
// Values come from the existing /api/armory endpoint, not from sample data.
const wsArmoryCache=new Map();
let wsArmoryGeneration=0;
function renderArmory(){
 const root=$('armory-list'),counter=$('armory-count'),search=$('armory-search'),filter=$('armory-class');
 const stats=$('armory-stats'),bars=$('armory-classes');
 if(!root||!state)return;
 const characters=Array.isArray(state.guild_characters)?state.guild_characters:[];
 const previous=filter.value;
 const names=[...new Set(characters.map(x=>x.class_name).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
 filter.replaceChildren();const all=document.createElement('option');all.value='';all.textContent='Alle Klassen';filter.append(all);
 for(const name of names){const o=document.createElement('option');o.value=name;o.textContent=name;filter.append(o)}
 filter.value=names.includes(previous)?previous:'';
 const icons={'Druide':'☾','Jäger':'➶','Krieger':'⚔','Paladin':'✦','Schurke':'◆','Priester':'✚','Schamane':'ϟ','Magier':'✧','Hexenmeister':'◈'};
 const classIds={'Druide':'druid','Jäger':'hunter','Krieger':'warrior','Paladin':'paladin','Schurke':'rogue','Priester':'priest','Schamane':'shaman','Magier':'mage','Hexenmeister':'warlock'};
 function armoryUrl(name){return 'https://armorywowforever.com/de/c/forever/eu/pvp/'+encodeURIComponent(String(name).trim().replace(/\s+/g,'-'))}
 function displayStats(holder,data){
  holder.replaceChildren();
  const entries=[['Level',data.level],['Gearscore',data.gearscore],['Itemlevel',data.itemlevel],['Talente',data.talents],['Gesundheit',data.health],['Mana',data.mana]]
   .filter(([,value])=>value!==null&&value!==undefined&&value!=='');
  if(!entries.length){holder.append(el('p','Keine Charakterwerte verfügbar.','muted'));return}
  const grid=el('div',undefined,'ws-guild-armory-metrics');
  for(const [label,value] of entries){const item=el('div',undefined,'ws-guild-armory-metric');item.append(el('strong',String(value)),el('small',label));grid.append(item)}
  holder.append(grid);
 }
 async function hydrate(ch,host,details,generation){
  const name=String(ch.name||'').trim();
  if(!name)return;
  try{
   let promise=wsArmoryCache.get(name);
   if(!promise){
    promise=(async()=>{const response=await fetch(api+'/api/armory?name='+encodeURIComponent(name),{cache:'no-store'});const d=await response.json();if(!response.ok)throw Error(d.error||'Armory nicht verfügbar');return d})();
    wsArmoryCache.set(name,promise);
    promise.catch(()=>{if(wsArmoryCache.get(name)===promise)wsArmoryCache.delete(name)});
   }
   const data=await promise;
   if(generation!==wsArmoryGeneration||!host.isConnected)return;
   if(data.race)details.textContent=String(data.race);
   displayStats(host,data);
  }catch(error){
   if(generation!==wsArmoryGeneration||!host.isConnected)return;
   host.replaceChildren(el('p','Armory-Daten derzeit nicht verfügbar.','muted'));
  }
 }
 function update(){
  const generation=++wsArmoryGeneration;
  const q=search.value.trim().toLocaleLowerCase('de'),cl=filter.value;
  const matches=characters.filter(x=>(!cl||x.class_name===cl)&&(!q||[x.name,x.class_name,x.spec].join(' ').toLocaleLowerCase('de').includes(q)));
  counter.textContent=matches.length+' von '+characters.length+' gespeicherten Charakteren';root.replaceChildren();
  const counts=new Map();for(const ch of matches)counts.set(ch.class_name||'Unbekannt',(counts.get(ch.class_name||'Unbekannt')||0)+1);
  const specCount=new Set(matches.map(x=>x.spec).filter(Boolean)).size;
  stats.replaceChildren();
  for(const [name,value,detail] of [['Charaktere',matches.length,'Aktuelle Auswahl'],['Klassen',counts.size,'Vertretene Klassen'],['Spezialisierungen',specCount,'Unterschiedliche Specs']]){
   const tile=el('div',undefined,'ws-armory-stat');tile.append(el('small',name),el('strong',String(value)),el('span',detail,'muted'));stats.append(tile);
  }
  bars.replaceChildren();
  const sorted=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de'));
  for(const [name,count] of sorted){const line=el('div',undefined,'ws-armory-class-line');const heading=el('div',undefined,'ws-armory-class-label');heading.append(el('span',name),el('strong',String(count)));const track=el('div',undefined,'ws-armory-class-track');const fill=el('div',undefined,'ws-armory-class-fill');fill.style.width=(matches.length?count/matches.length*100:0)+'%';track.append(fill);line.append(heading,track);bars.append(line)}
  if(!sorted.length)bars.append(el('p','Keine Charaktere in dieser Auswahl.','muted'));
  if(!matches.length){root.append(el('p',characters.length?'Keine passenden Charaktere gefunden.':'Noch keine Charaktere gespeichert.','muted'));return}
   const jobs=[];
   const roster=Array.isArray(state.raid_roster)?state.raid_roster:[];
   const rosterCounts=Object.fromEntries([10,20,40].map(size=>[size,roster.filter(r=>Number(r.size)===size).length]));
   for(const ch of matches){
   const card=el('article',undefined,'ws-armory-card ws-guild-character');card.dataset.wowClass=classIds[ch.class_name]||'default';
   const heading=el('div',undefined,'ws-guild-character-head');const emblem=el('span',icons[ch.class_name]||'✦','ws-guild-character-emblem');emblem.setAttribute('aria-hidden','true');
   const identity=el('div',undefined,'ws-guild-character-identity');identity.append(el('strong',ch.name),el('small',ch.class_name+' · '+(ch.spec||'Keine Spezialisierung')));heading.append(emblem,identity);card.append(heading);
    // Persistent roster membership; a character may be assigned to all three sizes.
    const rosterActions=el('div',undefined,'ws-roster-actions');
    rosterActions.append(el('small','Fester Raidkader','muted'));
    for(const size of [10,20,40]){
     const active=roster.some(r=>String(r.user_id)===String(ch.user_id)&&r.character===ch.name&&Number(r.size)===size);
     const full=!active&&rosterCounts[size]>=size;
     const control=btn((active?'✓ ':'＋ ')+size+'er',async()=>{
      control.disabled=true;
      try{
       await req('/api/admin/v8','POST',{action:'toggle_raid_roster',user_id:ch.user_id,character:ch.name,size,enabled:!active});
       await load();status(ch.name+' · '+size+'er-Kader '+(active?'entfernt':'zugeordnet')+'.');
      }catch(error){control.disabled=false;status('Fehler: '+error.message)}
     },'ws-roster-button'+(active?' is-active':'')+' compact');
     control.setAttribute('aria-pressed',String(active));
     control.title=full?'Kader voll':(active?'Aus '+size+'er-Kader entfernen':'Zum '+size+'er-Kader hinzufügen');
     control.disabled=full;
     rosterActions.append(control);
    }
    card.append(rosterActions);
    const disclosure=document.createElement('details');disclosure.className='ws-guild-character-details';const summary=document.createElement('summary');summary.textContent='Ausrüstung ansehen';disclosure.append(summary,el('p','Die vollständige Ausrüstung findest du in der externen Armory.','muted'));card.append(disclosure);
   const body=el('div',undefined,'ws-guild-character-body');const race=el('p','Armory wird geladen …','ws-guild-character-race');const metrics=el('div','Charakterwerte werden geladen …','ws-guild-armory-loading');body.append(race,metrics);
   const a=el('a','Vollständige Armory öffnen ↗','ws-armory-external');a.href=armoryUrl(ch.name);a.target='_blank';a.rel='noopener noreferrer';body.append(a);card.append(body);root.append(card);
   jobs.push(()=>hydrate(ch,metrics,race,generation));
  }
  // Limit simultaneous requests to avoid overwhelming the existing Armory proxy.
  let next=0;const worker=async()=>{while(generation===wsArmoryGeneration&&next<jobs.length){const i=next++;await jobs[i]()}};
  for(let i=0;i<Math.min(4,jobs.length);i++)worker();
 }
 search.oninput=update;filter.onchange=update;update();
}