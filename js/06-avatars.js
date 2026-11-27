/* Rose petals, avatars, name tags and chat bubbles */
'use strict';

/* ---------- Rose petal path ---------- */
var petals=[];
for(var pi=0;pi<70;pi++){
  var pm=new THREE.Mesh(new THREE.CircleGeometry(.1,8),new THREE.MeshBasicMaterial({color:0x5a2030,side:THREE.DoubleSide}));
  pm.scale.set(1,1.7,1); pm.rotation.x=-Math.PI/2; pm.rotation.z=Math.random()*6.28; pm.position.set((Math.random()-.5)*3.8,.025,-18-Math.random()*18); pm.visible=false; scene.add(pm); petals.push(pm);
}

/* ---------- Romantic extras ---------- */
var pinkLight=new THREE.PointLight(0xff8fa8,0,14); pinkLight.position.set(0,2.6,-36.6); scene.add(pinkLight);
var heartTex=(function(){ var c=document.createElement('canvas'); c.width=c.height=64; var x=c.getContext('2d'); x.fillStyle='#ff7d96'; heartPath(x,32,30,24); x.fill(); return canvasTex(c); })();
var hearts=[];
for(var hi=0;hi<26;hi++){
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTex,transparent:true,opacity:0,depthWrite:false})), sc=.14+Math.random()*.18; sp.scale.set(sc,sc,1);
  sp.userData={bx:(Math.random()-.5)*5,bz:-36.6+(Math.random()-.5)*3,y:Math.random()*3,v:.25+Math.random()*.4,ph:Math.random()*6.28}; sp.visible=false; scene.add(sp); hearts.push(sp);
}

