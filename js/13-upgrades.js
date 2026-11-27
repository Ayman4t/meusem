/* Warm hall, decor, sunset garden, emotes, gallery extras */
'use strict';

/* ===== UPGRADE: warm hall, decor, sunset garden, emotes, sparkles ===== */
var gardenOn=false, seat=null, waveT=0, fxAcc=0, fxYes=0, halos=[], flames=[], pSets=[], gPetals=[], gLan=[], gSea=null, gFoam=null, twA, twB, emotes=[];
var GT={}; function gt(c){ return GT[c]||(GT[c]=radialTex('rgba('+c+',.9)','rgba('+c+',0)')); }
function glow(c,s,x,y,z,o){ var m=new THREE.Sprite(new THREE.SpriteMaterial({map:gt(c),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:o||1,fog:false})); m.scale.set(s,s,1); m.position.set(x,y,z); return m; }
function bxm(w,h,d,x,y,z,m,par){ var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); (par||scene).add(b); return b; }
function pts(arr,size,c,op,par){ var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3)); var p=new THREE.Points(g,new THREE.PointsMaterial({size:size,map:gt(c),transparent:true,opacity:op||1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); (par||scene).add(p); return p; }
var rg=new THREE.MeshStandardMaterial({color:0xe8a994,emissive:0x5a2a22,roughness:.35,metalness:.4}), gold=new THREE.MeshStandardMaterial({color:0xdcb25c,emissive:0x4a3410,roughness:.3,metalness:.5});
var leafM=new THREE.MeshStandardMaterial({color:0x4f8a5a,roughness:.8}), FC=[0xff8fb0,0xffd1dc,0xfff2f2,0xc9a0ff,0xffb27a];
function flMat(c){ return new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.22,roughness:.7}); }

/* 2. rose-gold trim, gold frames, halos */

var haloT=radialTex('rgba(255,170,150,.55)','rgba(255,170,150,0)');
galleryFrames.forEach(function(f){ var g=f.group, ow=FW+.55, oh=FH+.55;
  var h=new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({visible:false})); halos.push(h); });

/* 2. dust, sparks, fairy lights, ceiling hearts */
function dustSet(n,size,c,o,vy){ var a=[],v=new Float32Array(n*3); for(var i=0;i<n;i++){ a.push((Math.random()-.5)*24,.4+Math.random()*6,-40+Math.random()*48); v[i*3]=(Math.random()-.5)*.25; v[i*3+1]=.04+Math.random()*vy; v[i*3+2]=(Math.random()-.5)*.25; } pSets.push({p:pts(a,size,c,o),v:v,o:o,ph:Math.random()*6}); }

