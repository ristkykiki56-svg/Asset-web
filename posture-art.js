/**
 * Shooting Lab posture sprite adapter.
 * Images are not sourced from measured athlete photos; no motion or bone simulation.
 * Missing artwork is reported explicitly; no substitute character is generated.
 */
(() => {
  'use strict';
  const base = '/assets/posture/';
  const variants = ['blue','red'];
  const views = ['front','side','back'];
  const state = {ready:false,active:false,color:'blue'};
  const dimensions = {
    front:{x:142,y:28,w:176,h:472},
    side:{x:101,y:28,w:253,h:472},
    back:{x:142,y:28,w:176,h:472}
  };
  // Approximate visual anchor fractions checked against both WebP alpha masks.
  // Subject-left is screen-right in front view; these are not anatomical measurements.
  const anchors = {
    front:{spine:[.50,.43],head:[.51,.13],rightShoulder:[.31,.27],leftArm:[.68,.28],leftWrist:[.65,.30],rightHand:[.33,.39],elbowHip:[.79,.35],pelvis:[.50,.51],leftLeg:[.64,.77],rightLeg:[.31,.77]},
    side:{spine:[.42,.43],head:[.37,.13],rightShoulder:[.45,.27],leftArm:[.57,.27],leftWrist:[.55,.23],rightHand:[.50,.23],elbowHip:[.48,.47],pelvis:[.46,.52],leftLeg:[.40,.76],rightLeg:[.51,.76]},
    back:{spine:[.50,.42],head:[.50,.14],rightShoulder:[.69,.28],leftArm:[.31,.29],leftWrist:[.22,.39],rightHand:[.72,.39],elbowHip:[.36,.46],pelvis:[.50,.52],leftLeg:[.35,.76],rightLeg:[.69,.76]}
  };
  const viewOf = p => p==='front'?'front':p==='back'?'back':'side';
  const url = (color,view) => base+color+'-'+view+'.webp';
  function status(message, failed=false) {
    const s=document.getElementById('postureArtStatus');
    if(s){ s.textContent=message; s.dataset.error=String(failed); }
  }
  function syncControls() {
    for(const b of document.querySelectorAll('#postureArtControls [data-pose-color]')) {
      b.disabled=!state.ready;
      b.setAttribute('aria-pressed',String(state.color===b.dataset.poseColor && state.active));
    }
    document.getElementById('sec-biomech')?.classList.toggle('ts-pose-art-active',state.ready && state.active);
  }
  function refresh() {
    syncControls();
    if(typeof window.renderBiomechViewport==='function')window.renderBiomechViewport();
  }
  window.tsPosturePoseArt = {
    isActive:()=>state.ready && state.active,
    anchor:(point,pose)=>{
      if(!state.ready||!state.active)return null;
      const v=viewOf(pose), d=dimensions[v], f=anchors[v]?.[point.id];
      if(!f)return null;
      const mirrored=pose==='sideRight';
      const x=d.x+f[0]*d.w;
      return [mirrored?460-x:x,d.y+f[1]*d.h];
    },
    figure:(pose,selectedId)=>{
      if(!state.ready||!state.active)return '';
      const v=viewOf(pose),d=dimensions[v];
      const href=url(state.color,v),mirror=pose==='sideRight';
      const graphic='<image href="'+href+'" x="'+d.x+'" y="'+d.y+'" width="'+d.w+'" height="'+d.h+'" preserveAspectRatio="xMidYMid meet" />';
      const point=anchors[v]?.[selectedId];
      const x=point ? d.x+point[0]*d.w : 230;
      const y=point ? d.y+point[1]*d.h : 270;
      const guideX=mirror?460-x:x;
      const guide=document.getElementById('xrayToggleBtn')?.getAttribute('aria-pressed')==='true' && point
        ? '<g class="posture-point-guide" aria-hidden="true" fill="none" stroke="#FF4800" stroke-width="3"><circle cx="'+guideX+'" cy="'+y+'" r="24" fill="#FF4800" fill-opacity=".12"/><path d="M'+(guideX-34)+' '+y+'H'+(guideX+34)+'M'+guideX+' '+(y-34)+'V'+(y+34)+'" stroke-dasharray="5 4"/></g>'
        : '';
      return '<g role="img" aria-label="Karakter '+(state.color==='blue'?'biru':'merah')+', tampak '+(mirror?'samping cermin':({front:'depan',back:'belakang',side:'samping'})[v])+'.">'
        +(mirror?'<g transform="translate(460 0) scale(-1 1)">'+graphic+'</g>':graphic)
        +guide+'</g>';
    }
  };
  function preload(path) {
    return new Promise((resolve,reject)=>{
      const im=new Image();im.onload=()=>im.naturalWidth>=120?resolve():reject(Error('small image'));
      im.onerror=()=>reject(Error('image unavailable'));im.src=path;
    });
  }
  function init() {
    const controls=document.getElementById('postureArtControls');
    if(!controls)return;
    controls.addEventListener('click',e=>{
      const btn=e.target.closest('[data-pose-color]');
      if(!btn||!state.ready)return;
      state.color=btn.dataset.poseColor;state.active=true;
      status('Karakter '+(state.color==='blue'?'biru':'merah')+' ditampilkan tanpa gerakan. Pilih sudut pandang atau titik tubuh untuk melihat penjelasannya.');
      refresh();
    });
    syncControls();
    Promise.all(variants.flatMap(v=>views.map(p=>preload(url(v,p))))).then(()=>{
      state.ready=true;
      state.active=true;
      status('Pilih warna karakter, sudut pandang, atau titik tubuh.');
      refresh();
    }).catch(()=>{
      state.ready=false;state.active=false;
      status('Gambar karakter tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.',true);
      refresh();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
