'use strict';
const api=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');
let token='', state=null;
const $=id=>document.getElementById(id);
const status=t=>{$('status').textContent=t;};
async function request(method='GET',body){
 const response=await fetch(api+'/api/admin',{method,headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const data=await response.json();if(!response.ok)throw Error(data.error||'HTTP '+response.status);return data;
}
function line(text,buttonText,onClick){const div=document.createElement('div');div.className='item';const span=document.createElement('span');span.textContent=text;div.append(span);if(buttonText){const btn=document.createElement('button');btn.textContent=buttonText;btn.onclick=onClick;div.append(btn);}return div;}
function render(){
 $('management').hidden=false;$('events').replaceChildren();$('pvp').replaceChildren();
 for(const e of state.raids){$('events').append(line('#'+e.id+' · '+e.title+' · '+e.size+'er · '+new Date(e.starts_at).toLocaleString('de-DE')+(e.cancelled?' · ABGESAGT':''),e.cancelled?'':'Absagen',async()=>{if(!confirm('Raidtermin #'+e.id+' wirklich absagen?'))return;try{await request('POST',{action:'cancel_raid',id:e.id});await load();}catch(err){status(err.message);}}));}
 for(const e of state.pvp){$('pvp').append(line('#'+e.id+' · '+e.title+' · '+new Date(e.starts_at).toLocaleString('de-DE')+' · '+e.slots+' Plätze'));}
 showTemplate();
}
function showTemplate(){$('template').value=JSON.stringify(state.templates[$('size').value],null,2);}
async function load(){state=await request();render();status('Verbunden. Änderungen werden direkt auf dem Bot gespeichert.');}
$('connect').onclick=async()=>{token=$('token').value.trim();if(!token){status('Bitte Token eingeben.');return;}try{await load();$('token').value='';}catch(e){token='';status('Verbindung fehlgeschlagen: '+e.message);}};
$('size').onchange=showTemplate;
$('save').onclick=async()=>{try{const rows=JSON.parse($('template').value);await request('POST',{action:'set_template',size:Number($('size').value),rows});await load();status('Wunschbesetzung gespeichert.');}catch(e){status('Speichern fehlgeschlagen: '+e.message);}};

$('create').onclick=async()=>{try{await request('POST',{action:'create_raid',title:$('new-title').value,size:Number($('new-size').value),date:$('new-date').value,time:$('new-time').value,channel_id:$('new-channel').value});await load();status('Raidtermin in Discord erstellt.');}catch(e){status('Erstellen fehlgeschlagen: '+e.message);}};
