
(async () => {
'use strict';
await ChisenI18n.load('locales/translations.csv');

let W=720, H=960;
const TAU=Math.PI*2;
const canvas=document.getElementById('art');
const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});

const paper=document.createElement('canvas');
paper.width=W; paper.height=H;
const pctx=paper.getContext('2d',{alpha:false});

const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const easeOutCubic=t=>1-Math.pow(1-t,3);
const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));

function detectSystemUILanguage(){
  const langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']).map(v=>String(v||'').toLowerCase());
  for(const lang of langs){
    if(lang.startsWith('zh'))return 'zh';
    if(lang.startsWith('ja'))return 'ja';
    if(lang.startsWith('es'))return 'es';
    if(lang.startsWith('en'))return 'en';
  }
  return 'en';
}
const UI_LANGUAGE_STORAGE_KEY='KoiPond.1.0.uiLanguage';
function readUILanguageMode(){
  try{
    const saved=localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
    return ['auto','es','en','zh','ja'].includes(saved)?saved:'auto';
  }catch(e){return 'auto';}
}
function resolvedUILanguage(mode){return mode==='auto'?detectSystemUILanguage():mode}
let UI_LANGUAGE_MODE=readUILanguageMode();
let UI_LANGUAGE=resolvedUILanguage(UI_LANGUAGE_MODE);
let UI_HTML_LANG={es:'es',en:'en',zh:'zh-CN',ja:'ja'}[UI_LANGUAGE];
function projectTitle(){return ui('project.title')}
function authorName(){return ui('project.author')}
function projectFileStem(){return ui('project.filename')}
function ui(id,vars={}){return ChisenI18n.text(id,UI_LANGUAGE,vars)}
function uiMsg(key,vars={}){return ui('message.'+key,vars)}
function schoolWord(count){return uiMsg(count===1?'schoolOne':'schoolMany')}
function touchModeText(mode){return uiMsg(mode==='attract'?'modeAttract':mode==='ignore'?'modeIgnore':'modeRepel')}
function updateProjectIdentity(){
  const title=projectTitle(),author=authorName();
  document.title=title;
  const projectEl=document.getElementById('projectTitle');
  if(projectEl){projectEl.textContent=title;projectEl.setAttribute('lang',UI_HTML_LANG)}
  const creatorEl=document.getElementById('creatorName');
  if(creatorEl)creatorEl.textContent=ui('project.credit',{author});
  document.querySelector('meta[name="application-name"]')?.setAttribute('content',title);
  document.querySelector('meta[name="author"]')?.setAttribute('content',author);
}
function localizeStaticUI(){
  document.documentElement.lang=UI_HTML_LANG;
  ChisenI18n.localize(document,UI_LANGUAGE);
  updateProjectIdentity();
  const languageSelect=document.getElementById('languageSelect');
  if(languageSelect)languageSelect.value=UI_LANGUAGE_MODE;
}
function setUILanguage(mode,{persist=true}={}){
  if(!['auto','es','en','zh','ja'].includes(mode))mode='auto';
  UI_LANGUAGE_MODE=mode;
  UI_LANGUAGE=resolvedUILanguage(mode);
  UI_HTML_LANG={es:'es',en:'en',zh:'zh-CN',ja:'ja'}[UI_LANGUAGE];
  if(persist){try{localStorage.setItem(UI_LANGUAGE_STORAGE_KEY,mode)}catch(e){}}
  localizeStaticUI();
  if(typeof closeInfo==='function')closeInfo();
  if(typeof refreshColorPresetSelect==='function')refreshColorPresetSelect(document.getElementById('colorPresetSelect')?.value);
  if(typeof refreshMotionPresetSelect==='function')refreshMotionPresetSelect(document.getElementById('motionPresetSelect')?.value);
  if(typeof refreshPresetSelect==='function')refreshPresetSelect(document.getElementById('presetSelect')?.value);
  if(typeof renderAllColorsEditor==='function')renderAllColorsEditor();
  if(typeof syncSettingsToUI==='function')syncSettingsToUI();
  if(typeof updateAspectUI==='function')updateAspectUI();
  if(typeof updateRecordUI==='function')updateRecordUI();
  if(typeof updateUtilityState==='function')updateUtilityState();
  if(typeof updateSceneState==='function')updateSceneState();
}

const kinseiSignature=document.querySelector('.signature-logo');
if(kinseiSignature){
  kinseiSignature.setAttribute('role','img');
  kinseiSignature.setAttribute('data-i18n-aria-label','project.signature');
  kinseiSignature.setAttribute('data-i18n-title','project.signature');
  kinseiSignature.querySelector('svg')?.setAttribute('aria-hidden','true');
}
function uiSeconds(value){return ui('format.seconds',{value})}
localizeStaticUI();
document.getElementById('languageSelect')?.addEventListener('change',e=>setUILanguage(e.target.value));

const BASE_DEFAULTS={
  canvasWidth:720,
  canvasHeight:960,
  fitViewport:true,

  plantCount:390,
  circleRatio:.25,
  riverWidth:74,
  backgroundColor:'#8ad2ff',

  fishCount:28,
  schoolCount:1,
  schoolTightness:.25,
  schoolLength:.17,
  swimSpeed:1,

  schoolFishCounts:[28,0,0],
  schoolTightnesses:[.25,.25,.25],
  schoolLengths:[.17,.17,.17],
  schoolSwimSpeeds:[1,1,1],
  schoolEntryDirections:['northwest','east','south'],
  schoolExitDirections:['southeast','west','north'],
  schoolTouchModes:['repel','repel','repel'],
  schoolSpawnOutside:[true,true,true],
  schoolFlowerMasks:[
    [true,true,true],
    [true,true,true],
    [true,true,true]
  ],

  startOutside:true,
  entryCorner:'northwest',
  exitCorner:'southeast',
  useBreadcrumbs:false,
  breadcrumbLoop:false,
  breadcrumbVisibleEditor:true,
  breadcrumbVisibleOutput:false,
  breadcrumbs:[],
  recordResetScene:true,
  recordStartWithEntry:false,
  recordEntryDelaySeconds:1,
  recordEndWithExit:false,

  tapAttract:false,
  followPointer:true,
  tapStrength:1,

  bloomPower:.48,
  autoCloseFlowers:false,
  bloomSomeOnReset:false,
  flowerOpenSeconds:12,
  recordSeconds:6,
  seed:1843,

  leafPaletteCount:3,
  flowerPaletteCount:3,
  schoolPaletteCounts:[3,3,3],
  schoolColorWeights:[
    [34,33,33],
    [34,33,33],
    [34,33,33]
  ],
  leafColors:['#49b85c','#77c86e','#329d57'],
  schoolPalettes:[
    ['#be3139','#df5d52','#fa0021'],
    ['#df5d52','#c2433f','#8f2639'],
    ['#9f2637','#c84e5a','#e07861']
  ],
  flowerColors:['#f29fb7','#f7b75f','#ffebf1'],
  flowerWeights:[49,33,11]
};

function deepClone(value){return JSON.parse(JSON.stringify(value));}
function mergedSettings(data){
  const base=deepClone(BASE_DEFAULTS);
  if(!data||typeof data!=='object')return base;
  for(const [k,v] of Object.entries(data)){
    if(v!==undefined)base[k]=deepClone(v);
  }
  base.schoolPaletteCounts=(base.schoolPaletteCounts||[3,3,3]).slice(0,3);
  while(base.schoolPaletteCounts.length<3)base.schoolPaletteCounts.push(3);
  base.schoolPalettes=(base.schoolPalettes||deepClone(BASE_DEFAULTS.schoolPalettes)).slice(0,3);
  while(base.schoolPalettes.length<3)base.schoolPalettes.push(deepClone(BASE_DEFAULTS.schoolPalettes[base.schoolPalettes.length]));
  base.schoolColorWeights=(base.schoolColorWeights||deepClone(BASE_DEFAULTS.schoolColorWeights)).slice(0,3);
  while(base.schoolColorWeights.length<3)base.schoolColorWeights.push([34,33,33]);
  base.breadcrumbs=Array.isArray(base.breadcrumbs)?base.breadcrumbs.map(p=>({
    x:Math.max(0,Math.min(1,Number(p&&p.x)||0)),
    y:Math.max(0,Math.min(1,Number(p&&p.y)||0))
  })):[];
  const oldDirMap={'top-left':'northwest','top-right':'northeast','bottom-left':'southwest','bottom-right':'southeast'};
  const validDirs=['north','northeast','east','southeast','south','southwest','west','northwest'];
  base.entryCorner=oldDirMap[base.entryCorner]||base.entryCorner;
  base.exitCorner=oldDirMap[base.exitCorner]||base.exitCorner;
  if(!validDirs.includes(base.entryCorner))base.entryCorner='northwest';
  if(!validDirs.includes(base.exitCorner))base.exitCorner='southeast';

  const arr3=(src,fill)=>Array.isArray(src)?src.slice(0,3):[];
  base.schoolFishCounts=arr3(base.schoolFishCounts,[28,0,0]);
  while(base.schoolFishCounts.length<3)base.schoolFishCounts.push(base.schoolFishCounts.length===0?Math.max(1,Number(base.fishCount)||28):0);
  base.schoolFishCounts=base.schoolFishCounts.map(v=>Math.max(0,Math.round(Number(v)||0)));

  base.schoolTightnesses=arr3(base.schoolTightnesses,[.25,.25,.25]);
  while(base.schoolTightnesses.length<3)base.schoolTightnesses.push(Number(base.schoolTightness)||.25);
  base.schoolTightnesses=base.schoolTightnesses.map(v=>Math.max(0,Math.min(1,Number(v)||0)));

  base.schoolLengths=arr3(base.schoolLengths,[.17,.17,.17]);
  while(base.schoolLengths.length<3)base.schoolLengths.push(Number(base.schoolLength)||.17);
  base.schoolLengths=base.schoolLengths.map(v=>Math.max(0,Math.min(1,Number(v)||0)));

  base.schoolSwimSpeeds=arr3(base.schoolSwimSpeeds,[1,1,1]);
  while(base.schoolSwimSpeeds.length<3)base.schoolSwimSpeeds.push(Number(base.swimSpeed)||1);
  base.schoolSwimSpeeds=base.schoolSwimSpeeds.map(v=>Math.max(.55,Math.min(1.65,Number(v)||1)));

  base.schoolEntryDirections=arr3(base.schoolEntryDirections,['northwest','east','south']);
  while(base.schoolEntryDirections.length<3)base.schoolEntryDirections.push(base.entryCorner);
  base.schoolEntryDirections=base.schoolEntryDirections.map(v=>oldDirMap[v]||v).map(v=>validDirs.includes(v)?v:'northwest');

  base.schoolExitDirections=arr3(base.schoolExitDirections,['southeast','west','north']);
  while(base.schoolExitDirections.length<3)base.schoolExitDirections.push(base.exitCorner);
  base.schoolExitDirections=base.schoolExitDirections.map(v=>oldDirMap[v]||v).map(v=>validDirs.includes(v)?v:'southeast');

  base.schoolTouchModes=arr3(base.schoolTouchModes,['repel','repel','repel']);
  while(base.schoolTouchModes.length<3)base.schoolTouchModes.push(base.tapAttract?'attract':'repel');
  base.schoolTouchModes=base.schoolTouchModes.map(v=>['repel','attract','ignore'].includes(v)?v:'repel');

  base.schoolSpawnOutside=arr3(base.schoolSpawnOutside,[true,true,true]);
  while(base.schoolSpawnOutside.length<3)base.schoolSpawnOutside.push(!!base.startOutside);
  base.schoolSpawnOutside=base.schoolSpawnOutside.map(v=>!!v);

  base.schoolFlowerMasks=arr3(base.schoolFlowerMasks,[[true,true,true],[true,true,true],[true,true,true]]);
  while(base.schoolFlowerMasks.length<3)base.schoolFlowerMasks.push([true,true,true]);
  base.schoolFlowerMasks=base.schoolFlowerMasks.map(mask=>{
    const out=Array.isArray(mask)?mask.slice(0,3).map(v=>!!v):[true,true,true];
    while(out.length<3)out.push(true);
    if(!out.some(Boolean))out[0]=true;
    return out;
  });

  base.recordResetScene=base.recordResetScene!==false;
  base.recordEntryDelaySeconds=Math.max(0,Math.min(10,Number(base.recordEntryDelaySeconds)||0));
  base.bloomSomeOnReset=!!base.bloomSomeOnReset;

  if(base.schoolFishCounts.slice(0,Math.max(1,base.schoolCount)).reduce((a,b)=>a+b,0)<=0)base.schoolFishCounts[0]=Math.max(1,Number(base.fishCount)||28);
  return base;
}
let settings=mergedSettings(BASE_DEFAULTS);

const paletteCache={
  leaf:[],
  koi:[],
  flower:[]
};

let rng=mulberry32(settings.seed);
let plants=[], fish=[], schools=[];
let leafGrid=new Map(), fishGrid=new Map();
const prefersReducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
let paused=prefersReducedMotion, elapsed=0, lastTs=performance.now();
let collisionTests=0, frameAvg=16.7, activeBlooms=0;
let sceneResetTimer=null;
let recording=null, recordingChunks=[], recordTimer=null, recordExitTimer=null, recordingStartedAt=0;
let interaction=null, interactionSerial=0;
let pointerFollow={active:false,x:0,y:0};
let spawnOutsideNow=!!settings.startOutside;
let forceAllSchoolsOutsideNow=false;
let entryHoldUntil=0;
let exitSequenceActive=false;
let breadcrumbDrawing=false;
const isLightExport=false;

const LEAF_CELL=34, FISH_CELL=42, TRAIL_LEN=520;
const OUTSIDE_MARGIN=95;
const COVER_COLS=8, COVER_ROWS=11;
let coverage=new Float32Array(COVER_COLS*COVER_ROWS);

function applyCanvasSize(){
  settings.canvasWidth=clamp(Math.round(Number(settings.canvasWidth)||720),320,2160);
  settings.canvasHeight=clamp(Math.round(Number(settings.canvasHeight)||960),320,2160);

  // La simulación mantiene 720 unidades lógicas de ancho para que el tamaño visual
  // de peces y plantas no dependa de la resolución de exportación.
  W=720;
  H=W*settings.canvasHeight/settings.canvasWidth;

  canvas.width=settings.canvasWidth;
  canvas.height=settings.canvasHeight;
  paper.width=Math.max(1,Math.round(W));
  paper.height=Math.max(1,Math.round(H));

  canvas.classList.toggle('fit-viewport',!!settings.fitViewport);
  canvas.classList.toggle('fit-width',!settings.fitViewport);
  canvas.style.aspectRatio=`${settings.canvasWidth} / ${settings.canvasHeight}`;
}

