(()=>{
'use strict';
const base=(window.WIPESQUAD_API_BASE||'').replace(/\/$/,'');
const $=id=>document.getElementById(id);
async function api(path,method='GET',body,admin=false){const token=sessionStorage.getItem(admin?'ws_session':'ws_account_session')||'';const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body?JSON.stringify(body):undefined,cache:'no-store'});let d;try{d=await r.json()}catch{d={error:'Serverantwort ungültig'}}if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d}
function message(s){$('account-message').textContent=s}
async function auth(mode){try{const data=mode==='register'?{username:$('username').value,email:$('email').value,password:$('password').value}:{identifier:$('identifier').value,password:$('login-password').value};const r=await api('/api/account/'+mode,'POST',data);sessionStorage.setItem('ws_account_session',r.token);location.href='mitglied.html'}catch(e){message(e.message)}}
$('register-form').onsubmit=e=>{e.preventDefault();auth('register')};$('account-login-form').onsubmit=e=>{e.preventDefault();auth('login')};

})();
