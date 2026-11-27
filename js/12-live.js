/* Live mode (peer-to-peer invitation) */
'use strict';

/* ---------- Live mode: peer-to-peer, one private invitation ---------- */
var LT={en:{inv:'💌 Invite her live',copy:'Copy invitation',wait:'Waiting for her to open the link…',here:'She is here 💕',hereG:'He is here 💕',conn:'Finding him…',off:'He has not opened his side yet. Retrying…',taken:'This invitation belongs to someone else.',say:'Say something…',send:'Send',once:'One-time link: only the first person who opens it can join.',host:'Host this page on a web address first, otherwise the link will not open for her.',waitAsk:'Waiting for her answer…',copied:'Copied',fail:'Could not reach the connection service.',ring:'💍 Present the ring',ringHint:'press 💍 whenever you are ready',dark:'🌙 Dark entrance for her',dkOn:'She is walking in the dark, lighting the memories ✨',dkOff:'She lit every memory 💕 · press 💍 when ready',dkWait:'Let her finish lighting the memories first ✨'},
ar:{inv:'💌 ادعيها تدخل معاك',copy:'انسخ الدعوة',wait:'مستنيينها تفتح اللينك…',here:'هي هنا 💕',hereG:'هو هنا 💕',conn:'بدوّر عليه…',off:'لسه ما فتحش من عنده. هحاول تاني…',taken:'الدعوة دي لحد تاني.',say:'اكتب حاجة…',send:'ابعت',once:'لينك لمرة واحدة: أول واحدة تفتحه بس هي اللي تدخل.',host:'انشر الصفحة على عنوان على النت الأول، وإلا اللينك مش هيفتح عندها.',waitAsk:'مستنيين إجابتها…',copied:'اتنسخ',fail:'مقدرناش نوصل لخدمة الاتصال.',ring:'💍 قدّم الخاتم',ringHint:'اضغط 💍 في أي وقت تحب',dark:'🌙 دخول مظلم ليها',dkOn:'هي ماشية في الضلمة وبتنوّر الذكريات ✨',dkOff:'نوّرت كل الذكريات 💕 · اضغط 💍 لما تحب',dkWait:'استنى لما تخلّص تنوّر الذكريات ✨'}};
function lt(k){ return (LT[LANG]&&LT[LANG][k])||LT.en[k]; }
var peer=null, conn=null, linked=false, denied=false, lockCid=null, rem={got:false,x:0,z:0,r:0,m:0,y:0,sy:0,c:0}, lastSend=0, hostK=0;
var ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]};
var CID=(function(){ try{ var c=localStorage.getItem('ourMuseum.cid'); if(!c){ c=rnd(12); localStorage.setItem('ourMuseum.cid',c); } return c; }catch(e){ return rnd(12); } })();
function rnd(n){ var a=new Uint8Array(n),o=''; (window.crypto||window.msCrypto).getRandomValues(a); for(var i=0;i<n;i++) o+='abcdefghjkmnpqrstuvwxyz23456789'[a[i]%31]; return o; }
function hexTok(n){ var a=new Uint8Array(n),o=''; crypto.getRandomValues(a); for(var i=0;i<n;i++) o+=('0'+a[i].toString(16)).slice(-2); return o; }
function loadPeer(cb){ if(window.Peer) return cb(); var sc=document.createElement('script'); sc.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'; sc.onload=cb; sc.onerror=function(){ toast(lt('fail'),4000); }; document.head.appendChild(sc); }
function send(o){ try{ if(conn&&conn.open) conn.send(o); }catch(e){} }
var ringBusy=false, ringShown=null, herDark=false;
function fadeThen(cb,hold){ var f=$('fade'); f.style.opacity='1'; setTimeout(function(){ try{ cb(); }catch(e){} setTimeout(function(){ f.style.opacity='0'; },hold||200); },600); }
function hostEnterCine(){
  ringBusy=false; if(state==='hostcine') return;
  finishMuseumTour(false); state='hostcine'; refreshTourButton(); hostK=0; player.position.set(0,0,-37.4); player.rotation.y=0; setNear(-1); stick.hidden=true; rem.got=false;
  camPos.set(2.9,1.05,-34.8); camLook.set(0,1.15,-36.5);
}
function guestEnterRing(){
  if(state!=='explore') return; closeLightbox(); $('gb').hidden=true;
  player.position.set(0,0,-33.4); player.rotation.y=Math.PI; camPos.set(2.8,1.9,-29); camLook.set(0,1.3,-36.6); startCine();
}
function liveEv(n){ if(!ROLE) return; if(n==='cine'&&ROLE==='guest') npc.position.set(0,0,-37.4); send({t:n}); }
function netTick(now){ if(state==='intro'||!linked||now-lastSend<50) return; lastSend=now; send({t:'p',x:+player.position.x.toFixed(2),z:+player.position.z.toFixed(2),r:+player.rotation.y.toFixed(2),m:player.userData.amp>.25?1:0,y:+player.position.y.toFixed(2),c:carry.on?1:0,s:seat?1:0}); }
function netNpc(dt){ if(!rem.got) return; var k=1-Math.exp(-dt*9); npc.position.x+=(rem.x-npc.position.x)*k; npc.position.z+=(rem.z-npc.position.z)*k; npc.rotation.y=lerpAngle(npc.rotation.y,rem.r,k); pose(npc,rem.m,dt); rem.sy+=(rem.y-rem.sy)*k; npc.position.y=rem.sy;
  if(rem.s){ var nu=npc.userData; nu.legL.rotation.x=nu.legR.rotation.x=-1.45; nu.kneeL.rotation.x=nu.kneeR.rotation.x=1.45; nu.armL.rotation.x=nu.armR.rotation.x=-.45; nu.elL.rotation.x=nu.elR.rotation.x=-.9; } }
function liveHostCine(dt){ netNpc(dt); if(hostYes) hostK=Math.max(0,hostK-dt/3); else hostK=Math.min(1,hostK+dt/2.4); pose(player,false,dt); setKneel(player,hostYes?clampN((hostK-.55)/.45,0,1):hostK);
  if(hostYes){ var e=1-hostK, cC=clampN(rem.sy/LIFT,0,1); setHug(player,e,cC); setHug(npc,e,cC); dangle(npc,cC,joyT);
    if(rem.c){ var ry=npc.rotation.y; player.position.x=npc.position.x+HUG_SEP*Math.sin(ry); player.position.z=npc.position.z+HUG_SEP*Math.cos(ry); player.rotation.y=ry-Math.PI; } } }
function swapAvatars(){
  scene.remove(player); scene.remove(npc);
  player=makeAvatar(STY_HIM); npc=makeAvatar(STY_HER);
  player.position.set(1.4,0,3.4); player.rotation.y=Math.PI; npc.position.set(-1.4,0,3); npc.rotation.y=Math.PI;
  tags.me.av=player; tags.npc.av=npc; tags.me.label.textContent=C('from'); tags.npc.label.textContent=C('to');
}
function onLinked(){ linked=true; flags.l3=flags.l4=true; herDark=false; if(ROLE==='guest'&&DK.on&&!DK.fin) send({t:'dk',v:1}); toast(ROLE==='host'?lt('here')+' · '+lt('ringHint'):lt('hereG'),ROLE==='host'?5000:3000); chime([76,81],.12,.15); roomsLinked(); $('liveChat').hidden=false; $('lcIn').placeholder=lt('say'); $('lcGo').textContent=lt('send'); if(ROLE==='host') $('invSt').textContent=lt('here'); }
function onMsg(d){
  if(!d||!d.t) return;
  if(d.t==='gift'){ if(window.giftUnlock) giftUnlock(true); return; }
  if(d.t==='dk'){ if(ROLE==='host'){ herDark=!!d.v; toast(herDark?lt('dkOn'):lt('dkOff'),4200); if(!herDark) chime([76,81,88],.12,.15); } return; }
  if(d.t==='p'){ if(!rem.got){ rem.got=true; npc.position.set(d.x,0,d.z); } rem.x=d.x; rem.z=d.z; rem.r=d.r; rem.m=d.m; rem.y=d.y||0; rem.c=d.c||0; var sitNow=d.s?1:0; if((rem.s||0)!==sitNow) playReactSound('sit'); rem.s=sitNow; }
  else if(d.t==='say'){ say('npc',String(d.s).slice(0,80),3500); }
  else if(d.t==='emo'){ if(typeof d.e==='string'&&RDUR[d.e]){ npcR={n:d.e,t:0,d:RDUR[d.e]}; playReactSound(d.e,true); } }
  else if(d.t==='flower'&&flowerNear()){ var fr={n:'flower',t:0,d:RDUR.flower}; if(player.userData.him){ myR=fr; vx=vz=0; } else npcR=fr; playReactSound('flower'); }
  else if(roomsMsg(d)){ }
  else if(ROLE==='guest'&&d.t==='ring'){ fadeThen(guestEnterRing,200); }
  else if(ROLE==='host'&&d.t==='cine'){ hostEnterCine(); }
  else if(ROLE==='host'&&d.t==='let'){ letKey='letter'; startLetterScreen(); }
  else if(ROLE==='host'&&d.t==='let2'){ letKey='closing'; startLetterScreen(); }
  else if(ROLE==='host'&&d.t==='ask'){ stopLetterScreen(); enterGarden(); $('askQ').textContent=C('question'); setSub(lt('waitAsk')); $('choices').hidden=true; ask.hidden=false; requestAnimationFrame(function(){ ask.classList.add('in'); }); }
  else if(ROLE==='host'&&d.t==='yes'){ hostYes=true; joyT=0; fwStart(); $('askQ').textContent=C('final'); setSub(C('from')+'  ♥  '+C('to')); $('askBack').hidden=false; $('askTools').hidden=false; chime([72,76,79,84],.14,.22); burst(130); [500,1100,1800,2600].forEach(function(ms){ setTimeout(function(){ burst(60); },ms); }); }
}
function chatSend(){ var i=$('lcIn'),v=i.value.trim(); if(!v||!linked) return; i.value=''; say('me',v,3500); send({t:'say',s:v}); }
$('lcGo').addEventListener('click',chatSend);
['keydown','keyup'].forEach(function(e){ $('lcIn').addEventListener(e,function(ev){ ev.stopPropagation(); if(e==='keydown'&&ev.key==='Enter') chatSend(); }); });

function tkDate(){ try{ $('tkDate').textContent=new Date().toLocaleDateString(LANG==='ar'?'ar-EG':'en-GB',{day:'numeric',month:'long',year:'numeric'}); }catch(e){} }
(function(){ var b=$('introHearts'); for(var i=0;i<22;i++){ var h=document.createElement('span'); h.textContent='♥'; h.style.left=(Math.random()*96)+'%'; h.style.setProperty('--sz',(12+Math.random()*22).toFixed(0)+'px'); h.style.setProperty('--d',(9+Math.random()*9).toFixed(1)+'s'); h.style.setProperty('--dl',(-Math.random()*14).toFixed(1)+'s'); b.appendChild(h); } })();
(function(){ var b=$('loveFx'); for(var i=0;i<14;i++){ var h=document.createElement('span'); h.textContent='♥'; h.style.left=(Math.random()*100)+'%'; h.style.setProperty('--sz',(10+Math.random()*16).toFixed(0)+'px'); h.style.setProperty('--d',(14+Math.random()*12).toFixed(1)+'s'); h.style.setProperty('--dl',(-Math.random()*20).toFixed(1)+'s'); b.appendChild(h); } })();
tkDate(); $('langBtn').addEventListener('click',tkDate);
$('askBack').addEventListener('click',function(){ fwStart(); });
$('tRing').textContent=lt('ring');
$('tRing').addEventListener('click',function(){ if(ROLE!=='host'||!linked||state!=='explore'||ringBusy) return; if(herDark){ toast(lt('dkWait'),3200); return; } ringBusy=true; send({t:'ring'}); closeLightbox(); fadeThen(hostEnterCine,750); });
/* he opens an invitation */
var invBase='';
function invLinkSet(){ if(invBase) $('invLink').value=invBase+($('invDark').checked?'&dark=1':''); }
$('invDark').addEventListener('change',invLinkSet);
$('invDarkTxt').textContent=lt('dark');
$('inviteBtn').textContent=lt('inv'); if(JOIN) $('inviteBtn').hidden=true;
$('inviteBtn').addEventListener('click',function(){
  if(ROLE) return; ROLE='host'; swapAvatars(); $('inviteBtn').hidden=true; $('customize').hidden=true;
  var box=$('invite'); box.hidden=false; $('invCopy').textContent=lt('copy'); $('invSt').textContent='…'; $('invNote').textContent=lt('once')+(location.protocol==='file:'?' '+lt('host'):'');
  loadPeer(function(){
    var id='om-'+rnd(12), tok=hexTok(8); peer=new Peer(id,{config:ICE});
    peer.on('open',function(){ var h=location.hash.split('&')[0]; invBase=location.href.split('#')[0]+(/^#m=/.test(h)?h+'&':'#')+'join='+id+'.'+tok; invLinkSet(); $('invSt').textContent=lt('wait'); });
    peer.on('error',function(){ $('invSt').textContent=lt('fail'); });
    peer.on('connection',function(c){
      c.on('data',function(d){
        if(c!==conn){
          if(d&&d.t==='hi'){
            if(d.tok!==tok||(lockCid&&d.cid!==lockCid)){ try{ c.send({t:'no'}); }catch(e){} setTimeout(function(){ try{ c.close(); }catch(e){} },400); return; }
            lockCid=d.cid; if(conn){ try{ conn.close(); }catch(e){} } conn=c; c.send({t:'ok'}); onLinked();
          }
        } else onMsg(d);
      });
    });
  });
});
$('langBtn').addEventListener('click',function(){ $('tRing').textContent=lt('ring'); $('inviteBtn').textContent=lt('inv'); $('invDarkTxt').textContent=lt('dark'); $('invCopy').textContent=lt('copy'); $('lcIn').placeholder=lt('say'); $('lcGo').textContent=lt('send'); });
$('invCopy').addEventListener('click',function(){ var v=$('invLink').value; if(!v) return; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function(){ toast(lt('copied')); },function(){ window.prompt('Link',v); }); else window.prompt('Link',v); });

/* she opens it */
if(JOIN){
  $('pct').dataset.live='1'; toast(lt('conn'),2500);
  loadPeer(function(){
    peer=new Peer(undefined,{config:ICE});
    var rt=null; function retry(){ if(denied||linked||rt) return; rt=setTimeout(function(){ rt=null; tryConn(); },4000); }
    function tryConn(){
      if(linked||denied||!peer||peer.destroyed) return;
      var c=peer.connect(JOIN.id,{reliable:true}), to=setTimeout(function(){ try{ c.close(); }catch(e){} toast(lt('off'),2500); retry(); },9000);
      c.on('open',function(){ c.send({t:'hi',tok:JOIN.tok,cid:CID}); });
      c.on('data',function(d){ if(d&&d.t==='ok'){ clearTimeout(to); conn=c; onLinked(); } else if(d&&d.t==='no'){ clearTimeout(to); denied=true; toast(lt('taken'),5000); } else if(c===conn) onMsg(d); });
      c.on('close',function(){ if(conn===c){ conn=null; linked=false; rem.got=false; retry(); } });
    }
    peer.on('open',tryConn); peer.on('error',function(e){ if(e&&e.type==='peer-unavailable'){ clearTimeout(0); toast(lt('off'),2500); retry(); } else toast(lt('fail'),3000); });
  });
}

