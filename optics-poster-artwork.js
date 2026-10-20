/* Shooting Lab Optics: render the approved artwork directly, without redrawing
 * the telescope or face as SVG. This is a conceptual visualization only.
 * No automatic idle, facial, or breathing animation. */
(()=>{
'use strict';
const canvas=document.getElementById('opticalAlignmentArtwork');
const fallback=document.getElementById('opticalAlignmentIllustration');
const announcement=document.getElementById('opticsArtworkStatus');
if(!canvas||!fallback)return;
const ctx=canvas.getContext('2d',{willReadFrequently:true});
if(!ctx)return;
const image=new Image();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let source=null,buffer=null,ready=false,cx=0,cy=0,tx=0,ty=0,scheduled=0;
const smooth=(v,a,b)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
function render(dx,dy){
 if(!ready)return;
 if(Math.abs(dx)<.015&&Math.abs(dy)<.015){ctx.putImageData(source,0,0);return}
 const w=canvas.width,h=canvas.height,src=source.data,dst=buffer.data;
 // Only the head region of the *source pixels* is gently remapped. The scope,
 // mount, barrel and main rifle chassis always retain their original positions.
 // Feathering the transformation avoids visible seams at hair and neck edges.
 for(let y=0;y<h;y++){
  const verticalWeight=1-smooth(y/h,.63,.91);
  for(let x=0;x<w;x++){
   const strength=smooth(x/w,.59,.73)*verticalWeight;
   const sx=Math.max(0,Math.min(w-1,x-dx*strength));
   const sy=Math.max(0,Math.min(h-1,y-dy*strength));
   const x0=Math.floor(sx),x1=Math.min(w-1,x0+1),y0=Math.floor(sy),y1=Math.min(h-1,y0+1);
   const u=sx-x0,v=sy-y0,a=(y0*w+x0)*4,b=(y0*w+x1)*4,c=(y1*w+x0)*4,e=(y1*w+x1)*4,i=(y*w+x)*4;
   for(let k=0;k<3;k++)dst[i+k]=(src[a+k]*(1-u)+src[b+k]*u)*(1-v)+(src[c+k]*(1-u)+src[e+k]*u)*v;
   dst[i+3]=255;
  }
 }
 ctx.putImageData(buffer,0,0);
}
function tick(){
 scheduled=0;
 if(!ready)return;
 if(reduced.matches){cx=tx;cy=ty}
 else {cx+=(tx-cx)*.34;cy+=(ty-cy)*.34}
 render(cx,cy);
 if(Math.abs(tx-cx)>.08||Math.abs(ty-cy)>.08)scheduled=requestAnimationFrame(tick);
 else if(!reduced.matches){cx=tx;cy=ty;render(cx,cy)}
}
function update({dist=85,height=0}={}){
 // Values expressed as illustration pixels, not millimetres of body travel.
 tx=Math.max(-20,Math.min(20,(Number(dist)-85)*.5));
 ty=Math.max(-9,Math.min(9,-Number(height)*.36));
 if(ready&&!scheduled)scheduled=requestAnimationFrame(tick);
}
function renderImmediately({dist=85,height=0}={}){
 update({dist,height});
 if(scheduled)cancelAnimationFrame(scheduled);
 scheduled=0;cx=tx;cy=ty;render(cx,cy);
}
window.OpticsPosterArt={
 update,renderImmediately,isReady:()=>ready,getCanvas:()=>canvas
};
image.onload=()=>{
 try{
  if(image.naturalWidth<600)throw Error('incomplete artwork');
  canvas.width=Math.min(960,image.naturalWidth);
  canvas.height=Math.round(image.naturalHeight*canvas.width/image.naturalWidth);
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  source=ctx.getImageData(0,0,canvas.width,canvas.height);
  buffer=ctx.createImageData(canvas.width,canvas.height);
  ready=true;canvas.hidden=false;fallback.hidden=true;
  document.getElementById('sec-optics')?.classList.add('optics-poster-ready');
  if(announcement)announcement.textContent='Ilustrasi gambar aktif. Hanya kepala bergerak mengikuti slider.';
  update({dist:document.getElementById('optEyeDist')?.value,height:document.getElementById('optCheekHeight')?.value});
 }catch(err){if(announcement)announcement.textContent='Skema cadangan sedang digunakan.'}
};
image.onerror=()=>{if(announcement)announcement.textContent='Aset belum tersedia. Skema SVG cadangan tetap ditampilkan.'};
image.decoding='async';
image.src='/assets/optics/optic-artwork.webp';
})();