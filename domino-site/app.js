(function(){
var RATES={USD:1,GBP:.78,NGN:1550,EUR:.92,ZAR:18.2,KES:129,CAD:1.38};
var SIZES=[{k:'A3',m:1,d:'297 × 420 mm'},{k:'A2',m:1.9,d:'420 × 594 mm'},{k:'A1',m:3.2,d:'594 × 841 mm'}];
var Y='#ffd60a',G='#0b8a3e',P='#ecede3',K='#0c0d0a';
var DATA_JSON=document.getElementById('sitedata').textContent,DATA=JSON.parse(DATA_JSON);
function slugify(n){return String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'series'}
var SERIES=[],WORKS=[];
function buildData(){
  SERIES=[];WORKS=[];
  DATA.series.forEach(function(s){
    var ws=DATA.works.filter(function(w){return w.series===s.id&&(st.edit||!w.hidden)});
    if(!ws.length&&!st.edit)return;
    var sr={id:s.id,name:s.name,slug:slugify(s.name)+(SERIES.some(function(x){return x.slug===slugify(s.name)})?'-'+s.id:''),medium:'Digital collage',year:2026,n:0};
    SERIES.push(sr);
    ws.forEach(function(w,i){WORKS.push({id:w.id,n:w.id,series:sr,title:w.title,no:i+1,base:+w.base||0,ratio:w.ratio||1.294,img:w.img,hidden:!!w.hidden});sr.n++});
  });
}
function first(s){return WORKS.filter(function(w){return w.series===s})[0]}
function byId(id){return WORKS.filter(function(w){return w.id===id})[0]}

var st={cur:'USD',view:'gallery',home:'line',cart:[],ang:0};
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var hv=lsGet('dmn.home','line');st.home=(hv==='wall'||hv==='museum')?hv:'line';st.cur=lsGet('dmn.cur','USD');if(!RATES[st.cur])st.cur='USD';
st.edit=false;buildData();
st.cart=lsGet('dmn.cart2',[]).filter(function(l){return byId(l.id)});
var $=function(q){return document.querySelector(q)};
function money(usd){return new Intl.NumberFormat(undefined,{style:'currency',currency:st.cur,maximumFractionDigits:0}).format(usd*RATES[st.cur])}
function wprice(w,si){return w.base*SIZES[si||0].m}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function mod(a,n){return((a%n)+n)%n}

function paintAll(){}
function cv(w){return '<img src="'+esc(w.img)+'" width="927" height="'+Math.round(927*w.ratio)+'" alt="'+esc(w.title)+'" decoding="async">'}

function card(w){
  return '<div class="card"><button class="art" data-open="'+w.id+'" aria-label="Open '+esc(w.title)+'">'+cv(w)+'</button>'+
  '<div class="cap"><b>'+esc(w.title)+' '+w.no+(w.hidden?' (hidden)':'')+'</b><span>'+money(wprice(w,0))+'</span></div><div class="mono" style="color:var(--mute)">'+esc(w.series.name)+'</div></div>';
}
function ledger(ws){
  return '<div class="scroll"><table class="ledger"><thead><tr><th>No.</th><th>Title</th><th>Series</th><th>Medium</th><th>Year</th><th>From</th></tr></thead><tbody>'+
  ws.map(function(w,i){return '<tr class="row" tabindex="0" data-open="'+w.id+'"><td>'+String(i+1).padStart(2,'0')+'</td><td class="t">'+esc(w.title)+'</td><td>'+esc(w.series.name)+'</td><td>'+esc(w.series.medium)+'</td><td>'+w.series.year+'</td><td>'+money(wprice(w,0))+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function seriesLedger(){
  return '<div class="scroll"><table class="ledger"><thead><tr><th>No.</th><th>Series</th><th>Medium</th><th>Year</th><th>Prints</th></tr></thead><tbody>'+
  SERIES.map(function(s,i){return '<tr class="row" tabindex="0" data-go="s-'+s.slug+'"><td>'+String(i+1).padStart(2,'0')+'</td><td class="t">'+esc(s.name)+'</td><td>'+esc(s.medium)+'</td><td>'+s.year+'</td><td>'+s.n+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function listRow(w,i){
  return '<li class="rv" style="--d:'+Math.min(i,8)*55+'ms"><button class="lrow" data-open="'+w.id+'" aria-label="Open '+esc(w.title)+'"><span class="lthumb" style="aspect-ratio:'+(1/w.ratio).toFixed(4)+' / 1">'+cv(w)+'</span><span class="ltext"><span class="ltitle">'+esc(w.title)+'</span><span class="lmeta">'+esc(w.series.name)+'</span></span><span class="lprice">'+money(wprice(w,0))+'</span><span class="lgo" aria-hidden="true">&rarr;</span></button></li>';
}
function listHTML(ss,noHead){
  return '<div class="llist">'+ss.map(function(sr){
    var ws=WORKS.filter(function(w){return w.series===sr});
    return '<section class="lsec" aria-label="'+esc(sr.name)+'">'+'<ul class="lrows">'+ws.map(listRow).join('')+'</ul></section>';
  }).join('')+'</div>';
}
function seg(){return '<div class="seg" role="group" aria-label="Layout"><button data-v="gallery" aria-pressed="'+(st.view==='gallery')+'">Gallery</button><button data-v="list" aria-pressed="'+(st.view==='list')+'">List</button></div>'}

/* prints hang on lines, one line per series, and swing when touched */
var PW=150,SP=190,SAG=34,Y0=10;
function lineHTML(s){
  var ws=WORKS.filter(function(w){return w.series===s}),W=ws.length*SP+80;
  var pins=ws.map(function(w,i){
    var x=40+SP*(i+.5),u=x/W,y=Y0+4*SAG*u*(1-u);
    return '<div class="pin" style="left:'+(x-PW/2)+'px;top:'+(y-6)+'px"><div class="swing"><span class="peg"></span><button class="print" data-hang="'+w.id+'" aria-label="'+esc(w.title)+'">'+cv(w)+'<span class="tag">'+esc(w.title)+'</span></button></div></div>';
  }).join('');
  var svg='<svg width="'+W+'" height="'+(Y0+SAG+10)+'" aria-hidden="true"><path d="M0,'+Y0+' Q'+(W/2)+','+(Y0+2*SAG)+' '+W+','+Y0+'" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="4" cy="'+Y0+'" r="3" fill="currentColor"/><circle cx="'+(W-4)+'" cy="'+Y0+'" r="3" fill="currentColor"/></svg>';
  return '<section class="lw"><div class="mono lbl"><a href="#s-'+s.slug+'">'+esc(s.name)+' &rarr;</a><span style="color:var(--mute)">'+s.n+' prints</span></div><div class="strip"><div class="line" style="width:'+W+'px;height:'+Math.round(Y0+SAG+PW*1.4+70)+'px;color:var(--fg)">'+svg+pins+'</div></div></section>';
}
function homeSeg(){return '<div class="seg" role="group" aria-label="Hang style"><button data-h="line" aria-pressed="'+(st.home==='line')+'">On a line</button><button data-h="wall" aria-pressed="'+(st.home==='wall')+'">On a wall</button><button data-h="museum" aria-pressed="'+(st.home==='museum')+'">In a museum</button></div>'}
function wallHTML(){
  var off=[0,40,14,58,26];
  return '<div class="strip wall">'+WORKS.map(function(w,i){
    return '<div class="wp" style="margin-top:'+off[i%5]+'px"><div class="swing"><span class="nail"></span><svg class="str" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><path d="M50,0 L6,34 M50,0 L94,34" stroke="currentColor" stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke"/></svg><button class="print" data-hang="'+w.id+'" aria-label="'+esc(w.title)+'">'+cv(w)+'<span class="tag">'+esc(w.title)+'</span></button></div></div>';
  }).join('')+'</div>';
}
function roomHTML(){
  return '<div class="room3d" id="room3d"><div class="cv" id="cv3"></div><div class="rload" id="rload" aria-hidden="true"><i id="rlb"></i></div><div class="roomcap"><p class="mono kick">You are walking past</p><h1 id="rt">&nbsp;</h1><a class="enter" id="re" href="#shop">Enter the collection &rarr;</a></div><button class="rb rl" id="rprev" aria-label="Previous collection">&larr;</button><button class="rb rr" id="rnext" aria-label="Next collection">&rarr;</button><button class="pill rsnd" id="rsnd" aria-pressed="false">Sound off</button><div class="rtip mono" id="rtip" hidden></div><canvas class="rmini" id="rmini" aria-label="Floor plan: click a collection to go there"></canvas><div class="rpad" id="rpad" aria-label="Walking controls"><button data-k="f" aria-label="Walk forward">&#9650;</button><button data-k="tl" aria-label="Turn left">&#9664;</button><button data-k="b" aria-label="Walk back">&#9660;</button><button data-k="tr" aria-label="Turn right">&#9654;</button></div><p class="mono rh">Drag to look around &middot; Scroll or W A S D to walk &middot; Click a print to open it &middot; Flip the wall switch for lights off</p></div>';
}
function vIndex(){
  if(st.homeGrid)return vHomeGrid();
  if(st.view==='list'||st.flat)return vIndexLines();
  return '<div class="bar" style="justify-content:space-between"><button class="pill" data-flat="1">Flat view</button>'+seg()+'</div>'+roomHTML();
}
function vIndexLines(){
  var bar='<div class="bar" style="justify-content:space-between">'+(st.view==='list'?'<span></span>':'<button class="pill" data-flat="0">Walk the room</button>')+seg()+'</div>';
  if(st.view==='list')return bar+listHTML(SERIES);
  if(true)return bar+museumHTML()+'<p class="hint mono" style="text-align:center">Scroll sideways to walk the hall<br>Click a print to look closer</p>';
  return bar+(st.home==='wall'?wallHTML():'<div class="lines">'+SERIES.map(lineHTML).join('')+'</div>')+'<p class="hint mono" style="text-align:center">Touch a print to set it swinging<br>'+(st.home==='wall'?'Every print hangs from its own nail':'Drag along the line to move')+'</p>';
}
var hang=[],raf=0,tPrev=0,openTimer=0;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function kick(h,imp){h.w=Math.max(-5,Math.min(5,h.w+imp*(RM?.35:1)))}
function loop(ts){
  var dt=Math.min(.033,(ts-tPrev)/1000||.016);tPrev=ts;
  hang=hang.filter(function(h){return h.el.isConnected});
  if(!hang.length){raf=0;return}
  var T=ts/1000;
  hang.forEach(function(h){
    var wind=RM?0:Math.sin(T*.9+h.ph)*.32+Math.sin(T*.37+h.ph*2)*.2;
    var a=-14*(h.th-h.rest)-.9*h.w+wind;
    h.w+=a*dt;h.th+=h.w*dt;
    if(h.th>1){h.th=1;h.w*=-.3}else if(h.th<-1){h.th=-1;h.w*=-.3}
    h.el.style.transform='rotate('+h.th.toFixed(4)+'rad)';
  });
  raf=requestAnimationFrame(loop);
}
function bindLines(){
  hang=[];
  document.querySelectorAll('.strip').forEach(function(strip){
    var group=[];
    strip.querySelectorAll('.swing').forEach(function(el,i){
      var h={el:el,th:0,w:0,rest:(Math.random()-.5)*.05,ph:Math.random()*6.28};
      group.push(h);hang.push(h);
      var pr=el.querySelector('.print');
      pr.addEventListener('pointerdown',function(e){
        var r=pr.getBoundingClientRect(),d=(e.clientX-(r.left+r.width/2))/(r.width/2);
        var imp=(d>=0?1:-1)*2.4*(.5+Math.min(1,Math.abs(d))*.5);
        kick(h,imp);
        if(group[i-1])kick(group[i-1],imp*.3);
        if(group[i+1])kick(group[i+1],imp*.3);
      });
      pr.addEventListener('pointermove',function(e){
        if(e.pointerType!=='mouse'||!e.movementX)return;
        kick(h,e.movementX*.06);
      });
      pr.addEventListener('click',function(){
        clearTimeout(openTimer);var id=+pr.dataset.hang;
        openTimer=setTimeout(function(){openWork(id)},420);
      });
    });
    var last=strip.scrollLeft;
    strip.addEventListener('scroll',function(){
      var dx=strip.scrollLeft-last;last=strip.scrollLeft;
      group.forEach(function(h,i){kick(h,-dx*.02*(1+.15*Math.sin(i*1.7)))});
    },{passive:true});
  });
  if(!raf){tPrev=performance.now();raf=requestAnimationFrame(loop)}
}


/* 3D walk-round gallery: one sector per series, prints on a wall and on a line */
var S=null;
function isDark(){var r=document.documentElement;return r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches}
function disposeScene(){
  if(!S)return;var o=S;S=null;
  cancelAnimationFrame(o.raf);clearTimeout(openTimer);clearTimeout(o.loadT);
  try{o.ro.disconnect();o.mo.disconnect();o.mq.removeEventListener('change',o.theme)}catch(e){}
  try{if(o.snd)o.snd.ac.close()}catch(e){}
  o.scene.traverse(function(n){if(n.geometry)n.geometry.dispose();if(n.material){if(n.material.map)n.material.map.dispose();n.material.dispose()}});
  o.r.dispose();
}
var LM=null;
function disposeList(){if(!LM)return;cancelAnimationFrame(LM.raf);if(LM.io)LM.io.disconnect();LM=null}
function initList(){
  var root=document.querySelector('.llist');if(!root)return;
  var els=root.querySelectorAll('.rv'),o=LM={raf:0,v:0,y:window.scrollY,io:null};
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  o.io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.io.unobserve(e.target)}})},{rootMargin:'0px 0px -4% 0px'});
  els.forEach(function(e){o.io.observe(e)});
  if(RM)return;
  var rows=root.querySelectorAll('.lrows');
  (function tick(){
    if(LM!==o)return;
    var y=window.scrollY,dv=y-o.y;o.y=y;o.v+=(dv-o.v)*.16;
    var sk=Math.max(-2.5,Math.min(2.5,-o.v*.1));if(Math.abs(sk)<.01)sk=0;
    rows.forEach(function(r){r.style.setProperty('--sk',sk.toFixed(3)+'deg')});
    o.raf=requestAnimationFrame(tick);
  })();
}
var TAU=Math.PI*2;
function walk(d){if(S&&S.go)S.go((S.idx<0?0:S.idx)+d)}
function sceneFallback(){st.flat=true;rerender()}
function initScene(){
  var host=$('#cv3'),room=$('#room3d');if(!host)return;
  var T=window.THREE,r;
  if(!T){sceneFallback();return}
  try{r=new T.WebGLRenderer({antialias:true})}catch(e){sceneFallback();return}
  var lite=window.innerWidth<700||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var dom=r.domElement,scene=new T.Scene(),cam=new T.PerspectiveCamera(55,1,.1,60);
  r.outputEncoding=T.sRGBEncoding;r.setPixelRatio(Math.min(window.devicePixelRatio||1,lite?1.5:2));host.appendChild(r.domElement);
  function col(h){return new T.Color(h).convertSRGBToLinear()}
  var RMo=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var themed=[];
  function themedMat(m,l,d){themed.push({m:m,l:l,d:d});return m}

  /* textures made in code: plaster noise, soft shadow, light pool */
  function noiseTex(){
    var N=512,c=document.createElement('canvas');c.width=c.height=N;var x=c.getContext('2d'),i,g,px,py,r;
    x.fillStyle='rgb(252,252,250)';x.fillRect(0,0,N,N);
    for(i=0;i<70;i++){px=Math.random()*N;py=Math.random()*N;r=40+Math.random()*120;g=x.createRadialGradient(px,py,0,px,py,r);
      g.addColorStop(0,(Math.random()<.5?'rgba(222,221,215,':'rgba(255,255,255,')+(.05+Math.random()*.07)+')');g.addColorStop(1,'rgba(240,240,236,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}
    var id=x.getImageData(0,0,N,N),d=id.data,v;
    for(i=0;i<d.length;i+=4){v=(Math.random()-.5)*12;d[i]+=v;d[i+1]+=v;d[i+2]+=v}
    x.putImageData(id,0,0);
    var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(30,3);t.anisotropy=4;t.encoding=T.sRGBEncoding;return t;
  }
  function shadowTex(){
    var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
    x.shadowColor='rgba(0,0,0,1)';x.shadowBlur=22;x.shadowOffsetX=1000;x.fillStyle='#000';x.fillRect(32-1000,32,64,64);
    return new T.CanvasTexture(c);
  }
  function poolTex(){
    var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');
    x.save();x.translate(128,64);x.scale(1,1.15);var g=x.createRadialGradient(0,0,6,0,0,124);
    g.addColorStop(0,'rgba(255,240,208,1)');g.addColorStop(.45,'rgba(255,240,208,.42)');g.addColorStop(1,'rgba(255,240,208,0)');
    x.fillStyle=g;x.fillRect(-128,-80,256,300);x.restore();
    var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;
  }

  /* room: a round gallery, one painted colour per collection, picture rail, tiled floor */
  var PAL=[0xffffff];
  function tileTex(){
    var N=512,c=document.createElement('canvas');c.width=c.height=N;var x=c.getContext('2d');
    x.fillStyle='#ecebe8';x.fillRect(0,0,N,N);
    var i,g,px,py,r,a;
    for(i=0;i<46;i++){px=Math.random()*N;py=Math.random()*N;r=40+Math.random()*110;a=.025+Math.random()*.04;
      g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,(Math.random()<.5?'rgba(120,118,112,':'rgba(255,255,255,')+a*1.6+')');g.addColorStop(1,'rgba(128,128,128,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}
    var id=x.getImageData(0,0,N,N),d=id.data,v;
    for(i=0;i<d.length;i+=4){v=(Math.random()-.5)*16;d[i]+=v;d[i+1]+=v;d[i+2]+=v}
    x.putImageData(id,0,0);
    x.fillStyle='rgba(0,0,0,.05)';for(i=0;i<260;i++)x.fillRect(Math.random()*N,Math.random()*N,1+Math.random()*1.5,1+Math.random()*1.5);
    var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4,4);t.anisotropy=4;t.encoding=T.sRGBEncoding;return t;
  }
  function woodTex(){
    var W=512,H=512,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d'),n=6,pw=W/n,i,j;
    var base=['#8b5a36','#7d4e2c','#946238','#845532','#764a2a','#8f5d37'];
    for(i=0;i<n;i++){
      var g=x.createLinearGradient(i*pw,0,(i+1)*pw,0);g.addColorStop(0,base[i]);g.addColorStop(.5,base[(i+2)%n]);g.addColorStop(1,base[i]);
      x.fillStyle=g;x.fillRect(i*pw,0,pw,H);
      for(j=0;j<46;j++){
        var gx=i*pw+4+Math.random()*(pw-8),a=Math.random()*.16+.04,ph=Math.random()*6.28,am=1+Math.random()*3;
        x.strokeStyle=(Math.random()<.5?'rgba(40,22,10,':'rgba(210,160,110,')+a+')';x.lineWidth=.6+Math.random()*1.3;x.beginPath();
        for(var y=0;y<=H;y+=16){var xx=gx+Math.sin(y*.02+ph)*am;if(y===0)x.moveTo(xx,y);else x.lineTo(xx,y)}
        x.stroke();
      }
      if(Math.random()<.7){var ky=Math.random()*H,kx=i*pw+pw*.5;x.fillStyle='rgba(50,28,12,.28)';x.beginPath();x.ellipse(kx,ky,6,11,0,0,6.28);x.fill();x.strokeStyle='rgba(40,22,10,.22)';x.lineWidth=1.2;x.beginPath();x.ellipse(kx,ky,10,19,0,0,6.28);x.stroke()}
      x.fillStyle='rgba(20,10,4,.55)';x.fillRect(i*pw,0,2.5,H);
      x.fillStyle='rgba(255,230,190,.1)';x.fillRect(i*pw+2.5,0,1.5,H);
    }
    var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,1);t.anisotropy=4;t.encoding=T.sRGBEncoding;return t;
  }
  var LV=(DATA.room&&DATA.room.light!=null)?DATA.room.light:25;
  function washTex(){
    var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
    g.addColorStop(0,'rgba(255,244,214,1)');g.addColorStop(.3,'rgba(255,244,214,.45)');g.addColorStop(.75,'rgba(255,244,214,0)');
    x.fillStyle=g;x.fillRect(0,0,4,256);var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;
  }
  var washM=new T.MeshBasicMaterial({map:washTex(),transparent:true,opacity:Math.min(1,LV/100*2),depthWrite:false,side:T.BackSide});
  var NSr=SERIES.length,STEP0=TAU/NSr,rwalls=[],rdados=[],nz=noiseTex();nz.repeat.set(3,2);
  SERIES.forEach(function(sr,si){
    var ts=Math.PI-(si+.5)*STEP0,wm=new T.MeshLambertMaterial({color:0xffffff,map:nz,side:T.BackSide}),dm=new T.MeshLambertMaterial({color:0xffffff,side:T.BackSide});
    var w=new T.Mesh(new T.CylinderGeometry(11,11,4.1,24,1,true,ts,STEP0),wm);w.position.y=3.95;scene.add(w);
    var d=new T.Mesh(new T.CylinderGeometry(10.99,10.99,1.9,24,1,true,ts,STEP0),dm);d.position.y=.95;scene.add(d);
    var pc=(DATA.room&&DATA.room.walls&&DATA.room.walls[sr.id])?parseInt(DATA.room.walls[sr.id].slice(1),16):PAL[si%PAL.length];rwalls.push({m:wm,c:pc});rdados.push({m:dm,c:pc});
  });
  var aoC=document.createElement('canvas');aoC.width=4;aoC.height=256;
  (function(){var x=aoC.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(120,116,104,.13)');g.addColorStop(.18,'rgba(120,116,104,.04)');g.addColorStop(.35,'rgba(70,64,52,0)');g.addColorStop(.86,'rgba(70,64,52,0)');g.addColorStop(1,'rgba(120,116,104,.11)');x.fillStyle=g;x.fillRect(0,0,4,256)})();
  var aoT=new T.CanvasTexture(aoC);aoT.encoding=T.sRGBEncoding;
  var aoM=new T.Mesh(new T.CylinderGeometry(10.985,10.985,4.1,48,1,true),new T.MeshBasicMaterial({map:aoT,transparent:true,depthWrite:false,side:T.BackSide}));aoM.position.y=3.95;aoM.renderOrder=1;scene.add(aoM);
  var floorM=new T.MeshLambertMaterial({color:0xffffff,map:tileTex(),transparent:!lite,opacity:lite?1:.86,depthWrite:!!lite}),ceilM=new T.MeshBasicMaterial({color:0xffffff});
  var wall={material:{color:new T.Color()}},baseM={color:new T.Color()},wallM={color:new T.Color()};
  var floor=new T.Mesh(new T.CircleGeometry(11,64),floorM);floor.rotation.x=-Math.PI/2;floor.renderOrder=2;scene.add(floor);
  var ceil=new T.Mesh(new T.CircleGeometry(11,64),ceilM);ceil.rotation.x=Math.PI/2;ceil.position.y=6;scene.add(ceil);
  var railM=new T.MeshBasicMaterial({color:col(0xd8c9a0),side:T.BackSide});
  var rail=new T.Mesh(new T.CylinderGeometry(10.97,10.97,.09,64,1,true),railM);rail.position.y=1.9;
  var coveM=new T.MeshBasicMaterial({color:0xfff4d6,side:T.BackSide}),cove=new T.Mesh(new T.CylinderGeometry(10.96,10.96,.22,64,1,true),coveM);cove.position.y=5.9;scene.add(cove);
  var bbM=new T.MeshLambertMaterial({color:col(0xe9e6de),side:T.BackSide}),bb=new T.Mesh(new T.CylinderGeometry(10.97,10.97,.26,64,1,true),bbM);bb.position.y=.13;scene.add(bb);
  var bbL=new T.Mesh(new T.CylinderGeometry(10.95,10.95,.035,64,1,true),new T.MeshLambertMaterial({color:col(0xd9d5ca),side:T.BackSide}));bbL.position.y=.28;scene.add(bbL);
  var benchM=new T.MeshLambertMaterial({color:col(0xcdbd9c)}),benchD=new T.MeshLambertMaterial({color:col(0x3a3a38)});
  var bench=new T.Group(),bTop=new T.Mesh(new T.BoxGeometry(2.8,.1,.78),benchM);bTop.position.y=.5;bench.add(bTop);
  [-1.15,1.15].forEach(function(bx){var lg=new T.Mesh(new T.BoxGeometry(.12,.45,.66),benchD);lg.position.set(bx,.225,0);bench.add(lg)});
  scene.add(bench);

  /* lighting: soft room fill, one ceiling lamp per collection washing its wall, a lamp over the centre, a glowing ceiling disc */
  var hemi=new T.HemisphereLight(0xffffff,0xcfcfcf,1.05);scene.add(hemi);
  /* lights-off mode: a pool of spotlights that follow the prints nearest the camera, each with a faint beam */
  var NL=lite?3:6,spots=[],SPA=.34;
  for(var li=0;li<NL;li++){
    var sp=new T.SpotLight(0xffffff,0,18,SPA,.85,1),tg=new T.Object3D();scene.add(tg);sp.target=tg;scene.add(sp);
    var cg=new T.ConeGeometry(Math.tan(SPA),1,28,1,true);cg.translate(0,-.5,0);
    var cm=new T.Mesh(cg,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));cm.visible=false;scene.add(cm);
    spots.push({l:sp,t:tg,c:cm,it:null,k:0});
  }
  var swMeshes=[],swRock=[],swPlateM=new T.MeshBasicMaterial({color:col(0xf1eee4)}),swKnobM=new T.MeshBasicMaterial({color:col(0x2b2b29)}),swDotM=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.2});
  var ropeM=themedMat(new T.MeshBasicMaterial({color:0xffffff}),0xe8dcc0,0xb9aa80);
  var strM=themedMat(new T.LineBasicMaterial({color:0xffffff}),0xe8dcc0,0xb9aa80);
  var nailM=themedMat(new T.MeshBasicMaterial({color:0xffffff}),0xe8dcc0,0xb9aa80);
  var pilM=themedMat(new T.MeshLambertMaterial({color:0xffffff}),0xf3f3f1,0x333332);
  function sheenTex(){
    var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,256,256);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.22,'rgba(255,255,255,0)');g.addColorStop(.3,'rgba(255,255,255,.34)');g.addColorStop(.38,'rgba(255,255,255,.05)');
    g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(.62,'rgba(255,255,255,.16)');g.addColorStop(.68,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,256,256);var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;return t;
  }
  function glareTex(){
    var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,128,128);var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;
  }
  var glareT=glareTex(),sheen=sheenTex(),glassM=new T.MeshBasicMaterial({map:sheen,color:0xffffff,transparent:true,opacity:.9,depthWrite:false}),bevM=null;
  var frameDark=new T.MeshLambertMaterial({color:col(0x0a0a09)}),frameLight=new T.MeshLambertMaterial({color:col(0xe4e1da)}),matM=new T.MeshBasicMaterial({color:col(0xfbfbfa)});
  var shadowM=new T.MeshBasicMaterial({map:shadowTex(),color:0x000000,transparent:true,opacity:.5,depthWrite:false});
  var poolM=new T.MeshBasicMaterial({map:poolTex(),transparent:true,opacity:.45,depthWrite:false});

  /* loading */
  var mgr=new T.LoadingManager(),loader=new T.TextureLoader(mgr),lb=$('#rlb'),ld=$('#rload');
  function hideLoad(){if(ld)ld.style.opacity='0'}
  mgr.onProgress=function(u,l,t){if(lb)lb.style.width=Math.round(l/Math.max(1,t)*100)+'%'};
  mgr.onLoad=hideLoad;

  var H=1.45,RW=10.9,RL=5,items=[],meshes=[],slots=[],titles=[],idxN=0;
  var labels=[];
  function drawLabel(l){
    var x=l.c.getContext('2d'),w=l.w;x.clearRect(0,0,512,160);x.fillStyle='#fbfaf6';x.fillRect(0,0,512,160);x.strokeStyle='#cfcbc0';x.lineWidth=3;x.strokeRect(1.5,1.5,509,157);
    x.fillStyle='#161614';x.textBaseline='alphabetic';var fs=44,f='"Dela Gothic One",Impact,sans-serif';x.font='400 '+fs+'px '+f;
    var title=w.title+' '+w.no;while(x.measureText(title).width>468&&fs>24){fs-=2;x.font='400 '+fs+'px '+f}
    x.fillText(title,22,62);x.fillStyle='#5a5a56';x.font='500 24px "IBM Plex Mono",ui-monospace,monospace';x.fillText(w.series.name+' \u00b7 '+w.series.year,22,104);
    x.fillStyle='#161614';x.font='600 26px "IBM Plex Mono",ui-monospace,monospace';x.fillText('From '+money(wprice(w,0)),22,142);
    l.t.needsUpdate=true;
  }
  function mkPrint(w,sc,wallMode){
    var Hh=H*sc,Ww=Hh/w.ratio,drop=.07,cy=-drop-Hh/2,g=new T.Group();
    var pm=new T.MeshBasicMaterial({color:0x777777}),m=new T.Mesh(new T.PlaneGeometry(Ww,Hh),pm);m.position.set(0,cy,.012);
    var fr=new T.Mesh(new T.BoxGeometry(Ww+.3,Hh+.3,.07),frameDark);fr.position.set(0,cy,0);
    var mt=new T.Mesh(new T.PlaneGeometry(Ww+.14,Hh+.14),matM);mt.position.set(0,cy,.036);
    var gl=new T.Mesh(new T.PlaneGeometry(Ww+.14,Hh+.14),glassM);gl.position.set(0,cy,.046);gl.renderOrder=6;
    m.position.set(0,cy,.04);
    var gs=Math.min(Ww,Hh)*.8,glr=new T.Mesh(new T.PlaneGeometry(gs,gs),new T.MeshBasicMaterial({map:glareT,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));
    glr.position.set(0,cy+Hh*.2,.048);glr.renderOrder=7;
    g.add(fr,mt,m,gl,glr);
    if(wallMode){
      var sh=new T.Mesh(new T.PlaneGeometry((Ww+.46)/.5,(Hh+.46)/.5),shadowM);sh.position.set(.09,cy-.13,-.03);g.add(sh);
      var lc=document.createElement('canvas');lc.width=512;lc.height=160;var ltx=new T.CanvasTexture(lc);ltx.encoding=T.sRGBEncoding;
      var lbM=new T.MeshBasicMaterial({map:ltx,transparent:true,opacity:0,depthWrite:false}),lbl=new T.Mesh(new T.PlaneGeometry(.95,.95*160/512),lbM);
      lbl.position.set(0,cy-Hh/2-.36,.02);lbl.renderOrder=6;lbl.visible=false;g.add(lbl);labels.push({w:w,c:lc,t:ltx});drawLabel(labels[labels.length-1]);
    }else{
      var peg=new T.Mesh(new T.BoxGeometry(.05,.16,.04),nailM);peg.position.set(0,-.03,.06);g.add(peg);
    }
    var it={g:g,m:m,pm:pm,w:w,sc:sc,Ww:Ww,Hh:Hh,cy:cy,wall:wallMode,th:0,om:0,rest:0,ph:Math.random()*6.28,gl:0,loaded:false,rm:null,rg:null,place:null,rplace:null,py:0,phi:0};
    it.glr=glr;it.lbM=(typeof lbM!=='undefined'&&wallMode)?lbM:null;it.lbl=(typeof lbl!=='undefined'&&wallMode)?lbl:null;m.userData.item=it;items.push(it);meshes.push(m);
    if(!lite){
      var rg=new T.Group(),rm=new T.MeshBasicMaterial({color:0x777777,transparent:true,opacity:.55,depthWrite:false});
      var rp=new T.Mesh(m.geometry,rm);rp.position.copy(m.position);rp.renderOrder=1;
      var rmt=new T.Mesh(mt.geometry,new T.MeshBasicMaterial({color:col(0xfbfbfa),transparent:true,opacity:.4,depthWrite:false}));rmt.position.copy(mt.position);rmt.renderOrder=1;
      rg.add(rmt,rp);it.rg=rg;it.rm=rm;
    }
    loader.load(w.img,function(tx){tx.encoding=T.sRGBEncoding;tx.anisotropy=4;pm.map=tx;pm.needsUpdate=true;if(it.rm){it.rm.map=tx;it.rm.needsUpdate=true}it.loaded=true});
    return it;
  }
  function put(it,phi,rad,y){
    var p=new T.Group();p.position.set(Math.sin(phi)*rad,y,-Math.cos(phi)*rad);p.rotation.y=-phi;p.add(it.g);scene.add(p);
    it.place=p;it.phi=phi;it.py=y;
    if(it.wall){var pl=new T.Mesh(new T.PlaneGeometry((it.Ww+1.5)*1.143,(it.Hh+1.5)*1.143),poolM);pl.position.set(0,it.cy+.12,-.045);pl.renderOrder=1;p.add(pl)}
    if(it.rg){var q=new T.Group();q.position.set(Math.sin(phi)*rad,-y,-Math.cos(phi)*rad);q.rotation.y=-phi;q.scale.y=-1;q.add(it.rg);scene.add(q);it.rplace=q}
  }
  function mkTitle(sr,si,a){
    var c=document.createElement('canvas');c.width=1024;c.height=220;
    var tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;
    var pm=new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}),pl=new T.Mesh(new T.PlaneGeometry(6,6*220/1024),pm);
    var p=new T.Group();p.position.set(Math.sin(a)*(RW-.03),4.5,-Math.cos(a)*RW);p.rotation.y=-a;pl.position.z=.02;pl.renderOrder=5;p.add(pl);scene.add(p);
    var t={c:c,tx:tx,text:sr.name,no:si+1};titles.push(t);drawTitle(t);
  }
  function drawTitle(t){
    var x=t.c.getContext('2d');x.clearRect(0,0,1024,220);x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=10;x.shadowOffsetY=2;x.fillStyle='#fffdf7';x.textAlign='center';x.textBaseline='alphabetic';
    x.font='500 26px "IBM Plex Mono",ui-monospace,monospace';x.fillText('ROOM '+t.no+' / '+SERIES.length,512,44);
    var fs=104;x.font='400 '+fs+'px "Dela Gothic One",Impact,sans-serif';
    while(x.measureText(t.text).width>960&&fs>36){fs-=6;x.font='400 '+fs+'px "Dela Gothic One",Impact,sans-serif'}
    x.fillText(t.text,512,170);t.tx.needsUpdate=true;
  }

  var STEP=TAU/SERIES.length;
  SERIES.forEach(function(sr,si){
    var a=si*STEP,ws=WORKS.filter(function(w){return w.series===sr});
    /* wall titles removed */
    var gap=.7,tw=ws.reduce(function(sm,w){return sm+H/w.ratio},0)+gap*Math.max(0,ws.length-1),avail=STEP*RW*.86,k=Math.min(1,avail/Math.max(tw,.1)),pos=-tw*k/2;
    ws.forEach(function(w){
      var Wd=H*k/w.ratio,c=pos+Wd/2;pos+=Wd+gap*k;
      var phi=a+c/RW,it=mkPrint(w,k,true);
      put(it,phi,RW,1.8+.07+H*k/2);slots.push(phi);
    });
    var sa=a+(tw*k/2+.95)/RW,swg=new T.Group(),plate=new T.Mesh(new T.BoxGeometry(.22,.34,.03),swPlateM),rock=new T.Mesh(new T.BoxGeometry(.075,.14,.05),swKnobM);
    plate.position.z=.015;rock.position.z=.04;var dot=new T.Mesh(new T.CircleGeometry(.018,12),swDotM);dot.position.set(0,.14,.032);swg.add(plate,rock,dot);swg.position.set(Math.sin(sa)*(RW-.02),1.5,-Math.cos(sa)*(RW-.02));swg.rotation.y=-sa;scene.add(swg);
    swMeshes.push(plate,rock);swRock.push(rock);
  });

  var ray=new T.Raycaster(),ndc=new T.Vector2();
  function pick(e){var b=dom.getBoundingClientRect();ndc.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);ray.setFromCamera(ndc,cam);var sh=ray.intersectObjects(swMeshes,false)[0];if(sh)return{sw:true};var h=ray.intersectObjects(meshes,false)[0];return h?{it:h.object.userData.item,u:h.uv.x}:null}
  function kick(it,imp){}
  var o=S={r:r,scene:scene,px:0,pz:-2.2,tx:0,tz:-2.2,yaw:0,yawT:0,keys:{},fz:0,focus:null,lastIn:performance.now(),dk:0,dkT:0,snapped:true,t:performance.now(),idx:-1,raf:0,hover:null,snd:null};
  var NS=SERIES.length;
  function goSection(i){
    i=((i%NS)+NS)%NS;var a2=i*STEP;o.focus=null;clearTimeout(openTimer);
    o.tx=Math.sin(a2)*2.2;o.tz=-Math.cos(a2)*2.2;o.yawT=a2+Math.round((o.yaw-a2)/TAU)*TAU;
  }
  o.go=goSection;
  o.release=function(){o.focus=null};
  function focusOn(it){
    o.focus=it;var rr=RW-3.3;o.tx=Math.sin(it.phi)*rr;o.tz=-Math.cos(it.phi)*rr;o.yawT=it.phi+Math.round((o.yaw-it.phi)/TAU)*TAU;
    clearTimeout(openTimer);var id=it.w.id;openTimer=setTimeout(function(){openWork(id)},300);
  }

  function applyTheme(){
    var d=isDark();
    var kk=d?.42:1;hemi.intensity=d?.5:1.05;
    rwalls.forEach(function(w){var c1=col(w.c);c1.multiplyScalar(kk);w.m.color.copy(c1)});
    rdados.forEach(function(w){var c2=col(w.c);c2.multiplyScalar(kk);w.m.color.copy(c2)});
    floorM.color.copy(col(d?0x6a6a6a:0xffffff));ceilM.color.copy(col(d?0x1b1b1a:0xf6f1e6));railM.color.copy(col(d?0x8a7d58:0xd8c9a0));coveM.color.copy(col(d?0x8a8272:0xfff4d6));
    scene.background=col(d?0x050505:0x222222);
    themed.forEach(function(t){t.m.color.copy(col(d?t.d:t.l))});
    titles.forEach(drawTitle);
  }
  applyTheme();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(S===o)labels.forEach(drawLabel)}).catch(function(){});
  if(document.fonts&&document.fonts.load){document.fonts.load('104px "Dela Gothic One"').then(function(){if(S===o)titles.forEach(drawTitle)}).catch(function(){})}
  o.theme=applyTheme;o.mq=matchMedia('(prefers-color-scheme:dark)');o.mq.addEventListener('change',applyTheme);
  o.mo=new MutationObserver(applyTheme);o.mo.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  function size(){var w=host.clientWidth||600,h=host.clientHeight||440;r.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<.9?44:30;cam.updateProjectionMatrix()}
  size();o.ro=new ResizeObserver(size);o.ro.observe(host);
  o.loadT=setTimeout(hideLoad,12000);
  function caption(i){var sr=SERIES[i];if(!sr)return;$('#rt').textContent=sr.name;$('#re').setAttribute('href','#s-'+sr.slug);var mp=$('#rmap');if(mp)mp.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.i===i))})}
  var pad=$('#rpad');
  if(pad){
    var pk=function(e,v){var b=e.target.closest('button');if(!b)return;e.preventDefault();o.keys[b.dataset.k]=v;if(v){o.focus=null;clearTimeout(openTimer)}};
    pad.addEventListener('pointerdown',function(e){pk(e,true);try{e.target.setPointerCapture(e.pointerId)}catch(x){}});
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){pad.addEventListener(n,function(){o.keys.f=o.keys.b=o.keys.tl=o.keys.tr=false})});
  }
  var mp0=$('#rmap');if(mp0){mp0.innerHTML=SERIES.map(function(sr,i){return '<button data-i="'+i+'" aria-pressed="false">'+(i+1)+' '+esc(sr.name)+'</button>'}).join('');mp0.addEventListener('click',function(e){var b=e.target.closest('button');if(b)goSection(+b.dataset.i)})}
  $('#rprev').addEventListener('click',function(){walk(-1)});
  $('#rnext').addEventListener('click',function(){walk(1)});

  /* sound: quiet room tone, off until asked */
  var sb=$('#rsnd');
  if(sb)sb.addEventListener('click',function(){
    try{
      if(!o.snd){
        var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        var ac=new AC(),len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),dd=buf.getChannelData(0),last=0,i,wv;
        for(i=0;i<len;i++){wv=Math.random()*2-1;last=(last+.02*wv)/1.02;dd[i]=last*3.2}
        var src=ac.createBufferSource();src.buffer=buf;src.loop=true;
        var lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=360;
        var gn=ac.createGain();gn.gain.value=0;src.connect(lp);lp.connect(gn);gn.connect(ac.destination);src.start();
        o.snd={ac:ac,g:gn,on:false};
      }
      o.snd.on=!o.snd.on;if(o.snd.ac.resume)o.snd.ac.resume();
      o.snd.g.gain.setTargetAtTime(o.snd.on?.16:0,o.snd.ac.currentTime,.3);
      sb.textContent=o.snd.on?'Sound on':'Sound off';sb.setAttribute('aria-pressed',String(o.snd.on));
    }catch(e){}
  });

  /* input: drag or scroll to walk, drag up/down (mouse) to move in and out, click to step up to a print */
  var down=null,tip=$('#rtip');
  function tipShow(it,e){
    if(!tip)return;if(!it){tip.hidden=true;return}
    var b=room.getBoundingClientRect();tip.textContent=it.w.title+' · '+money(wprice(it.w,0));
    tip.style.left=Math.min(e.clientX-b.left,b.width-170)+'px';tip.style.top=(e.clientY-b.top)+'px';tip.hidden=false;
  }
  function swTip(e){if(!tip)return;var b=room.getBoundingClientRect();tip.textContent=o.dkT?'Lights on':'Lights off';tip.style.left=Math.min(e.clientX-b.left,b.width-170)+'px';tip.style.top=(e.clientY-b.top)+'px';tip.hidden=false}
  dom.addEventListener('pointerdown',function(e){
    down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,touch:e.pointerType==='touch'};try{dom.setPointerCapture(e.pointerId)}catch(x){}
    room.style.cursor='grabbing';tipShow(null);
  });
  dom.addEventListener('pointermove',function(e){
    if(down){
      var dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);
      if(down.moved>6){o.focus=null;clearTimeout(openTimer)}
      o.yawT-=dx*.005;
      var mv=-dy*.025,sy=Math.sin(o.yawT),cw=Math.cos(o.yawT);o.tx+=sy*mv;o.tz+=-cw*mv;
      o.lastIn=performance.now();return;
    }
    if(e.pointerType==='touch')return;
    var h=pick(e);room.style.cursor=h?'pointer':'grab';
    if(h&&h.sw){o.hover=null;swTip(e);return}
    if(h&&h.it!==o.hover)kick(h.it,(e.movementX>=0?1:-1)*1.1);
    o.hover=h?h.it:null;tipShow(o.hover,e);
  });
  dom.addEventListener('pointerleave',function(){if(!down){o.hover=null;tipShow(null)}});
  dom.addEventListener('pointerup',function(e){
    if(!down)return;var moved=down.moved;down=null;room.style.cursor='grab';o.lastIn=performance.now();
    if(moved<6){var h=pick(e);if(h&&h.sw){o.dkT=o.dkT?0:1;swTip(e);return}if(h){kick(h.it,(h.u>=.5?1:-1)*2.4);focusOn(h.it)}else{var fh=ray.intersectObject(floor,false)[0];if(fh){o.focus=null;clearTimeout(openTimer);var fx=fh.point.x,fz=fh.point.z,fr=Math.hypot(fx,fz);if(fr>9.9){fx*=9.9/fr;fz*=9.9/fr}o.tx=fx;o.tz=fz}}}
  });
  dom.addEventListener('pointercancel',function(){down=null;room.style.cursor='grab'});
  dom.addEventListener('wheel',function(e){
    e.preventDefault();var k=e.deltaMode===1?16:1;o.focus=null;clearTimeout(openTimer);
    var mv=e.deltaY*k*.006,sy=Math.sin(o.yawT),cw=Math.cos(o.yawT);o.tx+=sy*mv;o.tz+=-cw*mv;o.yawT+=e.deltaX*k*.003;
    o.lastIn=performance.now();
  },{passive:false});

  var mini=$('#rmini'),mx=mini&&mini.getContext&&mini.getContext('2d'),MS=118;
  if(mini){mini.width=MS*2;mini.height=MS*2;mini.addEventListener('click',function(e){var b=mini.getBoundingClientRect(),x=e.clientX-b.left-MS/2,y=e.clientY-b.top-MS/2;goSection(Math.round(Math.atan2(x,-y)/STEP))})}
  function drawMini(ci){
    if(!mx)return;var d=isDark(),ink=d?'#f2f2f0':'#111110',cx=MS/2,cy=MS/2,k=(MS/2-6)/11,R=11*k;
    mx.setTransform(2,0,0,2,0,0);mx.clearRect(0,0,MS,MS);
    mx.fillStyle=d?'rgba(10,10,10,.72)':'rgba(255,255,255,.78)';mx.beginPath();mx.arc(cx,cy,R+3,0,6.2832);mx.fill();
    mx.strokeStyle=ink;mx.lineWidth=1.5;mx.beginPath();mx.arc(cx,cy,R,0,6.2832);mx.stroke();
    SERIES.forEach(function(sr,i){
      var a1=(i-.5)*STEP-Math.PI/2,a2=(i+.5)*STEP-Math.PI/2;
      if(i===ci){mx.fillStyle=ink;mx.globalAlpha=.9;mx.beginPath();mx.arc(cx,cy,R,a1,a2);mx.arc(cx,cy,R*.8,a2,a1,true);mx.closePath();mx.fill();mx.globalAlpha=1}
      mx.strokeStyle=ink;mx.lineWidth=1;mx.beginPath();mx.moveTo(cx+Math.cos(a1)*R*.8,cy+Math.sin(a1)*R*.8);mx.lineTo(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R);mx.stroke();
      var am=i*STEP-Math.PI/2;mx.fillStyle=i===ci?(d?'#111110':'#f2f2f0'):ink;mx.font='600 9px monospace';mx.textAlign='center';mx.textBaseline='middle';mx.fillText(String(i+1),cx+Math.cos(am)*R*.9,cy+Math.sin(am)*R*.9);
    });
    mx.fillStyle=ink;mx.globalAlpha=.35;mx.fillRect(cx-1.4*k,cy-.4*k,2.8*k,.8*k);mx.globalAlpha=1;
    var ux=cx+o.px*k,uy=cy+o.pz*k,ya=o.yaw-Math.PI/2;
    mx.fillStyle=ink;mx.globalAlpha=.28;mx.beginPath();mx.moveTo(ux,uy);mx.arc(ux,uy,26,ya-.42,ya+.42);mx.closePath();mx.fill();mx.globalAlpha=1;
    mx.beginPath();mx.arc(ux,uy,3.2,0,6.2832);mx.fillStyle='#e0341c';mx.fill();
  }
  function dphi(x,y){return Math.abs((((x-y+Math.PI)%TAU)+TAU)%TAU-Math.PI)}
  var Q=STEP;
  function frame(ts){
    if(S!==o)return;
    var dt=Math.min(.033,(ts-o.t)/1000||.016);o.t=ts;
    var kk=o.keys,fw=(kk.f?1:0)-(kk.b?1:0),sd=(kk.r?1:0)-(kk.l?1:0),tn=(kk.tr?1:0)-(kk.tl?1:0),sp=(kk.run?6:3.2)*dt;
    if(fw||sd||tn){o.focus=null;clearTimeout(openTimer)}
    o.yawT+=tn*1.8*dt;
    var sy=Math.sin(o.yawT),cw=Math.cos(o.yawT);
    o.tx+=(sy*fw+cw*sd)*sp;o.tz+=(-cw*fw+sy*sd)*sp;
    var rr=Math.hypot(o.tx,o.tz);if(rr>9.9){o.tx*=9.9/rr;o.tz*=9.9/rr}
    var br=Math.hypot(o.tx,o.tz);if(br<1.8){if(br<.001){o.tx=1.8;o.tz=0}else{o.tx*=1.8/br;o.tz*=1.8/br}}
    var ppx=o.px,ppz=o.pz,kp=Math.min(1,dt*(RMo?12:4.5));
    o.px+=(o.tx-o.px)*kp;o.pz+=(o.tz-o.pz)*kp;o.yaw+=(o.yawT-o.yaw)*Math.min(1,dt*(RMo?12:6));
    o.fz+=((o.focus?1:0)-o.fz)*Math.min(1,dt*(RMo?12:4));
    var spd=Math.hypot(o.px-ppx,o.pz-ppz)/Math.max(dt,.001),sec=ts/1000,bob=RMo?0:Math.sin(sec*9)*.018*Math.min(1,spd/2);
    cam.position.set(o.px,1.6+bob,o.pz);
    var ddx=Math.sin(o.yaw),ddz=-Math.cos(o.yaw),lx=o.px+ddx*10,ly=1.7,lz=o.pz+ddz*10;
    if(o.focus&&o.focus.place){var fp=o.focus.place.position,f=o.fz;lx+=(fp.x-lx)*f;ly+=(fp.y+o.focus.cy-ly)*f;lz+=(fp.z-lz)*f}
    cam.lookAt(lx,ly,lz);
    var bq=o.px*ddx+o.pz*ddz,cq=o.px*o.px+o.pz*o.pz-RW*RW,tt=-bq+Math.sqrt(Math.max(0,bq*bq-cq)),a=Math.atan2(o.px+ddx*tt,-(o.pz+ddz*tt));
    var idx=((Math.round(a/Q)%NS)+NS)%NS;if(idx!==o.idx){o.idx=idx;caption(idx)}
    o.dk+=(o.dkT-o.dk)*Math.min(1,dt*(RMo?12:2.6));var dk=o.dk;
    var RR=DATA.room||{};function tv(k,d){return RR[k]==null?d:+RR[k]}
    var tOn=tv('on',100)/100,tBr=tv('bright',100)/100,tAng=tv('beam',19.5)*Math.PI/180,tW=tv('warm',0)/100,tHz=tv('haze',50)/100,tAm=tv('amb',4)/100;
    var tr=1,tgc=(255-61*tW)/255,tb=(255-133*tW)/255;
    hemi.intensity=(isDark()?.5:1.05)*tOn*(1-dk)+tAm*dk;
    poolM.opacity=tv('pool',45)/100*(1-dk);
    items.forEach(function(it){
      if(!it.lbM||!it.place)return;var pp=it.place.position,dd=Math.hypot(o.px-pp.x,o.pz-pp.z),op=Math.max(0,Math.min(1,(7.5-dd)/2.5));
      it.lbM.opacity=op;it.lbl.visible=op>.01;it.lbM.color.setScalar(1-.55*dk);
    });
    drawMini(o.idx<0?0:o.idx);
    swRock.forEach(function(rk){rk.rotation.x=(dk-.5)*.7});swPlateM.color.setScalar(1-.3*dk);swDotM.opacity=.2+.8*dk;
    if(dk>.004||spots.some(function(sx){return sx.l.intensity>.01})){
      var near=items.slice().sort(function(p,q){return dphi(p.phi,a)-dphi(q.phi,a)}).slice(0,NL);
      spots.forEach(function(sx){if(sx.it&&near.indexOf(sx.it)<0)sx.it=null});
      near.forEach(function(it){if(!spots.some(function(sx){return sx.it===it})){var f=spots.filter(function(sx){return!sx.it})[0];if(f){f.it=it;f.k=0}}});
      spots.forEach(function(sx){
        var it=sx.it;if(!it||!it.place){sx.l.intensity=0;sx.c.visible=false;return}
        sx.k+=(1-sx.k)*Math.min(1,dt*5);
        var ph=it.phi,lx=Math.sin(ph)*(RW-2.3),lz=-Math.cos(ph)*(RW-2.3),pp=it.place.position,tx=pp.x,ty=pp.y+it.cy,tz=pp.z;
        sx.l.position.set(lx,5.6,lz);sx.t.position.set(tx,ty,tz);
        sx.l.intensity=2.2*tBr*dk*sx.k;sx.l.angle=tAng;sx.l.color.setRGB(tr,tgc,tb);sx.c.material.color.setRGB(tr,tgc,tb);
        var dx=tx-lx,dy=ty-5.6,dz=tz-lz,L=Math.sqrt(dx*dx+dy*dy+dz*dz);
        sx.c.visible=dk>.02;sx.c.position.set(lx,5.6,lz);sx.c.scale.set(L*Math.tan(tAng)/Math.tan(SPA),L,L*Math.tan(tAng)/Math.tan(SPA));
        sx.c.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),new T.Vector3(dx/L,dy/L,dz/L));
        sx.c.material.opacity=.15*tHz*dk*sx.k;
      });
    }
    sheen.offset.x=(a*.18)%1;sheen.offset.y=(Math.sin(a)*.05);
    var any=o.hover?1:0;
    items.forEach(function(it){
      var wind=0;
      it.g.rotation.z=0;it.g.rotation.x=0;
      it.gl+=((o.hover===it?1:0)-it.gl)*Math.min(1,dt*8);
      it.g.position.z=0;
      var lk=0;spots.forEach(function(sx){if(sx.it===it)lk=sx.k});
      var dA=((a-it.phi+Math.PI)%TAU+TAU)%TAU-Math.PI;
      it.glr.position.x=Math.max(-it.Ww*.42,Math.min(it.Ww*.42,dA*RW*.45));
      it.glr.material.opacity=.6*dk*lk;
      var sh=(1-.24*any*(1-it.gl))*(it.loaded?1:.55);
      it.pm.color.setScalar(sh);
      if(it.rg){it.rg.rotation.z=it.th;it.rg.rotation.x=it.th*.22;it.rg.position.z=it.g.position.z;it.rm.color.setScalar(sh)}
    });
    r.render(scene,cam);
    o.raf=requestAnimationFrame(frame);
  }
  o.raf=requestAnimationFrame(frame);
}

