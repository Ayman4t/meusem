/* State machine, letter and question, confetti, fireworks, guestbook, tools */
'use strict';

/* ---------- State machine ---------- */
state='intro'; // intro, explore, cinematic, proposal, accepted, done
var flags={l3:false,l4:false}, cine={stage:-1,t:0,k:0,shock:false}, hug={on:false,k:0}, shockK=0, tries=0, lastNeed=0, typeTimer=null;

function startExplore(){
  state='explore'; intro.classList.add('out'); setTimeout(function(){ intro.hidden=true; },1900); hud.hidden=false;
  refreshTourButton();
  initAudio(); startMusic(); setMuted(muted); setSfxMuted(sfxMuted); chime([67,72,76],.2,.12);
  if(isTouch){ stick.hidden=false; hint.textContent=t('hintT'); } else hint.textContent=t('hintD');
  setTimeout(function(){ hint.style.opacity='0'; },9000);
  if(!ROLE||(ROLE==='guest'&&DARK_INV)){ dkStart(); }
}
function startCine(){ finishMuseumTour(false); liveEv('cine'); player.userData.rate=1; state='cinematic'; refreshTourButton(); cine.stage=0; cine.t=0; cine.k=0; cine.shock=false; stick.hidden=true; $('capPill').hidden=true; hint.style.opacity='0'; $('exitPill').hidden=true; setNear(-1); }
function updateCine(dt){
  if(cine.stage===0){
    var dx=0-player.position.x,dz=-35.9-player.position.z,d=Math.hypot(dx,dz);
    if(d>.06){ var s=Math.min(d,2.8*dt); player.position.x+=dx/d*s; player.position.z+=dz/d*s; player.rotation.y=lerpAngle(player.rotation.y,Math.atan2(dx,dz),1-Math.exp(-dt*10)); pose(player,true,dt); }
    else { cine.stage=1; cine.t=0; say('npc',C('l5'),2600); }
  } else if(cine.stage===1){
    cine.t+=dt; player.rotation.y=lerpAngle(player.rotation.y,Math.PI,1-Math.exp(-dt*8)); pose(player,false,dt);
    if(cine.t>1.6){ cine.stage=2; cine.t=0; musicLevel=1; }
  } else if(cine.stage===2){
    cine.t+=dt; if(cine.t>1.4&&!cine.shock){ cine.shock=true; say('me',C('l6'),2800); }
    cine.k=Math.min(1,cine.t/2.4); pose(player,false,dt);
    if(cine.t>5){ cine.stage=3; showLetter(); }
  } else pose(player,false,dt);
}