function mulberry32(seed){
  let a=seed>>>0;
  return function(){
    a|=0; a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
const rr=(a=0,b=1)=>a+(b-a)*rng();

function hexToRgb(hex){
  const n=parseInt(hex.slice(1),16);
  return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function rgbToHex(r,g,b){
  const c=n=>Math.round(clamp(n,0,255)).toString(16).padStart(2,'0');
  return '#'+c(r)+c(g)+c(b);
}
function mixHex(a,b,t){
  const A=hexToRgb(a),B=hexToRgb(b);
  return rgbToHex(mix(A.r,B.r,t),mix(A.g,B.g,t),mix(A.b,B.b,t));
}
function luminance(hex){
  const {r,g,b}=hexToRgb(hex);
  return .2126*r+.7152*g+.0722*b;
}
function rebuildPaletteCache(){
  paletteCache.leaf=settings.leafColors.map(c=>({
    base:c,
    edge:mixHex(c,'#ffffff',.22),
    vein:mixHex(c,'#ffffff',.78)
  }));
  paletteCache.koi=settings.schoolPalettes.map((schoolPalette,schoolIndex)=>{
    const count=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
    return schoolPalette.slice(0,count).map(c=>({
      base:c,
      dark:mixHex(c,'#4e1320',.28),
      light:mixHex(c,'#fff4ed',.72)
    }));
  });
  paletteCache.flower=settings.flowerColors.map(c=>({
    base:c,
    inner:mixHex(c,'#fff4f6',.42),
    edge:mixHex(c,'#9d3556',.18),
    center:mixHex(c,'#f6d7a5',.60)
  }));
}

function makePaper(){
  pctx.fillStyle=settings.backgroundColor;
  pctx.fillRect(0,0,W,H);

  const lum=luminance(settings.backgroundColor);
  const light=lum<135;
  const wash=light?'#ffffff':'#000000';

  const g=pctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,light?'rgba(255,255,255,.055)':'rgba(255,255,255,.16)');
  g.addColorStop(.55,light?'rgba(255,255,255,.015)':'rgba(100,96,86,.025)');
  g.addColorStop(1,light?'rgba(0,0,0,.035)':'rgba(90,88,80,.055)');
  pctx.fillStyle=g;pctx.fillRect(0,0,W,H);

  const pr=mulberry32(89217);
  const grainCount=Math.max(1200,Math.round(4300*(W*H)/(720*960)));
  for(let i=0;i<grainCount;i++){
    const x=pr()*W,y=pr()*H;
    const a=pr()*(light?.05:.045);
    pctx.fillStyle=light?`rgba(255,255,255,${a})`:`rgba(50,48,42,${a})`;
    pctx.fillRect(x,y,pr()<.9?1:2,1);
  }
  pctx.globalAlpha=light?.035:.025;
  pctx.strokeStyle=wash;
  const fiberCount=Math.max(34,Math.round(82*H/960));
  for(let i=0;i<fiberCount;i++){
    const y=pr()*H;
    pctx.beginPath();
    pctx.moveTo(pr()*W*.12,y);
    pctx.lineTo(W-pr()*W*.12,y+(pr()-.5)*2);
    pctx.stroke();
  }
  pctx.globalAlpha=1;
}

function normalizedBreadcrumbPoint(p){
  return {
    x:clamp(Number(p?.x)||0,0,1),
    y:clamp(Number(p?.y)||0,0,1)
  };
}
function breadcrumbLogicalPoint(index){
  const list=settings.breadcrumbs||[];
  if(!list.length)return null;
  const p=normalizedBreadcrumbPoint(list[clamp(index,0,list.length-1)]);
  return {x:p.x*W,y:p.y*H};
}

const DIRECTION_VECTORS={
  north:[0,-1],
  northeast:[1,-1],
  east:[1,0],
  southeast:[1,1],
  south:[0,1],
  southwest:[-1,1],
  west:[-1,0],
  northwest:[-1,-1]
};
function directionPoint(direction,outside=true,schoolIndex=0,schoolCount=1,lengthFactor=settings.schoolLength){
  const dir=DIRECTION_VECTORS[direction]||DIRECTION_VECTORS.northwest;
  const dx=dir[0],dy=dir[1];
  const spread=(schoolIndex-(schoolCount-1)/2);
  const margin=OUTSIDE_MARGIN+lengthFactor*85;
  const m=outside?margin:0;
  const cx=W*.5+spread*22, cy=H*.5+spread*18;
  const x = dx<0 ? -m : dx>0 ? W+m : cx;
  const y = dy<0 ? -m : dy>0 ? H+m : cy;
  return {x,y};
}
function insideDirectionPoint(direction,schoolIndex=0,schoolCount=1){
  const dir=DIRECTION_VECTORS[direction]||DIRECTION_VECTORS.northwest;
  const dx=dir[0],dy=dir[1];
  const spread=(schoolIndex-(schoolCount-1)/2);
  const cx=W*.5+spread*18, cy=H*.5+spread*14;
  const x = dx<0 ? W*.16 : dx>0 ? W*.84 : cx;
  const y = dy<0 ? H*.16 : dy>0 ? H*.84 : cy;
  return {x,y};
}
function schoolAllowsFlowerColor(schoolIndex,colorIndex){
  const mask=(settings.schoolFlowerMasks[schoolIndex]||[true,true,true]).slice(0,3);
  return !!mask[colorIndex];
}
function schoolTouchMode(schoolIndex){
  return (settings.schoolTouchModes[schoolIndex]||'repel');
}
function shouldRenderBreadcrumbs(){
  if(!(settings.breadcrumbs&&settings.breadcrumbs.length))return false;
  if(isLightExport)return !!settings.breadcrumbVisibleOutput;
  if(recording&&recording.state==='recording')return !!settings.breadcrumbVisibleOutput;
  return !!settings.breadcrumbVisibleEditor;
}
function drawBreadcrumbs(){
  const list=settings.breadcrumbs||[];
  if(!list.length)return;

  const dark=luminance(settings.backgroundColor)>145;
  ctx.save();
  ctx.lineCap='round';
  ctx.lineJoin='round';

  if(list.length>1){
    ctx.beginPath();
    for(let i=0;i<list.length;i++){
      const p=breadcrumbLogicalPoint(i);
      if(i===0)ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
    }
    ctx.setLineDash([7,9]);
    ctx.lineWidth=1.2;
    ctx.strokeStyle=dark?'rgba(38,55,62,.34)':'rgba(255,255,255,.40)';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const step=Math.max(1,Math.floor(list.length/90));
  for(let i=0;i<list.length;i+=step){
    const p=breadcrumbLogicalPoint(i);
    const first=i===0,last=i>=list.length-step;
    ctx.beginPath();
    ctx.arc(p.x,p.y,first||last?3.4:2.1,0,TAU);
    ctx.fillStyle=first
      ?'rgba(255,239,156,.88)'
      :last?'rgba(255,177,177,.88)'
      :(dark?'rgba(31,52,57,.46)':'rgba(255,255,255,.54)');
    ctx.fill();
  }
  ctx.restore();
}
function addBreadcrumbPoint(x,y){
  settings.breadcrumbs=settings.breadcrumbs||[];
  const nx=clamp(x/W,0,1),ny=clamp(y/H,0,1);
  const last=settings.breadcrumbs[settings.breadcrumbs.length-1];
  if(last){
    const dx=(nx-last.x)*W,dy=(ny-last.y)*H;
    if(dx*dx+dy*dy<11*11)return;
  }
  settings.breadcrumbs.push({x:nx,y:ny});
  for(const s of schools){
    s.breadcrumbDone=false;
    if(settings.breadcrumbs.length===1)s.crumbIndex=0;
  }
}
function triggerExitAll(){
  exitSequenceActive=true;
  for(const s of schools){
    s.exitActive=true;
    s.entryActive=false;
    s.exitTarget=directionPoint(s.exitDirection||settings.exitCorner,true,s.index,s.count,s.lengthFactor);
    s.navTarget=null;
    s.navPlantIndex=-1;
  }
  updateSceneState();
}
function allFishOutside(){
  if(!fish.length)return true;
  return fish.every(f=>f.x<-18||f.x>W+18||f.y<-18||f.y>H+18);
}

function riverX(y){
  const phase=(settings.seed%997)/997*TAU;
  return W*(.5+.13*Math.sin(y/H*TAU*.92+phase)+.055*Math.sin(y/H*TAU*2.1+phase*1.7));
}

function compositionDensity(x,y,clusters){
  const dx=Math.abs(x-riverX(y));
  const river=clamp((dx-settings.riverWidth*.42)/(settings.riverWidth*1.25),.08,1);
  let c=.12;
  for(const b of clusters){
    const q=((x-b.x)**2/(b.rx*b.rx))+((y-b.y)**2/(b.ry*b.ry));
    c=Math.max(c,Math.exp(-q*1.55)*b.w);
  }
  const edge=.72+.28*Math.abs(y/H-.5)*2;
  return clamp((.26+.74*c)*river*edge,.03,.98);
}

class Plant{
  constructor(x,y,r,rot,shapeSeed,kind,leafColorIndex){
    this.x=x;this.y=y;this.r=r;this.rot=rot;
    this.bloom=0;this.target=0;this.vel=0;
    this.lastHit=-1e9;this.hitFlash=0;
    this.openedAt=0;
    this.shape=kind==='notched'?makeLeafShape(shapeSeed):null;
    this.kind=kind;
    this.leafColorIndex=leafColorIndex;
    this.flowerColorIndex=0;
    this.petalPhase=(shapeSeed%1000)/1000*TAU;
  }
  hit(now){
    if(now-this.lastHit<165)return;
    this.lastHit=now;
    this.target=clamp(this.target+settings.bloomPower,0,1);
    if(this.target>.94)this.target=1;
    // Un nuevo roce sobre una flor abierta prolonga su permanencia.
    if(settings.autoCloseFlowers&&this.target>=.94)this.openedAt=now;
    this.hitFlash=1;
  }
  update(dt,now){
    const k=34,damping=10.8;
    this.vel+=(this.target-this.bloom)*k*dt;
    this.vel*=Math.exp(-damping*dt);
    this.bloom+=this.vel*dt;
    this.bloom=clamp(this.bloom,-.02,1.02);
    this.hitFlash=Math.max(0,this.hitFlash-dt*2.5);

    if(settings.autoCloseFlowers){
      if(this.target>=.94&&this.bloom>=.93){
        if(!this.openedAt)this.openedAt=now;
        if(now-this.openedAt>=Math.max(1,settings.flowerOpenSeconds)*1000){
          this.target=0;
          this.openedAt=0;
        }
      }else if(this.target<.1&&this.bloom<.08){
        this.openedAt=0;
      }
    }else{
      this.openedAt=0;
    }
  }
}

function makeLeafShape(seed){
  const r=mulberry32(seed),n=20,radii=[];
  let prev=.96;
  for(let i=0;i<n;i++){
    const v=.86+r()*.19;
    prev=prev*.55+v*.45;
    radii.push(prev);
  }
  return radii;
}

function generatePlants(){
  rng=mulberry32(settings.seed);
  plants=[];
  leafGrid=new Map();

  const clusters=[];
  for(let i=0;i<7;i++){
    clusters.push({
      x:rr(W*.08,W*.92),y:rr(H*.04,H*.96),
      rx:rr(100,230),ry:rr(120,270),w:rr(.72,1)
    });
  }

  const placeGrid=new Map(),cell=22;
  const maxAttempts=settings.plantCount*75;
  let attempts=0;

  while(plants.length<settings.plantCount&&attempts++<maxAttempts){
    const x=rr(18,W-18),y=rr(18,H-18);
    if(rng()>compositionDensity(x,y,clusters))continue;

    const rad=rr(7.1,12.7)*(rng()<.08?rr(1.08,1.28):1);
    const gx=Math.floor(x/cell),gy=Math.floor(y/cell);
    let ok=true;
    for(let ix=gx-1;ix<=gx+1&&ok;ix++){
      for(let iy=gy-1;iy<=gy+1&&ok;iy++){
        const bucket=placeGrid.get(ix+','+iy);
        if(!bucket)continue;
        for(const p of bucket){
          const minD=(rad+p.r)*.72+2.6;
          if((x-p.x)**2+(y-p.y)**2<minD*minD){ok=false;break;}
        }
      }
    }
    if(!ok)continue;

    const kind=rng()<settings.circleRatio?'circle':'notched';
    const leafColorIndex=Math.floor(rng()*104729);
    const shapeSeed=(settings.seed*73856093+plants.length*19349663)>>>0;
    const p=new Plant(x,y,rad,rr(0,TAU),shapeSeed,kind,leafColorIndex);
    plants.push(p);

    const key=gx+','+gy;
    if(!placeGrid.has(key))placeGrid.set(key,[]);
    placeGrid.get(key).push(p);
  }

  assignFlowerColors();

  for(let i=0;i<plants.length;i++){
    const p=plants[i];
    const key=Math.floor(p.x/LEAF_CELL)+','+Math.floor(p.y/LEAF_CELL);
    if(!leafGrid.has(key))leafGrid.set(key,[]);
    leafGrid.get(key).push(i);
  }
}

function normalizedFlowerWeights(){
  const n=settings.flowerPaletteCount;
  const w=settings.flowerWeights.slice(0,n).map(v=>Math.max(0,v));
  let sum=w.reduce((a,b)=>a+b,0);
  if(sum<=0){w.fill(1);sum=n;}
  return w.map(v=>v/sum);
}

function assignFlowerColors(){
  if(!plants.length)return;
  const n=settings.flowerPaletteCount;
  const weights=normalizedFlowerWeights();

  // Reparto por "largest remainder" para que los sliders representen cantidades reales.
  const raw=weights.map(w=>w*plants.length);
  const counts=raw.map(Math.floor);
  let remain=plants.length-counts.reduce((a,b)=>a+b,0);
  const order=raw.map((v,i)=>({i,frac:v-Math.floor(v)})).sort((a,b)=>b.frac-a.frac);
  for(let i=0;i<remain;i++)counts[order[i%order.length].i]++;

  const bag=[];
  for(let i=0;i<n;i++)for(let j=0;j<counts[i];j++)bag.push(i);

  const sr=mulberry32((settings.seed^0x51ed270b)>>>0);
  for(let i=bag.length-1;i>0;i--){
    const j=Math.floor(sr()*(i+1));
    [bag[i],bag[j]]=[bag[j],bag[i]];
  }
  plants.forEach((p,i)=>p.flowerColorIndex=bag[i]??0);
  updateFlowerWeightOutputs();
}

function coverageIndex(x,y){
  const cx=clamp(Math.floor(x/W*COVER_COLS),0,COVER_COLS-1);
  const cy=clamp(Math.floor(y/H*COVER_ROWS),0,COVER_ROWS-1);
  return cy*COVER_COLS+cx;
}
function markCoverage(x,y,dt){
  coverage[coverageIndex(x,y)]+=dt;
}
function targetReservedByOtherSchool(plantIndex,schoolIndex){
  for(const s of schools){
    if(s.index!==schoolIndex&&s.navPlantIndex===plantIndex)return true;
  }
  return false;
}

class School{
  constructor(index,count){
    this.index=index;
    this.count=count;

    this.fishCount=Math.max(0,Math.round(settings.schoolFishCounts[index]||0));
    this.tightness=clamp(Number(settings.schoolTightnesses[index]??settings.schoolTightness),0,1);
    this.lengthFactor=clamp(Number(settings.schoolLengths[index]??settings.schoolLength),0,1);
    this.speedFactor=Math.max(.55,Math.min(1.65,Number(settings.schoolSwimSpeeds[index]??settings.swimSpeed)||1));
    this.entryDirection=settings.schoolEntryDirections[index]||settings.entryCorner;
    this.exitDirection=settings.schoolExitDirections[index]||settings.exitCorner;
    this.touchMode=settings.schoolTouchModes[index]||'repel';
    this.spawnOutside=!!settings.schoolSpawnOutside[index];
    this.flowerMask=(settings.schoolFlowerMasks[index]||[true,true,true]).slice(0,3);

    const spread=(index-(count-1)/2);
    const startsOutside=!!(spawnOutsideNow&&(forceAllSchoolsOutsideNow||this.spawnOutside));
    const start=startsOutside
      ?directionPoint(this.entryDirection,true,index,count,this.lengthFactor)
      :{x:W*.5+spread*46,y:H*.48+spread*30};
    this.x=start.x;
    this.y=start.y;
    this.vx=0;this.vy=0;
    this.phase=(settings.seed*.0017+index*2.17)%TAU;
    this.navRng=mulberry32((settings.seed^((index+1)*0x45d9f3b))>>>0);
    this.navTarget=null;
    this.navPlantIndex=-1;
    this.navUntil=0;
    this.crumbIndex=0;
    this.breadcrumbDone=false;
    this.entryActive=startsOutside;
    this.entryHoldUntil=startsOutside?entryHoldUntil:0;
    this.entryTarget=insideDirectionPoint(this.entryDirection,index,count);
    this.exitActive=false;
    this.exitTarget=null;
    this.trail=new Array(TRAIL_LEN);
    this.trailHead=0;

    if(this.entryActive){
      let fx=this.entryTarget.x-this.x,fy=this.entryTarget.y-this.y;
      const fm=Math.hypot(fx,fy)||1;fx/=fm;fy/=fm;
      for(let i=0;i<TRAIL_LEN;i++){
        const back=i*1.04;
        this.trail[i]={x:this.x-fx*back,y:this.y-fy*back,heading:Math.atan2(fy,fx)};
      }
    }else{
      for(let i=0;i<TRAIL_LEN;i++){
        const back=i*1.02;
        this.trail[i]={
          x:clamp(this.x-back,25,W-25),
          y:clamp(this.y+Math.sin(i*.033+this.phase)*8,25,H-25),
          heading:0
        };
      }
    }
  }
  sample(lag){
    lag=Number.isFinite(lag)?lag:0;
    const pos=this.trailHead-lag;
    const a=((Math.floor(pos)%TRAIL_LEN)+TRAIL_LEN)%TRAIL_LEN;
    const b=((a-1)%TRAIL_LEN+TRAIL_LEN)%TRAIL_LEN;
    const t=Number.isFinite(pos)?pos-Math.floor(pos):0;
    const fallback=this.trail[this.trailHead]||{x:this.x,y:this.y,heading:0};
    const A=this.trail[a]||fallback,B=this.trail[b]||A;
    return {x:mix(A.x,B.x,t),y:mix(A.y,B.y,t),heading:mix(A.heading,B.heading,t)};
  }
  pushTrail(){
    this.trailHead=(this.trailHead+1)%TRAIL_LEN;
    this.trail[this.trailHead]={x:this.x,y:this.y,heading:Math.atan2(this.vy,this.vx)};
  }
  chooseNavigationTarget(now){
    let best=-Infinity,bestIndex=-1;
    let bx=W*.5,by=H*.5;

    // Prioridad 1: plantas poco convertidas; prioridad 2: zonas poco visitadas.
    // El ligero término aleatorio evita rutas periódicas incluso con la misma densidad local.
    for(let i=0;i<plants.length;i++){
      const p=plants[i];
      if(!schoolAllowsFlowerColor(this.index,p.flowerColorIndex%settings.flowerPaletteCount))continue;
      const green=1-clamp(Math.max(p.bloom,p.target));
      const dx=p.x-this.x,dy=p.y-this.y;
      const d=Math.hypot(dx,dy);
      const cov=coverage[coverageIndex(p.x,p.y)];
      const distScore=clamp(1-Math.abs(d-275)/310,-.55,1);
      const reserved=targetReservedByOtherSchool(i,this.index)?1:0;
      const tooClose=d<55?1:0;
      const score=green*5.5 + 2.6/(1+cov*.38) + distScore*.9
        + this.navRng()*.62 - reserved*3.4 - tooClose*.75;
      if(score>best){best=score;bestIndex=i;bx=p.x;by=p.y;}
    }

    if(bestIndex>=0){
      const p=plants[bestIndex];
      let dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1;
      dx/=d;dy/=d;
      // No apuntamos al centro y paramos: colocamos el destino un poco más allá para que el cardumen cruce la planta.
      const through=42+this.navRng()*28;
      this.navTarget={
        x:clamp(p.x+dx*through,35,W-35),
        y:clamp(p.y+dy*through,35,H-35)
      };
      this.navPlantIndex=bestIndex;
      this.navUntil=now+4300+this.navRng()*3200;
      return;
    }

    // Fallback cuando ya no hay plantas útiles: visitar la celda global menos recorrida.
    let cellBest=-Infinity,cell=0;
    for(let i=0;i<coverage.length;i++){
      const score=-coverage[i]+this.navRng()*.55;
      if(score>cellBest){cellBest=score;cell=i;}
    }
    const cx=cell%COVER_COLS,cy=Math.floor(cell/COVER_COLS);
    this.navTarget={
      x:(cx+.5)*W/COVER_COLS,
      y:(cy+.5)*H/COVER_ROWS
    };
    this.navPlantIndex=-1;
    this.navUntil=now+4200+this.navRng()*2400;
  }
  breadcrumbTarget(){
    const list=settings.breadcrumbs||[];
    if(!settings.useBreadcrumbs||!list.length||this.breadcrumbDone)return null;

    this.crumbIndex=clamp(this.crumbIndex,0,list.length-1);
    let p=breadcrumbLogicalPoint(this.crumbIndex);
    if(!p)return null;

    const close=(this.x-p.x)**2+(this.y-p.y)**2<32*32;
    if(close){
      if(this.crumbIndex<list.length-1){
        this.crumbIndex++;
      }else if(settings.breadcrumbLoop){
        this.crumbIndex=0;
      }else{
        this.breadcrumbDone=true;
        return null;
      }
      p=breadcrumbLogicalPoint(this.crumbIndex);
    }
    return p;
  }
  autonomousTarget(now){
    if(this.exitActive)return this.exitTarget||directionPoint(this.exitDirection,true,this.index,this.count,this.lengthFactor);

    if(this.entryActive){
      if(this.entryHoldUntil&&now<this.entryHoldUntil)return {x:this.x,y:this.y};
      const close=(this.x-this.entryTarget.x)**2+(this.y-this.entryTarget.y)**2<34*34;
      if(!close)return this.entryTarget;
      this.entryActive=false;
      this.navTarget=null;
      this.navPlantIndex=-1;
      this.navUntil=0;
      this.crumbIndex=0;
      this.breadcrumbDone=false;
    }

    const crumb=this.breadcrumbTarget();
    if(crumb)return crumb;

    const p=this.navPlantIndex>=0?plants[this.navPlantIndex]:null;
    const converted=p&&Math.max(p.bloom,p.target)>.94;
    const close=this.navTarget&&((this.x-this.navTarget.x)**2+(this.y-this.navTarget.y)**2<34*34);
    if(!this.navTarget||now>this.navUntil||close||converted)this.chooseNavigationTarget(now);
    return this.navTarget||{x:W*.5,y:H*.5};
  }
  update(dt,now){
    let target=this.autonomousTarget(now);

    // El seguimiento del puntero dirige al líder del cardumen, no a cada koi.
    // La formación continúa leyendo el trail y conserva separación, cohesión,
    // longitud, velocidad y curvatura. Cerca del puntero se añade una componente
    // tangencial para que el líder siga circulando si el mouse queda quieto.
    const entryHeld=!!(this.entryHoldUntil&&now<this.entryHoldUntil);
    const livePointerFollow=!entryHeld&&!this.entryActive&&!this.exitActive&&settings.followPointer&&pointerFollow.active;
    if(livePointerFollow){
      let dx=pointerFollow.x-this.x,dy=pointerFollow.y-this.y;
      let dist=Math.hypot(dx,dy);
      if(dist<1){
        const heading=Math.hypot(this.vx,this.vy)>1?Math.atan2(this.vy,this.vx):this.phase;
        dx=Math.cos(heading);dy=Math.sin(heading);dist=1;
      }
      const ux=dx/dist,uy=dy/dist;
      const desiredRadius=62+this.lengthFactor*42+this.index*12;
      const radialStep=clamp((dist-desiredRadius)*.82,-58,180);
      const nearFactor=1-smooth(clamp((dist-desiredRadius)/(desiredRadius*2.7),0,1));
      const orbitSign=this.index%2===0?1:-1;
      const tangentStep=(32+desiredRadius*.44)*nearFactor*orbitSign;
      const pointerTarget={
        x:this.x+ux*radialStep-uy*tangentStep,
        y:this.y+uy*radialStep+ux*tangentStep
      };
      target={
        x:mix(target.x,pointerTarget.x,.94),
        y:mix(target.y,pointerTarget.y,.94)
      };
    }

    if(interaction&&schoolTouchMode(this.index)==='repel'){
      const age=(now-interaction.start)/1000;
      if(age<1.05){
        let dx=this.x-interaction.x,dy=this.y-interaction.y;
        let d=Math.hypot(dx,dy)||1;
        const power=(1-age/1.05)*settings.tapStrength;
        target={x:target.x+dx/d*170*power,y:target.y+dy/d*170*power};
      }
    }

    if(!this.exitActive){
      target.x=clamp(target.x,40,W-40);
      target.y=clamp(target.y,40,H-40);
    }

    const k=this.exitActive?12.5:9.4,d=this.exitActive?5.2:5.9;
    this.vx+=((target.x-this.x)*k-this.vx*d)*dt;
    this.vy+=((target.y-this.y)*k-this.vy*d)*dt;

    const sp=Math.hypot(this.vx,this.vy),max=(this.exitActive?330:225)*this.speedFactor;
    if(sp>max){this.vx=this.vx/sp*max;this.vy=this.vy/sp*max;}

    this.x+=this.vx*dt;
    this.y+=this.vy*dt;
    if(this.entryActive||this.exitActive){
      const m=OUTSIDE_MARGIN+this.lengthFactor*110;
      this.x=clamp(this.x,-m,W+m);
      this.y=clamp(this.y,-m,H+m);
    }else{
      this.x=clamp(this.x,25,W-25);
      this.y=clamp(this.y,25,H-25);
    }
    if(this.x>=0&&this.x<=W&&this.y>=0&&this.y<=H)markCoverage(this.x,this.y,dt);
    this.pushTrail();
  }
}

class Koi{
  constructor(i,school,localIndex,localCount){
    this.i=i;
    this.school=school;
    this.localIndex=localIndex;
    this.localCount=localCount;
    this.x=school.x+rr(-14,14);
    this.y=school.y+rr(-14,14);
    this.vx=rr(-8,8);this.vy=rr(-8,8);
    this.heading=rr(-.2,.2);
    this.curvature=0;
    this.phase=rr(0,TAU);
    this.length=rr(16,25);
    this.width=this.length*rr(.22,.31);
    this.u=localCount<=1?.5:localIndex/(localCount-1);
    this.u=clamp(this.u+rr(-.018,.018),0,1);
    this.lateralUnit=(((localIndex+1)*.61803398875+.17)%1)*2-1;
    this.longJitter=rr(-3.5,3.5);
    this.prevX=this.x;this.prevY=this.y;
    this.tailX=this.x;this.tailY=this.y;
    // Índice estable dentro de la paleta de SU cardumen.
    // localIndex % N mantiene un reparto aproximadamente equilibrado.
    this.schoolColorSlot=localIndex;
    this.touchSerial=-1;
  }
  update(dt,now){
    const tight=this.school.tightness;
    const length=this.school.lengthFactor;
    const lagSpan=mix(12,335,length);
    const lag=5+this.u*lagSpan+this.longJitter;
    const halfWidth=mix(27,6.2,tight);
    const envelope=Math.pow(Math.max(.06,Math.sin(Math.PI*clamp(this.u,.018,.982))),.64);
    const followGain=(this.school.exitActive?1.35:1)*mix(4.0,10.6,tight);

    let tx,ty;
    let directAttract=false;
    const entryHeld=!!(this.school.entryHoldUntil&&now<this.school.entryHoldUntil);

    // El mouse nunca sustituye el objetivo individual de un koi: cada pez sigue
    // el trail de su líder. La atracción directa queda reservada al toque/clic.
    if(!entryHeld&&interaction&&schoolTouchMode(this.school.index)==='attract'&&interaction.phase==='approach'){
      directAttract=true;
      tx=interaction.x;ty=interaction.y;
    }else{
      const a=this.school.sample(lag);
      const b=this.school.sample(lag+4);
      let dx=a.x-b.x,dy=a.y-b.y;
      let m=Math.hypot(dx,dy)||1;
      const nx=-dy/m,ny=dx/m;
      const lane=this.lateralUnit*halfWidth*envelope;
      tx=a.x+nx*lane;
      ty=a.y+ny*lane;
    }

    let gain=directAttract?11.8*settings.tapStrength:followGain;
    let ax=(tx-this.x)*gain;
    let ay=(ty-this.y)*gain;

    const gx=Math.floor(this.x/FISH_CELL),gy=Math.floor(this.y/FISH_CELL);
    const separationScale=directAttract?.16:mix(.98,.40,tight);
    for(let ix=gx-1;ix<=gx+1;ix++)for(let iy=gy-1;iy<=gy+1;iy++){
      const bucket=fishGrid.get(ix+','+iy);
      if(!bucket)continue;
      for(const other of bucket){
        if(other===this)continue;
        const sx=this.x-other.x,sy=this.y-other.y;
        const d2=sx*sx+sy*sy;
        if(d2>1&&d2<420){
          const f=(420-d2)/420*.72*separationScale;
          ax+=sx*f;ay+=sy*f;
        }
      }
    }

    if(!entryHeld&&interaction&&schoolTouchMode(this.school.index)==='repel'){
      const age=(now-interaction.start)/1000;
      if(age<1.0){
        let dx=this.x-interaction.x,dy=this.y-interaction.y;
        let d=Math.hypot(dx,dy);
        if(d<1){
          const a=(this.i*2.399963+this.school.index*.71)%TAU;
          dx=Math.cos(a);dy=Math.sin(a);d=1;
        }
        const local=clamp(1-d/340,.08,1);
        const pulse=(1-age/1.0)*settings.tapStrength;
        const force=1500*local*pulse;
        ax+=dx/d*force;
        ay+=dy/d*force;
      }
    }

    const damp=Math.exp(-(directAttract?4.3:5.7)*dt);
    this.vx=(this.vx+ax*dt)*damp;
    this.vy=(this.vy+ay*dt)*damp;

    const maxV=(directAttract?310:(this.school.exitActive?215:150))*this.school.speedFactor*(directAttract?Math.max(.9,settings.tapStrength):1);
    const sp=Math.hypot(this.vx,this.vy);
    if(sp>maxV){this.vx=this.vx/sp*maxV;this.vy=this.vy/sp*maxV;}

    this.prevX=this.x;this.prevY=this.y;
    this.x+=this.vx*dt*this.school.speedFactor;
    this.y+=this.vy*dt*this.school.speedFactor;
    const outM=OUTSIDE_MARGIN+this.school.lengthFactor*130;
    this.x=clamp(this.x,-outM,W+outM);
    this.y=clamp(this.y,-outM,H+outM);

    const moveX=this.x-this.prevX,moveY=this.y-this.prevY;
    const motion=Math.hypot(moveX,moveY);
    if(motion>.03){
      const desired=Math.atan2(moveY,moveX);
      const turn=angleDiff(desired,this.heading);
      this.curvature=mix(this.curvature,clamp(turn*4,-1,1),1-Math.exp(-8*dt));
      this.heading+=turn*(1-Math.exp(-12*dt));
    }else{
      this.curvature*=Math.exp(-4*dt);
    }

    const speed01=clamp(sp/(120*this.school.speedFactor),0,1);
    this.phase+=dt*(5.2+speed01*5.6)*this.school.speedFactor;

    const tail=fishTailPoint(this);
    this.tailX=tail.x;this.tailY=tail.y;

    if(directAttract&&interaction&&this.touchSerial!==interaction.serial){
      const dx=this.x-interaction.x,dy=this.y-interaction.y;
      if(dx*dx+dy*dy<14*14){
        this.touchSerial=interaction.serial;
        interaction.touched++;
      }
    }
  }
  paletteIndex(){
    const schoolIndex=this.school.index;
    const count=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
    return clamp(this.schoolColorSlot||0,0,count-1);
  }
}

function normalizedSchoolColorWeights(schoolIndex){
  const n=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
  const source=(settings.schoolColorWeights[schoolIndex]||[34,33,33]).slice(0,n).map(v=>Math.max(0,Number(v)||0));
  let sum=source.reduce((a,b)=>a+b,0);
  if(sum<=0){source.fill(1);sum=n;}
  return source.map(v=>v/sum);
}

function assignKoiColors(){
  for(let schoolIndex=0;schoolIndex<settings.schoolCount;schoolIndex++){
    const members=fish.filter(f=>f.school.index===schoolIndex);
    if(!members.length)continue;

    const n=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
    const weights=normalizedSchoolColorWeights(schoolIndex);
    const raw=weights.map(w=>w*members.length);
    const counts=raw.map(Math.floor);
    let remain=members.length-counts.reduce((a,b)=>a+b,0);
    const order=raw.map((v,i)=>({i,frac:v-Math.floor(v)})).sort((a,b)=>b.frac-a.frac);
    for(let i=0;i<remain;i++)counts[order[i%order.length].i]++;

    const bag=[];
    for(let i=0;i<n;i++)for(let j=0;j<counts[i];j++)bag.push(i);
    const sr=mulberry32((settings.seed^((schoolIndex+1)*0x6d2b79f5))>>>0);
    for(let i=bag.length-1;i>0;i--){
      const j=Math.floor(sr()*(i+1));
      [bag[i],bag[j]]=[bag[j],bag[i]];
    }
    members.forEach((f,i)=>f.schoolColorSlot=bag[i]??0);
  }
  updateKoiWeightOutputs();
}

function generateSchoolsAndFish(){
  settings.schoolCount=Math.max(1,Math.min(settings.schoolCount,3));
  syncSchoolUI();

  const counts=(settings.schoolFishCounts||[settings.fishCount||28,0,0]).slice(0,settings.schoolCount).map(v=>Math.max(0,Math.round(Number(v)||0)));
  if(counts.reduce((a,b)=>a+b,0)<=0)counts[0]=1;
  settings.fishCount=counts.reduce((a,b)=>a+b,0);

  rng=mulberry32((settings.seed^0x9e3779b9)>>>0);
  schools=[];
  for(let i=0;i<settings.schoolCount;i++)schools.push(new School(i,settings.schoolCount));

  fish=[];
  let id=0;
  for(let schoolIndex=0;schoolIndex<settings.schoolCount;schoolIndex++){
    const count=counts[schoolIndex];
    for(let localIndex=0;localIndex<count;localIndex++){
      fish.push(new Koi(id++,schools[schoolIndex],localIndex,count));
    }
  }
  assignKoiColors();
}

function buildFishGrid(){
  fishGrid.clear();
  for(const f of fish){
    const key=Math.floor(f.x/FISH_CELL)+','+Math.floor(f.y/FISH_CELL);
    if(!fishGrid.has(key))fishGrid.set(key,[]);
    fishGrid.get(key).push(f);
  }
}

function collideTail(f,now){
  const x=f.tailX,y=f.tailY;
  const gx=Math.floor(x/LEAF_CELL),gy=Math.floor(y/LEAF_CELL);
  for(let ix=gx-1;ix<=gx+1;ix++)for(let iy=gy-1;iy<=gy+1;iy++){
    const bucket=leafGrid.get(ix+','+iy);
    if(!bucket)continue;
    for(const id of bucket){
      collisionTests++;
      const p=plants[id];
      const r=p.r+9.5;
      const dx=x-p.x,dy=y-p.y;
      if(dx*dx+dy*dy<r*r)p.hit(now);
    }
  }
}

function applyBloomSample({deterministic=false}={}){
  if(!plants.length)return 0;
  const salt=deterministic?0x7f4a7c15:Date.now();
  const local=mulberry32((settings.seed^salt)>>>0);
  let changed=0;
  for(const p of plants){
    if(local()<.075){
      p.target=Math.max(p.target,.55+local()*.45);
      changed++;
    }
  }
  if(changed===0&&plants.length){
    const p=plants[Math.floor(local()*plants.length)];
    p.target=Math.max(p.target,.72);
    changed=1;
  }
  return changed;
}

function updateInteraction(now){
  if(!interaction)return;
  const age=(now-interaction.start)/1000;

  if(interaction.hasAttract){
    if(interaction.phase==='approach'){
      if(interaction.touched>=interaction.attractTargetCount||age>Math.min(4.5,3.2/settings.tapStrength)){
        interaction.phase='return';
        interaction.returnStart=now;
      }
    }else if(interaction.phase==='return'){
      if((now-interaction.returnStart)/1000>.72)interaction=null;
    }
  }else{
    if(age>1.05)interaction=null;
  }
}

function update(dt,now){
  elapsed+=dt;
  updateInteraction(now);

  for(const s of schools)s.update(dt,now);
  buildFishGrid();

  for(const f of fish)f.update(dt,now);
  for(const f of fish)collideTail(f,now);

  activeBlooms=0;
  for(const p of plants){
    p.update(dt,now);
    if(p.bloom>.015&&p.bloom<.985)activeBlooms++;
  }
  if(exitSequenceActive&&allFishOutside())exitSequenceActive=false;
}

function drawLeaf(p){
  const t=clamp(p.bloom);
  const fade=1-smooth(clamp((t-.12)/.78));
  if(fade<.015)return;

  const pal=paletteCache.leaf[p.leafColorIndex%settings.leafPaletteCount];
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.rot);
  const scale=1-.085*smooth(t);
  ctx.scale(scale,scale);

  if(p.kind==='circle'){
    // Segundo tipo: deliberadamente un círculo simple.
    ctx.beginPath();
    ctx.arc(0,0,p.r,0,TAU);
    ctx.globalAlpha=.76*fade;
    ctx.fillStyle=pal.base;
    ctx.fill();
    ctx.globalAlpha=.30*fade;
    ctx.strokeStyle=pal.edge;
    ctx.lineWidth=1.8;
    ctx.stroke();
  }else{
    const gap=.62,n=p.shape.length;
    const start=-Math.PI/2+gap/2,sweep=TAU-gap;
    const pts=[];

    ctx.beginPath();
    ctx.moveTo(0,0);
    for(let i=0;i<n;i++){
      const a=start+sweep*(i/(n-1));
      const r=p.r*p.shape[i];
      pts.push([Math.cos(a)*r,Math.sin(a)*r]);
    }
    ctx.lineTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length-1;i++){
      const mx=(pts[i][0]+pts[i+1][0])*.5;
      const my=(pts[i][1]+pts[i+1][1])*.5;
      ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);
    }
    const last=pts[pts.length-1];
    ctx.lineTo(last[0],last[1]);
    ctx.closePath();

    ctx.globalAlpha=.77*fade;
    ctx.fillStyle=pal.base;
    ctx.fill();

    ctx.globalAlpha=.36*fade;
    ctx.strokeStyle=pal.edge;
    ctx.lineWidth=2.1;
    ctx.stroke();

    ctx.lineCap='round';
    ctx.strokeStyle=pal.vein;
    ctx.globalAlpha=.22*fade;
    for(let i=0;i<7;i++){
      const a=-Math.PI/2+gap*.68+(i/6)*(TAU-gap*1.36);
      const len=p.r*(.52+.33*((i%3)/2));
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);
      ctx.lineWidth=.75;
      ctx.stroke();
    }
  }

  if(p.hitFlash>0){
    ctx.globalAlpha=p.hitFlash*.24;
    ctx.beginPath();
    ctx.arc(0,0,p.r*(1+p.hitFlash*.16),0,TAU);
    ctx.strokeStyle=paletteCache.flower[p.flowerColorIndex%settings.flowerPaletteCount].inner;
    ctx.lineWidth=1.4;
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha=1;
}

