/* DOM handles, media store (IndexedDB) */
'use strict';

/* ---------- DOM ---------- */
var $=function(id){ return document.getElementById(id); };
var stage=$('stage'), canvas=$('gl'), bubblesEl=$('bubbles'), hud=$('hud'), hint=$('hint');
var intro=$('intro'), ask=$('ask'), stick=$('stick'), knob=$('knob');
var isTouch=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||('ontouchstart' in window);
function mix(a,b,k){ return a+(b-a)*k; }
function ease(k){ k=Math.max(0,Math.min(1,k)); return k*k*(3-2*k); }
function clampN(v,a,b){ return Math.max(a,Math.min(b,v)); }
var toastTimer=null;
function toast(msg,ms){ var e=$('toast'); e.textContent=msg; e.classList.add('on'); clearTimeout(toastTimer); toastTimer=setTimeout(function(){ e.classList.remove('on'); },ms||2600); }
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }

/* ---------- Media store (videos, voice notes, song) in IndexedDB ---------- */
var store={}, urls={};
function idb(){ return new Promise(function(res,rej){ try{ var r=indexedDB.open('ourMuseum',1); r.onupgradeneeded=function(){ r.result.createObjectStore('m'); }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(); }; }catch(e){ rej(); } }); }
function idbLoadAll(){ return idb().then(function(db){ return new Promise(function(res){ var out={}, cur=db.transaction('m').objectStore('m').openCursor(); cur.onsuccess=function(){ var c=cur.result; if(c){ out[c.key]=c.value; c.continue(); } else res(out); }; cur.onerror=function(){ res(out); }; }); }).catch(function(){ return {}; }); }
function idbPut(k,v){ return idb().then(function(db){ return new Promise(function(res){ var tx=db.transaction('m','readwrite'); tx.objectStore('m').put(v,k); tx.oncomplete=res; tx.onerror=res; }); }).catch(function(){}); }
function idbDel(k){ return idb().then(function(db){ return new Promise(function(res){ var tx=db.transaction('m','readwrite'); tx.objectStore('m').delete(k); tx.oncomplete=res; tx.onerror=res; }); }).catch(function(){}); }
function mediaURL(k){ var b=store[k]; if(!b) return null; if(!urls[k]||urls[k].b!==b){ if(urls[k]) URL.revokeObjectURL(urls[k].u); urls[k]={b:b,u:URL.createObjectURL(b)}; } return urls[k].u; }
function dataURLtoBlob(u){ var p=u.split(','), m=/:(.*?);/.exec(p[0]), b=atob(p[1]), n=b.length, a=new Uint8Array(n); while(n--) a[n]=b.charCodeAt(n); return new Blob([a],{type:m?m[1]:'application/octet-stream'}); }
function blobToDataURL(b){ return new Promise(function(res){ var r=new FileReader(); r.onload=function(){ res(r.result); }; r.onerror=function(){ res(''); }; r.readAsDataURL(b); }); }
if(PRESET&&PRESET.media) Object.keys(PRESET.media).forEach(function(k){ try{ store[k]=dataURLtoBlob(PRESET.media[k]); }catch(e){} });

/* Story state machine value: intro, explore, cinematic, proposal, accepted, done (assigned in 09-story.js). */
var state;

