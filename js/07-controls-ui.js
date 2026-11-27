/* Lighting, input, lightbox, mini-map, music toggle, customizer */
'use strict';

/* ---------- Lighting modes ---------- */
var LIGHTS=[
 {amb:.4,ambC:0xffeaee,hemi:.3,pt:.24,ptC:0xffd6d2,bg:0x1a0d14,strip:0xfff4e0},
 {amb:.6,ambC:0xffffff,hemi:.45,pt:.2,ptC:0xffffff,bg:0x1c2030,strip:0xffffff},
 {amb:.26,ambC:0xffd0a0,hemi:.22,pt:1.15,ptC:0xff9a50,bg:0x0b090c,strip:0xffc88a}
];
var lightMode=0, lc={amb:.36,hemi:.28,pt:.22,ambC:new THREE.Color(0xffffff),ptC:new THREE.Color(0xfff4e0),bg:new THREE.Color(0x1a0d14),strip:new THREE.Color(0xfff4e0)};
var tmpC=new THREE.Color();
function updateLights(dt,now){
  var T=LIGHTS[lightMode], k=Math.min(1,dt*2.5);
  lc.amb=mix(lc.amb,T.amb,k); lc.hemi=mix(lc.hemi,T.hemi,k); lc.pt=mix(lc.pt,T.pt,k);
  lc.ambC.lerp(tmpC.set(T.ambC),k); lc.ptC.lerp(tmpC.set(T.ptC),k); lc.bg.lerp(tmpC.set(T.bg),k); lc.strip.lerp(tmpC.set(T.strip),k);
  amb.intensity=lc.amb; amb.color.copy(lc.ambC); hemi.intensity=lc.hemi;
  var fl=lightMode===2?(1+Math.sin(now*.011)*.08+Math.sin(now*.023)*.06):1;
  hallLights.forEach(function(l,i){ l.intensity=lc.pt*(lightMode===2?(1+Math.sin(now*.009+i*2)*.1):1); l.color.copy(lc.ptC); });
  roomLight.intensity=.9*fl; scene.background.copy(lc.bg); scene.fog.color.copy(lc.bg); stripMat.color.copy(lc.strip);
}

