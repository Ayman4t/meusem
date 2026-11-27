/* Three.js scene, hall, TV and exit door */
'use strict';

/* ---------- Three.js scene ---------- */
var NO3D=!window.THREE;
if(NO3D) $('pct').textContent='3D engine failed to load. Check your connection and reload.';
var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
var scene=new THREE.Scene();
scene.background=new THREE.Color(0x1a0d14);
scene.fog=new THREE.Fog(0x1a0d14,30,95);
var camera=new THREE.PerspectiveCamera(58,1,0.4,110), baseFov=58;

var W=26,H=5,ZF=10,ZB=-42,L=ZF-ZB,ZC=(ZF+ZB)/2;
var DOORZ=-16.5, DOORZ2=-25.5, ROOM={x0:-21,x1:-13,z0:-19.5,z1:-13.5,h:4};

var amb=new THREE.AmbientLight(0xfff8ee,.36); scene.add(amb);
var hemi=new THREE.HemisphereLight(0xfff4e6,0x2a2630,.28); scene.add(hemi);
var hallLights=[];
[[-8,2],[8,2],[-8,-18],[8,-18],[0,-36]].forEach(function(p){
  var l=new THREE.PointLight(0xffd2cc,.22,26); l.position.set(p[0],H-.8,p[1]); scene.add(l); hallLights.push(l);
});
var roomLight=new THREE.PointLight(0xffc7a0,.9,12); roomLight.position.set(-17,3.2,DOORZ); scene.add(roomLight);

function canvasTex(c){ var tx=new THREE.CanvasTexture(c); tx.anisotropy=4; return tx; }
function gTex(w,h,fn){ var c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return canvasTex(c); }

/* floor: large beige gallery tiles */
(function(){
  var c=document.createElement('canvas'); c.width=512; c.height=512; var x=c.getContext('2d');
  x.fillStyle='#dcc4bf'; x.fillRect(0,0,512,512);
  var g=x.createLinearGradient(0,0,512,512); g.addColorStop(0,'rgba(255,255,255,.10)'); g.addColorStop(1,'rgba(90,80,60,.10)'); x.fillStyle=g; x.fillRect(0,0,512,512);
  for(var n=0;n<900;n++){ x.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'110,100,80')+','+(Math.random()*.035)+')'; x.fillRect(Math.random()*512,Math.random()*512,2+Math.random()*10,1+Math.random()*3); }
  x.fillStyle='rgba(70,60,45,.55)'; x.fillRect(0,0,512,4); x.fillRect(0,0,4,512);
  var tx=canvasTex(c); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.anisotropy=8; tx.repeat.set(W/2.4,L/2.4);
  var m=new THREE.Mesh(new THREE.PlaneGeometry(W,L),new THREE.MeshStandardMaterial({map:tx,roughness:.62,metalness:0}));
  m.rotation.x=-Math.PI/2; m.position.set(0,0,ZC); scene.add(m);
})();

