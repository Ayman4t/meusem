/* Roof lights, spotlights, photo booth, drawing studio, painter */
'use strict';

/* ===== ROOF LIGHTS, PAINTING SPOTLIGHTS, ROOM NAMES ===== */
(function(){
  var ADD=function(m){ m.transparent=true; m.blending=THREE.AdditiveBlending; m.depthWrite=false; m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-4; return m; };
  var halo=gTex(128,128,function(x,w,h){ var g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); g.addColorStop(0,'rgba(255,228,190,1)'); g.addColorStop(.35,'rgba(255,210,170,.45)'); g.addColorStop(1,'rgba(255,200,160,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); });
  var headM=new THREE.MeshStandardMaterial({color:0x151215,roughness:.4,metalness:.5});
  var warm=new THREE.MeshBasicMaterial({color:0xfff0d6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
  function mesh(g,m,x,y,z){ var o=new THREE.Mesh(g,m); o.position.set(x,y,z); scene.add(o); return o; }
  /* ---- roof: glowing cove strips along both sides + recessed round lights down the middle ---- */
  [-1,1].forEach(function(sd){
    mesh(new THREE.BoxGeometry(.18,.04,L-2),warm,sd*(W/2-.9),H-.03,ZC);
    mesh(new THREE.PlaneGeometry(1.3,L-2),ADD(new THREE.MeshBasicMaterial({color:0xff9f78,opacity:.16})),sd*(W/2-.9),H-.02,ZC).rotation.x=Math.PI/2;
  });
  for(var z=ZF-2; z>ZB+1; z-=4){
    [-5,0,5].forEach(function(x){
      mesh(new THREE.CylinderGeometry(.34,.34,.06,24),headM,x,H-.03,z);
      mesh(new THREE.CircleGeometry(.27,24),warm,x,H-.07,z).rotation.x=Math.PI/2;
      var hl=mesh(new THREE.PlaneGeometry(2.6,2.6),ADD(new THREE.MeshBasicMaterial({map:halo,opacity:.5})),x,H-.09,z); hl.rotation.x=Math.PI/2;
      var fp=mesh(new THREE.PlaneGeometry(3.6,3.6),ADD(new THREE.MeshBasicMaterial({map:halo,opacity:.2})),x,.012,z); fp.rotation.x=-Math.PI/2;
    });
  }
  hallLights.forEach(function(l){ l.intensity=.34; });
  /* ---- one spotlight on the roof for every painting ---- */
  SLOTS.forEach(function(sl){
    var side=sl.x<0?-1:1, fx=side*(W/2-2.3), fy=H-.14;
    var tx=sl.x, ty=FY-.05, tz=sl.z;
    var rail=mesh(new THREE.BoxGeometry(.5,.05,.12),headM,fx,H-.04,sl.z);
    var head=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,.3,16).rotateX(Math.PI/2),headM); head.position.set(fx,fy,sl.z); head.lookAt(tx,ty,tz); scene.add(head);
    var lens=new THREE.Mesh(new THREE.CircleGeometry(.1,16),warm); lens.position.copy(head.position); lens.lookAt(tx,ty,tz); lens.translateZ(.155); scene.add(lens);
    var len=Math.hypot(tx-fx,ty-fy,tz-sl.z);
    var len2=len*1.2, cone=new THREE.Mesh(new THREE.ConeGeometry(1.5,len2,24,1,true).translate(0,-len2/2,0).rotateX(-Math.PI/2),ADD(new THREE.MeshBasicMaterial({color:0xffe2b8,opacity:.07,side:THREE.DoubleSide})));
    cone.position.set(fx,fy,sl.z); cone.lookAt(tx,ty,tz); scene.add(cone);
    var wash=new THREE.Mesh(new THREE.PlaneGeometry(3.4,4.4),ADD(new THREE.MeshBasicMaterial({map:halo,opacity:.55})));
    wash.position.set(side*(W/2-.025),FY,sl.z); wash.rotation.y=side<0?Math.PI/2:-Math.PI/2; scene.add(wash);
    var pool=mesh(new THREE.PlaneGeometry(3.2,2.2),ADD(new THREE.MeshBasicMaterial({map:halo,opacity:.35})),side*(W/2-1.4),.014,sl.z); pool.rotation.x=-Math.PI/2;
  });
  /* ---- room name above the two hall doors that had no sign ---- */
  function bigSignTex(en,ar,col){ return gTex(1024,336,function(x,w,h){ x.fillStyle='#1b1519'; x.fillRect(0,0,w,h); x.strokeStyle=col; x.lineWidth=8; x.strokeRect(12,12,w-24,h-24); x.textAlign='center'; x.fillStyle='#fff3f0'; x.font='700 112px Inter,"IBM Plex Sans Arabic",sans-serif'; x.fillText(en,w/2,150,w-80); x.fillStyle=col; x.font='600 86px "IBM Plex Sans Arabic",Inter,sans-serif'; x.fillText(ar,w/2,268,w-80); }); }
  window.bigSignTex=bigSignTex;
  function nameSign(side,en,ar,col){
    var tx=bigSignTex(en,ar,col);
    var m=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.18),new THREE.MeshBasicMaterial({map:tx})); m.position.set(side*(W/2-.05),4.2,DOORZ); m.rotation.y=side<0?Math.PI/2:-Math.PI/2; scene.add(m);
  }
  nameSign(-1,'SECRET ROOM','الأوضة السرية','#ff8fa8');
  nameSign(1,'CINEMA ROOM','أوضة العرض','#8a90ff');
})();

/* ===== NEW ROOMS: Photo Booth (west) and Drawing Studio (east); both work live over the same invite link ===== */
var RZ0=-28.5, RZ1=-22.5, RCZ=-25.5, bFilter=0, bBusy=false, album=[], albumDirty=true, curZone=0, zoneLang='', seenZ={}, soloAt=false, albumTex=null, drawWallTex=null, drawPlane=null, albumPlane=null, phoSel=0;
var albumCv=document.createElement('canvas'); albumCv.width=1280; albumCv.height=640;
var drawWallCv=document.createElement('canvas'); drawWallCv.width=1024; drawWallCv.height=768; var drawWallX=drawWallCv.getContext('2d');
var RMT={
 en:{pSign:'PHOTO BOOTH',dSign:'DRAWING STUDIO',snap:'📸 Take a photo',album:'🖼 Album',filt:'Filter',filters:['Normal','Warm','Black & white','Dreamy','Hearts'],draw:'🎨 Draw together',paint:'🖌 Draw the two of us',
  tipP:'Stand on the hearts on the floor and pose, or sit on the sofa. Try the React button too!',tipD:'Draw us. Whatever you draw shows on the big wall, live.',cheese:'Say cheese!',albT:'Photo album',save:'Save',close:'Close',del:'Delete',trace:'✏ Draw over it',
  empty:'No photos yet. Take one in the booth!',dTitle:'Draw us',brush:'Brush',eraser:'Eraser',hearts:'Hearts',undo:'Undo',clear:'Clear',saveP:'Save picture',guide:'Guide',tracePh:'Trace photo',
  withU:'Your partner is drawing with you 💕',alone:'Drawing alone. It still hangs on the wall.',noPhoto:'Take a photo in the Photo Booth first',confirmC:'Clear the whole drawing?',pDraw:'Your partner is drawing in the Drawing Studio ✏️',wall:'Our photo wall ♥',saved:'Saved'},
 ar:{pSign:'ركن التصوير',dSign:'ورشة الرسم',snap:'📸 التقاط صورة',album:'🖼 الألبوم',filt:'الفلتر',filters:['عادي','دافئ','أبيض وأسود','حالم','قلوب'],draw:'🎨 ارسما معاً',paint:'🖌 ارسمي الشخصيتين',
  tipP:'قفوا على القلوب اللي في الأرض وخدوا بوز، أو اقعدوا على الكنبة. جرّبوا زرار التفاعل كمان!',tipD:'ارسمونا. أي حاجة ترسموها بتظهر على الحيطة الكبيرة على طول.',cheese:'قولوا تشيز!',albT:'ألبوم الصور',save:'حفظ',close:'إغلاق',del:'حذف',trace:'✏ ارسم فوقها',
  empty:'مفيش صور لسه. صوّروا واحدة في ركن التصوير!',dTitle:'ارسمونا',brush:'فرشاة',eraser:'ممحاة',hearts:'قلوب',undo:'تراجع',clear:'مسح',saveP:'حفظ الصورة',guide:'مرشد',tracePh:'تتبّع صورة',
  withU:'شريكك بيرسم معاك 💕',alone:'بترسم لوحدك. والرسمة هتتعلّق على الحيطة برضه.',noPhoto:'صوّروا صورة في ركن التصوير الأول',confirmC:'تمسح الرسمة كلها؟',pDraw:'شريكك بيرسم في ورشة الرسم ✏️',wall:'حيطة صورنا ♥',saved:'اتحفظ'}
};
function rmt(k){ var d=RMT[LANG]||RMT.en; return d[k]!==undefined?d[k]:RMT.en[k]; }
function zoneOf(p){ if(p.z<RZ0||p.z>RZ1) return 0; if(p.x<-13.7) return 1; if(p.x>13.7) return 2; return 0; }
function zeroKeys(){ keys.up=keys.down=keys.left=keys.right=keys.rl=keys.rr=keys.shift=0; joy.x=joy.y=0; }

