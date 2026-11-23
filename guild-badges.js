/* WIPESQUAD V5.4 – read-only, server-verified starter badges. */
(()=>{'use strict';
 const API=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');
 const definitions=[
  {id:'member',icon:'⚔',name:'Für die Horde',desc:'Bestätigtes WIPESQUAD-Gildenmitglied'},
  {id:'first',icon:'◆',name:'Erster Held',desc:'Mindestens einen Charakter eingetragen'},
  {id:'main',icon:'★',name:'Mein Champion',desc:'Einen Hauptcharakter festgelegt'},
  {id:'three',icon:'♜',name:'Heldenarsenal',desc:'Mindestens drei Charaktere eingetragen'},
  {id:'raid',icon:'✦',name:'Raid-Veteran',desc:'Wird mit einem künftigen Raid-Erfolgssystem freigeschaltet'},
  {id:'pvp',icon:'♛',name:'Schlachtfeld-Legende',desc:'Wird mit einem künftigen PvP-Erfolgssystem freigeschaltet'},
  {id:'pvp-fighter',icon:'⚔',name:'PvP-Kämpfer',desc:'Geplantes Abzeichen für PvP-Teilnahmen'},
  {id:'battleground',icon:'✹',name:'Schlachtfeld-Veteran',desc:'Geplantes Abzeichen für Schlachtfeld-Erfolge'},
  {id:'raid-champion',icon:'◆',name:'Raid-Champion',desc:'Geplantes Abzeichen für Raid-Erfolge'},
  {id:'legend',icon:'♜',name:'WIPESQUAD-Legende',desc:'Geplantes Abzeichen für besondere Gildenleistungen'}
 ];
 const host=document.getElementById('discord-characters-area');
 if(!host)return;
 const section=document.createElement('section');section.id='ws-guild-badges';section.className='panel ws-badges';section.hidden=true;
 section.innerHTML='<div class="ws-badges-heading"><div><span class="ws-badges-kicker">WIPESQUAD · EHRENHALLE</span><h2>Meine Gildenabzeichen</h2><p>Deine freigeschalteten Auszeichnungen und nächsten Ziele.</p></div><div class="ws-badges-counter" aria-live="polite"></div></div><div class="ws-badges-grid"></div><p class="ws-badges-note">Abzeichen werden aus deinem bestätigten Gildenstatus und deinen gespeicherten Charakteren ermittelt. Raid- und PvP-Abzeichen sind noch nicht aktiv.</p>';
 host.after(section);
 const token=sessionStorage.getItem('ws_account_session')||sessionStorage.getItem('ws_session');
 if(!token)return;
 const headers={Authorization:'Bearer '+token};
 async function read(path){const r=await fetch(API+path,{headers,cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
 let userId='',characters=[],verified=false;
 function mainName(){try{return localStorage.getItem('ws_main_character_'+userId)||''}catch{return ''}}
 function render(){
  const unlocked=new Set();if(verified)unlocked.add('member');
  if(characters.length)unlocked.add('first');
  if(mainName()&&characters.some(c=>c.name===mainName()))unlocked.add('main');
  if(characters.length>=3)unlocked.add('three');
  const grid=section.querySelector('.ws-badges-grid');grid.replaceChildren();
  for(const badge of definitions){
   const active=unlocked.has(badge.id);
   const card=document.createElement('article');card.className='ws-badge'+(active?' is-earned':' is-locked');
   const icon=document.createElement('span');icon.className='ws-badge-icon';icon.textContent=badge.icon;icon.setAttribute('aria-hidden','true');
   const copy=document.createElement('div');const title=document.createElement('strong');title.textContent=badge.name;
   const desc=document.createElement('small');desc.textContent=badge.desc;
   const state=document.createElement('span');state.className='ws-badge-state';state.textContent=active?'✓ Freigeschaltet':'Noch gesperrt';
   copy.append(title,desc,state);card.append(icon,copy);grid.append(card);
  }
  section.querySelector('.ws-badges-counter').textContent=unlocked.size+' / '+definitions.length+' Abzeichen';
  section.hidden=false;
 }
 async function refresh(){
  try{
   const [me,data]=await Promise.all([read('/api/auth/me'),read('/api/me/characters')]);
   if(!me?.user?.id)return;
   verified=true;userId=String(me.user.id);characters=Array.isArray(data.characters)?data.characters:[];render();
  }catch(e){console.warn('[WIPESQUAD Abzeichen] Keine bestätigten Mitgliedsdaten:',e.message)}
 }
 refresh();
 // Reflect existing character save/delete/main changes without altering the character scripts.
 const charactersNode=document.getElementById('characters');
 if(charactersNode){let last='';new MutationObserver(()=>{
   if(section.hidden)return;
   const cards=[...charactersNode.querySelectorAll('.ws-character-tile')];
   const fingerprint=cards.map(c=>c.querySelector('.ws-character-identity strong')?.textContent||'').join('|')+'|'+mainName();
   if(fingerprint===last)return;last=fingerprint;
   // Re-read authoritative character list rather than trusting DOM text.
   read('/api/me/characters').then(data=>{characters=Array.isArray(data.characters)?data.characters:[];render()}).catch(()=>{});
  }).observe(charactersNode,{childList:true,subtree:true});}
})();