function drawPetal(cx,cy,rot,len,w,alpha,pal,inner=false){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(-w*.74,-len*.12,-w*.56,-len*.72,0,-len);
  ctx.bezierCurveTo(w*.56,-len*.72,w*.74,-len*.12,0,0);
  ctx.closePath();

  ctx.globalAlpha=alpha;
  ctx.fillStyle=inner?pal.inner:pal.base;
  ctx.fill();

  ctx.globalAlpha=alpha*.28;
  ctx.strokeStyle=pal.edge;
  ctx.lineWidth=.6;
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha=1;
}

function drawBloom(p){
  const t=clamp(p.bloom);
  if(t<.015)return;

  const pal=paletteCache.flower[p.flowerColorIndex%settings.flowerPaletteCount];
  const outer=9;

  for(let i=0;i<outer;i++){
    const delay=i*.024;
    const raw=clamp((t-delay)/(.60+delay*.15));
    const q=smooth(raw);
    if(q<=0)continue;

    const a=p.rot+p.petalPhase*.06+i/outer*TAU;
    const len=p.r*(.24+1.06*easeOutCubic(q));
    const w=p.r*(.035+.34*smooth(clamp((q-.08)/.92)));

    // Las nervaduras de nenúfar se convierten en cintas; en el circular la cinta nace del centro.
    if(q<.34){
      const lineQ=smooth(q/.34);
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x+Math.cos(a)*len*.78,p.y+Math.sin(a)*len*.78);
      ctx.strokeStyle=pal.inner;
      ctx.globalAlpha=.22+.45*lineQ;
      ctx.lineWidth=.7+lineQ*2.5;
      ctx.lineCap='round';
      ctx.stroke();
      ctx.globalAlpha=1;
    }

    if(q>.11){
      const pet=smooth((q-.11)/.89);
      drawPetal(p.x,p.y,a+Math.PI/2,len,w,(.22+.66*pet)*pet,pal,false);
    }
  }

  const innerStart=.42;
  if(t>innerStart){
    for(let i=0;i<6;i++){
      const raw=clamp((t-innerStart-i*.025)/.45);
      const q=smooth(raw);
      if(q<=0)continue;
      const a=p.rot+.22+i/6*TAU;
      drawPetal(
        p.x,p.y,a+Math.PI/2,
        p.r*(.34+.58*q),
        p.r*(.08+.25*q),
        .16+.68*q,
        pal,true
      );
    }
  }

  if(t>.67){
    const q=smooth((t-.67)/.33);
    ctx.fillStyle=pal.center;
    ctx.globalAlpha=.62*q;
    for(let i=0;i<7;i++){
      const a=i/7*TAU+p.rot;
      const r=p.r*.17*q;
      ctx.beginPath();
      ctx.arc(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,Math.max(.6,p.r*.055*q),0,TAU);
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }
}