/* ---------- Input ---------- */
var keys={up:0,down:0,left:0,right:0,rl:0,rr:0,shift:0}, joy={x:0,y:0};
var camYaw=0,camPitch=.3,camDist=6.2;
function editorOpen(){ return !$('editor').hidden||!$('gb').hidden||!!window.lookOpen||!!window.drawOpen||!!window.phoOpen; }
var KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyQ:'rl',KeyE:'rr',ShiftLeft:'shift',ShiftRight:'shift'};
window.addEventListener('keydown',function(e){
  if(editorOpen()) { if(e.code==='Escape') $('gb').hidden=true; return; }
  var tn=e.target&&e.target.tagName; if(tn==='INPUT'||tn==='TEXTAREA') return;
  var k=KEYMAP[e.code]; if(k){ keys[k]=1; e.preventDefault(); }
  if(e.code==='Escape'&&!$('lightbox').hidden) closeLightbox();
  if(e.code==='KeyX'&&!$('exitPill').hidden) exitAsk();
});
window.addEventListener('keyup',function(e){ var k=KEYMAP[e.code]; if(k) keys[k]=0; });
window.addEventListener('blur',function(){ keys.up=keys.down=keys.left=keys.right=keys.rl=keys.rr=keys.shift=0; });
var stickId=null;
stick.addEventListener('pointerdown',function(e){ stickId=e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
stick.addEventListener('pointermove',function(e){ if(e.pointerId===stickId) moveStick(e); });
function endStick(e){ if(e.pointerId!==stickId) return; stickId=null; joy.x=joy.y=0; knob.style.transform=''; knob.classList.remove('run'); }
stick.addEventListener('pointerup',endStick); stick.addEventListener('pointercancel',endStick);
function moveStick(e){ var r=stick.getBoundingClientRect(),R=r.width/2-8,dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy); if(d>R){ dx=dx/d*R; dy=dy/d*R; } joy.x=dx/R; joy.y=dy/R; knob.style.transform='translate('+dx+'px,'+dy+'px)'; knob.classList.toggle('run',Math.hypot(joy.x,joy.y)>.9); }

/* ---------- Lightbox + caption pill ---------- */
function openLightbox(i){
  var f=galleryFrames[i]; if(!f.open) return;
  if(f.video){ $('lbImg').hidden=true; var v=$('lbVid'); v.hidden=false; v.src=mediaURL('vid'+i); v.play().catch(function(){}); }
  else { $('lbVid').hidden=true; $('lbImg').hidden=false; $('lbImg').src=f.canvas.toDataURL('image/jpeg',.9); }
  $('lbCap').textContent=CAP(i); $('lbDate').textContent=cfg.dates[i]||''; $('lightbox').hidden=false;
}
function openLightboxSrc(src,cap){ $('lbVid').hidden=true; $('lbImg').hidden=false; $('lbImg').src=src; $('lbCap').textContent=cap||''; $('lbDate').textContent=''; $('lightbox').hidden=false; }
function closeLightbox(){ $('lightbox').hidden=true; var v=$('lbVid'); v.pause(); }
$('lightbox').addEventListener('click',function(e){ if(e.target.id==='lbVid') return; closeLightbox(); });
var nearIdx=-1, guided={}, found=[0,0,0,0,0,0,0,0], roomFound=false;
$('capBtn').addEventListener('click',function(){ if(nearIdx>=0) openLightbox(nearIdx); });
$('capOpen').addEventListener('click',function(){ if(nearIdx>=0) openCover(nearIdx); });
$('capListen').addEventListener('click',function(){ if(nearIdx>=0) playVoice('aud'+nearIdx); });
var drag={pts:{},dist:0,pinch:0};
canvas.addEventListener('pointerdown',function(e){ if(!Object.keys(drag.pts).length) drag.dist=0; drag.pts[e.pointerId]={x:e.clientX,y:e.clientY}; drag.pinch=0; try{ canvas.setPointerCapture(e.pointerId); }catch(_){} });
canvas.addEventListener('pointermove',function(e){
  var p=drag.pts[e.pointerId]; if(!p) return;
  var dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  var ids=Object.keys(drag.pts);
  if(ids.length>=2){ var a=drag.pts[ids[0]],b=drag.pts[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y); if(drag.pinch>0&&state==='explore') camDist=clampN(camDist*drag.pinch/d,2.6,10); drag.pinch=d; drag.dist+=20; return; }
  drag.dist+=Math.hypot(dx,dy);
  if(state==='explore'){ camYaw-=dx*.0055; camPitch=clampN(camPitch+dy*.004,.04,1.15); }
});
function dragEnd(e){ delete drag.pts[e.pointerId]; drag.pinch=0; }
canvas.addEventListener('pointerup',dragEnd); canvas.addEventListener('pointercancel',dragEnd);
canvas.addEventListener('wheel',function(e){ e.preventDefault(); if(state==='explore') camDist=clampN(camDist+e.deltaY*.004,2.6,10); },{passive:false});
var ray=new THREE.Raycaster(), mouse=new THREE.Vector2();
canvas.addEventListener('click',function(e){
  if(state!=='explore'||drag.dist>8) return;
  var r=canvas.getBoundingClientRect(); mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1); ray.setFromCamera(mouse,camera);
  if(window.GIFT&&IS_GIFT.locked&&!IS_GIFT.opening&&IS_GIFT.pick&&ray.intersectObjects(IS_GIFT.pick)[0]){ giftAsk(); return; }
  var targets=photoMeshes, hit=ray.intersectObjects(targets)[0];
  if(!hit) return;
  if(hit.object===couponMesh) openLightboxSrc(couponCanvas.toDataURL('image/png'),'');
  else openLightbox(hit.object.userData.index);
});

