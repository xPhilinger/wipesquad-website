'use strict';
const base=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');const $=id=>document.getElementById(id);
const token=sessionStorage.getItem('ws_account_session');
async function api(path,method='GET',body){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body?JSON.stringify(body):undefined,cache:'no-store'});let d;try{d=await r.json()}catch{d={error:'Serverantwort ungültig'}}if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d}
function status(s){$('account-status').textContent=s}
async function refresh(){const a=(await api('/api/account/me')).account;$('account-who').textContent='Willkommen, '+a.username;$('discord-status').textContent=a.discord_name?'Verknüpft mit '+a.discord_name:'Noch nicht verknüpft';$('unlink-discord').hidden=!a.discord_id;$('link-discord').hidden=!!a.discord_id;const historyCount=$('ws-discord-history-count');if(historyCount){const n=a.discord_link_history_count;historyCount.textContent=Number.isInteger(n)?('Gespeicherte Discord-Zuordnungen insgesamt: '+n+'. Davon aktuell aktiv: '+(a.discord_id?'1':'0')+'.'):'Die Anzahl der bisherigen Discord-Verknüpfungen ist derzeit nicht verfügbar.';}const list=(await api('/api/account/applications')).applications;const el=$('applications');el.replaceChildren();if(!list.length){el.textContent='Noch keine Bewerbung eingereicht.';return}for(const x of list){const p=document.createElement('p');p.textContent='#'+x.id+' · '+x.character_name+' ('+x.class_name+') — '+x.status;el.append(p)}}
$('application-form').onsubmit=async e=>{e.preventDefault();try{await api('/api/account/applications','POST',{character_name:$('character_name').value,class_name:$('class_name').value,spec:$('application_spec').value,focus:$('focus').value,introduction:$('introduction').value});status('Deine Bewerbung wurde eingereicht!');await refresh()}catch(e){status(e.message)}};
$('link-discord').onclick=async()=>{try{const d=await api('/api/account/discord/link','POST');location.href=d.url}catch(e){status(e.message)}};
$('unlink-discord').onclick=async()=>{if(!confirm('Discord-Verknüpfung wirklich aufheben?\n\nDeine Charaktere und Raid-Daten bleiben gespeichert. Frühere Discord-IDs bleiben für den Datenexport und die spätere Accountlöschung zugeordnet.\n\nDu verlierst bis zur erneuten Verknüpfung ggf. den Zugriff auf Discord-gebundene Gildenfunktionen.'))return;try{await api('/api/account/discord/unlink','POST');await refresh()}catch(e){status(e.message)}};
$('account-logout').onclick=async()=>{try{await api('/api/account/logout','POST')}catch{}sessionStorage.removeItem('ws_account_session');location.href='login.html'};
(async()=>{if(!token){location.href='login.html';return}const hash=new URLSearchParams(location.hash.slice(1));history.replaceState(null,'',location.pathname);if(hash.has('link'))status(hash.get('link')==='erfolg'?'Discord erfolgreich verknüpft.':'Discord-Verknüpfung fehlgeschlagen.');try{await refresh()}catch(e){status(e.message)}})();

// V5.11: Passwortwechsel meldet alle WIPESQUAD-Account-Sitzungen ab.
const passwordForm=$('ws-password-change-form');
if(passwordForm)passwordForm.addEventListener('submit',async e=>{
 e.preventDefault();const current=$('ws-current-password').value;const next=$('ws-new-password').value;const confirmNext=$('ws-confirm-password').value;const message=$('ws-password-status');
 if(next!==confirmNext){message.textContent='Die neuen Passwörter stimmen nicht überein.';return}
 if(next.length<12||next.length>128){message.textContent='Neues Passwort: 12 bis 128 Zeichen.';return}
 const button=passwordForm.querySelector('button[type=submit]');button.disabled=true;
 try{await api('/api/account/change-password','POST',{current_password:current,new_password:next});passwordForm.reset();sessionStorage.removeItem('ws_account_session');location.replace('login.html')}catch(err){message.textContent=err.message}finally{button.disabled=false}
});
