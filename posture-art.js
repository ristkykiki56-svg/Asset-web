/* Photo viewports retain the original poster pixels and use source coordinates for pins. */
(() => {
 'use strict';
 const source='/assets/posture/poster-v15.png';
 const state={ready:false,active:false,color:'blue'};
 const photos={
  blue:{
   back:{frame:[620,25,880,1800],clip:'621,151 1028,151 1031,183 1067,187 1092,104 1161,50 1236,39 1326,61 1370,115 1409,259 1470,349 1434,392 1416,511 1384,601 1319,687 1276,788 1269,1051 1287,1231 1290,1479 1370,1681 1370,1789 1298,1818 1190,1814 1161,1627 1110,1433 1060,1289 1006,1440 952,1742 909,1825 790,1829 790,1753 795,1573 795,1321 858,1069 826,975 826,839 840,745 869,684 898,619 862,558 822,493 794,439 714,410 624,403',points:{spine:[1080,760],pelvis:[1100,1030],head:[1230,210],rightShoulder:[1090,390]}},
   front:{frame:[640,2160,620,2100],clip:'862,2194 963,2194 1026,2244 1047,2336 1093,2425 1135,2530 1160,2647 1143,2756 1118,2878 1122,3038 1160,3151 1152,3286 1110,3458 1093,3659 1093,3853 1131,4079 1114,4163 1047,4231 929,4256 807,4239 723,4180 727,4100 807,4037 879,3991 883,3924 719,3882 719,3647 870,3546 828,3277 820,3130 832,2962 790,2882 744,2786 711,2702 677,2677 681,2584 723,2517 786,2458 816,2391 811,2307',points:{head:[990,2330],rightShoulder:[850,2550],leftArm:[1080,2640],elbowHip:[1035,2910],pelvis:[1020,3250],leftLeg:[1025,3750],rightLeg:[930,3660]}},
   sideLeft:{frame:[70,620,580,245],points:{head:[487,718]}},
   sideRight:{frame:[640,2290,610,670],clip:'640,2290 1175,2290 1175,2960 640,2960',points:{leftWrist:[887,2622],rightHand:[827,2552],head:[990,2330]}}
  },
  red:{
   back:{frame:[1850,10,620,1980],clip:'2049,14 2140,18 2215,58 2235,160 2215,279 2243,343 2303,418 2406,501 2425,556 2386,620 2326,644 2271,691 2231,810 2215,976 2200,1079 2204,1249 2196,1424 2279,1543 2299,1618 2227,1665 2160,1653 2132,1558 2124,1748 2223,1851 2271,1907 2263,1962 2188,1974 2089,1962 2002,1927 1930,1855 1930,1760 1954,1554 1954,1384 1962,1218 1938,1063 1922,964 1922,842 1938,743 1962,663 1954,608 1922,525 1914,457 1942,347 1974,307 1970,188 1986,85',points:{spine:[2140,650],pelvis:[2090,980],head:[2110,170],rightShoulder:[2225,440]}},
   front:{frame:[1900,2200,1000,2000],clip:'2096,2260 2228,2260 2292,2300 2324,2372 2324,2472 2360,2476 2364,2380 2900,2380 2900,2648 2848,2660 2792,2644 2764,2700 2732,2760 2692,2824 2604,2880 2524,2884 2504,2996 2532,3120 2564,3232 2568,3380 2560,3600 2552,3828 2584,4036 2580,4116 2528,4160 2464,4160 2400,4136 2384,4064 2376,3940 2352,3804 2312,3632 2248,3764 2192,3956 2120,4076 2064,4140 1992,4140 1972,4096 1984,4024 2044,3936 2084,3820 2124,3660 2140,3552 2144,3424 2144,3300 2096,3228 2064,3112 2060,2988 2020,2884 1956,2848 1924,2776 1924,2696 1952,2624 1992,2600 2032,2608 2040,2528 2024,2448 2044,2356',points:{head:[2130,2380],rightShoulder:[2090,2580],leftArm:[2495,2810],elbowHip:[2500,2895],pelvis:[2300,3330],leftLeg:[2480,3900],rightLeg:[2070,3900]}},
   sideLeft:{frame:[2770,3210,640,350],points:{head:[3035,3318]}},
   sideRight:{frame:[2040,2460,850,590],clip:'2040,2460 2890,2460 2890,2658 2801,2662 2748,2648 2710,2686 2682,2737 2645,2775 2629,2844 2607,2915 2584,2978 2554,3022 2520,3055 2445,3055 2384,3032 2321,3018 2242,2984 2151,2931 2062,2866 2040,2771',points:{leftWrist:[2660,2700],rightHand:[2440,2635],head:[2150,2490]}}
  }
 };
 photos.blue.feet={frame:[700,3450,470,830],clip:photos.blue.front.clip,points:{leftLeg:[1040,4050],rightLeg:[940,3690]}};
 photos.red.feet={frame:[1920,3450,700,770],clip:photos.red.front.clip,points:{leftLeg:[2490,3930],rightLeg:[2070,3930]}};
 const names={blue:'Clarisa Azalia',red:'Aurellia Cassandra'};
 const labels={back:'belakang',front:'depan atau serong',sideLeft:'detail kepala',sideRight:'detail tangan',feet:'detail kaki'};
 const photo=pose=>photos[state.color][pose]||photos[state.color].back;
 function fit(p){const [x,y,w,h]=p.frame,scale=Math.min(420/w,500/h);return{x:(460-w*scale)/2,y:(540-h*scale)/2,w:w*scale,h:h*scale,scale,sourceX:x,sourceY:y};}
 function anchor(id,pose){
  const p=photo(pose),f=fit(p),point=p.points[id]||[p.frame[0]+p.frame[2]/2,p.frame[1]+p.frame[3]/2];
  return[f.x+(point[0]-f.sourceX)*f.scale,f.y+(point[1]-f.sourceY)*f.scale];
 }
 function status(text,failed=false){
  const node=document.getElementById('postureArtStatus');if(node){node.textContent=text;node.dataset.error=String(failed);}
  const area=document.getElementById('posturePhotoLoading');if(area){area.hidden=state.ready&&!failed;area.textContent=text;}
 }
 function figure(pose,id,context='main'){
  if(!state.ready)return '';
  const p=photo(pose),f=fit(p),point=anchor(id,pose),clipId='posture-photo-'+state.color+'-'+pose+'-'+context;
  const clip=p.clip?'<defs><clipPath id="'+clipId+'" clipPathUnits="userSpaceOnUse"><polygon points="'+p.clip+'"/></clipPath></defs>':'';
  const image='<svg x="'+f.x+'" y="'+f.y+'" width="'+f.w+'" height="'+f.h+'" viewBox="'+p.frame.join(' ')+'" overflow="hidden">'+clip+'<image href="'+source+'" x="0" y="0" width="3466" height="5000"'+(p.clip?' clip-path="url(#'+clipId+')"':'')+'/></svg>';
  const guide='<g class="posture-point-guide" aria-hidden="true" fill="none" stroke="#FF4800" stroke-width="2.5"><circle cx="'+point[0]+'" cy="'+point[1]+'" r="18"/><path d="M'+(point[0]-26)+' '+point[1]+'H'+(point[0]+26)+'M'+point[0]+' '+(point[1]-26)+'V'+(point[1]+26)+'" stroke-dasharray="4 4"/></g>';
  return '<g role="img" aria-label="Foto '+names[state.color]+' dari poster v15, '+labels[pose]+'.">'+image+guide+'</g>';
 }
 function choose(color){
  if(!photos[color])return;
  state.color=color;
  for(const button of document.querySelectorAll('#postureArtControls [data-pose-color]')){
   button.disabled=!state.ready;button.setAttribute('aria-pressed',String(state.color===button.dataset.poseColor));
  }
  document.getElementById('sec-biomech')?.classList.toggle('ts-pose-art-active',state.ready);
  const zoom=document.getElementById('posturePhotoZoom');if(zoom)zoom.disabled=!state.ready;
  status(state.ready?'Foto '+names[color]+'. Pilih titik tubuh untuk melihat penjelasannya.':'Memuat foto…');
  if(typeof window.renderBiomechViewport==='function')window.renderBiomechViewport();
 }
 window.tsPosturePoseArt={
  isActive:()=>state.ready,
  anchor:(point,pose)=>state.ready?anchor(point.id,pose):null,
  figure,
  detail:(pose,id)=>{const p=anchor(id,pose);return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(p[0]-75)+' '+(p[1]-75)+' 150 150" width="100%" height="100%">'+figure(pose,id,'detail')+'</svg>';},
  choose,
  person:()=>names[state.color],
  getPhoto:pose=>photo(pose)
 };
 function init(){
  const controls=document.getElementById('postureArtControls');if(!controls)return;
  controls.addEventListener('click',event=>{const button=event.target.closest('[data-pose-color]');if(button&&state.ready)choose(button.dataset.poseColor);});
  choose('blue');
  const image=new Image();
  image.onload=()=>{if(image.naturalWidth<120)return;state.ready=state.active=true;choose(state.color);};
  image.onerror=()=>{state.ready=state.active=false;choose(state.color);status('Foto poster tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.',true);};
  image.src=source;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
