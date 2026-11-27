/* Secret room, painting light, frames, end-wall screen */
'use strict';

/* ---------- Secret room ---------- */
var secretMesh=null, couponMesh=null, couponCanvas=document.createElement('canvas'), secretCanvas=document.createElement('canvas'), couponTex, secretTex;
var twinkles=[];
(function(){
  var cx=(ROOM.x0+ROOM.x1)/2, cz=(ROOM.z0+ROOM.z1)/2, rw=ROOM.x1-ROOM.x0, rd=ROOM.z1-ROOM.z0;
  var rm=new THREE.MeshStandardMaterial({color:0x5a2e3c,roughness:.95,side:THREE.DoubleSide});
  function pl(w,h,m,x,y,z,rx,ry){ var p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); p.position.set(x,y,z); p.rotation.set(rx||0,ry||0,0); scene.add(p); return p; }
  pl(rw,rd,new THREE.MeshStandardMaterial({color:0x2a2024,roughness:.5}),cx,.008,cz,-Math.PI/2,0);
  pl(5,3.2,new THREE.MeshStandardMaterial({color:0x7a2a40,roughness:1}),cx,.012,cz,-Math.PI/2,0);
  pl(rw,rd,new THREE.MeshStandardMaterial({color:0x2a1d24,roughness:1,side:THREE.DoubleSide}),cx,ROOM.h,cz,Math.PI/2,0);
  pl(rd,ROOM.h,rm,ROOM.x0,ROOM.h/2,cz,0,Math.PI/2);
  pl(rw,ROOM.h,rm,cx,ROOM.h/2,ROOM.z0,0,0);
  pl(rw,ROOM.h,rm,cx,ROOM.h/2,ROOM.z1,0,Math.PI);
  /* secret message on the west wall */
  secretCanvas.width=1000; secretCanvas.height=520; secretTex=canvasTex(secretCanvas);
  
  /* pedestal with the coupon */
  var ped=new THREE.Mesh(new THREE.CylinderGeometry(.5,.58,.9,24),new THREE.MeshStandardMaterial({color:0xe9e2d8,roughness:.6})); ped.position.set(cx+1.2,.45,cz); /* removed */
  couponCanvas.width=800; couponCanvas.height=440; couponTex=canvasTex(couponCanvas);
  couponMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.825),new THREE.MeshBasicMaterial({map:couponTex,side:THREE.DoubleSide}));
  couponMesh.position.set(cx+1.2,1.45,cz); couponMesh.rotation.y=Math.PI/2;
  /* fairy lights */
  var tm=new THREE.MeshBasicMaterial({color:0xffe2a8});
  for(var i=0;i<26;i++){ var s=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),tm.clone()); var a=i/26;
    s.position.set(ROOM.x0+.3+a*(rw-.6),ROOM.h-.25-Math.sin(a*Math.PI*6)*.12,ROOM.z0+.25); s.userData.ph=Math.random()*6; }
  for(var j=0;j<26;j++){ var s2=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),tm.clone()); var a2=j/26;
    s2.position.set(ROOM.x0+.3+a2*(rw-.6),ROOM.h-.25-Math.sin(a2*Math.PI*6)*.12,ROOM.z1-.25); s2.userData.ph=Math.random()*6; }
})();
function roundRect(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
function drawSecret(){
  var x=secretCanvas.getContext('2d'), w=secretCanvas.width, h=secretCanvas.height;
  x.fillStyle='#2a1a22'; x.fillRect(0,0,w,h); x.strokeStyle='#c9a35a'; x.lineWidth=6; x.strokeRect(20,20,w-40,h-40);
  x.fillStyle='rgba(217,63,90,.9)'; heartPath(x,w/2,110,44); x.fill();
  x.fillStyle='#f4f0ea'; x.textAlign='center'; x.textBaseline='alphabetic'; x.font='italic 500 56px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  var lines=C('secret').split('\n'), y=230;
  lines.forEach(function(ln){ y+=wrapText(x,ln,w/2,y,w-160,70)*70; });
  secretTex.needsUpdate=true;
}
function drawCoupon(){
  var x=couponCanvas.getContext('2d'), w=couponCanvas.width, h=couponCanvas.height;
  var g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#f6e6c8'); g.addColorStop(1,'#e8c98c'); x.fillStyle=g; roundRect(x,0,0,w,h,26); x.fill();
  x.setLineDash([14,10]); x.strokeStyle='#8a5a2c'; x.lineWidth=4; roundRect(x,22,22,w-44,h-44,16); x.stroke(); x.setLineDash([]);
  x.fillStyle='#8a2a3f'; x.textAlign='center'; x.font='600 40px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillText('♥  COUPON  ♥',w/2,100);
  x.fillStyle='#3a2b2b'; x.font='italic 600 50px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  wrapText(x,C('coupon'),w/2,200,w-140,62);
  couponTex.needsUpdate=true;
}

/* soft light textures */
function radialTex(inner,outer){ var c=document.createElement('canvas'); c.width=c.height=128; var x=c.getContext('2d'); var g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,inner); g.addColorStop(1,outer); x.fillStyle=g; x.fillRect(0,0,128,128); return canvasTex(c); }
var washTex=radialTex('rgba(255,236,205,.22)','rgba(255,236,205,0)'), poolTex=radialTex('rgba(255,226,180,.4)','rgba(255,226,180,0)');
function additive(tx){ return new THREE.MeshBasicMaterial({map:tx,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}); }