var wallMat=new THREE.MeshStandardMaterial({color:0xe6cdcf,roughness:1});
var wallMat2=new THREE.MeshStandardMaterial({color:0xe6cdcf,roughness:1,side:THREE.DoubleSide});
var ceilTex=(function(){ var c=document.createElement('canvas'); c.width=c.height=256; var x=c.getContext('2d'); x.fillStyle='#86606b'; x.fillRect(0,0,256,256); x.fillStyle='#3a272e'; x.fillRect(0,0,256,7); x.fillRect(0,0,7,256); x.fillStyle='rgba(255,255,255,.06)'; x.fillRect(9,9,238,238); var t=canvasTex(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(W/1.8,L/1.8); return t; })();
var ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,L),new THREE.MeshStandardMaterial({map:ceilTex,color:0xffffff,roughness:1,emissive:0x2c1a21}));
ceil.rotation.x=Math.PI/2; ceil.position.set(0,H,ZC); scene.add(ceil);
/* left wall has a doorway to the secret room */
(function(){
  var dh=3.6, hw=1.2, lx=ZC-DOORZ, s=new THREE.Shape();
  s.moveTo(-L/2,-H/2); [lx,ZC-DOORZ2].forEach(function(q){ s.lineTo(q-hw,-H/2); s.lineTo(q-hw,-H/2+dh); s.lineTo(q+hw,-H/2+dh); s.lineTo(q+hw,-H/2); }); s.lineTo(L/2,-H/2); s.lineTo(L/2,H/2); s.lineTo(-L/2,H/2); s.lineTo(-L/2,-H/2);
  var m=new THREE.Mesh(new THREE.ShapeGeometry(s),wallMat2); m.rotation.y=Math.PI/2; m.position.set(-W/2,H/2,ZC); scene.add(m);
})();
var wr=(function(){ var dh=3.6,hw=1.2,lx=DOORZ-ZC,sh=new THREE.Shape(); sh.moveTo(-L/2,-H/2); [DOORZ2-ZC,lx].forEach(function(q){ sh.lineTo(q-hw,-H/2); sh.lineTo(q-hw,-H/2+dh); sh.lineTo(q+hw,-H/2+dh); sh.lineTo(q+hw,-H/2); }); sh.lineTo(L/2,-H/2); sh.lineTo(L/2,H/2); sh.lineTo(-L/2,H/2); sh.lineTo(-L/2,-H/2); var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),wallMat2); m.rotation.y=-Math.PI/2; m.position.set(W/2,H/2,ZC); scene.add(m); return m; })();
var we=new THREE.Mesh(new THREE.PlaneGeometry(W,H),wallMat); we.position.set(0,H/2,ZB); scene.add(we);
var wb=new THREE.Mesh(new THREE.PlaneGeometry(W,H),wallMat); wb.rotation.y=Math.PI; wb.position.set(0,H/2,ZF); scene.add(wb);

/* trim, pilasters, ceiling lights, benches */
var stripMat=new THREE.MeshBasicMaterial({color:0xfff1dc});
(function(){
  var sm=new THREE.MeshStandardMaterial({color:0x2a292c,roughness:.7});
  function box(w,h,d,x,y,z,m){ var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); scene.add(b); return b; }
  box(.12,.26,L,W/2-.06,.13,ZC,sm);
  var zA=ZF-(ZF-(DOORZ+1.2))/2, lenA=ZF-(DOORZ+1.2); box(.12,.26,lenA,-(W/2-.06),.13,ZF-lenA/2,sm);
  var lenB=(DOORZ-1.2)-ZB; box(.12,.26,lenB,-(W/2-.06),.13,ZB+lenB/2,sm);
  [-1,1].forEach(function(s){ box(.2,.34,L,s*(W/2-.1),H-.17,ZC,sm); });
  var pm=new THREE.MeshStandardMaterial({color:0xcfc9c0,roughness:.9});
  
  var railM=new THREE.MeshStandardMaterial({color:0x0b0b0d,roughness:.6}), headM=new THREE.MeshStandardMaterial({color:0x0b0b0d,roughness:.4,metalness:.4}), lensM=new THREE.MeshBasicMaterial({color:0xfff1d6});
  [-1,1].forEach(function(sd){ box(.07,.05,L-1,sd*(W/2-1.5),H-.04,ZC,railM); });
  box(.07,.05,L-1,0,H-.04,ZC,railM);
  for(var z=ZF-1.5;z>ZB+1;z-=3){ [-1,1].forEach(function(sd){ var hd=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,.2,10),headM); hd.position.set(sd*(W/2-1.5),H-.17,z); hd.rotation.z=sd*.5; scene.add(hd); var ln=new THREE.Mesh(new THREE.CircleGeometry(.07,10),lensM); ln.position.set(sd*(W/2-1.5)-sd*.07,H-.25,z); ln.rotation.set(Math.PI/2,0,0); scene.add(ln); }); }
  for(var z2=ZF-3;z2>ZB+2;z2-=6){ var h2=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,.2,10),headM); h2.position.set(0,H-.17,z2); scene.add(h2); }
  var wood=new THREE.MeshStandardMaterial({color:0x3a3336,roughness:.6}), cush=new THREE.MeshStandardMaterial({color:0x7a3a4a,roughness:.9});
  [-3,-12,-21,-30].forEach(function(z){ [-1,1].forEach(function(s){ box(.8,.4,3.6,s*9.8,.2,z,wood); box(.7,.1,3.4,s*9.8,.45,z,cush); }); });
  /* doorway trim */
  var gm=new THREE.MeshStandardMaterial({color:0xd8d4cc,roughness:.8});
  box(.3,.22,2.8,-W/2+.1,3.7,DOORZ,gm); box(.3,3.6,.2,-W/2+.1,1.8,DOORZ-1.3,gm); box(.3,3.6,.2,-W/2+.1,1.8,DOORZ+1.3,gm);
})();