var fA=[],fB=[]; function swagZ(x,za,zb){ for(var i=0;i<=14;i++){ var t=i/14; (i%2?fA:fB).push(x,H-.55-Math.sin(t*Math.PI)*.5,za+(zb-za)*t); } }
var pz=[8.5,1.5,-7.5,-16.5,-25.5,-35,-40]; for(var q=0;q<pz.length-1;q++) [-(W/2-.7),W/2-.7,-5,5].forEach(function(x){ swagZ(x,pz[q],pz[q+1]); });
twA=pts(fA,.2,'255,225,170',1); twB=pts(fB,.2,'255,190,210',1); twA.visible=false; twB.visible=false;
function heartCeil(zc,sc){ var a=[]; function P(u,r){ a.push(16*Math.pow(Math.sin(u),3)*sc*r,H-.06,zc-(13*Math.cos(u)-5*Math.cos(2*u)-2*Math.cos(3*u)-Math.cos(4*u))*sc*r); }
  for(var i=0;i<130;i++) P(i/130*6.2832,1); for(var j=0;j<170;j++) P(Math.random()*6.2832,Math.sqrt(Math.random()));
  pts(a,.24,'255,205,225',1);
  var gm=new THREE.Mesh(new THREE.PlaneGeometry(16*2*sc*1.25,18*sc*1.25),new THREE.MeshBasicMaterial({map:gTex(128,128,function(x,w,h){ x.translate(0,h); x.scale(1,-1); x.shadowColor='rgba(255,120,170,1)'; x.shadowBlur=30; x.fillStyle='rgba(255,130,175,.5)'; heartPath(x,w/2,h*.5,w*.34); x.fill(); }),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  gm.rotation.x=Math.PI/2; gm.position.set(0,H-.05,zc); gm.renderOrder=1; scene.add(gm); }


/* 3. rug, windows, vases, plants, candles */
var rugT=gTex(256,512,function(x,w,h){ x.fillStyle='#7a2840'; x.fillRect(0,0,w,h); x.strokeStyle='#e8c07a'; x.lineWidth=6; x.strokeRect(10,10,w-20,h-20); x.lineWidth=2; x.strokeRect(26,26,w-52,h-52);
  for(var i=0;i<4;i++){ var cy=i*128+64; x.fillStyle='rgba(232,192,122,.9)'; x.beginPath(); x.moveTo(w/2,cy-46); x.lineTo(w/2+36,cy); x.lineTo(w/2,cy+46); x.lineTo(w/2-36,cy); x.closePath(); x.fill(); x.fillStyle='#d94a6a'; heartPath(x,w/2,cy+3,20); x.fill();
    [-72,72].forEach(function(dx){ x.fillStyle='rgba(255,200,215,.85)'; x.beginPath(); x.arc(w/2+dx,cy,9,0,6.3); x.fill(); x.fillStyle='#e8c07a'; x.beginPath(); x.arc(w/2+dx,cy,3.5,0,6.3); x.fill(); }); } });
rugT.wrapS=rugT.wrapT=THREE.RepeatWrapping; rugT.repeat.set(1,(L-1.5)/10);
var rug=new THREE.Mesh(new THREE.PlaneGeometry(4.8,L-1.5),new THREE.MeshStandardMaterial({map:rugT,roughness:1})); rug.rotation.x=-Math.PI/2; rug.position.set(0,.018,ZC);
var skyW=gTex(128,256,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); [[0,'#2a1a5e'],[.35,'#8a3b8f'],[.62,'#ee6f8e'],[.8,'#ffb27a'],[1,'#ffe1a0']].forEach(function(s){ g.addColorStop(s[0],s[1]); }); x.fillStyle=g; x.fillRect(0,0,w,h); x.fillStyle='rgba(255,240,200,.95)'; x.beginPath(); x.arc(w*.5,h*.8,16,0,6.3); x.fill(); x.fillStyle='rgba(255,200,210,.45)'; x.fillRect(0,h*.55,w,5); x.fillRect(10,h*.66,w*.7,4); x.fillStyle='#3b2a5a'; x.fillRect(0,h*.9,w,h*.1); });
var skyM=new THREE.MeshBasicMaterial({map:skyW}), spillT=radialTex('rgba(255,150,140,.45)','rgba(255,150,140,0)');
function win(side,z){ var g=new THREE.Group(); g.position.set(side*(W/2-.03),3.6,z); g.rotation.y=side<0?Math.PI/2:-Math.PI/2; scene.add(g);
  var p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,4.4),skyM); p.position.z=.01; g.add(p);
  [[1.72,.12,0,2.2],[1.72,.12,0,-2.2],[.12,4.4,-.8,0],[.12,4.4,.8,0],[.05,4.4,0,0],[1.5,.05,0,.4]].forEach(function(b){ bxm(b[0],b[1],.12,b[2],b[3],.05,gold,g); });
  var sp=new THREE.Mesh(new THREE.PlaneGeometry(4,6),additive(spillT)); sp.rotation.x=-Math.PI/2; sp.position.set(side*(W/2-1.9),.03,z); sp.renderOrder=1; scene.add(sp); }

function vase(x,z){ var g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  var ped=new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.9,16),new THREE.MeshStandardMaterial({color:0xe9e2d8,roughness:.6})); ped.position.y=.45; g.add(ped);
  var v=new THREE.Mesh(new THREE.CylinderGeometry(.2,.13,.42,16),new THREE.MeshStandardMaterial({color:0xf3e6dc,roughness:.4})); v.position.y=1.11; g.add(v);
  for(var i=0;i<9;i++){ var a=i/9*6.28, r=.07+Math.random()*.1, h=.35+Math.random()*.3, c=FC[i%5];
    var st=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,h,5),leafM); st.position.set(Math.cos(a)*r*.5,1.32+h/2,Math.sin(a)*r*.5); st.rotation.set(Math.sin(a)*.4,0,-Math.cos(a)*.4); g.add(st);
    var fl=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),flMat(c)); fl.position.set(Math.cos(a)*r,1.32+h,Math.sin(a)*r); g.add(fl); } }
function plant(x,z){ var g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  var pot=new THREE.Mesh(new THREE.CylinderGeometry(.34,.24,.55,16),new THREE.MeshStandardMaterial({color:0xc98a6a,roughness:.7})); pot.position.y=.28; g.add(pot);
  for(var i=0;i<10;i++){ var a=i/10*6.28, l=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),leafM); l.scale.set(.5,2.4+Math.random(),.9); l.position.set(Math.cos(a)*.22,1.15,Math.sin(a)*.22); l.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5); g.add(l); } }


var BZ=[]; [-3,-12,-21,-30].forEach(function(z){ [-1,1].forEach(function(s){ BZ.push([s*9.8,z]); [-1.2,1.2].forEach(function(o){ var c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.24,10),new THREE.MeshStandardMaterial({color:0xfff0dc,roughness:.8,emissive:0x3a2a20})); c.position.set(s*9.8,.62,z+o);
  var fl=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0xffe7a0})); fl.scale.y=1.7; fl.position.set(s*9.8,.78,z+o); var gl=glow('255,190,110',.5,s*9.8,.8,z+o,.9); flames.push(gl); }); }); }); BZ.push([W/2-3.2,TVPOS.z]);