/* ---------- Even painting light (applies to EVERY painting) ----------
   Paintings use unlit materials, so light is a soft additive sheen laid over the whole
   frame: almost even from top to bottom (a touch brighter at the top, never dark below). */
var sheenTex=(function(){
  var c=document.createElement('canvas'); c.width=64; c.height=128; var x=c.getContext('2d');
  var g=x.createLinearGradient(0,0,0,128);
  g.addColorStop(0,'rgba(255,238,210,.095)'); g.addColorStop(.5,'rgba(255,238,210,.085)'); g.addColorStop(1,'rgba(255,238,210,.078)');
  x.fillStyle=g; x.fillRect(0,0,64,128);
  var r=x.createRadialGradient(32,64,4,32,64,90); r.addColorStop(0,'rgba(255,246,228,.035)'); r.addColorStop(1,'rgba(255,246,228,0)');
  x.fillStyle=r; x.fillRect(0,0,64,128);
  return canvasTex(c);
})();
var sweepTex=(function(){
  var c=document.createElement('canvas'); c.width=64; c.height=128; var x=c.getContext('2d');
  var gx=x.createLinearGradient(0,0,64,0); gx.addColorStop(0,'rgba(255,245,230,0)'); gx.addColorStop(.3,'rgba(255,245,230,.08)'); gx.addColorStop(.5,'rgba(255,245,230,.72)'); gx.addColorStop(.7,'rgba(255,245,230,.08)'); gx.addColorStop(1,'rgba(255,245,230,0)');
  var gy=x.createLinearGradient(0,0,0,128); gy.addColorStop(0,'rgba(255,255,255,0)'); gy.addColorStop(.18,'rgba(255,255,255,1)'); gy.addColorStop(.82,'rgba(255,255,255,1)'); gy.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gy; x.fillRect(0,0,64,128); x.globalCompositeOperation='destination-in'; x.fillStyle=gx; x.fillRect(0,0,64,128); return canvasTex(c);
})();
function sheenMat(op){ var m=additive(sheenTex); m.opacity=op; m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-2; return m; }
function sheenPlane(w,h,z,op){ var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),sheenMat(op)); m.position.z=z; m.renderOrder=2; return m; }

/* How a gift cover opens, for every painting: 'doors' = the ribbon parts and the two halves swing open
   like little doors; 'float' = the original (cover floats up and fades). */
var OPEN_STYLE='doors';
function halfGeo(w,h,right){ var g=new THREE.PlaneGeometry(w/2,h), uv=g.attributes.uv; for(var i=0;i<uv.count;i++) uv.setX(i,(uv.getX(i)+(right?1:0))/2); return g; }

