/* Start-up: runs after every other file has loaded (async work, loading bar, render loop) */
'use strict';

/* Order matters: nothing asynchronous may start before all files above are loaded. */
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ galleryFrames.forEach(function(f,i){ if(!f.img) drawFrame(i); drawPlaque(i); }); drawScreen(); drawSecret(); drawCoupon(); drawObs(); if(typeof drawFeature==='function') drawFeature(); });

(function(){
  var loader=IS_GIFT?Promise.resolve({}):idbLoadAll();
  loader.then(function(all){ Object.keys(all).forEach(function(k){ store[k]=all[k]; }); return applyCfg(); }).then(function(){ loaded=true; }).catch(function(){ loaded=true; });
})();

/* keep only a small loading bar on screen until texts, fonts and photos are ready, then reveal the finished ticket */
(function(){
  var t1=performance.now(), fontsP=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  var iv=setInterval(function(){ if(!loaded) return; clearInterval(iv); fontsP.then(function(){
    applyI18n(); var wait=Math.max(0,500-(performance.now()-t1));
    setTimeout(function(){ var pl=document.getElementById('preload'); if(pl){ pl.classList.add('gone'); setTimeout(function(){ if(pl.parentNode) pl.parentNode.removeChild(pl); },600); } },wait);
  }); },40);
})();
var t0=performance.now();
var museumStarted=false;
var loadTimer=setInterval(function(){
  var target=Math.min(1,(performance.now()-t0)/2300); if(!loaded) target=Math.min(target,.92);
  progress+=(target-progress)*.35; var p=Math.round(progress*100); if(loaded&&target>=1) p=100;
  $('barFill').style.width=p+'%'; $('pct').textContent=(p<100?t('prep'):t('ready'))+p+'%';
  if(p>=100){ clearInterval(loadTimer); $('enter').disabled=false; $('enter').focus(); if(MUSEUM_MODE&&!museumStarted){ museumStarted=true; startExplore(); } }
},90);

requestAnimationFrame(frame);
