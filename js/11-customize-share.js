/* Customize panel, share link and standalone file */
'use strict';

/* ---------- Customize panel ---------- */
var draft=null, dStore=null, recState=null;
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; }
function paintThumb(e,i){
  var hasVid=!!dStore['vid'+i];
  if(draft.photos[i]) e.style.backgroundImage='url('+draft.photos[i]+')';
  else { var p=PAL[i%PAL.length]; e.style.backgroundImage='linear-gradient(160deg,'+p[0]+','+p[1]+')'; }
  e.textContent=hasVid?'🎬 video':'';
}
function fileToData(file){
  return new Promise(function(res,rej){
    var url=URL.createObjectURL(file), im=new Image();
    im.onload=function(){ var s=Math.min(1,1000/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg',.82)); };
    im.onerror=function(){ URL.revokeObjectURL(url); rej(); }; im.src=url;
  });
}
function recordInto(key,btn,st){
  if(recState){ recState.mr.stop(); return; }
  if(!navigator.mediaDevices||!window.MediaRecorder){ toast(t('micFail')); return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var chunks=[], mr=new MediaRecorder(stream); recState={mr:mr};
    mr.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
    mr.onstop=function(){ stream.getTracks().forEach(function(tr){ tr.stop(); }); dStore[key]=new Blob(chunks,{type:mr.mimeType||'audio/webm'}); recState=null; btn.textContent=t('recV'); btn.classList.add('on'); st.textContent=t('voiceOn'); };
    mr.start(); btn.textContent=t('stopV');
  }).catch(function(){ toast(t('micFail')); });
}
function audioRow(key,label,pickLabel,isFile){
  var box=el('div','fld'); box.appendChild(el('label','',label));
  var row=el('div','row'), st=el('span','st',dStore[key]?(isFile?t('songOn'):t('voiceOn')):'');
  var b=el('button','mini'+(dStore[key]?' on':'')), clr=el('button','mini',t('clear')); b.type='button'; clr.type='button';
  if(isFile){
    b.textContent=pickLabel; var f=document.createElement('input'); f.type='file'; f.accept='audio/*'; f.hidden=true;
    b.addEventListener('click',function(){ f.click(); });
    f.addEventListener('change',function(){ if(f.files[0]){ dStore[key]=f.files[0]; b.classList.add('on'); st.textContent=t('songOn'); } });
    row.appendChild(f);
  } else { b.textContent=t('recV'); b.addEventListener('click',function(){ recordInto(key,b,st); }); }
  clr.addEventListener('click',function(){ delete dStore[key]; b.classList.remove('on'); st.textContent=''; });
  row.appendChild(b); row.appendChild(clr); row.appendChild(st); box.appendChild(row); return box;
}
function cinemaVideoRow(){
  var box=el('div','fld'), row=el('div','row'), input=document.createElement('input'); input.type='file'; input.accept='video/*'; input.hidden=true;
  var choose=el('button','mini'+(dStore.cinemaVideo?' on':''),dStore.cinemaVideo?t('videoSaved'):t('videoPick'));
  var clear=el('button','mini',t('clear')), status=el('span','st',dStore.cinemaVideo?(dStore.cinemaVideo.name||t('videoSaved')):''); choose.type=clear.type='button';
  choose.addEventListener('click',function(){ input.click(); });
  input.addEventListener('change',function(){ var f=input.files&&input.files[0]; if(!f) return; if(f.size>40*1048576) toast(t('tooBig')); dStore.cinemaVideo=f; choose.textContent=t('videoSaved'); choose.classList.add('on'); status.textContent=f.name||t('videoSaved'); input.value=''; });
  clear.addEventListener('click',function(){ delete dStore.cinemaVideo; input.value=''; choose.textContent=t('videoPick'); choose.classList.remove('on'); status.textContent=''; });
  row.appendChild(input); row.appendChild(choose); row.appendChild(clear); row.appendChild(status); box.appendChild(row); return box;
}
function openEditor(){
  draft=clone(cfg); dStore=Object.assign({},store);
  $('edTitle').textContent=t('make'); buildEmojiBar(); $('edClose').textContent=t('close'); $('edNote').textContent=t('note'); $('edWalls').textContent=t('walls'); (function(a){ $('edCharsH').textContent=a?'الشخصيات':'Characters'; $('edCharsNote').textContent=a?'غيّر شكل آدم وليلى: الشعر والعيون والبشرة والملابس. التغييرات بتتحفظ على الجهاز ده.':'Change how both characters look: hair, eyes, skin and outfits. Saved on this device.'; $('edChars').textContent=a?'👗 خصّص الشخصيات':'👗 Customize characters'; })(LANG==='ar');
  $('edShareH').textContent=t('share'); $('edShareNote').textContent=t('shareNote'); $('shCopy').textContent=t('copy'); $('shFile').textContent=t('dl'); $('shSt').textContent='';
  $('edReset').textContent=t('reset'); $('edSave').textContent=t('save');
  var tx=$('edText'); tx.innerHTML='';
  TEXT_FIELDS.forEach(function(f){
    var w=el('div','fld'), lab=el('label','',f[1][LANG==='ar'?1:0]); lab.htmlFor='ed-'+f[0];
    var inp=document.createElement('input'); inp.type='text'; inp.id='ed-'+f[0]; inp.value=C(f[0]); inp.maxLength=90; draft[f[0]]=inp.value;
    inp.addEventListener('input',function(){ draft[f[0]]=inp.value; }); w.appendChild(lab); w.appendChild(inp); tx.appendChild(w);
  });
  var ex=$('edExtra'); ex.innerHTML='';
  [['letter',t('edLetter'),true],['secret',t('edSecret'),true],['closing',t('edClosing'),true],['coupon',t('edCoupon'),false],['gpass',LANG==='ar'?'كلمة سر الهدية (صورة الأوضة السرية)':'Gift password (secret-room photo)',false],['ghint',LANG==='ar'?'تلميح كلمة السر':'Password hint',false]].forEach(function(f){
    var w=el('div','fld'), lab=el('label','',f[1]); w.appendChild(lab); draft[f[0]]=C(f[0]);
    var inp=f[2]?document.createElement('textarea'):document.createElement('input'); if(!f[2]) inp.type='text'; inp.value=draft[f[0]]; inp.maxLength=600;
    inp.addEventListener('input',function(){ draft[f[0]]=inp.value; }); w.appendChild(inp); ex.appendChild(w);
  });
  var au=$('edAudio'); au.innerHTML=''; au.appendChild(audioRow('song',t('edSong'),t('songPick'),true)); au.appendChild(audioRow('audLetter',t('edLetterVoice'),'',false));
  $('edCinemaH').textContent=t('cinemaVideo'); $('edCinemaNote').textContent=t('cinemaVideoNote'); var cv=$('edCinema'); cv.innerHTML=''; cv.appendChild(cinemaVideoRow());
  var ph=$('edPhotos'); ph.innerHTML='';
  for(var i=0;i<8;i++) (function(i){
    var card=el('div','ph-card'), th=el('div','ph'); paintThumb(th,i);
    var cap=document.createElement('input'); cap.type='text'; cap.maxLength=60; cap.value=CAP(i); draft.captions[i]=cap.value; cap.setAttribute('aria-label',t('capt')); cap.addEventListener('input',function(){ draft.captions[i]=cap.value; });
    var dt=document.createElement('input'); dt.type='text'; dt.maxLength=30; dt.placeholder=t('date'); dt.value=draft.dates[i]||''; dt.addEventListener('input',function(){ draft.dates[i]=dt.value; });
    var acts=el('div','ph-actions'), lab=el('label','mini',t('photoBtn')); lab.htmlFor='file-'+i;
    var file=document.createElement('input'); file.type='file'; file.accept='image/*,video/*'; file.id='file-'+i; file.hidden=true;
    file.addEventListener('change',function(){
      var f=file.files[0]; if(!f) return;
      if(f.type.indexOf('video/')===0){ if(f.size>40*1048576) toast(t('tooBig')); dStore['vid'+i]=f; draft.photos[i]=''; paintThumb(th,i); }
      else fileToData(f).then(function(d){ draft.photos[i]=d; delete dStore['vid'+i]; paintThumb(th,i); });
    });
    var rm=el('button','mini',t('clear')); rm.type='button'; rm.addEventListener('click',function(){ draft.photos[i]=''; delete dStore['vid'+i]; file.value=''; paintThumb(th,i); });
    var vb=el('button','mini'+(dStore['aud'+i]?' on':''),t('recV')); vb.type='button'; var vs=el('span','st',dStore['aud'+i]?t('voiceOn'):'');
    vb.addEventListener('click',function(){ recordInto('aud'+i,vb,vs); });
    var vc=el('button','mini','✕'); vc.type='button'; vc.title=t('clear'); vc.addEventListener('click',function(){ delete dStore['aud'+i]; vb.classList.remove('on'); vs.textContent=''; });
    acts.appendChild(lab); acts.appendChild(file); acts.appendChild(rm); acts.appendChild(vb); acts.appendChild(vc);
    card.appendChild(th); card.appendChild(cap); card.appendChild(dt); card.appendChild(acts); card.appendChild(vs); ph.appendChild(card);
  })(i);
  $('editor').hidden=false; $('editor').scrollTop=0;
}
$('customize').addEventListener('click',openEditor);
$('edChars').addEventListener('click',openLook);
var lastField=null;
$('editor').addEventListener('focusin',function(e){ var t=e.target; if(t&&((t.tagName==='INPUT'&&t.type==='text')||t.tagName==='TEXTAREA')) lastField=t; });
function insEmoji(ch){ var f=(lastField&&document.body.contains(lastField))?lastField:$('ed-question'); if(!f) return; f.focus(); var a=f.selectionStart==null?f.value.length:f.selectionStart, b=f.selectionEnd==null?a:f.selectionEnd; if(f.maxLength>0&&f.value.length-(b-a)+ch.length>f.maxLength) return; f.value=f.value.slice(0,a)+ch+f.value.slice(b); try{ f.setSelectionRange(a+ch.length,a+ch.length); }catch(e){} f.dispatchEvent(new Event('input',{bubbles:true})); }
function buildEmojiBar(){ var bar=$('edEmoji'); bar.innerHTML=''; var l=document.createElement('span'); l.className='eb-l'; l.textContent=LANG==='ar'?'اضغط على إيموجي عشان يتضاف في المكان اللي بتكتب فيه':'Tap an emoji to add it where you are typing'; bar.appendChild(l);
  ['💕','💖','🥰','😍','😘','😳','🥺','😭','😂','💍','🌹','🌷','🎀','💌','💋','✨','🤍','😊'].forEach(function(ch){ var b=document.createElement('button'); b.type='button'; b.textContent=ch; b.addEventListener('mousedown',function(e){ e.preventDefault(); }); b.addEventListener('click',function(){ insEmoji(ch); }); bar.appendChild(b); }); }
$('edClose').addEventListener('click',function(){ $('editor').hidden=true; });
$('edReset').addEventListener('click',function(){
  cfg=baseCfg(); try{ localStorage.removeItem(STORE_KEY); }catch(e){}
  Object.keys(store).forEach(function(k){ idbDel(k); delete store[k]; });
  $('editor').hidden=true; applyCfg();
});
$('edSave').addEventListener('click',function(){
  if(recState) recState.mr.stop();
  cfg=clone(draft); try{ localStorage.setItem(STORE_KEY,JSON.stringify(cfg)); }catch(e){ toast('Storage full: use fewer or smaller photos'); }
  var keys=Object.keys(store).concat(Object.keys(dStore)), seen={};
  keys.forEach(function(k){ if(seen[k]) return; seen[k]=1; if(dStore[k]!==store[k]){ if(dStore[k]){ store[k]=dStore[k]; idbPut(k,dStore[k]); } else { delete store[k]; idbDel(k); } } });
  $('editor').hidden=true; applyCfg(); applyI18n();
  setTimeout(function(){ tags.me.label.textContent=C(ROLE==='host'?'from':'to'); tags.npc.label.textContent=C(ROLE==='host'?'to':'from'); },0);
});

/* ---------- Share: link and standalone file ---------- */
function shrink(src,max,q){ return loadImg(src).then(function(im){ if(!im) return ''; var s=Math.min(1,max/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',q); }); }
$('shCopy').addEventListener('click',function(){
  $('shSt').textContent=t('building');
  Promise.all(cfg.photos.map(function(p){ return p?shrink(p,420,.5):''; })).then(function(ph){
    var o={lang:LANG,t:{},c:[],d:cfg.dates.slice(),p:ph,n:cfg.needAll};
    TEXT_KEYS.forEach(function(k){ o.t[k]=C(k); }); for(var i=0;i<8;i++) o.c.push(CAP(i));
    var link=location.href.split('#')[0]+'#m='+b64enc(JSON.stringify(o));
    var done=function(){ $('shSt').textContent=''; toast(location.protocol==='file:'?t('needHost'):(link.length>60000?t('long'):t('copied')),4200); };
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done,function(){ window.prompt('Link',link); done(); });
    else { window.prompt('Link',link); done(); }
  });
});
$('shFile').addEventListener('click',function(){
  if(PRESET){ return; }
  $('shSt').textContent=t('building');
  var media={}, ks=Object.keys(store);
  Promise.all(ks.map(function(k){ return blobToDataURL(store[k]).then(function(d){ media[k]=d; }); })).then(function(){
    var json=JSON.stringify({lang:LANG,cfg:cfg,media:media}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    return buildPristine().then(function(page){
      var out=page.replace('var PRESET = null;',function(){ return 'var PRESET = '+json+';'; });
      download(new Blob([out],{type:'text/html'}),'our-museum-gift.html'); $('shSt').textContent=''; toast(t('saved'));
    });
  });
});