/* museum hall: a long white wall with framed prints, picture lights and wall labels */
function museumHTML(){
  var hs=[258,296,232,276,248],n=0;
  var rooms=SERIES.map(function(s,si){
    var ws=WORKS.filter(function(w){return w.series===s});
    return '<section class="mgroup" aria-label="'+esc(s.name)+'">'+
    ws.map(function(w){
      var h=hs[n++%hs.length],wd=Math.round(h/w.ratio);
      return '<figure class="ex" style="--h:'+h+'px;--w:'+wd+'px"><span class="plight" aria-hidden="true"></span><button class="frame" data-open="'+w.id+'" aria-label="Open '+esc(w.title)+'"><span class="mat">'+cv(w)+'</span></button>'+
      '<figcaption class="plaque"><b>'+esc(w.title)+(w.hidden?' (hidden)':'')+'</b><span>'+esc(s.name)+'</span><span>'+esc(s.medium)+', '+s.year+'</span><span>From '+money(wprice(w,0))+'</span></figcaption></figure>';
    }).join('')+'</section>';
  }).join('');
  return '<div class="mwrap"><button class="rb rl" data-m="-1" aria-label="Walk left">&larr;</button><div class="museum" id="museum" tabindex="0" aria-label="Museum hall"><div class="mtrack">'+rooms+'<div class="mend" aria-hidden="true"></div></div></div><button class="rb rr" data-m="1" aria-label="Walk right">&rarr;</button></div>';
}
function initMuseum(){
  var m=document.getElementById('museum');if(!m)return;
  m.addEventListener('wheel',function(e){
    var dx=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,k=e.deltaMode===1?16:1,max=m.scrollWidth-m.clientWidth;
    if((dx>0&&m.scrollLeft<max-1)||(dx<0&&m.scrollLeft>0)){e.preventDefault();m.scrollLeft+=dx*k}
  },{passive:false});
  var d=null,moved=0;
  m.addEventListener('pointerdown',function(e){if(e.pointerType==='touch')return;d={x:e.clientX,l:m.scrollLeft};moved=0;m.style.cursor='grabbing'});
  m.addEventListener('pointermove',function(e){if(!d)return;var dx=e.clientX-d.x;moved=Math.max(moved,Math.abs(dx));m.scrollLeft=d.l-dx});
  function end(){d=null;m.style.cursor=''}
  m.addEventListener('pointerup',end);m.addEventListener('pointerleave',end);
  m.addEventListener('click',function(e){if(moved>6){e.stopPropagation();e.preventDefault();moved=0}},true);
  m.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){m.scrollBy({left:260,behavior:'smooth'});e.preventDefault()}else if(e.key==='ArrowLeft'){m.scrollBy({left:-260,behavior:'smooth'});e.preventDefault()}});
  document.querySelectorAll('[data-m]').forEach(function(b){b.addEventListener('click',function(){m.scrollBy({left:+b.dataset.m*Math.max(320,m.clientWidth*.7),behavior:RM?'auto':'smooth'})})});
}

