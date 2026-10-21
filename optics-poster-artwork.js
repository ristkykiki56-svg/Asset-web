/* Shooting Lab Optics: intact raster artwork in two real WebP layers.
 * One immovable telescope/rifle/background, one alpha-matted generic head.
 * No pixel warping, procedural face redraw, automatic idle or breathing motion.
 * Visual model only: travel is NOT athlete measurement or scope calibration. */
(()=>{
'use strict';
const stage=document.getElementById('opticalAlignmentArtwork');
const base=document.getElementById('opticStaticArt');
const head=document.getElementById('opticHeadArt');
const fallback=document.getElementById('opticalAlignmentIllustration');
const announcer=document.getElementById('opticsArtworkStatus');
const zoomButton=document.getElementById('opticsDetailToggle');
const view=stage.closest('.optical-side-pan');
if(!stage||!base||!head||!fallback)return;

let ready=false;
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function announce(s){if(announcer)announcer.textContent=s}
function placement(dist=85,height=0){
 // Limit translation to preserve collar/head continuity. Pixel coordinates are
 // illustrative, and deliberately much smaller than equipment travel in mm.
 return {
   x:clamp((Number(dist)-85)*.18,-6.5,6.5),
   y:clamp(-Number(height)*.10,-2.5,2.5)
 };
}
function apply({dist=85,height=0}={},immediate=false){
 if(!ready)return;
 const p=placement(dist,height);
 // Hidden mobile lessons report clientWidth=0. Calculate the display scale
 // using the known CSS mobile canvas width until the lesson is opened.
 const displayWidth=stage.clientWidth || (window.matchMedia('(max-width: 767px)').matches
   ? 650 : Math.min(1320,Math.max(320,window.innerWidth-32)));
 const ratio=displayWidth/(base.naturalWidth||1320);
 const x=p.x*ratio,y=p.y*ratio;
 head.style.transition=immediate||prefersReduced.matches?'none':'transform 150ms ease-out';
 head.style.transform='translate3d('+x.toFixed(3)+'px,'+y.toFixed(3)+'px,0)';
 stage.dataset.headX=p.x.toFixed(3);
 stage.dataset.headY=p.y.toFixed(3);
}
window.OpticsPosterArt={
 update:(v)=>apply(v),
 renderImmediately:(v)=>apply(v,true),
 isReady:()=>ready,
 getHead:()=>head,
 getStatic:()=>base
};
// Default view contains the whole illustration. Detail mode is a deliberate
// user action; switching modes must never permanently hide the objective lens.
if(view&&zoomButton){
 zoomButton.addEventListener('click',()=>{
   const zoom=view.classList.toggle('is-detail-zoom');
   zoomButton.setAttribute('aria-pressed',String(zoom));
   zoomButton.textContent=zoom?'Tampilkan seluruh gambar':'Perbesar detail gambar';
   view.scrollLeft=zoom ? Math.max(0,view.scrollWidth-view.clientWidth) : 0;
   apply({
     dist:document.getElementById('optEyeDist')?.value,
     height:document.getElementById('optCheekHeight')?.value
   },true);
 });
}
function maybeReady(){
 if(ready)return;
 if(!base.complete||!head.complete)return;
 if(base.naturalWidth<600||head.naturalWidth<600
    ||base.naturalWidth!==head.naturalWidth||base.naturalHeight!==head.naturalHeight)return;
 ready=true;
 stage.hidden=false;
 fallback.hidden=true;
 fallback.setAttribute('hidden','');
 fallback.style.setProperty('display','none','important');
 document.getElementById('sec-optics')?.classList.add('optics-poster-ready');
 announce('Ilustrasi dua layer aktif. Kepala bergerak terbatas sesuai slider; teleskop tetap diam.');
 apply({dist:document.getElementById('optEyeDist')?.value,height:document.getElementById('optCheekHeight')?.value},true);
}
function fail(){
 ready=false;stage.hidden=true;fallback.hidden=false;
 fallback.removeAttribute('hidden');
 fallback.style.removeProperty('display');
 announce('Ilustrasi gambar tidak tersedia. Skema SVG cadangan ditampilkan.');
}
for(const im of [base,head]){
 im.addEventListener('load',maybeReady);
 im.addEventListener('error',fail);
}
if(base.complete&&head.complete)maybeReady();
window.addEventListener('resize',()=>{
 if(!ready)return;
 apply({dist:document.getElementById('optEyeDist')?.value,height:document.getElementById('optCheekHeight')?.value},true);
},{passive:true});
})();