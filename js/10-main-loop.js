/* Main loop, config to scene, loading screen */
'use strict';

/* ---------- Main loop ---------- */
var camPos=new THREE.Vector3(0,3.6,9), camLook=new THREE.Vector3(0,1.8,0), wantPos=new THREE.Vector3(), wantLook=new THREE.Vector3();
var last=performance.now(), pinkK=0, heartsK=0, vx=0, vz=0;
function inDoorZ(z,h){ return Math.abs(z-DOORZ)<h||Math.abs(z-DOORZ2)<h; }
function nearDoor(z){ return Math.abs(z-DOORZ)<Math.abs(z-DOORZ2)?DOORZ:DOORZ2; }
function roomClampZ(z){ return z<-21?clampN(z,-28,-23):clampN(z,-19,-14); }
function camRZ(cz,pz){ return pz<-21?clampN(cz,-28.3,-22.7):clampN(cz,-19.2,-13.8); }
function clampPlayer(p){
  if(typeof COLL!=='undefined') for(var ci=0;ci<COLL.length;ci++){ var c=COLL[ci], r=.38;
    if(p.x>c.x0-r&&p.x<c.x1+r&&p.z>c.z0-r&&p.z<c.z1+r){
      var dl=p.x-(c.x0-r), dr=(c.x1+r)-p.x, dn=p.z-(c.z0-r), df=(c.z1+r)-p.z, m=Math.min(dl,dr,dn,df);
      if(m===dl) p.x=c.x0-r; else if(m===dr) p.x=c.x1+r; else if(m===dn) p.z=c.z0-r; else p.z=c.z1+r;
    } }
  var xMin=-(W/2-1.2), xMax=W/2-1.2;
  if(p.x>xMax){
    if(p.x<14.2){ if(!inDoorZ(p.z,1.3)&&p.x<W/2-.6) p.x=xMax; else if(p.x>W/2-.6) p.z=clampN(p.z,nearDoor(p.z)-.9,nearDoor(p.z)+.9); }
    else { p.x=Math.min(20.3,p.x); p.z=roomClampZ(p.z); }
  }
  if(p.x<xMin){
    if(p.x>-14.2){ if(!inDoorZ(p.z,1.3)&&p.x>-W/2+.6) p.x=xMin; else if(p.x<-W/2+.6) p.z=clampN(p.z,nearDoor(p.z)-.9,nearDoor(p.z)+.9); }
    else { p.x=Math.max(-20.3,p.x); p.z=roomClampZ(p.z); }
  }
}
function frame(now){
  var dt=Math.min(.05,(now-last)/1000); last=now; if(ROLE) netTick(now);
  var moving=false;
  if(state==='explore'){
    camYaw+=(keys.rl-keys.rr)*dt*1.8;
    var flowerLock=!!(myR&&myR.n==='flower'), ix=flowerLock?0:(keys.right-keys.left)+joy.x, iz=flowerLock?0:(keys.down-keys.up)+joy.y, m=Math.hypot(ix,iz); if(flowerLock) vx=vz=0; if(m>1){ ix/=m; iz/=m; m=1; }
    var tvx=0,tvz=0, jm=Math.hypot(joy.x,joy.y), spd=Math.max(keys.shift?5.8:3.2,3.2+2.6*clampN((jm-.85)/.1,0,1)); player.userData.rate=.65+.35*(spd-3.2)/2.6;
    if(m>.08){ var cs=Math.cos(camYaw),sn=Math.sin(camYaw); tvx=(ix*cs+iz*sn)*spd; tvz=(-ix*sn+iz*cs)*spd; }
    var ka=1-Math.exp(-dt*(m>.08?9:11)); vx+=(tvx-vx)*ka; vz+=(tvz-vz)*ka;
    var prevPX=player.position.x, prevPZ=player.position.z; player.position.x+=vx*dt; player.position.z+=vz*dt;
    if(Math.hypot(vx,vz)>.3){ moving=true; player.rotation.y=lerpAngle(player.rotation.y,Math.atan2(vx,vz),1-Math.exp(-dt*12)); }
    var zMin=-39;
    player.position.z=Math.max(zMin,Math.min(8.6,player.position.z)); clampPlayer(player.position);
    if(!ROLE&&myR&&myR.n==='hand'&&myR.hs!=null){ npc.position.x+=player.position.x-prevPX; npc.position.z+=player.position.z-prevPZ; }
    pose(player,moving,dt); fxPose(dt); if(!seat) clampPlayer(player.position);
    if(!roomFound&&player.position.x<-W/2-.6&&player.position.z>-21){ roomFound=true; toast(t('secret'),3500); chime([76,79,83,88],.12,.18); burst(50); }
  }
  if(state==='hostcine') liveHostCine(dt);
  if(state==='cinematic') updateCine(dt);
  if(state==='proposal') pose(player,false,dt);
  if(state==='explore'){ if(ROLE) netNpc(dt); else { npc.rotation.y=lerpAngle(npc.rotation.y,Math.atan2(player.position.x-npc.position.x,player.position.z-npc.position.z),1-Math.exp(-dt*4)); pose(npc,false,dt); } }
  else if(state==='cinematic'||state==='proposal'){ npc.rotation.y=lerpAngle(npc.rotation.y,0,1-Math.exp(-dt*6)); pose(npc,false,dt); }
  if(state==='cinematic'&&cine.stage>=2) setKneel(npc,cine.stage===2?cine.k:1);
  if(state==='proposal') setKneel(npc,1);
  var shT=((state==='cinematic'&&cine.stage>=2&&cine.shock)||state==='proposal')?1:0; if(hug.on) shT=0;
  shockK+=(shT-shockK)*Math.min(1,dt*3); if(state!=='explore') setShock(player,shockK);
  if(hug.on){
    hug.k=Math.min(1,hug.k+dt/3); var K=hug.k, ap=ease(clampN(K/.55,0,1)), lk2=0;
    pose(npc,false,dt); pose(player,K<.5,dt); setShock(player,shockK); setKneel(npc,1-clampN(K/.45,0,1));
    player.position.z=-35.9+(-37.4+HUG_SEP+35.9)*ap; player.position.x=0;
    npc.rotation.y=lerpAngle(npc.rotation.y,0,1-Math.exp(-dt*8)); player.rotation.y=lerpAngle(player.rotation.y,Math.PI,1-Math.exp(-dt*8));
    var th=0, cr=HUG_SEP/2, cz0=-37.4+cr;
    if(K>=1){
      carry.t+=dt; var ct=carry.t-1.5; carry.on=ct>0;
      if(ct>0){
        lk2=ease(clampN(ct/1.2,0,1))*(1-ease(clampN((ct-6.6)/1.2,0,1)));
        th=Math.PI*2*ease(clampN((ct-1)/5.6,0,1)); carry.th=th;
      }
    }
    setHug(npc,K,lk2); setHug(player,K,lk2);
    if(carry.on){
      var sn2=Math.sin(th), cs2=Math.cos(th);
      npc.position.x=-cr*sn2; npc.position.z=cz0-cr*cs2; player.position.x=cr*sn2; player.position.z=cz0+cr*cs2;
      npc.rotation.y=th; player.rotation.y=Math.PI+th; player.position.y=LIFT*lk2; dangle(player,lk2,carry.t);
    }
  }

  if(state==='explore'){
    var pz=player.position.z, px0=player.position.x;
    if(!ROLE&&!dkOn()&&!flags.l3&&pz<-11){ flags.l3=true; say('npc',C('l3'),3400); }
    if(!ROLE&&!dkOn()&&!flags.l4&&pz<-24){ flags.l4=true; say('npc',C('l4'),3400); }
    if(pz<-33.4&&px0>-W/2&&ROLE!=='host'&&!dkOn()) startCine();
    var best=-1,bd=5.4;
    galleryFrames.forEach(function(f,i){ if(dkOn()&&!dkLit(i)) return; var d=Math.hypot(f.x-px0,f.z-pz); if(d<5.4&&!found[i]){ found[i]=1; chime([84,88],.12,.12); } if(d<bd){ bd=d; best=i; } });
    if(pz>=-28.5&&pz<=-22.5&&Math.abs(px0)>13.7) best=-1; /* inside the photo booth / drawing studio: no painting caption */
    if(state==='explore') setNear(best);
    var nearExit=Math.hypot(px0-EXITPOS.x,pz-EXITPOS.z)<3.4; $('exitPill').hidden=!nearExit; if(window.giftUpdate) giftUpdate(px0,pz);
    if(state==='explore') updateMuseumTour(now);
  } else $('exitPill').hidden=true;
  tvDraw(now);

  /* video textures update only while playing */
  galleryFrames.forEach(function(f,i){ if(f.video&&!f.video.paused) f.vtex.needsUpdate=true;
    var phase=(now*.00012+i*.23)%1; f.sweep.position.x=-1.05+phase*2.1; f.sweep.material.opacity=.42*Math.sin(phase*Math.PI);
    if(!f.opening) f.sheenP.material.opacity=.72+.08*(.5+.5*Math.sin(now*.00075+i*1.1));
    if(f.opening) updateCoverOpen(f,dt); });
  couponMesh.position.y=1.45+Math.sin(now*.0015)*.05; couponMesh.rotation.y=Math.PI/2+Math.sin(now*.0008)*.25;
  twinkles.forEach(function(s){ s.material.color.setRGB(1,.85+Math.sin(now*.003+s.userData.ph)*.1,.55+Math.sin(now*.004+s.userData.ph)*.2); });
  if(state==='explore'||state==='cinematic'){
    var pp=player.position;
    petals.forEach(function(p){ var d=Math.hypot(p.position.x-pp.x,p.position.z-pp.z), b=clampN(1-d/9,0,1); p.material.color.setRGB(mix(.35,1,b),mix(.12,.49,b),mix(.19,.59,b)); });
  }

  var romantic=(state==='hostcine'||state==='proposal'||state==='accepted'||state==='done'||(state==='cinematic'&&cine.stage>=2));
  pinkK+=((romantic?1:0)-pinkK)*Math.min(1,dt*1.5); pinkLight.intensity=pinkK*1.2;
  heartsK+=((romantic?1:0)-heartsK)*Math.min(1,dt*1.2);
  hearts.forEach(function(h){
    var d=h.userData; h.visible=heartsK>.02&&!letterOn; if(!h.visible) return;
    d.y+=d.v*dt; if(d.y>3.4) d.y=.4; h.position.set(d.bx+Math.sin(now*.001+d.ph)*.25,d.y,d.bz);
    h.material.opacity=heartsK*.8*Math.min(1,(3.4-d.y)/1.2)*Math.min(1,d.y/.6);
  });
  if(window.giftTick) giftTick(dt,now);
  if(letterOn!==avHid){ avHid=letterOn; player.visible=npc.visible=true; }
  if(letterOn){ /* characters stand beside the letter board, facing the viewer */
    var lyz=ZB+1.3; player.position.set(-5.7,player.position.y,lyz); npc.position.set(5.7,npc.position.y,lyz);
    player.rotation.y=lerpAngle(player.rotation.y,.38,1-Math.exp(-dt*6)); npc.rotation.y=lerpAngle(npc.rotation.y,-.38,1-Math.exp(-dt*6));
    pose(player,false,dt); pose(npc,false,dt);
  }
  updateLights(dt,now); fxUpdate(dt,now,moving); if(state==='explore') clampPlayer(npc.position);
  var rs0=(ROLE==='host'&&linked&&state==='explore'&&!ringBusy); if(rs0!==ringShown){ ringShown=rs0; $('tRing').hidden=!rs0; }

  var fovT=baseFov;
  if(state==='intro'){ var tt=now*.00012; wantPos.set(Math.sin(tt)*4.5,4.4,9.6); wantLook.set(0,2.2,-14); }
  else if(state!=='explore'){
    fovT=baseFov*.78;
    if(state==='cinematic'&&cine.stage===0){ wantPos.set(player.position.x+2.8,1.9,player.position.z+4.4); wantLook.set(0,1.3,-36.6); fovT=baseFov; }
    else if(letterOn){ fovT=baseFov; var lvw=letMaxW()/1400*8.2*1.1, ldd=Math.max(9.5,lvw/(2*Math.tan(baseFov*Math.PI/360)*camera.aspect)); wantPos.set(0,2.3,Math.min(ZF-.5,ZB+.1+ldd)); wantLook.set(0,2.5,ZB); }
    else if(hug.on||hostYes){ joyT+=dt; var psi=1.25+joyT*.3, sp0=(hug.on&&carry.on)?carry.th:((hostYes&&rem.c)?npc.rotation.y-Math.PI:0), oa=1.2+joyT*.42+sp0; wantPos.set(Math.sin(oa)*3.7,1.5+Math.sin(joyT*.5)*.1,-37.2+Math.cos(oa)*3.7); wantLook.set(0,1.55,-37.2); }
    else { wantPos.set(3.4+Math.sin(now*.0004)*.25,1.2,-36.55+Math.cos(now*.0003)*.18); wantLook.set(0,1.12,-36.65); }
  } else {
    var cp=Math.cos(camPitch), px=player.position.x, pz2=player.position.z, cx=px+Math.sin(camYaw)*cp*camDist, cy=1.4+Math.sin(camPitch)*camDist, cz=pz2+Math.cos(camYaw)*cp*camDist;
    if(px<-W/2-.3){ wantPos.set(clampN(cx,-20.5,-13.7),clampN(cy,.5,3.4),camRZ(cz,pz2)); }
    else if(px>W/2+.3){ wantPos.set(clampN(cx,13.7,20.5),clampN(cy,.5,3.4),camRZ(cz,pz2)); }
    else wantPos.set(clampN(cx,-(W/2-.5),W/2-.5),clampN(cy,.5,H-.6),clampN(cz,-41.4,ZF-.4));
    wantLook.set(px-Math.sin(camYaw)*2,1.3,pz2-Math.cos(camYaw)*2);
  }
  var k=1-Math.exp(-dt*(state==='explore'?8:((hug.on||hostYes)?5:2.4))); camPos.lerp(wantPos,k); camLook.lerp(wantLook,k);
  camera.position.copy(camPos); camera.lookAt(camLook);
  if(Math.abs(camera.fov-fovT)>.02){ camera.fov+=(fovT-camera.fov)*Math.min(1,dt*2.5); camera.updateProjectionMatrix(); }

  dkTick(dt,now);
  renderer.render(scene,camera);
  if(recX){ recX.drawImage(canvas,0,0,recC.width,recC.height); drawOverlays(recX,recC.width,recC.height); overlayText(recX,recC.width,recC.height); }
  placeOverlays();
  requestAnimationFrame(frame);
}
function resize(){
  var w=stage.clientWidth||innerWidth,h=stage.clientHeight||innerHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; baseFov=w/h<1?74:58; camera.fov=baseFov; camera.updateProjectionMatrix();
  var dpr=window.devicePixelRatio||1; cc.width=Math.round(w*dpr); cc.height=Math.round(h*dpr); fwc.width=cc.width; fwc.height=cc.height;
}
window.addEventListener('resize',resize); resize();