function vShop(){
  return '<div class="bar"><h2 class="sec">Prints</h2><span class="mono">'+SERIES.length+' series &middot; '+WORKS.length+' prints</span></div>'+
  '<div class="series">'+SERIES.map(function(s){var w=first(s);
   return '<button class="tile" data-go="s-'+s.slug+'">'+(w?cv(w):'<span class="lthumb"></span>')+'<span><h3>'+esc(s.name)+'</h3><span class="mono">'+s.n+' prints &middot; '+s.year+'</span></span></button>'}).join('')+'</div>';
}
function vSeries(slug){
  var s=SERIES.filter(function(x){return x.slug===slug})[0];if(!s)return vShop();
  var ws=WORKS.filter(function(w){return w.series===s});
  return '<div class="bar"><div><a class="mono back" href="#shop">&larr; All series</a><h2 class="sec">'+esc(s.name)+'</h2></div>'+seg()+'</div>'+
  (st.view==='gallery'&&!st.sl?'<div class="grid">'+ws.map(card).join('')+'</div>':listHTML([s],true));
}
function vInfo(){
  return '<div class="cols"><div><h2 class="lead">'+esc(DATA.lead)+'</h2>'+
  DATA.body.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+
  '<h3 class="lab">Orders &amp; collaborations</h3><p class="mono" style="text-transform:none">'+esc(DATA.email)+' <button class="btn alt" id="cpm">Copy</button></p></div>'+
  '<div><h3 class="lab" style="margin-top:0">Featured in</h3><ul class="list"><li><span>UNDX</span><span>Feature</span></li><li><span>DAM Magazine</span><span>Feature</span></li></ul>'+
  '<h3 class="lab">Print details</h3><ul class="list"><li><span>Paper</span><span>Matte fine art</span></li><li><span>Ink</span><span>Archival pigment</span></li><li><span>Sizes</span><span>A3 / A2 / A1</span></li></ul>'+
  '<h3 class="lab">Practice</h3><ul class="list"><li><span>Mixed media &amp; collage</span></li><li><span>Installation</span></li><li><span>Photography</span></li><li><span>Painting</span></li></ul></div></div>';
}
function vCart(){
  if(!st.cart.length)return '<div class="bar"><h2 class="sec">Cart</h2></div><div class="empty"><b>Your cart is empty</b>Open any print and pick a size.<p><a class="btn alt" href="#shop" style="text-decoration:none;display:inline-block">Browse prints</a></p></div>';
  var tot=0;
  var lines=st.cart.map(function(l,i){var w=byId(l.id),p=lprice(l)*(l.q||1);tot+=p;
    return '<div class="line"><div style="border:2px solid var(--line)">'+cv(w)+'</div><div><b>'+esc(w.title)+' '+w.no+'</b><div class="mono" style="color:var(--mute)">'+esc(w.series.name)+' &middot; '+esc(lDesc(l))+' &middot; '+money(p)+'</div></div><button class="x" data-rm="'+i+'">Remove</button></div>'}).join('');
  return '<div class="bar"><h2 class="sec">Cart</h2><span class="mono">'+st.cart.length+' prints</span></div>'+lines+
  '<div class="bar"><span class="mono">Subtotal</span><span class="price" style="margin:0">'+money(tot)+'</span></div>'+
  '<p><button class="btn alt" id="cpo">Copy order to send</button></p><p class="note">Checkout is not connected yet. Copy the order and send it with the contact on the Info page.</p>';
}