/* ---------- Frames ---------- */
var SLOTS=[];
[-3,-12,-21,-30].forEach(function(z){ SLOTS.push({x:-W/2+.06,z:z,ry:Math.PI/2}); SLOTS.push({x:W/2-.06,z:z,ry:-Math.PI/2}); });
var PAL=[['#f6b6a8','#9c4a6b'],['#a8c5f0','#46427f'],['#f2d49b','#b5593d'],['#9fd8c4','#2f6a73'],['#e6b2e8','#6a3d8f'],['#f3c0c0','#8a3a4f'],['#bcd3a2','#4a6b3d'],['#f0cfa0','#7b4a2e']];
var FW=1.5,FH=2.0,FY=2.15, galleryFrames=[], photoMeshes=[];
var COVPAL=[['#3b2a36','#6b3a4f'],['#23323d','#3f5f73'],['#3a2f26','#7a5a3c'],['#26372f','#4d7a64'],['#3a2a3f','#6e4a7a'],['#402a2a','#8a4a4a'],['#2b3340','#55688a'],['#3c3226','#8a6d3e']];
function coverArt(i){
  var f=galleryFrames[i]; if(!f||!f.ccanvas) return; var c=f.ccanvas, x=c.getContext('2d'), w=c.width, h=c.height, p=COVPAL[i%COVPAL.length];
  var g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,p[0]); g.addColorStop(1,p[1]); x.fillStyle=g; x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,255,255,.07)';
  for(var r=0;r<9;r++) for(var q=0;q<7;q++){ var hx=q*w/6+(r%2?w/12:0), hy=r*h/8; heartPath(x,hx,hy,w*.035); x.fill(); }
  x.strokeStyle='rgba(255,255,255,.9)'; x.lineWidth=10; x.setLineDash([22,14]); x.strokeRect(26,26,w-52,h-52); x.setLineDash([]);
  var rb='#c9a35a'; x.fillStyle=rb; x.fillRect(0,h*.46,w,h*.08); x.fillRect(w*.46,0,w*.08,h);
  x.fillStyle='rgba(255,255,255,.4)'; x.fillRect(0,h*.46,w,5); x.fillRect(w*.46,0,5,h);
  x.fillStyle='#7a5a24'; x.beginPath(); x.ellipse(w*.36,h*.5,w*.13,h*.06,-.45,0,6.3); x.fill(); x.beginPath(); x.ellipse(w*.64,h*.5,w*.13,h*.06,.45,0,6.3); x.fill();
  x.fillStyle=rb; x.beginPath(); x.ellipse(w*.37,h*.5,w*.11,h*.045,-.45,0,6.3); x.fill(); x.beginPath(); x.ellipse(w*.63,h*.5,w*.11,h*.045,.45,0,6.3); x.fill();
  x.fillStyle='#7a5a24'; x.beginPath(); x.arc(w/2,h*.5,w*.05,0,6.3); x.fill();
  x.fillStyle='#fff'; heartPath(x,w/2,h*.5,w*.04); x.fill();
  x.fillStyle='#fff'; x.textAlign='center'; x.font='italic 600 '+Math.round(w*.075)+'px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  x.shadowColor='rgba(0,0,0,.25)'; x.shadowBlur=8; x.fillText(LANG==='ar'?'مفاجأة لكِ':'a surprise for you',w/2,h*.16); x.fillText('#'+(i+1),w/2,h*.9); x.shadowBlur=0;
  f.ctex.needsUpdate=true;
}
function openCover(i){
  var f=galleryFrames[i]; if(!f||f.open) return; f.open=true; f.opening=true; f.openT=0; f.style=OPEN_STYLE;
  if(f.style==='doors'){ f.cover.visible=false; f.doors.visible=true; f.doorL.rotation.y=0; f.doorR.rotation.y=0; f.doorMat.opacity=1; } chime([79,84,88],.1,.14); burst(24); fxHearts(i);
  $('capOpen').hidden=true; $('capBtn').hidden=false;
  if(f.video) f.video.play().catch(function(){});
  if(!guided[i]&&store['aud'+i]){ guided[i]=true; playVoice('aud'+i); }
  if(i===4&&store.song) startSong();
}