/* ---------- Mini-map ---------- */
var mapC=$('map'), mapX=mapC.getContext('2d');
function foundCount(){ var n=0; for(var i=0;i<8;i++) n+=found[i]?1:0; return n; }
function drawMap(){
  var w=mapC.width,h=mapC.height,x=mapX,X0=-22,X1=13,Z0=10,Z1=-42,sx=w/(X1-X0),sz=h/(Z0-Z1);
  function mx(v){ return (v-X0)*sx; } function mz(v){ return (Z0-v)*sz; }
  x.clearRect(0,0,w,h); x.fillStyle='rgba(20,18,23,.72)'; x.fillRect(0,0,w,h);
  x.fillStyle='rgba(244,240,234,.12)'; x.fillRect(mx(-13),mz(10),26*sx,52*sz); x.strokeStyle='rgba(255,255,255,.4)'; x.lineWidth=1.5; x.strokeRect(mx(-13),mz(10),26*sx,52*sz);
  x.fillStyle='rgba(205,191,166,.18)'; x.fillRect(mx(-2.6),mz(8.5),5.2*sx,50*sz);
  if(roomFound){ x.fillStyle='rgba(217,63,90,.25)'; x.fillRect(mx(ROOM.x0),mz(ROOM.z1)- (ROOM.z1-ROOM.z0)*sz,8*sx,6*sz); x.strokeStyle='rgba(217,63,90,.8)'; x.strokeRect(mx(ROOM.x0),mz(ROOM.z1)-(ROOM.z1-ROOM.z0)*sz,8*sx,6*sz); }
  galleryFrames.forEach(function(f,i){ x.fillStyle=found[i]?'#d93f5a':'#6c6572'; x.fillRect(mx(f.x)-(f.x<0?-1:6),mz(f.z)-8,5,16); });
  x.fillStyle='#8fb4ff'; x.beginPath(); x.arc(mx(npc.position.x),mz(npc.position.z),5,0,6.3); x.fill();
  x.fillStyle='#fff'; x.beginPath(); x.arc(mx(player.position.x),mz(player.position.z),6,0,6.3); x.fill(); x.strokeStyle='#d93f5a'; x.lineWidth=2; x.stroke();
  $('mapTxt').textContent=t('found')+' '+foundCount()+'/8';
}