/* ---------- site editor (owner only) ---------- */
var CAP={art:null,assets:null,user:null},dirty=false,pendingRe=false,fileMode=null;
function canEditSite(){try{return !!(CAP.art&&CAP.user&&CAP.user.canEdit&&CAP.user.canEdit())}catch(e){return false}}
function initCaps(){
  if(!(window.claude&&window.claude.use))return;
  Promise.all([claude.use('artifact'),claude.use('user'),claude.use('assets')]).then(function(r){CAP.art=r[0];CAP.user=r[1];CAP.assets=r[2];drawEditBar()}).catch(function(){});
}
function markDirty(){dirty=true;pendingRe=true;var n=document.querySelector('.ed-note');if(n)n.textContent='Unsaved changes'}
function drawEditBar(){
  var b=$('#editbar'),eb=$('#editbtn');if(!b||!eb)return;
  eb.hidden=!canEditSite()||st.edit;
  if(!st.edit||!canEditSite()){b.innerHTML='';return}
  b.innerHTML='<div class="editbar" role="region" aria-label="Site editor"><b class="mono">Editing</b><span class="mono ed-note">'+(dirty?'Unsaved changes':'No changes yet')+'</span><span class="ed-sp"></span><button class="btn" data-ed="add">Add print</button><button class="btn" data-ed="series">Series</button><button class="btn" data-ed="design">Design</button><button class="btn" data-ed="room">Room look</button><button class="btn" data-ed="info">Info &amp; contact</button><button class="btn alt" data-ed="save">Save &amp; publish</button><button class="btn" data-ed="discard">Discard</button></div>';
}
function startEdit(){if(!canEditSite())return;st.edit=true;buildData();rerender();drawEditBar()}
function edAction(a){
  if(a==='add'){if(!CAP.assets){toast('Uploading needs editor access');return}if(!DATA.series.length){toast('Add a series first');return}fileMode={kind:'add'};$('#edfile').click()}
  else if(a==='series')openSeries();
  else if(a==='info')openInfo();
  else if(a==='room')openRoom();
  else if(a==='design')openDesign();
  else if(a==='save')saveSite();
  else if(a==='discard'){DATA=JSON.parse(DATA_JSON);st.edit=false;dirty=false;pendingRe=false;buildData();applyDesign();applyChrome();applyHome();rerender();drawEditBar();toast('Changes discarded')}
}
function saveSite(){
  if(!CAP.art)return;toast('Publishing…');
  CAP.art.publish(buildDoc(DATA)).then(function(){toast('Published')}).catch(function(e){
    var c=e&&e.code;toast(c==='conflict'?'Someone saved first. Reloading.':c==='not_writer'||c==='not_granted'?'You need edit access to publish':'Could not publish: '+((e&&e.message)||'error'));
  });
}
function imgSize(url){return new Promise(function(res){var im=new Image();im.onload=function(){res(im.naturalHeight/im.naturalWidth||1.294)};im.onerror=function(){res(1.294)};im.src=url})}
document.addEventListener('change',function(e){
  if(!e.target||e.target.id!=='edfile')return;
  var f=e.target.files&&e.target.files[0];e.target.value='';
  if(!f||!CAP.assets||!fileMode)return;
  var fm=fileMode;toast('Uploading…');
  CAP.assets.upload(f).then(function(r){
    return imgSize(r.url).then(function(ratio){
      if(fm.kind==='add'){
        var id=DATA.works.reduce(function(m,w){return Math.max(m,w.id)},0)+1;
        DATA.works.push({id:id,title:'Untitled',series:DATA.series[0].id,base:120,img:r.url,ratio:+ratio.toFixed(3),hidden:false});
        markDirty();buildData();rerender();openEdit(id);
      }else{
        var dw=DATA.works.filter(function(w){return w.id===fm.id})[0];
        if(dw){dw.img=r.url;dw.ratio=+ratio.toFixed(3);markDirty();buildData();openEdit(fm.id)}
      }
      toast('Uploaded');
    });
  }).catch(function(err){toast('Upload failed: '+((err&&err.message)||'error'))});
});
function openEdit(id){
  var dw=DATA.works.filter(function(w){return w.id===id})[0];if(!dw)return;var arm=false;
  layer.innerHTML='<div class="ov" data-close><div class="dlg" role="dialog" aria-modal="true" aria-label="Edit print"><div style="border:2px solid var(--line);align-self:start"><img id="e-img" src="'+esc(dw.img)+'" alt="" width="927" height="'+Math.round(927*dw.ratio)+'"></div><div class="edf">'+
   '<label>Title<input id="e-title" value="'+esc(dw.title)+'"></label>'+
   '<label>Series<select id="e-series">'+DATA.series.map(function(s){return '<option value="'+s.id+'"'+(s.id===dw.series?' selected':'')+'>'+esc(s.name)+'</option>'}).join('')+'</select></label>'+
   '<label>Base price in USD (A3)<input id="e-base" type="number" min="0" step="1" value="'+dw.base+'"></label>'+
   '<label class="chk"><input id="e-hide" type="checkbox"'+(dw.hidden?' checked':'')+'> Hide from shop</label>'+
   '<div class="ed-row"><button class="btn" id="e-up">Move earlier</button><button class="btn" id="e-down">Move later</button><button class="btn" id="e-img-b">Replace image</button></div>'+
   '<div class="ed-row"><button class="btn alt" id="e-done">Done</button><button class="btn" id="e-del">Delete print</button></div></div></div></div>';
  $('#e-title').addEventListener('input',function(){dw.title=this.value;markDirty()});
  $('#e-series').addEventListener('change',function(){dw.series=+this.value;markDirty()});
  $('#e-base').addEventListener('input',function(){dw.base=Math.max(0,+this.value||0);markDirty()});
  $('#e-hide').addEventListener('change',function(){dw.hidden=this.checked;markDirty()});
  function move(d){
    var same=DATA.works.filter(function(w){return w.series===dw.series}),i=same.indexOf(dw),o=same[i+d];if(!o)return;
    var a=DATA.works.indexOf(dw),b=DATA.works.indexOf(o);DATA.works[a]=o;DATA.works[b]=dw;markDirty();toast(d<0?'Moved earlier':'Moved later');
  }
  $('#e-up').addEventListener('click',function(){move(-1)});
  $('#e-down').addEventListener('click',function(){move(1)});
  $('#e-img-b').addEventListener('click',function(){if(!CAP.assets){toast('Uploading needs editor access');return}fileMode={kind:'replace',id:id};$('#edfile').click()});
  $('#e-done').addEventListener('click',function(){close()});
  $('#e-del').addEventListener('click',function(){
    if(!arm){arm=true;this.textContent='Click again to delete';return}
    DATA.works=DATA.works.filter(function(w){return w!==dw});markDirty();close();
  });
  $('#e-title').focus();document.body.style.overflow='hidden';
}
function openSeries(){
  function draw(){
    layer.innerHTML='<div class="ov" data-close><div class="dlg one" role="dialog" aria-modal="true" aria-label="Edit series"><div class="edf"><h3>Series</h3>'+
    DATA.series.map(function(s,i){var n=DATA.works.filter(function(w){return w.series===s.id}).length;
      return '<div class="ed-ser"><input data-sn="'+i+'" value="'+esc(s.name)+'" aria-label="Series name"><span class="mono">'+n+' prints</span><button class="x btn" data-so="up" data-i="'+i+'" aria-label="Move up">&uarr;</button><button class="x btn" data-so="down" data-i="'+i+'" aria-label="Move down">&darr;</button><button class="x btn" data-so="del" data-i="'+i+'"'+(n?' disabled title="Move or delete its prints first"':'')+'>Delete</button></div>'}).join('')+
    '<label>New series<input id="s-new" placeholder="Series name"></label><div class="ed-row"><button class="btn" id="s-add">Add series</button><button class="btn alt" id="s-done">Done</button></div></div></div></div>';
    layer.querySelectorAll('[data-sn]').forEach(function(el){el.addEventListener('input',function(){DATA.series[+el.dataset.sn].name=el.value||'Untitled';markDirty()})});
    layer.querySelectorAll('[data-so]').forEach(function(el){el.addEventListener('click',function(){
      var i=+el.dataset.i,k=el.dataset.so,A=DATA.series;
      if(k==='up'&&i>0){var t=A[i];A[i]=A[i-1];A[i-1]=t}
      else if(k==='down'&&i<A.length-1){var t2=A[i];A[i]=A[i+1];A[i+1]=t2}
      else if(k==='del'&&!el.disabled){A.splice(i,1)}
      markDirty();draw();
    })});
    $('#s-add').addEventListener('click',function(){
      var v=$('#s-new').value.trim();if(!v)return;
      var id=DATA.series.reduce(function(m,s){return Math.max(m,s.id)},-1)+1;DATA.series.push({id:id,name:v});markDirty();draw();
    });
    $('#s-done').addEventListener('click',function(){close()});
    document.body.style.overflow='hidden';
  }
  draw();
}
function openRoom(){
  var R=DATA.room=DATA.room||{},W=R.walls=R.walls||{},PL=['#ffffff'];
  var SL=[['on','Room brightness (lights on)',40,140,100,'%'],['pool','Light pool on each print',0,100,45,'%'],['bright','Beam brightness',0,300,100,'%'],['beam','Beam width',8,40,19.5,'\u00b0'],['warm','Beam warmth (white to amber)',0,100,0,''],['haze','Beam haze',0,200,50,'%'],['amb','Room glow when dark',0,30,4,'%']];
  layer.innerHTML='<div class="tunep" role="dialog" aria-label="Edit the room"><h3>Room look</h3>'+
  '<button class="btn alt" id="r-try" style="width:100%">Try lights off / on</button>'+
  SL.map(function(x){var v=R[x[0]]==null?x[4]:R[x[0]];return '<label>'+x[1]+': <b id="rv-'+x[0]+'">'+v+'</b>'+x[5]+'<input type="range" data-sl="'+x[0]+'" min="'+x[2]+'" max="'+x[3]+'" step="'+(x[3]-x[2]>60?1:.5)+'" value="'+v+'"></label>'}).join('')+
  '<h4 class="mono">Wall colours</h4>'+
  DATA.series.map(function(sr,i){return '<label>'+esc(sr.name)+'<input type="color" data-wc="'+sr.id+'" value="'+(W[sr.id]||PL[i%PL.length])+'" style="width:64px;height:30px;padding:0"></label>'}).join('')+
  '<p class="mono" style="text-transform:none">Sliders change the room live. Press Save &amp; publish to keep them.</p>'+
  '<div class="ed-row"><button class="btn" id="r-reset">Reset</button><button class="btn alt" id="r-done">Done</button></div></div>';
  $('#r-try').addEventListener('click',function(){if(S)S.dkT=S.dkT?0:1});
  layer.querySelectorAll('[data-sl]').forEach(function(i){i.addEventListener('input',function(){var k=i.getAttribute('data-sl');R[k]=+i.value;$('#rv-'+k).textContent=i.value;markDirty()})});
  layer.querySelectorAll('[data-wc]').forEach(function(i){i.addEventListener('change',function(){W[i.getAttribute('data-wc')]=i.value;markDirty();rerender()})});
  $('#r-reset').addEventListener('click',function(){DATA.room={};markDirty();rerender();close()});
  $('#r-done').addEventListener('click',function(){close()});
}