/* ---- hall details: runner rug, soft floor patches, plants, ceiling beams, cove glow, blob shadows ---- */
(function(){
  function blob(w,d,x,z,a){ var c=document.createElement('canvas'); c.width=c.height=64; var q=c.getContext('2d'), g=q.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(0,0,0,'+a+')'); g.addColorStop(1,'rgba(0,0,0,0)'); q.fillStyle=g; q.fillRect(0,0,64,64);
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:canvasTex(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); m.rotation.x=-Math.PI/2; m.position.set(x,.02,z); scene.add(m); return m; }
  /* soft warm / cool patches so the tile pattern stops repeating */
  (function(){ var c=document.createElement('canvas'); c.width=512; c.height=1024; var q=c.getContext('2d');
    for(var i=0;i<46;i++){ var x=Math.random()*512,y=Math.random()*1024,r=50+Math.random()*130,g=q.createRadialGradient(x,y,0,x,y,r),warm=Math.random()<.5; g.addColorStop(0,warm?'rgba(255,214,190,.20)':'rgba(120,90,110,.16)'); g.addColorStop(1,'rgba(0,0,0,0)'); q.fillStyle=g; q.fillRect(x-r,y-r,r*2,r*2); }
    var m=new THREE.Mesh(new THREE.PlaneGeometry(W,L),new THREE.MeshBasicMaterial({map:canvasTex(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); m.rotation.x=-Math.PI/2; m.position.set(0,.006,ZC); scene.add(m); })();
  /* runner rug down the middle of the hall */
  (function(){ var RW=3.4, RL=ZF-3-(ZB+10);
    var tx=gTex(256,1024,function(x,w,h){
      x.fillStyle='#7d2c43'; x.fillRect(0,0,w,h);
      x.strokeStyle='#e0b36a'; x.lineWidth=10; x.strokeRect(10,10,w-20,h-20); x.lineWidth=3; x.strokeRect(30,30,w-60,h-60);
      x.fillStyle='rgba(255,220,190,.16)'; for(var y=70;y<h-60;y+=96){ x.save(); x.translate(w/2,y); x.rotate(Math.PI/4); x.fillRect(-26,-26,52,52); x.restore(); x.fillStyle='rgba(224,179,106,.5)'; x.beginPath(); x.arc(w/2,y,7,0,7); x.fill(); x.fillStyle='rgba(255,220,190,.16)'; }
      for(var n=0;n<1400;n++){ x.fillStyle='rgba(255,255,255,'+Math.random()*.05+')'; x.fillRect(Math.random()*w,Math.random()*h,1,3); }
    });
    var m=new THREE.Mesh(new THREE.PlaneGeometry(RW,RL),new THREE.MeshStandardMaterial({map:tx,roughness:.95})); m.rotation.x=-Math.PI/2; m.position.set(0,.032,(ZF-3+ZB+10)/2); m.material.polygonOffset=true; m.material.polygonOffsetFactor=-4; m.material.polygonOffsetUnits=-4; scene.add(m);  /* sits clearly above the wider rug (1.4 cm) so the two never flicker */
    blob(RW+.7,RL+.7,0,m.position.z,.28); })();
  /* potted plants along both walls */
  var potM=new THREE.MeshStandardMaterial({color:0xb5654a,roughness:.8}), soilM=new THREE.MeshStandardMaterial({color:0x2a1c16,roughness:1});
  var leafA=new THREE.MeshStandardMaterial({color:0x3f7a4e,roughness:.75,side:THREE.DoubleSide}), leafB=new THREE.MeshStandardMaterial({color:0x5c9a63,roughness:.75,side:THREE.DoubleSide});
  var stemM=new THREE.MeshStandardMaterial({color:0x3a6b43,roughness:.8}), leafC=new THREE.MeshStandardMaterial({color:0x6aa86f,roughness:.75,side:THREE.DoubleSide});
  var UP=new THREE.Vector3(0,1,0);
  function plant(x,z,sc){ var g=new THREE.Group();
    /* pot: tapered body, lip and soil sitting just below the lip */
    var pot=new THREE.Mesh(new THREE.CylinderGeometry(.34,.25,.6,20),potM); pot.position.y=.3; g.add(pot);
    var rim=new THREE.Mesh(new THREE.CylinderGeometry(.37,.34,.09,20),potM); rim.position.y=.62; g.add(rim);
    var soil=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.05,20),soilM); soil.position.y=.6; g.add(soil);
    /* every leaf grows on a stem that starts inside the soil, so nothing floats */
    var N=14;
    for(var i=0;i<N;i++){
      var a=i/N*Math.PI*2+Math.random()*.5, tilt=.12+Math.random()*.6+(i%3===0?.25:0), stemLen=.35+Math.random()*.55, leafLen=.46+Math.random()*.22;
      var d=new THREE.Vector3(Math.sin(tilt)*Math.cos(a),Math.cos(tilt),Math.sin(tilt)*Math.sin(a)).normalize();
      var b=new THREE.Vector3(Math.cos(a)*.07,.58,Math.sin(a)*.07), tip=b.clone().add(d.clone().multiplyScalar(stemLen));
      var st=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,stemLen,6),stemM); st.position.copy(b).add(d.clone().multiplyScalar(stemLen/2)); st.quaternion.setFromUnitVectors(UP,d); g.add(st);
      var lf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),i%2?leafA:leafB); lf.scale.set(.15,leafLen/2,.04);
      lf.position.copy(tip).add(d.clone().multiplyScalar(leafLen/2*.92)); lf.quaternion.setFromUnitVectors(UP,d); lf.rotateY(Math.random()*Math.PI); g.add(lf);
    }
    g.position.set(x,0,z); g.rotation.y=Math.random()*6.28; g.scale.setScalar(sc||1); scene.add(g); blob(1.4*(sc||1),1.4*(sc||1),x,z,.3); }
  [8.2,-7.5,-14.2,-34.5,-39.5].forEach(function(z,i){ plant(-(W/2-1.1),z,1+(i%2)*.18); plant(W/2-1.1,z,1.12-(i%2)*.14); });
  /* shadows under the benches */
  [-3,-12,-21,-30].forEach(function(z){ [-1,1].forEach(function(sd){ blob(1.7,4.4,sd*9.8,z,.3); }); });
  /* ceiling: coffer beams + warm cove glow along the walls */
  var beamM=new THREE.MeshStandardMaterial({color:0x4a3238,roughness:.7});
  for(var z=ZF-3;z>ZB+2;z-=6){ var b=new THREE.Mesh(new THREE.BoxGeometry(W,.16,.34),beamM); b.position.set(0,H-.1,z); scene.add(b); }
  var cove=new THREE.MeshBasicMaterial({color:0xffcf9f,transparent:true,opacity:.75,fog:false});
  [-1,1].forEach(function(sd){ var c=new THREE.Mesh(new THREE.BoxGeometry(.1,.06,L-.6),cove); c.position.set(sd*(W/2-.5),H-.36,ZC); scene.add(c); });
})();

