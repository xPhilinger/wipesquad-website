const apiBase = (window.WIPESQUAD_API_BASE || '').replace(/\/$/, '');
const sizes = [10,20,40];
const labels = {'Tank':'🛡️ Tanks','Heiler':'💚 Heiler','Nahkampf-DD':'⚔️ Nahkampf','Fernkampf-DD':'🔥 Fernkampf'};
let activeSize = 10;
const el = id => document.getElementById(id);
function node(tag, className, value){const x=document.createElement(tag);if(className)x.className=className;if(value!==undefined)x.textContent=value;return x;}
function showStatus(msg, error=false){el('live-status').textContent=msg;el('live-status').className=error?'dashboard-status error':'dashboard-status';}
function render(data){
 el('raid-headline').textContent=`${data.angemeldet} / ${data.gesamt}`;
 el('raid-free').textContent=`${data.frei} freie Plätze`;
 el('raid-bar').style.width=`${Math.min(100,100*data.angemeldet/data.gesamt)}%`;
 const roles=el('raid-roles');roles.replaceChildren();
 for(const [role,label] of Object.entries(labels)){
  const d=node('div','dashboard-stat');d.append(node('span','dashboard-label',label),node('strong','',`${data.rollen[role].ist} / ${data.rollen[role].soll}`));roles.append(d);
 }
 const wanted=el('raid-wanted');wanted.replaceChildren();
 const missing=data.klassen.filter(x=>x.fehlt>0).sort((a,b)=>b.fehlt-a.fehlt);
 if(!missing.length)wanted.append(node('p','dashboard-success','Alle Wunschpositionen besetzt!'));
 for(const x of missing){const d=node('div','dashboard-wanted-row');d.append(node('span','',`${x.klasse} – ${x.spec}`),node('strong','',`${x.ist}/${x.soll} · ${x.fehlt} gesucht`));wanted.append(d);}
 const full=el('raid-full');full.replaceChildren();
 for(const role of Object.keys(labels)){
  const heading=node('h3','',labels[role]);full.append(heading);
  for(const x of data.klassen.filter(x=>x.rolle===role)){
   const d=node('div','dashboard-wanted-row');d.append(node('span','',`${x.klasse} – ${x.spec}`),node('strong','',`${x.ist} / ${x.soll}`));full.append(d);
  }
 }
 el('legacy-info').textContent=data.alte_anmeldungen?`${data.alte_anmeldungen} alte Anmeldungen ohne Klasse/Spec werden noch nicht zugeordnet.`:'';
 showStatus('Live-Daten geladen · automatische Aktualisierung alle 30 Sekunden');
}
async function refresh(){
 if(!apiBase){showStatus('Noch nicht verbunden: Bitte zuerst die öffentliche HTTPS-API in dashboard-config.js eintragen.',true);return;}
 try{const response=await fetch(`${apiBase}/api/raid/${activeSize}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);render(await response.json());}
 catch(err){showStatus('Live-Daten momentan nicht erreichbar. Prüfe API-Adresse, HTTPS und ob der Bot läuft.',true);}
}
document.querySelectorAll('[data-raid-size]').forEach(button=>button.addEventListener('click',()=>{
 activeSize=Number(button.dataset.raidSize);
 document.querySelectorAll('[data-raid-size]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
 refresh();
}));
el('refresh-dashboard').addEventListener('click',refresh);
refresh();setInterval(refresh,30000);