/* ---- UI shell ---- */
var rmStyle=document.createElement('style'); rmStyle.textContent=
'#roomAct{position:absolute;z-index:27;left:50%;bottom:calc(max(18px,env(safe-area-inset-bottom,0px)) + 108px);transform:translateX(-50%);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 24px)}'+
'#cdown{position:absolute;inset:0;z-index:92;display:flex;align-items:center;justify-content:center;text-align:center;pointer-events:none;font-family:var(--serif);color:#fff;text-shadow:0 6px 40px rgba(232,80,107,.95)}'+
'#cdown.pop{animation:cdpop .9s ease-out}@keyframes cdpop{0%{transform:scale(.4);opacity:0}25%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:.9}}'+
'#flashFx{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:93}'+
'.rm-ov{position:absolute;inset:0;z-index:78;background:rgba(48,12,30,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:max(10px,env(safe-area-inset-top,0px)) 10px max(10px,env(safe-area-inset-bottom,0px))}'+
'.rm-card{width:min(900px,100%);max-height:100%;overflow:auto;background:#fff;color:#3a1d28;border:1px solid rgba(232,80,107,.28);border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 30px 80px rgba(120,20,50,.35)}'+
'.rm-card header{display:flex;align-items:center;justify-content:space-between;gap:10px}.rm-card h2{font-family:var(--serif);font-weight:500;font-size:26px;margin:0;color:#a82a43}'+
'.rm-card .ghost{background:#fff0f2;border:1px solid rgba(232,80,107,.45);color:#a82a43}.rm-card .note{color:#8a5a68}'+
'.dr-st{font-size:13px;color:#9a5a6c}.dr-wrap{background:#fff8f0;border:1px solid rgba(168,42,67,.22);border-radius:12px;overflow:hidden;display:flex;justify-content:center}'+
'#drCv{width:min(100%,calc(54vh*1.3333));height:auto;aspect-ratio:4/3;touch-action:none;cursor:crosshair;display:block}'+
'.dr-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center}'+
'.rb{border:1px solid rgba(232,80,107,.35);background:#fff0f2;color:#a82a43;border-radius:12px;padding:8px 12px;min-height:38px;font-size:13px;font-weight:600}.rb.on{background:#e8506b;color:#fff;border-color:#e8506b}'+
'.sw{width:30px;height:30px;border-radius:50%;border:2px solid rgba(58,29,40,.25);padding:0}.sw.on{box-shadow:0 0 0 3px #e8506b;border-color:#fff}'+
'.pho-img{max-width:100%;max-height:52vh;align-self:center;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.25)}.pho-th{display:flex;gap:8px;overflow:auto;justify-content:center}.pho-th img{height:64px;border-radius:4px;border:2px solid transparent;cursor:pointer}.pho-th img.on{border-color:#e8506b}';
document.head.appendChild(rmStyle);
var act=document.createElement('div'); act.id='roomAct'; act.hidden=true; stage.appendChild(act);
var cdEl=document.createElement('div'); cdEl.id='cdown'; cdEl.hidden=true; stage.appendChild(cdEl);
var flashEl=document.createElement('div'); flashEl.id='flashFx'; stage.appendChild(flashEl);
var phoEl=document.createElement('div'); phoEl.className='rm-ov'; phoEl.hidden=true; stage.appendChild(phoEl);
var drEl=document.createElement('div'); drEl.className='rm-ov'; drEl.hidden=true; stage.appendChild(drEl);
drEl.innerHTML='<div class="rm-card"><header><h2 id="drT"></h2><button class="ghost sm" id="drX"></button></header><div class="dr-st" id="drSt"></div><div class="dr-wrap"><canvas id="drCv" width="1200" height="900"></canvas></div><div class="dr-row" id="drR1"></div><div class="dr-row" id="drR2"></div><div class="dr-row" id="drR3"></div></div>';
var drCv=$('drCv'), drCx=drCv.getContext('2d');

