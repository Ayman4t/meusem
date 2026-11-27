/* Music picker and reactions */
'use strict';

/* ---------- Music picker: built-in moods + upload your own file ---------- */
(function(){
  var row=document.getElementById('soundControls'); if(!row) return;
  var AR=function(){ return typeof LANG!=='undefined'&&LANG==='ar'; };
  var btn=document.createElement('button'); btn.className='tool icon'; btn.id='tTrack'; btn.type='button'; btn.textContent='\uD83C\uDFBC'; btn.title=btn.ariaLabel=(typeof LANG!=='undefined'&&LANG==='ar')?'اختيار الموسيقى':'Choose music'; btn.setAttribute('aria-expanded','false');
  row.appendChild(btn);
  var panel=document.createElement('div'); panel.id='musicPanel'; panel.hidden=true; document.body.appendChild(panel);
  var st=document.createElement('style'); st.textContent='#musicPanel{position:fixed;top:calc(env(safe-area-inset-top,0px) + 64px);inset-inline-end:12px;width:min(290px,calc(100vw - 24px));padding:12px;border-radius:18px;background:rgba(34,16,28,.95);border:1px solid rgba(255,170,190,.3);box-shadow:0 14px 36px rgba(0,0,0,.5);color:#f6dfe5;font-size:13px;z-index:400;pointer-events:auto;backdrop-filter:blur(10px)}#musicPanel[hidden]{display:none!important}#musicPanel h4{margin:0 0 8px;font-size:14px;font-weight:700}#musicPanel button.mo{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 6px;padding:9px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:inherit;font:inherit;text-align:start;cursor:pointer}#musicPanel button.mo.on{background:linear-gradient(135deg,#ff9fb5,#ffc2cf);color:#4a1424;border-color:transparent;font-weight:700}#musicPanel .mo-up{background:rgba(255,255,255,.1)!important;justify-content:center}#musicPanel small{display:block;opacity:.7;line-height:1.35;margin-top:4px}#musicPanel .mo-del{background:none;border:0;color:#ffb3bf;font:inherit;padding:2px 0;cursor:pointer;text-decoration:underline}';
  document.head.appendChild(st);
  var file=document.createElement('input'); file.type='file'; file.accept='audio/*,.mp3,.m4a,.wav,.ogg,.aac'; file.hidden=true; document.body.appendChild(file);

  function mdb(){ return new Promise(function(res,rej){ try{ var r=indexedDB.open('ourMuseumMusic',1); r.onupgradeneeded=function(){ r.result.createObjectStore('f'); }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(); }; }catch(e){ rej(); } }); }
  function mput(v){ return mdb().then(function(db){ return new Promise(function(res){ var tx=db.transaction('f','readwrite'); tx.objectStore('f').put(v,'bgm'); tx.oncomplete=res; tx.onerror=res; }); }).catch(function(){}); }
  function mget(){ return mdb().then(function(db){ return new Promise(function(res){ var q=db.transaction('f').objectStore('f').get('bgm'); q.onsuccess=function(){ res(q.result||null); }; q.onerror=function(){ res(null); }; }); }).catch(function(){ return null; }); }
  function mdel(){ return mdb().then(function(db){ return new Promise(function(res){ var tx=db.transaction('f','readwrite'); tx.objectStore('f').delete('bgm'); tx.oncomplete=res; tx.onerror=res; }); }).catch(function(){}); }

  function applyMood(key){
    curMood=key; try{ localStorage.setItem('ourMuseumMood',key); }catch(e){}
    if(typeof initAudio==='function') initAudio();
    if(key==='custom'){ if(musicTimer){ clearInterval(musicTimer); musicTimer=0; } if(!muted) playCustom(); }
    else { if(bgmEl) bgmEl.pause(); if(!muted&&typeof startMusic==='function') startMusic(); }
    render();
  }
  function render(){
    var ar=AR(), h='<h4>\uD83C\uDFB5 '+(ar?'\u0627\u062e\u062a\u0631 \u0645\u0648\u0633\u064a\u0642\u0627\u0643':'Choose your music')+'</h4>';
    Object.keys(MOODS).forEach(function(k){ h+='<button type="button" class="mo'+(curMood===k?' on':'')+'" data-m="'+k+'">'+(curMood===k?'\u2713 ':'\u266A ')+(ar?MOODS[k].ar:MOODS[k].en)+'</button>'; });
    if(customURL) h+='<button type="button" class="mo'+(curMood==='custom'?' on':'')+'" data-m="custom"><span>'+(curMood==='custom'?'\u2713 ':'\uD83D\uDCC1 ')+(ar?'\u0645\u0648\u0633\u064a\u0642\u0627\u064a':'My music')+'</span><bdi class="mo-n" dir="ltr" title="'+String(customName||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];})+'">'+String(customName||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];})+'</bdi></button>';
    h+='<button type="button" class="mo mo-up" id="moUp">\u2B06 '+(ar?'\u0627\u0631\u0641\u0639 \u0645\u0644\u0641 \u0645\u0648\u0633\u064a\u0642\u0649 \u062e\u0627\u0635':'Upload my own music file')+'</button>';
    if(customURL) h+='<button type="button" class="mo-del" id="moDel">'+(ar?'\u062d\u0630\u0641 \u0645\u0644\u0641\u064a':'Remove my file')+'</button>';
    h+='<small>'+(ar?'\u0627\u0644\u0645\u0644\u0641 \u064a\u0628\u0642\u0649 \u0639\u0644\u0649 \u062c\u0647\u0627\u0632\u0643 \u0641\u0642\u0637 (\u0644\u0627 \u064a\u064f\u0631\u0641\u0639 \u0644\u0623\u064a \u0645\u0643\u0627\u0646). \u0627\u062e\u062a\u0631 \u0623\u063a\u0646\u064a\u062a\u0643 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0645\u0646 \u062c\u0647\u0627\u0632\u0643.':'Your file stays on this device only and is never uploaded. Pick any favorite song you own.')+'</small>';
    panel.innerHTML=h; btn.title=btn.ariaLabel=ar?'\u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649':'Choose music';
  }
  panel.addEventListener('click',function(e){
    var t=e.target.closest('button'); if(!t) return;
    if(t.id==='moUp'){ file.click(); return; }
    if(t.id==='moDel'){ mdel(); if(customURL){ try{ URL.revokeObjectURL(customURL); }catch(x){} } if(bgmEl){ bgmEl.pause(); } customURL=null; customName=''; applyMood('romantic'); return; }
    if(t.getAttribute('data-m')) applyMood(t.getAttribute('data-m'));
  });
  file.addEventListener('change',function(){
    var f=file.files&&file.files[0]; file.value=''; if(!f) return;
    if(customURL){ try{ URL.revokeObjectURL(customURL); }catch(x){} }
    customURL=URL.createObjectURL(f); customName=f.name.replace(/\.[^.]+$/,'').slice(0,28);
    mput({blob:f,name:customName}); applyMood('custom');
  });
  function togglePanel(e){ if(e) e.stopPropagation(); panel.hidden=!panel.hidden; btn.setAttribute('aria-expanded',String(!panel.hidden)); if(!panel.hidden) render(); }
  btn.addEventListener('click',togglePanel);
  var am=document.getElementById('amTrack'); if(am) am.addEventListener('click',togglePanel);
  document.addEventListener('pointerdown',function(e){ if(!panel.hidden&&!panel.contains(e.target)&&!(e.target.closest&&e.target.closest('#tTrack,#amTrack'))){ panel.hidden=true; btn.setAttribute('aria-expanded','false'); } });
  // restore saved choice
  var saved=null; try{ saved=localStorage.getItem('ourMuseumMood'); }catch(e){}
  mget().then(function(v){
    if(v&&v.blob){ customURL=URL.createObjectURL(v.blob); customName=v.name||''; }
    if(saved==='custom'&&customURL) curMood='custom'; else if(saved&&MOODS[saved]) curMood=saved;
    render();
  });
  render();
})();

