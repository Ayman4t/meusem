/* Observatory wing, love plane, garden */
'use strict';

/* ===== NEW WING: the Observatory (right side of the hall) ===== */
var obsCv=document.createElement('canvas'), obsTex=null, obsRings=[], obsOrbs=[], obsStars=null, obsWish=0;
(function(){
  var X0=13,X1=21,Z0=-19.5,Z1=-13.5,cx=17,cz=-16.5,h=4;
  var nm=new THREE.MeshStandardMaterial({color:0x1b1a46,roughness:.95,side:THREE.DoubleSide});
  function pl(w,hh,m,x,y,z,rx,ry){ var p=new THREE.Mesh(new THREE.PlaneGeometry(w,hh),m); p.position.set(x,y,z); p.rotation.set(rx||0,ry||0,0); scene.add(p); return p; }
  pl(8,6,new THREE.MeshStandardMaterial({color:0x14122e,roughness:.4,metalness:.2}),cx,.008,cz,-Math.PI/2,0);
  /* rug removed */
  pl(8,6,new THREE.MeshBasicMaterial({map:gTex(512,512,function(x,w,hh){ var g=x.createLinearGradient(0,0,w,hh); g.addColorStop(0,'#0b0a24'); g.addColorStop(.5,'#2a1a5e'); g.addColorStop(1,'#0b0a24'); x.fillStyle=g; x.fillRect(0,0,w,hh); x.strokeStyle='rgba(200,170,255,.14)'; x.lineWidth=70; x.beginPath(); x.moveTo(0,hh*.8); x.bezierCurveTo(w*.3,hh*.2,w*.7,hh*.9,w,hh*.2); x.stroke(); for(var i=0;i<420;i++){ x.fillStyle='rgba(255,255,255,'+(.3+Math.random()*.7).toFixed(2)+')'; var r=Math.random()<.06?2.2:1.1; x.fillRect(Math.random()*w,Math.random()*hh,r,r); } }),side:THREE.DoubleSide}),cx,h,cz,Math.PI/2,0);
  pl(Z1-Z0,h,nm,X1,h/2,cz,0,-Math.PI/2); pl(X1-X0,h,nm,cx,h/2,Z0,0,0); pl(X1-X0,h,nm,cx,h/2,Z1,0,Math.PI);
  /* heart-constellation map on the east wall */
  
  /* doorway trim + glow so it calls to you from the hall */
  bxm(.3,.22,2.8,W/2-.1,3.7,DOORZ,gold); bxm(.3,3.6,.2,W/2-.1,1.8,DOORZ-1.3,gold); bxm(.3,3.6,.2,W/2-.1,1.8,DOORZ+1.3,gold);
  scene.add(glow('150,160,255',3.2,W/2-.6,3.3,DOORZ,.7)); var dl=new THREE.PointLight(0x8a90ff,.8,12); dl.position.set(cx,3,cz); scene.add(dl); var wl=new THREE.PointLight(0xffc27a,.6,6); wl.position.set(cx,2.2,cz); scene.add(wl);
  /* armillary sphere on a pedestal */
  var ped=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,.9,24),new THREE.MeshStandardMaterial({color:0xe9e2d8,roughness:.5})); ped.position.set(cx,.45,cz);
  var ag=new THREE.Group(); ag.position.set(cx,1.75,cz);
  [[0,0],[1.2,0],[0,1.2],[.8,.8]].forEach(function(r,i){ var t=new THREE.Mesh(new THREE.TorusGeometry(.5+i*.07,.012,8,72),gold); t.rotation.set(r[0],r[1],0); ag.add(t); obsRings.push(t); });
  var core=new THREE.Mesh(new THREE.SphereGeometry(.17,20,14),new THREE.MeshBasicMaterial({color:0xffb0c8})); ag.add(core); ag.add(glow('255,170,200',1.6,0,0,0,.9));
  for(var i=0;i<7;i++){ var o=glow('255,235,180',.3,0,0,0,1); ag.add(o); obsOrbs.push({o:o,a:i/7*6.2832,r:.62+(i%3)*.1,y:(i%2?1:-1)*.2}); }
  /* telescope + floor poufs */
  var br=new THREE.MeshStandardMaterial({color:0xb08a3e,roughness:.35,metalness:.6}), tg=new THREE.Group(); tg.position.set(19.5,0,-18.3);
  [[.35,0],[-.2,.3],[-.2,-.3]].forEach(function(p){ var l=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.25,6),br); l.position.set(p[0]*.5,.62,p[1]*.5); l.rotation.set(p[1]*.5,0,-p[0]*.5); tg.add(l); });
  var tb=new THREE.Mesh(new THREE.CylinderGeometry(.1,.15,1.6,16),new THREE.MeshStandardMaterial({color:0xe9e2d8,roughness:.4,metalness:.3})); tb.position.set(-.1,1.45,0); tb.rotation.z=.75; tg.add(tb);
  [[15.2,-18.1],[15.3,-15],[18.8,-14.6]].forEach(function(p,i){ var c=new THREE.Mesh(new THREE.CylinderGeometry(.42,.46,.34,20),new THREE.MeshStandardMaterial({color:[0x8e3347,0x4a3f9a,0xb06a7a][i],roughness:.95})); c.position.set(p[0],.17,p[1]); });
  /* sofa facing the TV on the east wall (sit with the usual sit button) */
  (function(){ var sx=17.8, sz=cz, sofaM=new THREE.MeshStandardMaterial({color:0x3a2f6e,roughness:.9}), cushM=new THREE.MeshStandardMaterial({color:0x8e3347,roughness:.95});
    function sb(w,hh,d,x,y,z,m){ var b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),m); b.position.set(x,y,z); scene.add(b); return b; }
    sb(.9,.4,3.6,sx,.2,sz,sofaM); sb(.76,.1,3.3,sx+.02,.45,sz,cushM);
    sb(.22,.75,3.6,sx-.4,.78,sz,sofaM); sb(.9,.62,.2,sx,.5,sz-1.7,sofaM); sb(.9,.62,.2,sx,.5,sz+1.7,sofaM);
    COLL.push({x0:sx-.45,x1:sx+.45,z0:sz-1.8,z1:sz+1.8}); BZ.push([sx,sz,Math.PI/2]); })();
  /* ceiling stars that twinkle */
  var a=[]; for(i=0;i<260;i++) a.push(X0+.2+Math.random()*(X1-X0-.4),h-.04,Z0+.2+Math.random()*(Z1-Z0-.4)); 
})();
function drawObs(){ if(!obsTex) return; var x=obsCv.getContext('2d'), w=1000, h=520, i, P=[];
  x.fillStyle='#0d0b26'; x.fillRect(0,0,w,h); x.strokeStyle='#c9a35a'; x.lineWidth=6; x.strokeRect(20,20,w-40,h-40);
  for(i=0;i<70;i++){ x.fillStyle='rgba(255,255,255,'+(.2+((i*37)%10)/14).toFixed(2)+')'; x.fillRect(40+(i*173)%920,40+(i*89)%440,2,2); }
  for(i=0;i<14;i++){ var u=i/14*6.2832; P.push([w/2+16*Math.pow(Math.sin(u),3)*9,232-(13*Math.cos(u)-5*Math.cos(2*u)-2*Math.cos(3*u)-Math.cos(4*u))*9]); }
  x.strokeStyle='rgba(232,192,122,.75)'; x.lineWidth=2; x.beginPath(); P.forEach(function(p,j){ j?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]); }); x.closePath(); x.stroke();
  x.shadowColor='#ffe2a8'; x.shadowBlur=16; x.fillStyle='#fff4d6'; P.forEach(function(p){ x.beginPath(); x.arc(p[0],p[1],5,0,6.3); x.fill(); }); x.shadowBlur=0;
  x.textAlign='center'; x.fillStyle='#f4f0ea'; x.font='italic 600 58px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  x.fillText(LANG==='ar'?'سمانا':'Our Sky',w/2,100); x.font='italic 500 38px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillStyle='#e8c07a';
  x.fillText(LANG==='ar'?'كل نجمة هنا لحظة معاكي ✦':'every star here is a moment with you ✦',w/2,455); obsTex.needsUpdate=true; }