/* ---- 3D rooms ---- */
(function buildRooms(){
  function pl(w,hh,m,x,y,z,rx,ry){ var p=new THREE.Mesh(new THREE.PlaneGeometry(w,hh),m); p.position.set(x,y,z); p.rotation.set(rx||0,ry||0,0); scene.add(p); return p; }
  function room(side,wallCol,floorTex,ceilCol,glowC){
    var X0=side<0?-21:13, X1=side<0?-13:21, cx=(X0+X1)/2, h=4, far=side<0?X0:X1, ry=side<0?Math.PI/2:-Math.PI/2;
    var wm=new THREE.MeshStandardMaterial({color:wallCol,roughness:.95,side:THREE.DoubleSide});
    pl(8,6,new THREE.MeshStandardMaterial({map:floorTex,roughness:.6}),cx,.008,RCZ,-Math.PI/2,0);
    pl(8,6,new THREE.MeshStandardMaterial({color:ceilCol,roughness:1,side:THREE.DoubleSide}),cx,h,RCZ,Math.PI/2,0);
    pl(6,h,wm,far,h/2,RCZ,0,ry); pl(8,h,wm,cx,h/2,RZ0,0,0); pl(8,h,wm,cx,h/2,RZ1,0,Math.PI);
    var tx=side*(W/2-.1);
    bxm(.3,.22,2.8,tx,3.7,DOORZ2,gold); bxm(.3,3.6,.2,tx,1.8,DOORZ2-1.3,gold); bxm(.3,3.6,.2,tx,1.8,DOORZ2+1.3,gold);
    scene.add(glow(glowC,3.2,side*(W/2-.6),3.3,DOORZ2,.7));
    return {cx:cx,far:far,ry:ry};
  }
  function sign(side,key,col){
    var tx=window.bigSignTex(RMT.en[key],RMT.ar[key],col);
    pl(3.6,1.18,new THREE.MeshBasicMaterial({map:tx}),side*(W/2-.05),4.2,DOORZ2,0,side<0?Math.PI/2:-Math.PI/2);
  }
  var dark=new THREE.MeshStandardMaterial({color:0x2a2228,roughness:.6});
  /* ---------- PHOTO BOOTH (west) ---------- */
  var P=room(-1,0xf3d3dc,gTex(512,384,function(x,w,h){ var s=32,i,j; for(i=0;i<w/s;i++) for(j=0;j<h/s;j++){ x.fillStyle=(i+j)%2?'#f6d7df':'#fff0f3'; x.fillRect(i*s,j*s,s,s); }
    [[-18.6,-26.1],[-18.6,-24.9]].forEach(function(m){ var px=(m[0]+21)/8*w, py=(m[1]-RZ0)/6*h; x.strokeStyle='#e8506b'; x.lineWidth=5; x.beginPath(); x.arc(px,py,24,0,6.3); x.stroke(); x.fillStyle='#e8506b'; heartPath(x,px,py+1,15); x.fill(); }); }),0x4a2a3a,'255,140,180');
  sign(-1,'pSign','#ff8fa8');
  var bd=gTex(1024,622,function(x,w,h){ var g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#ff9ab5'); g.addColorStop(.55,'#ffc7d6'); g.addColorStop(1,'#ffb3a0'); x.fillStyle=g; x.fillRect(0,0,w,h);
    for(var i=0;i<46;i++){ x.fillStyle='rgba(255,255,255,'+(.1+Math.random()*.25).toFixed(2)+')'; heartPath(x,Math.random()*w,Math.random()*h,10+Math.random()*26); x.fill(); }
    x.shadowColor='rgba(255,60,110,1)'; x.shadowBlur=40; x.strokeStyle='#fff'; x.lineWidth=14; heartPath(x,w/2,h*.46,190); x.stroke(); x.shadowBlur=0;
    x.fillStyle='#fff'; x.textAlign='center'; x.font='italic 600 92px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText('smile',w/2,h*.55); });
  pl(5.6,3.4,new THREE.MeshBasicMaterial({map:bd}),P.far+.04,2.0,RCZ,0,Math.PI/2);
  function ringLight(x,z){ var g=new THREE.Group(); g.position.set(x,0,z); scene.add(g); COLL.push({x0:x-.36,x1:x+.36,z0:z-.36,z1:z+.36});
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,1.9,8),dark); pole.position.y=.95; g.add(pole);
    var base=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.05,16),dark); base.position.y=.03; g.add(base);
    var tor=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,10,36),new THREE.MeshBasicMaterial({color:0xfff6ec})); tor.position.set(.05,1.9,0); tor.rotation.y=Math.PI/2; g.add(tor); g.add(glow('255,240,220',1.9,.2,1.9,0,.8)); }
  ringLight(-19.7,-27.7); ringLight(-19.7,-23.3);
  /* sofa in the photo booth: sit on it (B key / React > Sit) and face the camera */
  (function(){ var sx=-19.55, wd=new THREE.MeshStandardMaterial({color:0x3a3336,roughness:.6}), cu=new THREE.MeshStandardMaterial({color:0xe8738f,roughness:.9}), pl2=new THREE.MeshStandardMaterial({color:0xfff0f3,roughness:.9});
    bxm(.8,.4,2.8,sx,.2,RCZ,wd); bxm(.7,.1,2.7,sx+.02,.45,RCZ,cu); bxm(.16,.62,2.8,sx-.36,.81,RCZ,cu); bxm(.1,.1,2.9,sx-.36,1.14,RCZ,wd);
    bxm(.1,.1,2.9,sx+.33,.58,RCZ,wd); [-1.35,1.35].forEach(function(o){ bxm(.22,.4,.14,sx,.6,RCZ+o,wd); });
    [-.7,.7].forEach(function(o){ var pw=bxm(.14,.36,.36,sx-.22,.72,RCZ+o,pl2); pw.rotation.z=-.18; });
    COLL.push({x0:sx-.4,x1:sx+.4,z0:RCZ-1.4,z1:RCZ+1.4}); BZ.push([sx,RCZ,Math.PI/2]); })();
  (function(){ var g=new THREE.Group(); g.position.set(-13.9,0,-23.3); scene.add(g);
    [[0,.3],[.25,-.15],[-.25,-.15]].forEach(function(l){ var leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.3,6),dark); leg.position.set(l[1]*.5,.62,l[0]*.5); leg.rotation.set(l[0]*.4,0,-l[1]*.4); g.add(leg); });
    var body=new THREE.Mesh(new THREE.BoxGeometry(.2,.26,.36),new THREE.MeshStandardMaterial({color:0x1b1519,roughness:.4,metalness:.4})); body.position.y=1.38; g.add(body);
    var lens=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.2,16),new THREE.MeshStandardMaterial({color:0x2d3a4a,roughness:.2,metalness:.7})); lens.rotation.z=Math.PI/2; lens.position.set(-.18,1.38,0); g.add(lens); COLL.push({x0:-14.2,x1:-13.6,z0:-23.6,z1:-23.0}); })();
  var albumTexLocal=canvasTex(albumCv); albumTex=albumTexLocal;
  albumPlane=pl(6,3,new THREE.MeshBasicMaterial({map:albumTexLocal}),P.cx,2.0,RZ0+.04,0,0);
  bxm(6.2,.12,.08,P.cx,3.56,RZ0+.03,gold); bxm(6.2,.12,.08,P.cx,.44,RZ0+.03,gold); bxm(.12,3.2,.08,P.cx-3.06,2.0,RZ0+.03,gold); bxm(.12,3.2,.08,P.cx+3.06,2.0,RZ0+.03,gold);
  var pL=new THREE.PointLight(0xffb3c8,1.0,13); pL.position.set(P.cx,3.3,RCZ); scene.add(pL);
  (function(){ var a=[]; for(var r=0;r<2;r++) for(var i=0;i<=30;i++){ var t=i/30; a.push(-20.6+t*7.2,3.85-Math.sin(t*Math.PI*5)*.1,RCZ+(r?1:-1)*2.6); } pts(a,.2,'255,205,225',1); })();
  /* ---------- DRAWING STUDIO (east) ---------- */
  var D=room(1,0xf6ecdc,gTex(512,384,function(x,w,h){ var i; for(i=0;i<12;i++){ x.fillStyle=i%2?'#c59a6a':'#d2a877'; x.fillRect(0,i*h/12,w,h/12); x.fillStyle='rgba(60,30,10,.25)'; x.fillRect(0,i*h/12,w,2); }
    var cols=['#e8506b','#2fa3d9','#ffd23f','#3bb273','#8a5ad2','#ff9a3c']; for(i=0;i<34;i++){ x.fillStyle=cols[i%6]; x.globalAlpha=.55; x.beginPath(); x.arc(Math.random()*w,Math.random()*h,3+Math.random()*10,0,6.3); x.fill(); } x.globalAlpha=1; }),0x6a4a3a,'255,215,150');
  sign(1,'dSign','#ffd29a');
  drawWallTex=canvasTex(drawWallCv);
  drawPlane=pl(4.4,3.3,new THREE.MeshBasicMaterial({map:drawWallTex}),D.far-.06,2.1,RCZ,0,-Math.PI/2);
  bxm(.1,.14,4.64,D.far-.07,3.81,RCZ,gold); bxm(.1,.14,4.64,D.far-.07,.39,RCZ,gold); bxm(.1,3.44,.14,D.far-.07,2.1,RCZ-2.27,gold); bxm(.1,3.44,.14,D.far-.07,2.1,RCZ+2.27,gold);
  var wsh=new THREE.Mesh(new THREE.PlaneGeometry(6,4.6),additive(washTex)); wsh.position.set(D.far-.09,2.1,RCZ); wsh.rotation.y=-Math.PI/2; wsh.renderOrder=1; scene.add(wsh);
  (function(){ var g=new THREE.Group(); g.position.set(19.7,0,-27.5); scene.add(g);
    var top=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.9),new THREE.MeshStandardMaterial({color:0x8a5a3a,roughness:.7})); top.position.y=.8; g.add(top);
    [[-.45,-.35],[.45,-.35],[-.45,.35],[.45,.35]].forEach(function(l){ var leg=new THREE.Mesh(new THREE.BoxGeometry(.07,.8,.07),new THREE.MeshStandardMaterial({color:0x6a4a2a})); leg.position.set(l[0],.4,l[1]); g.add(leg); });
    [0xe8506b,0x2fa3d9,0xffd23f,0x3bb273,0x8a5ad2].forEach(function(c,i){ var cup=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.14,12),new THREE.MeshStandardMaterial({color:c,roughness:.5,emissive:c,emissiveIntensity:.15})); cup.position.set(-.4+i*.2,.91,0); g.add(cup); var br=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.3,5),new THREE.MeshStandardMaterial({color:0xd9b25e})); br.position.set(-.4+i*.2,1.06,0); br.rotation.z=(i-2)*.12; g.add(br); });
    COLL.push({x0:19.1,x1:20.3,z0:-28,z1:-27}); })();
  var dL=new THREE.PointLight(0xfff0d0,.9,12); dL.position.set(D.cx,3.2,RCZ); scene.add(dL);
  (function(){ var a=[]; for(var r=0;r<2;r++) for(var i=0;i<=30;i++){ var t=i/30; a.push(13.4+t*7.2,3.85-Math.sin(t*Math.PI*5)*.1,RCZ+(r?1:-1)*2.6); } pts(a,.2,'255,225,170',1); })();
})();