/* ---- design customizer: colours, type, layout, header, footer, homepage, pages, custom CSS ---- */
var DFD={bg:'#f2f2f0',fg:'#111110',mute:'#686865',panel:'#ebebe8',line:'#111110',accent:'#111110',dbg:'#111110',dfg:'#f2f2f0',daccent:'#f2f2f0',
 fh:'Dela Gothic One',fb:'Newsreader',fm:'IBM Plex Mono',size:16,hs:100,hcase:'none',ls:14,
 width:1240,cols:0,gap:20,radius:0,bw:3,card:'outlined',fit:'original',hover:'lift',space:14,
 hstyle:'left',sticky:true,hline:true,sSearch:true,sCur:true,sTheme:true,sCart:true,logo:'DÖMÌNO',mark:'Ö',showMark:true,nIndex:'Index',nShop:'Shop',nInfo:'Info',links:'',
 aOn:false,aText:'',aBg:'#111110',aFg:'#f2f2f0',f1:'© DÖMÌNO. Lagos.',f2:'Rates are indicative.',fShow:true,
 hnew:true,hlogo:'center',hhide:true,sDesc:'Archival pigment print of a digital collage by D\u00d6M\u00ccNO.',sLead:'Each print is made to order. Delivery time is confirmed when your order is placed.',sShip:'Shipping is calculated when your order is confirmed. Contact us from the Info page for rates to your country.',sRet:'Prints are made to order, so please check the size and paper before you order. If your print arrives damaged, contact us from the Info page with photos.',pGm:35,pHm:80,sig:30,frm:45,home:'room',rBox:false,rCap:true,rHint:true,rSnd:true,rArrows:true,title:'DÖMÌNO',css:''};
