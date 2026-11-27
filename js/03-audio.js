/* Audio engine, recorded sounds */
'use strict';

/* ---------- Audio engine: ambient piano music, footsteps, reverb ---------- */
var AC=null, master=null, musicBus=null, sfxBus=null, verb=null, recDest=null, muted=false, sfxMuted=false, musicLevel=0, duck=1, musicTimer=null, nextT=0, mstep=0, noiseBuf=null;
function mtof(m){ return 440*Math.pow(2,(m-69)/12); }
function makeImpulse(sec,decay){ var r=AC.sampleRate, n=Math.floor(r*sec), b=AC.createBuffer(2,n,r); for(var c=0;c<2;c++){ var d=b.getChannelData(c); for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay); } return b; }
var onlineSfx=null, onlineSfxLoading=false, onlineSfxRetry=0;
function loadOnlineSfx(){
  if(onlineSfx||onlineSfxLoading||Date.now()<onlineSfxRetry) return; onlineSfxLoading=true;
  import('https://esm.sh/plinkfx@0.3.0').then(function(m){ onlineSfx=m; if(m.muted) m.muted(sfxMuted); if(m.unlockAudio) m.unlockAudio(); }).catch(function(){ onlineSfxLoading=false; onlineSfxRetry=Date.now()+30000; });
}
function unlockOnlineSfx(){ if(onlineSfx&&onlineSfx.unlockAudio){ try{ onlineSfx.unlockAudio(); }catch(e){} } }
function playOnlineSfx(name,volume,opts){
  if(sfxMuted) return false; loadOnlineSfx(); if(!onlineSfx||!onlineSfx.play) return false;
  try{ unlockOnlineSfx(); onlineSfx.play(name,Object.assign({volume:volume==null?.28:volume},opts||{})); return true; }catch(e){ return false; }
}
loadOnlineSfx();
function initAudio(){
  unlockOnlineSfx(); if(AC) return;
  var Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return;
  try{ AC=new Ctx(); }catch(e){ AC=null; return; }
  master=AC.createGain(); master.gain.value=.9; master.connect(AC.destination);
  try{ recDest=AC.createMediaStreamDestination(); master.connect(recDest); }catch(e){ recDest=null; }
  verb=AC.createConvolver(); verb.buffer=makeImpulse(2.8,2.4);
  var vg=AC.createGain(); vg.gain.value=.55; verb.connect(vg); vg.connect(master);
  musicBus=AC.createGain(); musicBus.gain.value=.5; musicBus.connect(master);
  var ms=AC.createGain(); ms.gain.value=.5; musicBus.connect(ms); ms.connect(verb);
  sfxBus=AC.createGain(); sfxBus.gain.value=.9; sfxBus.connect(master);
  var ss=AC.createGain(); ss.gain.value=.45; sfxBus.connect(ss); ss.connect(verb);
}
var CHORDS=[[48,60,64,67,71],[45,57,60,64,67],[41,57,60,64,69],[43,59,62,67,71]], ARP=[1,2,3,4,3,2,4,3];
function tone(f,tm,dur,vol,type,lp,att){
  var o=AC.createOscillator(), g=AC.createGain(), fl=AC.createBiquadFilter();
  o.type=type; o.frequency.value=f; fl.type='lowpass'; fl.frequency.value=lp;
  g.gain.setValueAtTime(0,tm); g.gain.linearRampToValueAtTime(vol,tm+(att||.012)); g.gain.exponentialRampToValueAtTime(.0001,tm+dur);
  o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(tm); o.stop(tm+dur+.05);
}
var MOODS={
  romantic:{en:'Romantic (default)',ar:'\u0631\u0648\u0645\u0627\u0646\u0633\u064a (\u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a)',step:.46,chords:CHORDS,arp:ARP,type:'triangle',lp:2600},
  piano:{en:'Soft piano',ar:'\u0628\u064a\u0627\u0646\u0648 \u0647\u0627\u062f\u0626',step:.52,chords:[[48,60,64,67,71],[53,60,65,69,72],[55,62,67,71,74],[45,57,60,64,69]],arp:[1,3,2,4,3,2,4,3],type:'sine',lp:3200},
  dreamy:{en:'Dreamy',ar:'\u062d\u0627\u0644\u0645',step:.62,chords:[[45,57,60,64,67],[41,57,60,65,69],[48,60,64,67,71],[43,59,62,67,69]],arp:[1,2,4,2,3,4,2,3],type:'sine',lp:2200},
  lofi:{en:'Lo-fi chill',ar:'\u0644\u0648-\u0641\u0627\u064a \u0647\u0627\u062f\u0626',step:.4,chords:[[50,62,65,69,72],[55,62,65,70,74],[48,60,64,67,71],[45,57,60,64,67]],arp:[1,3,2,3,4,3,2,3],type:'triangle',lp:1400}
}, curMood='romantic', customURL=null, customName='', bgmEl=null, bgmNode=null;
function MOOD(){ return MOODS[curMood]||MOODS.romantic; }
function playStep(s,tm){
  var MD=MOOD(), ch=MD.chords[Math.floor(s/8)%4], k=s%8, lvl=musicLevel;
  if(k===0){
    tone(mtof(ch[0]),tm,3.6,.22,'sine',500,.02);
    if(lvl>.5) [1,2,3].forEach(function(i){ [-7,7].forEach(function(dt){
      var o=AC.createOscillator(), g=AC.createGain(), fl=AC.createBiquadFilter();
      o.type='sawtooth'; o.frequency.value=mtof(ch[i]); o.detune.value=dt; fl.type='lowpass'; fl.frequency.value=900;
      g.gain.setValueAtTime(0,tm); g.gain.linearRampToValueAtTime(.05,tm+1.4); g.gain.linearRampToValueAtTime(0,tm+3.9);
      o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(tm); o.stop(tm+4);
    }); });
  }
  var n=ch[MD.arp[k]];
  tone(mtof(n),tm,2.2,lvl>.5?.16:.11,MD.type,MD.lp);
  tone(mtof(n)*2,tm,1.2,.03,'sine',4000);
  if(lvl>.5&&(k===0||k===4||k===6)) tone(mtof(ch[k===4?3:4]+12),tm+.02,2.6,.09,'sine',3500);
  if(gardenOn&&k%2===0) tone(mtof(ch[[4,3,2,3][k/2]]+12),tm+.03,2.4,.07,'sine',3000);
}
function sched(){
  if(!AC) return;
  if(nextT<AC.currentTime) nextT=AC.currentTime+.05;
  while(nextT<AC.currentTime+.7){ playStep(mstep,nextT); nextT+=MOOD().step; mstep++; }
}
function playCustom(){ if(!AC||!customURL) return;
  try{ if(!bgmEl){ bgmEl=new Audio(); bgmEl.loop=true; bgmEl.preload='auto'; bgmEl.volume=.85; }
    if(bgmEl.getAttribute('data-u')!==customURL){ bgmEl.src=customURL; bgmEl.setAttribute('data-u',customURL); }
    if(!bgmNode){ bgmNode=AC.createMediaElementSource(bgmEl); bgmNode.connect(musicBus); }
    if(AC.state==='suspended') AC.resume(); var pr=bgmEl.play(); if(pr&&pr.catch) pr.catch(function(){}); }catch(e){}
}
function startMusic(){ if(curMood==='custom'&&customURL){ playCustom(); return; } if(!AC||musicTimer) return; if(AC.state==='suspended') AC.resume(); nextT=AC.currentTime+.1; musicTimer=setInterval(sched,200); }
function setDuck(v){ duck=v; if(AC) musicBus.gain.setTargetAtTime(.5*v*(muted?0:1),AC.currentTime,.3); }
/* ---------- Real recorded sounds (files in /sounds, see sounds/CREDITS.txt) ---------- */
var RS_BASE='sounds/', RS_CACHE={};
var RS={
  step_floor:['step-floor-1.mp3','step-floor-2.mp3','step-floor-3.mp3','step-floor-4.mp3'],
  step_soft:['step-soft-1.mp3','step-soft-2.mp3','step-soft-3.mp3','step-soft-4.mp3'],
  land:'land.mp3', sit:'sit.mp3', whoosh:'whoosh.mp3', bird:'bird.mp3', ding:'ding.mp3', splash:'splash.mp3',
  kiss:'kiss.mp3', wave_swoosh:'wave-swoosh.mp3', slide_whistle:'slide-whistle.mp3', yay:'yay.mp3', tada:'tada.mp3', bell:'bell.mp3', pop:'pop.mp3',
  clap:'https://assets.mixkit.co/active_storage/sfx/481/481-preview.mp3'
};
function playReal(key,vol,fallback){
  if(sfxMuted) return true;
  var l=RS[key]; if(!l) return false;
  var u=Array.isArray(l)?l[Math.floor(Math.random()*l.length)]:l; var src=/^https?:/.test(u)?u:RS_BASE+u+'?v=3';
  try{
    var base=RS_CACHE[src]; if(!base){ base=RS_CACHE[src]=new Audio(src); base.preload='auto'; }
    var a=base.cloneNode(); a.volume=Math.max(0,Math.min(1,vol==null?.5:vol));
    a.addEventListener('error',function(){ if(fallback) fallback(); });
    var pr=a.play(); if(pr&&pr.catch) pr.catch(function(){});
    return true;
  }catch(e){ return false; }
}
function playFoot(carpet){
  if(sfxMuted) return;
  if(playReal(carpet?'step_soft':'step_floor',carpet?.16:.1,function(){ playFootSynth(carpet); })) return;
  playFootSynth(carpet);
}
function playFootSynth(carpet){
  if(!AC) return;
  if(!noiseBuf){ var n=Math.floor(AC.sampleRate*.12); noiseBuf=AC.createBuffer(1,n,AC.sampleRate); var d=noiseBuf.getChannelData(0); for(var i=0;i<n;i++) d[i]=Math.random()*2-1; }
  var tm=AC.currentTime, s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  s.buffer=noiseBuf; f.type=carpet?'lowpass':'bandpass'; f.frequency.value=carpet?350:(900+Math.random()*500); f.Q.value=carpet?.5:1.2;
  var v=carpet?.025:.05;
  g.gain.setValueAtTime(0,tm); g.gain.linearRampToValueAtTime(v,tm+.004); g.gain.exponentialRampToValueAtTime(.001,tm+(carpet?.09:.11));
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(tm); s.stop(tm+.13);
  var o=AC.createOscillator(), og=AC.createGain();
  o.frequency.setValueAtTime(110,tm); o.frequency.exponentialRampToValueAtTime(55,tm+.08);
  og.gain.setValueAtTime(carpet?.01:.022,tm); og.gain.exponentialRampToValueAtTime(.001,tm+.09);
  o.connect(og); og.connect(sfxBus); o.start(tm); o.stop(tm+.1);
}
function chime(notes,gap,vol){
  if(!AC||sfxMuted) return; var tm=AC.currentTime;
  notes.forEach(function(m,i){ var o=AC.createOscillator(), g=AC.createGain(), s=tm+i*gap; o.type='sine'; o.frequency.value=mtof(m);
    g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(vol||.2,s+.01); g.gain.exponentialRampToValueAtTime(.001,s+1.4);
    o.connect(g); g.connect(sfxBus); o.start(s); o.stop(s+1.5); });
}
var voiceEl=new Audio(), songEl=new Audio(); songEl.loop=true; songEl.volume=.85;
voiceEl.onended=function(){ setDuck(1); };
function playVoice(key){ var u=mediaURL(key); if(!u) return; songEl.pause(); voiceEl.src=u; voiceEl.muted=sfxMuted; voiceEl.play().catch(function(){}); setDuck(.25); }
function startSong(){ var u=mediaURL('song'); if(!u) return; if(songEl.getAttribute('data-k')!==u){ songEl.src=u; songEl.setAttribute('data-k',u); } songEl.muted=muted; songEl.play().catch(function(){}); setDuck(.2); }
function stopSong(){ songEl.pause(); if(voiceEl.paused) setDuck(1); }
function setMuted(m){ muted=m; if(AC) musicBus.gain.setTargetAtTime(.5*duck*(m?0:1),AC.currentTime,.08); songEl.muted=m; }
function setSfxMuted(m){ sfxMuted=m; if(sfxBus) sfxBus.gain.setTargetAtTime(m?0:.9,AC?AC.currentTime:0,.04); if(onlineSfx&&onlineSfx.muted) onlineSfx.muted(m); voiceEl.muted=m; if(typeof fwAudio!=='undefined') fwAudio.muted=m; }