function obsTick(s,dt){ if(gardenOn||!obsStars) return;
  obsRings.forEach(function(r,i){ r.rotation.y+=dt*(.25+i*.12); r.rotation.x+=dt*.1*(i%2?1:-1); });
  obsOrbs.forEach(function(d,i){ var a=d.a+s*(.6+i*.05); d.o.position.set(Math.cos(a)*d.r,d.y+Math.sin(s+i)*.08,Math.sin(a)*d.r); });
  obsStars.material.opacity=.6+.4*Math.sin(s*2.3);
  if(state==='explore'){ var p=player.position; if(Math.hypot(p.x-17,p.z+16.5)<1.7){ if(obsWish<=0){ obsWish=40; toast(LANG==='ar'?'اتمنّي أمنية ⭐':'make a wish ⭐',2600); heartsAt(17,1.2,-16.5,14,1.6); chime([88,91,95],.12,.1); } } else if(obsWish>0) obsWish-=dt; } }
drawObs();

/* 1. sunset garden for the proposal */
function buildGarden(G){
  function add(o,x,y,z){ o.position.set(x,y,z); G.add(o); return o; }
  var sky=add(new THREE.Mesh(new THREE.SphereGeometry(95,32,16),new THREE.MeshBasicMaterial({map:gTex(512,256,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h*.5); [[0,'#1b1147'],[.35,'#5a2a86'],[.65,'#c9508f'],[.85,'#ff8f7a'],[1,'#ffd29a']].forEach(function(s){ g.addColorStop(s[0],s[1]); }); x.fillStyle=g; x.fillRect(0,0,w,h*.5); x.fillStyle='#ffd29a'; x.fillRect(0,h*.5,w,h*.5);
    for(var i=0;i<140;i++){ x.fillStyle='rgba(255,255,255,'+(Math.random()*.8).toFixed(2)+')'; x.fillRect(Math.random()*w,Math.random()*h*.25,1.6,1.6); } for(i=0;i<22;i++){ x.fillStyle='rgba(255,170,190,.28)'; x.beginPath(); x.ellipse(Math.random()*w,h*(.2+Math.random()*.25),30+Math.random()*50,3+Math.random()*4,0,0,6.3); x.fill(); } }),side:THREE.BackSide,fog:false,depthWrite:false})),0,0,-37); sky.renderOrder=-2;
  var gl1=glow('255,190,120',70,-85,7,-37,.9), gl2=glow('255,245,210',14,-85,6,-37,1); G.add(gl1); G.add(gl2);
  /* real sunset photo (embedded) as a soft-edged backdrop panel behind the sea. Override with window.SUNSET_PHOTO / SUNSET_HORIZON. */
  (function(){
    var im=new Image(), HZ=window.SUNSET_HORIZON||.56;
    im.onload=function(){
      var w=im.naturalWidth, h=im.naturalHeight, cv=document.createElement('canvas'), x=cv.getContext('2d'), g;
      cv.width=w; cv.height=h; x.drawImage(im,0,0); x.globalCompositeOperation='destination-in';
      g=x.createLinearGradient(0,0,w,0); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.22,'#000'); g.addColorStop(.78,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,w,h);
      g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.28,'#000'); g.addColorStop(1,'#000'); x.fillStyle=g; x.fillRect(0,0,w,h);
      var tx=new THREE.CanvasTexture(cv); tx.anisotropy=4;
      var R=88, arc=Math.PI*70/180, Hh=R*arc*(h/w)*1.25, c=-Math.PI*2/3;
      var m=new THREE.Mesh(new THREE.CylinderGeometry(R,R,Hh,48,1,true,c-arc/2,arc),new THREE.MeshBasicMaterial({map:tx,side:THREE.BackSide,transparent:true,fog:false,depthWrite:false,toneMapped:false}));
      m.position.set(0,Hh*(HZ-.5),-37); m.renderOrder=-1; G.add(m); gl1.visible=false; gl2.visible=false;
    };
    im.src=window.SUNSET_PHOTO||SUNSET_PHOTO_DEFAULT;
  })();
  var seaT=gTex(256,64,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#3a2f7a'); g.addColorStop(.5,'#ff9a8a'); g.addColorStop(1,'#3a2f7a'); x.fillStyle=g; x.fillRect(0,0,w,h); for(var i=0;i<60;i++){ x.fillStyle='rgba(255,240,210,'+(.2+Math.random()*.5)+')'; x.fillRect(Math.random()*w,h*(.3+Math.random()*.4),10+Math.random()*30,1.5); } });
  seaT.wrapS=seaT.wrapT=THREE.RepeatWrapping; seaT.repeat.set(6,1); gSea=add(new THREE.Mesh(new THREE.PlaneGeometry(92,146),new THREE.MeshBasicMaterial({map:seaT})),-59,-.25,-37); gSea.rotation.x=-Math.PI/2;
  var sand=add(new THREE.Mesh(new THREE.PlaneGeometry(80,110),new THREE.MeshStandardMaterial({color:0xe3bfa6,roughness:1})),27,0,-37); sand.rotation.x=-Math.PI/2;
  var wet=add(new THREE.Mesh(new THREE.PlaneGeometry(2.2,110),new THREE.MeshStandardMaterial({color:0xa8808f,roughness:.5})),-12,.01,-37); wet.rotation.x=-Math.PI/2;
  gFoam=add(new THREE.Mesh(new THREE.PlaneGeometry(.9,110),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})),-13.2,.03,-37); gFoam.rotation.x=-Math.PI/2;
  /* flower arch */
  var ag=add(new THREE.Group(),-1.7,0,-36.6), flM=FC.map(flMat);
  for(var i=0;i<150;i++){ var t=Math.random(), z,y; if(t<.3){ z=-1.9; y=Math.random()*1.4; } else if(t<.6){ z=1.9; y=Math.random()*1.4; } else { var a=Math.random()*Math.PI; z=Math.cos(a)*1.9; y=1.4+Math.sin(a)*1.9; }
    var lf=Math.random()<.4, m=new THREE.Mesh(new THREE.SphereGeometry(lf?.13:.09+Math.random()*.06,8,6),lf?leafM:flM[i%5]); m.position.set((Math.random()-.5)*.3,y+(Math.random()-.5)*.2,z+(Math.random()-.5)*.2); if(lf) m.scale.set(1,.6,1.4); ag.add(m); }
  var fa=[]; for(i=0;i<70;i++){ var u=i/69*Math.PI*2.4-Math.PI*.2; fa.push(-.1,u<Math.PI?1.4+Math.sin(u)*1.9:Math.max(.1,1.4+Math.sin(u)*1.9),Math.cos(u)*1.9); } pts(fa,.2,'255,225,170',1,ag); ag.add(glow('255,200,140',4,0,3.2,0,.45));
  /* lanterns on posts */
  var darkM=new THREE.MeshStandardMaterial({color:0x3a2a30,roughness:.8});
  for(var j=0;j<14;j++){ var a2=j/14*Math.PI*2+.3, r2=6+(j%3)*2.2, lx=Math.max(-9,Math.cos(a2)*r2*1.3+2), lz=-37+Math.sin(a2)*r2, pk=j%2, lan;
    add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,2.6,6),darkM),lx,1.3,lz); lan=add(new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),new THREE.MeshBasicMaterial({color:pk?0xff9ab0:0xffc27a})),lx,2.75,lz); lan.scale.y=1.25; G.add(glow(pk?'255,130,170':'255,190,110',1.9,lx,2.75,lz,.85)); }
  for(j=0;j<16;j++){ var fl=glow(j%2?'255,170,120':'255,150,190',1.3,-60+Math.random()*75,4+Math.random()*16,-75+Math.random()*75,.9); G.add(fl); gLan.push(fl); }
  /* bushes with flowers, falling petals, lights */
  for(j=0;j<9;j++){ var bx2=6+Math.random()*10, bz=-37+(Math.random()<.5?-1:1)*(6+Math.random()*10), b=add(new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:0x3e6a52,roughness:1})),bx2,.5,bz); b.scale.set(1.2,.7,1.2);
    for(var k=0;k<7;k++){ var fm=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),flM[k%5]); fm.position.set(bx2+(Math.random()-.5)*1.8,.7+Math.random()*.4,bz+(Math.random()-.5)*1.8); G.add(fm); } }
  var pm=[0xffa6c0,0xfff0f4].map(function(c){ return new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,fog:false}); });
  for(j=0;j<80;j++){ var p=new THREE.Mesh(new THREE.CircleGeometry(.09,8),pm[j%2]); p.scale.y=1.6; p.position.set(-9+Math.random()*18,Math.random()*7,-46+Math.random()*18); p.userData={v:.25+Math.random()*.3,f:.8+Math.random()*1.5,ph:Math.random()*6}; G.add(p); gPetals.push(p); }
  add(new THREE.PointLight(0xffb07a,1.1,20),-3,3.4,-38.5); add(new THREE.PointLight(0xff8fb8,.8,16),3.5,2.6,-33.5);
}
function enterGarden(){ if(gardenOn) return; gardenOn=true; document.body.classList.add('garden');
  var keep=[player,npc,pinkLight,amb,hemi].concat(hearts,pool), G=new THREE.Group();
  scene.children.slice().forEach(function(c){ if(keep.indexOf(c)<0) c.visible=false; }); buildGarden(G); scene.add(G);
  var T=LIGHTS[lightMode]; T.amb=.62; T.ambC=0xffd9e4; T.hemi=.55; hemi.color.set(0xffc4d8); hemi.groundColor.set(0x6a4a6a);
  camPos.set(2.9,1.05,-34.8); camLook.set(0,1.15,-36.5); }