function fishTailLocal(f){
  const wave=Math.sin(f.phase)*f.width*.78;
  const turn=-f.curvature*f.width*1.45;
  return wave+turn;
}
function fishTailPoint(f){
  const localX=-f.length*.60,localY=fishTailLocal(f);
  const c=Math.cos(f.heading),s=Math.sin(f.heading);
  return {x:f.x+localX*c-localY*s,y:f.y+localX*s+localY*c};
}

function drawFish(f){
  const L=f.length,Wd=f.width,tailY=fishTailLocal(f),bend=-f.curvature*Wd*.72;
  const schoolPalette=paletteCache.koi[f.school.index]||paletteCache.koi[0];
  const pal=schoolPalette[f.paletteIndex()]||schoolPalette[0];

  ctx.save();
  ctx.translate(f.x,f.y);
  ctx.rotate(f.heading);

  ctx.beginPath();
  ctx.moveTo(-L*.55,tailY*.74);
  ctx.lineTo(-L*.94,tailY*1.08);
  ctx.strokeStyle=pal.dark;
  ctx.globalAlpha=.17;
  ctx.lineWidth=Math.max(.8,Wd*.22);
  ctx.lineCap='round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(L*.53,0);
  ctx.bezierCurveTo(L*.37,-Wd*.63,-L*.08,-Wd*.70+bend,-L*.61,tailY);
  ctx.bezierCurveTo(-L*.09,Wd*.70+bend,L*.38,Wd*.58,L*.53,0);
  ctx.closePath();
  ctx.globalAlpha=.91;
  ctx.fillStyle=pal.base;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(L*.19,-Wd*.12,L*.12,Wd*.20,-.15,0,TAU);
  ctx.fillStyle=pal.light;
  ctx.globalAlpha=.42;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-L*.02,0);
  ctx.quadraticCurveTo(-L*.17,Wd*.82,-L*.28,Wd*.30);
  ctx.strokeStyle=pal.dark;
  ctx.globalAlpha=.34;
  ctx.lineWidth=.7;
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha=1;
}

function render(){
  const sx=canvas.width/W, sy=canvas.height/H;
  ctx.setTransform(sx,0,0,sy,0,0);
  ctx.drawImage(paper,0,0,W,H);

  if(shouldRenderBreadcrumbs())drawBreadcrumbs();

  // 1. Koi abajo.
  for(const f of fish)drawFish(f);

  // 2. Nenúfares encima de los koi.
  for(const p of plants)drawLeaf(p);

  // 3. Flores arriba de todo.
  for(const p of plants)if(p.bloom>.015)drawBloom(p);

  ctx.setTransform(1,0,0,1,0,0);
}

const fpsPill=document.getElementById('fpsPill');
const activePill=document.getElementById('activePill');
const testsPill=document.getElementById('testsPill');
let lastUiRefresh=0;

function frame(ts){
  const rawDt=Math.max(.001,(ts-lastTs)/1000);
  lastTs=ts;
  const dt=Math.min(.033,rawDt);
  frameAvg=frameAvg*.94+(rawDt*1000)*.06;
  collisionTests=0;

  if(!paused)update(dt,ts);
  render();

  if(ts-lastUiRefresh>=120){
    if(fpsPill)fpsPill.textContent=ui('format.fps',{value:(1000/frameAvg).toFixed(0)});
    if(activePill)activePill.textContent=activeBlooms+' '+ui("text.transitions");
    if(testsPill)testsPill.textContent=collisionTests+' '+ui("text.tests");
    updateSceneState(ts);
    lastUiRefresh=ts;
  }
  requestAnimationFrame(frame);
}

function pointerPos(ev){
  const r=canvas.getBoundingClientRect();
  return {
    x:(ev.clientX-r.left)/r.width*W,
    y:(ev.clientY-r.top)/r.height*H
  };
}

function triggerInteraction(x,y){
  interactionSerial++;
  const attractTargetCount=fish.filter(f=>schoolTouchMode(f.school.index)==='attract').length;
  const hasAttract=attractTargetCount>0;
  const hasRepel=fish.some(f=>schoolTouchMode(f.school.index)==='repel');
  if(!hasAttract&&!hasRepel){
    status("text.no_school_reacts_to_touch_with_the_current_settings");
    return;
  }
  interaction={
    serial:interactionSerial,
    x,y,
    phase:hasAttract?'approach':'pulse',
    start:performance.now(),
    returnStart:0,
    touched:0,
    attractTargetCount,
    hasAttract,
    hasRepel
  };
  for(const f of fish)f.touchSerial=-1;
  status("text.point_interaction_sent_each_school_will_react_according_to_its_own_mode");
}

canvas.addEventListener('pointerdown',ev=>{
  const p=pointerPos(ev);
  if(document.getElementById('editBreadcrumbs')?.checked){
    pointerFollow.active=false;
    breadcrumbDrawing=true;
    addBreadcrumbPoint(p.x,p.y);
  }else if(ev.pointerType==='mouse'&&settings.followPointer){
    pointerFollow={active:true,x:p.x,y:p.y};
  }else{
    triggerInteraction(p.x,p.y);
  }
  canvas.setPointerCapture?.(ev.pointerId);
});
canvas.addEventListener('pointermove',ev=>{
  const p=pointerPos(ev);
  if(breadcrumbDrawing){
    addBreadcrumbPoint(p.x,p.y);
    return;
  }
  if(ev.pointerType==='mouse'&&settings.followPointer){
    pointerFollow.active=true;
    pointerFollow.x=p.x;pointerFollow.y=p.y;
  }
});
canvas.addEventListener('pointerenter',ev=>{
  if(ev.pointerType!=='mouse'||!settings.followPointer||document.getElementById('editBreadcrumbs')?.checked)return;
  const p=pointerPos(ev);pointerFollow={active:true,x:p.x,y:p.y};
});
canvas.addEventListener('pointerleave',()=>{pointerFollow.active=false;updateSceneState();});
canvas.addEventListener('pointerup',()=>{breadcrumbDrawing=false;updateSceneState();});
canvas.addEventListener('pointercancel',()=>{breadcrumbDrawing=false;pointerFollow.active=false;updateSceneState();});

function resetScene(options={}){
  if(sceneResetTimer){clearTimeout(sceneResetTimer);sceneResetTimer=null;}
  settings.seed=Math.max(1,Math.min(9999999,parseInt(document.getElementById('seed').value,10)||1843));
  interaction=null;
  pointerFollow.active=false;
  exitSequenceActive=false;
  elapsed=0;
  coverage.fill(0);
  forceAllSchoolsOutsideNow=options.forceOutside===true;
  spawnOutsideNow=forceAllSchoolsOutsideNow?true:!!settings.startOutside;
  const delay=Math.max(0,Math.min(10,Number(options.entryDelaySeconds)||0));
  entryHoldUntil=(spawnOutsideNow&&delay>0)?performance.now()+delay*1000:0;
  applyCanvasSize();
  rebuildPaletteCache();
  makePaper();
  generatePlants();
  generateSchoolsAndFish();
  if(settings.bloomSomeOnReset)applyBloomSample({deterministic:true});
  forceAllSchoolsOutsideNow=false;
  entryHoldUntil=0;
  updateFlowerWeightOutputs();
  updateKoiWeightOutputs();
  updateAspectUI();
  status(uiMsg('seedSummary',{seed:settings.seed,w:settings.canvasWidth,h:settings.canvasHeight,plants:plants.length,fish:fish.length,schools:settings.schoolCount,schoolWord:schoolWord(settings.schoolCount)}));
  updateSceneState();
}

function status(msg){
  const el=document.getElementById('status');
  el.textContent=ChisenI18n.has(msg)?ui(msg):msg;
  clearTimeout(status._t);
  status._t=setTimeout(()=>el.textContent='',3000);
}

function updateSceneState(now=performance.now()){
  const chip=document.getElementById('liveChip');
  const label=document.getElementById('liveLabel');
  if(!chip||!label)return;

  let state='live';
  let textLabel=ui("text.live");

  if(recording&&recording.state==='recording'){
    state='recording';
    const secs=Math.max(0,(now-recordingStartedAt)/1000);
    textLabel=uiMsg('liveRecording',{seconds:secs.toFixed(1)});
    if(exitSequenceActive||recordExitTimer)textLabel+=uiMsg('exitSuffix');
  }else if(paused){
    state='paused';
    textLabel=ui("text.paused");
  }else if(exitSequenceActive){
    state='exiting';
    textLabel=ui("text.exit_in_progress");
  }else if(document.getElementById('editBreadcrumbs')?.checked && breadcrumbDrawing){
    state='route';
    textLabel=ui("text.drawing_path");
  }else if(settings.followPointer&&pointerFollow.active){
    state='route';
    textLabel=ui("text.following_mouse");
  }else if(interaction){
    state=interaction.hasAttract?'route':'exiting';
    textLabel=ui(interaction.hasAttract?"text.interaction_attract":"text.interaction_repel");
  }

  chip.dataset.state=state;
  label.textContent=textLabel;
}

function syncGlobalTouchControl(){
  const modes=(settings.schoolTouchModes||[]).slice(0,settings.schoolCount);
  const allAttract=modes.length>0&&modes.every(mode=>mode==='attract');
  const allRepel=modes.length>0&&modes.every(mode=>mode==='repel');
  settings.tapAttract=allAttract;
  const tap=document.getElementById('tapAttract');
  if(tap){
    tap.checked=allAttract;
    tap.indeterminate=!allAttract&&!allRepel;
  }
}

function scheduleSceneReset(delay=65){
  if(sceneResetTimer)clearTimeout(sceneResetTimer);
  sceneResetTimer=setTimeout(()=>{sceneResetTimer=null;resetScene();},delay);
}

function bindRange(id,key,format,rebuild,transform=v=>v){
  const input=document.getElementById(id),out=document.getElementById(id+'Out');
  if(!input||!out)return;
  const sync=()=>{
    settings[key]=transform(parseFloat(input.value));
    out.textContent=format(settings[key]);
    if(rebuild)scheduleSceneReset();
  };
  input.addEventListener('input',sync);
  if(rebuild)input.addEventListener('change',()=>{
    if(sceneResetTimer){clearTimeout(sceneResetTimer);sceneResetTimer=null;}
    resetScene();
  });
}

const ASPECT_PRESETS={
  '3:4':[720,960],
  '1:1':[1080,1080],
  '4:5':[1080,1350],
  '9:16':[1080,1920],
  '16:9':[1280,720]
};

function detectAspectPreset(){
  for(const [key,[w,h]] of Object.entries(ASPECT_PRESETS)){
    if(settings.canvasWidth===w&&settings.canvasHeight===h)return key;
  }
  return 'custom';
}
function updateAspectUI(){
  const preset=detectAspectPreset();
  const select=document.getElementById('aspectPreset');
  if(select)select.value=preset;
  const w=document.getElementById('canvasWidth'),h=document.getElementById('canvasHeight');
  if(w)w.value=settings.canvasWidth;
  if(h)h.value=settings.canvasHeight;
  const out=document.getElementById('aspectOut');
  if(out){
    const ratio=(settings.canvasWidth/settings.canvasHeight);
    const label=preset==='custom'?ratio.toFixed(3).replace(/0+$/,'').replace(/\.$/,''):preset;
    out.textContent=`${label} · ${settings.canvasWidth}×${settings.canvasHeight}`;
  }
  const stageResolution=document.getElementById('stageResolutionSelect');
  if(stageResolution){
    stageResolution.value=preset;
    const custom=stageResolution.querySelector('option[value="custom"]');
    if(custom)custom.textContent=uiMsg('resolutionCustom',{w:settings.canvasWidth,h:settings.canvasHeight});
  }
  const fit=document.getElementById('fitViewport');
  if(fit)fit.checked=!!settings.fitViewport;
  canvas.classList.toggle('fit-viewport',!!settings.fitViewport);
  canvas.classList.toggle('fit-width',!settings.fitViewport);
  if(typeof syncTopViewMode==='function')syncTopViewMode();
}
function setCanvasDimensions(w,h){
  settings.canvasWidth=clamp(Math.round(Number(w)||720),320,2160);
  settings.canvasHeight=clamp(Math.round(Number(h)||960),320,2160);
  resetScene();
}
document.getElementById('aspectPreset').addEventListener('change',e=>{
  const preset=e.target.value;
  if(preset!=='custom'&&ASPECT_PRESETS[preset]){
    const [w,h]=ASPECT_PRESETS[preset];
    setCanvasDimensions(w,h);
  }
});
const stageResolutionSelect=document.getElementById('stageResolutionSelect');
if(stageResolutionSelect)stageResolutionSelect.addEventListener('change',e=>{
  const preset=e.target.value;
  if(preset!=='custom'&&ASPECT_PRESETS[preset]){
    const [w,h]=ASPECT_PRESETS[preset];
    setCanvasDimensions(w,h);
  }else{
    e.target.value=detectAspectPreset();
    activateEditorTab('composition');
    document.getElementById('canvasWidth')?.focus();
  }
});
['canvasWidth','canvasHeight'].forEach(id=>{
  document.getElementById(id).addEventListener('change',()=>{
    setCanvasDimensions(
      document.getElementById('canvasWidth').value,
      document.getElementById('canvasHeight').value
    );
  });
});
document.getElementById('fitViewport').addEventListener('change',e=>{
  settings.fitViewport=e.target.checked;
  updateAspectUI();
});

bindRange('plantCount','plantCount',v=>Math.round(v),true);
bindRange('circleRatio','circleRatio',v=>Math.round(v*100)+'%',true,v=>v/100);
bindRange('riverWidth','riverWidth',v=>Math.round(v),true);
bindRange('schoolCount','schoolCount',v=>Math.round(v),true);
bindRange('tapStrength','tapStrength',v=>Math.round(v*100)+'%',false,v=>v/100);
bindRange('bloomPower','bloomPower',v=>v.toFixed(2),false);
bindRange('flowerOpenSeconds','flowerOpenSeconds',v=>uiSeconds(Math.round(v)),false);

document.getElementById('backgroundColor').addEventListener('input',e=>{
  settings.backgroundColor=e.target.value;
  document.getElementById('backgroundOut').textContent=e.target.value;
  makePaper();
  updateUnifiedColorOutputs();
});