function updateCoverOpen(f,dt){
  var doors=f.style==='doors';
  f.openT=Math.min(1,f.openT+dt/(doors?1.15:.9));
  var k=f.openT, e=ease(k);
  if(doors){
    var sw=ease(Math.min(1,k/.78)), fade=ease(Math.max(0,(k-.55)/.45));
    f.doorL.rotation.y=-sw*1.75; f.doorR.rotation.y=sw*1.75; f.doorMat.opacity=1-fade;
  } else {
    f.cover.position.y=e*.7; f.cover.scale.setScalar(1+e*.12); f.cover.material.opacity=1-e;
  }
  f.sheenC.material.opacity=1-ease(Math.min(1,k/.25));          /* cover light hands over to the photo light */
  f.sheenP.material.opacity=.8+.2*Math.sin(Math.PI*k);          /* a soft glow as the picture is revealed */
  if(k>=1){ f.opening=false; f.cover.visible=false; f.doors.visible=false; f.sheenC.visible=false; f.sheenP.material.opacity=.8; }
}
function heartPath(x,cx,cy,s){ x.beginPath(); x.moveTo(cx,cy+s*.35); x.bezierCurveTo(cx-s*1.1,cy-s*.35,cx-s*.45,cy-s*1.0,cx,cy-s*.4); x.bezierCurveTo(cx+s*.45,cy-s*1.0,cx+s*1.1,cy-s*.35,cx,cy+s*.35); x.closePath(); }
function wrapText(x,text,cx,y,maxW,lh){
  var words=String(text).split(/\s+/), line='', lines=[];
  words.forEach(function(w){ var tt=line?line+' '+w:w; if(x.measureText(tt).width>maxW&&line){ lines.push(line); line=w; } else line=tt; });
  lines.push(line); lines.forEach(function(l,i){ x.fillText(l,cx,y+i*lh); }); return lines.length;
}
function drawArt(x,W2,H2,i){
  var p=PAL[i%PAL.length], g=x.createLinearGradient(0,0,W2*.3,H2); g.addColorStop(0,p[0]); g.addColorStop(1,p[1]);
  x.fillStyle=g; x.fillRect(0,0,W2,H2);
  x.fillStyle='rgba(255,255,255,.16)'; x.beginPath(); x.arc(W2*.72,H2*.3,W2*.26,0,Math.PI*2); x.fill();
  x.fillStyle='rgba(255,255,255,.1)'; x.beginPath(); x.arc(W2*.2,H2*.62,W2*.34,0,Math.PI*2); x.fill();
  x.fillStyle='rgba(255,255,255,.92)'; heartPath(x,W2/2,H2*.4,W2*.2); x.fill();
  x.fillStyle='#fff'; x.textAlign='center'; x.textBaseline='alphabetic';
  x.font='italic 600 '+Math.round(W2*.078)+'px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  wrapText(x,CAP(i),W2/2,H2*.76,W2*.78,W2*.09);
  x.font='500 '+Math.round(W2*.034)+'px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillStyle='rgba(255,255,255,.75)';
  x.fillText(LANG==='ar'?'صورتك هنا':'YOUR PHOTO GOES HERE',W2/2,H2*.94);
}
function drawCover(x,img,W2,H2){ var s=Math.max(W2/img.width,H2/img.height), w=img.width*s, h=img.height*s; x.drawImage(img,(W2-w)/2,(H2-h)/2,w,h); }
function drawFrame(i){ var f=galleryFrames[i], c=f.canvas; if(f.img) drawCover(f.ctx,f.img,c.width,c.height); else drawArt(f.ctx,c.width,c.height,i); f.tex.needsUpdate=true; }
function drawPlaque(i){
  var f=galleryFrames[i], x=f.pctx, w=f.pcanvas.width, h=f.pcanvas.height;
  x.clearRect(0,0,w,h); x.fillStyle='#1b1519'; roundRect(x,0,0,w,h,16); x.fill(); x.strokeStyle='#c9a35a'; x.lineWidth=3; roundRect(x,6,6,w-12,h-12,12); x.stroke();
  x.textAlign='center'; x.fillStyle='#f4f0ea'; x.font='italic 600 40px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif';
  var d=cfg.dates[i]; x.fillText(CAP(i),w/2,d?58:80,w-40);
  if(d){ x.fillStyle='#c9a35a'; x.font='500 22px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillText(String(d).toUpperCase(),w/2,98,w-40); }
  f.ptex.needsUpdate=true;
}
(function buildFrames(){
  var woodMat=new THREE.MeshStandardMaterial({color:0x0c0c0e,roughness:.4,metalness:.1}), matteMat=new THREE.MeshStandardMaterial({color:0xe8e4dc,roughness:1});
  SLOTS.forEach(function(s,i){
    var g=new THREE.Group(); g.position.set(s.x,FY,s.z); g.rotation.y=s.ry;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(FW+.26,FH+.26,.08),woodMat));
    var matte=new THREE.Mesh(new THREE.PlaneGeometry(FW+.2,FH+.2),matteMat); matte.position.z=.05; g.add(matte);
    var c=document.createElement('canvas'); c.width=750; c.height=Math.round(750*FH/FW); var tx=canvasTex(c);
    var photo=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshBasicMaterial({map:tx})); photo.position.z=.062; photo.userData.index=i; g.add(photo); photoMeshes.push(photo);
    var pc=document.createElement('canvas'); pc.width=560; pc.height=130; var ptx=canvasTex(pc);
    var plaque=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.35),new THREE.MeshBasicMaterial({map:ptx})); plaque.position.set(0,-FH/2-.42,.02); g.add(plaque);
    scene.add(g);
    var side=s.x<0?1:-1;
    var wash=new THREE.Mesh(new THREE.PlaneGeometry(3.6,4.6),additive(washTex)); wash.position.set(s.x+side*.03,FY,s.z); wash.rotation.y=s.ry; wash.renderOrder=1; scene.add(wash);
    var pool=new THREE.Mesh(new THREE.PlaneGeometry(6,7.5),additive(poolTex)); pool.visible=false;
    var cc2=document.createElement('canvas'); cc2.width=500; cc2.height=Math.round(500*(FH+.32)/(FW+.32)); var ctx2=canvasTex(cc2);
    var cover=new THREE.Mesh(new THREE.PlaneGeometry(FW+.2,FH+.2),new THREE.MeshBasicMaterial({map:ctx2,transparent:true})); cover.position.z=.086; g.add(cover);
    var cw=FW+.2, ch=FH+.2;
    var sheenP=sheenPlane(cw,ch,.074,.8); g.add(sheenP);
    var sheenC=sheenPlane(cw,ch,.098,1); g.add(sheenC);
    var sweep=new THREE.Mesh(new THREE.PlaneGeometry(.42,ch),new THREE.MeshBasicMaterial({map:sweepTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    sweep.position.set(-1.05,0,.11); sweep.renderOrder=3; g.add(sweep);
    var doors=new THREE.Group(); doors.position.z=.086; doors.visible=false; g.add(doors);
    var doorMat=new THREE.MeshBasicMaterial({map:ctx2,transparent:true,side:THREE.DoubleSide});
    var doorL=new THREE.Group(); doorL.position.x=-cw/2; var dml=new THREE.Mesh(halfGeo(cw,ch,false),doorMat); dml.position.x=cw/4; doorL.add(dml);
    var doorR=new THREE.Group(); doorR.position.x=cw/2; var dmr=new THREE.Mesh(halfGeo(cw,ch,true),doorMat); dmr.position.x=-cw/4; doorR.add(dmr);
    doors.add(doorL); doors.add(doorR);
    galleryFrames.push({ccanvas:cc2,ctex:ctx2,cover:cover,open:false,opening:false,openT:0,canvas:c,ctx:c.getContext('2d'),tex:tx,img:null,x:s.x,z:s.z,group:g,photo:photo,pcanvas:pc,pctx:pc.getContext('2d'),ptex:ptx,video:null,vtex:null});
    var fo=galleryFrames[galleryFrames.length-1]; fo.doors=doors; fo.doorL=doorL; fo.doorR=doorR; fo.doorMat=doorMat; fo.sheenP=sheenP; fo.sheenC=sheenC; fo.sweep=sweep;
    drawFrame(i); drawPlaque(i); coverArt(i);
  });
})();
function setupVideo(i){
  var f=galleryFrames[i];
  if(f.video){ f.video.pause(); f.video=null; f.vtex=null; f.photo.material.map=f.tex; f.photo.material.needsUpdate=true; }
  var u=mediaURL('vid'+i); if(!u) return;
  var v=document.createElement('video'); v.muted=true; v.loop=true; v.playsInline=true; v.preload='auto'; v.setAttribute('playsinline',''); v.src=u;
  v.addEventListener('loadeddata',function(){
    var vt=new THREE.VideoTexture(v); vt.minFilter=THREE.LinearFilter; vt.magFilter=THREE.LinearFilter; vt.generateMipmaps=false;
    var asp=v.videoWidth/v.videoHeight, tg=FW/FH;
    if(asp>tg){ vt.repeat.x=tg/asp; vt.offset.x=(1-vt.repeat.x)/2; } else { vt.repeat.y=asp/tg; vt.offset.y=(1-vt.repeat.y)/2; }
    f.video=v; f.vtex=vt; f.photo.material.map=vt; f.photo.material.needsUpdate=true;
    try{ v.currentTime=.1; }catch(e){} vt.needsUpdate=true;
    if(nearIdx===i) v.play().catch(function(){});
  });
  v.addEventListener('seeked',function(){ if(f.vtex) f.vtex.needsUpdate=true; });
  v.load();
}