/* ---- Photo booth ---- */
function loadAlbum(){ try{ JSON.parse(localStorage.getItem('ourMuseum.album')||'[]').forEach(function(u){ if(typeof u==='string'&&u.indexOf('data:image/')===0) addAlbum(u,true); }); }catch(e){} }
function addAlbum(u,quiet){ var im=new Image(), o={u:u,im:im}; im.onload=function(){ albumDirty=true; }; im.src=u; album.push(o); if(album.length>6) album.shift(); if(!quiet) saveAlbum(); albumDirty=true; return o; }
function saveAlbum(){ var list=album.slice(-4).map(function(o){ return o.u; }); try{ localStorage.setItem('ourMuseum.album',JSON.stringify(list)); }catch(e){ try{ localStorage.setItem('ourMuseum.album',JSON.stringify(list.slice(-2))); }catch(_){} } }
function drawAlbumWall(){
  var x=albumCv.getContext('2d'), w=1280, h=640, g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#ffe6ec'); g.addColorStop(1,'#ffd3dd'); x.fillStyle=g; x.fillRect(0,0,w,h);
  x.fillStyle='rgba(232,80,107,.12)'; for(var i=0;i<30;i++){ heartPath(x,(i*97)%w,(i*61)%h,14+(i%4)*7); x.fill(); }
  x.textAlign='center'; x.fillStyle='#a82a43'; x.font='italic 600 54px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText(rmt('wall'),w/2,78,w-80);
  x.strokeStyle='rgba(120,60,70,.55)'; x.lineWidth=3; x.beginPath(); x.moveTo(30,140); x.quadraticCurveTo(w/2,175,w-30,140); x.stroke();
  var tilt=[-.06,.04,-.03,.05,-.05,.03];
  for(var s=0;s<6;s++){
    var o=album[s], cx=118+s*209, cy=380; x.save(); x.translate(cx,cy+Math.sin(s*1.3)*8); x.rotate(tilt[s]);
    x.shadowColor='rgba(0,0,0,.3)'; x.shadowBlur=14; x.fillStyle='#fffaf4'; x.fillRect(-96,-128,192,256); x.shadowBlur=0;
    if(o&&o.im.complete&&o.im.naturalWidth){ x.drawImage(o.im,-86,-118,172,192); x.fillStyle='#8a4a5a'; x.font='italic 500 15px "Playfair Display",Georgia,serif'; x.fillText(C('from')+' ♥ '+C('to'),0,112,170); }
    else { x.setLineDash([6,6]); x.strokeStyle='rgba(168,42,67,.35)'; x.lineWidth=2; x.strokeRect(-86,-118,172,192); x.setLineDash([]); x.fillStyle='rgba(232,80,107,.4)'; heartPath(x,0,-20,22); x.fill(); }
    x.fillStyle='#e8506b'; x.beginPath(); x.arc(0,-128,8,0,6.3); x.fill(); x.restore();
  }
  albumTex.needsUpdate=true;
}
function flash(){ flashEl.style.transition='none'; flashEl.style.opacity='1'; void flashEl.offsetWidth; flashEl.style.transition='opacity .7s ease'; flashEl.style.opacity='0'; clapSnd(); }
function snapStart(remote,f){
  if(bBusy||state!=='explore') return; if(remote&&zoneOf(player.position)!==1) return; bBusy=true; if(typeof f==='number'&&f>=0&&f<5) bFilter=f; if(!remote) send({t:'snap',f:bFilter});
  var n=3; cdEl.hidden=false;
  (function tick(){
    if(n>0){ cdEl.style.fontSize='clamp(90px,26vw,220px)'; cdEl.textContent=String(n); cdEl.classList.remove('pop'); void cdEl.offsetWidth; cdEl.classList.add('pop'); chime([n===1?84:79],.1,.12); n--; setTimeout(tick,900); }
    else { cdEl.style.fontSize='clamp(40px,10vw,96px)'; cdEl.textContent=rmt('cheese'); setTimeout(function(){ cdEl.hidden=true; flash(); try{ snapNow(); }catch(e){ console.error(e); } bBusy=false; },550); }
  })();
}
function snapNow(){
  var pa=player.position, pb=npc.position, ia=zoneOf(pa)===1, ib=zoneOf(pb)===1, mz=RCZ;
  if(ia&&ib) mz=(pa.z+pb.z)/2; else if(ia) mz=pa.z; else if(ib) mz=pb.z; mz=clampN(mz,-27.4,-23.6);
  var cw=canvas.width, ch=canvas.height, pr=renderer.getPixelRatio(), ph=Math.min(ch,Math.round(cw/.895)), pw=Math.round(ph*.895);
  var cam=new THREE.PerspectiveCamera(44,pw/ph,.1,60); cam.position.set(-13.6,1.4,mz); cam.lookAt(-19.5,1.15,mz);
  var pc=document.createElement('canvas'); pc.width=760; pc.height=960; var x=pc.getContext('2d');
  x.fillStyle='#fffaf4'; x.fillRect(0,0,760,960);
  renderer.setScissorTest(true); renderer.setViewport(0,0,pw/pr,ph/pr); renderer.setScissor(0,0,pw/pr,ph/pr);
  renderer.render(scene,cam);
  x.drawImage(canvas,0,ch-ph,pw,ph,40,40,680,760);
  renderer.setScissorTest(false); renderer.setViewport(0,0,cw/pr,ch/pr);
  var rx=40, ry=40, rw=680, rh=760;
  if(bFilter===1){ x.globalCompositeOperation='soft-light'; x.fillStyle='rgba(255,150,100,.55)'; x.fillRect(rx,ry,rw,rh); x.globalCompositeOperation='source-over'; x.fillStyle='rgba(255,190,150,.10)'; x.fillRect(rx,ry,rw,rh); }
  else if(bFilter===2){ var id=x.getImageData(rx,ry,rw,rh), d=id.data; for(var q=0;q<d.length;q+=4){ var g=d[q]*.3+d[q+1]*.59+d[q+2]*.11; g=clampN((g-128)*1.12+134,0,255); d[q]=d[q+1]=d[q+2]=g; } x.putImageData(id,rx,ry); }
  else if(bFilter===3){ if('filter' in x){ x.save(); x.globalCompositeOperation='screen'; x.globalAlpha=.45; x.filter='blur(9px)'; x.drawImage(pc,rx,ry,rw,rh,rx,ry,rw,rh); x.restore(); } x.fillStyle='rgba(255,170,200,.14)'; x.fillRect(rx,ry,rw,rh); }
  else if(bFilter===4){ for(var k=0;k<16;k++){ x.fillStyle=k%2?'rgba(255,255,255,.9)':'rgba(255,125,150,.9)'; heartPath(x,rx+30+Math.random()*(rw-60),ry+30+Math.random()*(rh-60),12+Math.random()*26); x.fill(); } }
  x.textAlign='center'; x.fillStyle='#4a2a34'; x.font='italic 600 46px "Playfair Display","IBM Plex Sans Arabic",Georgia,serif'; x.fillText(C('from')+'  ♥  '+C('to'),380,878,680);
  x.fillStyle='#9a6a78'; x.font='500 26px Inter,"IBM Plex Sans Arabic",sans-serif'; try{ x.fillText(new Date().toLocaleDateString(LANG==='ar'?'ar-EG':'en-GB',{day:'numeric',month:'long',year:'numeric'}),380,925); }catch(e){}
  addAlbum(pc.toDataURL('image/jpeg',.88)); openAlbum(album.length-1);
}
function openAlbum(i){ window.phoOpen=true; zeroKeys(); phoSel=clampN(i,0,Math.max(0,album.length-1)); phoBuild(); phoEl.hidden=false; }
function closeAlbum(){ window.phoOpen=false; phoEl.hidden=true; }
function phoBuild(){
  phoEl.innerHTML=''; var c=document.createElement('div'); c.className='rm-card'; phoEl.appendChild(c);
  var hd=document.createElement('header'), h2=document.createElement('h2'), cl=document.createElement('button'); h2.textContent=rmt('albT'); cl.className='ghost sm'; cl.textContent=rmt('close'); cl.addEventListener('click',closeAlbum); hd.appendChild(h2); hd.appendChild(cl); c.appendChild(hd);
  if(!album.length){ var p=document.createElement('p'); p.className='note'; p.textContent=rmt('empty'); c.appendChild(p); return; }
  var o=album[phoSel], im=document.createElement('img'); im.className='pho-img'; im.src=o.u; im.alt=''; c.appendChild(im);
  var th=document.createElement('div'); th.className='pho-th'; album.forEach(function(a,i){ var t2=document.createElement('img'); t2.src=a.u; t2.alt=''; if(i===phoSel) t2.className='on'; t2.addEventListener('click',function(){ phoSel=i; phoBuild(); }); th.appendChild(t2); }); c.appendChild(th);
  var row=document.createElement('div'); row.className='dr-row'; c.appendChild(row);
  function RB(txt,fn){ var b=document.createElement('button'); b.type='button'; b.className='rb'; b.textContent=txt; b.addEventListener('click',fn); row.appendChild(b); }
  RB('💾 '+rmt('save'),function(){ download(dataURLtoBlob(o.u),'our-photo.jpg'); toast(rmt('saved')); });
  RB(rmt('trace'),function(){ closeAlbum(); trace=o; openDraw(); });
  RB('🗑 '+rmt('del'),function(){ album.splice(phoSel,1); saveAlbum(); albumDirty=true; if(trace===o) trace=null; phoSel=clampN(phoSel,0,Math.max(0,album.length-1)); phoBuild(); });
}

