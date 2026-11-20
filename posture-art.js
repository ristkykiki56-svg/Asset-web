/* Pre-cropped transparent pose images with exact percentage pin coordinates. */
(() => {
  'use strict';
  const POSES = {"blue":{"back":{"src":"assets/posture/poses/blue-back.webp","aspect":0.4889,"points":{"spine":[52.27,40.83],"pelvis":[54.55,55.83],"head":[69.32,10.28],"rightShoulder":[53.41,20.28]}},"front":{"src":"assets/posture/poses/blue-front.webp","aspect":0.2952,"points":{"head":[56.45,8.1],"rightShoulder":[33.87,18.57],"leftArm":[70.97,22.86],"elbowHip":[63.71,35.71],"pelvis":[61.29,51.9],"leftLeg":[62.1,75.71],"rightLeg":[46.77,71.43]}},"sideLeft":{"src":"assets/posture/poses/blue-sideLeft.webp","aspect":2.3673,"points":{"head":[71.9,40.0]}},"sideRight":{"src":"assets/posture/poses/blue-sideRight.webp","aspect":0.9104,"points":{"leftWrist":[40.49,49.55],"rightHand":[30.66,39.1],"head":[57.38,5.97]}},"feet":{"src":"assets/posture/poses/blue-feet.webp","aspect":0.5663,"points":{"leftLeg":[72.34,72.29],"rightLeg":[51.06,28.92]}}},"red":{"back":{"src":"assets/posture/poses/red-back.webp","aspect":0.3131,"points":{"spine":[46.77,32.32],"pelvis":[38.71,48.99],"head":[41.94,8.08],"rightShoulder":[60.48,21.72]}},"front":{"src":"assets/posture/poses/red-front.webp","aspect":0.5,"points":{"head":[23.0,9.0],"rightShoulder":[19.0,19.0],"leftArm":[59.5,30.5],"elbowHip":[60.0,34.75],"pelvis":[40.0,56.5],"leftLeg":[58.0,85.0],"rightLeg":[17.0,85.0]}},"sideLeft":{"src":"assets/posture/poses/red-sideLeft.webp","aspect":1.8286,"points":{"head":[41.41,30.86]}},"sideRight":{"src":"assets/posture/poses/red-sideRight.webp","aspect":1.4407,"points":{"leftWrist":[72.94,40.68],"rightHand":[47.06,29.66],"head":[12.94,5.08]}},"feet":{"src":"assets/posture/poses/red-feet.webp","aspect":0.9091,"points":{"leftLeg":[81.43,62.34],"rightLeg":[21.43,62.34]}}}};
  const NAMES = { blue: 'Clarisa Azalia', red: 'Aurellia Cassandra' };
  const state = { color: 'blue' };

  function getPose(pose) {
    return POSES[state.color]?.[pose] || POSES[state.color].back;
  }

  function choose(color) {
    if (!POSES[color]) return;
    state.color = color;
    document.querySelectorAll('#postureArtControls [data-pose-color]').forEach(btn => {
      btn.disabled = false;
      btn.setAttribute('aria-pressed', String(btn.dataset.poseColor === state.color));
    });
    const zoom = document.getElementById('posturePhotoZoom');
    if (zoom) zoom.disabled = false;
    const loading = document.getElementById('posturePhotoLoading');
    if (loading) loading.hidden = true;
    const status = document.getElementById('postureArtStatus');
    if (status) status.textContent = 'Foto ' + NAMES[color] + '. Pilih titik tubuh untuk melihat penjelasannya.';
    if (typeof window.renderBiomechViewport === 'function') window.renderBiomechViewport();
  }

  window.tsPosturePoseArt = {
    isActive: () => true,
    person: () => NAMES[state.color],
    getPose,
    pointPct: (id, pose) => {
      const p = getPose(pose);
      return p.points[id] || [50, 50];
    },
    detailHtml: (pose, id) => {
      const p = getPose(pose);
      const [lx, ty] = p.points[id] || [50, 50];
      return `<div class="pose-zoom-stage"><img src="${p.src}" alt="Detail foto ${NAMES[state.color]}" style="transform-origin:${lx}% ${ty}%;transform:scale(2.15);"/><span class="pose-zoom-ring" style="left:${lx}%;top:${ty}%;" aria-hidden="true"></span></div>`;
    },
    choose
  };

  function init() {
    const controls = document.getElementById('postureArtControls');
    if (controls) {
      controls.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-pose-color]');
        if (btn) choose(btn.dataset.poseColor);
      });
    }
    choose('blue');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