/* ---------- Gallery extras: partitions, feature wall, display cases ---------- */
var COLL=[];
[-3,-12,-21,-30].forEach(function(z){ [-1,1].forEach(function(s){ var x=s*9.8; COLL.push({x0:x-.4,x1:x+.4,z0:z-1.8,z1:z+1.8}); }); });
var featCv=document.createElement('canvas'); featCv.width=640; featCv.height=250; var featTex=canvasTex(featCv);
function drawFeature(){
  var x=featCv.getContext('2d'), w=featCv.width, h=featCv.height;
  x.fillStyle='#101012'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(201,163,90,.55)'; x.lineWidth=2; x.strokeRect(10,10,w-20,h-20);
  x.textAlign='center'; x.fillStyle='#a59ea9'; x.font='500 20px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillText(LANG==='ar'?'مجموعة خاصة':'FEATURED COLLECTION',w/2,52);
  x.fillStyle='#f4f0ea'; x.font='italic 600 64px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText((LANG==='ar'?'إلى ':'For ')+C('to'),w/2,128,w-60);
  x.fillStyle='#c9a35a'; x.font='500 22px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillText((LANG==='ar'?'من ':'with love, ')+C('from'),w/2,176,w-60);
  featTex.needsUpdate=true;
}
(function(){
  var wallG=new THREE.MeshStandardMaterial({color:0xe6cdcf,roughness:1});
  var black=new THREE.MeshStandardMaterial({color:0x0c0c0e,roughness:.4,metalness:.1}), mat=new THREE.MeshStandardMaterial({color:0xf6f3ee,roughness:1});
  var white=new THREE.MeshStandardMaterial({color:0xd9d5cd,roughness:.7});
  /* little framed picture re-using a real photo texture + soft wash light */
  function deco(px,py,pz,ry,k){
    var g=new THREE.Group(); g.position.set(px,py,pz); g.rotation.y=ry; scene.add(g);
    var w=1.1,h=1.45;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w+.2,h+.2,.06),black));
    var m1=new THREE.Mesh(new THREE.PlaneGeometry(w+.14,h+.14),mat); m1.position.z=.035; g.add(m1);
    var ph=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:galleryFrames[k%galleryFrames.length].tex})); ph.position.z=.04; g.add(ph);
    var wash=new THREE.Mesh(new THREE.PlaneGeometry(2.8,3.8),additive(washTex)); wash.position.z=.02; wash.renderOrder=1; g.add(wash);
    g.add(sheenPlane(w+.14,h+.14,.045,1));
  }
  /* free-standing partition walls */
  var k=0;
  [[-5.4,-7.5],[5.4,-7.5],[-5.4,-25.5],[5.4,-25.5]].forEach(function(c){
    var px=c[0], pz=c[1];
    var b=new THREE.Mesh(new THREE.BoxGeometry(.22,3.6,6),wallG); b.position.set(px,1.8,pz); scene.add(b);
    deco(px+.115,2.0,pz,Math.PI/2,k++); deco(px-.115,2.0,pz,-Math.PI/2,k++);
    COLL.push({x0:px-.11,x1:px+.11,z0:pz-3,z1:pz+3});
  });
  /* feature wall: now inside the secret room (north wall) */
  var FX=-21, FZ=-16.5;
  var panel=new THREE.Mesh(new THREE.BoxGeometry(.14,3.9,5.4),new THREE.MeshStandardMaterial({color:0x0d0e0c,roughness:.9})); panel.position.set(FX+.09,1.95,FZ); scene.add(panel);
  var plat=new THREE.Mesh(new THREE.BoxGeometry(1.5,.16,5.4),white); plat.position.set(FX+.8,.08,FZ); scene.add(plat);
  var big=new THREE.Group(); big.position.set(FX+.2,2.0,FZ); big.rotation.y=Math.PI/2; scene.add(big);
  var bw=2.4,bh=3.1;
  big.add(new THREE.Mesh(new THREE.BoxGeometry(bw+.3,bh+.3,.06),mat));
  var bph=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),new THREE.MeshBasicMaterial({map:galleryFrames[0].tex})); bph.position.z=.04; big.add(bph);
  var bwash=new THREE.Mesh(new THREE.PlaneGeometry(5.4,6.4),additive(washTex)); bwash.position.z=.02; bwash.renderOrder=1; big.add(bwash);
  var plin=new THREE.Mesh(new THREE.BoxGeometry(.7,.75,1.7),white); plin.position.set(FX+1.9,.375,FZ); scene.add(plin);
  var plq=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.6),new THREE.MeshBasicMaterial({map:featTex})); plq.position.set(FX+1.9-.06,.86,FZ); plq.rotation.set(-.55,Math.PI/2,0,'YXZ'); scene.add(plq);
  var plb=new THREE.Mesh(new THREE.BoxGeometry(1.52,.62,.04),new THREE.MeshStandardMaterial({color:0x0c0c0e,roughness:.5})); plb.position.copy(plq.position); plb.position.x-=.03; plb.rotation.copy(plq.rotation); scene.add(plb);
  COLL.push({x0:FX,x1:FX+2.3,z0:FZ-2.7,z1:FZ+2.7});
  drawFeature();

  /* ---- gift wrap + padlock over the secret-room photo; opens with a password ---- */
  (function(){
    var GIFT=window.GIFT={locked:true,opening:false,k:0,pick:[],mats:[]};
    var cg=new THREE.Group(); cg.position.z=.1; big.add(cg); GIFT.grp=cg;
    function M(o){ o.transparent=true; o.side=THREE.DoubleSide; var m=new THREE.MeshStandardMaterial(o); GIFT.mats.push(m); return m; }
    var pw=bw+.2, ph2=bh+.2;
    var wrapTex=gTex(512,640,function(x,w,h){
      var g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#e0506b'); g.addColorStop(1,'#9c2640'); x.fillStyle=g; x.fillRect(0,0,w,h);
      x.fillStyle='rgba(255,226,232,.34)'; for(var r=0;r<9;r++) for(var c=0;c<7;c++){ heartPath(x,(c+(r%2?.5:0))*78+22,r*76+40,13); x.fill(); }
      var sh=x.createLinearGradient(0,0,w,0); sh.addColorStop(0,'rgba(255,255,255,.14)'); sh.addColorStop(.5,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(0,0,0,.14)'); x.fillStyle=sh; x.fillRect(0,0,w,h);
    });
    var paperM=M({map:wrapTex,roughness:.5});
    /* two doors that swing open like a wardrobe: same texture, split UVs */
    function half(right){ var gm=new THREE.PlaneGeometry(pw/2,ph2), uv=gm.attributes.uv; for(var q=0;q<uv.count;q++) uv.setX(q,uv.getX(q)*.5+(right?.5:0)); uv.needsUpdate=true;
      var hinge=new THREE.Group(); hinge.position.x=right?pw/2:-pw/2; cg.add(hinge); var m=new THREE.Mesh(gm,paperM); m.position.x=right?-pw/4:pw/4; hinge.add(m); GIFT.pick.push(m); return hinge; }
    var doorL=half(false), doorR=half(true);
    var gold=M({color:0xe8c26e,roughness:.3,metalness:.55,emissive:0x3a2a0c}), cream=M({color:0xfff0d8,roughness:.45});
    var rv=new THREE.Mesh(new THREE.PlaneGeometry(.28,ph2),cream); rv.position.z=.012; cg.add(rv);
    var rh=new THREE.Mesh(new THREE.PlaneGeometry(pw,.28),cream); rh.position.z=.014; cg.add(rh);
    [rv,rh].forEach(function(r){ GIFT.pick.push(r); });
    /* bow */
    var bow=new THREE.Group(); bow.position.set(0,ph2/2-.14,.05); cg.add(bow);
    [-1,1].forEach(function(sd){ var lp=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),cream); lp.scale.set(.34,.19,.08); lp.position.set(sd*.27,.08,0); lp.rotation.z=sd*.5; bow.add(lp); GIFT.pick.push(lp);
      var tl=new THREE.Mesh(new THREE.PlaneGeometry(.11,.34),cream); tl.position.set(sd*.11,-.22,-.005); tl.rotation.z=sd*.28; bow.add(tl); });
    var kn=new THREE.Mesh(new THREE.SphereGeometry(.1,14,10),cream); kn.position.z=.03; bow.add(kn);
    /* padlock */
    var lock=new THREE.Group(); lock.position.set(0,-.02,.12); cg.add(lock); GIFT.lock=lock;
    var body=new THREE.Mesh(new THREE.BoxGeometry(.62,.48,.22),gold); lock.add(body); GIFT.pick.push(body);
    var plate=new THREE.Mesh(new THREE.BoxGeometry(.5,.37,.02),M({color:0xf6d98e,roughness:.25,metalness:.6})); plate.position.z=.115; lock.add(plate);
    var hole=new THREE.Mesh(new THREE.CircleGeometry(.055,16),M({color:0x2a1a10,roughness:1})); hole.position.set(0,.045,.127); lock.add(hole);
    var slot=new THREE.Mesh(new THREE.BoxGeometry(.034,.12,.004),M({color:0x2a1a10,roughness:1})); slot.position.set(0,-.055,.127); lock.add(slot);
    var shp=new THREE.Group(); shp.position.set(.19,.23,0); lock.add(shp); GIFT.shp=shp;
    var sk=new THREE.Mesh(new THREE.TorusGeometry(.19,.05,12,28,Math.PI),gold); sk.position.x=-.19; shp.add(sk); GIFT.pick.push(sk);
    var lg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.07,10),gold); lg.position.set(-.38,-.035,0); shp.add(lg);

    /* glow + sparkle sprites (additive, never fogged) */
    var sprTex=(function(){ var c=document.createElement('canvas'); c.width=c.height=64; var q=c.getContext('2d'), g=q.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.25,'rgba(255,225,170,.85)'); g.addColorStop(1,'rgba(255,200,140,0)'); q.fillStyle=g; q.fillRect(0,0,64,64); return canvasTex(c); })();
    function spr(sz,op,col){ var m=new THREE.Sprite(new THREE.SpriteMaterial({map:sprTex,color:col||0xffffff,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); m.scale.set(sz,sz,1); return m; }
    var glint=spr(.9,0,0xfff1c8); glint.position.set(.2,.2,.2); lock.add(glint);           /* idle twinkle on the lock */
    var flare=spr(6,0,0xffd9b8); flare.position.set(0,0,-.02); cg.add(flare);              /* reveal flash behind the wrap */
    var sparks=[]; for(var si=0;si<46;si++){ var sp=spr(.14+Math.random()*.2,0,si%3?0xffe1a8:0xffb3c6); sp.visible=false; big.add(sp); sparks.push({m:sp,vx:0,vy:0,vz:0,life:0,max:1}); }
    var burstDone=false, revealPulse=false;
    function emit(){ sparks.forEach(function(p,i){ var a=Math.random()*6.283, v=.8+Math.random()*2.2; p.m.position.set(lock.position.x,lock.position.y+.1,.3); p.vx=Math.cos(a)*v; p.vy=Math.sin(a)*v*.9+.5; p.vz=Math.random()*1.2; p.life=0; p.max=1.2+Math.random()*1.2; p.m.visible=true; }); }
    function ease(t){ return t<0?0:t>1?1:t*t*(3-2*t); }
    function back(t){ t=t<0?0:t>1?1:t; var c=1.9; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); }

    var BTN=$('giftBtn'), MOD=$('giftModal'), IN=$('gmIn'), CARD=MOD.querySelector('.gm-card'), tries=0;
    function G(){ var ar=LANG==='ar'; return ar?{btn:'🎁 افتحي الهدية',t:'هدية مقفولة 🎁',s:'اكتبي كلمة السر عشان تفتحيها',ph:'كلمة السر',ok:'افتحي 🔓',no:'مش دلوقتي',bad:'كلمة السر غلط، جرّبي تاني 💭',done:'اتفتحت! 💕'}:{btn:'🎁 Open the gift',t:'A locked gift 🎁',s:'Type the password to open it',ph:'Password',ok:'Open 🔓',no:'Not now',bad:'Wrong password, try again 💭',done:'Unlocked! 💕'}; }
    function norm(v){ return String(v||'').toLowerCase().replace(/[ً-ٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[٠-٩]/g,function(c){ return String(c.charCodeAt(0)-1632); }).replace(/[۰-۹]/g,function(c){ return String(c.charCodeAt(0)-1776); }).replace(/\s+/g,''); }
    function okList(){ var l=[C('gpass')]; if(!cfg.gpass||cfg.gpass===DEFS.en.gpass||cfg.gpass===DEFS.ar.gpass){ l.push(DEFS.en.gpass,DEFS.ar.gpass); } return l.map(norm).filter(Boolean); }
    window.giftAsk=function(){
      if(!GIFT.locked||GIFT.opening) return; var g=G(); $('gmT').textContent=g.t; $('gmS').textContent=g.s; IN.placeholder=g.ph; $('gmOk').textContent=g.ok; $('gmNo').textContent=g.no; $('gmH').textContent=C('ghint'); $('gmE').textContent=''; IN.value='';
      MOD.hidden=false; setTimeout(function(){ try{ IN.focus(); }catch(e){} },60);
    };
    function closeAsk(){ MOD.hidden=true; try{ IN.blur(); }catch(e){} }
    function submit(){
      var v=norm(IN.value); if(!v) return;
      if(okList().indexOf(v)>=0){ closeAsk(); giftUnlock(false); }
      else { tries++; $('gmE').textContent=G().bad; CARD.classList.remove('shake'); void CARD.offsetWidth; CARD.classList.add('shake'); chime([60,56],.12,.14); IN.select(); }
    }
    window.giftUnlock=function(fromRemote){
      if(!GIFT.locked||GIFT.opening) return; GIFT.opening=true; GIFT.k=0; burstDone=false; revealPulse=false; if(!fromRemote){ send({t:'gift'}); } else closeAsk();
      toast(G().done,3200); chime([79,83,86],.1,.14);
    };
    window.giftUpdate=function(px,pz){
      var near=GIFT.locked&&!GIFT.opening&&MOD.hidden&&Math.hypot(px-(FX+1.5),pz-FZ)<3.8; if(near){ BTN.textContent=G().btn; } BTN.hidden=!near;
    };
    var DUR=5;
    window.giftTick=function(dt,now){
      /* sparkles keep flying after the wrap is gone */
      sparks.forEach(function(p){ if(!p.m.visible) return; p.life+=dt; var u=p.life/p.max; if(u>=1){ p.m.visible=false; return; } p.vy-=.9*dt; p.m.position.x+=p.vx*dt; p.m.position.y+=p.vy*dt; p.m.position.z+=p.vz*dt; p.m.material.opacity=Math.sin(Math.min(1,u)*Math.PI)*.95; p.m.scale.setScalar((.12+.2*(1-u))*(1+.3*Math.sin(now*.02+p.max*9))); });
      if(!GIFT.grp.visible) return;
      if(!GIFT.opening){ lock.rotation.z=Math.sin(now*.002)*.045; glint.material.opacity=Math.max(0,Math.sin(now*.003))*.9; glint.scale.setScalar(.5+.5*Math.max(0,Math.sin(now*.003))); return; }
      GIFT.k=Math.min(1,GIFT.k+dt/DUR); var k=GIFT.k;
      /* 1 (0-.2): lock trembles, glows, shackle springs open */
      var a1=ease(k/.2), a1b=back((k-.06)/.14);
      lock.rotation.z=Math.sin(k*90)*.07*(1-a1)*Math.min(1,k*8)+(k>.2?lock.rotation.z:0);
      glint.material.opacity=Math.min(1,a1*1.2)*(k<.3?1:Math.max(0,1-(k-.3)/.1)); glint.scale.setScalar(.8+a1*1.6);
      shp.rotation.y=1.2*a1b; shp.position.y=.23+.1*ease((k-.06)/.14);
      if(k>.2&&!burstDone){ burstDone=true; emit(); burst(60); chime([76,79,83,88,91],.1,.16); try{ playReal('bell',.3); }catch(e){} }
      /* 2 (.2-.5): lock drops with a spin, ribbons slide away, bow floats up */
      var f=ease((k-.2)/.3), g2=(k-.2)/.3<0?0:Math.min(1,(k-.2)/.3);
      if(k>.2){ lock.position.y=-.02-g2*g2*2.2; lock.rotation.z=g2*2.6; lock.position.z=.12+g2*.4; }
      rv.position.y=f*ph2*.8; rh.position.x=f*pw*.8; rv.position.x=0;
      bow.position.y=ph2/2-.14+f*1.1; bow.rotation.z=f*.9; bow.scale.setScalar(1+f*.35);
      /* 3 (.42-.78): the two doors swing open, the photo is revealed in a flash */
      var d=ease((k-.42)/.36), dOut=ease((k-.62)/.3);
      doorL.rotation.y=-d*1.75; doorR.rotation.y=d*1.75;
      var fl=Math.sin(ease((k-.4)/.35)*Math.PI); flare.material.opacity=fl*.9; flare.scale.setScalar(4.5+fl*2.5);
      if(k>.5&&!revealPulse){ revealPulse=true; burst(40); chime([84,88,91,96],.12,.2); try{ playReal('tada',.35); }catch(e){} }
      /* fade everything wrapped, in order: ribbon+bow+lock first, doors last */
      var fadeA=ease((k-.3)/.25), fadeB=dOut;
      GIFT.mats.forEach(function(m){ m.opacity=1; });
      paperM.opacity=1-fadeB; cream.opacity=1-fadeA; gold.opacity=1-fadeA; lock.children.forEach(function(c){ if(c!==glint&&c.material&&c.material!==gold) c.material.opacity=1-fadeA; });
      if(k>=1){ cg.visible=false; GIFT.locked=false; GIFT.opening=false; GIFT.pick.length=0; flare.material.opacity=0; }
    };
    BTN.addEventListener('click',function(){ giftAsk(); });
    $('gmOk').addEventListener('click',submit); $('gmNo').addEventListener('click',closeAsk);
    MOD.addEventListener('click',function(e){ if(e.target===MOD) closeAsk(); });
    ['keydown','keyup'].forEach(function(ev){ IN.addEventListener(ev,function(e){ e.stopPropagation(); if(ev==='keydown'){ if(e.key==='Enter') submit(); else if(e.key==='Escape') closeAsk(); } }); });
  })();
  /* display cases */
  var glassM=new THREE.MeshStandardMaterial({color:0xdfeeff,transparent:true,opacity:.2,roughness:.05,metalness:.1,depthWrite:false});
  var goldM=new THREE.MeshStandardMaterial({color:0xdcb25c,emissive:0x4a3410,roughness:.3,metalness:.6});
  function dcase(cx,cz,kind){
    var ped=new THREE.Mesh(new THREE.BoxGeometry(.75,1.0,.75),white); ped.position.set(cx,.5,cz); scene.add(ped);
    var cs=new THREE.Mesh(new THREE.BoxGeometry(.6,.55,.6),glassM); cs.position.set(cx,1.28,cz); cs.renderOrder=2; scene.add(cs);
    var cap=new THREE.Mesh(new THREE.BoxGeometry(.66,.04,.66),white); cap.position.set(cx,1.0+.02,cz); scene.add(cap);
    if(kind===0){
      var sh=new THREE.Shape(); sh.moveTo(0,-.5); sh.bezierCurveTo(-1,.1,-.5,.9,0,.4); sh.bezierCurveTo(.5,.9,1,.1,0,-.5);
      var hg=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.35,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2}),goldM); hg.scale.set(.2,.2,.2); hg.position.set(cx,1.2,cz-.04); hg.rotation.y=.5; scene.add(hg);
    } else {
      var rg2=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,10,28),goldM); rg2.position.set(cx,1.22,cz); rg2.rotation.y=.6; scene.add(rg2);
      var gem=new THREE.Mesh(new THREE.OctahedronGeometry(.045),new THREE.MeshStandardMaterial({color:0xcfe9ff,emissive:0x5a7a99,roughness:.1,metalness:.3})); gem.position.set(cx+Math.sin(.6)*0,1.36,cz); scene.add(gem);
    }
    var sp=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),additive(washTex)); sp.rotation.x=-Math.PI/2; sp.position.set(cx,.02,cz); sp.renderOrder=1; scene.add(sp);
    COLL.push({x0:cx-.4,x1:cx+.4,z0:cz-.4,z1:cz+.4});
  }
  dcase(-3.6,-2,0); dcase(3.6,-2,1); dcase(-3.6,-34,1); dcase(3.6,-34,0);
  /* Robert Indiana's LOVE as the focal sculpture in the center aisle */
  (function(){
    var sculpture=new THREE.Group(); sculpture.position.set(0,0,ZC); sculpture.scale.setScalar(1.5); scene.add(sculpture);
    var stone=new THREE.MeshStandardMaterial({color:0xe9e2d8,roughness:.48,metalness:.08});
    var gold=new THREE.MeshStandardMaterial({color:0xd9b25e,roughness:.32,metalness:.62,emissive:0x392708,emissiveIntensity:.18});
    var red=new THREE.MeshStandardMaterial({color:0xc83250,roughness:.34,metalness:.12,emissive:0x3b0814,emissiveIntensity:.16});
    var dark=new THREE.MeshStandardMaterial({color:0x2a1820,roughness:.48,metalness:.25});
    function cylinder(rt,rb,h,y,m){ var o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,48),m); o.position.y=y; sculpture.add(o); return o; }
    cylinder(1.08,1.2,.18,.09,stone);
    cylinder(1.0,1.08,.18,.27,gold);
    cylinder(.96,1.02,.16,.43,stone);
    var rim=new THREE.Mesh(new THREE.TorusGeometry(1.01,.022,8,64),gold); rim.rotation.x=Math.PI/2; rim.position.y=.52; sculpture.add(rim);
    function shape(points){ var s=new THREE.Shape(); s.moveTo(points[0][0],points[0][1]); for(var i=1;i<points.length;i++) s.lineTo(points[i][0],points[i][1]); s.closePath(); return s; }
    function roundedO(){
      var s=new THREE.Shape(), w=.86, h=.86, r=.12;
      s.moveTo(r,0); s.lineTo(w-r,0); s.quadraticCurveTo(w,0,w,r); s.lineTo(w,h-r); s.quadraticCurveTo(w,h,w-r,h); s.lineTo(r,h); s.quadraticCurveTo(0,h,0,h-r); s.lineTo(0,r); s.quadraticCurveTo(0,0,r,0);
      var hole=new THREE.Path(); hole.absarc(w/2,h/2,.235,0,Math.PI*2,true); s.holes.push(hole); return s;
    }
    function glyph(s,x,y,tilt){
      var geo=new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.035,curveSegments:18});
      var mesh=new THREE.Mesh(geo,[gold,red]); mesh.position.set(-.43,-.43,0);
      var holder=new THREE.Group(); holder.position.set(x+.43,y+.43,.02); holder.rotation.z=tilt||0; holder.add(mesh); sculpture.add(holder);
    }
    var L=shape([[0,0],[.86,0],[.86,.2],[.23,.2],[.23,.86],[0,.86]]);
    var V=shape([[0,.86],[.25,.86],[.43,.35],[.61,.86],[.86,.86],[.59,0],[.43,.39],[.27,0]]);
    var E=shape([[0,0],[.86,0],[.86,.2],[.23,.2],[.23,.34],[.73,.34],[.73,.53],[.23,.53],[.23,.66],[.86,.66],[.86,.86],[0,.86]]);
    glyph(L,-.91,1.49,0); glyph(roundedO(),.05,1.49,-.18);
    glyph(V,-.91,.59,0); glyph(E,.05,.59,0);
    var plaque=new THREE.Mesh(new THREE.BoxGeometry(.94,.2,.045),dark); plaque.position.set(0,.27,1.05); sculpture.add(plaque);
    var plaqueCv=document.createElement('canvas'); plaqueCv.width=512; plaqueCv.height=96; var px=plaqueCv.getContext('2d');
    px.fillStyle='#2a1820'; px.fillRect(0,0,512,96); px.strokeStyle='#d9b25e'; px.lineWidth=4; px.strokeRect(5,5,502,86);
    px.fillStyle='#f4e7d5'; px.textAlign='center'; px.textBaseline='middle'; px.font='600 28px Inter,sans-serif'; px.fillText('LOVE  ·  ROBERT INDIANA',256,50);
    var plaqueText=new THREE.Mesh(new THREE.PlaneGeometry(.85,.14),new THREE.MeshBasicMaterial({map:canvasTex(plaqueCv)}));
    plaqueText.position.set(0,.27,1.076); sculpture.add(plaqueText);
    var floorRing=new THREE.Mesh(new THREE.TorusGeometry(1.42,.018,8,72),gold); floorRing.rotation.x=Math.PI/2; floorRing.position.y=.025; sculpture.add(floorRing);
    var spot=new THREE.SpotLight(0xffe2c8,1.5,10,Math.PI/4,1,1); spot.position.set(0,4.7,ZC+1.7); spot.target.position.set(0,1.2,ZC); scene.add(spot); scene.add(spot.target);
    COLL.push({x0:-1.84,x1:1.84,z0:ZC-1.84,z1:ZC+1.84});
  })();
})();

