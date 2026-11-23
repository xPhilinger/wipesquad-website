(() => {
'use strict';
const base=String(window.WIPESQUAD_API_BASE||'').replace(/\/+$/,'');
const target=document.getElementById('calendar-events');
const status=document.getElementById('calendar-status');
const button=document.getElementById('calendar-refresh');
if(!target||!status||!button)return;
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const roleLabels={'Tank':'🛡️ Tank','Heiler':'💚 Heiler','Nahkampf-DD':'⚔️ Nahkampf','Fernkampf-DD':'🔥 Fernkampf'};
function render(events){target.replaceChildren();if(!events.length){target.append(make('div','calendar-empty','Noch keine kommenden Raidtermine. Die Raidleitung kann mit /raidtermin einen Termin auf Discord erstellen.'));return;}
 for(const e of events){const card=make('article','calendar-card');const top=make('div','calendar-top');const title=make('h3','',e.titel);const label=make('span','calendar-type',e.raid+'ER RAID');top.append(title,label);
 const date=new Date(e.start);const dateText=Number.isNaN(date.getTime())?'Datum nicht verfügbar':new Intl.DateTimeFormat('de-DE',{dateStyle:'full',timeStyle:'short',timeZone:'Europe/Berlin'}).format(date)+' Uhr';
 const dateEl=make('div','calendar-date','📅 '+dateText);const desc=make('p','calendar-desc',e.beschreibung||'Gemeinsamer WIPESQUAD-Raid');
 const count=make('div','calendar-count',e.angemeldet+' / '+e.gesamt+' ');count.append(make('small','','Spieler · '+e.frei+' frei'));
 const bar=make('div','calendar-bar');const fill=make('div');fill.style.width=Math.min(100,Math.max(0,100*e.angemeldet/Math.max(1,e.gesamt)))+'%';bar.append(fill);
 const roles=make('div','calendar-roles');for(const [key,label] of Object.entries(roleLabels)){const r=e.rollen?.[key]||{ist:0,soll:0};const item=make('div','calendar-role',label+' ');item.append(make('strong','',r.ist+' / '+r.soll));roles.append(item);}
 card.append(top,dateEl,desc,count,bar,roles);const link=make('a','calendar-join','⚔️ AUF DISCORD ANMELDEN');link.href=e.discord_url||'https://discord.gg/Wipesquadforever';link.target='_blank';link.rel='noopener noreferrer';card.append(link);target.append(card);}
}
let fetching=false;
async function refresh(){if(fetching)return;if(!base){status.textContent='API-Adresse fehlt in dashboard-config.js';status.classList.add('error');return;}fetching=true;button.disabled=true;
 try{const r=await fetch(base+'/api/events',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data.termine))throw new Error('Ungültige Antwort');render(data.termine);status.textContent='LIVE · '+data.termine.length+' kommende Raidtermine · aktualisiert '+new Date().toLocaleTimeString('de-DE');status.classList.remove('error');}
 catch(err){status.textContent='Raidkalender nicht erreichbar ('+err.message+'). Prüfe, ob der v6-Bot läuft.';status.classList.add('error');}
 finally{fetching=false;button.disabled=false;}}
button.addEventListener('click',refresh);refresh();setInterval(refresh,30000);
})();