/* ---------- Letter, then the question ---------- */
var avHid=false, letterOn=false, letTimer=null, letLay=null, letN=0, letKey='letter', letPage=0;
function wrapLines(x,text,maxW){ var words=String(text).split(/\s+/), line='', out=[]; words.forEach(function(w){ var tt=line?line+' '+w:w; if(x.measureText(tt).width>maxW&&line){ out.push(line); line=w; } else line=tt; }); out.push(line); return out; }
function letMaxW(){ return stage.clientWidth/stage.clientHeight<1?860:1180; }
function layoutLetter(){
  var x=screenCanvas.getContext('2d'), full=C(letKey).replace(/\{from\}/g,C('from')).replace(/\{to\}/g,C('to')), ar=LANG==='ar', best=null;
  var fam=ar?'"IBM Plex Sans Arabic",sans-serif':'"Playfair Display","IBM Plex Sans Arabic",Georgia,serif', maxW=letMaxW();
  for(var fs=64;fs>=20;fs-=2){
    x.font=(ar?'600 ':'italic 600 ')+fs+'px '+fam; var lh=Math.round(fs*(ar?1.5:1.3)), lines=[];
    full.split('\n').forEach(function(p){ if(!p.trim()){ lines.push({t:'',h:lh*.55}); return; } wrapLines(x,p,maxW).forEach(function(l){ lines.push({t:l,h:lh,w:x.measureText(l).width}); }); });
    var tot=lines.reduce(function(a,l){ return a+l.h; },0); best={fs:fs,lines:lines,tot:tot,font:x.font}; if(tot<=520) break;
  }
  best.count=best.lines.reduce(function(a,l){ return a+l.t.length; },0); letLay=best;
}
function drawLetterScreen(n){
  var x=screenCanvas.getContext('2d'), w=1400, h=780, ar=LANG==='ar';
  x.drawImage(loveBg(),0,0); loveDivider(x,w/2,78,260);
  x.direction=ar?'rtl':'ltr'; x.textBaseline='alphabetic'; x.textAlign=ar?'right':'left'; x.fillStyle='#fff1ee'; x.font=letLay.font; x.shadowColor='rgba(255,110,150,.5)'; x.shadowBlur=14;
  var cy=146+Math.max(0,(540-letLay.tot)/2), left=n;
  letLay.lines.forEach(function(l){
    cy+=l.h; if(!l.t||left<=0){ left-=l.t.length; return; }
    var shown=l.t.slice(0,left); left-=l.t.length; x.fillText(shown, ar?(w+l.w)/2:(w-l.w)/2, cy);
  });
  x.shadowBlur=0; loveNames(x,w,h-62);
  screenTex.needsUpdate=true;
}
function startLetterScreen(onDone){
  document.body.classList.add('letterMode'); letterOn=true; layoutLetter(); letN=0; clearInterval(letTimer); drawLetterScreen(0);
  letTimer=setInterval(function(){ letN+=2; drawLetterScreen(letN); if(letN>=letLay.count){ clearInterval(letTimer); if(onDone) setTimeout(onDone,900); } },38);
}
function stopLetterScreen(){ document.body.classList.remove('letterMode'); letterOn=false; clearInterval(letTimer); if(letLay) drawLetterScreen(letLay.count); }
function showLetter(){
  var el=$('letter'); letKey='letter'; letPage=0; el.hidden=false; $('letGo').hidden=true; requestAnimationFrame(function(){ el.classList.add('in'); });
  $('letVoice').hidden=!store.audLetter; if(store.audLetter) playVoice('audLetter');
  send({t:'let'});
  startLetterScreen(function(){ $('letGo').hidden=false; });
}
$('letVoice').addEventListener('click',function(){ playVoice('audLetter'); });
$('letGo').addEventListener('click',function(){
  if(false){ letPage=1; letKey='closing'; $('letGo').hidden=true; clearInterval(letTimer); send({t:'let2'}); startLetterScreen(function(){ $('letGo').hidden=false; }); return; }
  stopLetterScreen(); $('letter').classList.remove('in'); if(!voiceEl.paused) { voiceEl.pause(); setDuck(1); }
  setTimeout(function(){ $('letter').hidden=true; },900); fadeThen(function(){ enterGarden(); showAsk(); },700);
});
var yes=$('yes'), no=$('no'), noSlot=$('noSlot');
function setSub(s){ $('askSub').textContent=s; }
function placeNoInSlot(){ var r=noSlot.getBoundingClientRect(); no.style.left=(r.left-6)+'px'; no.style.top=(r.top-2)+'px'; }
function showAsk(){
  liveEv('ask'); state='proposal'; $('askQ').textContent=C('question'); setSub(''); ask.hidden=false;
  requestAnimationFrame(function(){ placeNoInSlot(); ask.classList.add('in'); });
}
function dodge(e){
  if(e){ e.preventDefault(); e.stopPropagation(); } if(state!=='proposal') return;
  tries++; var NL=NO_LINES[LANG]; setSub(NL[Math.min(tries,NL.length-1)]||'');
  var maxS=Math.max(1,(stage.clientWidth-32)/yes.offsetWidth); yes.style.setProperty('--s',Math.min(1+tries*.4,maxS).toFixed(2));
  var vw=stage.clientWidth,vh=stage.clientHeight,bw=no.offsetWidth,bh=no.offsetHeight,y=yes.getBoundingClientRect(),best=null;
  for(var n=0;n<24;n++){ var px=16+Math.random()*(vw-bw-32),py=16+Math.random()*(vh-bh-32); var ov=px<y.right+10&&px+bw>y.left-10&&py<y.bottom+10&&py+bh>y.top-10; if(!ov){ best={x:px,y:py}; break; } }
  if(!best) best={x:16,y:vh-bh-16};
  no.style.left=best.x+'px'; no.style.top=best.y+'px';
  if(tries>=4) no.classList.add('tiny'); if(tries>=8){ no.style.opacity='0'; no.style.pointerEvents='none'; }
}
no.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') dodge(e); });
no.addEventListener('pointerdown',dodge); no.addEventListener('click',dodge);
no.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') dodge(e); });
yes.addEventListener('click',function(){
  if(state!=='proposal') return;
  liveEv('yes'); state='accepted'; $('askQ').textContent=C('final'); setSub(C('from')+'  ♥  '+C('to'));
  $('choices').hidden=true; no.hidden=true; $('askBack').hidden=false; $('askTools').hidden=false;
  hug.on=true; hug.k=0; joyT=0; carry.t=0; carry.on=false; carry.th=0; fwStart(); chime([72,76,79,84],.14,.22);
  burst(130); [500,1100,1800,2600].forEach(function(ms){ setTimeout(function(){ burst(60); },ms); });
});
$('askBack').addEventListener('click',function(){
  ask.classList.remove('in'); setTimeout(function(){ ask.hidden=true; },1200); state='done';
  $('hudShot').hidden=false; $('hudRec').hidden=false;
});
window.addEventListener('resize',function(){ if(state==='proposal'&&tries===0) placeNoInSlot(); });