document.getElementById('tapAttract').addEventListener('change',e=>{
  const mode=e.target.checked?'attract':'repel';
  for(let i=0;i<settings.schoolCount;i++)settings.schoolTouchModes[i]=mode;
  for(let i=1;i<=3;i++){
    const select=document.getElementById('schoolTouch'+i);
    if(select&&i<=settings.schoolCount)select.value=mode;
  }
  syncGlobalTouchControl();
  updateUtilityState();
});

document.getElementById('autoCloseFlowers').addEventListener('change',e=>{
  settings.autoCloseFlowers=e.target.checked;
  if(!settings.autoCloseFlowers){
    for(const p of plants)p.openedAt=0;
  }
});
document.getElementById('bloomSomeOnReset').addEventListener('change',e=>{
  settings.bloomSomeOnReset=e.target.checked;
  if(settings.bloomSomeOnReset){
    const changed=applyBloomSample({deterministic:true});
    status(uiMsg('persistentBloom',{count:changed}));
  }
});

document.getElementById('startOutside').addEventListener('change',e=>{settings.startOutside=e.target.checked;});
document.getElementById('entryCorner').addEventListener('change',e=>{settings.entryCorner=e.target.value;});
document.getElementById('exitCorner').addEventListener('change',e=>{settings.exitCorner=e.target.value;});
document.getElementById('useBreadcrumbs').addEventListener('change',e=>{
  settings.useBreadcrumbs=e.target.checked;
  for(const s of schools){s.crumbIndex=0;s.breadcrumbDone=false;s.navTarget=null;s.navPlantIndex=-1;}
});
document.getElementById('breadcrumbLoop').addEventListener('change',e=>{settings.breadcrumbLoop=e.target.checked;});
document.getElementById('breadcrumbVisibleEditor').addEventListener('change',e=>{settings.breadcrumbVisibleEditor=e.target.checked;});
document.getElementById('breadcrumbVisibleOutput').addEventListener('change',e=>{settings.breadcrumbVisibleOutput=e.target.checked;});
document.getElementById('recordResetScene').addEventListener('change',e=>{settings.recordResetScene=e.target.checked;});
document.getElementById('recordStartWithEntry').addEventListener('change',e=>{settings.recordStartWithEntry=e.target.checked;});
document.getElementById('recordEntryDelaySeconds').addEventListener('change',e=>{
  settings.recordEntryDelaySeconds=Math.max(0,Math.min(10,Number(e.target.value)||0));
  e.target.value=settings.recordEntryDelaySeconds;
  const out=document.getElementById('recordEntryDelaySecondsOut');
  if(out)out.textContent=uiSeconds(settings.recordEntryDelaySeconds.toFixed(1));
});
document.getElementById('recordEndWithExit').addEventListener('change',e=>{settings.recordEndWithExit=e.target.checked;});
document.getElementById('clearBreadcrumbs').addEventListener('click',()=>{
  settings.breadcrumbs=[];
  for(const s of schools){s.crumbIndex=0;s.breadcrumbDone=false;}
  status("text.path_cleared");
});
document.getElementById('reverseBreadcrumbs').addEventListener('click',()=>{
  settings.breadcrumbs=(settings.breadcrumbs||[]).slice().reverse();
  for(const s of schools){s.crumbIndex=0;s.breadcrumbDone=false;}
  status("text.path_reversed");
});
document.getElementById('exitNow').addEventListener('click',()=>{
  triggerExitAll();
  status("text.the_schools_are_exiting_through_their_selected_directions");
});

function renderAllColorsEditor(){
  const root=document.getElementById('allColorsEditor');
  if(!root)return;

  const countSelect=(kind,count,schoolIndex='')=>`<label>${ui("text.colors")} <select class="count-select" data-u-count="${kind}" ${schoolIndex!==''?`data-u-school="${schoolIndex}"`:''}><option value="1" ${count===1?'selected':''}>1</option><option value="2" ${count===2?'selected':''}>2</option><option value="3" ${count===3?'selected':''}>3</option></select></label>`;
  const swatches=(kind,colors,count,schoolIndex='')=>{
    let html='<div class="swatches">';
    for(let i=0;i<count;i++){
      html+=`<label class="swatch"><input type="color" value="${colors[i]}" data-u-color="${kind}" data-u-index="${i}" ${schoolIndex!==''?`data-u-school="${schoolIndex}"`:''}><span>${i+1}</span></label>`;
    }
    return html+'</div>';
  };
  const weightRows=(kind,weights,count,schoolIndex='')=>{
    let html='';
    for(let i=0;i<count;i++){
      html+=`<div class="weight-row"><span>${ui("text.color")} ${i+1}</span><input type="range" min="0" max="100" step="1" value="${weights[i]??0}" data-u-weight="${kind}" data-u-index="${i}" ${schoolIndex!==''?`data-u-school="${schoolIndex}"`:''}><output data-u-weight-out="${kind}" data-u-index="${i}" ${schoolIndex!==''?`data-u-school="${schoolIndex}"`:''}>—</output></div>`;
    }
    return html;
  };

  let html=`<div class="color-overview-card"><div class="color-overview-head"><b>${ui("text.background")}</b></div><label class="background-swatch"><input type="color" value="${settings.backgroundColor}" data-u-background><span class="school-mini">${settings.backgroundColor}</span></label></div>`;
  html+=`<div class="color-overview-card"><div class="color-overview-head"><b>${ui("text.lily_pads")}</b>${countSelect('leaf',settings.leafPaletteCount)}</div>${swatches('leaf',settings.leafColors,settings.leafPaletteCount)}</div>`;
  html+=`<div class="color-overview-card"><div class="color-overview-head"><b>${ui("text.flowers")}</b>${countSelect('flower',settings.flowerPaletteCount)}</div>${swatches('flower',settings.flowerColors,settings.flowerPaletteCount)}${weightRows('flower',settings.flowerWeights,settings.flowerPaletteCount)}</div>`;

  for(let schoolIndex=0;schoolIndex<settings.schoolCount;schoolIndex++){
    const count=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
    html+=`<div class="color-overview-card"><div class="color-overview-head"><b>${uiMsg('koiSchool',{n:schoolIndex+1})}</b>${countSelect('school',count,schoolIndex)}</div>${swatches('school',settings.schoolPalettes[schoolIndex],count,schoolIndex)}${weightRows('school',settings.schoolColorWeights[schoolIndex],count,schoolIndex)}</div>`;
  }
  root.innerHTML=html;
  updateUnifiedColorOutputs();
}

function updateUnifiedColorOutputs(){
  const root=document.getElementById('allColorsEditor');
  if(!root)return;
  const bg=root.querySelector('[data-u-background]');
  if(bg){
    bg.value=settings.backgroundColor;
    const label=bg.nextElementSibling;if(label)label.textContent=settings.backgroundColor;
  }
  root.querySelectorAll('[data-u-color]').forEach(input=>{
    const i=Number(input.dataset.uIndex)||0;
    if(input.dataset.uColor==='leaf')input.value=settings.leafColors[i];
    else if(input.dataset.uColor==='flower')input.value=settings.flowerColors[i];
    else if(input.dataset.uColor==='school')input.value=settings.schoolPalettes[Number(input.dataset.uSchool)||0][i];
  });
  root.querySelectorAll('[data-u-weight]').forEach(input=>{
    const i=Number(input.dataset.uIndex)||0;
    const schoolIndex=Number(input.dataset.uSchool)||0;
    if(input.dataset.uWeight==='flower')input.value=settings.flowerWeights[i]??0;
    else input.value=settings.schoolColorWeights[schoolIndex][i]??0;
  });

  const flowerActual=Array(3).fill(0);
  for(const p of plants)flowerActual[p.flowerColorIndex]++;
  const fw=normalizedFlowerWeights();
  root.querySelectorAll('[data-u-weight-out="flower"]').forEach(out=>{
    const i=Number(out.dataset.uIndex)||0;
    out.textContent=`${flowerActual[i]||0} · ${Math.round((fw[i]||0)*100)}%`;
  });

  for(let schoolIndex=0;schoolIndex<settings.schoolCount;schoolIndex++){
    const actual=Array(3).fill(0);
    for(const f of fish)if(f.school.index===schoolIndex)actual[f.paletteIndex()]++;
    const weights=normalizedSchoolColorWeights(schoolIndex);
    root.querySelectorAll(`[data-u-weight-out="school"][data-u-school="${schoolIndex}"]`).forEach(out=>{
      const i=Number(out.dataset.uIndex)||0;
      out.textContent=`${actual[i]||0} · ${Math.round((weights[i]||0)*100)}%`;
    });
  }
}

const allColorsEditor=document.getElementById('allColorsEditor');
if(allColorsEditor){
  allColorsEditor.addEventListener('input',e=>{
    const input=e.target;
    if(input.matches('[data-u-background]')){
      settings.backgroundColor=input.value;
      const source=document.getElementById('backgroundColor');if(source)source.value=input.value;
      const out=document.getElementById('backgroundOut');if(out)out.textContent=input.value;
      makePaper();
      updateUnifiedColorOutputs();
      return;
    }
    if(input.dataset.uColor){
      const kind=input.dataset.uColor,index=Number(input.dataset.uIndex)||0;
      if(kind==='leaf'){
        settings.leafColors[index]=input.value;
        const source=document.getElementById(`leafColor${index+1}`);if(source)source.value=input.value;
      }else if(kind==='flower'){
        settings.flowerColors[index]=input.value;
        const source=document.getElementById(`flowerColor${index+1}`);if(source)source.value=input.value;
        for(let s=1;s<=3;s++){const sw=document.getElementById(`school${s}FlowerSwatch${index+1}`);if(sw)sw.style.background=input.value;}
      }else if(kind==='school'){
        const schoolIndex=Number(input.dataset.uSchool)||0;
        settings.schoolPalettes[schoolIndex][index]=input.value;
        const source=document.getElementById(`school${schoolIndex+1}Color${index+1}`);if(source)source.value=input.value;
      }
      rebuildPaletteCache();
      updateUnifiedColorOutputs();
      return;
    }
    if(input.dataset.uWeight){
      const index=Number(input.dataset.uIndex)||0;
      if(input.dataset.uWeight==='flower'){
        settings.flowerWeights[index]=Number(input.value)||0;
        const source=document.getElementById(`flowerWeight${index+1}`);if(source)source.value=input.value;
        assignFlowerColors();
        updateFlowerWeightOutputs();
      }else{
        const schoolIndex=Number(input.dataset.uSchool)||0;
        settings.schoolColorWeights[schoolIndex][index]=Number(input.value)||0;
        const source=document.getElementById(`school${schoolIndex+1}Weight${index+1}`);if(source)source.value=input.value;
        assignKoiColors();
        updateKoiWeightOutputs();
      }
      updateUnifiedColorOutputs();
    }
  });

  allColorsEditor.addEventListener('change',e=>{
    const select=e.target.closest('[data-u-count]');
    if(!select)return;
    const count=clamp(parseInt(select.value,10)||1,1,3);
    if(select.dataset.uCount==='leaf'){
      settings.leafPaletteCount=count;
      const source=document.getElementById('leafPaletteCount');if(source)source.value=count;
      syncGenericPaletteUI('leaf',count);rebuildPaletteCache();
    }else if(select.dataset.uCount==='flower'){
      settings.flowerPaletteCount=count;
      const source=document.getElementById('flowerPaletteCount');if(source)source.value=count;
      syncGenericPaletteUI('flower',count);rebuildPaletteCache();assignFlowerColors();
    }else{
      const schoolIndex=Number(select.dataset.uSchool)||0;
      settings.schoolPaletteCounts[schoolIndex]=count;
      const source=document.getElementById(`schoolPaletteCount${schoolIndex+1}`);if(source)source.value=count;
      syncSchoolPaletteUI(schoolIndex+1);rebuildPaletteCache();assignKoiColors();
    }
    updateFlowerWeightOutputs();updateKoiWeightOutputs();renderAllColorsEditor();
  });
}

function syncSchoolUI(){
  const count=Math.max(1,Math.min(settings.schoolCount,3));
  settings.schoolCount=count;
  let total=(settings.schoolFishCounts||[]).slice(0,count).reduce((a,b)=>a+(Math.max(0,Math.round(Number(b)||0))),0);
  if(total<=0){
    settings.schoolFishCounts[0]=1;
    total=1;
    const firstCount=document.getElementById('schoolFishCount1');
    const firstOut=document.getElementById('schoolFishCount1Out');
    if(firstCount)firstCount.value=1;
    if(firstOut)firstOut.textContent='1';
  }
  settings.fishCount=total;
  const slider=document.getElementById('schoolCount');
  if(slider){
    slider.max=3;
    slider.value=count;
    document.getElementById('schoolCountOut').textContent=count;
  }
  const totalOut=document.getElementById('fishCountOut');
  if(totalOut)totalOut.textContent=String(total);
  for(let i=0;i<3;i++){
    const card=document.getElementById('schoolPaletteCard'+(i+1));
    if(card)card.classList.toggle('hidden',i>=count);
    syncSchoolPaletteUI(i+1);
  }
  const pill=document.getElementById('schoolPill');
  if(pill)pill.textContent=uiMsg('schoolPill',{total,count,schoolWord:schoolWord(count)});
  renderAllColorsEditor();
}

function updateKoiWeightOutputs(){
  for(let schoolIndex=0;schoolIndex<3;schoolIndex++){
    const n=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
    const weights=normalizedSchoolColorWeights(schoolIndex);
    const actual=Array(3).fill(0);
    for(const f of fish){
      if(f.school.index===schoolIndex)actual[f.paletteIndex()]++;
    }
    for(let colorIndex=0;colorIndex<3;colorIndex++){
      const out=document.getElementById(`school${schoolIndex+1}Weight${colorIndex+1}Out`);
      if(!out)continue;
      if(colorIndex>=n){
        out.textContent='—';
      }else{
        out.textContent=`${actual[colorIndex]||0} · ${Math.round((weights[colorIndex]||0)*100)}%`;
      }
    }
  }
}

function syncSchoolPaletteUI(schoolNumber){
  const schoolIndex=schoolNumber-1;
  const count=clamp(settings.schoolPaletteCounts[schoolIndex]||1,1,3);
  const select=document.getElementById('schoolPaletteCount'+schoolNumber);
  if(select)select.value=count;

  const slots=[...document.querySelectorAll('.school'+schoolNumber+'-color-slot')];
  const rows=[...document.querySelectorAll('.school'+schoolNumber+'-weight-row')];
  slots.forEach((slot,i)=>slot.classList.toggle('disabled',i>=count));
  rows.forEach((row,i)=>row.classList.toggle('disabled',i>=count));

  for(let i=1;i<=3;i++){
    const sw=document.getElementById(`school${schoolNumber}FlowerSwatch${i}`);
    if(sw)sw.style.background=settings.flowerColors[i-1];
  }
}


