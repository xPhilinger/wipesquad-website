'use strict';
const base=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');const $=id=>document.getElementById(id);
const token=sessionStorage.getItem('ws_account_session');
async function api(path,method='GET',body){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body?JSON.stringify(body):undefined,cache:'no-store'});let d;try{d=await r.json()}catch{d={error:'Serverantwort ungültig'}}if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d}
function status(s){$('account-status').textContent=s}
async function refresh(){const a=(await api('/api/account/me')).account;$('account-who').textContent='Willkommen, '+a.username;$('discord-status').textContent=a.discord_name?'Verknüpft mit '+a.discord_name:'Noch nicht verknüpft';$('unlink-discord').hidden=!a.discord_id;$('link-discord').hidden=!!a.discord_id;const list=(await api('/api/account/applications')).applications;const el=$('applications');el.replaceChildren();if(!list.length){el.textContent='Noch keine Bewerbung eingereicht.';return}for(const x of list){const p=document.createElement('p');p.textContent='#'+x.id+' · '+x.character_name+' ('+x.class_name+') — '+x.status;el.append(p)}}
$('application-form').onsubmit=async e=>{e.preventDefault();try{await api('/api/account/applications','POST',{character_name:$('character_name').value,class_name:$('class_name').value,spec:$('application_spec').value,focus:$('focus').value,introduction:$('introduction').value});status('Deine Bewerbung wurde eingereicht!');await refresh()}catch(e){status(e.message)}};
$('link-discord').onclick=async()=>{try{const d=await api('/api/account/discord/link','POST');location.href=d.url}catch(e){status(e.message)}};
$('unlink-discord').onclick=async()=>{if(!confirm('Discord-Verknüpfung aufheben?'))return;try{await api('/api/account/discord/unlink','POST');await refresh()}catch(e){status(e.message)}};
$('account-logout').onclick=async()=>{try{await api('/api/account/logout','POST')}catch{}sessionStorage.removeItem('ws_account_session');location.href='login.html'};
(async()=>{if(!token){location.href='login.html';return}const hash=new URLSearchParams(location.hash.slice(1));history.replaceState(null,'',location.pathname);if(hash.has('link'))status(hash.get('link')==='erfolg'?'Discord erfolgreich verknüpft.':'Discord-Verknüpfung fehlgeschlagen.');try{await refresh()}catch(e){status(e.message)}})();

// V5.28: Account export and permanent deletion (server verifies session and password).
const privacyStatus=$('ws-privacy-status');
const exportButton=$('ws-export-data');
if(exportButton)exportButton.onclick=async()=>{
  exportButton.disabled=true;
  try {
    const data=await api('/api/account/export');
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='wipesquad-meine-daten.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    if(privacyStatus)privacyStatus.textContent='Datenexport wurde erstellt.';
  } catch(e){if(privacyStatus)privacyStatus.textContent='Datenexport fehlgeschlagen: '+e.message;}
  finally {exportButton.disabled=false;}
};
const deleteForm=$('ws-delete-account-form');
if(deleteForm)deleteForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const confirmation=$('ws-delete-confirmation').value.trim();
  if(confirmation!=='ACCOUNT LOESCHEN'){privacyStatus.textContent='Bitte ACCOUNT LOESCHEN exakt eingeben.';return;}
  if(!confirm('WIPESQUAD-Account und zugeordnete Daten dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.'))return;
  const button=deleteForm.querySelector('button[type="submit"]');button.disabled=true;
  try{
    await api('/api/account/delete','POST',{password:$('ws-delete-password').value,confirmation:'ACCOUNT LOESCHEN'});
    sessionStorage.removeItem('ws_account_session');sessionStorage.removeItem('ws_session');
    location.replace('login.html');
  }catch(err){privacyStatus.textContent='Accountlöschung fehlgeschlagen: '+err.message;button.disabled=false;}
});

// V5.29: Gildenverwaltung nur nach serverseitig bestätigter Discord-Rolle anzeigen.
(async function showAccountAdminIfAuthorized(){
  const panel=document.getElementById('ws-account-admin');
  if(!panel || !token)return;
  panel.hidden=true;
  try {
    const result=await api('/api/auth/me');
    const level=String(result?.user?.level||'').toLowerCase();
    panel.hidden=!['admin','officer','raidlead'].includes(level);
  } catch (_) {
    panel.hidden=true; // Bei Fehler oder fehlender Berechtigung geschlossen halten.
  }
})();