/* ---- Drawing studio (shared strokes) ---- */
var DCOLS=['#1b1519','#d93f5a','#ff8fa8','#ff9a3c','#ffd23f','#3bb273','#2fa3d9','#6b5bd2','#8a5a3c','#ffffff'];
var STR=[], LY=document.createElement('canvas'), LYx=null, trace=null, guideOn=true, guideCv=null, dTool='b', dCol='#d93f5a', dSize=9, cur=null, pend=[], flushT=null, drDirty=true, drSaveT=null, drNotify=0;
LY.width=1200; LY.height=900; LYx=LY.getContext('2d');
function cleanStroke(s,mine){
  if(!s||typeof s.id!=='string'||s.id.length>24||!Array.isArray(s.p)) return null;
  var k=(s.k==='e'||s.k==='h')?s.k:'b', c=(typeof s.c==='string'&&/^#[0-9a-f]{3,8}$/i.test(s.c))?s.c:'#1b1519', w=clampN(+s.w||8,1,40), p=[];
  s.p.slice(0,3000).forEach(function(q){ if(Array.isArray(q)&&isFinite(q[0])&&isFinite(q[1])) p.push([clampN(+q[0],0,1),clampN(+q[1],0,1)]); });
  return {id:s.id,k:k,c:c,w:w,p:p,mine:mine?1:0};
}
function strokeSeg(x,s,i0){
  var W2=1200, H2=900, n=s.p.length; if(i0>=n) return;
  x.save(); x.lineCap='round'; x.lineJoin='round';
  if(s.k==='e') x.globalCompositeOperation='destination-out';
  x.strokeStyle=x.fillStyle=(s.k==='e'?'#000':s.c);
  if(s.k==='h'){ for(var i=i0;i<n;i++){ heartPath(x,s.p[i][0]*W2,s.p[i][1]*H2,s.w*3.6); x.fill(); } }
  else {
    x.lineWidth=s.w*(s.k==='e'?2.6:1.3);
    if(n===1){ x.beginPath(); x.arc(s.p[0][0]*W2,s.p[0][1]*H2,x.lineWidth/2,0,6.3); x.fill(); }
    else { var a=s.p[Math.max(0,i0-1)]; x.beginPath(); x.moveTo(a[0]*W2,a[1]*H2); for(var j=Math.max(1,i0);j<n;j++) x.lineTo(s.p[j][0]*W2,s.p[j][1]*H2); x.stroke(); }
  }
  x.restore();
}
function drRebuild(){ LYx.clearRect(0,0,1200,900); STR.forEach(function(s){ strokeSeg(LYx,s,0); }); drDirty=true; drSaveSoon(); }
function drawGuide(x,w,h){
  /* trace guide = the two characters (him + her) drawn exactly as they look now: skin, hair, suit/tie, dress, belt, shoes */
  if(!guideCv){ try{ guideCv=document.createElement('canvas'); guideCv.width=1200; guideCv.height=900; var gx=guideCv.getContext('2d');
      paintScript().forEach(function(st){ strokeSeg(gx,{k:st.k,c:st.c,w:st.w,p:st.d},0); }); }catch(e){ guideCv=null; } }
  if(guideCv){ x.save(); x.globalAlpha=.42; x.drawImage(guideCv,0,0,w,h); x.restore(); return; }
  x.save(); x.strokeStyle='rgba(232,80,107,.38)'; x.lineWidth=w*.004; x.setLineDash([w*.012,w*.01]);
  [.37,.63].forEach(function(f,i){ var cx=w*f, hy=h*.27, r=w*.062; x.beginPath(); x.arc(cx,hy,r,0,6.3); x.stroke(); var bw=w*(i?.1:.11); roundRect(x,cx-bw,hy+r+h*.02,bw*2,h*.48,w*.045); x.stroke(); });
  heartPath(x,w/2,h*.4,w*.045); x.stroke(); x.restore();
}
function composite(x,w,h,ui){
  x.fillStyle='#fffdf8'; x.fillRect(0,0,w,h);
  if(ui&&trace&&trace.im&&trace.im.naturalWidth){ var im=trace.im, s=Math.min(w/im.naturalWidth,h/im.naturalHeight); x.save(); x.globalAlpha=.4; x.drawImage(im,(w-im.naturalWidth*s)/2,(h-im.naturalHeight*s)/2,im.naturalWidth*s,im.naturalHeight*s); x.restore(); }
  if(ui&&guideOn) drawGuide(x,w,h);
  x.drawImage(LY,0,0,w,h);
}
function drSaveSoon(){ clearTimeout(drSaveT); drSaveT=setTimeout(function(){ try{ var j=JSON.stringify(STR.map(function(s){ return {id:s.id,k:s.k,c:s.c,w:s.w,p:s.p}; })); if(j.length<2500000) localStorage.setItem('ourMuseum.draw',j); }catch(e){} },700); }
function loadStrokes(){ try{ JSON.parse(localStorage.getItem('ourMuseum.draw')||'[]').slice(0,600).forEach(function(s){ var c=cleanStroke(s,true); if(c) STR.push(c); }); }catch(e){} drRebuild(); }
function drPos(e){ var r=drCv.getBoundingClientRect(); return [Math.round(clampN((e.clientX-r.left)/r.width,0,1)*1000)/1000,Math.round(clampN((e.clientY-r.top)/r.height,0,1)*1000)/1000]; }
drCv.addEventListener('pointerdown',function(e){
  if(cur) return; e.preventDefault(); try{ drCv.setPointerCapture(e.pointerId); }catch(_){}
  var p=drPos(e); cur={id:rnd(10),k:dTool,c:dCol,w:dSize,p:[p],mine:1}; STR.push(cur); strokeSeg(LYx,cur,0); pend=[p]; drDirty=true;
  clearInterval(flushT); flushT=setInterval(function(){ if(cur&&pend.length){ send({t:'dr',id:cur.id,k:cur.k,c:cur.c,w:cur.w,p:pend}); pend=[]; } },60);
});
drCv.addEventListener('pointermove',function(e){
  if(!cur||cur.k==='h') return; var p=drPos(e), l=cur.p[cur.p.length-1]; if(Math.abs(p[0]-l[0])+Math.abs(p[1]-l[1])<.0015) return;
  cur.p.push(p); pend.push(p); strokeSeg(LYx,cur,cur.p.length-1); drDirty=true;
});
function drEnd(){ if(!cur) return; var s=cur; if(pend.length) send({t:'dr',id:s.id,k:s.k,c:s.c,w:s.w,p:pend}); pend=[]; clearInterval(flushT); cur=null; drSaveSoon(); }
drCv.addEventListener('pointerup',drEnd); drCv.addEventListener('pointercancel',drEnd);
function drUndo(){ for(var i=STR.length-1;i>=0;i--) if(STR[i].mine){ var id=STR[i].id; STR.splice(i,1); send({t:'dru',id:id}); drRebuild(); return; } }
function drClear(){ if(!STR.length) return; if(!window.confirm(rmt('confirmC'))) return; STR=[]; send({t:'drc'}); drRebuild(); }
function drSave(){ var c=document.createElement('canvas'); c.width=1200; c.height=900; composite(c.getContext('2d'),1200,900,false); c.toBlob(function(b){ if(b){ download(b,'our-drawing.png'); toast(rmt('saved')); } },'image/png'); }
function drBuild(){ guideCv=null;
  $('drT').textContent=rmt('dTitle'); $('drX').textContent=rmt('close'); $('drSt').textContent=linked?rmt('withU'):rmt('alone');
  function RB(par,txt,on,fn){ var b=document.createElement('button'); b.type='button'; b.className='rb'+(on?' on':''); b.textContent=txt; b.addEventListener('click',fn); par.appendChild(b); return b; }
  var r1=$('drR1'); r1.innerHTML='';
  [['b','🖌 '+rmt('brush')],['e','🧽 '+rmt('eraser')],['h','💗 '+rmt('hearts')]].forEach(function(t2){ RB(r1,t2[1],dTool===t2[0],function(){ dTool=t2[0]; drBuild(); }); });
  [5,9,18].forEach(function(s,i){ RB(r1,['•','●','⬤'][i],dSize===s,function(){ dSize=s; drBuild(); }); });
  var r2=$('drR2'); r2.innerHTML='';
  DCOLS.forEach(function(c){ var b=document.createElement('button'); b.type='button'; b.className='sw'+(dCol===c&&dTool!=='e'?' on':''); b.style.background=c; b.setAttribute('aria-label',c); b.addEventListener('click',function(){ dCol=c; if(dTool==='e') dTool='b'; drBuild(); }); r2.appendChild(b); });
  var r3=$('drR3'); r3.innerHTML='';
  RB(r3,'↩ '+rmt('undo'),false,drUndo); RB(r3,'🗑 '+rmt('clear'),false,drClear);
  RB(r3,'👫 '+rmt('guide'),guideOn,function(){ guideOn=!guideOn; drDirty=true; drBuild(); });
  RB(r3,'🖼 '+rmt('tracePh'),!!trace,function(){ if(trace) trace=null; else if(album.length) trace=album[album.length-1]; else toast(rmt('noPhoto'),2600); drDirty=true; drBuild(); });
  RB(r3,'💾 '+rmt('saveP'),false,drSave);
}
function openDraw(){ window.drawOpen=true; zeroKeys(); drBuild(); drEl.hidden=false; drDirty=true; }
function closeDraw(){ drEnd(); window.drawOpen=false; drEl.hidden=true; }
$('drX').addEventListener('click',closeDraw);
drEl.addEventListener('pointerdown',function(e){ e.stopPropagation(); });
window.addEventListener('keydown',function(e){ if(e.code!=='Escape') return; if(window.drawOpen) closeDraw(); else if(window.phoOpen) closeAlbum(); });
canvas.addEventListener('click',function(e){
  if(state!=='explore'||drag.dist>8||window.drawOpen||window.phoOpen) return;
  var z=zoneOf(player.position); if(!z) return;
  var r=canvas.getBoundingClientRect(); mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1); ray.setFromCamera(mouse,camera);
  var hit=ray.intersectObjects([z===2?drawPlane:albumPlane])[0]; if(!hit) return;
  if(z===2) openDraw(); else openAlbum(album.length-1);
});