/* ---------- Music toggle + character customizer ---------- */
var LK_PAL={
  hair:[0x1a1412,0x2a1a12,0x4a2616,0x7a3a22,0xc9a25a,0xe6dcc0,0xa8321e,0x5a1424,0x2c4a8a],
  eye:[0x3a2418,0x1d1518,0x7a5a2a,0x2f7a4a,0x3a78c8,0x7b8794,0x7a4ab8,0xc98a2a],
  skin:[0xf6d5bd,0xf0c0a0,0xe0a57e,0xc68863,0xa56b45,0x7a4a2e],
  jacket:[0x1c2a4a,0x16161a,0x3a3d46,0x5a1a2a,0x1f4a3a,0xb08a5a,0xe8e0cf,0x15485a],
  pants:[0x16171d,0x2a2f3d,0x4a4136,0x6a6a6a,0x20384a,0xd8cfbc],
  dress:[0x1f6a55,0xb3263e,0x1c2a5a,0x17171b,0xe8b4bc,0x8a74c0,0xefe4d0,0xc9962e],
  accent:[0x7a1830,0x1c4a7a,0xd9b25e,0x2a2a2a,0xe85a7a,0x2f7a5a,0xf4f0ea],
  shoe:[0x1a1210,0x3a2018,0x8a1c2a,0xe8e0d4,0x1c2a4a]
};
var LK_ROWS={
  him:[['jacket',['top'],'jacket','Jacket','الجاكيت'],['outer',['vest'],'jacket','Waistcoat','الصديري'],['pants',['bottom'],'pants','Trousers','البنطلون'],['accent',['accent'],'accent','Tie','الكرافتة'],['shoe',['shoe'],'shoe','Shoes','الحذاء'],['hair',['hair'],'hair','Hair','الشعر'],['eye',['eye'],'eye','Eyes','العيون'],['skin',['skin'],'skin','Skin','البشرة']],
  her:[['dress',['top','bottom'],'dress','Dress / blouse','الفستان / البلوزة'],['outer',['vest'],'jacket','Vest','الصديري'],['pants',['pants'],'pants','Trousers','البنطلون'],['accent',['belt','trim'],'accent','Belt & details','الحزام'],['shoe',['shoe'],'shoe','Shoes','الحذاء'],['hair',['hair'],'hair','Hair','الشعر'],['eye',['eye'],'eye','Eyes','العيون'],['skin',['skin'],'skin','Skin','البشرة']]
};
var LK_OUTFITS={
  him:[
    {key:'suit',icon:'🤵',en:'Suit & tie',ar:'بدلة وكرافتة',colors:{top:0x1c2a4a,bottom:0x16171d,accent:0x7a1830,vest:0x1c2a4a}},
    {key:'vest',icon:'🦺',en:'Waistcoat',ar:'صديري أنيق',colors:{top:0xf0e7d8,bottom:0x253247,accent:0xd9b25e,vest:0x6a2941}},
    {key:'casual',icon:'👕',en:'Casual',ar:'كاجوال',colors:{top:0x327b73,bottom:0x26394c,accent:0x1c2a4a,vest:0x327b73}}
  ],
  her:[
    {key:'dress',icon:'👗',en:'Evening dress',ar:'فستان سهرة',colors:{top:0x1f6a55,bottom:0x1f6a55,accent:0xd9b25e,vest:0xe8b4bc,pants:0x33263f}},
    {key:'vest',icon:'🧥',en:'Vest & skirt',ar:'صديري وتنورة',colors:{top:0xf1d5c9,bottom:0x1f6a55,accent:0xd9b25e,vest:0x8a3347,pants:0x33263f}},
    {key:'casual',icon:'👕',en:'Casual',ar:'كاجوال',colors:{top:0xf1d5c9,bottom:0x293b52,accent:0xd9b25e,vest:0x8a3347,pants:0x293b52}}
  ]
};
function lkSetOutfit(w,o){ CUST[w].outfit=o.key; Object.keys(o.colors).forEach(function(k){ CUST[w][k]=o.colors[k]; }); }
function lkSave(){ try{ localStorage.setItem('ourMuseumLook',JSON.stringify(CUST)); }catch(e){} }
var outfitMigrated=false;
if(CUST.him.outfit==='casual'&&CUST.him.bottom===0xd2b98f){ CUST.him.bottom=0x26394c; outfitMigrated=true; }
if(CUST.her.outfit==='trousers'){ CUST.her.outfit='casual'; if(CUST.her.bottom===0x33263f) CUST.her.bottom=0x293b52; if(CUST.her.pants===0x33263f) CUST.her.pants=0x293b52; outfitMigrated=true; }
if(outfitMigrated) lkSave();
function setCM(m,c){ if(!m) return; m.color.set(c); if(m.emissive&&m.emissiveIntensity>0&&!m.isMeshBasicMaterial) m.emissive.set(c); }
function applyLook(av){
  var u=av.userData, m=u.mats; if(!m) return;
  var st=mergeLook(u.him?STY_HIM:STY_HER);
  var outfit=st.outfit||(u.him?'suit':'dress'), outfitMeshes=u.outfitMeshes||{}, pantsLook=!u.him&&(outfit==='trousers'||outfit==='casual'), casualLook=outfit==='casual';
  setCM(m.skin,st.skin); setCM(m.top,st.top); setCM(m.topD,st.top); m.topD.color.multiplyScalar(.72); m.topD.emissive.copy(m.topD.color);
  setCM(m.bottom,st.bottom); setCM(m.legs,u.him?st.bottom:(pantsLook?(st.pants||0x33263f):st.legs)); setCM(m.vest,st.vest!=null?st.vest:st.top); setCM(m.hair,st.hair); setCM(m.shoe,st.shoe); m.iris.color.set(st.eye);
  (u.forearms||[]).forEach(function(a){ a.material=casualLook?m.skin:m.top; });
  if(u.him){ setCM(m.tie,st.accent!=null?st.accent:0x7a1830); } else { setCM(m.belt,st.belt); setCM(m.trim,st.accent!=null?st.accent:st.trim); }
  if(outfitMeshes.suit) outfitMeshes.suit.visible=!!u.him&&outfit==='suit';
  if(outfitMeshes.vest) outfitMeshes.vest.visible=u.him?outfit==='vest':outfit==='vest';
  if(u.skirt) u.skirt.visible=!u.him&&!pantsLook;
  if(u.pantsHip) u.pantsHip.visible=pantsLook;
  if(u.beltMesh) u.beltMesh.visible=!pantsLook;
}
function applyLookAll(){ AV.forEach(applyLook); }
/* her details colour: store accent into belt+trim */
(function(){
  var _mg=mergeLook; mergeLook=function(o){ var r=_mg(o); if(!o.him&&CUST.her.accent!=null){ r.belt=CUST.her.accent; r.trim=CUST.her.accent; } return r; };
})();
applyLookAll();

