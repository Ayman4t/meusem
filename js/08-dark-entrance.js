/* Dark entrance: one lit painting, light cone follows her */
'use strict';

/* ---------- Dark entrance: one lit painting, a cone of light from the roof follows her ---------- */
var DK={on:false,t:0,step:0,target:-1,wait:1.2,fin:false,finT:0,fadeDur:3,lit:[],k:[],burst:[],trail:[],lx:null,lz:null,msgT:null,shown:false};
for(var di=0;di<8;di++){ DK.lit[di]=false; DK.k[di]=0; DK.burst[di]=0; }
/* The darkness is done in the shaders of every material, so only what is inside her cone of light
   (or a lit painting) is drawn; nothing beyond it can be seen. Off (dkS.x=0) outside the dark entrance. */
var DKU={C:new THREE.Vector3(),R:new THREE.Matrix3(),P:new THREE.Vector4(0,0,0,2.3),S:new THREE.Vector4(0,0,.012,0),A:[],T:[]};
for(var da=0;da<8;da++) DKU.A.push(new THREE.Vector4(0,0,0,0));
for(var dt2=0;dt2<10;dt2++) DKU.T.push(new THREE.Vector4(0,0,0,0));
var DK_FRAG=[
 'if(dkS.x>.5){',
 ' float rr=mix(dkP.w,dkP.w*.2,clamp(vDkW.y/5.0,0.0,1.0));',
 ' float lit=1.0-smoothstep(rr*.5,rr,length(vDkW.xz-dkP.xz));',
 ' for(int i=0;i<8;i++){ vec4 a=dkA[i]; if(a.w>.01) lit=max(lit,1.0-smoothstep(a.w*.45,a.w,length(vDkW-a.xyz))); }',
 ' for(int j=0;j<10;j++){ vec4 q=dkT[j]; if(q.w>.01) lit=max(lit,(1.0-smoothstep(q.w*.3,q.w,length(vDkW-q.xyz)))*.55); }',
 ' float f=mix(dkS.z,1.0,lit); f=mix(f,1.0,dkS.w); gl_FragColor.rgb*=f;',
 '}'].join('\n');