/* ---- Painter: your character paints the two of them (him + her) on the big wall ---- */
var paintJob=null, paintPen={u:.5,v:.5};
function pcCol(av,key,def){ try{ var m=av&&av.userData&&av.userData.mats&&av.userData.mats[key]; if(m&&m.color) return '#'+m.color.getHexString(); }catch(e){} return def; }
function paintScript(){
  var him=null, her=null; [player,npc].forEach(function(a){ if(a&&a.userData){ if(a.userData.him) him=a; else her=a; } });
  var hs={skin:pcCol(him,'skin','#f0c0a0'),hair:pcCol(him,'hair','#2a1a12'),suit:pcCol(him,'top','#1c2a4a'),pant:pcCol(him,'bottom','#16171d'),shoe:pcCol(him,'shoe','#1a1210'),tie:pcCol(him,'tie','#d93f5a')};
  var skinW=pcCol(her,'skin','#f3c9a9'), ws={skin:skinW,hair:pcCol(her,'hair','#4a2616'),dress:pcCol(her,'top','#1f6a55'),belt:pcCol(her,'belt',pcCol(her,'trim','#d9b25e')),legs:pcCol(her,'legs',skinW),shoe:pcCol(her,'shoe','#3a2018')};
  var out=[], PI=Math.PI;
  function line(c,w,p){ out.push({k:'b',c:c,w:w,p:p}); }
  function dot(c,w,p){ out.push({k:'b',c:c,w:w,p:[p]}); }
  function ell(cx,cy,rx,ry){ var a=[],n=28; for(var i=0;i<n;i++){ var t=i/n*PI*2; a.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry]); } return a; }
  function arc(cx,cy,rx,ry,a0,a1){ var a=[],n=Math.max(8,Math.round((a1-a0)*Math.max(rx,ry)/8)); for(var i=0;i<=n;i++){ var t=a0+(a1-a0)*i/n; a.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry]); } return a; }
  function quad(a,b,c){ var p=[]; for(var i=0;i<=10;i++){ var t=i/10, m=1-t; p.push([m*m*a[0]+2*m*t*b[0]+t*t*c[0],m*m*a[1]+2*m*t*b[1]+t*t*c[1]]); } return p; }
  function fill(poly,c,w){ /* paint a convex shape with back-and-forth brush rows */
    var y0=1e9,y1=-1e9,i; poly.forEach(function(p){ y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); });
    var o=[], dir=1, inset=w*.65;
    for(var y=y0+inset;y<=y1-inset+.01;y+=w*1.1){ var xs=[];
      for(i=0;i<poly.length;i++){ var a=poly[i], b=poly[(i+1)%poly.length]; if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)) xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
      if(xs.length<2) continue; var xl=Math.min.apply(null,xs)+inset, xr=Math.max.apply(null,xs)-inset; if(xr<xl) xl=xr=(xl+xr)/2;
      if(dir>0){ o.push([xl,y]); o.push([xr,y]); } else { o.push([xr,y]); o.push([xl,y]); } dir=-dir; }
    if(o.length) out.push({k:'b',c:c,w:w,p:o});
  }
  function face(T,dark){ dot('#1d1518',9,T([-21,-442])); dot('#1d1518',9,T([21,-442])); dot('#ffa3b5',10,T([-37,-420])); dot('#ffa3b5',10,T([37,-420])); line('#b4525e',4,arc(0,-426,17,11,PI*.15,PI*.85).map(T)); }
  var by=800;
  function drawHer(cx,hand){ var s=.93, T=function(p){ return [cx+p[0]*s,by+p[1]*s]; };
    fill(ell(0,14,112,12).map(T),'#eadbd5',9);
    fill([[-80,-470],[0,-514],[80,-470],[94,-380],[90,-250],[60,-222],[-60,-222],[-90,-250],[-94,-380]].map(T),ws.hair,17);
    line(ws.legs,12,[T([-30,-175]),T([-30,-42])]); line(ws.legs,12,[T([30,-175]),T([30,-42])]);
    line(ws.shoe,15,[T([-48,-26]),T([-18,-26])]); line(ws.shoe,15,[T([18,-26]),T([48,-26])]);
    fill([[-42,-374],[42,-374],[98,-172],[-98,-172]].map(T),ws.dress,16);
    line(ws.belt,8,[T([-52,-322]),T([52,-322])]);
    var sh=T([-40,-362]); line(ws.dress,14,quad(sh,[(sh[0]+hand[0])/2,(sh[1]+hand[1])/2+34],hand));
    var sh2=T([40,-362]); line(ws.dress,14,quad(sh2,T([92,-292]),T([106,-216])));
    dot(ws.skin,14,hand); dot(ws.skin,14,T([106,-210]));
    fill(ell(0,-440,60,64).map(T),ws.skin,16);
    line(ws.hair,24,arc(0,-446,57,60,PI*1.02,PI*1.98).map(T)); line(ws.hair,15,arc(0,-452,40,38,PI*1.12,PI*1.88).map(T));
    face(T); }
  function drawHim(cx,hand){ var s=1, T=function(p){ return [cx+p[0]*s,by+p[1]*s]; };
    fill(ell(0,14,112,12).map(T),'#eadbd5',9);
    line(hs.pant,26,[T([-30,-205]),T([-30,-44])]); line(hs.pant,26,[T([30,-205]),T([30,-44])]);
    line(hs.shoe,15,[T([-46,-26]),T([-12,-26])]); line(hs.shoe,15,[T([12,-26]),T([46,-26])]);
    fill([[-58,-374],[58,-374],[62,-200],[-62,-200]].map(T),hs.suit,17);
    line('#ffffff',5,[T([-20,-374]),T([0,-344]),T([20,-374])]); line(hs.tie,8,[T([0,-346]),T([0,-280])]);
    var sh=T([54,-362]); line(hs.suit,15,quad(sh,[(sh[0]+hand[0])/2,(sh[1]+hand[1])/2+34],hand));
    var sh2=T([-54,-362]); line(hs.suit,15,quad(sh2,T([-104,-292]),T([-114,-216])));
    dot(hs.skin,14,hand); dot(hs.skin,14,T([-114,-210]));
    fill(ell(0,-440,58,62).map(T),hs.skin,16);
    line(hs.hair,26,arc(0,-446,56,59,PI*1.0,PI*2.0).map(T)); line(hs.hair,16,arc(0,-455,38,34,PI*1.15,PI*1.85).map(T));
    face(T); }
  drawHim(430,[598,566]); drawHer(770,[606,566]);
  out.push({k:'h',c:'#d93f5a',w:36,p:[[600,215]]}); out.push({k:'h',c:'#ff8fa8',w:11,p:[[470,160]]}); out.push({k:'h',c:'#ff8fa8',w:13,p:[[735,140]]}); out.push({k:'h',c:'#ffb3c4',w:8,p:[[560,105]]}); out.push({k:'h',c:'#e8506b',w:9,p:[[668,98]]});
  /* normalise + densify so the brush glides instead of jumping */
  out.forEach(function(st){ var d=[st.p[0]]; if(st.k!=='h') for(var i=1;i<st.p.length;i++){ var a=st.p[i-1], b=st.p[i], n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/14)); for(var j=1;j<=n;j++) d.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]); }
    st.d=d.map(function(p){ return [Math.round(clampN(p[0]/1200,0,1)*10000)/10000,Math.round(clampN(p[1]/900,0,1)*10000)/10000]; }); });
  return out;
}
function paintFlush(J,force){ if(!J.cur||!J.buf.length) return; var now=performance.now(); if(!force&&now-J.sendT<70) return; J.sendT=now; send({t:'dr',id:J.cur.id,k:J.cur.k,c:J.cur.c,w:J.cur.w,p:J.buf}); J.buf=[]; }
function paintAdvance(J,n){ /* add up to n points; returns true when the picture is finished */
  while(n>0){
    if(!J.cur){ var st=J.s[++J.i]; if(!st) return true; J.cur={id:'pc'+rnd(8),k:st.k,c:st.c,w:st.w,p:[],mine:0}; J.buf=[]; J.st=st; J.j=0; STR.push(J.cur); }
    var d=J.st.d, pt, i0;
    if(J.cur.k==='h'){ pt=d[0]; J.cur.p.push(pt); strokeSeg(LYx,J.cur,0); J.buf.push(pt); paintPen.u=pt[0]; paintPen.v=pt[1]; drDirty=true; paintFlush(J,true); J.cur=null; n-=8; continue; }
    pt=d[J.j++]; i0=J.cur.p.length; J.cur.p.push(pt); strokeSeg(LYx,J.cur,i0); J.buf.push(pt); paintPen.u=pt[0]; paintPen.v=pt[1]; drDirty=true; n--;
    if(J.j>=d.length){ paintFlush(J,true); J.cur=null; } else paintFlush(J,false);
  }
  return false;
}
function paintFinish(instant){
  var J=paintJob; if(!J) return; if(instant) paintAdvance(J,1e9); paintFlush(J,true); paintJob=null; drSaveSoon();
  if(myR&&myR.n==='paint') myR.d=myR.t+.4;
  if(!instant){ try{ heartsAt(player.position.x,1.9,player.position.z,8,1.2); chime([76,80,84],.1,.1); }catch(e){} }
}
function paintStart(){
  if(paintJob){ paintFinish(true); return; }
  if(state!=='explore'||zoneOf(player.position)!==2||window.drawOpen) return;
  if(seat) standUp(); zeroKeys();
  var s=paintScript(), N=0; s.forEach(function(st){ N+=st.k==='h'?8:st.d.length; });
  paintJob={s:s,i:-1,j:0,cur:null,buf:[],st:null,sendT:0,acc:0,wait:.7,pps:clampN(N/11,100,420)};
  paintPen.u=.5; paintPen.v=.45; myR={n:'paint',t:0,d:9999}; playReactSound('paint');
}
function paintTick(dt){
  var J=paintJob; if(!J) return; dt=Math.min(dt,.1);
  if(!myR||myR.n!=='paint'||state!=='explore'||zoneOf(player.position)!==2){ paintFinish(true); return; }
  if(player.userData.amp<.25){ var k=1-Math.exp(-dt*2.2); player.rotation.y=lerpAngle(player.rotation.y,Math.PI/2,1-Math.exp(-dt*6)); player.position.x+=(18.9-player.position.x)*k; player.position.z+=(RCZ-player.position.z)*k; }
  J.wait-=dt; if(J.wait>0) return;
  J.acc+=J.pps*dt; var n=Math.floor(J.acc); J.acc-=n;
  if(n>0&&paintAdvance(J,n)) paintFinish(false);
}