/* ---------- Avatars (jointed) ---------- */
var OUTLINE=new THREE.MeshBasicMaterial({color:0x1b1519,side:THREE.BackSide});
function part(parent,geo,mat,x,y,z,sx,sy,sz,ol){ var m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx||1,sy||1,sz||1); parent.add(m); if(ol){ var o=new THREE.Mesh(geo,OUTLINE); o.scale.set(ol,ol,ol); m.add(o); } return m; }
function SPH(r){ return new THREE.SphereGeometry(r,32,22); }
var CUST=(function(){ var c={him:{},her:{}}; try{ var j=JSON.parse(localStorage.getItem('ourMuseumLook')||'{}'); if(j.him) c.him=j.him; if(j.her) c.her=j.her; }catch(e){} return c; })();
var AV=[];
function mergeLook(o){ var c=CUST[o.him?'him':'her']||{}, r={}, k; for(k in o) r[k]=o[k]; for(k in c) r[k]=c[k]; if(!o.him&&c.skin!=null) r.legs=c.skin; if(r.eye==null) r.eye=0x2a1a14; return r; }
function makeAvatar(o){
  o=mergeLook(o);
  var g=new THREE.Group(), Wm=!!o.woman;
  function mat(c){ return new THREE.MeshStandardMaterial({color:c,roughness:.62,emissive:c,emissiveIntensity:.13}); }
  var skin=mat(o.skin),top=mat(o.top),trim=mat(o.trim),bottom=mat(o.bottom),legM=mat(o.legs||o.bottom),hair=new THREE.MeshPhysicalMaterial({color:o.hair,roughness:.28,metalness:.18,clearcoat:1,clearcoatRoughness:.22,emissive:o.hair,emissiveIntensity:.2,side:THREE.DoubleSide}),shoe=mat(o.shoe), irisM=new THREE.MeshBasicMaterial({color:o.eye}), topD=mat(o.top), tieM=mat(o.him?(o.accent!=null?o.accent:0x7a1830):0), beltM=mat(o.belt||0xd9b25e);
  topD.color.multiplyScalar(.72); topD.emissive.copy(topD.color);
  var white=new THREE.MeshBasicMaterial({color:0xffffff}),dark=new THREE.MeshBasicMaterial({color:0x1d1518}),lipM=new THREE.MeshBasicMaterial({color:Wm?0xd9697c:0x8a4040});
  var blushM=new THREE.MeshBasicMaterial({color:0xff6f8a,transparent:true,opacity:Wm?.3:.4,depthWrite:false});
  var hy=Wm?.593:.575, hip=new THREE.Group(); hip.position.set(0,hy,0); g.add(hip);
  var up=new THREE.Group(); up.position.set(0,-.88,0); hip.add(up);
  function leg(x){
    var th=new THREE.Group(); th.position.set(x,hy,0);
    part(th,new THREE.CylinderGeometry(.105,.09,.42,14),legM,0,-.2,0,1,1,1,1.07); part(th,SPH(.092),legM,0,-.41,0,1,1,1,1.07);
    var sh=new THREE.Group(); sh.position.set(0,-.41,0); th.add(sh);
    part(sh,new THREE.CylinderGeometry(.09,.075,.4,14),legM,0,-.2,0,1,1,1,1.07); part(sh,SPH(.1),shoe,0,-.38,.06,1.45,1.25,1.75,1.08);
    th.scale.set(Wm?1:1.05,Wm?.62:.6,Wm?1:1.05); g.add(th); return {th:th,sh:sh};
  }
  function arm(x){
    var sh=new THREE.Group(); sh.position.set(x,1.46,0);
    part(sh,new THREE.CylinderGeometry(.075,.065,.3,12),top,0,-.14,0,1,1,1,1.1); part(sh,SPH(.068),top,0,-.29,0,1,1,1,1.1);
    var el=new THREE.Group(); el.position.set(0,-.29,0); sh.add(el);
    var forearm=part(el,new THREE.CylinderGeometry(.065,.055,.3,12),top,0,-.14,0,1,1,1,1.1); var hand=new THREE.Group(); hand.position.set(0,-.31,0); el.add(hand);
    part(hand,SPH(.068),skin,0,-.012,0,1.15,.95,.75,1.1);
    function fin(px,py,pz,len,rx,rz,r){ var fg=new THREE.Group(); fg.position.set(px,py,pz); fg.rotation.set(rx,0,rz); hand.add(fg); part(fg,new THREE.CylinderGeometry(r,r*.86,len,8),skin,0,-len/2,0,1,1,1,1.12); part(fg,SPH(r*.92),skin,0,-len,0,1,1,1,1.12); return fg; }
    [[-.056,.046,.012],[-.019,.056,.016],[.019,.052,.016],[.056,.042,.012]].forEach(function(f,i){ fin(f[0],-.045,0,f[1]*1.5*(Wm?.95:1),-.25-(i%2)*.06,(i-1.5)*.06,.0175); });
    var inn=x>0?-1:1; fin(inn*.07,-.02,.035,.06,-.35,inn*.75,.019);
    sh.scale.set(Wm?.66:.8,.8,Wm?.66:.8); up.add(sh); return {sh:sh,el:el,hand:hand,forearm:forearm};
  }
  var lx=Wm?.1:.095, ax=Wm?.262:.285, lL=leg(-lx),lR=leg(lx),aL=arm(-ax),aR=arm(ax);
  if(Wm){ var tp=[[0,-.31],[.19,-.31],[.205,-.26],[.19,-.17],[.158,-.07],[.148,-.02],[.158,.07],[.18,.15],[.186,.2],[.17,.27],[.12,.3],[.06,.31],[0,.31]].map(function(p){ return new THREE.Vector2(p[0],p[1]); });
    part(up,new THREE.LatheGeometry(tp,28),top,0,1.17,0,1,1,.88,1.04);
    [-1,1].forEach(function(sx){ part(up,SPH(.062),top,sx*.075,1.31,.115,1,1,.9,1.05); part(up,SPH(.07),top,sx*.205,1.45,0,1,1,1,1.08); });
  } else {
  part(up,new THREE.CylinderGeometry(.18,.215,.62,18),top,0,1.17,0,1,1,1,1.04);
  part(up,SPH(.08),top,-.23,1.45,0,1,1,1,1.08); part(up,SPH(.08),top,.23,1.45,0,1,1,1,1.08); }
  var vestG=new THREE.Group(); up.add(vestG); var vestM=mat(o.vest!=null?o.vest:o.top);
  part(vestG,new THREE.CylinderGeometry(.192,.228,.5,20),vestM,0,1.19,0,1,1,1,1.04);
  [-1,1].forEach(function(sx){ part(vestG,new THREE.BoxGeometry(.05,.5,.05),vestM,sx*.17,1.3,.02,1,1,1,1.04); });
  part(vestG,new THREE.BoxGeometry(.075,.34,.02),top,0,1.27,.232,1,1,1,0);
  [0,1,2].forEach(function(k){ part(vestG,SPH(.014),mat(0x3a2418),0,1.12+k*.06,.262-.002*k,1,1,.6,0); });
  vestG.visible=!!o.vest;
  var suitG=new THREE.Group(); up.add(suitG);
  part(suitG,new THREE.BoxGeometry(.1,.3,.02),mat(0xf6f3ee),0,1.31,.208,1,1,1,0);
  part(suitG,new THREE.BoxGeometry(.034,.22,.016),tieM,0,1.27,.222,1,1,1,0);
  part(suitG,new THREE.BoxGeometry(.05,.04,.018),tieM,0,1.4,.222,1,1,1,0);
  [-1,1].forEach(function(ls){ var lp=part(suitG,new THREE.BoxGeometry(.05,.3,.018),topD,ls*.062,1.3,.205,1,1,1,0); lp.rotation.z=ls*.28; });
  part(suitG,new THREE.CylinderGeometry(.196,.23,.07,20),topD,0,1.0,0,1,1,1,1.04); suitG.visible=!!o.suit;
  var beltMesh=null; if(o.belt){ if(Wm) beltMesh=part(up,new THREE.CylinderGeometry(.152,.152,.03,18),beltM,0,1.14,0,1,1,.9,1.05); else beltMesh=part(up,new THREE.CylinderGeometry(.22,.22,.035,18),mat(o.belt),0,.86,0,1,1,1,1.03); }
  var skirtM=null,pantsHip=null;
  if(Wm){ skirtM=part(g,new THREE.CylinderGeometry(.22,.4,.42,24),bottom,0,.74,0,1,1,1,1.03); skirtM.visible=!!o.skirt;
    pantsHip=part(up,new THREE.CylinderGeometry(.18,.215,.28,18),bottom,0,.8,0,1,1,1,1.04); pantsHip.visible=!o.skirt; }
  else part(up,new THREE.CylinderGeometry(.215,.195,.2,18),bottom,0,.83,0,1,1,1,1.04);
  /* shoulders slope smoothly into a sturdier, shorter neck (trapezius blend) */
  var trap=part(up,SPH(.15),top,0,1.465,-.005,Wm?1.38:1.55,.56,Wm?.86:.92,1.03);
  if(o.turtle) part(up,new THREE.CylinderGeometry(.086,.1,.2,16),top,0,1.545,0,1,1,1,1.08);
  else { part(up,new THREE.CylinderGeometry(Wm?.064:.072,Wm?.078:.088,.2,16),skin,0,1.545,0,1,1,1,0); var col=part(up,new THREE.TorusGeometry(Wm?.098:.118,.03,8,22),trim,0,1.5,0,1,1,1,0); col.rotation.x=Math.PI/2; if(o.him){ [-1,1].forEach(function(cs){ var wing=part(up,new THREE.BoxGeometry(.09,.012,.12),trim,cs*.075,1.52,.1,1,1,1,0); wing.rotation.set(.5,0,cs*-.55); }); } }
  var HY=1.62, hd=new THREE.Group(); hd.position.set(0,HY+.043,0.012); hd.scale.setScalar(Wm?1.02:1.07); up.add(hd);
  function hp(geo,m,x,y,z,sx,sy,sz,ol){ return part(hd,geo,m,x,y-HY,z,sx,sy,sz,ol); }
  function makeHairFlower(x,y,z){
    var flower=new THREE.Group(); flower.position.set(x,y-HY,z); hd.add(flower);
    var petals=new THREE.MeshStandardMaterial({color:0xff7f9f,roughness:.48,emissive:0x6a1d34,emissiveIntensity:.12});
    var center=new THREE.MeshStandardMaterial({color:0xffd66e,roughness:.55,emissive:0x68420b,emissiveIntensity:.18});
    var leaf=new THREE.MeshStandardMaterial({color:0x65a86b,roughness:.7});
    for(var i=0;i<5;i++){
      var a=i*Math.PI*2/5, p=new THREE.Mesh(SPH(.035),petals);
      p.position.set(Math.cos(a)*.034,Math.sin(a)*.034,.004); p.scale.set(.78,1.18,.48); p.rotation.z=a+Math.PI/2; flower.add(p);
    }
    var core=new THREE.Mesh(SPH(.023),center); core.position.z=.025; flower.add(core);
    var stem=new THREE.Mesh(new THREE.CylinderGeometry(.004,.006,.075,7),leaf); stem.position.set(0,-.065,-.003); flower.add(stem);
    [-1,1].forEach(function(s){ var l=new THREE.Mesh(SPH(.018),leaf); l.position.set(s*.018,-.055,.002); l.scale.set(1.5,.55,.5); l.rotation.z=s*.5; flower.add(l); });
    return flower;
  }
  var hairFlower=makeHairFlower(.205,2.005,.145);
  hairFlower.visible=false;
  var carriedFlower=null;
  if(o.him){ carriedFlower=hairFlower.clone(true); carriedFlower.position.set(0,-.045,.075); carriedFlower.scale.setScalar(.68); carriedFlower.visible=true; aL.hand.add(carriedFlower); }
  hp(SPH(.27),skin,0,1.795,0,Wm?.93:.97,Wm?1:1.02,Wm?.98:1,1.05); hp(SPH(.045),skin,Wm?-.24:-.262,1.78,0,.6,1,1,1.12); hp(SPH(.045),skin,Wm?.24:.262,1.78,0,.6,1,1,1.12);
  var glowIris=new THREE.MeshBasicMaterial({color:new THREE.Color(o.eye).lerp(new THREE.Color(0xffffff),.42)}), browM=new THREE.MeshBasicMaterial({color:new THREE.Color(o.hair).multiplyScalar(.5)});
  var FE=[],FB=[],FLD=[],FACE={eyes:FE,brows:FB,lids:FLD,blushM:blushM,bBase:blushM.opacity};
  function fe(m){ FE.push({m:m,sx:m.scale.x,sy:m.scale.y,sz:m.scale.z}); return m; }
  [-1,1].forEach(function(sx){
    var x=sx*.103, es=Wm?.86:1;
    fe(hp(SPH(.07*es),white,x,1.8,.243,1.2,1.38,.45,0)); fe(hp(SPH(.062*es),irisM,x,1.795,.262,1.2,1.38,.5,0)); fe(hp(SPH(.034*es),dark,x,1.792,.274,1.05,1.2,.5,0)); if(Wm){ fe(hp(SPH(.034*es),glowIris,x,1.775,.281,1.45,.55,.4,0)); } fe(hp(SPH((Wm?.032:.027)*es),white,x+.02,1.825,.292,1,1,1,0)); fe(hp(SPH(.013*es),white,x-.018,1.774,.292,1,1,1,0));
    FLD.push({m:hp(new THREE.TorusGeometry(.044,.0075,6,14,Math.PI),dark,x,1.785,.266,1,1,1,0),k:'arc'}); FLD.push({m:hp(new THREE.BoxGeometry(.092,.011,.014),dark,x,1.8,.266,1,1,1,0),k:'line'}); FLD[FLD.length-1].m.visible=FLD[FLD.length-2].m.visible=false;
    var brow=hp(new THREE.BoxGeometry(Wm?.064:.085,Wm?.0075:.014,.012),Wm?browM:hair,x+(Wm?sx*.004:0),Wm?1.937:1.925,.252,1,1,1,0);
    if(Wm){ var ls=hp(new THREE.BoxGeometry(.108,.018,.016),dark,x,1.877,.272,1,1,1,0); ls.rotation.z=-sx*.1; FE.push({m:ls,sx:1,sy:1,sz:1}); var ls2=hp(new THREE.BoxGeometry(.042,.012,.016),dark,x+sx*.058,1.846,.268,1,1,1,0); ls2.rotation.z=sx*.4; FE.push({m:ls2,sx:1,sy:1,sz:1}); }
    brow.rotation.z=-sx*.12; FB.push({m:brow,y:brow.position.y,sx:sx});
    var bl=hp(new THREE.CircleGeometry(Wm?.05:.046,20),blushM,sx*.162,1.682,.2,1.15,.8,1,0); bl.rotation.y=sx*.62;
  });
  hp(SPH(Wm?.014:.018),skin,0,1.768,.272,1,.9,.9,0);
  var mouth=hp(new THREE.TorusGeometry(.04,.009,6,14,Math.PI),lipM,0,1.735,.257,1,1,1,0); mouth.rotation.z=Math.PI; var lipX=null; mouth.scale.set(Wm?.95:1.12,Wm?.9:1.1,1); if(Wm){ lipX=hp(SPH(.03),lipM,0,1.727,.262,1.9,.5,.45,0); }
  FACE.mouth=mouth; FACE.lipX=lipX; FACE.mb={x:mouth.scale.x,y:mouth.scale.y,z:mouth.scale.z,py:mouth.position.y};
  FACE.mO=hp(SPH(.03),dark,0,1.715,.263,1.5,.9,.4,0); FACE.mO.visible=false; FACE.mP=hp(SPH(.022),lipM,0,1.73,.266,1.1,.95,.7,0); FACE.mP.visible=false;
  var cap=hp(new THREE.SphereGeometry(.292,48,32,0,Math.PI*2,0,Math.PI*.5),hair,0,1.81,-.012,1,1,1.02,1.025); cap.rotation.x=-.35;
  /* soft overlapping fringe, swept to one side */
  for(var bi=-4;bi<=4;bi++){ var bx=bi*.058, bf=hp(new THREE.SphereGeometry(.066,28,18),hair,bx,1.935-Math.abs(bx)*.1+(bi>0?.004:0),.238-Math.abs(bx)*.52,1.25,.95,.9,1.03); bf.rotation.z=-bx*1.5-.12; }
  if(o.curly){ var cr=.3;
    [[.3,6],[.75,10],[1.15,12]].forEach(function(ph){ for(var k=0;k<ph[1];k++){ var th=k/ph[1]*Math.PI*2, cx=Math.sin(ph[0])*Math.sin(th)*cr, cz=Math.sin(ph[0])*Math.cos(th)*cr, cy=1.83+Math.cos(ph[0])*cr*.95;
      if(ph[0]>.9&&cz>.12) continue; hp(SPH(.07),hair,cx,cy-.01,cz-.01,1,1,1,1.045); } });
    
  }
  var hairBack=null;
  if(o.long){
    /* flowing back hair: smooth tapered curtain that sways when she moves */
    hairBack=new THREE.Group(); hairBack.position.set(0,1.82-HY,-.015); hd.add(hairBack);
    var pr=[[0,.3],[.12,.288],[.21,.255],[.27,.2],[.298,.1],[.306,0],[.302,-.15],[.285,-.32],[.258,-.5],[.215,-.65],[.15,-.77],[.085,-.83],[.03,-.85],[0,-.852]].map(function(p){ return new THREE.Vector2(p[0],p[1]); });
    var lathe=new THREE.Mesh(new THREE.LatheGeometry(pr,48,Math.PI*.42,Math.PI*1.16),hair); lathe.scale.z=.88; hairBack.add(lathe);
    [-1,1].forEach(function(sx){
      var lk=new THREE.Mesh(SPH(.1),hair); lk.position.set(sx*.252,-.1,.05); lk.scale.set(.68,3.1,.85); lk.rotation.z=sx*.07; hairBack.add(lk);
      var lo=new THREE.Mesh(SPH(.1),OUTLINE); lo.scale.set(1.04,1.02,1.04); lk.add(lo);
    });
    /* the flower above replaces the old pink hair bow */
  } else {
    /* short hair: side burns and a little quiff */
    [-1,1].forEach(function(sx){ hp(SPH(.07),hair,sx*.262,1.8,.03,.6,1.6,.95,1.04); });
    if(!o.curly) hp(SPH(.1),hair,.035,2.075,.07,1.25,.7,1.2,1.03);
  }
  /* ring box held out in the right hand: velvet base, hinged lid that opens, ring + gem + sparkle inside */
  var ring=new THREE.Group(); ring.position.set(0,-.43,.09); ring.visible=false;
  var velvet=new THREE.MeshStandardMaterial({color:0x5a1424,roughness:.85}), brass=new THREE.MeshStandardMaterial({color:0xd9b25e,metalness:.75,roughness:.3,emissive:0x3a2a0c,emissiveIntensity:.5}), cream=new THREE.MeshStandardMaterial({color:0xf3e8d8,roughness:1,emissive:0xf3e8d8,emissiveIntensity:.15});
  var bBase=new THREE.Mesh(new THREE.BoxGeometry(.19,.15,.07),velvet); ring.add(bBase);
  var bTrim=new THREE.Mesh(new THREE.BoxGeometry(.196,.156,.012),brass); bTrim.position.z=.022; ring.add(bTrim);
  var bCush=new THREE.Mesh(new THREE.BoxGeometry(.165,.125,.03),cream); bCush.position.z=.036; ring.add(bCush);
  var rBand=new THREE.Mesh(new THREE.TorusGeometry(.036,.0085,10,24),new THREE.MeshStandardMaterial({color:0xf0cf75,metalness:.9,roughness:.18,emissive:0x6a4a10,emissiveIntensity:.6})); rBand.rotation.x=Math.PI/2; rBand.position.set(0,0,.074); ring.add(rBand);
  var rGem=new THREE.Mesh(new THREE.OctahedronGeometry(.026),new THREE.MeshBasicMaterial({color:0xe4f6ff})); rGem.position.set(0,0,.118); ring.add(rGem);
  var rSpark=new THREE.Sprite(new THREE.SpriteMaterial({map:radialTex('rgba(255,255,255,.95)','rgba(255,255,255,0)'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); rSpark.scale.set(.32,.32,1); rSpark.position.set(0,0,.125); ring.add(rSpark);
  var lidG=new THREE.Group(); lidG.position.set(0,.075,.035); ring.add(lidG);
  var lidM=new THREE.Mesh(new THREE.BoxGeometry(.19,.15,.032),velvet); lidM.position.set(0,-.075,.016); lidG.add(lidM);
  var lidT=new THREE.Mesh(new THREE.BoxGeometry(.196,.156,.01),brass); lidT.position.set(0,-.075,.003); lidG.add(lidT);
  ring.scale.setScalar(1.15);
  aR.el.add(ring);
  var shd=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),new THREE.MeshBasicMaterial({map:radialTex('rgba(0,0,0,.5)','rgba(0,0,0,0)'),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false})); shd.rotation.x=-Math.PI/2; shd.position.y=.035/(o.sc||.82); shd.renderOrder=2; g.add(shd);
  g.userData={legL:lL.th,kneeL:lL.sh,legR:lR.th,kneeR:lR.sh,armL:aL.sh,elL:aL.el,armR:aR.sh,elR:aR.el,handL:aL.hand,handR:aR.hand,forearms:[aL.forearm,aR.forearm],face:FACE,fd:0,ring:ring,lid:lidG,spark:rSpark,mats:{skin:skin,top:top,topD:topD,bottom:bottom,legs:legM,hair:hair,shoe:shoe,iris:irisM,tie:tieM,belt:beltM,trim:trim,vest:vestM},outfitMeshes:{suit:suitG,vest:vestG},beltMesh:beltMesh,pantsHip:pantsHip,hip:hip,up:up,hd:hd,hairFlower:hairFlower,hairFlowerTarget:new THREE.Vector3(hairFlower.position.x,hairFlower.position.y,hairFlower.position.z),carriedFlower:carriedFlower,dy:hy-(Wm?.77:.74),seatY:.5-(hy-(Wm?.175:.15))*(o.sc||.82),phase:0,amp:0,t:Math.random()*10,lastStep:0,hair:hairBack,hr:0,sc:o.sc||.82,him:!!o.him,skirt:skirtM};
  var kS=o.slim||1; g.scale.set((o.sc||.82)*kS,(o.sc||.82),(o.sc||.82)*kS); hd.scale.set((Wm?1.02:1.07)/kS,(Wm?1.02:1.07),(Wm?1.02:1.07)/kS); scene.add(g); AV.push(g); return g;
}
var STY_HER_OLD={skin:0xf3c9a9,hair:0x6a3f2a,top:0x2f6b57,vest:0xc9748a,trim:0xe8a3b3,bottom:0xc9748a,legs:0x5b4a52,shoe:0x7a3f28,skirt:true,turtle:true,long:true,curly:true,sc:.79,him:false};
var STY_HER={skin:0xf3c9a9,hair:0x4a2616,top:0x1f6a55,trim:0xd9b25e,bottom:0x1f6a55,legs:0xe8c3a6,shoe:0x3a2018,belt:0xd9b25e,skirt:true,long:true,sc:.88,him:false,woman:true},
    STY_HIM={skin:0xf0c0a0,hair:0x2a1a12,top:0x1c2a4a,suit:true,trim:0xffffff,bottom:0x16171d,legs:0x16171d,shoe:0x1a1210,curly:false,sc:.96,him:true,slim:.8};
/* he is a little taller than her. When he lifts her, she is raised exactly enough for her face to reach his face level. */
var HUG_SEP=.38, HEAD_Y=1.74, LIFT=(STY_HIM.sc-STY_HER.sc)*HEAD_Y+.06;
/* arm angles for the right arm, solved so hands land on the partner's back/shoulders (left arm is mirrored). [raise, inward, elbow] */
var HP_HIM={s:[-.412,-.285,-1.152],c:[-.823,-.182,-.1],lean:[.05,-.04]}, HP_HER={s:[-.907,-.284,-1.264],c:[-.841,-.262,-.856],lean:[.06,-.08]};
var player=makeAvatar(STY_HER);
var npc=makeAvatar(STY_HIM);
player.position.set(0,0,3); npc.position.set(0,0,-37.4); npc.rotation.y=0; player.rotation.y=Math.PI;

function onFootstep(){
  var p=player.position, carpet=(Math.abs(p.x)<2.6&&p.x>-W/2)||p.x<-W/2;
  playFoot(carpet);
}
function pose(av,moving,dt){
  var u=av.userData; u.t+=dt;
  if(u.handL){ u.handL.rotation.y=0; u.handR.rotation.y=0; } if(u.fd){ setFace(u,{}); u.fd=0; }
  if(u.nb==null) u.nb=1+Math.random()*3; if(u.t>u.nb){ if(u.t<u.nb+.13) setFace(u,{eye:0,lid:'line'},1); else u.nb=u.t+2.2+Math.random()*3.2; }
  u.phase+=dt*9*u.amp*(u.rate||1);
  u.amp+=((moving?1:0)-u.amp)*Math.min(1,dt*7);
  var a=u.phase,A=u.amp,s=Math.sin(a),c=Math.cos(a),idle=Math.sin(u.t*1.8)*(1-A);
  u.legL.rotation.x=s*.75*A; u.legR.rotation.x=-s*.75*A;
  u.kneeL.rotation.x=Math.max(0,c)*.95*A; u.kneeR.rotation.x=Math.max(0,-c)*.95*A;
  u.armL.rotation.x=-s*.6*A+idle*.02; u.armR.rotation.x=s*.6*A-idle*.02;
  u.armL.rotation.z=-.07; u.armR.rotation.z=.07;
  u.elL.rotation.x=-(.14+.3*Math.max(0,-s)*A)*(.4+A*.6)-.05; u.elR.rotation.x=-(.14+.3*Math.max(0,s)*A)*(.4+A*.6)-.05;
  u.hip.rotation.set(.07*A+idle*.01,s*.09*A,0); u.hd.rotation.set(0,-s*.08*A+idle*.04,0); u.up.scale.y=1+idle*.008;
  if(u.hair){ var ht=A*(.14+.1*Math.sin(a*2-.5))+idle*.02; u.hr+=(ht-u.hr)*Math.min(1,dt*7); u.hair.rotation.x=.03+u.hr; u.hair.rotation.z=Math.sin(a-.4)*.07*A+Math.sin(u.t*1.3)*.012*(1-A); }
  av.position.y=Math.abs(s)*.028*A; u.ring.visible=false;
  var si=Math.floor(u.phase/Math.PI);
  if(moving&&si!==u.lastStep){ u.lastStep=si; if(av===player) onFootstep(); else playFoot(false); }
}
function setKneel(av,k){
  var e=ease(k); if(e<=0) return; var u=av.userData;
  av.position.y=mix(av.position.y,-.25*u.sc,e);
  u.legL.rotation.x=mix(u.legL.rotation.x,-1.5,e); u.kneeL.rotation.x=mix(u.kneeL.rotation.x,1.5,e);
  u.legR.rotation.x=mix(u.legR.rotation.x,.08,e); u.kneeR.rotation.x=mix(u.kneeR.rotation.x,1.5,e);
  u.hip.rotation.x=mix(u.hip.rotation.x,.1,e); u.hip.rotation.y=mix(u.hip.rotation.y,0,e);
  u.hd.rotation.x=mix(u.hd.rotation.x,-.38,e); u.hd.rotation.y=mix(u.hd.rotation.y,0,e);
  u.armR.rotation.x=mix(u.armR.rotation.x,-1.35,e); u.armR.rotation.z=mix(u.armR.rotation.z,-.22,e); u.elR.rotation.x=mix(u.elR.rotation.x,-.25,e);
  var op=ease(clampN((e-.7)/.3,0,1));
  u.armL.rotation.x=mix(u.armL.rotation.x,-1.15-.4*op,e); u.armL.rotation.z=mix(u.armL.rotation.z,.62,e); u.elL.rotation.x=mix(u.elL.rotation.x,-.5-.3*op,e);
  u.ring.visible=e>.6; if(u.lid){ u.lid.rotation.x=-1.95*op; u.spark.material.opacity=op*(.65+.35*Math.sin(u.t*7)); }
}
function setShock(av,k){
  var e=ease(k); if(e<=0) return; var u=av.userData;
  u.armL.rotation.x=mix(u.armL.rotation.x,-2.0,e); u.armR.rotation.x=mix(u.armR.rotation.x,-2.0,e);
  u.armL.rotation.z=mix(u.armL.rotation.z,.5,e); u.armR.rotation.z=mix(u.armR.rotation.z,-.5,e);
  u.elL.rotation.x=mix(u.elL.rotation.x,-2.1,e); u.elR.rotation.x=mix(u.elR.rotation.x,-2.1,e); u.hd.rotation.x=mix(u.hd.rotation.x,.08,e);
}
function setHug(av,k,c){
  var K=clampN(k,0,1); if(K<=0) return; var u=av.userData, P=u.him?HP_HIM:HP_HER;
  var rs=ease(clampN(K/.45,0,1)), cl=ease(clampN((K-.35)/.6,0,1)), hc=ease(clampN((K-.6)/.4,0,1)), cc=ease(c||0);
  /* arms: lift and open wide first, then close around the partner (back/waist while standing, shoulders/lower back while carried) */
  var ax=mix(-1.2,mix(P.s[0],P.c[0],cc),cl), az=mix(.8,mix(P.s[1],P.c[1],cc),cl), ae=mix(-.3,mix(P.s[2],P.c[2],cc),cl), asc=mix(.8,1,cl);
  u.armR.rotation.x=mix(u.armR.rotation.x,ax,rs); u.armL.rotation.x=mix(u.armL.rotation.x,ax,rs);
  u.armR.rotation.z=mix(u.armR.rotation.z,az,rs); u.armL.rotation.z=mix(u.armL.rotation.z,-az,rs);
  u.elR.rotation.x=mix(u.elR.rotation.x,ae,rs); u.elL.rotation.x=mix(u.elL.rotation.x,ae,rs);
  u.armR.scale.setScalar(asc); u.armL.scale.setScalar(asc);
  /* torso: leans in, and leans back a little under the lift */
  u.hip.rotation.x=mix(u.hip.rotation.x,mix(P.lean[0],P.lean[1],cc),cl); u.hip.rotation.y=mix(u.hip.rotation.y,0,cl);
  /* heads slide to the side, turn toward each other and tilt cheek to cheek (the big heads never collide) */
  u.hd.position.set(.16/u.sc*hc,1.6,.03*hc);
  u.hd.rotation.set(mix(u.hd.rotation.x,(u.him?.12:-.16)*(1-cc),hc),mix(u.hd.rotation.y,-.5,hc),.14*hc+Math.sin(u.t*1.3)*.015*hc);
  /* her skirt presses in against him instead of cutting through his body */
  if(u.skirt){ u.skirt.scale.set(mix(1,.85,cl),1,mix(1,.45,cl)); u.skirt.position.z=-.03*cl; }
  u.ring.visible=false;
}
function lerpAngle(a,b,tt){ var d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*tt; }

/* ---------- Name tags and chat bubbles ---------- */
var tags={};
function makeTag(key,name){ var el=document.createElement('div'); el.className='tag'; var s=document.createElement('span'); s.textContent=name; el.appendChild(s); bubblesEl.appendChild(el); tags[key]={el:el,label:s,av:key==='me'?player:npc,bubble:null}; }
makeTag('me',C('to')); makeTag('npc',C('from'));
var bubbleTimers={};
function say(key,text,ms){
  var tg=tags[key]; if(!tg) return; if(tg.bubble){ tg.bubble.remove(); tg.bubble=null; }
  var b=document.createElement('div'); b.className='bubble'; var s=document.createElement('span'); s.textContent=text; b.appendChild(s); bubblesEl.appendChild(b); tg.bubble=b;
  clearTimeout(bubbleTimers[key]);
  bubbleTimers[key]=setTimeout(function(){ b.classList.add('gone'); setTimeout(function(){ b.remove(); if(tg.bubble===b) tg.bubble=null; },400); },ms||3200);
}
var tmpV=new THREE.Vector3();
function placeOverlays(){
  var w=stage.clientWidth,h=stage.clientHeight;
  updateCinemaUploadControl();
  var cinemaPill=$('cinemaUploadPill');
  if(!cinemaPill.hidden){
    tmpV.set(20.38,.22,-16.5).project(camera);
    if(tmpV.z>1||tmpV.z<-1||Math.abs(tmpV.x)>1.2||Math.abs(tmpV.y)>1.2) cinemaPill.style.visibility='hidden';
    else { cinemaPill.style.visibility='visible'; cinemaPill.style.transform='translate('+((tmpV.x*.5+.5)*w).toFixed(1)+'px,'+((-tmpV.y*.5+.5)*h).toFixed(1)+'px) translate(-50%,-50%)'; }
  }
  Object.keys(tags).forEach(function(k){
    var tg=tags[k]; if(letterOn){ tg.el.style.visibility='hidden'; if(tg.bubble) tg.bubble.style.visibility='hidden'; return; }
    function put(el,yOff,isB){
      var dd=camera.position.distanceTo(tg.av.position), bs=isB?Math.max(.55,Math.min(1,5.5/Math.max(dd,.1))):1;
      tmpV.set(tg.av.position.x,tg.av.position.y+yOff,tg.av.position.z).project(camera);
      if(tmpV.z>1||tmpV.z<-1||Math.abs(tmpV.x)>1.2){ el.style.visibility='hidden'; return; }
      el.style.visibility='visible'; el.style.transform='translate('+((tmpV.x*.5+.5)*w).toFixed(1)+'px,'+((-tmpV.y*.5+.5)*h).toFixed(1)+'px) translate(-50%,-100%)'+(isB?' scale('+bs.toFixed(2)+')':'');
    }
    var hs=tg.av.userData.sc/.82; put(tg.el,2.05*hs); if(tg.bubble) put(tg.bubble,2.3*hs,true);
  });
}