/* 5. sparkle / heart pool, emotes */
var DUSTT=radialTex('rgba(226,204,196,.85)','rgba(226,204,196,0)');
var pool=[]; for(var pi2=0;pi2<90;pi2++){ var ps=new THREE.Sprite(new THREE.SpriteMaterial({map:gt('255,225,170'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0})); ps.visible=false; ps.userData={t:9,l:1,vy:0,vx:0,sc:.1}; scene.add(ps); pool.push(ps); }
function emit(map,add,x,y,z,sc,life,vy,vx){ for(var i=0;i<pool.length;i++){ var s=pool[i],d=s.userData; if(d.t>=d.l){ s.material.map=map; s.material.blending=add?THREE.AdditiveBlending:THREE.NormalBlending; s.position.set(x,y,z); d.t=0; d.l=life; d.vy=vy; d.vx=vx||0; d.sc=sc; s.visible=true; return; } } }
function heartsAt(x,y,z,n,sp){ for(var i=0;i<n;i++) emit(heartTex,false,x+(Math.random()-.5)*sp,y+Math.random()*.8,z+(Math.random()-.5)*sp,.2+Math.random()*.2,2.2+Math.random(),.7+Math.random()*.5,(Math.random()-.5)*.2); }
function fxHearts(i){ var f=galleryFrames[i], side=f.x<0?1:-1; heartsAt(f.x+side*1.1,1.6,f.z,16,2.4); }
function emote(key,ch){ var e=document.createElement('div'); e.className='emote'; var s=document.createElement('span'); s.textContent=ch; e.appendChild(s); bubblesEl.appendChild(e); emotes.push({el:e,key:key,t:performance.now()}); }
function standUp(){ if(!seat) return; player.position.set(seat.x+(seat.x<0?1.3:-1.3),0,seat.z); seat=null; }
function sitToggle(){ if(state!=='explore') return; if(seat){ standUp(); return; } var best=null,bd=2.8; BZ.forEach(function(b){ var d=Math.hypot(b[0]-player.position.x,b[1]-player.position.z); if(d<bd){ bd=d; best={x:b[0],z:clampN(player.position.z,b[1]-1.3,b[1]+1.3),r:b.length>2?b[2]:(b[0]<0?-Math.PI/2:Math.PI/2)}; } });
  if(!best){ toast(LANG==='ar'?'قرّبي من أي دكة الأول':'Walk up to a bench first',2200); return; } seat=best; vx=vz=0; }
function doWave(){ doReact('wave'); }
function doHeart(){ doReact('heart'); }
var stl=document.createElement('style'); stl.textContent='#emotes{position:absolute;z-index:26;inset-inline-end:max(12px,env(safe-area-inset-right,0px));bottom:calc(max(18px,env(safe-area-inset-bottom,0px)) + 54px);display:flex;flex-direction:column;gap:8px}#emotes button{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:rgba(20,18,23,.7);backdrop-filter:blur(8px);font-size:20px;padding:0}#emotes .tray button:disabled{opacity:.32;filter:grayscale(1);cursor:not-allowed}.emote{position:absolute;left:0;top:0;will-change:transform}.emote span{display:block;font-size:30px;animation:emRise 2.2s ease-out forwards}@keyframes emRise{0%{opacity:0;transform:translateY(8px) scale(.5)}15%{opacity:1;transform:translateY(0) scale(1.15)}80%{opacity:1}100%{opacity:0;transform:translateY(-34px)}}body.garden #ask{background:linear-gradient(to bottom,rgba(40,15,50,.5) 0,rgba(40,15,50,0) 40%,rgba(40,15,50,.35) 100%)}';
document.head.appendChild(stl);
var emEl=document.createElement('div'); emEl.id='emotes'; emEl.hidden=true; stage.appendChild(emEl);
/* Top bar order: Intro, React (right under it), then Sound effects + Music. */
(function(){ var tm=tMusic, ts=tSfx, tools=document.getElementById('tools'); if(!tm||!ts||!tools) return;
  var row=document.createElement('div'); row.id='soundControls'; tools.insertBefore(row,tm); row.appendChild(emEl); row.appendChild(ts); row.appendChild(tm);
  var st=document.createElement('style'); st.textContent='#tools{display:flex;flex-direction:column;align-items:flex-end}#tHome{order:-3}#emotes{order:-2;position:relative;inset:auto;bottom:auto;inset-inline-end:auto;display:flex;flex-direction:column;align-items:flex-end;z-index:30;pointer-events:auto}#emotes[hidden]{display:none!important}#soundControls #emotes .em-main{width:34px;height:34px;min-height:34px;padding:0;border-radius:50%;justify-content:center;gap:0;box-shadow:0 4px 18px rgba(0,0,0,.28)}#emotes .tray{position:absolute;top:calc(100% + 8px);inset-inline-end:0;z-index:40}#soundControls{order:-1;display:flex;align-items:center;justify-content:flex-end;gap:8px;position:relative;pointer-events:none}#soundControls>*{pointer-events:auto}'; document.head.appendChild(st); try{ refreshExtra(); }catch(e){} })();