function bindSchoolPalette(schoolNumber){
  const schoolIndex=schoolNumber-1;
  const select=document.getElementById('schoolPaletteCount'+schoolNumber);
  const slots=[...document.querySelectorAll('.school'+schoolNumber+'-color-slot')];
  const rows=[...document.querySelectorAll('.school'+schoolNumber+'-weight-row')];
  const inputs=[1,2,3].map(i=>document.getElementById('school'+schoolNumber+'Color'+i));
  const weights=[1,2,3].map(i=>document.getElementById('school'+schoolNumber+'Weight'+i));

  const fishCount=document.getElementById('schoolFishCount'+schoolNumber);
  const fishCountOut=document.getElementById('schoolFishCount'+schoolNumber+'Out');
  const tight=document.getElementById('schoolTightness'+schoolNumber);
  const tightOut=document.getElementById('schoolTightness'+schoolNumber+'Out');
  const length=document.getElementById('schoolLength'+schoolNumber);
  const lengthOut=document.getElementById('schoolLength'+schoolNumber+'Out');
  const speed=document.getElementById('schoolSpeed'+schoolNumber);
  const speedOut=document.getElementById('schoolSpeed'+schoolNumber+'Out');
  const entry=document.getElementById('schoolEntry'+schoolNumber);
  const exit=document.getElementById('schoolExit'+schoolNumber);
  const touch=document.getElementById('schoolTouch'+schoolNumber);
  const spawn=document.getElementById('schoolSpawn'+schoolNumber);
  const flowerMasks=[1,2,3].map(i=>document.getElementById(`school${schoolNumber}FlowerMask${i}`));

  function refreshSchoolRuntime(){
    const school=schools.find(s=>s.index===schoolIndex);
    if(!school)return;
    school.tightness=settings.schoolTightnesses[schoolIndex];
    school.lengthFactor=settings.schoolLengths[schoolIndex];
    school.speedFactor=settings.schoolSwimSpeeds[schoolIndex];
    school.entryDirection=settings.schoolEntryDirections[schoolIndex];
    school.exitDirection=settings.schoolExitDirections[schoolIndex];
    school.touchMode=settings.schoolTouchModes[schoolIndex];
    school.spawnOutside=settings.schoolSpawnOutside[schoolIndex];
    school.flowerMask=(settings.schoolFlowerMasks[schoolIndex]||[true,true,true]).slice(0,3);
    updateSceneState();
  }

  function applyPaletteCount(){
    const count=clamp(parseInt(select.value,10)||1,1,3);
    settings.schoolPaletteCounts[schoolIndex]=count;
    slots.forEach((slot,i)=>slot.classList.toggle('disabled',i>=count));
    rows.forEach((row,i)=>row.classList.toggle('disabled',i>=count));
    rebuildPaletteCache();
    assignKoiColors();
    renderAllColorsEditor();
  }

  select.addEventListener('change',applyPaletteCount);
  inputs.forEach((input,colorIndex)=>{
    input.addEventListener('input',()=>{
      settings.schoolPalettes[schoolIndex][colorIndex]=input.value;
      rebuildPaletteCache();
      updateUnifiedColorOutputs();
    });
  });
  weights.forEach((input,colorIndex)=>{
    input.addEventListener('input',()=>{
      settings.schoolColorWeights[schoolIndex][colorIndex]=parseFloat(input.value);
      assignKoiColors();
      updateUnifiedColorOutputs();
    });
  });

  if(fishCount){
    fishCount.addEventListener('input',()=>{
      settings.schoolFishCounts[schoolIndex]=Math.max(0,Math.round(Number(fishCount.value)||0));
      fishCountOut.textContent=String(settings.schoolFishCounts[schoolIndex]);
      syncSchoolUI();
      scheduleSceneReset();
    });
    fishCount.addEventListener('change',()=>{
      if(sceneResetTimer){clearTimeout(sceneResetTimer);sceneResetTimer=null;}
      resetScene();
    });
  }
  if(tight){
    tight.addEventListener('input',()=>{
      settings.schoolTightnesses[schoolIndex]=Math.max(0,Math.min(1,(Number(tight.value)||0)/100));
      tightOut.textContent=Math.round(settings.schoolTightnesses[schoolIndex]*100)+'%';
      refreshSchoolRuntime();
    });
  }
  if(length){
    length.addEventListener('input',()=>{
      settings.schoolLengths[schoolIndex]=Math.max(0,Math.min(1,(Number(length.value)||0)/100));
      lengthOut.textContent=Math.round(settings.schoolLengths[schoolIndex]*100)+'%';
      refreshSchoolRuntime();
    });
  }
  if(speed){
    speed.addEventListener('input',()=>{
      settings.schoolSwimSpeeds[schoolIndex]=Math.max(.55,Math.min(1.65,Number(speed.value)||1));
      speedOut.textContent=settings.schoolSwimSpeeds[schoolIndex].toFixed(2);
      refreshSchoolRuntime();
    });
  }
  if(entry)entry.addEventListener('change',()=>{settings.schoolEntryDirections[schoolIndex]=entry.value;resetScene();});
  if(exit)exit.addEventListener('change',()=>{settings.schoolExitDirections[schoolIndex]=exit.value;refreshSchoolRuntime();});
  if(touch)touch.addEventListener('change',()=>{
    settings.schoolTouchModes[schoolIndex]=touch.value;
    syncGlobalTouchControl();
    refreshSchoolRuntime();
    updateUtilityState();
  });
  if(spawn)spawn.addEventListener('change',()=>{settings.schoolSpawnOutside[schoolIndex]=spawn.value==='yes';refreshSchoolRuntime();});
  flowerMasks.forEach((input,colorIndex)=>{
    if(!input)return
    input.addEventListener('change',()=>{
      const mask=settings.schoolFlowerMasks[schoolIndex]||[true,true,true];
      mask[colorIndex]=!!input.checked;
      if(!mask.some(Boolean)){mask[colorIndex]=true; input.checked=true;}
      settings.schoolFlowerMasks[schoolIndex]=mask;
      refreshSchoolRuntime();
    });
  });

  applyPaletteCount();
}
[1,2,3].forEach(bindSchoolPalette);

function bindPalette(prefix,keyColors,keyCount,onCountChange){
  const select=document.getElementById(prefix+'PaletteCount');
  const inputs=[1,2,3].map(i=>document.getElementById(prefix+'Color'+i));
  const slots=[...document.querySelectorAll('.'+prefix+'-slot')];

  function applySlots(){
    const n=parseInt(select.value,10);
    settings[keyCount]=n;
    slots.forEach((slot,i)=>slot.classList.toggle('disabled',i>=n));
    if(prefix==='flower'){
      [...document.querySelectorAll('.flower-weight-row')].forEach((row,i)=>row.classList.toggle('disabled',i>=n));
    }
  }

  select.addEventListener('change',()=>{
    applySlots();
    rebuildPaletteCache();
    if(onCountChange)onCountChange();
    renderAllColorsEditor();
  });

  inputs.forEach((input,i)=>{
    input.addEventListener('input',()=>{
      settings[keyColors][i]=input.value;
      rebuildPaletteCache();
      if(prefix==='flower'){
        for(let s=1;s<=3;s++){
          const sw=document.getElementById(`school${s}FlowerSwatch${i+1}`);
          if(sw)sw.style.background=input.value;
        }
      }
      updateUnifiedColorOutputs();
    });
  });

  applySlots();
}

bindPalette('leaf','leafColors','leafPaletteCount',()=>{});
bindPalette('flower','flowerColors','flowerPaletteCount',assignFlowerColors);

function updateFlowerWeightOutputs(){
  const n=settings.flowerPaletteCount;
  const weights=normalizedFlowerWeights();
  const actual=Array(3).fill(0);
  for(const p of plants)actual[p.flowerColorIndex]++;
  for(let i=0;i<3;i++){
    const out=document.getElementById('flowerWeight'+(i+1)+'Out');
    if(i>=n){
      out.textContent='—';
    }else{
      const pct=Math.round(weights[i]*100);
      out.textContent=`${actual[i]} · ${pct}%`;
    }
  }
}

[1,2,3].forEach(i=>{
  document.getElementById('flowerWeight'+i).addEventListener('input',e=>{
    settings.flowerWeights[i-1]=parseFloat(e.target.value);
    assignFlowerColors();
    updateUnifiedColorOutputs();
  });
});

function syncGenericPaletteUI(prefix,count){
  const slots=[...document.querySelectorAll('.'+prefix+'-slot')];
  slots.forEach((slot,i)=>slot.classList.toggle('disabled',i>=count));
  if(prefix==='flower'){
    [...document.querySelectorAll('.flower-weight-row')].forEach((row,i)=>row.classList.toggle('disabled',i>=count));
  }
}

function updateRecordUI(){
  settings.recordSeconds=clamp(Math.round(Number(settings.recordSeconds)||6),1,120);
  const input=document.getElementById('recordSeconds');
  const out=document.getElementById('recordSecondsOut');
  const btn=document.getElementById('record');
  if(input)input.value=settings.recordSeconds;
  if(out)out.textContent=uiSeconds(settings.recordSeconds);
  if(btn&&(!recording||recording.state!=='recording'))btn.textContent=uiMsg('recordButton',{seconds:settings.recordSeconds});
}

document.getElementById('recordSeconds').addEventListener('change',e=>{
  settings.recordSeconds=clamp(Math.round(Number(e.target.value)||6),1,600);
  updateRecordUI();
});

function syncSettingsToUI(){
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.value=value;};
  const out=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};

  set('plantCount',settings.plantCount);out('plantCountOut',Math.round(settings.plantCount));
  set('circleRatio',Math.round(settings.circleRatio*100));out('circleRatioOut',Math.round(settings.circleRatio*100)+'%');
  set('riverWidth',settings.riverWidth);out('riverWidthOut',Math.round(settings.riverWidth));
  set('backgroundColor',settings.backgroundColor);out('backgroundOut',settings.backgroundColor);

  out('fishCountOut',Math.round(settings.fishCount));
  set('schoolCount',settings.schoolCount);out('schoolCountOut',Math.round(settings.schoolCount));

  const startOutside=document.getElementById('startOutside');if(startOutside)startOutside.checked=!!settings.startOutside;
  set('entryCorner',settings.entryCorner||'top-left');
  set('exitCorner',settings.exitCorner||'bottom-right');
  const useBreadcrumbs=document.getElementById('useBreadcrumbs');if(useBreadcrumbs)useBreadcrumbs.checked=!!settings.useBreadcrumbs;
  const breadcrumbLoop=document.getElementById('breadcrumbLoop');if(breadcrumbLoop)breadcrumbLoop.checked=!!settings.breadcrumbLoop;
  const breadcrumbVisibleEditor=document.getElementById('breadcrumbVisibleEditor');if(breadcrumbVisibleEditor)breadcrumbVisibleEditor.checked=settings.breadcrumbVisibleEditor!==false;
  const breadcrumbVisibleOutput=document.getElementById('breadcrumbVisibleOutput');if(breadcrumbVisibleOutput)breadcrumbVisibleOutput.checked=!!settings.breadcrumbVisibleOutput;
  const recordResetScene=document.getElementById('recordResetScene');if(recordResetScene)recordResetScene.checked=settings.recordResetScene!==false;
  const recordStartWithEntry=document.getElementById('recordStartWithEntry');if(recordStartWithEntry)recordStartWithEntry.checked=!!settings.recordStartWithEntry;
  set('recordEntryDelaySeconds',settings.recordEntryDelaySeconds);out('recordEntryDelaySecondsOut',uiSeconds(Number(settings.recordEntryDelaySeconds).toFixed(1)));
  const recordEndWithExit=document.getElementById('recordEndWithExit');if(recordEndWithExit)recordEndWithExit.checked=!!settings.recordEndWithExit;

  syncGlobalTouchControl();
  const followPointer=document.getElementById('followPointer');if(followPointer)followPointer.checked=settings.followPointer!==false;
  set('tapStrength',Math.round(settings.tapStrength*100));out('tapStrengthOut',Math.round(settings.tapStrength*100)+'%');

  set('bloomPower',settings.bloomPower);out('bloomPowerOut',Number(settings.bloomPower).toFixed(2));
  const close=document.getElementById('autoCloseFlowers');if(close)close.checked=!!settings.autoCloseFlowers;
  const bloomSome=document.getElementById('bloomSomeOnReset');if(bloomSome)bloomSome.checked=!!settings.bloomSomeOnReset;
  set('flowerOpenSeconds',settings.flowerOpenSeconds);out('flowerOpenSecondsOut',uiSeconds(Math.round(settings.flowerOpenSeconds)));

  set('leafPaletteCount',settings.leafPaletteCount);
  set('flowerPaletteCount',settings.flowerPaletteCount);
  syncGenericPaletteUI('leaf',settings.leafPaletteCount);
  syncGenericPaletteUI('flower',settings.flowerPaletteCount);

  for(let i=0;i<3;i++){
    set('leafColor'+(i+1),settings.leafColors[i]);
    set('flowerColor'+(i+1),settings.flowerColors[i]);
    set('flowerWeight'+(i+1),settings.flowerWeights[i]??0);

    set('schoolPaletteCount'+(i+1),settings.schoolPaletteCounts[i]||1);
    set('schoolFishCount'+(i+1),settings.schoolFishCounts[i]??0); out('schoolFishCount'+(i+1)+'Out',Math.round(settings.schoolFishCounts[i]??0));
    set('schoolTightness'+(i+1),Math.round((settings.schoolTightnesses[i]??.25)*100)); out('schoolTightness'+(i+1)+'Out',Math.round((settings.schoolTightnesses[i]??.25)*100)+'%');
    set('schoolLength'+(i+1),Math.round((settings.schoolLengths[i]??.17)*100)); out('schoolLength'+(i+1)+'Out',Math.round((settings.schoolLengths[i]??.17)*100)+'%');
    set('schoolSpeed'+(i+1),settings.schoolSwimSpeeds[i]??1); out('schoolSpeed'+(i+1)+'Out',Number(settings.schoolSwimSpeeds[i]??1).toFixed(2));
    set('schoolEntry'+(i+1),settings.schoolEntryDirections[i]||settings.entryCorner);
    set('schoolExit'+(i+1),settings.schoolExitDirections[i]||settings.exitCorner);
    set('schoolTouch'+(i+1),settings.schoolTouchModes[i]||'repel');
    set('schoolSpawn'+(i+1),(settings.schoolSpawnOutside[i]===false?'no':'yes'));
    for(let j=0;j<3;j++){
      set(`school${i+1}Color${j+1}`,settings.schoolPalettes[i][j]);
      set(`school${i+1}Weight${j+1}`,settings.schoolColorWeights[i][j]??0);
      const mask=document.getElementById(`school${i+1}FlowerMask${j+1}`);
      if(mask)mask.checked=!!((settings.schoolFlowerMasks[i]||[true,true,true])[j]);
    }
    syncSchoolPaletteUI(i+1);
  }

  set('seed',settings.seed);
  const fit=document.getElementById('fitViewport');if(fit)fit.checked=!!settings.fitViewport;
  syncSchoolUI();
  updateAspectUI();
  updateRecordUI();
  updateFlowerWeightOutputs();
  updateKoiWeightOutputs();
  renderAllColorsEditor();
}


const COLOR_PRESET_KEYS=[
  'backgroundColor','leafPaletteCount','flowerPaletteCount','schoolPaletteCounts','schoolColorWeights',
  'leafColors','schoolPalettes','flowerColors','flowerWeights'
];
const MOTION_PRESET_KEYS=[
  'canvasWidth','canvasHeight','fitViewport',
  'plantCount','circleRatio','riverWidth',
  'fishCount','schoolCount','schoolFishCounts','schoolTightnesses','schoolLengths','schoolSwimSpeeds',
  'startOutside','entryCorner','exitCorner',
  'useBreadcrumbs','breadcrumbLoop','breadcrumbVisibleEditor','breadcrumbVisibleOutput','breadcrumbs',
  'recordResetScene','recordStartWithEntry','recordEntryDelaySeconds','recordEndWithExit',
  'followPointer','tapStrength','bloomPower','autoCloseFlowers','bloomSomeOnReset','flowerOpenSeconds','recordSeconds',
  'schoolEntryDirections','schoolExitDirections','schoolTouchModes','schoolSpawnOutside','schoolFlowerMasks'
];
const COLOR_PRESETS={
  'color:rojo-azul':{label:"text.red_over_blue_pond",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#8fd0ff', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#4cb85d','#73ca6b','#309d55'],
    schoolPalettes:[['#b63246','#d94e60','#f0828e'],['#d96834','#ee9653','#f4c185'],['#b53147','#d94d65','#f29fb7']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[72,18,10],[68,22,10],[64,24,12]],
    flowerColors:['#f4a9bf','#f7bb66','#fff0f4'], flowerWeights:[46,34,20]
  })},
  'color:nocturno-porcelana':{label:"text.porcelain_night",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#080b10', leafPaletteCount:3, flowerPaletteCount:2,
    leafColors:['#454b52','#6f7781','#a2acb6'],
    schoolPalettes:[['#b60d24','#ef3148','#ff7b76'],['#d94400','#ff7d12','#ffbf63'],['#86111a','#cc2238','#ff5858']],
    schoolPaletteCounts:[2,2,2], schoolColorWeights:[[84,16,0],[78,22,0],[86,14,0]],
    flowerColors:['#f5f4ef','#d8dde2','#ffffff'], flowerWeights:[84,16,0]
  })},
  'color:eclipse-dorado':{label:"text.golden_eclipse",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#171717', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#5a5a5a','#8d8d8d','#bbbbbb'],
    schoolPalettes:[['#b67a00','#f0b118','#ffe07a'],['#8b1f1f','#d44332','#ff8266'],['#d99a1f','#ffd24c','#fff0a1']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[58,22,20],[52,32,16],[60,26,14]],
    flowerColors:['#fff7dd','#f6e5bb','#fffdf7'], flowerWeights:[44,26,30]
  })},
  'color:jade-coral':{label:"text.jade_coral",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#d8f2ec', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#2d9176','#56b698','#8ad0b5'],
    schoolPalettes:[['#e4534a','#f87863','#ffb18e'],['#ff7f50','#ff9e72','#ffd0aa'],['#d73d55','#ef6982','#ffc0ca']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[64,26,10],[50,30,20],[58,24,18]],
    flowerColors:['#ffd4c6','#ffc274','#fff0e5'], flowerWeights:[44,30,26]
  })},
  'color:pergamino-otono':{label:"text.autumn_parchment",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#efe1c7', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#73825b','#9aa36e','#b7b486'],
    schoolPalettes:[['#8c3f20','#b75d2d','#df8b43'],['#5d2d19','#8a472a','#c47b3c'],['#b55521','#d98e2f','#f0bf5d']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[56,28,16],[62,25,13],[44,34,22]],
    flowerColors:['#f5ddbf','#f0c792','#fff6e8'], flowerWeights:[40,37,23]
  })},
  'color:lavanda-electrica':{label:"text.electric_lavender",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#241f3f', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#6b738f','#8aa0bc','#a7bfd7'],
    schoolPalettes:[['#8f3dff','#bb66ff','#f1a6ff'],['#ff4dc0','#ff78dd','#ffd1ff'],['#3fe0ff','#7bf1ff','#b2ffff']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[62,26,12],[58,28,14],[44,36,20]],
    flowerColors:['#f4d9ff','#ffffff','#b8f7ff'], flowerWeights:[38,30,32]
  })},
  'color:niebla-mineral':{label:"text.mineral_mist",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#f1f4f1', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#6d8073','#8ea092','#c1cdc6'],
    schoolPalettes:[['#85222a','#b53e47','#e57a74'],['#3a3d42','#676d75','#9ba0a7'],['#c55f2c','#e38d54','#f4c58e']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[62,24,14],[52,32,16],[50,34,16]],
    flowerColors:['#fffdf8','#eadfd8','#f4f0eb'], flowerWeights:[52,22,26]
  })},
  'color:cian-pop':{label:"text.cyan_pop",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#0fb4d1', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#0b8d60','#38b675','#8ddc88'],
    schoolPalettes:[['#ff1464','#ff588c','#ffc5db'],['#ff8a00','#ffbc42','#ffe49e'],['#7a00ff','#b257ff','#e2b3ff']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[70,20,10],[58,28,14],[64,24,12]],
    flowerColors:['#fff671','#ffffff','#ffc0f0'], flowerWeights:[36,30,34]
  })},
  'color:bosque-profundo':{label:"text.deep_forest",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#173632', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#2a6656','#4e8a6c','#87b18a'],
    schoolPalettes:[['#ffefe2','#ffd6ba','#ffa65d'],['#d62a3a','#ef5768','#ff9ba8'],['#f3a31c','#ffd159','#fff0ab']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[44,36,20],[62,22,16],[54,30,16]],
    flowerColors:['#edf8ed','#d7f0de','#fffdf7'], flowerWeights:[40,30,30]
  })},
  'color:rosa-ceniza':{label:"text.ash_rose",settings:mergedSettings({...BASE_DEFAULTS,
    backgroundColor:'#d8cfd5', leafPaletteCount:3, flowerPaletteCount:3,
    leafColors:['#7d8678','#9aa391','#bbc1b7'],
    schoolPalettes:[['#8b1e3f','#b53b5c','#dd6e85'],['#d05e5d','#e88a79','#f8c1ac'],['#5a2c47','#885277','#be90ae']],
    schoolPaletteCounts:[3,3,3], schoolColorWeights:[[58,28,14],[50,34,16],[56,24,20]],
    flowerColors:['#ffd8e2','#fff4ef','#f1d6e6'], flowerWeights:[40,34,26]
  })}
};
const MOTION_PRESETS={
  'motion:base-serena':{label:"text.calm_base",settings:mergedSettings({...BASE_DEFAULTS})},
  'motion:remolino-largo':{label:"text.long_whirl",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:1, schoolFishCounts:[34,0,0], schoolLengths:[.34,.17,.17], schoolTightnesses:[.18,.25,.25], schoolSwimSpeeds:[1.12,1,1], plantCount:400, circleRatio:.26, riverWidth:72
  })},
  'motion:triptico':{label:"text.school_triptych",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:3, schoolFishCounts:[18,14,10], schoolEntryDirections:['northwest','east','south'], schoolExitDirections:['southeast','west','north'], schoolTouchModes:['repel','attract','ignore'], schoolFlowerMasks:[[true,false,true],[false,true,true],[true,true,false]], schoolTightnesses:[.30,.20,.36], schoolLengths:[.24,.36,.14], schoolSwimSpeeds:[1.0,1.18,.92]
  })},
  'motion:sendero-diagonal':{label:"text.diagonal_path",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:2, schoolFishCounts:[22,8,0], useBreadcrumbs:true, breadcrumbLoop:true, breadcrumbVisibleEditor:true, breadcrumbs:[{x:.08,y:.10},{x:.24,y:.24},{x:.40,y:.42},{x:.58,y:.60},{x:.82,y:.86}], schoolEntryDirections:['northwest','southwest','south'], schoolExitDirections:['southeast','northeast','north'], schoolLengths:[.33,.18,.17], schoolTightnesses:[.18,.34,.25]
  })},
  'motion:cuadrado-sereno':{label:"text.calm_square",settings:mergedSettings({...BASE_DEFAULTS,
    canvasWidth:1080, canvasHeight:1080, schoolCount:1, schoolFishCounts:[24,0,0], plantCount:320, riverWidth:58
  })},
  'motion:reel-vertical':{label:"text.reel_format",settings:mergedSettings({...BASE_DEFAULTS,
    canvasWidth:1080, canvasHeight:1920, schoolCount:2, schoolFishCounts:[20,12,0], plantCount:420, circleRatio:.31, schoolEntryDirections:['west','east','south'], schoolExitDirections:['east','west','north'], schoolLengths:[.42,.24,.17]
  })},
  'motion:minimo':{label:"text.minimal_pond",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:1, schoolFishCounts:[9,0,0], plantCount:220, circleRatio:.18, schoolTightnesses:[.42,.25,.25], schoolLengths:[.10,.17,.17], schoolSwimSpeeds:[.82,1,1]
  })},
  'motion:cruce-opuesto':{label:"text.opposing_crossing",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:2, schoolFishCounts:[20,20,0], schoolEntryDirections:['west','east','south'], schoolExitDirections:['east','west','north'], schoolTouchModes:['attract','repel','ignore'], schoolFlowerMasks:[[true,true,false],[false,true,true],[true,true,true]], schoolLengths:[.38,.38,.17], schoolSwimSpeeds:[1.08,1.08,1]
  })},
  'motion:espiral-lenta':{label:"text.slow_spiral",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:1, schoolFishCounts:[16,0,0], useBreadcrumbs:true, breadcrumbLoop:true, breadcrumbs:[{x:.50,y:.15},{x:.66,y:.22},{x:.73,y:.38},{x:.66,y:.58},{x:.50,y:.70},{x:.35,y:.62},{x:.28,y:.44},{x:.37,y:.28},{x:.52,y:.24}], schoolLengths:[.46,.17,.17], schoolTightnesses:[.34,.25,.25], schoolSwimSpeeds:[.84,1,1], autoCloseFlowers:true, flowerOpenSeconds:18
  })},
  'motion:persecucion-tactil':{label:"text.touch_chase",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:3, schoolFishCounts:[12,12,8], schoolEntryDirections:['north','west','southeast'], schoolExitDirections:['south','east','northwest'], schoolTouchModes:['attract','repel','attract'], schoolLengths:[.20,.40,.14], schoolTightnesses:[.28,.18,.42], schoolSwimSpeeds:[1.22,1.05,.94], tapStrength:1.2
  })},
  'motion:ruta-ancha':{label:"text.wide_exploration_route",settings:mergedSettings({...BASE_DEFAULTS,
    schoolCount:2, schoolFishCounts:[28,6,0], plantCount:430, circleRatio:.36, riverWidth:82, schoolEntryDirections:['northwest','northeast','south'], schoolExitDirections:['south','southwest','north'], schoolLengths:[.52,.22,.17], schoolTightnesses:[.14,.40,.25], schoolSwimSpeeds:[1.04,.92,1], useBreadcrumbs:false
  })}
};