/* ---------- Confetti ---------- */
var cc=$('confetti'), cx2=cc.getContext('2d'), parts=[], cfRun=false, CF_COLORS=['#d93f5a','#f27b8f','#fff3f0','#ffb3bf','#e8c46a'];
var reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
/* ---------- Fireworks + joyful jumping ---------- */
var carry={t:0,on:false,th:0};
function dangle(av,k,t){ var e=ease(k); if(e<=0) return; var u=av.userData, sw=Math.sin(t*2.4)*.1;
  u.legL.rotation.x=mix(u.legL.rotation.x,.22+sw,e); u.legR.rotation.x=mix(u.legR.rotation.x,.22-sw*.8,e);
  u.kneeL.rotation.x=mix(u.kneeL.rotation.x,.6+sw*.8,e); u.kneeR.rotation.x=mix(u.kneeR.rotation.x,.6-sw*.8,e); }
var fwc=$('fw'), fwx=fwc.getContext('2d'), fwP=[], fwR=[], fwOn=false, fwRun=false, fwNext=0, fwStartAt=0, joyT=0, hostYes=false, FW_H=[345,42,50,330,200,290,12];
function boom(){
  if(!AC||sfxMuted) return;
  if(!noiseBuf){ var n=Math.floor(AC.sampleRate*.12); noiseBuf=AC.createBuffer(1,n,AC.sampleRate); var dd=noiseBuf.getChannelData(0); for(var i=0;i<n;i++) dd[i]=Math.random()*2-1; }
  var tm=AC.currentTime+.02, o=AC.createOscillator(), g=AC.createGain();
  o.frequency.setValueAtTime(120,tm); o.frequency.exponentialRampToValueAtTime(40,tm+.35);
  g.gain.setValueAtTime(.0001,tm); g.gain.exponentialRampToValueAtTime(.2,tm+.01); g.gain.exponentialRampToValueAtTime(.001,tm+.45);
  o.connect(g); g.connect(sfxBus); o.start(tm); o.stop(tm+.5);
  for(var j=0;j<4;j++){ var s2=AC.createBufferSource(), f=AC.createBiquadFilter(), gg=AC.createGain(), t2=tm+j*.06+Math.random()*.05;
    s2.buffer=noiseBuf; f.type='highpass'; f.frequency.value=2500+Math.random()*2500; gg.gain.setValueAtTime(.08,t2); gg.gain.exponentialRampToValueAtTime(.001,t2+.1);
    s2.connect(f); f.connect(gg); gg.connect(sfxBus); s2.start(t2); s2.stop(t2+.12); }
}
function fwBurst(x,y,heart){
  var d=window.devicePixelRatio||1, n=reduceMotion?36:(heart?90:100), h1=FW_H[Math.floor(Math.random()*FW_H.length)], h2=(h1+40+Math.random()*80)%360;
  for(var i=0;i<n;i++){
    var vx,vy;
    if(heart){ var t=i/n*Math.PI*2, k=.17*d; vx=16*Math.pow(Math.sin(t),3)*k; vy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*k; }
    else { var a=Math.random()*6.283, sp=(1+Math.random()*4.4)*d; vx=Math.cos(a)*sp; vy=Math.sin(a)*sp; }
    fwP.push({x:x,y:y,vx:vx,vy:vy,l:1,dec:.009+Math.random()*.01,h:(i%2?h1:h2),w:(1.4+Math.random()*1.6)*d});
  }
  boom();
}
function fwLaunch(w,h){ var d=window.devicePixelRatio||1; fwR.push({x:(.12+.76*Math.random())*w,y:h,ty:(.14+.3*Math.random())*h,heart:Math.random()<.34,d:d}); }
function fwTick(){
  var w=fwc.width, h=fwc.height, now=performance.now();
  fwx.clearRect(0,0,w,h); fwx.globalCompositeOperation='lighter'; fwx.lineCap='round';
  if(fwOn&&now-fwStartAt>45000){ fwOn=false; fwSoundOff(); }
  if(fwOn&&now>fwNext){ fwLaunch(w,h); if(Math.random()<.4) setTimeout(function(){ if(fwOn) fwLaunch(fwc.width,fwc.height); },180); fwNext=now+(reduceMotion?1300:420+Math.random()*420); }
  fwR=fwR.filter(function(r){
    var sp=Math.max(4*r.d,(r.y-r.ty)*.055); r.y-=sp;
    fwx.strokeStyle='rgba(255,236,200,.9)'; fwx.lineWidth=2.2*r.d; fwx.beginPath(); fwx.moveTo(r.x,r.y+sp*5); fwx.lineTo(r.x,r.y); fwx.stroke();
    if(r.y<=r.ty+6){ fwBurst(r.x,r.y,r.heart); return false; } return true;
  });
  fwP=fwP.filter(function(p){
    p.vx*=.985; p.vy=p.vy*.985+.04*(window.devicePixelRatio||1); p.x+=p.vx; p.y+=p.vy; p.l-=p.dec; if(p.l<=0) return false;
    fwx.strokeStyle='hsla('+p.h+',100%,'+(60+p.l*20)+'%,'+Math.min(1,p.l*1.3).toFixed(2)+')'; fwx.lineWidth=p.w;
    fwx.beginPath(); fwx.moveTo(p.x-p.vx*2,p.y-p.vy*2); fwx.lineTo(p.x,p.y); fwx.stroke(); return true;
  });
  if(fwOn||fwP.length||fwR.length) requestAnimationFrame(fwTick); else { fwRun=false; fwx.clearRect(0,0,w,h); }
}
var fwAudio=new Audio('sounds/fireworks.mp3?v=1'); fwAudio.loop=true; fwAudio.preload='auto'; fwAudio.volume=.7;
function fwSoundOn(){ try{ fwAudio.muted=sfxMuted; fwAudio.currentTime=0; var pr=fwAudio.play(); if(pr&&pr.catch) pr.catch(function(){}); setDuck(.35); }catch(e){} }
function fwSoundOff(){ try{ fwAudio.pause(); setDuck(1); }catch(e){} }
function fwStart(){ unlockOnlineSfx(); try{ if(typeof initAudio==='function') initAudio(); if(AC&&AC.state==='suspended') AC.resume(); }catch(e){} if(fwOn) return; fwOn=true; fwSoundOn(); fwStartAt=performance.now(); fwNext=fwStartAt+500; if(!fwRun){ fwRun=true; requestAnimationFrame(fwTick); } }

