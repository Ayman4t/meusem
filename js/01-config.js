/* Content (texts), pristine page copy for export */
'use strict';

/* Standalone export: the page source with its css/js files inlined (built on demand). */
function buildPristine(){
  var base=location.href.split('#')[0].split('?')[0], refs=[];
  return fetch(base,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('source'); return r.text(); }).then(function(html){
    html.replace(/<link rel="stylesheet" href="css\/[^"]+">|<script src="js\/[^"]+"><\/script>/g,function(m){ refs.push(m); return m; });
    return Promise.all(refs.map(function(m){ return fetch(new URL(/"((?:css|js)\/[^"]+)"/.exec(m)[1],base).href).then(function(r){ return r.text(); }); })).then(function(txt){
      refs.forEach(function(m,i){ var inl=m.indexOf('<link')===0?'<style>\n'+txt[i]+'\n</style>':'<script>\n'+txt[i].replace(/<\/script/gi,'<\\/script')+'\n</script>'; html=html.replace(m,function(){ return inl; }); });
      return html;
    });
  }).catch(function(){ return '<!doctype html>\n'+document.documentElement.outerHTML; });
}
var PRESET = null;

/* ---------- Content ---------- */
var TEXT_KEYS=['title','from','to','question','sub','final','l1','l2','l3','l4','l5','l6','letter','secret','coupon','closing','gpass','ghint'];
var DEFS={
 en:{title:'Museum of Love',gpass:'love',ghint:'Hint: the one thing this whole museum is about 💕',from:'Adam',to:'Laila',question:'Will you marry me?',sub:'i made you a whole museum 🥹',final:'forever starts now',
  l1:'a whole museum?? 😍',l2:'hi baby 💕',l3:'do you like it? I made it for you',l4:'keep going, one more thing',l5:'wait... come here',l6:'omgg whattt 😳',
  letter:'Maybe I am not the best with words, but what I am sure of is that you changed my life in a way I never imagined. I want to always be the one who chooses you, every single day, anew; to share your laughter on your good days, and to be your support and your rest when you are tired.',
  secret:'You found the secret room.\nI knew you would. 🤍',coupon:'One date night, planned by me. Valid forever.',
  closing:'Maybe I am not the best with words, but what I am sure of is that you changed my life in a way I never imagined. I want to always be the one who chooses you, every single day, anew; to share your laughter on your good days, and to be your support and your rest when you are tired.',
  captions:['The day we met','Our first call','That one dinner','The trip we planned','Your favourite song','Late night talks','The photo you hate','Next time, together']},
 ar:{title:'متحف الحب',gpass:'حب',ghint:'تلميح: الحاجة اللي المتحف ده كله عنها 💕',from:'آدم',to:'ليلى',question:'تتجوزيني؟',sub:'عملتلك متحف كامل 🥹',final:'من هنا بتبدأ حكايتنا للأبد',
  l1:'متحف كامل؟؟ 😍',l2:'أهلاً يا قلبي 💕',l3:'عجبك؟ أنا عملته عشانك',l4:'كمّلي، فاضل حاجة أخيرة',l5:'استني... تعالي هنا',l6:'يا نهار أبيض 😳',
  letter:'يمكن مش أشطر واحد في تزويق الكلام، بس اللي متأكد منه إن وجودك فرق في حياتي بطريقة مكنتش متخيلها، ونفسي أكون دايماً الشخص اللي بيختارك كل يوم من جديد؛ أشاركك ضحكتك في أيامك الحلوة، وأكون سندك وراحتك في وقت تعبك',
  secret:'لقيتي الأوضة السرية.\nكنت عارف إنك هتلاقيها. 🤍',coupon:'خروجة كاملة من تخطيطي. صالحة للأبد.',
  closing:'يمكن مش أشطر واحد في تزويق الكلام، بس اللي متأكد منه إن وجودك فرق في حياتي بطريقة مكنتش متخيلها، ونفسي أكون دايماً الشخص اللي بيختارك كل يوم من جديد؛ أشاركك ضحكتك في أيامك الحلوة، وأكون سندك وراحتك في وقت تعبك',
  captions:['يوم ما اتقابلنا','أول مكالمة','العشا إياه','الرحلة اللي خططنا لها','أغنيتك المفضلة','سهر الليل','الصورة اللي بتكرهيها','المرة الجاية، سوا']}
};
var NO_LINES={
 en:[null,'baby... the other button 👀','the yes is getting bigger',"okay now you're doing it on purpose",'still no? the yes is not giving up',"you can't escape destiny"],
 ar:[null,'يا قلبي... الزرار التاني 👀','الـ "أيوه" بتكبر','خلاص دلوقتي بتعمليها قصد','لسه لأ؟ الـ "أيوه" مش هيستسلم','مفيش هروب من القدر']
};
var I18N={
 en:{lang:'العربية',enter:'Enter',customize:'Customize',from:'From',to:'To',prep:'Preparing the collection ',ready:'Ready ',close:'Close',reset:'Reset to sample',save:'Save and preview',
  look:'Look closer',listen:'🔊 Listen',sound:'Sound',lights:'Lights',guest:'✍ Guestbook',skip:'⏭ Skip to the end',shot:'📸 Save the moment',rec:'● Record',stop:'■ Stop',
  found:'Photos found',secret:'You found the secret room 🤍',need:'wait... you still have {n} photos to see 🥹',
  hintD:'Walk with W A S D, hold Shift to run. Drag to look around, scroll to zoom. Walk to the walls to see the photos.',hintT:'Drag the circle to walk, pull it to the edge to run. Drag the scene to look around. Go near a wall to see the photos.',
  back:'Back to the museum',yes:'Yes',no:'No',make:'Make it ours',note:'Your words, photos, videos and voice notes are saved on this device only.',
  walls:'Photos and videos on the walls',cont:'Continue',letVoice:'▶ His voice',gTitle:'Guestbook',gPlace:'Leave a note...',gAdd:'Leave note',gEmpty:'No notes yet.',
  share:'Share it',shareNote:'The link carries your text and small versions of the photos. It opens for others only when this page is hosted online.',
  copy:'Copy link',copied:'Link copied',long:'Copied. The link is long because of the photos.',needHost:'Copied, but this page is not hosted online, so the link will not open for others. Host it online first.',
  dl:'Download as one file',building:'Building...',saved:'Saved',norec:'Recording is not supported in this browser',
  lightNames:['Evening','Day','Candle'],edLang:'Language',edLetter:'His letter (before the question)',edSecret:'Secret room message',edCoupon:'Coupon on the pedestal',edClosing:'Closing message (shown under the question)',open:'🎀 Open',exitQ:'Leave the museum?',stay:'Stay',leave:'Leave',edNeed:'Require all photos before the finale',
  edSong:'Your favourite song (plays near the 5th frame)',edLetterVoice:'Voice for the letter',cinemaVideo:'Cinema room video',cinemaVideoNote:'Choose a video to play on the room TV. It loops silently and is saved on this device.',videoPick:'Add video',videoChange:'Change video',videoNearAdd:'🎬 Add',videoSaved:'Video selected',photoBtn:'Photo / video',clear:'Clear',recV:'🎙 Voice',stopV:'■ Stop',voiceOn:'voice saved',songOn:'song saved',
  date:'Date (optional)',capt:'Caption',songPick:'Choose song',tooBig:'File is large, it may be slow',micFail:'Microphone not available'},
 ar:{lang:'English',enter:'ادخل',customize:'خصّص',from:'من',to:'إلى',prep:'جاري تجهيز المتحف ',ready:'جاهز ',close:'إغلاق',reset:'رجّع للنموذج',save:'احفظ وشوف',
  look:'شوف أقرب',listen:'🔊 اسمع',sound:'الصوت',lights:'الإضاءة',guest:'✍ دفتر الزوار',skip:'⏭ روح للنهاية',shot:'📸 احفظ اللحظة',rec:'● سجّل',stop:'■ إيقاف',
  found:'الصور اللي شفتيها',secret:'لقيتي الأوضة السرية 🤍',need:'استني... لسه فاضل {n} صور متشفتيهاش 🥹',
  hintD:'امشي بأزرار W A S D، واضغط Shift عشان تجري. اسحب عشان تتفرج، والعجلة للتقريب. روح للحيطان عشان تشوف الصور.',hintT:'اسحب الدايرة عشان تمشي، واسحبها لآخرها عشان تجري. اسحب المشهد عشان تلف. قرّب من الحيط عشان تشوف الصور.',
  back:'ارجع للمتحف',yes:'أيوه',no:'لأ',make:'خلّيه بتاعنا',note:'كلامك وصورك وفيديوهاتك ورسائلك الصوتية بتتحفظ على الجهاز ده بس.',
  walls:'الصور والفيديوهات على الحيطان',cont:'كمّل',letVoice:'▶ صوته',gTitle:'دفتر الزوار',gPlace:'اترك ملاحظة...',gAdd:'اترك ملاحظة',gEmpty:'مفيش ملاحظات لسه.',
  share:'شاركه',shareNote:'اللينك بيشيل الكلام ونسخ صغيرة من الصور، وبيفتح عند الناس بس لو الصفحة منشورة أونلاين.',
  copy:'انسخ اللينك',copied:'اتنسخ اللينك',long:'اتنسخ. اللينك طويل بسبب الصور.',needHost:'اتنسخ، بس الصفحة مش منشورة أونلاين فاللينك مش هيفتح عند حد. انشرها أونلاين الأول.',
  dl:'نزّل كملف واحد',building:'بجهّز...',saved:'اتحفظ',norec:'التسجيل مش مدعوم في المتصفح ده',
  lightNames:['مساء','نهار','شموع'],edLang:'اللغة',edLetter:'جواب منه (قبل السؤال)',edSecret:'رسالة الأوضة السرية',edCoupon:'القسيمة على القاعدة',edClosing:'الرسالة الأخيرة (تحت السؤال)',open:'🎀 افتحي',exitQ:'تخرجي من المتحف؟',stay:'ابقي',leave:'اخرجي',edNeed:'لازم تشوف كل الصور قبل النهاية',
  edSong:'أغنيتها المفضلة (بتشتغل جنب الإطار الخامس)',edLetterVoice:'صوت للجواب',cinemaVideo:'فيديو غرفة السينما',cinemaVideoNote:'اختار فيديو يشتغل على تلفزيون الغرفة. هيتكرر من غير صوت ويتحفظ على الجهاز ده.',videoPick:'أضف فيديو',videoChange:'غيّر الفيديو',videoNearAdd:'🎬 أضف',videoSaved:'تم اختيار الفيديو',photoBtn:'صورة / فيديو',clear:'مسح',recV:'🎙 صوت',stopV:'■ إيقاف',voiceOn:'الصوت محفوظ',songOn:'الأغنية محفوظة',
  date:'التاريخ (اختياري)',capt:'التعليق',songPick:'اختار أغنية',tooBig:'الملف كبير، ممكن يبطّأ',micFail:'الميكروفون مش متاح'}
};
var TEXT_FIELDS=[
 ['title',['Museum name','اسم المتحف']],['from',['From (who made it)','من (اللي عمله)']],['to',['To (who gets it)','إلى (اللي هتستلمه)']],
 ['question',['The big question','السؤال الكبير']],['sub',['Line under the question','السطر تحت السؤال']],['final',['Text after she says yes','النص بعد ما توافق']],
 ['l1',['Her first bubble','أول فقاعة ليها']],['l2',['His first bubble','أول فقاعة ليه']],['l3',['His bubble, halfway','فقاعته في النص']],
 ['l4',['His bubble, near the end','فقاعته قرب النهاية']],['l5',['His bubble before kneeling','فقاعته قبل الركوع']],['l6',['Her bubble when he kneels','فقاعتها لما يركع']]
];

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function b64enc(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64dec(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return decodeURIComponent(escape(atob(s))); }
function baseCfg(){
  var c={captions:DEFS.en.captions.slice(),dates:['','','','','','','',''],photos:['','','','','','','',''],needAll:'1'};
  TEXT_KEYS.forEach(function(k){ c[k]=DEFS.en[k]; }); return c;
}
function mergeCfg(c,s){
  if(!s) return c;
  TEXT_KEYS.forEach(function(k){ if(typeof s[k]==='string') c[k]=s[k]; });
  ['captions','dates','photos'].forEach(function(k){ if(Array.isArray(s[k])) for(var i=0;i<8;i++) if(typeof s[k][i]==='string') c[k][i]=s[k][i]; });
  if(typeof s.needAll==='string') c.needAll=s.needAll;
  return c;
}
var STORE_KEY='ourMuseum.v1', HASH=null, ROLE=null, JOIN=null, MUSEUM_MODE=new URLSearchParams(location.search).get('museum')==='1';
if(/^#m=/.test(location.hash)){ try{ HASH=JSON.parse(b64dec(location.hash.slice(3).split('&')[0])); }catch(e){ HASH=null; } }
var DARK_INV=/[#&]dark=1(?:&|$)/.test(location.hash);
(function(){ var m=/[#&]join=([\w-]+)\.([0-9a-f]+)/.exec(location.hash); if(m){ JOIN={id:m[1],tok:m[2]}; ROLE='guest'; } })();
var IS_GIFT=!!(PRESET||HASH);
var LANG='en';
try{ var sl=localStorage.getItem('ourMuseum.lang'); if(sl==='ar'||sl==='en') LANG=sl; }catch(e){}
if(PRESET&&PRESET.lang) LANG=PRESET.lang; else if(HASH&&HASH.lang) LANG=HASH.lang;
var cfg=baseCfg();
(function(){
  if(PRESET){ mergeCfg(cfg,PRESET.cfg); }
  else if(HASH){
    var s={captions:HASH.c,dates:HASH.d,photos:HASH.p,needAll:HASH.n}; if(HASH.t) Object.keys(HASH.t).forEach(function(k){ s[k]=HASH.t[k]; }); mergeCfg(cfg,s);
  } else { try{ var raw=localStorage.getItem(STORE_KEY); if(raw) mergeCfg(cfg,JSON.parse(raw)); }catch(e){} }
})();
function t(k){ var d=I18N[LANG]; return d[k]!==undefined?d[k]:I18N.en[k]; }
function C(k){ var v=cfg[k]; if(k==='letter'&&v&&(v.indexOf('بنيت المتحف ده')>=0||v.indexOf('I built this museum so')===0)) v=''; if(!v||v===DEFS.en[k]||v===DEFS.ar[k]||(k==='title'&&(v==='Our Museum'||v==='متحفنا'))) return DEFS[LANG][k]; return v; }
function CAP(i){ var v=cfg.captions[i]; if(!v||v===DEFS.en.captions[i]||v===DEFS.ar.captions[i]) return DEFS[LANG].captions[i]; return v; }