/* ---------- Config -> scene, and language ---------- */
function loadImg(src){ return new Promise(function(res){ if(!src) return res(null); var im=new Image(); im.onload=function(){ res(im); }; im.onerror=function(){ res(null); }; im.src=src; }); }
function applyI18n(){
  if(typeof refreshExtra==='function') refreshExtra();
  document.documentElement.lang=LANG; document.documentElement.dir=LANG==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i]').forEach(function(e){ e.textContent=t(e.getAttribute('data-i')); });
  $('langBtn').textContent=t('lang'); $('capBtn').textContent=t('look'); $('capOpen').textContent=t('open'); $('exitQ').textContent=t('exitQ'); $('exitStay').textContent=t('stay'); $('exitGo').textContent=t('leave'); $('capListen').textContent=t('listen');
  $('hudShot').textContent=t('shot'); $('askShot').textContent=t('shot'); updateRecBtns();
  $('yes').textContent=t('yes'); $('no').textContent=t('no'); $('askBack').textContent=t('back'); $('letGo').textContent=t('cont'); $('letVoice').textContent=t('letVoice');
  $('gbTitle').textContent=t('gTitle'); $('gbText').placeholder=t('gPlace'); $('gbAdd').textContent=t('gAdd'); $('gbClose').textContent=t('close');
  hint.textContent=isTouch?t('hintT'):t('hintD');
  if(state==='intro'&&$('enter').disabled===false) $('pct').textContent=t('ready')+'100%';
}
function applyCfg(){
  $('introTitle').textContent=C('title'); $('introFrom').textContent=C('from'); $('introTo').textContent=C('to');
  $('brand').innerHTML=''; $('brand').appendChild(document.createTextNode(C('title')));
  var sm=document.createElement('small'); sm.textContent=C('from')+'  →  '+C('to'); $('brand').appendChild(sm);
  document.title=C('title'); tags.me.label.textContent=C(ROLE==='host'?'from':'to'); tags.npc.label.textContent=C(ROLE==='host'?'to':'from');
  drawScreen(); drawSecret(); drawCoupon(); drawObs(); if(typeof drawFeature==='function') drawFeature();
  syncCinemaVideo();
  var jobs=galleryFrames.map(function(f,i){ return loadImg(cfg.photos[i]).then(function(im){ f.img=im; drawFrame(i); drawPlaque(i); setupVideo(i); }); });
  galleryFrames.forEach(function(f,i){ coverArt(i); });
  return Promise.all(jobs);
}
function setLang(l){
  LANG=l; try{ localStorage.setItem('ourMuseum.lang',l); }catch(e){}
  applyI18n(); applyCfg(); if(!$('editor').hidden) openEditor();
}
$('langBtn').addEventListener('click',function(){ setLang(LANG==='ar'?'en':'ar'); });

/* ---------- Loading screen ---------- */
var progress=0, loaded=false;
if(IS_GIFT||JOIN) $('customize').hidden=true;
applyI18n(); if(!NO3D) $('pct').textContent=t('prep')+'0%';
$('enter').addEventListener('click',function(){ if(state!=='intro') return; if(!MUSEUM_MODE&&!IS_GIFT&&!ROLE&&!JOIN){ location.href='museum.html'; return; } startExplore(); });