const FULL_PRESET_STORAGE_KEY='KoiPond.1.0.fullPresets';
const COLOR_PRESET_STORAGE_KEY='KoiPond.1.0.colorPresets';
const MOTION_PRESET_STORAGE_KEY='KoiPond.1.0.motionPresets';
const LEGACY_PRESET_STORAGE_KEYS={
  [FULL_PRESET_STORAGE_KEY]:'金GS.1.0.fullPresets',
  [COLOR_PRESET_STORAGE_KEY]:'金GS.1.0.colorPresets',
  [MOTION_PRESET_STORAGE_KEY]:'金GS.1.0.motionPresets'
};

function pickSettings(keys){
  const out={};
  keys.forEach(key=>{out[key]=deepClone(settings[key]);});
  return out;
}
function applySettingsSubset(patch,keys){
  for(const key of keys){
    if(patch[key]!==undefined)settings[key]=deepClone(patch[key]);
  }
}
function readPresetStore(storageKey){
  try{
    let raw=localStorage.getItem(storageKey);
    if(!raw&&LEGACY_PRESET_STORAGE_KEYS[storageKey]){
      raw=localStorage.getItem(LEGACY_PRESET_STORAGE_KEYS[storageKey]);
      if(raw)try{localStorage.setItem(storageKey,raw)}catch(e){}
    }
    const data=raw?JSON.parse(raw):{};
    return data&&typeof data==='object'?data:{};
  }catch(e){return {};}
}
function writePresetStore(storageKey,data){
  try{
    localStorage.setItem(storageKey,JSON.stringify(data));
    return true;
  }catch(e){
    status("text.could_not_save_to_this_browsers_local_storage");
    return false;
  }
}
function populatePresetSelect(selectId,builtinMap,builtinLabel,userMap,userLabel,userPrefix,placeholder,preferred){
  const select=document.getElementById(selectId);
  select.innerHTML='';
  const builtinGroup=document.createElement('optgroup');
  builtinGroup.label=ui(builtinLabel);
  Object.entries(builtinMap).forEach(([key,data])=>{
    const o=document.createElement('option');
    o.value=key; o.textContent=ui(data.label); builtinGroup.appendChild(o);
  });
  select.appendChild(builtinGroup);
  const names=Object.keys(userMap).sort((a,b)=>a.localeCompare(b));
  if(names.length){
    const userGroup=document.createElement('optgroup');
    userGroup.label=ui(userLabel);
    names.forEach(name=>{
      const o=document.createElement('option');
      o.value=userPrefix+name; o.textContent=name; userGroup.appendChild(o);
    });
    select.appendChild(userGroup);
  }
  const wanted=preferred||Object.keys(builtinMap)[0];
  if([...select.options].some(o=>o.value===wanted))select.value=wanted;
  else select.value=Object.keys(builtinMap)[0];
}
function refreshColorPresetSelect(preferred){
  populatePresetSelect('colorPresetSelect',COLOR_PRESETS,"text.built_in_colors",readPresetStore(COLOR_PRESET_STORAGE_KEY),"text.your_color_presets",'usercolor:',"text.color_preset",preferred||'color:rojo-azul');
}
function refreshMotionPresetSelect(preferred){
  populatePresetSelect('motionPresetSelect',MOTION_PRESETS,"text.built_in_motion",readPresetStore(MOTION_PRESET_STORAGE_KEY),"text.your_motion_presets",'usermotion:',"text.motion_preset",preferred||'motion:base-serena');
}
function refreshPresetSelect(preferred){
  const select=document.getElementById('presetSelect');
  const presets=readPresetStore(FULL_PRESET_STORAGE_KEY);
  select.innerHTML='';
  const empty=document.createElement('option');
  empty.value='__none__';
  empty.textContent=ui("text.select_a_saved_preset");
  select.appendChild(empty);
  Object.keys(presets).sort((a,b)=>a.localeCompare(b)).forEach(name=>{
    const o=document.createElement('option');
    o.value='user:'+name; o.textContent=name; select.appendChild(o);
  });
  const wanted=preferred||'__none__';
  if([...select.options].some(o=>o.value===wanted))select.value=wanted;
  else select.value='__none__';
}
function resolvePreset(key,builtinMap,storageKey,userPrefix){
  if(builtinMap[key])return {label:ui(builtinMap[key].label),settings:builtinMap[key].settings,builtin:true};
  if(key&&key.startsWith(userPrefix)){
    const name=key.slice(userPrefix.length);
    const store=readPresetStore(storageKey);
    if(store[name])return {label:name,settings:store[name],builtin:false};
  }
  return null;
}
function applyColorPreset(key,silent=false){
  const preset=resolvePreset(key,COLOR_PRESETS,COLOR_PRESET_STORAGE_KEY,'usercolor:');
  if(!preset)return;
  applySettingsSubset(preset.settings,COLOR_PRESET_KEYS);
  syncSettingsToUI();
  resetScene();
  if(!silent)status(uiMsg('presetColorApplied',{name:preset.label}));
}
function applyMotionPreset(key,silent=false){
  const preset=resolvePreset(key,MOTION_PRESETS,MOTION_PRESET_STORAGE_KEY,'usermotion:');
  if(!preset)return;
  applySettingsSubset(preset.settings,MOTION_PRESET_KEYS);
  syncSettingsToUI();
  resetScene();
  if(!silent)status(uiMsg('presetMotionApplied',{name:preset.label}));
}

document.getElementById('savePreset').addEventListener('click',()=>{
  const name=document.getElementById('presetName').value.trim();
  if(!name){status("text.enter_a_name_for_the_full_preset");return;}
  const presets=readPresetStore(FULL_PRESET_STORAGE_KEY);
  presets[name]=deepClone(settings);
  if(writePresetStore(FULL_PRESET_STORAGE_KEY,presets)){
    refreshPresetSelect('user:'+name);
    status(uiMsg('fullPresetSaved',{name}));
  }
});
document.getElementById('loadPreset').addEventListener('click',()=>{
  const key=document.getElementById('presetSelect').value;
  if(!key||key==='__none__'){status("text.select_a_saved_full_preset_first");return;}
  const name=key.slice(5);
  const presets=readPresetStore(FULL_PRESET_STORAGE_KEY);
  if(!presets[name]){status("text.that_preset_no_longer_exists");refreshPresetSelect();return;}
  settings=mergedSettings(presets[name]);
  syncSettingsToUI();
  resetScene();
  status(uiMsg('fullPresetLoaded',{name}));
});
document.getElementById('deletePreset').addEventListener('click',()=>{
  const key=document.getElementById('presetSelect').value;
  if(!key||!key.startsWith('user:')){status("text.select_a_personal_full_preset_to_delete");return;}
  const name=key.slice(5);
  const presets=readPresetStore(FULL_PRESET_STORAGE_KEY);
  if(!(name in presets)){refreshPresetSelect();return;}
  delete presets[name];
  if(writePresetStore(FULL_PRESET_STORAGE_KEY,presets)){
    refreshPresetSelect('__none__');
    status(uiMsg('fullPresetDeleted',{name}));
  }
});

document.getElementById('saveColorPreset').addEventListener('click',()=>{
  const name=document.getElementById('colorPresetName').value.trim();
  if(!name){status("text.enter_a_name_for_the_color_preset");return;}
  const presets=readPresetStore(COLOR_PRESET_STORAGE_KEY);
  presets[name]=pickSettings(COLOR_PRESET_KEYS);
  if(writePresetStore(COLOR_PRESET_STORAGE_KEY,presets)){
    refreshColorPresetSelect('usercolor:'+name);
    status(uiMsg('colorPresetSaved',{name}));
  }
});
document.getElementById('deleteColorPreset').addEventListener('click',()=>{
  const key=document.getElementById('colorPresetSelect').value;
  if(!key||!key.startsWith('usercolor:')){status("text.select_a_personal_color_preset_to_delete");return;}
  const name=key.slice('usercolor:'.length);
  const presets=readPresetStore(COLOR_PRESET_STORAGE_KEY);
  if(!(name in presets)){refreshColorPresetSelect();return;}
  delete presets[name];
  if(writePresetStore(COLOR_PRESET_STORAGE_KEY,presets)){
    refreshColorPresetSelect();
    status(uiMsg('colorPresetDeleted',{name}));
  }
});
document.getElementById('applyColorPreset').addEventListener('click',()=>{
  applyColorPreset(document.getElementById('colorPresetSelect').value);
});

document.getElementById('saveMotionPreset').addEventListener('click',()=>{
  const name=document.getElementById('motionPresetName').value.trim();
  if(!name){status("text.enter_a_name_for_the_motion_preset");return;}
  const presets=readPresetStore(MOTION_PRESET_STORAGE_KEY);
  presets[name]=pickSettings(MOTION_PRESET_KEYS);
  if(writePresetStore(MOTION_PRESET_STORAGE_KEY,presets)){
    refreshMotionPresetSelect('usermotion:'+name);
    status(uiMsg('motionPresetSaved',{name}));
  }
});
document.getElementById('deleteMotionPreset').addEventListener('click',()=>{
  const key=document.getElementById('motionPresetSelect').value;
  if(!key||!key.startsWith('usermotion:')){status("text.select_a_personal_motion_preset_to_delete");return;}
  const name=key.slice('usermotion:'.length);
  const presets=readPresetStore(MOTION_PRESET_STORAGE_KEY);
  if(!(name in presets)){refreshMotionPresetSelect();return;}
  delete presets[name];
  if(writePresetStore(MOTION_PRESET_STORAGE_KEY,presets)){
    refreshMotionPresetSelect();
    status(uiMsg('motionPresetDeleted',{name}));
  }
});
document.getElementById('applyMotionPreset').addEventListener('click',()=>{
  applyMotionPreset(document.getElementById('motionPresetSelect').value);
});

document.getElementById('applyBothPresets').addEventListener('click',()=>{
  const c=document.getElementById('colorPresetSelect').value;
  const m=document.getElementById('motionPresetSelect').value;
  const colorPreset=resolvePreset(c,COLOR_PRESETS,COLOR_PRESET_STORAGE_KEY,'usercolor:');
  const motionPreset=resolvePreset(m,MOTION_PRESETS,MOTION_PRESET_STORAGE_KEY,'usermotion:');
  if(!colorPreset||!motionPreset)return;
  applySettingsSubset(colorPreset.settings,COLOR_PRESET_KEYS);
  applySettingsSubset(motionPreset.settings,MOTION_PRESET_KEYS);
  syncSettingsToUI();
  resetScene();
  status(uiMsg('comboApplied',{color:colorPreset.label,motion:motionPreset.label}));
});

document.getElementById('presetSelect').addEventListener('change',e=>{
  if(e.target.value.startsWith('user:'))document.getElementById('presetName').value=e.target.value.slice(5);
});
document.getElementById('colorPresetSelect').addEventListener('change',e=>{
  if(e.target.value.startsWith('usercolor:'))document.getElementById('colorPresetName').value=e.target.value.slice('usercolor:'.length);
});
document.getElementById('motionPresetSelect').addEventListener('change',e=>{
  if(e.target.value.startsWith('usermotion:'))document.getElementById('motionPresetName').value=e.target.value.slice('usermotion:'.length);
});

document.getElementById('regen').addEventListener('click',()=>{
  document.getElementById('seed').value=Math.floor(1+Math.random()*9999998);
  resetScene();
});
document.getElementById('seed').addEventListener('change',resetScene);

document.getElementById('pause').addEventListener('click',e=>{
  paused=!paused;
  e.currentTarget.textContent=ui(paused?"text.resume":"text.pause");
  updateSceneState();
});

document.getElementById('clearBloom').addEventListener('click',()=>{
  for(const p of plants){p.target=0;p.vel=0;p.openedAt=0;}
  status("text.bloom_reset");
});

document.getElementById('autoBloom').addEventListener('click',()=>{
  const changed=applyBloomSample();
  status(uiMsg('bloomSample',{count:changed}));
});

document.getElementById('debug').addEventListener('change',e=>{
  document.getElementById('hud').classList.toggle('on',e.target.checked);
});

document.getElementById('save').addEventListener('click',()=>{
  const a=document.createElement('a');
  a.download=`${projectFileStem()}-1.0-${settings.seed}-${settings.canvasWidth}x${settings.canvasHeight}.png`;
  a.href=canvas.toDataURL('image/png');
  a.click();
  status("text.png_exported");
});