/* ---------- A little plane pulling an "I love you" banner across the sunset sky ---------- */
var PLANE_SVG='<svg viewBox="0 0 124 62" aria-hidden="true"><path d="M2 30 L14 30" stroke="#fff6f0" stroke-width="2"/><polygon points="14,31 26,9 36,9 33,31" fill="#ff8da5"/><ellipse cx="66" cy="35" rx="44" ry="13" fill="#fff6f0"/><path d="M22 35 Q66 20 108 33 L108 38 Q66 50 22 40Z" fill="#ffe3ea" opacity=".9"/><path d="M96 25 Q112 26 110 36 Q108 44 96 45Z" fill="#e8506b"/><rect x="44" y="26" width="30" height="3" rx="1.5" fill="#e8506b"/><ellipse cx="82" cy="29" rx="9" ry="6" fill="#bfe3ff" stroke="#fff" stroke-width="1.5"/><path d="M52 37 L78 37 L92 54 L62 54Z" fill="#ff8da5"/><path d="M50 30 L74 30 L66 12 L52 12Z" fill="#ffb3c4" opacity=".85"/><g class="prop"><ellipse cx="108" cy="34" rx="2.6" ry="15" fill="#c2284a" opacity=".85"/></g><circle cx="108" cy="34" r="3.2" fill="#ffd6df"/></svg>';
var planeBusy=false;
function launchPlane(){
  var host=$('loveFlight'); if(!host||planeBusy||!gardenOn) return; planeBusy=true;
  var el=document.createElement('div'); el.className='fl';
  var cloth=document.createElement('div'); cloth.className='cloth'; cloth.textContent=(LANG==='ar'?'بحبك ':'I love you ')+C('to')+' \u2665';
  var rope=document.createElement('div'); rope.className='rope';
  var pl=document.createElement('div'); pl.innerHTML=PLANE_SVG; pl.style.display='flex';
  el.appendChild(cloth); el.appendChild(rope); el.appendChild(pl); host.appendChild(el);
  var W=host.clientWidth||innerWidth, dur=Math.max(9000,Math.min(15000,W*9));
  var fly=el.animate([{transform:'translate3d(-100%,0,0)'},{transform:'translate3d('+W+'px,0,0)'}],{duration:dur,easing:'linear',fill:'forwards'});
  var bob=el.firstChild.animate([{transform:'translateY(0)'},{transform:'translateY(-9px)'},{transform:'translateY(0)'}],{duration:2600,iterations:Infinity,easing:'ease-in-out'});
  playReal('whoosh',.18);
  fly.onfinish=function(){ bob.cancel(); el.remove(); planeBusy=false; };
}
function startPlanes(){ setTimeout(launchPlane,2200); setInterval(function(){ if(state==='accepted'||state==='done') launchPlane(); },16000); }

