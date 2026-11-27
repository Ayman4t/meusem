/* Hand IK and faces */
'use strict';

/* ---------- hand IK: puts a chosen point of the hand exactly on a target (lips, the other hand, eyes, cheeks, belly) ---------- */
var IK_FT=new THREE.Vector3(0,-.14,.03), IK_PC=new THREE.Vector3(0,-.04,.05), ikM=new THREE.Matrix4(), ikV=new THREE.Vector3(), ikN=new THREE.Vector3();
function ikCost(u,side,v,loc,tg,nm,wn){
  var sh=side>0?u.armR:u.armL, el=side>0?u.elR:u.elL, hn=side>0?u.handR:u.handL;
  sh.rotation.set(v[0],0,v[1]); el.rotation.x=v[2]; hn.rotation.y=v[3];
  sh.updateMatrix(); el.updateMatrix(); hn.updateMatrix();
  ikM.copy(u.up.matrixWorld).multiply(sh.matrix).multiply(el.matrix).multiply(hn.matrix);
  ikV.copy(loc).applyMatrix4(ikM);
  var dx=ikV.x-tg.x, dy=ikV.y-tg.y, dz=ikV.z-tg.z, c=(dx*dx+dy*dy+dz*dz)*500+.012*v[3]*v[3];
  if(nm){ ikN.set(0,0,1).transformDirection(ikM); c+=(1-ikN.dot(nm))*wn; }
  return c;
}
function ikRun(u,side,v,loc,tg,nm,wn,st,n){
  var lo=[-3.1,side>0?-2.4:-2.7,-2.8,-2.8], hi=[.8,side>0?2.7:2.4,-.03,2.8], best=ikCost(u,side,v,loc,tg,nm,wn), i,j,k,t,c,imp;
  for(k=0;k<n;k++){ imp=false;
    for(i=0;i<4;i++) for(j=-1;j<=1;j+=2){ t=v[i]; v[i]=clampN(t+j*st[i],lo[i],hi[i]); c=ikCost(u,side,v,loc,tg,nm,wn); if(c<best-1e-10){ best=c; imp=true; break; } v[i]=t; }
    if(!imp){ for(i=0;i<4;i++) st[i]*=.5; }
  }
  return best;
}
function ikSolve(u,r,side,loc,tg,nm,wn,seed){
  var key='k'+side, v=r[key];
  if(!v){ var seeds=Array.isArray(seed[0])?seed:[seed], bb=1e9, bv=null;
    seeds.forEach(function(sd){ var vv=sd.slice(), b=ikRun(u,side,vv,loc,tg,nm,wn,[.5,.5,.5,.7],70); if(b<bb){ bb=b; bv=vv; } });
    v=r[key]=bv;
  } else ikRun(u,side,v,loc,tg,nm,wn,[.12,.12,.12,.2],16);
  return v;
}
function ikArm(av,r,side,loc,tg,nm,wn,seed,w){
  var u=av.userData, sh=side>0?u.armR:u.armL, el=side>0?u.elR:u.elL, hn=side>0?u.handR:u.handL;
  var cx=sh.rotation.x, cz=sh.rotation.z, ce=el.rotation.x;
  var v=ikSolve(u,r,side,loc,tg,nm,wn,seed);
  sh.rotation.set(mix(cx,v[0],w),0,mix(cz,v[1],w)); el.rotation.x=mix(ce,v[2],w); hn.rotation.y=v[3]*w;
  return v;
}
/* ---------- faces: eyes / brows / mouth / blush, driven by the reactions (pose() puts them back) ---------- */
function setFace(u,f,w){
  var F=u.face; if(!F) return; u.fd=1; w=w==null?1:w;
  var e=mix(1,f.eye==null?1:f.eye,w), br=mix(0,f.brow||0,w), bt=mix(0,f.tilt||0,w), bl=mix(0,f.blush||0,w), sh=f.mouth||'smile', op=f.open||0, closed=e<.3, M=F.mouth, B=F.mb, st=f.lid||'arc';
  F.eyes.forEach(function(o){ o.m.visible=!closed; if(!closed) o.m.scale.set(o.sx*(e>1?e:1),o.sy*(e>1?e:e),o.sz); });
  F.lids.forEach(function(o){ o.m.visible=closed&&o.k===st; });
  F.brows.forEach(function(o){ o.m.position.y=o.y+.03*br; o.m.rotation.z=-o.sx*(.12+bt); });
  F.blushM.opacity=Math.min(1,F.bBase+(1-F.bBase)*bl*.85);
  M.visible=!(sh==='O'||sh==='pucker'); M.scale.set(B.x*(sh==='grin'?1.35:sh==='small'?.75:1),B.y*(sh==='grin'?1.45:sh==='small'?.8:1),B.z);
  M.rotation.z=sh==='frown'?0:Math.PI; M.position.y=B.py+(sh==='frown'?-.05:0);
  if(F.lipX) F.lipX.visible=M.visible&&sh!=='frown';
  F.mO.visible=sh==='O'||op>.05; F.mO.position.y=(sh==='O'?1.705:sh==='frown'?1.69:1.715)-1.62;
  F.mO.scale.set(sh==='O'?.75:sh==='frown'?1.15:1.5,sh==='O'?.9+.5*op:.2+.9*op,.4);
  F.mP.visible=sh==='pucker';
}
var TEART=radialTex('rgba(170,220,255,.95)','rgba(170,220,255,0)');
function applyReact(av,r,dt,isMe){
  var u=av.userData; r.t+=dt;
  function stop(){ if(r.n==='flower'){ if(u.flowerArmBaseY!=null) u.armL.scale.y=u.flowerArmBaseY; if(u.carriedFlower&&!r.placed) u.carriedFlower.visible=true; } if(isMe) myR=null; else npcR=null; }
  if(r.n!=='flower'&&(isMe?u.amp>.35:(ROLE&&rem.m))){ stop(); return; }
  if(r.t>=r.d&&!(r.n==='hand'&&!ROLE)){ stop(); return; }
  var t=r.t, S=Math.sin, CO=Math.cos, PI=Math.PI, k=clampN(t/r.d,0,1), n=r.n;
  var w=n==='hand'&&!ROLE?ease(clampN(t/.3,0,1)):ease(clampN(Math.min(t/.3,(r.d-t)/.35),0,1));
  if(n==='jump') w=clampN(Math.min(t/.06,(r.d-t)/.08),0,1);
  function A(side,x,z,e,ww){ ww=ww==null?w:ww; var a=side==='R'?u.armR:u.armL, el=side==='R'?u.elR:u.elL; a.rotation.x=mix(a.rotation.x,x,ww); a.rotation.z=mix(a.rotation.z,z,ww); el.rotation.x=mix(el.rotation.x,e,ww); }
  function H(x,y,z){ u.hd.rotation.x=mix(u.hd.rotation.x,x,w); u.hd.rotation.y=mix(u.hd.rotation.y,y,w); u.hd.rotation.z=mix(u.hd.rotation.z,z,w); }
  function B(x,y,z){ u.hip.rotation.x=mix(u.hip.rotation.x,x,w); u.hip.rotation.y=mix(u.hip.rotation.y,y,w); u.hip.rotation.z=mix(u.hip.rotation.z,z,w); }
  function F(f){ setFace(u,f,w); }
  function prep(){ av.updateMatrixWorld(true); }
  function G(x,y,z){ return av.localToWorld(new THREE.Vector3(x,y+u.dy,z)); }
  function DG(x,y,z){ return new THREE.Vector3(x,y,z).transformDirection(av.matrixWorld); }
  function HW(x,y,z){ return u.hd.localToWorld(new THREE.Vector3(x,y,z)); }
  function DH(x,y,z){ return new THREE.Vector3(x,y,z).transformDirection(u.hd.matrixWorld); }
  function IK(side,loc,tg,nm,wn,seed,ww){ return ikArm(av,r,side,loc,tg,nm,wn,seed,ww==null?w:ww); }
  var px=av.position.x, pz=av.position.z, fx=S(av.rotation.y), fz=Math.cos(av.rotation.y);
  if(n==='wave'){ var wv=S(t*12); H(.02,.28,.1); B(0,-.1,.03); prep();
    IK(1,IK_PC,G(.41+.05*wv,1.74,.12),DG(.25,0,1),.25,[[-2.26,.45,-1.23,-2.5],[-1.4,1.2,-1.5,0]]);
    F({mouth:'grin',open:.15,brow:.2}); }
  else if(n==='heart'){ var hb=S(t*3.2); H(-.04,0,hb*.1); B(-.03,0,hb*.03); prep();
    IK(1,IK_FT,G(.015+.005*hb,1.6+.01*hb,.3),DG(-.3,0,.95),.4,[[-1.49,-.76,-1.23,2.4],[-1.5,-.3,-2.1,.6]]);
    IK(-1,IK_FT,G(-.015-.005*hb,1.6+.01*hb,.3),DG(.3,0,.95),.4,[[-1.49,.76,-1.23,-2.4],[-1.5,.3,-2.1,-.6]]);
    if(t>(r.nx||0)){ r.nx=t+.4; heartsAt(px,1.9,pz,2,.5); }
    F({mouth:'grin',open:.1,eye:0,lid:'arc',blush:.6}); }
  else if(n==='kiss'){
    /* 0-.45 fingers go to the lips, .5-1.05 hold the kiss, 1.0-1.4 hand opens and blows it out */
    var kl=ease(clampN(t/.45,0,1)), ko=ease(clampN((t-1)/.4,0,1)), hold=t>.5&&t<1.05;
    H(.07*(1-ko)+.02*ko,0,.15*(1-ko)); B(.07*kl*(1-ko)-.03*ko,0,-.03*kl*(1-ko)); prep();
    var lp=HW(.03,.115,.285), op=G(.38,1.42,.45), tgK=new THREE.Vector3(lp.x+(op.x-lp.x)*ko,lp.y+(op.y-lp.y)*ko,lp.z+(op.z-lp.z)*ko);
    var nA=DH(-.15,.1,-1), nB=DG(0,.6,.8), nK=new THREE.Vector3(nA.x+(nB.x-nA.x)*ko,nA.y+(nB.y-nA.y)*ko,nA.z+(nB.z-nA.z)*ko).normalize();
    IK(1,IK_FT,tgK,nK,.5,[[-1.53,-.84,-1.32,-1.07],[-1.6,-.5,-2.2,.5]]);
    if(ko>.45&&!r.k){ r.k=1; chime([88,91],.1,.1); for(var hi=0;hi<5;hi++) emit(heartTex,false,tgK.x+fx*(.12+hi*.22),tgK.y+.05*hi+Math.random()*.1,tgK.z+fz*(.12+hi*.22),.2+Math.random()*.12,1.5+hi*.1,.35+Math.random()*.2,(Math.random()-.5)*.1); }
    F(t<.45?{mouth:'smile',blush:.4}:hold?{mouth:'pucker',eye:0,lid:'arc',blush:.6}:{mouth:'grin',open:.1,eye:t<1.9?0:1,lid:'arc',blush:.5}); }
  else if(n==='clap'){
    var ct=Math.max(0,t-.25), ph=17*ct, cw=CO(ph), gap=.006+.12*(.5+.5*cw);
    H(.06+.03*cw,0,0); B(.03*cw,0,0); av.position.y+=.008*Math.abs(S(ph*.5))*w; prep();
    IK(1,IK_PC,G(gap,1.29+.015*cw,.36-.015*cw),DG(-1,0,0),1.2,[[-.86,-.6,-.97,-2],[-1.3,-.5,-1.5,0]]);
    IK(-1,IK_PC,G(-gap,1.29+.015*cw,.36-.015*cw),DG(1,0,0),1.2,[[-.86,.6,-.97,2],[-1.3,.5,-1.5,0]]);
    var cm=Math.floor((ph+PI)/(2*PI)); if(cm>=1&&cm!==r.cy){ r.cy=cm; playReal('clap',.5,clapSnd); }
    F({mouth:'grin',open:.25,blush:.25,brow:.2}); }
  else if(n==='cheer'){ var cb=Math.abs(S(t*8));
    A('R',-2.95,.35+S(t*8)*.12,-.15); A('L',-2.95,-.35-S(t*8)*.12,-.15); H(-.2,S(t*4)*.12,0); B(-.08,0,S(t*8)*.04);
    av.position.y+=cb*.12*w; u.kneeL.rotation.x=mix(u.kneeL.rotation.x,.7*cb,w); u.kneeR.rotation.x=mix(u.kneeR.rotation.x,.7*cb,w);
    if(!r.b){ r.b=1; burst(22); chime([76,80,84],.08,.1); }
    F({mouth:'grin',open:.7,eye:0,lid:'arc',brow:.5,blush:.3}); }
  else if(n==='laugh'){ var ls2=S(t*17); B(-.14+.06*ls2,0,S(t*8.5)*.03); H(-.32+.1*ls2,0,S(t*8.5)*.1); av.position.y+=Math.abs(ls2)*.025*w; prep();
    IK(1,IK_PC,G(.1,1.02,.26+.01*ls2),DG(0,0,-1),.35,[[-.48,-.39,-.6,2.6],[-.5,-.2,-1.2,.5]]);
    IK(-1,IK_PC,G(-.1,1.02,.26+.01*ls2),DG(0,0,-1),.35,[[-.48,.39,-.6,-2.6],[-.5,.2,-1.2,-.5]]);
    F({mouth:'grin',open:.55+.4*(.5+.5*ls2),eye:0,lid:'arc',brow:.4,blush:.5}); }
  else if(n==='cry'){ var cs=S(t*19); H(.42+.03*S(t*2),0,S(t*2)*.06); B(.18+.015*cs,0,S(t*2.2)*.03); prep();
    var rb=S(t*7)*.012, rc=CO(t*7)*.012;
    IK(1,IK_PC,HW(.1+rb,.15+rc,.25),DH(0,-.1,-1),.5,[[-2.1,-.46,-.78,-.45],[-1.7,.2,-2.4,.4]]);
    IK(-1,IK_PC,HW(-.1-rb,.15+rc,.25),DH(0,-.1,-1),.5,[[-2.1,.46,-.78,.45],[-1.7,-.2,-2.4,-.4]]);
    if(t>(r.tn||0)){ r.tn=t+.07; var te1=HW(.13,.06,.26), te2=HW(-.13,.06,.26); emit(TEART,false,te1.x,te1.y,te1.z,.07,.9,-.6,0); emit(TEART,false,te2.x,te2.y,te2.z,.07,.9,-.6,0); }
    F({mouth:'frown',open:.7+.2*cs,eye:0,lid:'line',brow:.3,tilt:.5,blush:.5}); }
  else if(n==='dance'){
    /* 4 moves, ~1.3s each: disco arms -> spin with open arms -> hip shake, hands up -> disco point finale */
    var DT=1.3, di=Math.min(3,Math.floor(t/DT)), dpz=function(i){
      var q=S(t*7.2), qa=.5+.5*q, qb=.5-.5*q;
      if(i===0) return {b:[.04*S(t*14.4),q*.4,q*.07],h:[.03*S(t*14.4),-q*.22,q*.1],R:[-1.15-1.15*qa,.45+.35*qa,-.7-.8*qb],L:[-1.15-1.15*qb,-.45-.35*qb,-.7-.8*qa],lL:-.5*qa,kL:.9*qa,lR:-.5*qb,kR:.9*qb,y:Math.abs(q)*.045};
      if(i===1){ var o=S(t*10); return {b:[.05,0,0],h:[-.1,0,0],R:[-.3+.1*o,1.45,-.25],L:[-.3-.1*o,-1.45,-.25],lL:-.15,kL:.35,lR:-.15,kR:.35,y:Math.abs(S(t*9))*.05}; }
      if(i===2){ var hs=S(t*11), sw=S(t*5.5), hp=.5+.5*hs; return {b:[0,hs*.5,hs*.12],h:[0,-hs*.25,hs*.1],R:[-2.75,.35+.2*sw,-.3],L:[-2.75,-.35+.2*sw,-.3],lL:-.3*hp,kL:.7*hp,lR:-.3*(1-hp),kR:.7*(1-hp),y:Math.abs(hs)*.03}; }
      var bt=S(t*8), bp=.5+.5*bt; return {b:[.04,.2*S(t*4),-.18+.05*bt],h:[0,0,.15],R:[-2.6,.7,-.2],L:[.15,-.5,-1.6],lL:-.25*bp,kL:.5*bp,lR:-.25*(1-bp),kR:.5*(1-bp),y:Math.abs(bt)*.05};
    }, dpa=dpz(di), dm=0;
    if(di<3&&t-di*DT>DT-.22){ dm=ease((t-di*DT-(DT-.22))/.22); var dpb=dpz(di+1), dl=function(a,b){ return a.map(function(v,i){ return v+(b[i]-v)*dm; }); };
      dpa={b:dl(dpa.b,dpb.b),h:dl(dpa.h,dpb.h),R:dl(dpa.R,dpb.R),L:dl(dpa.L,dpb.L),lL:dpa.lL+(dpb.lL-dpa.lL)*dm,kL:dpa.kL+(dpb.kL-dpa.kL)*dm,lR:dpa.lR+(dpb.lR-dpa.lR)*dm,kR:dpa.kR+(dpb.kR-dpa.kR)*dm,y:dpa.y+(dpb.y-dpa.y)*dm}; }
    if(r.by==null) r.by=av.rotation.y;
    if(r.pm==null||r.pm<di){ r.pm=di; if(di===1) chime([76,81,84],.09,.1); else if(di===2) chime([79,83,86],.09,.1); else if(di===3){ chime([84,88,91,96],.08,.12); burst(24); } }
    if(t>DT&&t<2*DT+.1) av.rotation.y=r.by+2*PI*ease(clampN((t-DT)/DT,0,1)); else if(t>=2*DT) av.rotation.y=r.by+2*PI;
    if(di===2&&t>(r.nx||0)){ r.nx=t+.35; heartsAt(px,1.9,pz,1,.45); }
    B(dpa.b[0],dpa.b[1],dpa.b[2]); H(dpa.h[0],dpa.h[1],dpa.h[2]);
    A('R',dpa.R[0],dpa.R[1],dpa.R[2]); A('L',dpa.L[0],dpa.L[1],dpa.L[2]);
    av.position.y+=dpa.y*w;
    u.legL.rotation.x=mix(u.legL.rotation.x,dpa.lL,w); u.kneeL.rotation.x=mix(u.kneeL.rotation.x,dpa.kL,w); u.legR.rotation.x=mix(u.legR.rotation.x,dpa.lR,w); u.kneeR.rotation.x=mix(u.kneeR.rotation.x,dpa.kR,w);
    F(di===0?{mouth:'grin',open:.3,brow:.3,blush:.25}:{mouth:'grin',open:.4,eye:0,lid:'arc',brow:.4,blush:.35}); }
  else if(n==='jump'){
    /* crouch .0-.17, spring and fly .17-.55, land and absorb .55-.75 */
    var jc=t<.17?ease(t/.17):(t<.55?Math.max(0,1-(t-.17)/.06):S(PI*clampN((t-.55)/.2,0,1))*.6), ja=clampN((t-.17)/.38,0,1), ju=(t>.17&&t<.55)?Math.pow(S(PI*ja),.6):0;
    av.position.y+=(t>.17&&t<.55?.55*S(PI*ja):0)-.08*jc*av.userData.sc;
    var arx=mix(.6*jc-.1,-2.7,ju), arz=.12+.25*ju; A('R',arx,arz,mix(-.5,-.3,ju)); A('L',arx,-arz,mix(-.5,-.3,ju));
    u.legL.rotation.x=mix(u.legL.rotation.x,-.7*jc-.4*ju,w); u.legR.rotation.x=mix(u.legR.rotation.x,-.7*jc-.4*ju,w);
    u.kneeL.rotation.x=mix(u.kneeL.rotation.x,1.3*jc+.9*ju,w); u.kneeR.rotation.x=mix(u.kneeR.rotation.x,1.3*jc+.9*ju,w);
    B(.12*jc,0,0); H(-.1*ju,0,0); F({mouth:'grin',open:.5*ju,brow:.4}); }
  else if(n==='shy'){ var sy2=S(t*2.2); H(.42,.2+.07*sy2,.14); B(.08,S(t*2)*.08,.03*sy2); prep();
    var pk=ease(clampN((S(t*3.1)-.6)/.4,0,1));
    IK(1,IK_PC,HW(.11,.15+.05*pk,.25),DH(0,-.1,-1),.5,[[-2.1,-.46,-.78,-.45],[-1.7,.2,-2.4,.4]]);
    IK(-1,IK_PC,HW(-.11,.15+.05*pk,.25),DH(0,-.1,-1),.5,[[-2.1,.46,-.78,.45],[-1.7,-.2,-2.4,-.4]]);
    F({mouth:'small',eye:pk>.5?.9:0,lid:'line',blush:1}); }
  else if(n==='flower'){
    var recipient=av===player?npc:player, dx=recipient.position.x-av.position.x, dz=recipient.position.z-av.position.z, dist=Math.hypot(dx,dz);
    if(!ROLE||av===player){
      if(dist>.65){ var step=Math.min(dist-.65,dt*2.5); av.position.x+=dx/dist*step; av.position.z+=dz/dist*step; }
      av.rotation.y=lerpAngle(av.rotation.y,Math.atan2(dx,dz),1-Math.exp(-dt*8));
    }
    H(.08,-.12,.08); B(.14,0,.015); prep(); recipient.updateMatrixWorld(true);
    var ru=recipient.userData; ru.hairFlower.position.x=.205; ru.hairFlowerTarget.x=.205;
    var fpos=ru.hairFlower.getWorldPosition(new THREE.Vector3()), fn=new THREE.Vector3(0,0,1).transformDirection(ru.hd.matrixWorld);
    var close=Math.hypot(recipient.position.x-av.position.x,recipient.position.z-av.position.z), reach=ease(clampN((1.15-close)/.65,0,1));
    var chest=G(.38,1.28,.2), raise=ease(clampN(t/.5,0,1))*reach, handTarget=chest.clone().lerp(fpos,raise);
    handTarget.lerp(chest,ease(clampN((t-1.55)/.45,0,1)));
    if(u.flowerArmBaseY==null) u.flowerArmBaseY=u.armL.scale.y;
    u.armL.scale.y=mix(u.flowerArmBaseY,u.flowerArmBaseY*1.5,reach*w);
    if(u.carriedFlower&&!r.placed) u.carriedFlower.visible=true;
    IK(-1,IK_PC,handTarget,fn,.35,[[-2.25,.22,-.9,.25],[-2.65,-.2,-.7,-.4],[-1.8,.65,-1.3,-.2]],w*reach);
    if(t>1.05&&close<=.72&&!r.placed){ r.placed=true; if(u.carriedFlower) u.carriedFlower.visible=false; if(ru.hairFlower) ru.hairFlower.visible=true; chime([79,84,88],.12,.1); }
    F({mouth:'smile',eye:.92,brow:.18,blush:.75}); }
  else if(n==='wow'){ var wp=ease(clampN(t/.25,0,1)); H(-.12*wp,0,0); B(-.1*wp,0,0); av.position.y+=S(Math.min(1,t/.25)*PI)*.1; prep();
    IK(1,IK_PC,HW(.18,.1,.18),DH(-1,0,-.15),.5,[[-1.8,-.41,-1.57,-1.75],[-1.6,.4,-2.3,.3]]);
    IK(-1,IK_PC,HW(-.18,.1,.18),DH(1,0,-.15),.5,[[-1.8,.41,-1.57,1.75],[-1.6,-.4,-2.3,-.3]]);
    F({mouth:'O',open:.6+.4*wp,eye:1.18,brow:1}); }
  else if(n==='hand'){
    /* reach out and take your partner's hand: turn to them, pick the nearest arm/hand pair, and follow their hand */
    var ot=(av===player)?npc:player, ou=ot.userData, ddx=ot.position.x-px, ddz=ot.position.z-pz, dist=Math.hypot(ddx,ddz);
    if(isMe){
      /* only the one who pressed walks over, slowly, and stops about an arm's length away (never on top of the partner) */
      var yieldH=!!(npcR&&npcR.n==='hand'&&ROLE==='guest');
      if(dist<7&&!yieldH){
        var ux=CO(ot.rotation.y), uz=-S(ot.rotation.y); if(r.sg==null) r.sg=(-ddx*ux-ddz*uz)>=0?1:-1;
        var gx=ot.position.x+ux*r.sg*.95, gz=ot.position.z+uz*r.sg*.95, mdx=gx-av.position.x, mdz=gz-av.position.z, md=Math.hypot(mdx,mdz);
        if(dist>1.15&&md>.02){ var stp=Math.min(md,1.2*Math.min(dt,.05)*w); av.position.x+=mdx/md*stp; av.position.z+=mdz/md*stp; }
        av.rotation.y+=Math.atan2(S(ot.rotation.y-av.rotation.y),CO(ot.rotation.y-av.rotation.y))*Math.min(1,dt*3)*w; }
      else if(dist>.3&&!yieldH){ var wa=Math.atan2(ddx,ddz); av.rotation.y+=Math.atan2(S(wa-av.rotation.y),CO(wa-av.rotation.y))*Math.min(1,dt*4)*w; } }
    /* arms only reach out once the two are close, so nothing stretches or snaps while one is still walking over */
    var rch=clampN((2.3-dist)/.8,0,1); w*=rch;
    H(.06,0,.12); B(.03,0,0); prep(); ot.updateMatrixWorld(true);
    function oh(sd){ return (sd>0?ou.handR:ou.handL).localToWorld(new THREE.Vector3(0,-.03,0)); }
    if(r.hs==null&&dist<2.2){ var bst=1e9; [1,-1].forEach(function(sd){ var ph=oh(sd); [1,-1].forEach(function(md2){ var dd=ph.distanceTo((md2>0?u.armR:u.armL).localToWorld(new THREE.Vector3())); if(dd<bst){ bst=dd; r.hs=md2; r.ho=sd; } }); }); }
    if(r.hs!=null&&w>.01) IK(r.hs,IK_PC,oh(r.ho),null,0,r.hs>0?[[-.9,-.25,-.3,0],[-1.3,-.5,-.8,0],[-.4,.4,-.2,0]]:[[-.9,.25,-.3,0],[-1.3,.5,-.8,0],[-.4,-.4,-.2,0]]);
    if(dist<2.4&&t>(r.nx||0)){ r.nx=t+.5; heartsAt((px+ot.position.x)/2,1.5,(pz+ot.position.z)/2,1,.3); }
    F({mouth:'smile',blush:.7,brow:.2}); }
  else if(n==='paint'){ var pnu=paintPen.u, pnv=paintPen.v, psw=S(t*16)*.07;
    A('R',-1.0-(1-pnv)*1.9+psw,-.45+pnu*1.3,-.55+S(t*11)*.1); A('L',-.45,.3,-1.15);
    H(-.1-(1-pnv)*.25,-(pnu-.5)*.7,0); B(0,-(pnu-.5)*.45,0); }
}

window.addEventListener('keydown',function(e){ var tn=e.target&&e.target.tagName; if(tn==='INPUT'||tn==='TEXTAREA'||editorOpen()) return; if(e.code==='KeyH') doHeart(); else if(e.code==='KeyG') doWave(); else if(e.code==='KeyB') sitToggle(); });
function fxPose(dt){ var u=player.userData;
  if(seat){ player.position.set(seat.x,u.seatY,seat.z); player.rotation.y=seat.r; u.legL.rotation.x=u.legR.rotation.x=-1.45; u.kneeL.rotation.x=u.kneeR.rotation.x=1.45; u.armL.rotation.x=u.armR.rotation.x=-.45; u.elL.rotation.x=u.elR.rotation.x=-.9; return; }
  if(waveT>0){ waveT-=dt; var a=Math.max(0,Math.min(1,waveT*4,(2.2-waveT)*6)); u.armR.rotation.x=mix(u.armR.rotation.x,-2.7,a); u.armR.rotation.z=mix(u.armR.rotation.z,.3+Math.sin(waveT*14)*.4,a); u.elR.rotation.x=mix(u.elR.rotation.x,-.35,a); } if(myR) applyReact(player,myR,dt,true); }