function buildLightHTML(){
  const config=JSON.stringify(settings);
  const core=[
    mulberry32,hexToRgb,rgbToHex,mixHex,luminance,rebuildPaletteCache,makePaper,
    normalizedBreadcrumbPoint,breadcrumbLogicalPoint,directionPoint,insideDirectionPoint,schoolAllowsFlowerColor,schoolTouchMode,
    shouldRenderBreadcrumbs,drawBreadcrumbs,addBreadcrumbPoint,triggerExitAll,allFishOutside,
    riverX,compositionDensity,Plant,makeLeafShape,generatePlants,normalizedFlowerWeights,
    assignFlowerColors,coverageIndex,markCoverage,targetReservedByOtherSchool,School,Koi,applyBloomSample,
    normalizedSchoolColorWeights,assignKoiColors,generateSchoolsAndFish,buildFishGrid,
    collideTail,updateInteraction,update,drawLeaf,drawPetal,drawBloom,fishTailLocal,
    fishTailPoint,drawFish,render,pointerPos,triggerInteraction
  ].map(fn=>fn.toString()).join('\n');

  return `<!doctype html>
<html lang="${UI_HTML_LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="application-name" content="${projectTitle()}">
<meta name="author" content="${authorName()}">
<meta name="version" content="1.0">
<title>${projectTitle()}</title>
<style>
html,body{margin:0;width:100%;height:100%;background:${settings.backgroundColor}}
body{display:grid;place-items:center;overflow:hidden}
canvas{display:block;max-width:100%;max-height:100%;width:auto;height:auto;touch-action:none}
</style>
</head>
<body>
<canvas id="art" width="${settings.canvasWidth}" height="${settings.canvasHeight}"></canvas>
<script>
(()=>{'use strict';
let W=720,H=720*${settings.canvasHeight}/${settings.canvasWidth};
const TAU=Math.PI*2;
const canvas=document.getElementById('art');
const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
const paper=document.createElement('canvas');paper.width=Math.round(W);paper.height=Math.round(H);
const pctx=paper.getContext('2d',{alpha:false});
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const easeOutCubic=t=>1-Math.pow(1-t,3);
const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const DIRECTION_VECTORS=${JSON.stringify(DIRECTION_VECTORS)};
let settings=${config};
const paletteCache={leaf:[],koi:[],flower:[]};
let rng=mulberry32(settings.seed);
const rr=(a=0,b=1)=>a+(b-a)*rng();
let plants=[],fish=[],schools=[];
let leafGrid=new Map(),fishGrid=new Map();
let elapsed=0,collisionTests=0,activeBlooms=0;
let interaction=null,interactionSerial=0;
let pointerFollow={active:false,x:0,y:0};
let recording=null;
let recordingStartedAt=0;
let spawnOutsideNow=!!settings.startOutside;
let forceAllSchoolsOutsideNow=false;
let entryHoldUntil=0;
let exitSequenceActive=false;
let breadcrumbDrawing=false;
const isLightExport=true;
const LEAF_CELL=34,FISH_CELL=42,TRAIL_LEN=520;
const OUTSIDE_MARGIN=95;
const COVER_COLS=8,COVER_ROWS=11;
let coverage=new Float32Array(COVER_COLS*COVER_ROWS);
function updateFlowerWeightOutputs(){}
function updateKoiWeightOutputs(){}
function syncSchoolUI(){settings.schoolCount=Math.max(1,Math.min(settings.schoolCount,settings.fishCount,3));}
function status(){}
function updateSceneState(){}
${core}
rebuildPaletteCache();
makePaper();
coverage.fill(0);
generatePlants();
generateSchoolsAndFish();
if(settings.bloomSomeOnReset)applyBloomSample({deterministic:true});
canvas.addEventListener('pointerdown',ev=>{const p=pointerPos(ev);if(ev.pointerType==='mouse'&&settings.followPointer){pointerFollow={active:true,x:p.x,y:p.y}}else{triggerInteraction(p.x,p.y)}canvas.setPointerCapture?.(ev.pointerId)});
canvas.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse'||!settings.followPointer)return;const p=pointerPos(ev);pointerFollow.active=true;pointerFollow.x=p.x;pointerFollow.y=p.y});
canvas.addEventListener('pointerenter',ev=>{if(ev.pointerType!=='mouse'||!settings.followPointer)return;const p=pointerPos(ev);pointerFollow={active:true,x:p.x,y:p.y}});
canvas.addEventListener('pointerleave',()=>{pointerFollow.active=false});
canvas.addEventListener('pointercancel',()=>{pointerFollow.active=false});
let last=performance.now();
function tick(ts){
  let dt=(ts-last)/1000;last=ts;dt=Math.min(.033,Math.max(.001,dt));
  collisionTests=0;update(dt,ts);render();requestAnimationFrame(tick);
}
requestAnimationFrame(ts=>{last=ts;requestAnimationFrame(tick)});
})();
<\/script>
</body>
</html>`;
}

function exportLightHTML(){
  const html=buildLightHTML();
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`${projectFileStem()}-1.0-${settings.seed}.html`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  status("text.lightweight_html_exported_responsive_without_panel_metrics_or_editing_to");
}

document.getElementById('exportLight').addEventListener('click',exportLightHTML);

document.getElementById('record').addEventListener('click',()=>{
  const btn=document.getElementById('record');
  if(recording&&recording.state==='recording'){
    recording.stop();
    return;
  }
  if(!canvas.captureStream||!window.MediaRecorder){
    status("text.this_browser_does_not_support_webm_recording_from_canvas");
    return;
  }

  settings.recordSeconds=clamp(Math.round(Number(document.getElementById('recordSeconds').value)||6),1,120);
  settings.recordResetScene=!!document.getElementById('recordResetScene').checked;
  settings.recordStartWithEntry=!!document.getElementById('recordStartWithEntry').checked;
  settings.recordEntryDelaySeconds=clamp(Number(document.getElementById('recordEntryDelaySeconds').value)||0,0,10);
  settings.recordEndWithExit=!!document.getElementById('recordEndWithExit').checked;
  settings.breadcrumbVisibleOutput=!!document.getElementById('breadcrumbVisibleOutput').checked;
  updateRecordUI();

  if(paused){
    paused=false;
    const pauseBtn=document.getElementById('pause');
    if(pauseBtn)pauseBtn.textContent=ui("text.pause");
  }

  const shouldReset=settings.recordResetScene||settings.recordStartWithEntry;
  const entryDelay=settings.recordStartWithEntry
    ?Math.min(settings.recordEntryDelaySeconds,Math.max(0,settings.recordSeconds-.25))
    :0;
  if(shouldReset){
    resetScene({forceOutside:settings.recordStartWithEntry,entryDelaySeconds:entryDelay});
  }

  const stream=canvas.captureStream(60);
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ?'video/webm;codecs=vp9':'video/webm';

  recordingChunks=[];
  recording=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
  recording.ondataavailable=e=>{if(e.data.size)recordingChunks.push(e.data)};
  recording.onstop=()=>{
    clearTimeout(recordTimer);recordTimer=null;
    clearTimeout(recordExitTimer);recordExitTimer=null;
    const blob=new Blob(recordingChunks,{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`${projectFileStem()}-1.0-${settings.seed}-${settings.recordSeconds}s.webm`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    recording=null;
    recordingStartedAt=0;
    updateRecordUI();
    updateSceneState();
    status("text.video_exported");
  };
  recording.start();
  recordingStartedAt=performance.now();
  btn.textContent=ui("text.stop_recording");
  updateSceneState();

  const activeLengths=(settings.schoolLengths||[]).slice(0,settings.schoolCount).map(v=>Number(v)||0);
  const longestSchool=Math.max(Number(settings.schoolLength)||0,...activeLengths);
  const exitLead=settings.recordEndWithExit
    ?clamp(2.6+longestSchool*4.5+settings.fishCount*.025,2.8,7.2)
    :0;

  if(settings.recordEndWithExit){
    const triggerAfter=Math.max(.45,settings.recordSeconds-exitLead);
    recordExitTimer=setTimeout(()=>{
      if(recording&&recording.state==='recording'){
        triggerExitAll();
        status("text.recording_the_koi_exit");
      }
    },triggerAfter*1000);
  }

  status(uiMsg('recordingStatus',{
    seconds:settings.recordSeconds,
    reset:settings.recordResetScene?uiMsg('recordResetPart'):'',
    entry:settings.recordStartWithEntry?uiMsg('recordEntryPart',{delay:entryDelay.toFixed(1)}):'',
    exit:settings.recordEndWithExit?uiMsg('recordExitPart'):''
  }));

  recordTimer=setTimeout(()=>{
    if(recording&&recording.state==='recording')recording.stop();
  },settings.recordSeconds*1000);
});


let activeEditorTab='composition';
function activateEditorTab(tab,options={}){
  activeEditorTab=tab;
  document.querySelectorAll('.editor-tab').forEach(btn=>{
    const active=btn.dataset.editorTab===tab;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-selected',String(active));
  });
  const groups=[...document.querySelectorAll('.panel-body > .group')];
  groups.forEach(group=>group.classList.toggle('tab-hidden',group.dataset.tab!==tab));

  const visible=groups.filter(g=>g.dataset.tab===tab);
  if(visible.length&&!visible.some(g=>!g.classList.contains('collapsed'))){
    visible[0].classList.remove('collapsed');
    const title=visible[0].querySelector('.group-title');
    if(title)title.setAttribute('aria-expanded','true');
  }
  if(options.scroll!==false){
    const body=document.querySelector('.panel-body');
    if(body&&body.scrollHeight>body.clientHeight)body.scrollTo({top:0,behavior:'auto'});
    const tabs=document.querySelector('.editor-tabs');
    const activeBtn=tabs?.querySelector('.editor-tab.active');
    if(tabs&&activeBtn){
      const left=activeBtn.offsetLeft-tabs.clientWidth/2+activeBtn.clientWidth/2;
      tabs.scrollTo({left:Math.max(0,left),behavior:'auto'});
    }
  }
}

document.querySelectorAll('.editor-tab').forEach(btn=>{
  btn.setAttribute('role','tab');
  btn.addEventListener('click',()=>activateEditorTab(btn.dataset.editorTab));
});

function syncTopViewMode(){
  const mode=document.getElementById('topViewMode');
  if(mode)mode.value=settings.fitViewport?'fit':'width';
  const fitBtn=document.getElementById('canvasFitBtn');
  if(fitBtn)fitBtn.classList.toggle('active',!!settings.fitViewport);
}
function setViewMode(mode){
  settings.fitViewport=mode!=='width';
  const fit=document.getElementById('fitViewport');
  if(fit)fit.checked=!!settings.fitViewport;
  updateAspectUI();
  syncTopViewMode();
}
const topViewMode=document.getElementById('topViewMode');
if(topViewMode)topViewMode.addEventListener('change',e=>setViewMode(e.target.value));
const canvasFitBtn=document.getElementById('canvasFitBtn');
if(canvasFitBtn)canvasFitBtn.addEventListener('click',()=>setViewMode(settings.fitViewport?'width':'fit'));

async function toggleStageFullscreen(){
  const shell=document.getElementById('stageShell');
  try{
    if(!document.fullscreenElement){
      await shell?.requestFullscreen?.();
    }else{
      await document.exitFullscreen?.();
    }
  }catch(err){status("text.the_browser_did_not_allow_fullscreen_mode");}
}
['stageFullscreen','canvasFullBtn'].forEach(id=>{
  const el=document.getElementById(id);if(el)el.addEventListener('click',toggleStageFullscreen);
});

document.addEventListener('fullscreenchange',()=>{
  const full=!!document.fullscreenElement;
  document.getElementById('canvasFullBtn')?.classList.toggle('active',full);
});

const topExport=document.getElementById('topExport');
if(topExport)topExport.addEventListener('click',()=>{
  activateEditorTab('presets');
  const outputTitle=document.querySelector('.group-title[data-index="07"]');
  const outputGroup=outputTitle?.closest('.group');
  if(outputGroup?.classList.contains('collapsed')){
    outputGroup.classList.remove('collapsed');
    outputTitle.setAttribute('aria-expanded','true');
  }
  setTimeout(()=>outputGroup?.scrollIntoView({behavior:'auto',block:'nearest'}),120);
});

function updateUtilityState(){
  const el=document.getElementById('utilityState');
  if(!el)return;
  const drawing=!!document.getElementById('editBreadcrumbs')?.checked;
  if(drawing){el.textContent=ui("text.path_drawing"); return;}
  const modes=(settings.schoolTouchModes||[]).slice(0,settings.schoolCount);
  if(!modes.length){el.textContent=ui("text.no_schools"); return;}
  const unique=[...new Set(modes)];
  el.textContent=unique.length===1
    ?uiMsg('touchSingle',{mode:touchModeText(unique[0])})
    :uiMsg('touchMixed',{modes:unique.map(touchModeText).join(' / ')});
}
const tapControl=document.getElementById('tapAttract');
if(tapControl)tapControl.addEventListener('change',updateUtilityState);
const followPointerControl=document.getElementById('followPointer');
if(followPointerControl)followPointerControl.addEventListener('change',e=>{
  settings.followPointer=!!e.target.checked;
  if(!settings.followPointer)pointerFollow.active=false;
  updateSceneState();
});
const routeControl=document.getElementById('editBreadcrumbs');
if(routeControl)routeControl.addEventListener('change',updateUtilityState);

const infoPopover=document.createElement('div');
infoPopover.className='info-popover';
infoPopover.id='infoPopover';
infoPopover.setAttribute('role','tooltip');
document.body.appendChild(infoPopover);
let pinnedInfoButton=null;
let hoverInfoButton=null;

function positionInfoPopover(btn){
  const r=btn.getBoundingClientRect();
  const pad=10;
  const width=Math.min(270,window.innerWidth-pad*2);
  infoPopover.style.width=width+'px';
  const measured=infoPopover.getBoundingClientRect();
  let left=Math.min(window.innerWidth-width-pad,Math.max(pad,r.right-width));
  let top=r.bottom+7;
  if(top+measured.height>window.innerHeight-pad)top=Math.max(pad,r.top-measured.height-7);
  infoPopover.style.left=left+'px';
  infoPopover.style.top=top+'px';
}
function showInfo(btn,pinned=false){
  if(!btn?.dataset.info)return;
  infoPopover.textContent=btn.dataset.info;
  infoPopover.classList.add('open');
  infoPopover.classList.toggle('pinned',pinned);
  btn.setAttribute('aria-expanded',pinned?'true':'false');
  requestAnimationFrame(()=>positionInfoPopover(btn));
}
function closeInfo(){
  if(pinnedInfoButton)pinnedInfoButton.setAttribute('aria-expanded','false');
  infoPopover.classList.remove('open','pinned');
  pinnedInfoButton=null;hoverInfoButton=null;
}
document.addEventListener('pointerover',e=>{
  const btn=e.target.closest?.('.info-btn');
  if(!btn||pinnedInfoButton)return;
  hoverInfoButton=btn;showInfo(btn,false);
});
document.addEventListener('pointerout',e=>{
  const btn=e.target.closest?.('.info-btn');
  if(!btn||pinnedInfoButton)return;
  if(e.relatedTarget&&btn.contains(e.relatedTarget))return;
  hoverInfoButton=null;infoPopover.classList.remove('open');
});
document.addEventListener('focusin',e=>{
  const btn=e.target.closest?.('.info-btn');
  if(btn&&!pinnedInfoButton){hoverInfoButton=btn;showInfo(btn,false);}
});
document.addEventListener('focusout',e=>{
  if(e.target.closest?.('.info-btn')&&!pinnedInfoButton){hoverInfoButton=null;infoPopover.classList.remove('open');}
});
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('.info-btn');
  if(btn){
    e.preventDefault();e.stopPropagation();
    if(pinnedInfoButton===btn){closeInfo();return;}
    if(pinnedInfoButton)pinnedInfoButton.setAttribute('aria-expanded','false');
    pinnedInfoButton=btn;hoverInfoButton=null;showInfo(btn,true);return;
  }
  if(pinnedInfoButton&&!infoPopover.contains(e.target))closeInfo();
});
window.addEventListener('resize',()=>{const btn=pinnedInfoButton||hoverInfoButton;if(btn&&infoPopover.classList.contains('open'))positionInfoPopover(btn)});
window.addEventListener('scroll',()=>{const btn=pinnedInfoButton||hoverInfoButton;if(btn&&infoPopover.classList.contains('open'))positionInfoPopover(btn)},true);

document.querySelectorAll('.group-title').forEach(title=>{
  const group=title.closest('.group');
  const toggle=()=>{
    group.classList.toggle('collapsed');
    title.setAttribute('aria-expanded',String(!group.classList.contains('collapsed')));
  };
  title.setAttribute('role','button');
  title.setAttribute('aria-expanded',String(!group.classList.contains('collapsed')));
  title.addEventListener('click',toggle);
  title.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
  });
});

window.addEventListener('keydown',e=>{
  if(e.defaultPrevented)return;
  const target=e.target;
  if(target&&(target.isContentEditable||target.matches?.('input,select,textarea,button')))return;
  if(e.code==='Space'){
    e.preventDefault();
    paused=!paused;
    document.getElementById('pause').textContent=ui(paused?"text.resume":"text.pause");
    updateSceneState();
  }
  if(e.key==='r'||e.key==='R')document.getElementById('regen').click();
});

refreshColorPresetSelect('color:rojo-azul');
refreshMotionPresetSelect('motion:base-serena');
refreshPresetSelect('__none__');
syncSettingsToUI();
renderAllColorsEditor();
activateEditorTab('composition',{scroll:false});
syncTopViewMode();
updateUtilityState();
if(prefersReducedMotion){
  const pauseButton=document.getElementById('pause');
  if(pauseButton)pauseButton.textContent=ui("text.resume");
}
resetScene();
updateSceneState();
requestAnimationFrame(ts=>{
  lastTs=ts;
  requestAnimationFrame(frame);
});

})().catch(error=>{
  console.error('ChisenKoi initialization failed:',error);
  const message=document.createElement('pre');
  message.textContent=error.message;
  document.body.replaceChildren(message);
});