var REACTS=['wave','heart','kiss','clap','cheer','laugh','cry','dance','jump','shy','flower','wow','hand','sit'];
var RLAB={en:{wave:'Wave',heart:'Heart hands',kiss:'Blow a kiss',clap:'Clap',cheer:'Cheer',laugh:'Laugh',cry:'Cry',dance:'Dance',jump:'Jump',shy:'Shy',flower:'Put a flower in her hair',flowerWait:'Move closer together',wow:'Wow',hand:'Hold hands',sit:'Sit',main:'React'},ar:{wave:'لوّح',heart:'قلب بإيديكي',kiss:'ابعتي بوسة',clap:'صفّقي',cheer:'هلّلي',laugh:'اضحكي',cry:'عيّطي',dance:'ارقصي',jump:'نطّي',shy:'اتكسفي',flower:'حط وردة في شعرها',flowerWait:'قرّبوا من بعض',wow:'يا سلام',hand:'امسكي إيده',sit:'اقعدي',main:'تفاعل'}};
var RDUR={wave:2.4,heart:3.2,kiss:2.6,clap:2.8,cheer:2.6,laugh:3,cry:3.4,dance:5.2,jump:.75,shy:3,flower:2.6,wow:2.4,hand:30};
/* CC0 cues from plinkfx, loaded from its pinned CDN release. */
var REACT_SFX={wave:'whoosh',heart:'heart',kiss:'harp',clap:'click-soft',cheer:'victory',laugh:'voice-babble',cry:'water-drop',dance:'harp',jump:'jump',shy:'sparkle',flower:'bird-chirp',wow:'level-up',hand:'heart',sit:'land',paint:'click'};
var REACT_REAL={wave:['wave_swoosh',.7],heart:['pop',.5],kiss:['kiss',.7],clap:['clap',.6],cheer:['yay',.5],laugh:['slide_whistle',.45],cry:['splash',.45],dance:['tada',.4],jump:['land',.5],shy:['ding',.3],flower:['bird',.4],wow:['ding',.45],hand:['bell',.3],sit:['sit',.55],paint:['pop',.4]};
var HI_VOICES=[];
function loadHiVoices(){ try{ HI_VOICES=(window.speechSynthesis.getVoices()||[]).slice(); }catch(e){} }
try{ if(window.speechSynthesis){ loadHiVoices(); window.speechSynthesis.onvoiceschanged=loadHiVoices; } }catch(e){}
function pickVoice(lang,male){
  var fem=/female|woman|girl|samantha|karen|moira|tessa|fiona|victoria|allison|ava|susan|zira|aria|jenny|hazel|libby|sonia|michelle|natasha|emma|salma|hoda|laila|mariam|amira|google us english/i;
  var mal=/\bmale\b|david|mark|james|george|daniel|guy|ryan|alex|fred|tarik|naayf|hamed|thomas|oliver|christopher|eric|davis|brian|andrew|ahmed|shakir|maged/i;
  var soft=/natural|neural|online|enhanced|premium/i, best=null, bs=-99;
  HI_VOICES.forEach(function(v){ if(!v.lang||v.lang.toLowerCase().indexOf(lang.slice(0,2))!==0) return;
    var isF=/female/i.test(v.name)||(fem.test(v.name)&&!/\bmale\b/i.test(v.name.replace(/female/ig,''))), isM=!isF&&mal.test(v.name), sc=0;
    if(male){ if(isM) sc+=6; if(isF) sc-=6; } else { if(isF) sc+=6; if(isM) sc-=6; }
    if(soft.test(v.name)) sc+=3; if(v.lang.toLowerCase()===lang.toLowerCase()) sc+=1;
    if(sc>bs){ bs=sc; best=v; } });
  return best;
}
function sayHi(partner){
  if(sfxMuted) return true;
  try{ var ss=window.speechSynthesis; if(!ss||!window.SpeechSynthesisUtterance) return false; var ar=(typeof LANG!=='undefined'&&LANG==='ar');
    var him=!!(player&&player.userData&&player.userData.him), male=partner?!him:him;
    if(!HI_VOICES.length) loadHiVoices(); ss.cancel();
    var txt=male?(ar?'\u0623\u0647\u0644\u0627\u064b \u064a\u0627 \u0642\u0644\u0628\u064a':'Hey, hello there!'):(ar?'\u0623\u0647\u0644\u0627\u064b \u064a\u0627 \u062d\u0628\u064a\u0628\u064a':'Hiii, hello you!');
    var u=new SpeechSynthesisUtterance(txt); u.lang=ar?'ar-SA':'en-US';
    if(male){ u.rate=.92; u.pitch=.7; } else { u.rate=.88; u.pitch=1.2; }
    u.volume=.85; var v=pickVoice(u.lang,male); if(v) u.voice=v;
    ss.speak(u); return true; }catch(e){ return false; }
}
function playReactSound(n,partner){ if(n==='wave'&&sayHi(partner)) return; var r=REACT_REAL[n]; if(r&&playReal(r[0],r[1],function(){ playReactSynth(n); })) return; playReactSynth(n); }
function playReactSynth(n){ var cue=REACT_SFX[n]; if(!cue) return;
  var notes={wave:[79,84],heart:[72,76,79],kiss:[84,88],clap:[76,80],cheer:[76,80,84],laugh:[79,83],cry:[67,71],dance:[72,76,79],jump:[79,84],shy:[72,76],flower:[79,84,88],wow:[76,83,88],hand:[72,76],sit:[60,67],paint:[76,79]};
  chime(notes[n]||[76,80,84],.08,.075);
}
var REMO={wave:'\uD83D\uDC4B',heart:'\uD83D\uDC96',kiss:'\uD83D\uDE18',clap:'\uD83D\uDC4F',cheer:'\uD83D\uDE4C',laugh:'\uD83D\uDE02',cry:'\uD83D\uDE2D',dance:'\uD83D\uDC83',jump:'\uD83E\uDD38',shy:'\uD83D\uDE48',flower:'\uD83C\uDF38',wow:'\uD83D\uDE2E',hand:'\uD83D\uDC6B',sit:'\uD83E\uDE91'};
var myR=null, npcR=null, tray=document.createElement('div'); tray.className='tray'; tray.hidden=true; emEl.appendChild(tray);
var emMain=document.createElement('button'); emMain.className='em-main'; emMain.setAttribute('aria-expanded','false'); emEl.appendChild(emMain);
var rbtn={};
REACTS.forEach(function(n){ var bt=document.createElement('button'); bt.addEventListener('click',function(){ doReact(n); tray.hidden=true; emMain.setAttribute('aria-expanded','false'); }); tray.appendChild(bt); rbtn[n]=bt; });
function flowerNear(){ return Math.hypot(player.position.x-npc.position.x,player.position.z-npc.position.z)<=2.25; }
var flNote=document.createElement('div'); flNote.className='em-note'; tray.appendChild(flNote);
function updateFlowerAvailability(){ var b=rbtn.flower, L=RLAB[LANG]||RLAB.en, near=flowerNear(); b.disabled=!near; b.title=b.ariaLabel=near?L.flower:L.flowerWait; flNote.hidden=near; flNote.textContent='\uD83C\uDF38 '+(LANG==='ar'?'الوردة بتشتغل لما تقرّبوا من بعض':'The flower works when you stand close together'); }
setInterval(updateFlowerAvailability,400);
window.emRefresh=function(){ var L=RLAB[LANG]||RLAB.en; REACTS.forEach(function(n){ rbtn[n].textContent=REMO[n]; rbtn[n].title=rbtn[n].ariaLabel=L[n]; }); updateFlowerAvailability(); emMain.innerHTML='<svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 56C14 42 6 32 6 21 6 13 12 8 19 8c5 0 10 3 13 8 3-5 8-8 13-8 7 0 13 5 13 13 0 11-8 21-26 35z" fill="#ff7d96"/></svg>'; emMain.setAttribute('aria-label',L.main); };
emRefresh();
emMain.addEventListener('click',function(){ tray.hidden=!tray.hidden; emMain.setAttribute('aria-expanded',String(!tray.hidden)); });
function doReact(n){
  if(n==='sit'){ var wasSeated=!!seat; sitToggle(); if(seat||wasSeated&&!seat) playReactSound('sit'); return; }
  if(state!=='explore'||seat||!RDUR[n]) return;
  if(n==='hand'&&!ROLE){
    if(myR&&myR.n==='hand'){ myR=null; npcR=null; playReactSound(n); return; }
    myR={n:'hand',t:0,d:RDUR.hand}; npcR={n:'hand',t:0,d:RDUR.hand}; playReactSound(n); return;
  }
  if(n==='flower'){
    if(!flowerNear()) return;
    var fr={n:n,t:0,d:RDUR[n]};
    if(player.userData.him){ myR=fr; vx=vz=0; } else npcR=fr;
    playReactSound(n);
    if(ROLE) send({t:'flower'});
    return;
  }
  myR={n:n,t:0,d:RDUR[n]}; playReactSound(n); send({t:'emo',e:n});
}
function clapSnd(){ if(!AC||sfxMuted) return; if(!noiseBuf){ var nn=Math.floor(AC.sampleRate*.12); noiseBuf=AC.createBuffer(1,nn,AC.sampleRate); var dd=noiseBuf.getChannelData(0); for(var i=0;i<nn;i++) dd[i]=Math.random()*2-1; }
  var tm=AC.currentTime, so=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain(); so.buffer=noiseBuf; f.type='bandpass'; f.frequency.value=1800; f.Q.value=.8;
  g.gain.setValueAtTime(.0001,tm); g.gain.exponentialRampToValueAtTime(.35,tm+.004); g.gain.exponentialRampToValueAtTime(.001,tm+.08); so.connect(f); f.connect(g); g.connect(sfxBus); so.start(tm); so.stop(tm+.1); }