function dHas(k){return DATA.design&&DATA.design[k]!==undefined}
function dv(k){return dHas(k)?DATA.design[k]:DFD[k]}
function onC(h){var n=parseInt(String(h).slice(1),16)||0,r=n>>16,g=(n>>8)&255,b=n&255;return (r*299+g*587+b*114)/1000>140?'#111110':'#f2f2f0'}
var curNav='index';
function applyDesign(){
  var D=DATA.design||{},c='',has=dHas;
  var L='';
  if(has('bg'))L+='--bg:'+D.bg+';';if(has('fg'))L+='--fg:'+D.fg+';';if(has('mute'))L+='--mute:'+D.mute+';';
  if(has('panel'))L+='--panel:'+D.panel+';--floor:'+D.panel+';';if(has('line'))L+='--line:'+D.line+';';
  if(has('accent'))L+='--yellow:'+D.accent+';--green:'+D.accent+';--on-yellow:'+onC(D.accent)+';--on-green:'+onC(D.accent)+';';
  var K='';
  if(has('dbg'))K+='--bg:'+D.dbg+';';if(has('dfg'))K+='--fg:'+D.dfg+';--line:'+D.dfg+';';
  if(has('daccent'))K+='--yellow:'+D.daccent+';--green:'+D.daccent+';--on-yellow:'+onC(D.daccent)+';--on-green:'+onC(D.daccent)+';';
  if(L)c+=':root{'+L+'}';
  if(K)c+='@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){'+K+'}}:root[data-theme="dark"]{'+K+'}';
  var fam=[];
  function ff(k,fb){var n=dv(k);if(n!==DFD[k]&&['Georgia','Arial'].indexOf(n)<0)fam.push(n);return "'"+n+"',"+fb}
  if(has('fh')||has('fb')||has('fm'))c+=':root{--display:'+ff('fh','Impact,sans-serif')+';--body:'+ff('fb','Georgia,serif')+';--mono:'+ff('fm','ui-monospace,Menlo,monospace')+'}';
  var fl=document.getElementById('dsgf');
  if(fam.length){if(!fl){fl=document.createElement('link');fl.id='dsgf';fl.rel='stylesheet';document.head.appendChild(fl)}
    var hr='https://fonts.googleapis.com/css2?'+fam.map(function(n){return 'family='+encodeURIComponent(n).replace(/%20/g,'+')}).join('&')+'&display=swap';if(fl.getAttribute('href')!==hr)fl.setAttribute('href',hr)}
  else if(fl)fl.remove();
  if(has('size'))c+='body{font-size:'+D.size+'px}';
  if(has('hs')){var h=D.hs/100;c+='h2.sec{font-size:clamp('+28*h+'px,'+5*h+'vw,'+48*h+'px)}.lead{font-size:clamp('+24*h+'px,'+3.6*h+'vw,'+38*h+'px)}.roomcap h1,.cap-block h1{font-size:clamp('+26*h+'px,'+5*h+'vw,'+52*h+'px)}'}
  if(has('hcase'))c+='h1,h2,h3,.logo .n,.lead{text-transform:'+D.hcase+'}';
  if(has('ls'))c+='.mono,nav a,.pill,.btn,.seg button{letter-spacing:'+D.ls/100+'em}';
  if(has('width'))c+='.wrap{max-width:'+D.width+'px}';
  if(D.cols>0)c+='.grid{grid-template-columns:repeat('+D.cols+',minmax(0,1fr))}@media (max-width:700px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';
  if(has('gap'))c+='.grid{gap:'+D.gap+'px}';
  if(has('radius'))c+='.card button.art,.card img,.btn,.pill,.dlg,.tile,.tunep,.editbar,#ann,input,select,textarea{border-radius:'+D.radius+'px}';
  if(has('bw'))c+='.mast{border-bottom-width:'+D.bw+'px}footer{border-top-width:'+D.bw+'px}.card button.art,.btn,.pill,.dlg,.tile{border-width:'+D.bw+'px}';
  if(has('card')&&D.card==='plain')c+='.card button.art{border:0;background:none}';
  if(has('card')&&D.card==='shadow')c+='.card button.art{border:0;box-shadow:0 8px 24px rgba(0,0,0,.18)}';
  if(has('fit')&&D.fit!=='original'){var ar={square:'1/1',portrait:'4/5',landscape:'4/3'}[D.fit];c+='.card button.art{aspect-ratio:'+ar+';overflow:hidden;width:100%}.card button.art img{width:100%;height:100%;object-fit:cover}'}
  if(has('hover')&&D.hover==='none')c+='.card button.art:hover{transform:none!important;box-shadow:none!important}';
  if(has('hover')&&D.hover==='zoom')c+='.card button.art{overflow:hidden}.card button.art:hover{transform:none;box-shadow:none}.card button.art img{transition:transform .5s}.card button.art:hover img{transform:scale(1.07)}';
  if(has('space'))c+='.bar{padding-block:'+D.space+'px}footer{margin-top:'+D.space*3+'px}';
  if(D.hstyle==='center')c+='.mast{justify-content:center}.tools{margin-left:0}';
  if(D.hstyle==='stack')c+='.mast{flex-direction:column;align-items:center}.tools{margin-left:0;justify-content:center}';
  if(D.sticky===false)c+='.mast{position:static}';
  if(D.hline===false)c+='.mast{border-bottom:0}.mast.hv2.scrolled{border-bottom-color:transparent}';
  c+='#ann{background:'+dv('aBg')+';color:'+dv('aFg')+';text-align:center;padding:8px 12px;margin-inline:-16px}';
  if(D.rBox)c+='.room3d{width:auto;margin-inline:0;border:3px solid var(--line)}';
  if(D.rCap===false)c+='.roomcap{display:none}';if(D.rHint===false)c+='.rh{display:none}';
  if(D.rSnd===false)c+='.rsnd{display:none}';if(D.rArrows===false)c+='.rb{display:none}';
  c+=String(D.css||'').replace(/<\//g,'<\\/');
  var st_=document.getElementById('dsg');if(!st_){st_=document.createElement('style');st_.id='dsg';document.head.appendChild(st_)}
  st_.textContent=c;
}
function hl(){document.querySelectorAll('header.mast nav a').forEach(function(a){if(a.dataset.nav===curNav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
function applyChrome(){
  var lg=document.querySelector('.logo');
  if(lg){var n=lg.querySelector('.n'),o=lg.querySelector('.o');if(n)n.textContent=dv('logo');if(o){o.textContent=dv('mark');o.style.display=dv('showMark')?'':'none'}}
  var nv=document.querySelector('header.mast nav');
  if(nv){
    var it=[['index','#index',dv('nIndex')],['shop','#shop',dv('nShop')],['info','#info',dv('nInfo')]].filter(function(x){return x[2]}).map(function(x){return '<a href="'+x[1]+'" data-nav="'+x[0]+'">'+esc(x[2])+'</a>'});
    (DATA.pages||[]).forEach(function(pg){it.push('<a href="#p-'+esc(pg.slug)+'" data-nav="p-'+esc(pg.slug)+'">'+esc(pg.title)+'</a>')});
    String(dv('links')||'').split('\n').forEach(function(ln){var q=ln.split('|');if(q.length>1&&q[0].trim()&&q[1].trim()){var u=q[1].trim();if(/^(https?:|mailto:|#|\/)/i.test(u))it.push('<a href="'+esc(u)+'"'+(/^https?:/i.test(u)?' target="_blank" rel="noopener"':'')+'>'+esc(q[0].trim())+'</a>')}});
    nv.innerHTML=it.join('');hl();
  }
  function vis(q,on){var e=document.querySelector(q);if(e)e.style.display=on?'':'none'}
  vis('#kbtn',dv('sSearch'));vis('#cur',dv('sCur'));vis('#theme',dv('sTheme'));vis('a[href="#cart"].pill',dv('sCart'));
  var an=document.getElementById('ann');
  if(!an){an=document.createElement('div');an.id='ann';an.className='mono';document.body.insertBefore(an,document.body.firstChild)}
  an.textContent=dv('aText');an.style.display=(dv('aOn')&&dv('aText'))?'':'none';
  var ft=document.querySelector('footer');
  if(ft){ft.innerHTML='<span>'+esc(dv('f1'))+'</span><span>'+esc(dv('f2'))+'</span>';ft.style.display=dv('fShow')?'':'none'}
  document.title=dv('title')||'DÖMÌNO';
  applyHeader();
}

/* ---------- header: new (quiet, centred, tools tucked in a menu, slide-out bag) or classic ---------- */
function hdrEl(){return document.querySelector('header.mast')}
function popPos(){var p=$('#hpop'),h=hdrEl();if(p&&h)p.style.top=Math.round(h.getBoundingClientRect().bottom)+'px'}
function openPop(){var p=$('#hpop');if(!p)return;popPos();p.hidden=false;var m=$('#hmenu');if(m)m.setAttribute('aria-expanded','true')}
function closePop(){var p=$('#hpop');if(p&&!p.hidden){p.hidden=true;var m=$('#hmenu');if(m)m.setAttribute('aria-expanded','false')}}
function applyHeader(){
  var hd=hdrEl();if(!hd)return;var tools=hd.querySelector('.tools'),on=dv('hnew');
  var kb=$('#kbtn'),cur=$('#cur'),lbl=document.querySelector('label[for="cur"]'),th=$('#theme'),eb=$('#editbtn'),cl=document.querySelector('a[href="#cart"].pill');
  if(!tools||!kb||!cur||!th||!eb||!cl)return;
  hd.classList.toggle('hv2',on);hd.classList.toggle('lleft',on&&dv('hlogo')==='left');
  var pop=$('#hpop');
  if(on){
    if(!pop){pop=document.createElement('div');pop.id='hpop';pop.hidden=true;pop.innerHTML='<div class="hp-nav"></div><div class="hp-tools"></div>';document.body.appendChild(pop)}
    var ht=pop.querySelector('.hp-tools');[kb,lbl,cur,th].forEach(function(e){if(e)ht.appendChild(e)});
    var mb=$('#hmenu');if(!mb){mb=document.createElement('button');mb.id='hmenu';mb.className='pill';mb.type='button';mb.textContent='Menu';mb.setAttribute('aria-haspopup','true');mb.setAttribute('aria-expanded','false');tools.insertBefore(mb,cl)}
    cl.innerHTML='Bag <span class="count" id="cc">0</span><span id="ctot"></span>';
    var nv=hd.querySelector('nav');pop.querySelector('.hp-nav').innerHTML=nv?nv.innerHTML:'';
  }else{
    [kb,lbl,cur].forEach(function(e){if(e)tools.insertBefore(e,eb)});tools.insertBefore(th,cl);
    var mb2=$('#hmenu');if(mb2)mb2.remove();if(pop)pop.hidden=true;
    cl.innerHTML='Cart <span class="count" id="cc">0</span>';hd.classList.remove('hid','scrolled');
  }
  updCart();
}
var lastY=0;
window.addEventListener('scroll',function(){
  var hd=hdrEl();if(!hd||!hd.classList.contains('hv2'))return;var y=window.scrollY;
  hd.classList.toggle('scrolled',y>6);
  if(dv('hhide')&&y>140&&y>lastY+6){hd.classList.add('hid');closePop()}else if(y<lastY-6||y<60)hd.classList.remove('hid');
  lastY=y;
},{passive:true});
function drawCartPanel(){
  var cp=$('#cpanel');if(!cp||!cp.classList.contains('open'))return;var tot=0;
  var lines=st.cart.map(function(l,i){var w=byId(l.id);if(!w)return '';var pr=lprice(l)*(l.q||1);tot+=pr;
    return '<div class="cpl"><div class="cpi">'+cv(w)+'</div><div><b>'+esc(w.title)+' '+w.no+'</b><div class="mono" style="text-transform:none;color:var(--mute)">'+esc(lDesc(l))+'</div><div>'+money(pr)+'</div></div><button class="x" data-rm="'+i+'">Remove</button></div>'}).join('');
  cp.querySelector('.cpb').innerHTML=st.cart.length?lines:'<p class="mono" style="padding:16px 0">Your bag is empty.</p>';
  cp.querySelector('.cpt').textContent=money(tot);
}
function openCartPanel(){
  var cp=$('#cpanel');
  if(!cp){document.body.insertAdjacentHTML('beforeend','<div id="cback" data-cclose></div><aside id="cpanel" aria-label="Bag"><div class="cph"><b>Bag</b><button class="x" data-cclose>Close</button></div><div class="cpb"></div><div class="cpf"><div class="cprow"><span class="mono">Subtotal</span><b class="cpt"></b></div><a class="btn alt" href="#cart" data-cclose style="text-decoration:none;text-align:center">View bag</a><button class="btn" data-cpo>Copy order to send</button></div></aside>');cp=$('#cpanel')}
  closePop();cp.classList.add('open');$('#cback').classList.add('open');drawCartPanel();
}
function closeCartPanel(){var cp=$('#cpanel'),cb=$('#cback');if(cp)cp.classList.remove('open');if(cb)cb.classList.remove('open')}
document.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;
  if(t.closest('#hmenu')){var p=$('#hpop');if(p&&p.hidden)openPop();else closePop();return}
  var hp=t.closest('#hpop');
  if(hp){if(t.closest('.hp-nav a'))closePop();return}
  closePop();
  var cl=t.closest('a[href="#cart"].pill');
  if(cl&&dv('hnew')&&location.hash!=='#cart'){e.preventDefault();openCartPanel();return}
  if(t.closest('[data-cclose]'))closeCartPanel();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closePop();closeCartPanel()}});
window.addEventListener('resize',function(){var p=$('#hpop');if(p&&!p.hidden)popPos()});
function applyHome(){
  var h=dv('home');st.homeGrid=(h==='grid');
  if(h==='room'){st.flat=false}else if(h==='museum'){st.flat=true;if(st.view==='list')st.view='gallery'}else if(h==='list'){st.flat=true;st.view='list'}
}
function vHomeGrid(){return '<div class="bar"><h2 class="sec">'+esc(dv('logo'))+'</h2><span class="mono">'+WORKS.length+' prints</span></div><div class="grid">'+WORKS.map(card).join('')+'</div>'}
function vPage(slug){
  var pg=(DATA.pages||[]).filter(function(x){return x.slug===slug})[0];if(!pg)return vShop();
  return '<div class="bar"><h2 class="sec">'+esc(pg.title)+'</h2></div><div class="cols"><div>'+String(pg.body||'').split(/\n\s*\n/).map(function(t){return t.trim()?'<p>'+esc(t.trim()).replace(/\n/g,'<br>')+'</p>':''}).join('')+'</div></div>';
}
var FH=['Dela Gothic One','Space Grotesk','Playfair Display','Bebas Neue','DM Serif Display','Archivo Black','Syne','Fraunces','Unbounded','Inter','Anton','Abril Fatface','Cormorant Garamond','Oswald','Poppins','Montserrat','Georgia','Arial'];
var FB=['Newsreader','Inter','DM Sans','Lora','IBM Plex Sans','Work Sans','Source Serif 4','Libre Baskerville','Karla','Manrope','Georgia','Arial'];
var FM=['IBM Plex Mono','Space Mono','JetBrains Mono','DM Mono','Courier Prime','Inter'];
var YN=function(k,l){return [k,l,'check']};
var SCH=[
 ['Colours',[['h','Light mode'],['bg','Background','color'],['fg','Text','color'],['mute','Muted text','color'],['panel','Panels','color'],['line','Lines and borders','color'],['accent','Accent (buttons, highlights)','color'],['h','Dark mode'],['dbg','Background','color'],['dfg','Text and lines','color'],['daccent','Accent','color']]],
 ['Type',[['fh','Heading font','select',FH],['fb','Body font','select',FB],['fm','Label font','select',FM],['size','Body text size','range',13,22,1,'px'],['hs','Heading size','range',60,160,5,'%'],['hcase','Heading case','select',[['none','As written'],['uppercase','UPPERCASE'],['lowercase','lowercase']]],['ls','Label letter spacing','range',0,30,1,'']]],
 ['Layout',[['width','Page width','range',900,1800,20,'px'],['cols','Grid columns (0 = automatic)','range',0,6,1,''],['gap','Grid gap','range',6,60,2,'px'],['radius','Corner radius','range',0,28,1,'px'],['bw','Border thickness','range',0,8,1,'px'],['card','Print card style','select',[['outlined','Outlined'],['plain','Plain'],['shadow','Soft shadow']]],['fit','Print shape','select',[['original','Original proportions'],['square','Square'],['portrait','Portrait 4:5'],['landscape','Landscape 4:3']]],['hover','Hover effect','select',[['lift','Lift'],['zoom','Zoom'],['none','None']]],['space','Section spacing','range',0,48,2,'px']]],
 ['Header',[['h','Header'],YN('hnew','New header (turn off to go back to the classic header)'),['hlogo','Logo position (new header)','select',[['center','Centre'],['left','Left']]],YN('hhide','Hide header when scrolling down (new header)'),['hstyle','Classic header layout','select',[['left','Logo left, menu beside'],['center','Centred'],['stack','Stacked']]],YN('sticky','Stay at top when scrolling'),YN('hline','Line under header'),['logo','Logo text','text'],['mark','Logo mark letter','text'],YN('showMark','Show logo mark'),['nIndex','Menu: Index (empty hides)','text'],['nShop','Menu: Shop (empty hides)','text'],['nInfo','Menu: Info (empty hides)','text'],['links','Extra menu links, one per line: Label | https://...','area'],YN('sSearch','Show search'),YN('sCur','Show currency'),YN('sTheme','Show light/dark button'),YN('sCart','Show cart'),['h','Announcement bar'],YN('aOn','Show announcement'),['aText','Announcement text','text'],['aBg','Bar colour','color'],['aFg','Bar text colour','color'],['h','Footer'],YN('fShow','Show footer'),['f1','Footer left','text'],['f2','Footer right','text']]],
 ['Home',[['home','Homepage layout','select',[['room','3D walk-through room'],['museum','Museum wall (flat)'],['list','List'],['grid','Grid of all prints']]],YN('rBox','Boxed room (not full width)'),YN('rCap','Collection caption under the room'),YN('rHint','Instruction text'),YN('rSnd','Sound button'),YN('rArrows','Arrow buttons')]],
 ['Shop',[['sDesc','Print description','area'],['sLead','Lead time text','area'],['sShip','Shipping text','area'],['sRet','Returns text','area'],['h','Price add-ons (base price is set per print)'],['pGm','Giclee paper extra','range',0,150,5,'%'],['pHm','Hahnemuhle paper extra','range',0,250,5,'%'],['sig','Signed and numbered extra','range',0,200,5,' USD'],['frm','Classic frame extra (A3, scales with size)','range',0,300,5,' USD']]],
 ['Pages',null],
 ['Advanced',[['title','Browser tab title','text'],['css','Custom CSS (for experts)','area']]]
];
var dTab=0;
function dCtl(f){
  var k=f[0],t=f[2],val=dv(k);
  if(k==='h')return '<h4 class="mono">'+f[1]+'</h4>';
  if(t==='color')return '<label>'+f[1]+'<input type="color" data-dk="'+k+'" value="'+esc(val)+'" style="width:64px;height:30px;padding:0"></label>';
  if(t==='range')return '<label>'+f[1]+': <b id="dv-'+k+'">'+val+'</b>'+f[6]+'<input type="range" data-dk="'+k+'" min="'+f[3]+'" max="'+f[4]+'" step="'+f[5]+'" value="'+val+'"></label>';
  if(t==='select')return '<label>'+f[1]+'<select data-dk="'+k+'">'+f[3].map(function(o){var a=Array.isArray(o)?o:[o,o];return '<option value="'+esc(a[0])+'"'+(a[0]===val?' selected':'')+'>'+esc(a[1])+'</option>'}).join('')+'</select></label>';
  if(t==='text')return '<label>'+f[1]+'<input data-dk="'+k+'" value="'+esc(val)+'"></label>';
  if(t==='area')return '<label>'+f[1]+'<textarea data-dk="'+k+'" rows="5" style="font-family:var(--mono);font-size:12px">'+esc(val)+'</textarea></label>';
  if(t==='check')return '<label class="ck"><input type="checkbox" data-dk="'+k+'"'+(val?' checked':'')+'> '+f[1]+'</label>';
  return '';
}
function dPages(){
  return (DATA.pages||[]).map(function(p){return '<div class="pg"><label>Page title<input data-pt="'+esc(p.id)+'" value="'+esc(p.title)+'"></label><label>Text (blank line = new paragraph)<textarea data-pb="'+esc(p.id)+'" rows="6">'+esc(p.body)+'</textarea></label><span class="mono" style="text-transform:none">Address: #p-'+esc(p.slug)+'</span><button class="btn" data-pd="'+esc(p.id)+'">Delete page</button></div>'}).join('')+'<button class="btn alt" id="pg-add">Add a page</button><p class="mono" style="text-transform:none">New pages appear in the menu automatically.</p>';
}
function dDraw(){
  var P=$('.tunep');if(!P)return;
  P.querySelector('.tabs').innerHTML=SCH.map(function(t,i){return '<button class="btn'+(i===dTab?' alt':'')+'" data-tab="'+i+'">'+t[0]+'</button>'}).join('');
  P.querySelector('.tbody').innerHTML=SCH[dTab][1]?SCH[dTab][1].map(dCtl).join(''):dPages();
}
function setD(k,val){DATA.design=DATA.design||{};DATA.design[k]=val;markDirty();applyDesign();applyChrome();if(k==='home'){applyHome();rerender()}}
function openDesign(){
  layer.innerHTML='<div class="tunep wide" role="dialog" aria-label="Design"><h3>Design</h3><div class="tabs"></div><div class="tbody"></div><p class="mono" style="text-transform:none">Everything changes live. Press Save &amp; publish to keep it.</p><div class="ed-row"><button class="btn" id="d-reset">Reset design</button><button class="btn alt" id="d-done">Done</button></div></div>';
  var P=$('.tunep');dDraw();
  P.addEventListener('input',function(e){
    var t=e.target,k=t.getAttribute&&t.getAttribute('data-dk');
    if(k){var v=t.type==='checkbox'?t.checked:t.type==='range'?+t.value:t.value;var b=$('#dv-'+k);if(b)b.textContent=t.value;setD(k,v);return}
    var pt=t.getAttribute&&t.getAttribute('data-pt'),pb=t.getAttribute&&t.getAttribute('data-pb');
    if(pt||pb){(DATA.pages||[]).forEach(function(p){if(p.id===pt)p.title=t.value;if(p.id===pb)p.body=t.value});markDirty();applyChrome()}
  });
  P.addEventListener('click',function(e){
    var t=e.target.closest('button');if(!t)return;
    if(t.dataset.tab!==undefined){dTab=+t.dataset.tab;dDraw();return}
    if(t.id==='pg-add'){
      DATA.pages=DATA.pages||[];var base=(prompt('Page title','About')||'').trim();if(!base)return;
      var sl=base.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'page',u=sl,n=2;
      while(DATA.pages.some(function(x){return x.slug===u}))u=sl+'-'+(n++);
      DATA.pages.push({id:'p'+Date.now(),slug:u,title:base,body:''});markDirty();applyChrome();dDraw();return}
    if(t.dataset.pd){DATA.pages=(DATA.pages||[]).filter(function(p){return p.id!==t.dataset.pd});markDirty();applyChrome();dDraw();if(/^#p-/.test(location.hash))location.hash='#index';return}
    if(t.id==='d-reset'){DATA.design={};markDirty();applyDesign();applyChrome();applyHome();rerender();dDraw();return}
    if(t.id==='d-done'){close()}
  });
}
if(location.search.indexOf('dsgtest')>-1)window.__dsg=openDesign;
function openInfo(){
  layer.innerHTML='<div class="ov" data-close><div class="dlg one" role="dialog" aria-modal="true" aria-label="Edit info and contact"><div class="edf"><h3>Info &amp; contact</h3>'+
  '<label>Contact email<input id="i-email" value="'+esc(DATA.email)+'"></label>'+
  '<label>Headline<textarea id="i-lead">'+esc(DATA.lead)+'</textarea></label>'+
  '<label>About text (leave a blank line between paragraphs)<textarea id="i-body" style="min-height:200px">'+esc(DATA.body.join('\n\n'))+'</textarea></label>'+
  '<div class="ed-row"><button class="btn alt" id="i-done">Done</button></div></div></div></div>';
  $('#i-email').addEventListener('input',function(){DATA.email=this.value;markDirty()});
  $('#i-lead').addEventListener('input',function(){DATA.lead=this.value;markDirty()});
  $('#i-body').addEventListener('input',function(){DATA.body=this.value.split(/\n\s*\n/).map(function(p){return p.trim()}).filter(Boolean);markDirty()});
  $('#i-done').addEventListener('click',function(){close()});
  document.body.style.overflow='hidden';
}


var SHELL_HEAD="<title>D\u00d6M\u00ccNO</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap\">\n<link rel=\"stylesheet\" href=\"style.css\">\n",SHELL_BODY="\n<div class=\"wrap\">\n  <header class=\"mast\">\n    <a class=\"logo\" href=\"#index\" aria-label=\"D\u00d6M\u00ccNO, home\"><span class=\"o\" aria-hidden=\"true\">\u00d6</span><span class=\"n\">D\u00d6M\u00ccNO</span></a>\n    <nav aria-label=\"Main\">\n      <a href=\"#index\" data-nav=\"index\">Index</a>\n      <a href=\"#shop\" data-nav=\"shop\">Shop</a>\n      <a href=\"#info\" data-nav=\"info\">Info</a>\n    </nav>\n    <div class=\"tools\">\n      <button class=\"pill\" id=\"kbtn\" aria-label=\"Search and commands\">Search &#8984;K</button>\n      <label for=\"cur\" style=\"position:absolute;left:-9999px\">Currency</label>\n      <select class=\"pill\" id=\"cur\"></select>\n      <button class=\"pill\" id=\"editbtn\" hidden>Edit site</button>\n      <button class=\"pill\" id=\"theme\" aria-label=\"Toggle light and dark\">Light/Dark</button>\n      <a class=\"pill\" href=\"#cart\" aria-label=\"Cart\">Cart <span class=\"count\" id=\"cc\">0</span></a>\n    </div>\n  </header>\n  <div id=\"editbar\"></div>\n  <main id=\"main\"></main>\n  <footer class=\"mono\">\n    <span>&copy; D\u00d6M\u00ccNO. Lagos.</span>\n    <span>Rates are indicative.</span>\n  </footer>\n</div>\n<div id=\"layer\"></div>\n<input type=\"file\" id=\"edfile\" accept=\"image/*\" hidden>\n",SHELL_TAIL="<script src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"></script>\n<script src=\"app.js\"></script>\n",RESET=":root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}";
function buildDoc(d){
  var json=JSON.stringify(d).replace(/</g,'\\u003c');
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+RESET+'</style></head><body>'+SHELL_HEAD.replace(/<title>[^<]*<\/title>/,'<title>'+esc((d.design&&d.design.title)||'D\u00d6M\u00ccNO')+'</title>')+'<script type="application/json" id="sitedata">'+json+'<\/script>'+SHELL_BODY+SHELL_TAIL+'</body></html>';
}

var main=$('#main');
function route(){
  disposeScene();disposeList();
  var h=(location.hash||'#index').slice(1),html,nav=h;
  if(h.indexOf('s-')===0){html=vSeries(h.slice(2));nav='shop'}
  else if(h==='shop')html=vShop();else if(h==='info')html=vInfo();
  else if(h.indexOf('w-')===0){html=vWork(+h.slice(2));nav='shop'}
  else if(h.indexOf('p-')===0){html=vPage(h.slice(2));nav=h}
  else if(h==='cart'){html=vCart();nav=''}else{html=vIndex();nav='index'}
  main.innerHTML=html;
  curNav=nav;hl();updCart();closePop();
  paintAll();bindLines();if($('#cv3'))initScene();initList();initMuseum();window.scrollTo(0,0);
}
function rerender(){var y=window.scrollY;route();window.scrollTo(0,y)}

function updCart(){
  var c=$('#cc');if(c)c.textContent=st.cart.length;
  var t=$('#ctot');if(t){var tot=0;st.cart.forEach(function(l){if(byId(l.id))tot+=lprice(l)*(l.q||1)});t.textContent=st.cart.length?' \u00b7 '+money(tot):''}
  drawCartPanel();
}
function addCart(id,si){st.cart.push({id:id,s:si});lsSet('dmn.cart2',st.cart);updCart();toast('Added to cart')}
var curSel=$('#cur');curSel.innerHTML=Object.keys(RATES).map(function(k){return '<option'+(k===st.cur?' selected':'')+'>'+k+'</option>'}).join('');
curSel.addEventListener('change',function(){st.cur=curSel.value;lsSet('dmn.cur',st.cur);rerender()});
$('#theme').addEventListener('click',function(){var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'});
updCart();

var layer=$('#layer');
function close(){layer.innerHTML='';document.body.style.overflow='';if(S&&S.release)S.release();if(pendingRe){pendingRe=false;buildData();rerender()}}
function openWork(id){
  if(st.edit){openEdit(id);return}
  if(byId(id)){location.hash='#w-'+id;return}
  var w=byId(id);if(!w)return;var si=0;
  function draw(){
    layer.innerHTML='<div class="ov" data-close><div class="dlg" role="dialog" aria-modal="true" aria-label="'+esc(w.title)+'"><div style="border:2px solid var(--line);align-self:start">'+cv(w)+'</div><div>'+
    '<div class="mono" style="color:var(--mute)">'+esc(w.series.name)+' &middot; '+w.series.year+'</div><h3>'+esc(w.title)+' '+w.no+'</h3><p style="margin:0">'+esc(w.series.medium)+'. Archival pigment print on matte fine art paper.</p>'+
    '<div class="sizes" role="group" aria-label="Size">'+SIZES.map(function(s,i){return '<button data-size="'+i+'" aria-pressed="'+(i===si)+'">'+s.k+' &middot; '+s.d+'</button>'}).join('')+'</div>'+
    '<div class="price">'+money(wprice(w,si))+'</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="add">Add to cart</button><button class="btn alt" data-close>Close</button></div>'+
    '<p class="note">Checkout is not connected yet.</p></div></div></div>';
    paintAll();
    layer.querySelectorAll('[data-size]').forEach(function(el){el.addEventListener('click',function(){si=+el.dataset.size;draw()})});
    $('#add').addEventListener('click',function(){addCart(w.id,si)});
    $('#add').focus();
  }
  draw();document.body.style.overflow='hidden';
}

/* ---------- print product page ---------- */
var PSIZES=SIZES.concat([{k:'A0',m:5.4,d:'841 × 1189 mm'}]);
var PAPERS=[{k:'Budget Art Paper',d:'Smooth matte paper. A light, affordable choice for posters and everyday display.',c:'You want an affordable print.'},{k:'Giclée Fine Art Paper',d:'Heavier matte fine art paper with richer colour and deeper blacks.',c:'You want a print that looks its best on the wall.'},{k:'Hahnemühle German Etching',d:'Museum-grade, acid-free, textured etching paper. Also the only paper offered in A0.',c:'You want a collector-grade print.'}];
function papx(i){return i===1?dv('pGm')/100:i===2?dv('pHm')/100:0}
function lprice(l){var m=PSIZES[l.s||0].m,w=byId(l.id);return w.base*m*(1+papx(l.p||0))+(l.sg?+dv('sig'):0)+(l.f?+dv('frm')*m:0)}
function lDesc(l){return PSIZES[l.s||0].k+' · '+PAPERS[l.p||0].k+(l.sg?' · Signed and numbered':'')+(l.f?' · Classic frame':'')+' · ×'+(l.q||1)}
function pdState(id){if(!st.pd||st.pd.id!==id)st.pd={id:id,s:0,p:0,sg:0,f:0,q:1};return st.pd}
function paras(t){return String(t||'').split(/\n\s*\n/).map(function(x){return x.trim()?'<p>'+esc(x.trim()).replace(/\n/g,'<br>')+'</p>':''}).join('')}
function vWork(id){
  var w=byId(id);if(!w)return vShop();var d=pdState(id),sr=w.series,price=lprice(d),total=price*d.q;
  function opts(field,items){return '<div class="opts" role="group">'+items.map(function(it){return '<button data-pd="'+field+':'+it[0]+'" aria-pressed="'+(String(d[field])===String(it[0]))+'"'+(it[2]?' disabled':'')+'>'+it[1]+'</button>'}).join('')+'</div>'}
  var sizes=PSIZES.map(function(z,i){return [i,z.k+' · '+z.d.replace(/ /g,' '),(i===3&&d.p!==2)]});
  var others=WORKS.filter(function(x){return x.series===sr&&x.id!==w.id}).slice(0,4);
  var more=SERIES.filter(function(x){return x!==sr&&first(x)}).slice(0,3).map(first);
  return '<div class="pdtop"><a class="mono back" href="#s-'+sr.slug+'">&larr; Back to '+esc(sr.name)+'</a></div>'+
  '<div class="pd"><div class="pd-img">'+cv(w)+'</div><div class="pd-info">'+
   '<h1 class="pd-t">'+esc(w.title)+' '+w.no+'</h1><div class="mono" style="color:var(--mute)">'+esc(sr.name)+' &middot; '+esc(sr.medium)+' &middot; '+sr.year+'</div>'+
   '<div class="pd-d">'+paras(dv('sDesc'))+'</div>'+
   '<div class="price" id="pdprice">'+money(price)+'</div>'+
   '<div class="opt"><h4 class="mono">Paper</h4>'+opts('p',PAPERS.map(function(x,i){return [i,esc(x.k)]}))+'</div>'+
   '<div class="opt"><h4 class="mono">Size</h4>'+opts('s',sizes)+'</div>'+
   '<div class="opt"><h4 class="mono">Signature</h4>'+opts('sg',[[0,'Unsigned'],[1,'Signed and numbered (+'+money(+dv('sig'))+')']])+'</div>'+
   '<div class="opt"><h4 class="mono">Frame</h4>'+opts('f',[[0,'Unframed'],[1,'Classic frame (+'+money(+dv('frm')*PSIZES[d.s].m)+')']])+'</div>'+
   '<div class="opt"><h4 class="mono">Quantity</h4><div class="qty"><button data-pd="q:-1" aria-label="Fewer">&minus;</button><b>'+d.q+'</b><button data-pd="q:+1" aria-label="More">+</button></div></div>'+
   '<button class="btn alt pd-add" id="pdadd">Add to bag &middot; '+money(total)+'</button>'+
   '<p class="note">Signed and framed options use Giclée paper or better. Checkout is not connected yet: your bag can be copied and sent with the contact on the Info page.</p>'+
  '</div></div>'+
  '<section class="pdsec"><h3 class="lab">Paper &amp; sizes</h3><div class="pcards">'+PAPERS.map(function(x,i){return '<div class="pcard"><b>'+esc(x.k)+'</b><p>'+esc(x.d)+'</p><div class="mono" style="text-transform:none;color:var(--mute)">Choose this if: '+esc(x.c)+(i?' Adds '+(i===1?dv('pGm'):dv('pHm'))+'% to the price.':'')+'</div></div>'}).join('')+'</div>'+
   '<p class="mono" style="text-transform:none;color:var(--mute)">Sizes: '+PSIZES.map(function(z){return z.k+' '+z.d}).join(' · ')+'</p></section>'+
  '<section class="pdsec cols2"><div><h3 class="lab">Delivery</h3>'+paras(dv('sLead'))+paras(dv('sShip'))+'</div><div><h3 class="lab">Returns</h3>'+paras(dv('sRet'))+'</div></section>'+
  (others.length?'<section class="pdsec"><h3 class="lab">More from '+esc(sr.name)+'</h3><div class="grid">'+others.map(card).join('')+'</div></section>':'')+
  (more.length?'<section class="pdsec"><h3 class="lab">You may also like</h3><div class="grid">'+more.map(card).join('')+'</div></section>':'');
}
function pdClick(spec){
  var q=spec.split(':'),f=q[0],v=q[1],d=st.pd;if(!d)return;
  if(f==='q')d.q=Math.max(1,Math.min(20,d.q+(v==='+1'?1:-1)));
  else{v=+v;d[f]=v;
    if(f==='p'){if(v===0){d.sg=0;d.f=0}if(v!==2&&d.s===3)d.s=2}
    if((f==='sg'||f==='f')&&v===1&&d.p===0)d.p=1;
  }
  rerender();
}
function pdAdd(){var d=st.pd;if(!d)return;st.cart.push({id:d.id,s:d.s,p:d.p,sg:d.sg,f:d.f,q:d.q});lsSet('dmn.cart2',st.cart);updCart();toast('Added to bag');if(dv('hnew'))openCartPanel()}
var CMDS=function(){
  var c=[['Go to Index','#index'],['Go to Shop','#shop'],['Go to Info','#info'],['Open cart','#cart']];
  SERIES.forEach(function(s){c.push(['Series: '+s.name,'#s-'+s.slug])});
  Object.keys(RATES).forEach(function(k){c.push(['Currency: '+k,'cur:'+k])});
  c.push(['Layout: Gallery','v:gallery'],['Layout: List','v:list']);return c};
function openPal(){
  var sel=0,items=CMDS(),cur=items;
  layer.innerHTML='<div class="ov" data-close><div class="pal" role="dialog" aria-modal="true" aria-label="Search and commands"><input id="q" placeholder="Type to jump anywhere" autocomplete="off"><ul id="pl"></ul></div></div>';
  var q=$('#q'),pl=$('#pl');
  function list(){pl.innerHTML=cur.map(function(c,i){return '<li><button data-i="'+i+'" class="'+(i===sel?'on':'')+'"><span>'+esc(c[0])+'</span><span class="mono">'+(c[1].indexOf('#')===0?'Go':'Set')+'</span></button></li>'}).join('')||'<li style="padding:14px" class="mono">No match</li>'}
  function run(i){var c=cur[i];if(!c)return;close();var v=c[1];
    if(v.indexOf('cur:')===0){st.cur=v.slice(4);lsSet('dmn.cur',st.cur);curSel.value=st.cur;rerender()}
    else if(v.indexOf('v:')===0){st.view=v.slice(2);rerender()}else location.hash=v}
  q.addEventListener('input',function(){var t=q.value.toLowerCase();cur=items.filter(function(c){return c[0].toLowerCase().indexOf(t)>-1});sel=0;list()});
  q.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){sel=Math.min(cur.length-1,sel+1);list();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);list();e.preventDefault()}else if(e.key==='Enter')run(sel)});
  pl.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)run(+b.dataset.i)});
  list();q.focus();
}
$('#kbtn').addEventListener('click',openPal);
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal();return}
  if(e.key==='Escape'){close();return}
  if(layer.firstChild)return;
  var t=e.target;
  if(e.key==='Enter'&&t.classList&&t.classList.contains('row')){t.dataset.open?openWork(+t.dataset.open):(location.hash=t.dataset.go)}
  else if(S&&t.tagName!=='INPUT'&&t.tagName!=='SELECT'&&t.tagName!=='TEXTAREA'){var wk=walkKey(e.key);if(wk){S.keys[wk]=true;S.keys.run=e.shiftKey;if(e.key.indexOf('Arrow')===0)e.preventDefault()}}
});
function walkKey(k){return({ArrowUp:'f',w:'f',W:'f',ArrowDown:'b',s:'b',S:'b',a:'l',A:'l',d:'r',D:'r',ArrowLeft:'tl',q:'tl',Q:'tl',ArrowRight:'tr',e:'tr',E:'tr'})[k]}
document.addEventListener('keyup',function(e){if(!S)return;var wk=walkKey(e.key);if(wk)S.keys[wk]=false;S.keys.run=e.shiftKey});
window.addEventListener('blur',function(){if(S)S.keys={}});
function copy(text){
  function fb(){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Select and copy manually')}ta.remove()}
  try{navigator.clipboard.writeText(text).then(function(){toast('Copied')},fb)}catch(e){fb()}}
document.addEventListener('click',function(e){
  var t=e.target;
  if(t.closest('#editbtn')){startEdit();return}
  var ed=t.closest('[data-ed]');if(ed){edAction(ed.dataset.ed);return}
  var op=t.closest('[data-open]');if(op&&!t.closest('#layer')){openWork(+op.dataset.open);return}
  var go=t.closest('[data-go]');if(go){location.hash=go.dataset.go;return}
  var fl=t.closest('[data-flat]');if(fl){st.flat=fl.dataset.flat==='1';rerender();return}
  var hm=t.closest('[data-h]');if(hm){st.home=hm.dataset.h;lsSet('dmn.home',st.home);rerender();return}
  var v=t.closest('[data-v]');if(v){st.sl=false;st.view=v.dataset.v;rerender();return}
  var pdb=t.closest('[data-pd]');if(pdb&&!pdb.disabled&&pdb.closest('.pd')){pdClick(pdb.dataset.pd);return}
  if(t.closest('#pdadd')){pdAdd();return}
  var rm=t.closest('[data-rm]');if(rm){st.cart.splice(+rm.dataset.rm,1);lsSet('dmn.cart2',st.cart);updCart();rerender();return}
  if(t.closest('#cpm')){copy(DATA.email);return}
  if(t.closest('#cpo,[data-cpo]')){copy('Print order:\n'+st.cart.map(function(l){var w=byId(l.id);return w.title+' '+w.no+' ('+w.series.name+') '+lDesc(l)+' - '+money(lprice(l)*(l.q||1))}).join('\n'));return}
  if(t.matches('[data-close]')&&(t.classList.contains('ov')||t.classList.contains('btn')))close();
});
var carry=document.createElement('div');carry.setAttribute('aria-hidden','true');carry.setAttribute('data-carry-room','');carry.style.cssText='background:var(--bg);inset:0;opacity:0;pointer-events:none;position:fixed;z-index:19;transition:opacity .22s ease';document.body.appendChild(carry);
var carryT=0;
window.addEventListener('hashchange',function(){
  if(RM){route();return}
  clearTimeout(carryT);carry.style.opacity='1';
  carryT=setTimeout(function(){route();requestAnimationFrame(function(){carry.style.opacity='0'})},230);
});
applyDesign();applyChrome();applyHome();
route();initCaps();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(paintAll);
})();
