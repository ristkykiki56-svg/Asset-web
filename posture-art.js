/**
 * Shooting Lab posture sprite adapter.
 * Images are not sourced from measured athlete photos; no motion or bone simulation.
 * The original SVG renderer remains the fallback until all six approved assets load.
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
    front:{spine:[.50,.43],head:[.51,.13],rightShoulder:[.31,.27],leftArm:[.68,.28],leftWrist:[.65,.30],rightHand:[.33,.39],elbowHip:[.64,.45],pelvis:[.50,.51],leftLeg:[.64,.77],rightLeg:[.31,.77]},
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
    const toggle=document.getElementById('postureArtMode');
    if(toggle){ toggle.disabled=!state.ready; toggle.checked=state.active; }
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
    figure:(pose)=>{
      if(!state.ready||!state.active)return '';
      const v=viewOf(pose),d=dimensions[v];
      const href=url(state.color,v),mirror=pose==='sideRight';
      const graphic='<image href="'+href+'" x="'+d.x+'" y="'+d.y+'" width="'+d.w+'" height="'+d.h+'" preserveAspectRatio="xMidYMid meet" />';
      const guide=document.getElementById('xrayToggleBtn')?.getAttribute('aria-pressed')==='true'
        ?'<line x1="230" y1="36" x2="230" y2="490" stroke="#5b858f" stroke-width="1.5" stroke-dasharray="5 7" opacity=".65" />'
        :'';
      return '<g role="img" aria-label="Ilustrasi karakter statis '+(state.color==='blue'?'versi biru':'versi merah')+', tampak '+v+'. Bukan pengukuran atlet.">'
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
    const mode=document.getElementById('postureArtMode');
    const controls=document.getElementById('postureArtControls');
    if(!mode||!controls)return;
    mode.disabled=true;
    controls.addEventListener('click',e=>{
      const btn=e.target.closest('[data-pose-color]');
      if(!btn||!state.ready)return;
      state.color=btn.dataset.poseColor;state.active=true;
      status('Karakter '+(state.color==='blue'?'biru':'merah')+' ditampilkan. Figur tetap diam saat parameter model diubah.');
      refresh();
    });
    mode.addEventListener('change',()=>{
      state.active=state.ready && mode.checked;
      status(state.active?'Karakter WebP statis. Garis dan titik hanya anotasi visual.':'Skema SVG aktif sebagai tampilan alternatif.');
      refresh();
    });
    syncControls();
    Promise.all(variants.flatMap(v=>views.map(p=>preload(url(v,p))))).then(()=>{
      state.ready=true;
      state.active=true;
      status('Pilih karakter dan sudut pandang. Slider hanya mengubah indikator model.');
      refresh();
    }).catch(()=>{
      state.ready=false;state.active=false;
      status('Aset karakter belum tersedia; skema SVG tetap digunakan.',true);
      refresh();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();