function burst(n){
  if(reduceMotion) n=Math.round(n/3);
  var w=cc.width,h=cc.height,dpr=window.devicePixelRatio||1;
  for(var i=0;i<n;i++) parts.push({x:Math.random()*w,y:-30-Math.random()*h*.35,vx:(Math.random()-.5)*1.6*dpr,vy:(2+Math.random()*3.2)*dpr,r:(7+Math.random()*13)*dpr,rot:Math.random()*6.28,vr:(Math.random()-.5)*.08,c:CF_COLORS[i%CF_COLORS.length]});
  if(!cfRun){ cfRun=true; requestAnimationFrame(cfTick); }
}
function cfTick(){
  cx2.clearRect(0,0,cc.width,cc.height); parts=parts.filter(function(p){ return p.y<cc.height+40; });
  parts.forEach(function(p){ p.x+=p.vx+Math.sin(p.y*.02)*.6; p.y+=p.vy; p.rot+=p.vr; cx2.save(); cx2.translate(p.x,p.y); cx2.rotate(p.rot); cx2.fillStyle=p.c; heartPath(cx2,0,0,p.r); cx2.fill(); cx2.restore(); });
  if(parts.length) requestAnimationFrame(cfTick); else cfRun=false;
}

/* ---------- Near-frame logic (video, audio guide, song) ---------- */
function setNear(best){
  var prev=nearIdx; if(best===prev) return; nearIdx=best;
  if(prev>=0&&galleryFrames[prev].video) galleryFrames[prev].video.pause();
  if(prev===4&&best!==4) stopSong();
  $('capPill').hidden=best<0;
  if(best>=0){
    $('capText').textContent=CAP(best); $('capListen').hidden=!store['aud'+best];
    var f=galleryFrames[best]; $('capOpen').hidden=f.open; $('capBtn').hidden=!f.open;
    if(f.open){ if(f.video) f.video.play().catch(function(){});
    if(best===4&&store.song) startSong();
    if(!guided[best]&&store['aud'+best]){ guided[best]=true; playVoice('aud'+best); } }
  }
}