/* ---- Live messages ---- */
function roomsMsg(d){
  if(d.t==='snap'){ snapStart(true,d.f); return true; }
  if(d.t==='dr'){
    var c=cleanStroke({id:String(d.id),k:d.k,c:d.c,w:d.w,p:Array.isArray(d.p)?d.p.slice(0,500):[]},false); if(!c) return true;
    var s=null; for(var i=0;i<STR.length;i++) if(STR[i].id===c.id){ s=STR[i]; break; }
    if(!s){ s=c; c.p=[]; STR.push(s); }
    var i0=s.p.length; cleanStroke({id:s.id,p:Array.isArray(d.p)?d.p.slice(0,500):[]},false).p.forEach(function(q){ if(s.p.length<3000) s.p.push(q); });
    strokeSeg(LYx,s,i0); drDirty=true; drSaveSoon();
    if(!window.drawOpen&&performance.now()-drNotify>20000){ drNotify=performance.now(); toast(rmt('pDraw'),3200); }
    return true;
  }
  if(d.t==='dru'){ STR=STR.filter(function(s){ return s.id!==String(d.id); }); drRebuild(); return true; }
  if(d.t==='drc'){ STR=[]; drRebuild(); return true; }
  if(d.t==='drall'){ var have={}; STR.forEach(function(s){ have[s.id]=1; }); (Array.isArray(d.s)?d.s.slice(0,400):[]).forEach(function(s){ var c=cleanStroke(s,false); if(c&&!have[c.id]){ STR.push(c); have[c.id]=1; } }); drRebuild(); return true; }
  return false;
}
function roomsLinked(){
  if(STR.length) send({t:'drall',s:STR.slice(-300).map(function(s){ return {id:s.id,k:s.k,c:s.c,w:s.w,p:s.p}; })});
  if(window.drawOpen) drBuild();
}