function fxUpdate(dt,now,moving){ var s=now*.001; obsTick(s,dt); roomsTick(dt,now); updateFlowerAvailability(); if(npcR&&state==='explore') applyReact(npc,npcR,dt,false);
  emEl.hidden=!(state==='explore'&&!hud.hidden);
  if(seat&&(keys.up||keys.down||keys.left||keys.right||Math.hypot(joy.x,joy.y)>.25)) standUp();
  if(!gardenOn){
    halos.forEach(function(h,i){ h.material.opacity=.7+.3*Math.sin(s*1.2+i); });
    twA.material.opacity=.55+.45*Math.sin(s*2.1); twB.material.opacity=.55+.45*Math.sin(s*2.1+3);
    pSets.forEach(function(d){ var a=d.p.geometry.attributes.position, A=a.array; for(var i=0;i<A.length;i+=3){ A[i]+=d.v[i]*dt; A[i+1]+=d.v[i+1]*dt; A[i+2]+=d.v[i+2]*dt; if(A[i+1]>7) A[i+1]=.3; if(A[i]>12.5) A[i]=-12.5; if(A[i]<-12.5) A[i]=12.5; } a.needsUpdate=true; d.p.material.opacity=d.o*(.75+.25*Math.sin(s*3+d.ph)); });
    flames.forEach(function(f,i){ f.material.opacity=.7+.3*Math.sin(s*9+i*2.3)*Math.sin(s*5.1+i); });
  } else {
    scene.fog.color.set(0xf2a58f); scene.fog.near=45; scene.fog.far=130; scene.background.set(0xf2a58f);
    gPetals.forEach(function(p){ var d=p.userData; p.position.y-=d.v*dt; p.position.x+=Math.sin(s*d.f+d.ph)*.6*dt; p.rotation.z+=dt*d.f; p.rotation.x+=dt*.7; if(p.position.y<0) p.position.y=7; });
    gLan.forEach(function(l,i){ l.position.y+=.22*dt; l.position.x+=Math.sin(s*.3+i)*.2*dt; if(l.position.y>22) l.position.y=4; });
    gSea.material.map.offset.x=(s*.01)%1; gFoam.material.opacity=.35+.25*Math.sin(s*1.3);
    if(state==='accepted'&&!fxYes){ fxYes=1; startPlanes(); emote('me','💕'); setTimeout(function(){ emote('npc','💕'); },700); setInterval(function(){ if(state==='accepted'||state==='done') heartsAt(0,1.6,-36.6,4,1.6); },900); } }
  if(!gardenOn||state!=='explore'){} fxAcc+=dt;
  var sp2=Math.hypot(vx,vz); if(moving&&state==='explore'&&!seat&&sp2>3.4&&fxAcc>.045){ fxAcc=0; var pp=player.position, dx=-vx/sp2, dz=-vz/sp2, sd=(Math.random()<.5?-1:1)*.12; for(var q=0;q<2;q++) emit(DUSTT,false,pp.x+dx*(.22+Math.random()*.25)-dz*sd,.05+Math.random()*.1,pp.z+dz*(.22+Math.random()*.25)+dx*sd,.22+Math.random()*.22,.7+Math.random()*.5,.18+Math.random()*.15,dx*.4+(Math.random()-.5)*.3); }
  pool.forEach(function(sp){ var d=sp.userData; if(d.t>=d.l) return; d.t+=dt; var k=d.t/d.l; if(k>=1){ sp.visible=false; sp.material.opacity=0; return; } sp.position.y+=d.vy*dt; sp.position.x+=d.vx*dt; sp.scale.setScalar(d.sc*(1+.4*k)); sp.material.opacity=Math.min(1,k*8)*(1-k); });
  var w=stage.clientWidth,h=stage.clientHeight, nowMs=performance.now();
  emotes=emotes.filter(function(e){ if(nowMs-e.t>2300){ e.el.remove(); return false; } var av=tags[e.key].av, hs=av.userData.sc/.82; tmpV.set(av.position.x,av.position.y+2.75*hs,av.position.z).project(camera);
    if(tmpV.z>1||Math.abs(tmpV.x)>1.2||letterOn){ e.el.style.visibility='hidden'; } else { e.el.style.visibility='visible'; e.el.style.transform='translate('+((tmpV.x*.5+.5)*w).toFixed(1)+'px,'+((-tmpV.y*.5+.5)*h).toFixed(1)+'px) translate(-50%,-100%)'; } return true; });
}