/* Optional guided museum tour */
var TOUR_ORDER=[0,1,3,2,4,5,7,6], TOUR_TOTAL=11;
var museumTour={active:false,complete:false,index:0,target:null};
var tourMarker=new THREE.Group(), tourOuter=new THREE.Mesh(new THREE.TorusGeometry(.62,.035,8,48),new THREE.MeshBasicMaterial({color:0xff8da5,transparent:true,opacity:.95,depthWrite:false}));
tourOuter.rotation.x=-Math.PI/2; tourOuter.position.y=.045; tourMarker.add(tourOuter);
var tourInner=new THREE.Mesh(new THREE.TorusGeometry(.38,.018,8,40),new THREE.MeshBasicMaterial({color:0xffd99a,transparent:true,opacity:.9,depthWrite:false}));
tourInner.rotation.x=-Math.PI/2; tourInner.position.y=.055; tourMarker.add(tourInner);
var tourGlow=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.3),new THREE.MeshBasicMaterial({map:radialTex('rgba(255,105,145,.42)','rgba(255,105,145,0)'),transparent:true,opacity:.72,depthWrite:false,side:THREE.DoubleSide}));
tourGlow.rotation.x=-Math.PI/2; tourGlow.position.y=.018; tourMarker.add(tourGlow);
var tourSpark=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),new THREE.MeshBasicMaterial({color:0xffe2ae})); tourSpark.position.y=.78; tourMarker.add(tourSpark); tourMarker.visible=false; scene.add(tourMarker);
function tourStopAt(i){
  if(i<8){ var fi=TOUR_ORDER[i], f=galleryFrames[fi]; return {kind:'frame',index:fi,x:f.x<0?-11.15:11.15,z:f.z}; }
  if(i===8) return {kind:'room',zone:1,x:-17,z:-25.5};
  if(i===9) return {kind:'room',zone:2,x:17,z:-25.5};
  return {kind:'proposal',x:0,z:-30.5};
}
function tourText(key){
  var ar=LANG==='ar';
  var en={button:'🧭 Guided tour',end:'✕ End tour',again:'↻ Tour again',close:'Close',stop:'Stop '+(museumTour.index+1)+' of '+TOUR_TOTAL,doneProgress:'Tour complete · 11 / 11',
    frameTitle:'Photo '+(museumTour.index<8?TOUR_ORDER[museumTour.index]+1:''),frameMessage:'Walk to the glowing marker. Open the photo when you get close.',photoTitle:'Photo Booth',photoMessage:'Step into the Photo Booth to explore the shared memories.',drawTitle:'Drawing Studio',drawMessage:'Visit the Drawing Studio and make a picture together.',proposalTitle:'The proposal',proposalMessage:'Follow the hall to the proposal spot.',doneTitle:'Tour complete ♥',doneMessage:'You visited all the memories and both creative rooms. The proposal spot is ahead.',here:'You’re here',walk:'Walk ',meters:' m'};
  var arText={button:'🧭 جولة إرشادية',end:'✕ إنهاء الجولة',again:'↻ جولة مرة أخرى',close:'إغلاق',stop:'محطة '+(museumTour.index+1)+' من '+TOUR_TOTAL,doneProgress:'اكتملت الجولة · 11 / 11',
    frameTitle:'الصورة '+(museumTour.index<8?TOUR_ORDER[museumTour.index]+1:''),frameMessage:'امشِ نحو العلامة المضيئة وافتح الصورة لما تقرب.',photoTitle:'ركن التصوير',photoMessage:'ادخل ركن التصوير واكتشفوا ذكرياتكم معاً.',drawTitle:'ورشة الرسم',drawMessage:'زوروا ورشة الرسم واعملوا رسمة مع بعض.',proposalTitle:'مكان المفاجأة',proposalMessage:'اتبع الممر إلى مكان المفاجأة.',doneTitle:'اكتملت الجولة ♥',doneMessage:'شاهدت كل الذكريات وزرت الركنين. مكان المفاجأة أمامك.',here:'وصلت للمكان',walk:'امشِ ',meters:' م'};
  return (ar?arText:en)[key];
}
function tourSet(id,value){ var e=$(id); if(e&&e.textContent!==value) e.textContent=value; }
function refreshTourButton(){ if(!tTour) return; tTour.textContent=museumTour.active?tourText('end'):(museumTour.complete?tourText('again'):tourText('button')); tTour.title=tTour.ariaLabel=tTour.textContent; tTour.disabled=state!=='explore'; }
function renderMuseumTour(now){
  var guide=$('tourGuide'); if(!guide) return;
  guide.setAttribute('aria-label',LANG==='ar'?'جولة إرشادية في المتحف':'Guided museum tour');
  guide.hidden=!museumTour.active&&!museumTour.complete; tourMarker.visible=!!museumTour.active;
  refreshTourButton();
  if(museumTour.complete){
    tourSet('tourProgress',tourText('doneProgress'));
    tourSet('tourTitle',tourText('doneTitle')); tourSet('tourMessage',tourText('doneMessage')); tourSet('tourArrow','♥'); tourSet('tourDistance',''); tourSet('tourStop',tourText('close')); return;
  }
  if(!museumTour.active||!museumTour.target) return;
  var step=museumTour.target, dx=step.x-player.position.x, dz=step.z-player.position.z, distance=Math.hypot(dx,dz);
  var forward=-Math.sin(camYaw)*dx-Math.cos(camYaw)*dz, right=Math.cos(camYaw)*dx-Math.sin(camYaw)*dz;
  var arrows=['↑','↗','→','↘','↓','↙','←','↖'], dir=(Math.round(Math.atan2(right,forward)/(Math.PI/4))+8)%8;
  var title,message;
  if(step.kind==='frame'){ title=tourText('frameTitle')+' · '+CAP(step.index); message=tourText('frameMessage'); }
  else if(step.kind==='room'&&step.zone===1){ title=tourText('photoTitle'); message=tourText('photoMessage'); }
  else if(step.kind==='room'){ title=tourText('drawTitle'); message=tourText('drawMessage'); }
  else { title=tourText('proposalTitle'); message=tourText('proposalMessage'); }
  tourSet('tourProgress',tourText('stop')); tourSet('tourTitle',title); tourSet('tourMessage',message); tourSet('tourArrow',arrows[dir]);
  var n=Math.round(distance), nf=new Intl.NumberFormat(LANG==='ar'?'ar-EG':'en-US').format(n);
  tourSet('tourDistance',distance<2.3?tourText('here'):tourText('walk')+nf+tourText('meters')); tourSet('tourStop',tourText('end'));
  tourMarker.position.set(step.x,0,step.z); var phase=(now||0)*.001;
  tourOuter.scale.setScalar(1+.08*Math.sin(phase*2.7)); tourInner.rotation.z=phase*.7; tourGlow.material.opacity=.58+.18*Math.sin(phase*2.2);
  tourSpark.position.y=.76+.16*Math.sin(phase*2.5); tourSpark.scale.setScalar(.9+.18*Math.sin(phase*2.5));
}
function finishMuseumTour(showComplete){
  museumTour.active=false; museumTour.complete=!!showComplete; museumTour.target=null; tourMarker.visible=false;
  if(!showComplete) $('tourGuide').hidden=true;
  renderMuseumTour(0);
}
function toggleMuseumTour(){
  if(museumTour.active){ finishMuseumTour(false); return; }
  if(state!=='explore') return;
  museumTour.active=true; museumTour.complete=false; museumTour.index=0; museumTour.target=tourStopAt(0); $('tourGuide').hidden=false;
  renderMuseumTour(performance.now());
}
function updateMuseumTour(now){
  if(!museumTour.active||state!=='explore') return;
  var step=museumTour.target, d=Math.hypot(step.x-player.position.x,step.z-player.position.z), arrived=step.kind==='room'?zoneOf(player.position)===step.zone&&d<4.2:d<2.3;
  if(arrived){ museumTour.index++; chime([79,84,88],.11,.1); if(museumTour.index>=TOUR_TOTAL){ finishMuseumTour(true); return; } museumTour.target=tourStopAt(museumTour.index); }
  renderMuseumTour(now);
}