/* ---------- TV on the wall + exit door ---------- */
var tvCv=document.createElement('canvas'); tvCv.width=1280; tvCv.height=720; var tvTx=canvasTex(tvCv), tvIdx=0, tvFade=1, tvLast=0, tvVideo=null, tvVideoSrc='', TVPOS={x:W/2-.08,z:.6};
var DOORX=-5.5, EXITPOS={x:DOORX,z:ZF};
(function(){
  var blk=new THREE.MeshStandardMaterial({color:0x0e0d10,roughness:.4,metalness:.3});
  var g=new THREE.Group(); g.position.set(20.92,2.3,-16.5); g.rotation.y=-Math.PI/2; g.scale.setScalar(1.08); scene.add(g);
  var fr=new THREE.Mesh(new THREE.BoxGeometry(5.2,3.05,.12),blk); g.add(fr);
  var sc=new THREE.Mesh(new THREE.PlaneGeometry(4.96,2.79),new THREE.MeshBasicMaterial({map:tvTx})); sc.position.z=.07; g.add(sc);
  var glow=new THREE.PointLight(0xffe0d0,.5,9); glow.position.set(-1.5,0,.8); g.add(glow);
  /* bench facing the TV */
  var wood=new THREE.MeshStandardMaterial({color:0x3a3336,roughness:.6}), cush=new THREE.MeshStandardMaterial({color:0x7a3a4a,roughness:.9});
  /* exit door, on the entrance wall */
  var white=new THREE.MeshStandardMaterial({color:0xe9e6e0,roughness:.9}), dw=new THREE.MeshStandardMaterial({color:0x4a2c20,roughness:.55}), dp=new THREE.MeshStandardMaterial({color:0x2f1b14,roughness:.6}), br=new THREE.MeshStandardMaterial({color:0xb08a3e,roughness:.35,metalness:.7});
  var d=new THREE.Group(); d.position.set(DOORX,0,ZF-.02); d.rotation.y=Math.PI; scene.add(d);
  function bx(m,w,h,dd,x,y,z){ var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dd),m); b.position.set(x,y,z); d.add(b); return b; }
  bx(white,3.3,.18,.22,0,3.75,.1); bx(white,3.7,.22,.3,0,3.92,.12);
  bx(white,.28,3.7,.2,-1.55,1.85,.08); bx(white,.28,3.7,.2,1.55,1.85,.08);
  [-1,1].forEach(function(sx){
    bx(dw,1.4,3.6,.1,sx*.72,1.8,.02);
    [[2.78,.55],[1.15,1.35]].forEach(function(p){ bx(dp,1.05,p[1]*1.0,.04,sx*.72,p[0],.08); });
    bx(dw,1.0,.08,.05,sx*.72,2.2,.08);
    [.5,1.8,3.1].forEach(function(y){ bx(br,.12,.2,.06,sx*1.38,y,.05); });
    bx(br,.07,1.1,.07,sx*.12,1.7,.12);
  });
  /* exit sign */
  var sg=document.createElement('canvas'); sg.width=256; sg.height=64; var sx2=sg.getContext('2d'); sx2.fillStyle='#14202a'; sx2.fillRect(0,0,256,64); sx2.fillStyle='#ffd9a0'; sx2.font='700 34px Inter,IBM Plex Sans Arabic,sans-serif'; sx2.textAlign='center'; sx2.fillText('EXIT · خروج',128,45);
  var sm=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.38),new THREE.MeshBasicMaterial({map:canvasTex(sg)})); sm.position.set(0,4.45,.3); d.add(sm);
})();
function syncCinemaVideo(){
  var u=mediaURL('cinemaVideo');
  if(!u){
    if(tvVideo){ tvVideo.pause(); tvVideo.removeAttribute('src'); tvVideo.load(); tvVideo=null; tvVideoSrc=''; }
    if(urls.cinemaVideo){ URL.revokeObjectURL(urls.cinemaVideo.u); delete urls.cinemaVideo; }
    return;
  }
  if(tvVideo&&tvVideoSrc===u) return;
  if(tvVideo){ tvVideo.pause(); tvVideo.removeAttribute('src'); tvVideo.load(); }
  tvVideo=document.createElement('video'); tvVideo.muted=true; tvVideo.loop=true; tvVideo.playsInline=true; tvVideo.preload='auto'; tvVideo.setAttribute('playsinline',''); tvVideo.setAttribute('autoplay','');
  tvVideoSrc=u; tvVideo.src=u; tvVideo.addEventListener('loadeddata',function(){ if(tvVideo&&tvVideoSrc===u) tvVideo.play().catch(function(){}); });
  tvVideo.load(); tvVideo.play().catch(function(){});
}
function paintCinemaVideo(){
  var x=tvCv.getContext('2d'), w=tvCv.width, h=tvCv.height;
  var scale=Math.max(w/tvVideo.videoWidth,h/tvVideo.videoHeight), vw=tvVideo.videoWidth*scale, vh=tvVideo.videoHeight*scale;
  x.fillStyle='#000'; x.fillRect(0,0,w,h); x.drawImage(tvVideo,(w-vw)/2,(h-vh)/2,vw,vh); tvTx.needsUpdate=true;
}
function tvDraw(now){
  var x=tvCv.getContext('2d'), w=tvCv.width, h=tvCv.height, list=galleryFrames.filter(function(f){ return f.canvas; });
  if(tvVideo&&tvVideo.readyState>=2&&tvVideo.videoWidth){
    paintCinemaVideo(); return;
  }
  if(!list.length) return;
  if(now-tvLast>4200){ tvLast=now; tvIdx=(tvIdx+1)%list.length; tvFade=0; }
  if(tvFade<1||tvLast===now){
    tvFade=Math.min(1,tvFade+.04);
    var a=list[(tvIdx-1+list.length)%list.length].canvas, b=list[tvIdx].canvas;
    function cover(c,al){ var r=Math.max(w/c.width,h/c.height), dw2=c.width*r, dh=c.height*r; x.globalAlpha=al; x.drawImage(c,(w-dw2)/2,(h-dh)/2,dw2,dh); }
    x.fillStyle='#000'; x.fillRect(0,0,w,h); cover(a,1); cover(b,tvFade); x.globalAlpha=1;
    var gr=x.createLinearGradient(0,h*.7,0,h); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,.55)'); x.fillStyle=gr; x.fillRect(0,h*.7,w,h*.3);
    x.fillStyle='#fff'; x.textAlign='center'; x.font='italic 600 44px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText(C('from')+'  ♥  '+C('to'),w/2,h-36);
    tvTx.needsUpdate=true;
  }
}
function updateCinemaUploadControl(){
  var near=state==='explore'&&!store.cinemaVideo&&player.position.x>W/2+1.2&&player.position.z>-20.2&&player.position.z<-12.8&&Math.hypot(player.position.x-20.3,player.position.z+16.5)<6.2;
  var pill=$('cinemaUploadPill'); pill.hidden=!near;
  var btn=$('cinemaUploadBtn');
  btn.textContent=t('videoNearAdd'); btn.title=btn.ariaLabel=t('videoPick');
}
$('cinemaUploadBtn').addEventListener('click',function(){ if(state==='explore') $('cinemaUploadInput').click(); });
$('cinemaUploadInput').addEventListener('change',function(){ var f=this.files&&this.files[0]; if(!f) return; if(f.size>40*1048576) toast(t('tooBig')); store.cinemaVideo=f; idbPut('cinemaVideo',f); syncCinemaVideo(); this.value=''; updateCinemaUploadControl(); });
function exitAsk(){ if($('exitBox').hidden===false) return; $('exitBox').hidden=false; }
$('exitBtn').addEventListener('click',exitAsk);
$('exitStay').addEventListener('click',function(){ $('exitBox').hidden=true; });
$('exitGo').addEventListener('click',function(){
  $('exitBox').hidden=true;
  try{ if(typeof stopSong==='function') stopSong(); voiceEl.pause(); if(master) master.gain.value=0; }catch(e){}
  var b=document.createElement('div'); b.style.cssText='position:fixed;inset:0;z-index:999;background:#1a0d14;color:#fff3f0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;font-family:Georgia,serif;padding:24px';
  b.innerHTML='<div style="font-size:44px">🤍</div><div style="font-size:26px;font-style:italic">Thank you for visiting our museum</div><div style="opacity:.7;font-size:15px">شكراً لزيارتك</div><button id="byeBack" style="border:0;border-radius:999px;padding:12px 26px;font-size:15px;font-weight:700;background:#e8506b;color:#fff">Visit again</button>';
  document.body.appendChild(b);
  document.getElementById('byeBack').addEventListener('click',function(){ if(MUSEUM_MODE) window.top.location.href=new URL('index.html',location.href).href; else location.reload(); });
  try{ window.close(); }catch(e){}
});