/* ---- Per-frame ---- */
function buildAct(z){
  act.innerHTML=''; if(!z) return;
  function B(txt,cls,fn){ var b=document.createElement('button'); b.className='tool'+(cls?' '+cls:''); b.textContent=txt; b.addEventListener('click',fn); act.appendChild(b); return b; }
  if(z===1){
    B(rmt('snap'),'ring',function(){ snapStart(false); });
    var fb=B(rmt('filt')+': '+rmt('filters')[bFilter],'',function(){ bFilter=(bFilter+1)%5; fb.textContent=rmt('filt')+': '+rmt('filters')[bFilter]; });
    B(rmt('album'),'',function(){ openAlbum(album.length-1); });
  } else { B(rmt('draw'),'ring',function(){ openDraw(); }); B(rmt('paint'),'',function(){ paintStart(); }); }
}
function roomsTick(dt,now){
  if(gardenOn){ if(curZone){ curZone=0; act.hidden=true; } return; }
  paintTick(dt);
  var z=(state==='explore'&&!hud.hidden)?zoneOf(player.position):0;
  if(z!==curZone||zoneLang!==LANG){
    var entered=z&&z!==curZone; curZone=z; zoneLang=LANG; buildAct(z); albumDirty=true;
    if(entered&&!seenZ[z]){ seenZ[z]=1; toast(z===1?rmt('tipP'):rmt('tipD'),4500); }
  }
  act.hidden=!z||!!window.drawOpen||!!window.phoOpen;
  if(z===1&&state==='explore'&&player.userData.amp<.25) player.rotation.y=lerpAngle(player.rotation.y,Math.PI/2,1-Math.exp(-dt*5));
  if(!ROLE&&state==='explore'&&!(npcR&&(npcR.n==='flower'||npcR.n==='hand'))){
    if(z===1){
      var pp=player.position, tz=pp.z>-26?pp.z-1.1:pp.z+1.1; tz=clampN(tz,-27.8,-23.2); var tx=clampN(pp.x,-19.8,-15.5);
      if(!soloAt){ soloAt=true; npc.position.set(-14.6,0,tz); }
      var k=1-Math.exp(-dt*3); npc.position.x+=(tx-npc.position.x)*k; npc.position.z+=(tz-npc.position.z)*k; npc.rotation.y=lerpAngle(npc.rotation.y,Math.PI/2,1-Math.exp(-dt*5));
    } else if(soloAt){ soloAt=false; npc.position.set(0,0,-37.4); }
  }
  if(albumDirty){ albumDirty=false; drawAlbumWall(); }
  if(drDirty){ drDirty=false; composite(drawWallX,1024,768,false); drawWallTex.needsUpdate=true; if(window.drawOpen) composite(drCx,1200,900,true); }
}

loadAlbum(); loadStrokes();

