(() => {
'use strict';
const apiBase = String(window.WIPESQUAD_API_BASE || '').replace(/\/+$/, '');
const sizes = [10,20,40];
const roles = {'Tank':['🛡️','Tanks'],'Heiler':['💚','Heiler'],'Nahkampf-DD':['⚔️','Nahkampf-DD'],'Fernkampf-DD':['🔥','Fernkampf-DD']};
const classColors={'Krieger':'#C79C6E','Paladin':'#F58CBA','Jäger':'#ABD473','Schurke':'#FFF569','Priester':'#FFFFFF','Schamane':'#0070DE','Magier':'#69CCF0','Hexenmeister':'#9482C9','Druide':'#FF7D0A','Todesritter':'#C41F3B'};
const el=id=>document.getElementById(id);
let activeSize=10, requestId=0, busy=false;
const make=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;};
function status(msg,err=false){el('live-status').textContent=msg;el('live-status').parentElement.classList.toggle('error',err);}
function percent(a,b){return b>0?Math.max(0,Math.min(100,100*a/b)):0;}
function classRow(x,missing=false){const row=make('div','raid-row');const left=make('div','raid-row-left');const dot=make('span','class-dot');dot.style.setProperty('--class-color',classColors[x.klasse]||'#c3aaa3');const label=make('span','class-label');const name=make('strong','',x.klasse);name.style.setProperty('--class-color',classColors[x.klasse]||'#e8d5cb');label.append(name,make('small','',x.spec));left.append(dot,label);const count=make('span','row-count',`${x.ist} / ${x.soll}`);if(missing)count.append(make('small','',`${x.fehlt} gesucht`));row.append(left,count);return row;}
function render(data){
 const total=Number(data.gesamt)||activeSize, signed=Number(data.angemeldet)||0, free=Number(data.frei)||0;
 el('raid-headline').textContent=`${signed} / ${total}`;el('raid-size-label').textContent=`${total} SPIELER`;el('raid-free').textContent=`${free} freie Plätze`;el('raid-open').textContent=free;el('raid-percent').textContent=`${Math.round(percent(signed,total))} % BESETZT`;
 const progress=el('raid-bar');progress.style.width=`${percent(signed,total)}%`;progress.parentElement.setAttribute('aria-valuenow',String(Math.round(percent(signed,total))));
 const roleBox=el('raid-roles');roleBox.replaceChildren();
 for(const [key,[icon,label]] of Object.entries(roles)){const r=data.rollen?.[key]||{ist:0,soll:0};const card=make('div','raid-role');const head=make('div','role-head');head.append(make('span','',label),make('span','role-icon',icon));const nums=make('div','role-numbers',r.ist+' ');nums.append(make('small','','/ '+r.soll));const bar=make('div','role-progress');const fill=make('div');fill.style.width=`${percent(r.ist,r.soll)}%`;bar.append(fill);card.append(head,nums,bar,make('div','role-open',`${Math.max(0,r.soll-r.ist)} Plätze offen`));roleBox.append(card);}
 const classes=Array.isArray(data.klassen)?data.klassen:[];const missing=classes.filter(x=>x.fehlt>0).sort((a,b)=>b.fehlt-a.fehlt||a.klasse.localeCompare(b.klasse,'de'));
 el('missing-count').textContent=`${missing.length} SPECS OFFEN`;const wanted=el('raid-wanted');wanted.replaceChildren();if(!missing.length)wanted.append(make('p','raid-empty','Alle Wunschpositionen besetzt!'));else for(const x of missing)wanted.append(classRow(x,true));
 const full=el('raid-full');full.replaceChildren();for(const [key,[icon,label]] of Object.entries(roles)){const group=classes.filter(x=>x.rolle===key);if(!group.length)continue;full.append(make('h3','role-group-title',`${icon} ${label}`));for(const x of group)full.append(classRow(x));}
 el('legacy-info').textContent=data.alte_anmeldungen?`${data.alte_anmeldungen} ältere Anmeldung(en) ohne Klasse/Spec können in der Wunschaufstellung noch nicht zugeordnet werden.`:'';
 el('last-updated').textContent=`Zuletzt aktualisiert: ${new Date().toLocaleTimeString('de-DE')}`;status('LIVE · Daten geladen · Aktualisierung alle 30 Sekunden');
}
async function refresh(){if(!apiBase){status('API-Adresse fehlt in dashboard-config.js',true);return;}const current=++requestId, size=activeSize;el('refresh-dashboard').disabled=true;try{const response=await fetch(`${apiBase}/api/raid/${size}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();if(current!==requestId||size!==activeSize)return;render(data);}catch(error){if(current!==requestId)return;status(`Live-Daten nicht erreichbar (${error.message}). Bitte Bot und API prüfen.`,true);}finally{if(current===requestId)el('refresh-dashboard').disabled=false;}}
document.querySelectorAll('[data-raid-size]').forEach(button=>button.addEventListener('click',()=>{activeSize=Number(button.dataset.raidSize);document.querySelectorAll('[data-raid-size]').forEach(b=>{const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});refresh();}));el('refresh-dashboard').addEventListener('click',refresh);refresh();setInterval(refresh,30000);
})();