/* ---------- End wall screen ---------- */
var screenCanvas=document.createElement('canvas'); screenCanvas.width=1400; screenCanvas.height=780; var screenTex=canvasTex(screenCanvas);
var sb=new THREE.Mesh(new THREE.BoxGeometry(8.5,4.8,.1),new THREE.MeshStandardMaterial({color:0xc98a78,roughness:.35,metalness:.65})); sb.position.set(0,2.55,ZB+.05); scene.add(sb);
var screenMesh=new THREE.Mesh(new THREE.PlaneGeometry(8.2,4.57),new THREE.MeshBasicMaterial({map:screenTex})); screenMesh.position.set(0,2.55,ZB+.11); scene.add(screenMesh);

var _lbg=null;
function loveBg(){
  if(_lbg) return _lbg;
  var c=document.createElement('canvas'); c.width=1400; c.height=780; var x=c.getContext('2d'), w=1400, h=780, g, i;
  g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#4d1233'); g.addColorStop(.5,'#8f2048'); g.addColorStop(1,'#35102b'); x.fillStyle=g; x.fillRect(0,0,w,h);
  g=x.createRadialGradient(w/2,h*.5,20,w/2,h*.5,w*.56); g.addColorStop(0,'rgba(255,150,178,.42)'); g.addColorStop(.6,'rgba(255,110,150,.12)'); g.addColorStop(1,'rgba(255,110,150,0)'); x.fillStyle=g; x.fillRect(0,0,w,h);
  var sd=7; function rn(){ sd=(sd*16807)%2147483647; return sd/2147483647; }
  x.fillStyle='rgba(255,190,205,.07)'; heartPath(x,w/2,h*.52,330); x.fill();
  for(i=0;i<38;i++){ var sz=9+rn()*30; x.fillStyle=(i%3?'rgba(255,182,198,':'rgba(243,201,168,')+(.05+rn()*.13).toFixed(2)+')'; heartPath(x,60+rn()*(w-120),50+rn()*(h-100),sz); x.fill(); }
  for(i=0;i<70;i++){ x.fillStyle='rgba(255,236,224,'+(.15+rn()*.45).toFixed(2)+')'; var r=.8+rn()*1.8; x.beginPath(); x.arc(30+rn()*(w-60),30+rn()*(h-60),r,0,6.3); x.fill(); }
  var fg=x.createLinearGradient(0,0,w,h); fg.addColorStop(0,'#f7d2b5'); fg.addColorStop(.5,'#d98e7a'); fg.addColorStop(1,'#f7d2b5');
  x.strokeStyle=fg; x.lineWidth=6; roundRect(x,18,18,w-36,h-36,26); x.stroke();
  x.strokeStyle='rgba(255,214,222,.55)'; x.lineWidth=2; x.setLineDash([2,9]); x.lineCap='round'; roundRect(x,40,40,w-80,h-80,18); x.stroke(); x.setLineDash([]);
  [[40,40],[w-40,40],[40,h-40],[w-40,h-40]].forEach(function(p){ x.fillStyle='#10040b'; x.beginPath(); x.arc(p[0],p[1],26,0,6.3); x.fill(); x.fillStyle='#ffb3c4'; heartPath(x,p[0],p[1]+1,15); x.fill(); x.strokeStyle=fg; x.lineWidth=3; x.beginPath(); x.arc(p[0],p[1],26,0,6.3); x.stroke(); });
  g=x.createRadialGradient(w/2,h/2,h*.45,w/2,h/2,w*.62); g.addColorStop(0,'rgba(20,4,14,0)'); g.addColorStop(1,'rgba(20,4,14,.55)'); x.fillStyle=g; x.fillRect(0,0,w,h);
  _lbg=c; return c;
}
function loveDivider(x,cx,cy,len){
  var g=x.createLinearGradient(cx-len,0,cx+len,0); g.addColorStop(0,'rgba(247,210,181,0)'); g.addColorStop(.4,'rgba(247,210,181,.95)'); g.addColorStop(.6,'rgba(247,210,181,.95)'); g.addColorStop(1,'rgba(247,210,181,0)');
  x.fillStyle=g; x.fillRect(cx-len,cy-1,len*2,2.5);
  x.fillStyle='#240812'; x.beginPath(); x.arc(cx,cy,21,0,6.3); x.fill();
  x.fillStyle='#ff7d96'; heartPath(x,cx,cy+1,15); x.fill();
  x.fillStyle='#f7d2b5'; [-34,34].forEach(function(d){ x.beginPath(); x.arc(cx+d,cy,3.2,0,6.3); x.fill(); });
}
function loveNames(x,w,y){
  x.direction='ltr'; x.textAlign='center'; x.fillStyle='#f7d2b5'; x.font='600 30px Inter,"IBM Plex Sans Arabic",sans-serif'; try{ x.letterSpacing='6px'; }catch(e){}
  x.fillText(String(C('from')).toUpperCase()+'  ♥  '+String(C('to')).toUpperCase(),w/2,y); try{ x.letterSpacing='0px'; }catch(e){}
}
function drawScreen(){
  var x=screenCanvas.getContext('2d'), w=1400, h=780;
  x.drawImage(loveBg(),0,0);
  var hg=x.createRadialGradient(w/2-26,h*.22,8,w/2,h*.3,140); hg.addColorStop(0,'#ffc2d0'); hg.addColorStop(.5,'#ff5c80'); hg.addColorStop(1,'#a80f3b');
  x.shadowColor='rgba(255,90,130,.95)'; x.shadowBlur=55; x.fillStyle=hg; heartPath(x,w/2,h*.31,105); x.fill(); x.shadowBlur=0;
  loveDivider(x,w/2,h*.5,300);
  x.textAlign='center'; x.fillStyle='#fff1ee'; x.font='500 124px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.shadowColor='rgba(255,110,150,.55)'; x.shadowBlur=22; x.fillText(C('title'),w/2,h*.69,w-220); x.shadowBlur=0;
  loveNames(x,w,h*.82);
  screenTex.needsUpdate=true;
}