/* ---------- Guestbook ---------- */
var GB_KEY='ourMuseum.guest';
function gbLoad(){ try{ return JSON.parse(localStorage.getItem(GB_KEY)||'[]'); }catch(e){ return []; } }
function gbRender(){
  var l=$('gbList'); l.innerHTML=''; var a=gbLoad(); if(!a.length){ l.textContent=t('gEmpty'); return; }
  a.slice().reverse().forEach(function(n){ var d=document.createElement('div'); d.className='gb-note'; var p=document.createElement('p'); p.textContent=n.t; var s=document.createElement('small'); s.textContent=new Date(n.d).toLocaleString(LANG==='ar'?'ar-EG':undefined); d.appendChild(p); d.appendChild(s); l.appendChild(d); });
}
$('gbClose').addEventListener('click',function(){ $('gb').hidden=true; });
$('gbAdd').addEventListener('click',function(){
  var v=$('gbText').value.trim(); if(!v) return; var a=gbLoad(); a.push({t:v,d:Date.now()});
  try{ localStorage.setItem(GB_KEY,JSON.stringify(a)); }catch(e){} $('gbText').value=''; gbRender(); chime([79,84],.1,.12);
});

/* ---------- Tools: sound, lights, skip, screenshot, recording ---------- */
function overlayText(x,w,h){
  var g=x.createLinearGradient(0,h*.78,0,h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.6)'); x.fillStyle=g; x.fillRect(0,h*.78,w,h*.22);
  x.fillStyle='#f4f0ea'; x.textAlign='center'; x.font='italic 500 '+Math.round(h*.045)+'px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText(C('from')+'  ♥  '+C('to'),w/2,h*.93);
}
/* Fireworks, confetti and the love plane are separate page layers on top of the 3D canvas, so they are copied onto saved pictures / recordings by hand. */
function drawPlaneOn(x,fl,st,sx,sy){
  var cl=fl.querySelector('.cloth'), rp=fl.querySelector('.rope'), sv=fl.querySelector('svg');
  x.save();
  if(cl){
    var r=cl.getBoundingClientRect(), cs=getComputedStyle(cl), W=cl.offsetWidth*sx, H=cl.offsetHeight*sy, cx=(r.left+r.width/2-st.left)*sx, cy=(r.top+r.height/2-st.top)*sy;
    var notch=Math.min(W*.14,18*sx), pl=parseFloat(cs.paddingLeft)*sx, pr=parseFloat(cs.paddingRight)*sx;
    x.shadowColor='rgba(90,20,40,.3)'; x.shadowBlur=10*sx; x.shadowOffsetY=5*sx;
    var g=x.createLinearGradient(cx-W/2,cy-H/2,cx+W/2,cy+H/2); g.addColorStop(0,'#fffaf6'); g.addColorStop(.7,'#ffd3de'); g.addColorStop(1,'#ffb9ca');
    x.fillStyle=g; x.beginPath(); x.moveTo(cx-W/2,cy-H/2); x.lineTo(cx+W/2,cy-H/2); x.lineTo(cx+W/2,cy+H/2); x.lineTo(cx-W/2,cy+H/2); x.lineTo(cx-W/2+notch,cy); x.closePath(); x.fill();
    x.shadowColor='transparent'; x.fillStyle='#c2284a'; x.textAlign='center'; x.textBaseline='middle'; x.direction='ltr';
    x.font=cs.fontStyle+' '+cs.fontWeight+' '+(parseFloat(cs.fontSize)*sx)+'px '+cs.fontFamily;
    x.fillText(cl.textContent,cx-W/2+pl+(W-pl-pr)/2,cy+H*.03);
  }
  if(rp){ var q=rp.getBoundingClientRect(); x.fillStyle='rgba(255,246,240,.9)'; x.fillRect((q.left-st.left)*sx,(q.top+q.height/2-st.top)*sy-sy,q.width*sx,2*sy); }
  if(sv&&typeof PLANE_IMG!=='undefined'&&PLANE_IMG.complete){ var v=sv.getBoundingClientRect(); x.shadowColor='rgba(90,20,40,.3)'; x.shadowBlur=10*sx; x.shadowOffsetY=5*sx; x.drawImage(PLANE_IMG,(v.left-st.left)*sx,(v.top-st.top)*sy,v.width*sx,v.height*sy); }
  x.restore();
}
function drawOverlays(x,w,h){
  var st=stage.getBoundingClientRect(), sx=w/st.width, sy=h/st.height;
  ['fw','confetti'].forEach(function(id){ var cv=$(id); if(cv&&cv.width&&cv.height) x.drawImage(cv,0,0,w,h); });
  var fl=document.querySelector('#loveFlight .fl'); if(fl) drawPlaneOn(x,fl,st,sx,sy);
}
function shot(){
  renderer.render(scene,camera);
  var c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; var x=c.getContext('2d'); x.drawImage(canvas,0,0); drawOverlays(x,c.width,c.height); overlayText(x,c.width,c.height);
  c.toBlob(function(b){ if(b){ download(b,'our-moment.png'); toast(t('saved')); } },'image/png');
}
var rec=null, recC=null, recX=null, recTimer=null;
function updateRecBtns(){ var s=rec?t('stop'):t('rec'); $('hudRec').textContent=s; $('askRec').textContent=s; }
function toggleRec(){
  if(rec){ rec.stop(); return; }
  if(!window.MediaRecorder||!canvas.captureStream){ toast(t('norec')); return; }
  recC=document.createElement('canvas'); recC.width=canvas.width; recC.height=canvas.height; recX=recC.getContext('2d');
  var stream=recC.captureStream(30); if(recDest) recDest.stream.getAudioTracks().forEach(function(tr){ stream.addTrack(tr); });
  var chunks=[], mt=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].filter(function(m){ return MediaRecorder.isTypeSupported(m); })[0];
  try{ rec=new MediaRecorder(stream,mt?{mimeType:mt}:undefined); }catch(e){ rec=null; recX=null; toast(t('norec')); return; }
  rec.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
  rec.onstop=function(){ var b=new Blob(chunks,{type:(rec&&rec.mimeType)||'video/webm'}); download(b,'our-proposal'+(b.type.indexOf('mp4')>=0?'.mp4':'.webm')); rec=null; recX=null; clearTimeout(recTimer); updateRecBtns(); };
  rec.start(500); recTimer=setTimeout(function(){ if(rec) rec.stop(); },60000); updateRecBtns();
}
['hudShot','askShot'].forEach(function(id){ $(id).addEventListener('click',shot); });
['hudRec','askRec'].forEach(function(id){ $(id).addEventListener('click',toggleRec); });