THREE.Material.prototype.onBeforeCompile=function(sh){
  if(sh.vertexShader.indexOf('#include <fog_vertex>')<0||sh.fragmentShader.indexOf('#include <fog_fragment>')<0) return;
  sh.uniforms.dkC={value:DKU.C}; sh.uniforms.dkR={value:DKU.R}; sh.uniforms.dkP={value:DKU.P}; sh.uniforms.dkS={value:DKU.S}; sh.uniforms.dkA={value:DKU.A}; sh.uniforms.dkT={value:DKU.T};
  sh.vertexShader='uniform vec3 dkC;\nuniform mat3 dkR;\nvarying vec3 vDkW;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nvDkW=dkC+dkR*mvPosition.xyz;');
  sh.fragmentShader='uniform vec4 dkP;\nuniform vec4 dkS;\nuniform vec4 dkA[8];\nuniform vec4 dkT[10];\nvarying vec3 vDkW;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\n'+DK_FRAG);
};
/* the visible shaft of light from the ceiling lamp down to a circle on the floor */
var dkBeam=new THREE.Mesh(new THREE.CylinderGeometry(.42,2.15,H,48,1,true),new THREE.MeshBasicMaterial({color:0xffd9b0,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
dkBeam.visible=false; dkBeam.renderOrder=5; scene.add(dkBeam);
var dkRing=new THREE.Mesh(new THREE.RingGeometry(1.7,2.2,48),new THREE.MeshBasicMaterial({color:0xffd9b0,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
dkRing.rotation.x=-Math.PI/2; dkRing.position.y=.03; dkRing.visible=false; scene.add(dkRing);

function dkOn(){ return DK.on; }
function dkLit(i){ return DK.lit[i]; }
function dkMsg(text,ms){
  var m=$('darkMsg'); if(!m) return; clearTimeout(DK.msgT);
  m.textContent=text; m.classList.add('show');
  DK.msgT=setTimeout(function(){ m.classList.remove('show'); },ms||2600);
}
function dkHearts(){
  var h=$('darkHearts'); if(!h) return; var n=0; DK.lit.forEach(function(v){ if(v) n++; });
  h.innerHTML=''; for(var i=0;i<8;i++){ var s=document.createElement('span'); s.textContent=i<n?'♥':'♡'; if(i<n) s.className='on'; h.appendChild(s); }
}
function dkStart(){
  if(DK.on) return true;
  DK.on=true; DK.t=0; DK.step=0; DK.fin=false; DK.wait=1.4; DK.target=-1;
  document.body.classList.add('dk'); $('darkSkip').hidden=false; $('darkHearts').hidden=false; dkHearts();
  tags.npc.el.classList.add('dkHide'); if(ROLE==='guest') send({t:'dk',v:1});
  $('darkSkip').textContent=LANG==='ar'?'تخطي ›':'Skip ›';
  setTimeout(function(){ if(DK.on&&!DK.fin) dkMsg(LANG==='ar'?'اتبعي النور ♥':'Follow the light ♥',3600); },2800);
  return true;
}
function dkNext(){
  DK.target=DK.step<8?TOUR_ORDER[DK.step]:-1;
  if(DK.target>=0){ DK.k[DK.target]=0; DK.shown=false; }
}
function dkFinale(skipped){
  if(DK.fin) return; DK.fin=true; DK.finT=0; DK.target=-1;
  DK.fadeDur=skipped?2.6:3.2;
  DK.k0=[]; for(var i=0;i<8;i++){ DK.k0[i]=DK.lit[i]?1:DK.k[i]; DK.lit[i]=true; }  /* lights ease on together with the room instead of popping on in one frame */
  dkHearts(); tags.npc.el.classList.remove('dkHide');
  chime([72,76,79,84,88],.14,.13); playReal('whoosh',.35); if(!skipped) playReal('tada',.3);
  dkMsg(LANG==='ar'?'كل ذكرى منورة عشانك ♥':'Every memory, lit for you ♥',3600);
  var g=function(fn,ms){ setTimeout(function(){ if(state==='explore') fn(); },ms); };
  if(!ROLE){
    g(function(){ say('me',C('l1'),3000); },skipped?300:1100);
    g(function(){ say('npc',C('l2'),3000); },skipped?2400:3200);
    g(function(){ if(!flags.l3){ flags.l3=true; say('npc',C('l3'),3400); } },skipped?5600:6500);
    g(function(){ if(!flags.l4){ flags.l4=true; say('npc',C('l4'),3400); } },skipped?9200:10200);
  }
}
$('darkSkip').addEventListener('click',function(){ if(DK.on) dkFinale(true); });
function dkEnd(){
  DK.on=false; DKU.S.x=0; DKU.S.w=0; dkBeam.visible=false; dkRing.visible=false;
  document.body.classList.remove('dk'); $('darkSkip').hidden=true; $('darkHearts').hidden=true;
  tags.npc.el.classList.remove('dkHide'); refreshTourButton(); if(ROLE==='guest') send({t:'dk',v:0});
}
/* runs every frame just before the scene is drawn */
function dkTick(dt,now){
  if(!DK.on) return;
  if(state!=='explore'&&!DK.fin) dkFinale(true);
  DK.t+=dt;
  var pp=player.position;

  if(!DK.fin){
    if(DK.lx===null||Math.hypot(pp.x-DK.lx,pp.z-DK.lz)>.9){ DK.trail.push({x:pp.x,z:pp.z,a:1}); DK.lx=pp.x; DK.lz=pp.z; if(DK.trail.length>10) DK.trail.shift(); }
    if(DK.target<0&&DK.step<8){ DK.wait-=dt; if(DK.wait<=0) dkNext(); }
    if(DK.target>=0){
      var f=galleryFrames[DK.target];
      if(!DK.shown){ DK.shown=true; chime([84],.1,.1); playReal('bell',.25); }
      DK.k[DK.target]=Math.min(1,DK.k[DK.target]+dt/2.4);
      if(DK.k[DK.target]>.7&&Math.hypot(f.x-pp.x,f.z-pp.z)<4.6){
        var j=DK.target; DK.lit[j]=true; DK.burst[j]=1; DK.step++; DK.target=-1; DK.wait=1.7;
        chime([79,84,88],.1,.12); playReal('ding',.4); dkHearts(); dkMsg(CAP(j),2200);
        if(DK.step>=8){ setTimeout(function(){ if(DK.on&&!DK.fin) dkFinale(false); },1900); DK.wait=99; }
      }
    }
  } else {
    DK.finT+=dt;
    DKU.S.w=ease(DK.finT/DK.fadeDur);
    if(DK.finT>=DK.fadeDur){ dkEnd(); return; }
  }
  for(var i=0;i<8;i++) if(DK.burst[i]>0) DK.burst[i]=Math.max(0,DK.burst[i]-dt/1.5);
  for(var q=DK.trail.length-1;q>=0;q--){ DK.trail[q].a-=dt/3; if(DK.trail[q].a<=0) DK.trail.splice(q,1); }

  /* hand everything to the shaders */
  camera.updateMatrixWorld(); DKU.C.setFromMatrixPosition(camera.matrixWorld); DKU.R.setFromMatrix4(camera.matrixWorld);
  DKU.S.x=1; DKU.P.set(pp.x,0,pp.z,2.3);
  for(var n=0;n<8;n++){
    var fr=galleryFrames[n], side=fr.x<0?1:-1, k=DK.fin?(DK.k0[n]+(1-DK.k0[n])*ease(clampN(DK.finT/(DK.fadeDur*.8),0,1))):(DK.lit[n]?1:DK.k[n]*(.94+.06*Math.sin(now*.003)));
    DKU.A[n].set(fr.x+side*.9,2.1,fr.z,3.7*k*(1+.45*DK.burst[n]));
  }
  for(var m=0;m<10;m++){ var tp=DK.trail[m]; if(tp) DKU.T[m].set(tp.x,0,tp.z,1.5*tp.a); else DKU.T[m].w=0; }
  var bw=1-DKU.S.w;
  dkBeam.visible=dkRing.visible=bw>.02; dkBeam.position.set(pp.x,H/2,pp.z); dkRing.position.x=pp.x; dkRing.position.z=pp.z;
  dkBeam.material.opacity=.1*bw; dkRing.material.opacity=(.14+.03*Math.sin(now*.004))*bw;
  scene.background.multiplyScalar(DKU.S.w); scene.fog.color.multiplyScalar(DKU.S.w);
}

/* music toggle */
try{ muted=localStorage.getItem('ourMuseumMuted')==='1'; sfxMuted=localStorage.getItem('ourMuseumSfxMuted')==='1'; }catch(e){}
var tMusic=document.createElement('button'), tSfx=document.createElement('button'), tHome=null, tTour=document.createElement('button'); tMusic.className='tool icon'; tMusic.id='tMusic'; tSfx.className='tool icon'; tSfx.id='tSfx'; tTour.className='tool'; tTour.id='tTour';
var tLook=document.createElement('button'); tLook.className='tool'; tLook.id='tLook';
$('tools').insertBefore(tMusic,$('tools').firstChild);
$('tools').appendChild(tTour); tTour.addEventListener('click',toggleMuseumTour);
$('tourStop').addEventListener('click',function(){ if(museumTour.active){ finishMuseumTour(false); return; } museumTour.complete=false; $('tourGuide').hidden=true; refreshTourButton(); });
function refreshExtra(){
  var ar=LANG==='ar';
  if($('askSfx')){ $('askSfx').textContent=(sfxMuted?'\uD83D\uDD07 ':'\uD83D\uDD0A ')+(ar?'\u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629':'Sound effects'); $('askSfx').setAttribute('aria-pressed',String(!sfxMuted)); }
  if($('amMusic')){ $('amMusic').textContent='\uD83C\uDFB5'; $('amSfx').textContent='\uD83D\uDD0A'; $('amMusic').classList.toggle('off',muted); $('amSfx').classList.toggle('off',sfxMuted); $('amMusic').title=$('amMusic').ariaLabel=ar?'الموسيقى':'Music'; $('amSfx').title=$('amSfx').ariaLabel=ar?'المؤثرات':'Sound effects'; }
  tMusic.textContent='\uD83C\uDFB5'; tMusic.classList.toggle('off',muted); tMusic.title=tMusic.ariaLabel=muted?(ar?'تشغيل الموسيقى':'Turn music on'):(ar?'إيقاف الموسيقى':'Turn music off');
  tSfx.textContent='\uD83D\uDD0A'; tSfx.classList.toggle('off',sfxMuted); tSfx.title=tSfx.ariaLabel=sfxMuted?(ar?'تشغيل أصوات المتحف':'Turn museum sounds on'):(ar?'إيقاف أصوات المتحف':'Turn museum sounds off');
  tLook.textContent='\uD83D\uDC57 '+(ar?'تخصيص الشخصيات':'Customize');
  if(MUSEUM_MODE){ if(!tHome){ tHome=document.createElement('button'); tHome.className='tool'; tHome.id='tHome'; tHome.addEventListener('click',function(){ window.top.location.href=new URL('index.html',location.href).href; }); $('tools').insertBefore(tHome,$('tools').firstChild); } tHome.textContent=ar?'← الإعداد':'← Intro'; }
  refreshTourButton(); if(museumTour.active||museumTour.complete) renderMuseumTour(performance.now());
  if(window.lkRefresh) lkRefresh(); if(window.emRefresh) emRefresh();
}
tMusic.addEventListener('click',function(){ setMuted(!muted); try{ localStorage.setItem('ourMuseumMuted',muted?'1':'0'); }catch(e){} if(!muted&&typeof initAudio==='function'){ initAudio(); startMusic(); } refreshExtra(); });
$('askSfx').addEventListener('click',function(){ tSfx.click(); });
$('amSfx').addEventListener('click',function(){ tSfx.click(); });
$('amMusic').addEventListener('click',function(){ tMusic.click(); });
tSfx.addEventListener('click',function(){ setSfxMuted(!sfxMuted); try{ localStorage.setItem('ourMuseumSfxMuted',sfxMuted?'1':'0'); }catch(e){} refreshExtra(); });

/* customizer panel with its own live 3D preview */
var lookEl=document.createElement('div'); lookEl.id='look'; lookEl.hidden=true;
lookEl.innerHTML='<div class="lk-card" role="dialog" aria-modal="true"><header><h2 id="lkTitle"></h2><button class="ghost sm" id="lkClose"></button></header><div class="lk-body"><div class="lk-prev"><canvas id="pvCv"></canvas><div class="lk-hint" id="lkHint"></div><div class="lk-seg" id="lkSeg"></div></div><div class="lk-opts" id="lkOpts"></div></div><footer><span class="lk-ft"><button class="ghost sm" id="lkReset"></button><button class="ghost sm" id="lkRand"></button></span><button class="primary" id="lkDone" style="padding:10px 28px"></button></footer></div>';
$('stage').appendChild(lookEl);
var lkWho='him', pvR=null, pvScene=null, pvCam=null, pvAv={}, pvRun=false, pvLast=0, pvSpin=0, pvDrag=null;
function lkName(w){ var ar=LANG==='ar'; return w==='him'?((ar?'هو':'Him')+' · '+C('from')):((ar?'هي':'Her')+' · '+C('to')); }
function hex(n){ return '#'+('000000'+n.toString(16)).slice(-6); }
function lkBuild(){
  var ar=LANG==='ar';
  $('lkTitle').textContent=ar?'تخصيص الشخصيات':'Customize characters'; $('lkClose').textContent=ar?'إغلاق':'Close'; $('lkDone').textContent=ar?'تم':'Done'; $('lkRand').textContent=ar?'🎲 عشوائي':'🎲 Surprise me'; $('lkHint').textContent=ar?'اسحب عشان تلف الشخصية':'Drag to rotate'; $('lkReset').textContent=ar?'إعادة ضبط':'Reset this character';
  var seg=$('lkSeg'); seg.innerHTML='';
  ['him','her'].forEach(function(w){ var b=document.createElement('button'); b.textContent=lkName(w); if(w===lkWho) b.className='on'; b.addEventListener('click',function(){ lkWho=w; lkBuild(); }); seg.appendChild(b); });
  var box=$('lkOpts'); box.innerHTML='';
  var cinemaRow=document.createElement('div'); cinemaRow.className='lk-row';
  var cinemaTitle=document.createElement('h4'); cinemaTitle.textContent=t('cinemaVideo'); cinemaRow.appendChild(cinemaTitle);
  var cinemaNote=document.createElement('p'); cinemaNote.className='lk-cinema-note'; cinemaNote.textContent=t('cinemaVideoNote'); cinemaRow.appendChild(cinemaNote);
  var cinemaControls=document.createElement('div'); cinemaControls.className='lk-cinema-controls';
  var cinemaInput=document.createElement('input'); cinemaInput.type='file'; cinemaInput.accept='video/*'; cinemaInput.hidden=true; cinemaInput.setAttribute('aria-label',t('cinemaVideo'));
  var cinemaPick=document.createElement('button'); cinemaPick.type='button'; cinemaPick.className='ghost sm'; cinemaPick.textContent=store.cinemaVideo?t('videoChange'):t('videoPick');
  var cinemaClear=document.createElement('button'); cinemaClear.type='button'; cinemaClear.className='ghost sm'; cinemaClear.textContent=t('clear'); cinemaClear.hidden=!store.cinemaVideo;
  var cinemaStatus=document.createElement('span'); cinemaStatus.className='lk-cinema-status'; cinemaStatus.textContent=store.cinemaVideo?(store.cinemaVideo.name||t('videoSaved')):'';
  cinemaPick.addEventListener('click',function(){ cinemaInput.click(); });
  cinemaInput.addEventListener('change',function(){ var f=cinemaInput.files&&cinemaInput.files[0]; if(!f) return; if(f.size>40*1048576) toast(t('tooBig')); store.cinemaVideo=f; idbPut('cinemaVideo',f); syncCinemaVideo(); lkBuild(); });
  cinemaClear.addEventListener('click',function(){ delete store.cinemaVideo; idbDel('cinemaVideo'); syncCinemaVideo(); lkBuild(); });
  cinemaControls.appendChild(cinemaInput); cinemaControls.appendChild(cinemaPick); cinemaControls.appendChild(cinemaClear); cinemaControls.appendChild(cinemaStatus); cinemaRow.appendChild(cinemaControls); box.appendChild(cinemaRow);
  var st=mergeLook(lkWho==='him'?STY_HIM:STY_HER);
  var outfitRow=document.createElement('div'); outfitRow.className='lk-row'; var outfitTitle=document.createElement('h4'); outfitTitle.textContent=ar?'ستايل الملابس':'Clothing style'; outfitRow.appendChild(outfitTitle);
  var outfits=document.createElement('div'); outfits.className='lk-outfits'; var activeOutfit=st.outfit||(lkWho==='him'?'suit':'dress');
  LK_OUTFITS[lkWho].forEach(function(o){ var b=document.createElement('button'); b.type='button'; b.className='lk-outfit'+(o.key===activeOutfit?' on':''); b.setAttribute('aria-pressed',String(o.key===activeOutfit));
    var icon=document.createElement('span'); icon.className='lk-outfit-icon'; icon.textContent=o.icon; var label=document.createElement('span'); label.className='lk-outfit-label'; label.textContent=ar?o.ar:o.en; b.appendChild(icon); b.appendChild(label);
    b.addEventListener('click',function(){ lkSetOutfit(lkWho,o); lkSave(); applyLookAll(); lkBuild(); }); outfits.appendChild(b); });
  outfitRow.appendChild(outfits); box.appendChild(outfitRow);
  LK_ROWS[lkWho].forEach(function(r){
    if(lkWho==='him'&&((r[0]==='outer'&&activeOutfit!=='vest')||(r[0]==='accent'&&activeOutfit!=='suit'))) return;
    if(lkWho==='her'&&((r[0]==='outer'&&activeOutfit!=='vest')||(r[0]==='pants'&&activeOutfit!=='casual'&&activeOutfit!=='trousers')||(r[0]==='accent'&&activeOutfit==='casual'))) return;
    var row=document.createElement('div'); row.className='lk-row'; var h=document.createElement('h4'), rowLabel=ar?r[4]:r[3];
    if(lkWho==='him'){ if(r[0]==='jacket') rowLabel=activeOutfit==='casual'?(ar?'تيشيرت':'T-shirt'):activeOutfit==='vest'?(ar?'القميص':'Shirt'):(ar?'الجاكيت':'Jacket'); if(r[0]==='pants'&&activeOutfit==='casual') rowLabel=ar?'جينز':'Jeans'; }
    if(lkWho==='her'&&r[0]==='dress'&&activeOutfit==='casual') rowLabel=ar?'البلوزة':'Blouse';
    h.textContent=rowLabel; row.appendChild(h);
    var sw=document.createElement('div'); sw.className='lk-sw'; var cur=st[r[1][0]]; if(r[0]==='accent'&&lkWho==='her') cur=CUST.her.accent!=null?CUST.her.accent:STY_HER.belt; if(r[0]==='accent'&&lkWho==='him'&&cur==null) cur=0x7a1830;
    LK_PAL[r[2]].forEach(function(c){ var b=document.createElement('button'); b.style.background=hex(c); b.setAttribute('aria-label',hex(c)); b.title=hex(c); if(c===cur) b.className='on';
      b.addEventListener('click',function(){ r[1].forEach(function(k){ CUST[lkWho][k]=c; }); lkSave(); applyLookAll(); lkBuild(); }); sw.appendChild(b); });
    row.appendChild(sw); box.appendChild(row);
  });
  if(pvAv.him) { pvAv.him.visible=lkWho==='him'; pvAv.her.visible=lkWho==='her'; }
}
window.lkRefresh=function(){ if(!lookEl.hidden) lkBuild(); };
function pvInit(){
  if(pvR) return;
  var cv=$('pvCv'); pvR=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true}); pvR.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  pvScene=new THREE.Scene(); pvCam=new THREE.PerspectiveCamera(30,1,.1,30); pvCam.position.set(0,1.2,5.4); pvCam.lookAt(0,1.0,0);
  pvScene.add(new THREE.AmbientLight(0xffffff,.8)); pvScene.add(new THREE.HemisphereLight(0xfff4e6,0x40364a,.55));
  var dl=new THREE.DirectionalLight(0xfff0dc,.7); dl.position.set(2,3,4); pvScene.add(dl);
  var plat=new THREE.Mesh(new THREE.CylinderGeometry(.9,.95,.06,40),new THREE.MeshStandardMaterial({color:0x2c2530,roughness:.5,metalness:.2})); plat.position.y=-.03; pvScene.add(plat);
  var rim=new THREE.Mesh(new THREE.TorusGeometry(.93,.012,8,60),new THREE.MeshBasicMaterial({color:0xc9a35a})); rim.rotation.x=Math.PI/2; pvScene.add(rim);
  pvAv.him=makeAvatar(STY_HIM); pvAv.her=makeAvatar(STY_HER);
  [pvAv.him,pvAv.her].forEach(function(a){ pvScene.add(a); a.position.set(0,0,0); a.rotation.y=0; });
  cv.addEventListener('pointerdown',function(e){ pvDrag={x:e.clientX,s:pvSpin}; try{ cv.setPointerCapture(e.pointerId); }catch(_){} });
  cv.addEventListener('pointermove',function(e){ if(pvDrag){ pvSpin=pvDrag.s+(e.clientX-pvDrag.x)*.012; } });
  cv.addEventListener('pointerup',function(){ pvDrag=null; }); cv.addEventListener('pointercancel',function(){ pvDrag=null; });
}
function pvSize(){ var cv=$('pvCv'), w=cv.clientWidth||300, h=cv.clientHeight||300; pvR.setSize(w,h,false); pvCam.aspect=w/h; pvCam.updateProjectionMatrix(); }
function pvTick(now){
  if(!pvRun) return; requestAnimationFrame(pvTick);
  var dt=Math.min(.05,(now-pvLast)/1000||.016); pvLast=now;
  if(!pvDrag) pvSpin+=dt*.55;
  var a=pvAv[lkWho]; a.rotation.y=pvSpin; pose(a,false,dt);
  pvR.render(pvScene,pvCam);
}
function openLook(){ window.lookOpen=true; lookEl.hidden=false; pvInit(); lkBuild(); applyLookAll(); setTimeout(function(){ pvSize(); },30); pvRun=true; pvLast=performance.now(); requestAnimationFrame(pvTick); }
function closeLook(){ window.lookOpen=false; lookEl.hidden=true; pvRun=false; }
tLook.addEventListener('click',openLook); $('lkClose').addEventListener('click',closeLook); $('lkDone').addEventListener('click',closeLook);
$('lkRand').addEventListener('click',function(){ var oo=LK_OUTFITS[lkWho], o=oo[Math.floor(Math.random()*oo.length)]; lkSetOutfit(lkWho,o); LK_ROWS[lkWho].forEach(function(r){ var pl=LK_PAL[r[2]], c=pl[Math.floor(Math.random()*pl.length)]; r[1].forEach(function(k){ CUST[lkWho][k]=c; }); }); lkSave(); applyLookAll(); lkBuild(); });
$('lkReset').addEventListener('click',function(){ CUST[lkWho]={}; lkSave(); applyLookAll(); lkBuild(); });
lookEl.addEventListener('pointerdown',function(e){ e.stopPropagation(); }); lookEl.addEventListener('click',function(e){ if(e.target===lookEl) closeLook(); });
window.addEventListener('resize',function(){ if(pvR&&!lookEl.hidden) pvSize(); });
refreshExtra();

