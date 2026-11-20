/* Twin Shooter Lab Studio — Interactive 5-Tab Controller & Simulations
 * Preserves 100% of original data, text, rules, and interactive calculations.
 */
(() => {
  'use strict';

  const MODULE_IDS = ['sec-biomech', 'sec-trigger', 'sec-optics', 'sec-imssu', 'sec-hardware', 'sec-match'];
  let activeModule = 'sec-biomech';

  function switchTab(id, updateHash = true) {
    if (!MODULE_IDS.includes(id)) return;
    activeModule = id;
    MODULE_IDS.forEach(mid => {
      const panel = document.getElementById(mid);
      if (panel) panel.classList.toggle('is-active', mid === id);
    });
    document.querySelectorAll('[data-studio-tab]').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.dataset.studioTab === id));
    });
    if (updateHash && window.location.hash !== '#' + id) {
      history.replaceState(null, '', '#' + id);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      if (id === 'sec-biomech') positionBiomechPins();
      if (id === 'sec-trigger') drawOscilloscope(oscProgress);
      if (id === 'sec-optics') renderOcularLoop();
    });
  }

  /* =========================================================================
     01 · POSTUR TUBUH (10-Point Standing Biomechanics)
     ========================================================================= */
  const POSTER_BIOMECH_DATA = [
    { id: 'spine', num: '01', pose: 'back', x: 52, y: 40, ref: 'POSTUR BERDIRI',
      title: 'Punggung dan kenyamanan postur',
      desc: 'Posisi badan sedikit condong ke belakang dengan panggul maju untuk membentuk tumpuan yang seimbang. Lengkungan punggung tetap dalam batas nyaman dan tidak dibuat berlebihan.',
      viewNote: 'Penanda menunjukkan area punggung. Perhatikan hubungannya dengan bahu dan panggul saat mempertahankan posisi berdiri.' },
    { id: 'head', num: '02', pose: 'sideLeft', x: 50, y: 16, ref: 'POSTUR BERDIRI',
      title: 'Kepala, pipi, dan arah pandang',
      desc: 'Kepala berada dalam posisi rileks dengan pipi bertumpu pada sandaran pipi. Mata menghadap langsung ke lensa okuler agar bidang pandang terlihat penuh dan jelas.',
      viewNote: 'Pembesaran berpusat pada area mata. Perhatikan jarak mata terhadap okuler dan letak pipi di atas sandaran.' },
    { id: 'rightShoulder', num: '03', pose: 'back', x: 39, y: 28, ref: 'POSTUR BERDIRI',
      title: 'Bahu kanan dan bantalan bahu',
      desc: 'Bahu kanan tetap rileks, sementara bantalan popor bertumpu dengan mantap pada bahu. Posisi ini menjaga hubungan senapan dengan badan selama membidik.',
      viewNote: 'Penanda mengarah ke area bahu kanan di dekat ujung popor. Sebagian permukaan kontak dapat tertutup pakaian atau senapan.' },
    { id: 'leftArm', num: '04', pose: 'front', x: 58, y: 33, ref: 'POSTUR BERDIRI',
      title: 'Bahu kiri dan lengan penopang',
      desc: 'Bahu kiri berada dalam keadaan rileks dengan lengan atas dekat pada badan. Lengan kiri dan tangan penopang bekerja sebagai satu tumpuan untuk menahan bagian depan senapan.',
      viewNote: 'Penanda menunjukkan area lengan atas kiri. Bandingkan dengan letak siku pada titik 07.' },
    { id: 'leftWrist', num: '05', pose: 'sideRight', x: 67, y: 26, ref: 'POSTUR BERDIRI',
      title: 'Tangan dan pergelangan kiri',
      desc: 'Tangan kiri menopang bagian depan senapan melalui telapak terbuka atau genggaman. Pergelangan tetap lurus untuk mempertahankan tumpuan yang nyaman.',
      viewNote: 'Penanda berada pada pergelangan tangan penopang, tepat di bawah bagian depan senapan.' },
    { id: 'rightHand', num: '06', pose: 'sideRight', x: 43, y: 31, ref: 'POSTUR BERDIRI',
      title: 'Tangan kanan dan jari pelatuk',
      desc: 'Tangan kanan menggenggam grip dengan mantap dan rileks. Jari telunjuk menyentuh bilah pelatuk hanya saat siap menembak, sementara genggaman tetap nyaman.',
      viewNote: 'Penanda menunjukkan tangan yang menggenggam grip. Bilah pelatuk berada di depan grip.' },
    { id: 'elbowHip', num: '07', pose: 'front', x: 56, y: 44, ref: 'POSTUR BERDIRI',
      title: 'Siku kiri dan pinggul',
      desc: 'Siku kiri bertumpu di bagian atas pinggul kiri untuk membantu merilekskan lengan penopang. Posisi panggul yang sedikit maju mendekatkan tumpuan siku ke badan.',
      viewNote: 'Penanda mengikuti area siku kiri. Batas kontak siku dengan pinggul dapat tertutup pakaian.' },
    { id: 'pelvis', num: '08', pose: 'back', x: 50, y: 51, ref: 'POSTUR BERDIRI',
      title: 'Badan, bahu, dan panggul',
      desc: 'Panggul sedikit maju, bahu mengarah ke sasaran, dan bagian atas badan condong ke belakang. Hubungan ketiganya membentuk posisi berdiri yang stabil dan nyaman.',
      viewNote: 'Penanda berada di area panggul. Perhatikan hubungannya dengan punggung dan kedua tungkai.' },
    { id: 'leftLeg', num: '09', pose: 'feet', x: 39, y: 78, ref: 'POSTUR BERDIRI',
      title: 'Kaki kiri dan tumpuan berdiri',
      desc: 'Kaki kiri menjadi tumpuan utama dengan posisi mendekati tegak. Lutut dan tungkai tetap nyaman tanpa ketegangan berlebihan saat mempertahankan posisi berdiri.',
      viewNote: 'Penanda berada pada pergelangan kaki kiri. Foto kaki memperjelas arah tungkai dan letak sepatu.' },
    { id: 'rightLeg', num: '10', pose: 'feet', x: 62, y: 78, ref: 'POSTUR BERDIRI',
      title: 'Lutut dan kaki kanan',
      desc: 'Kaki kanan ditempatkan sedikit lebih ke luar untuk melengkapi tumpuan kaki kiri. Arah lutut dan telapak disesuaikan agar posisi berdiri tetap nyaman.',
      viewNote: 'Penanda mengarah ke area pergelangan kaki kanan. Pada foto serong, bagian ini dapat tertutup tungkai kiri. Bandingkan letak kedua sepatu untuk melihat susunan tumpuan.' }
  ];

  const POSE_LABELS = {
    back: 'Foto belakang',
    front: 'Foto depan / serong',
    sideLeft: 'Detail kepala',
    sideRight: 'Detail tangan',
    feet: 'Detail kaki'
  };

  let currentPose = 'back';
  let activeBiomechId = 'spine';

  function positionBiomechPins() {
    // Pins use exact CSS percentage coordinates inside .pose-img-frame; no matrix math needed.
  }

  function renderBiomechViewport() {
    const stage = document.querySelector('.lab-biomech-stage');
    if (!stage || !window.tsPosturePoseArt) return;
    const poseData = window.tsPosturePoseArt.getPose(currentPose);
    if (!poseData) return;

    let frame = stage.querySelector('.pose-img-frame');
    if (!frame) {
      stage.innerHTML = '<div class="pose-img-frame"><img id="biomechPoseImg" alt="" /><div id="biomechPinsOverlay"></div></div>';
      frame = stage.querySelector('.pose-img-frame');
    }
    const img = frame.querySelector('#biomechPoseImg');
    if (img.getAttribute('src') !== poseData.src) {
      img.setAttribute('src', poseData.src);
      img.alt = 'Foto postur ' + window.tsPosturePoseArt.person();
      img.onerror = () => {
        const status = document.getElementById('postureArtStatus');
        if (status) status.textContent = 'Foto postur tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.';
      };
    }

    const [ax, ay] = window.tsPosturePoseArt.pointPct(activeBiomechId, currentPose);
    const ring = frame.querySelector('#biomechTargetRing');
    if (ring) {
      ring.style.left = ax + '%';
      ring.style.top = ay + '%';
    }

    const pinsContainer = frame.querySelector('#biomechPinsOverlay');
    POSTER_BIOMECH_DATA.forEach(pt => {
      let btn = pinsContainer.querySelector(`[data-biomech-id="${pt.id}"]`);
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'callout-node';
        btn.dataset.biomechId = pt.id;
        btn.setAttribute('aria-label', `Titik ${pt.num}: ${pt.title}`);
        btn.addEventListener('click', () => selectBiomechCallout(pt.id));
        pinsContainer.appendChild(btn);
      }
      const isSelected = pt.id === activeBiomechId;
      btn.hidden = pt.pose !== currentPose;
      if (!btn.hidden) {
        const [px, py] = window.tsPosturePoseArt.pointPct(pt.id, currentPose);
        btn.style.left = px + '%';
        btn.style.top = py + '%';
      }
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function renderBiomechIndexTable() {
    const list = document.getElementById('biomechIndexList');
    if (!list) return;
    list.innerHTML = POSTER_BIOMECH_DATA.map(item => {
      const active = item.id === activeBiomechId;
      return `<button type="button" class="biomech-point-btn" aria-pressed="${active}" data-select-point="${item.id}">
        <span class="pt-num">${item.num}</span>
        <span class="pt-text">
          <div class="pt-title">${item.title}</div>
          <div class="pt-pose">${POSE_LABELS[item.pose]}</div>
        </span>
      </button>`;
    }).join('');
    list.querySelectorAll('[data-select-point]').forEach(btn => {
      btn.addEventListener('click', () => selectBiomechCallout(btn.dataset.selectPoint));
    });
  }

  function selectBiomechCallout(id) {
    const item = POSTER_BIOMECH_DATA.find(d => d.id === id);
    if (!item) return;
    activeBiomechId = item.id;
    currentPose = item.pose;
    const poseTitles = {
      back: 'Postur: punggung dan bahu',
      front: 'Postur: lengan dan siku',
      sideLeft: 'Detail kepala',
      sideRight: 'Detail tangan',
      feet: 'Detail kaki'
    };
    document.getElementById('stagePoseTitle').textContent = poseTitles[currentPose];
    document.getElementById('dossierCode').textContent = `TITIK ${item.num}`;
    document.getElementById('dossierTitle').textContent = item.title;
    document.getElementById('dossierBody').textContent = item.desc;
    document.getElementById('dossierViewNote').textContent = item.viewNote;
    document.querySelectorAll('#biomechPoseTabs [data-pose-angle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.poseAngle === currentPose));
    });
    const anglePills = document.getElementById('biomechActiveAnglePills');
    if (anglePills) {
      const samePosePoints = POSTER_BIOMECH_DATA.filter(p => p.pose === currentPose);
      anglePills.innerHTML = samePosePoints.map(p =>
        `<button type="button" class="angle-pt-pill" data-angle-pt="${p.id}" aria-pressed="${p.id === activeBiomechId}"><span>${p.num}</span>${p.title}</button>`
      ).join('');
      anglePills.querySelectorAll('[data-angle-pt]').forEach(btn => {
        btn.addEventListener('click', () => selectBiomechCallout(btn.dataset.anglePt));
      });
    }
    renderBiomechViewport();
    renderBiomechIndexTable();
  }

  function openPosturePhotoDetail() {
    if (!window.tsPosturePoseArt?.isActive()) return;
    const dialog = document.getElementById('posturePhotoDialog');
    const item = POSTER_BIOMECH_DATA.find(p => p.id === activeBiomechId);
    document.getElementById('posturePhotoDetailTitle').textContent =
      window.tsPosturePoseArt.person() + ' · ' + item.title;
    document.getElementById('posturePhotoDetailView').innerHTML =
      window.tsPosturePoseArt.detailHtml(currentPose, activeBiomechId);
    if (!dialog.open) dialog.showModal();
  }

  /* =========================================================================
     02 · PELATUK (A -> B -> C + Live Oscilloscope)
     ========================================================================= */
  const TRIGGER_STAGES = {
    A: { title: 'A · Tarikan awal (Take-up)', body: 'Pergerakan awal pelatuk sebelum tahanan mulai terasa. Tahap ini mendahului pergerakan menuju titik pelepasan.', progress: 0.18, x: 75 },
    B: { title: 'B · Sebelum pelepasan (Creep)', body: 'Pergerakan pelatuk setelah tahanan mulai terasa hingga mencapai titik pelepasan. Pelepasan menandai akhir tahap ini.', progress: 0.48, x: 205 },
    C: { title: 'C · Setelah pelepasan (Over-travel)', body: 'Pergerakan pelatuk yang masih berlanjut setelah titik pelepasan. Tahap ini terjadi sesudah mekanisme penahan terlepas.', progress: 0.82, x: 345 }
  };

  let oscProgress = 0.65;
  let oscPulling = false;
  let oscReq = null;
  let oscPlaybackMode = false;

  function computePosterTriggerCurve(t) {
    if (t < 0.28) return 0.42 * Math.sin((t / 0.28) * (Math.PI / 2));
    if (t < 0.58) return 0.42 + ((t - 0.28) / 0.30) * 0.06;
    if (t < 0.64) return 0.48 + ((t - 0.58) / 0.06) * 0.30;
    return 0.78 + ((t - 0.64) / 0.36) * 0.04;
  }

  function drawOscilloscope(prog = 0) {
    const canvas = document.getElementById('triggerOscCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 42, padR = 16, padT = 22, padB = 30;
    const pw = w - padL - padR, ph = h - padT - padB;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.13)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = padT + (i / 4) * ph;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();
    }

    [0.28, 0.58, 0.64, 1.0].forEach(p => {
      const x = padL + p * pw;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();
    });
    ctx.setLineDash([]);

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph); ctx.lineTo(padL + pw, padT + ph);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 10px IBM Plex Mono';
    ctx.fillText('KURVA CONTOH', padL + 6, padT + 10);
    ctx.fillText('URUTAN MODEL →', padL + pw - 103, padT + ph + 20);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const x = padL + t * pw;
      const y = padT + ph - computePosterTriggerCurve(t) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (prog > 0) {
      const steps = Math.floor(prog * 120);
      ctx.strokeStyle = '#FF4800';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / 120;
        const x = padL + t * pw;
        const y = padT + ph - computePosterTriggerCurve(t) * ph;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const isBreaking = prog >= 0.58 && prog < 0.70;
      document.getElementById('oscScreen')?.classList.toggle('is-break', isBreaking);
      document.getElementById('oscPhaseLabel')?.classList.toggle('is-break', isBreaking);
      if (prog >= 0.60) {
        const bx = padL + 0.60 * pw;
        const by = padT + ph - computePosterTriggerCurve(0.60) * ph;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10B981';
        ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('PELEPASAN', bx - 30, by - 14);
      }
    }

    [1, 2, 3, 4].forEach(n => {
      const el = document.getElementById(`oscStage-${n}`);
      if (!el) return;
      const on =
        (n === 1 && prog > 0 && prog < 0.28) ||
        (n === 2 && prog >= 0.28 && prog < 0.58) ||
        (n === 3 && prog >= 0.58 && prog < 0.64) ||
        (n === 4 && prog >= 0.64);
      el.classList.toggle('is-on', on);
    });
  }

  function selectTriggerStage(key, syncCurve = true) {
    const stage = TRIGGER_STAGES[key];
    if (!stage) return;
    ['A', 'B', 'C'].forEach(id => {
      const selected = id === key;
      document.getElementById('btnStage-' + id)?.setAttribute('aria-pressed', String(selected));
      const zone = document.getElementById('triggerZone' + id);
      if (zone) {
        zone.setAttribute('stroke-width', selected ? '3' : '1');
        zone.setAttribute('stroke', selected ? '#FF4800' : '#65747B');
      }
    });
    document.getElementById('triggerTravelMarker')?.setAttribute('cx', stage.x);
    document.getElementById('triggerStageTitle').textContent = stage.title;
    document.getElementById('triggerStageBody').textContent = stage.body;
    if (syncCurve) {
      endLiveTriggerPull(true);
      oscProgress = stage.progress;
      drawOscilloscope(stage.progress);
      document.getElementById('oscPhaseLabel').textContent = stage.title;
    }
  }

  function beginLiveTriggerPull(playback = false) {
    oscPlaybackMode = playback;
    oscPulling = true;
    oscProgress = 0;
    if (oscReq) cancelAnimationFrame(oscReq);
    function frame() {
      if (!oscPulling) return;
      oscProgress = Math.min(1, oscProgress + 0.009);
      selectTriggerStage(oscProgress < 0.28 ? 'A' : oscProgress < 0.64 ? 'B' : 'C', false);
      const lbl = document.getElementById('oscPhaseLabel');
      if (oscProgress < 0.28) lbl.textContent = 'A · TARIKAN AWAL';
      else if (oscProgress < 0.58) lbl.textContent = 'B · MENUJU PELEPASAN';
      else if (oscProgress < 0.64) lbl.textContent = 'TITIK PELEPASAN';
      else lbl.textContent = 'C · GERAKAN LANJUTAN';
      drawOscilloscope(oscProgress);
      if (oscProgress < 1) oscReq = requestAnimationFrame(frame);
      else {
        oscPulling = false;
        oscReq = null;
        document.getElementById('tactileTriggerBtn')?.setAttribute('aria-pressed', 'false');
      }
    }
    oscReq = requestAnimationFrame(frame);
  }

  function endLiveTriggerPull(force = false) {
    if (oscPlaybackMode && force !== true) return;
    oscPulling = false;
    if (oscReq != null) cancelAnimationFrame(oscReq);
    oscReq = null;
    document.getElementById('tactileTriggerBtn')?.setAttribute('aria-pressed', 'false');
  }

  /* =========================================================================
     03 · OPTIK (Eye Relief & Lunar Shadow Vignette)
     ========================================================================= */
  function renderOcularLoop() {
    const canvas = document.getElementById('ocularLensCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
    const dist = parseFloat(document.getElementById('optEyeDist').value);
    const comb = parseFloat(document.getElementById('optCheekHeight').value);
    const lat = parseFloat(document.getElementById('optLat').value);

    ctx.fillStyle = '#090B0E';
    ctx.fillRect(0, 0, w, h);

    const exitPupilRadius = Math.max(52, 128 - Math.abs(dist - 85) * 1.6);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx - lat * 2.5, cy + comb * 2.5, exitPupilRadius, 0, Math.PI * 2);
    ctx.clip();

    const sky = ctx.createLinearGradient(0, 15, 0, cy + 35);
    sky.addColorStop(0, '#C4CDD0'); sky.addColorStop(0.58, '#E4E5DD'); sky.addColorStop(1, '#D4D5C7');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#AAB5A8';
    ctx.beginPath();
    ctx.moveTo(0, cy + 10); ctx.quadraticCurveTo(80, cy + 1, 156, cy + 17);
    ctx.quadraticCurveTo(224, cy + 7, 300, cy + 16);
    ctx.lineTo(300, 300); ctx.lineTo(0, 300); ctx.closePath(); ctx.fill();
    const ground = ctx.createLinearGradient(0, cy + 14, 0, h);
    ground.addColorStop(0, '#849286'); ground.addColorStop(0.36, '#68796A'); ground.addColorStop(1, '#46574D');
    ctx.fillStyle = ground; ctx.fillRect(0, cy + 32, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#25302B';
    ctx.beginPath();
    ctx.moveTo(-19, -13); ctx.lineTo(9, -13); ctx.lineTo(15, -20);
    ctx.bezierCurveTo(19, -29, 32, -25, 31, -17);
    ctx.bezierCurveTo(31, -12, 27, -10, 23, -13);
    ctx.lineTo(19, -7); ctx.lineTo(18, 11); ctx.lineTo(12, 11); ctx.lineTo(10, 3);
    ctx.lineTo(-11, 3); ctx.lineTo(-13, 12); ctx.lineTo(-19, 12); ctx.lineTo(-18, 2);
    ctx.lineTo(-23, -7); ctx.closePath(); ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#111315'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.strokeStyle = '#466875'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#B4603B';
    ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Subtle optical distinction: too close (< 85mm) produces a softer feathered vignette,
    // while too far (> 85mm) produces a sharper, hard-edged tunnel ring.
    const isTooClose = dist < 80;
    const isTooFar = dist > 90;
    const innerFactor = isTooClose ? 0.52 : isTooFar ? 0.91 : 0.78;
    const midStop = isTooClose ? 0.78 : isTooFar ? 0.96 : 0.86;
    const outerRadius = isTooFar ? Math.min(146, exitPupilRadius + 16) : 146;
    const grad = ctx.createRadialGradient(cx - lat * 2.2, cy + comb * 2.2, exitPupilRadius * innerFactor, cx, cy, outerRadius);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(midStop, isTooClose ? 'rgba(9,11,14,0.82)' : 'rgba(9,11,14,0.95)');
    grad.addColorStop(1, 'rgba(9,11,14,1)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 148, 0, Math.PI * 2); ctx.fill();
  }

  function updateOpticalSim() {
    const dist = parseFloat(document.getElementById('optEyeDist').value);
    const comb = parseFloat(document.getElementById('optCheekHeight').value);
    const lat = parseFloat(document.getElementById('optLat').value);

    document.getElementById('optEyeDistLabel').innerHTML = `${dist} mm <small>model</small>`;
    document.getElementById('optCheekHeightLabel').innerHTML = `${comb > 0 ? '+' : ''}${comb.toFixed(1)} mm <small>model</small>`;
    document.getElementById('optLatLabel').innerHTML = `${lat > 0 ? '+' : ''}${lat.toFixed(1)} mm <small>model</small>`;

    const err = Math.hypot(dist - 85, comb * 1.5, lat * 1.5);
    const offAxis = Math.hypot(comb, lat) >= 4.5;
    const badge = document.getElementById('opticsLockBadge');
    if (err < 7) {
      badge.textContent = 'SIMULASI LINGKARAN TERLIHAT';
      badge.className = 'optics-lock-pill is-ok';
    } else if (dist < 78) {
      badge.textContent = offAxis ? 'TERLALU DEKAT · BAYANGAN TEPI' : 'TERLALU DEKAT (VIGNETTE HALUS)';
      badge.className = 'optics-lock-pill is-warn';
    } else if (dist > 92) {
      badge.textContent = offAxis ? 'TERLALU JAUH · BAYANGAN TEPI' : 'TERLALU JAUH (CINCIN TEGAS)';
      badge.className = 'optics-lock-pill is-warn';
    } else {
      badge.textContent = 'SIMULASI BAYANGAN TEPI';
      badge.className = 'optics-lock-pill is-warn';
    }
    renderOcularLoop();
  }

  function calibratePerfectOptics() {
    document.getElementById('optEyeDist').value = 85;
    document.getElementById('optCheekHeight').value = 0;
    document.getElementById('optLat').value = 0;
    updateOpticalSim();
  }

  /* =========================================================================
     04 · SASARAN SILUET (20 Interactive Targets)
     ========================================================================= */
  const SILHOUETTE_RASTERS = {
    chicken: 'assets/silhouettes/chicken.webp',
    pig: 'assets/silhouettes/pig.webp',
    turkey: 'assets/silhouettes/turkey.webp',
    ram: 'assets/silhouettes/ram.webp'
  };
  const SILHOUETTE_FALLBACK_PATHS = Object.freeze({
    chicken: 'M13 24Q9 19 10 12L15 14L16 7L21 14Q26 12 30 15Q33 10 37 10Q44 12 43 19L39 23L36 30L31 32L30 39H25L24 31H20L19 39H14L16 27Z',
    pig: 'M9 19Q11 12 22 11H41Q47 8 52 14L56 15L57 21L53 24L50 28L46 29L45 38H39L38 30H23L21 38H15L16 28Q9 27 9 19Z',
    turkey: 'M11 24Q10 16 15 12L14 8Q21 9 25 17L28 13L33 16Q34 9 39 8Q45 8 45 13L42 21L46 25Q46 31 37 33L33 37L34 47H28L27 37L23 34Q13 34 11 24Z',
    ram: 'M10 25L17 16L34 15L40 17Q43 8 49 8Q58 8 57 16Q56 24 50 23Q47 23 46 19L43 28L40 44H34L34 33H21L20 44H14L14 30Z'
  });
  const SILHOUETTE_NAMES = { chicken: 'Ayam', pig: 'Babi', turkey: 'Kalkun', ram: 'Domba' };
  const RANGE_SPECS = {
    chicken: { label: 'AYAM (CHICKEN)', dist: 18 },
    pig: { label: 'BABI (PIG)', dist: 27 },
    turkey: { label: 'KALKUN (TURKEY)', dist: 33 },
    ram: { label: 'DOMBA (RAM)', dist: 41 }
  };

  let selectedAnimal = 'ram';
  const downedSet = new Set();

  function buildSilhouetteRack() {
    ['ram', 'turkey', 'pig', 'chicken'].forEach(animal => {
      const container = document.getElementById(`rackRow-${animal}`);
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const btn = document.createElement('button');
        btn.id = `target-${animal}-${i}`;
        btn.className = 'steel-target-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', `${SILHOUETTE_NAMES[animal]} sasaran ${i + 1}`);
        btn.setAttribute('aria-pressed', 'false');
        const img = document.createElement('img');
        img.className = 'silhouette-raster';
        img.src = SILHOUETTE_RASTERS[animal];
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        const fallback = document.createElement('span');
        fallback.className = 'silhouette-fallback';
        fallback.textContent = SILHOUETTE_NAMES[animal];
        fallback.hidden = true;
        img.addEventListener('error', () => {
          img.hidden = true;
          const ns = 'http://www.w3.org/2000/svg';
          const outline = document.createElementNS(ns, 'svg');
          outline.setAttribute('viewBox', '0 0 66 54');
          outline.setAttribute('aria-hidden', 'true');
          const shape = document.createElementNS(ns, 'path');
          shape.setAttribute('d', SILHOUETTE_FALLBACK_PATHS[animal]);
          shape.setAttribute('fill', '#D95020');
          outline.appendChild(shape);
          fallback.prepend(outline);
          fallback.hidden = false;
        }, { once: true });
        btn.append(img, fallback);
        btn.addEventListener('click', () => hitSteelTarget(animal, i));
        container.appendChild(btn);
      }
    });
  }

  function hitSteelTarget(animal, idx) {
    const key = `${animal}-${idx}`;
    const el = document.getElementById(`target-${animal}-${idx}`);
    if (!el) return;
    selectRangeAnimal(animal);
    if (downedSet.has(key)) {
      downedSet.delete(key);
      el.classList.remove('steel-knocked');
      el.setAttribute('aria-pressed', 'false');
    } else {
      downedSet.add(key);
      el.classList.add('steel-knocked');
      el.setAttribute('aria-pressed', 'true');
    }
    updateRackCounters();
  }

  function resetSilhouetteRack() {
    downedSet.clear();
    document.querySelectorAll('.steel-target-btn').forEach(b => {
      b.classList.remove('steel-knocked');
      b.setAttribute('aria-pressed', 'false');
    });
    updateRackCounters();
  }

  function selectRangeAnimal(animal) {
    selectedAnimal = animal;
    const s = RANGE_SPECS[animal];
    document.getElementById('activeRangeBadge').textContent = `${s.label} // ${s.dist} METER`;
    ['chicken', 'pig', 'turkey', 'ram'].forEach(k => {
      document.getElementById(`rangeBtn-${k}`)?.setAttribute('aria-pressed', String(k === animal));
      document.querySelector(`[data-rack-animal="${k}"]`)?.classList.toggle('is-current', k === animal);
    });
    updateRackCounters();
  }

  function updateRackCounters() {
    const total = downedSet.size;
    const group = [...downedSet].filter(k => k.startsWith(selectedAnimal + '-')).length;
    document.getElementById('rackHitScore').textContent = `${String(total).padStart(2, '0')} / 20`;
    document.getElementById('rackGroupScore').textContent = `${group} / 5`;
  }

  /* =========================================================================
     05 · PERALATAN (10 Rifle & Scope Components)
     ========================================================================= */
  const HARDWARE_SPECS = {
    stock: { code: 'KOMPONEN #01 // POPOR', title: 'Popor dan Bantalan Bahu', body: 'Titik 01 menunjukkan popor dan bantalan di bagian paling belakang senapan. Bantalan bahu berada di ujung yang bersentuhan dengan bahu.', note: 'Bandingkan dengan sandaran pipi, nomor 02, yang berada di bagian atas popor.' },
    cheekpiece: { code: 'KOMPONEN #02 // SANDARAN PIPI', title: 'Sandaran Pipi', body: 'Titik 02 menandai sandaran pipi di atas popor. Bagian ini menjadi tempat pipi bertumpu ketika mata menghadap teleskop.', note: 'Letaknya lebih tinggi daripada grip. Gambar memperlihatkan komponen, bukan posisi kepala atlet.' },
    grip: { code: 'KOMPONEN #03 // PEGANGAN', title: 'Pegangan dan Pelatuk', body: 'Titik 03 menunjukkan grip atau pegangan tangan di belakang bilah pelatuk. Pada gambar, area ini berada di bawah bagian tengah senapan.', note: 'Bilah pelatuk berada di depan grip. Untuk mempelajari tahapan pergerakan pelatuk, buka materi Pelatuk.' },
    riser: { code: 'KOMPONEN #04 // BADAN DEPAN', title: 'Penopang Depan', body: 'Titik 04 menunjukkan bagian bawah badan depan senapan, di depan grip. Bagian ini merupakan area tempat tangan penopang berada.', note: 'Bandingkan dengan tabung udara nomor 05 di bagian depan senapan. Nomor 04 bukan pengatur teleskop.' },
    cylinder: { code: 'KOMPONEN #05 // TABUNG UDARA', title: 'Tabung Udara', body: 'Titik 05 menunjukkan tabung udara di bawah laras. Tabung ini menyimpan udara bertekanan yang digunakan senapan angin.', note: 'Tabung dan laras adalah bagian berbeda. Pada gambar, laras berada lebih tinggi dan memanjang ke arah ujung depan.' },
    barrel: { code: 'KOMPONEN #06 // LARAS', title: 'Laras', body: 'Titik 06 menandai laras di bagian depan senapan. Laras merupakan jalur keluarnya pellet menuju mulut laras.', note: 'Ikuti bagian yang memanjang dari badan senapan ke ujung paling depan. Bentuk luar tidak menunjukkan isi laras.' },
    objective: { code: 'KOMPONEN #07 // OBJEKTIF', title: 'Lensa Objektif', body: 'Titik 07 menandai lensa objektif di ujung depan teleskop. Lensa ini menerima cahaya dari objek yang dilihat.', note: 'Pada ilustrasi, objektif berada di sisi kiri. Bandingkan dengan lensa okuler nomor 10 di sisi kanan, dekat mata.' },
    turrets: { code: 'KOMPONEN #08 // TURRET', title: 'Turret Elevasi dan Windage', body: 'Titik 08 menandai turret, yaitu kenop di sekitar bagian tengah teleskop. Kenop ini berkaitan dengan pengaturan posisi garis bidik.', note: 'Gambar hanya menunjukkan letak kenop. Memilih nomor ini tidak mengubah pembidikan atau setelan teleskop.' },
    zoom: { code: 'KOMPONEN #09 // CINCIN PEMBESARAN', title: 'Cincin Pembesaran', body: 'Titik 09 menandai cincin pembesaran di dekat ujung belakang teleskop. Cincin ini digunakan untuk mengubah pembesaran pada teleskop yang mendukungnya.', note: 'Nomor ini hanya menyorot komponen; ukuran gambar sasaran tidak ikut diperbesar.' },
    ocular: { code: 'KOMPONEN #10 // OKULER', title: 'Lensa Okuler', body: 'Titik 10 menandai okuler, yaitu ujung teleskop yang menghadap mata. Bagian ini menjadi tempat pengguna melihat gambar dan garis bidik.', note: 'Untuk mempelajari perubahan pandangan melalui lensa, buka materi Optik.' }
  };

  const SCOPE_KEYS = new Set(['objective', 'turrets', 'zoom', 'ocular']);
  let hwViewMode = 'all';

  function setHardwareView(mode, autoSelect = false) {
    hwViewMode = mode;
    const svg = document.getElementById('hardwareBlueprintSvg');
    if (svg) {
      if (mode === 'scope') svg.setAttribute('viewBox', '0 0 880 168');
      else if (mode === 'rifle') svg.setAttribute('viewBox', '0 170 880 315');
      else svg.setAttribute('viewBox', '0 0 880 490');
    }
    document.querySelectorAll('[data-hw-view]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.hwView === mode));
    });
    // Sync part buttons visibility on mobile when filtered to rifle or scope
    const isMobile = window.innerWidth < 900;
    document.querySelectorAll('[data-hw-part]').forEach(btn => {
      const isScope = SCOPE_KEYS.has(btn.dataset.hwPart);
      if (!isMobile || mode === 'all') btn.hidden = false;
      else btn.hidden = (mode === 'scope') !== isScope;
    });
    if (autoSelect) {
      const current = document.querySelector('[data-hw-part][aria-pressed="true"]')?.dataset.hwPart;
      if (mode === 'scope' && !SCOPE_KEYS.has(current)) inspectHardware('objective', false);
      else if (mode === 'rifle' && SCOPE_KEYS.has(current)) inspectHardware('cheekpiece', false);
    }
  }

  function inspectHardware(key, syncView = true) {
    const item = HARDWARE_SPECS[key];
    if (!item) return;
    if (syncView && window.innerWidth < 900 && hwViewMode !== 'all') {
      const targetMode = SCOPE_KEYS.has(key) ? 'scope' : 'rifle';
      if (targetMode !== hwViewMode) setHardwareView(targetMode, false);
    }
    document.querySelectorAll('#hardwareBlueprintSvg [data-hw-key]').forEach(node => {
      const sel = node.getAttribute('data-hw-key') === key;
      node.classList.toggle('is-highlighted', sel);
      if (node.classList.contains('hw-marker')) node.setAttribute('aria-pressed', String(sel));
    });
    document.querySelectorAll('[data-hw-part]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.hwPart === key));
    });
    document.getElementById('blueprintActiveLabel').textContent = 'DIPILIH: ' + item.title;
    document.getElementById('hwSpecCode').textContent = item.code;
    document.getElementById('hwSpecTitle').textContent = item.title;
    document.getElementById('hwSpecBody').textContent = item.body;
    document.getElementById('hwSpecNote').textContent = item.note;
  }

  /* Expose global hooks used by posture-art.js and inline SVG markers */
  window.renderBiomechViewport = renderBiomechViewport;
  window.positionBiomechPins = positionBiomechPins;
  window.openPosturePhotoDetail = openPosturePhotoDetail;
  window.selectTriggerStage = selectTriggerStage;
  window.runIdealCurvePlayback = () => beginLiveTriggerPull(true);
  window.updateOpticalSim = updateOpticalSim;
  window.calibratePerfectOptics = calibratePerfectOptics;
  window.resetSilhouetteRack = resetSilhouetteRack;
  window.selectRangeAnimal = selectRangeAnimal;
  window.inspectHardware = inspectHardware;

  /* =========================================================================
     INIT
     ========================================================================= */
  function bootStudio() {
    document.querySelectorAll('[data-studio-tab]').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.studioTab));
    });
    document.querySelectorAll('#biomechPoseTabs [data-pose-angle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPose = btn.dataset.poseAngle;
        const firstInPose = POSTER_BIOMECH_DATA.find(p => p.pose === targetPose);
        if (firstInPose) selectBiomechCallout(firstInPose.id);
      });
    });
    document.querySelectorAll('[data-hw-view]').forEach(btn => {
      btn.addEventListener('click', () => setHardwareView(btn.dataset.hwView, true));
    });
    document.querySelectorAll('[data-hw-part]').forEach(btn => {
      btn.addEventListener('click', () => inspectHardware(btn.dataset.hwPart));
    });

    const paddle = document.getElementById('tactileTriggerBtn');
    if (paddle) {
      paddle.addEventListener('pointerdown', ev => {
        if (!ev.isPrimary || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        oscPlaybackMode = false;
        paddle.setPointerCapture(ev.pointerId);
        paddle.setAttribute('aria-pressed', 'true');
        beginLiveTriggerPull(false);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(evt =>
        paddle.addEventListener(evt, () => endLiveTriggerPull(false))
      );
      paddle.addEventListener('keydown', ev => {
        if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat && !oscPulling) {
          ev.preventDefault();
          paddle.setAttribute('aria-pressed', 'true');
          beginLiveTriggerPull(false);
        }
      });
      paddle.addEventListener('keyup', ev => {
        if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); endLiveTriggerPull(false); }
      });
    }

    const stage = document.querySelector('.lab-biomech-stage');
    if (stage && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => requestAnimationFrame(positionBiomechPins)).observe(stage);
    }
    window.addEventListener('resize', () => requestAnimationFrame(positionBiomechPins));

    selectBiomechCallout('spine');
    selectTriggerStage('A');
    updateOpticalSim();
    buildSilhouetteRack();
    selectRangeAnimal('ram');
    inspectHardware('cheekpiece');

    const initialHash = decodeURIComponent(window.location.hash.slice(1));
    const syncTriggerDeck = () => {
      const isDesktop = window.innerWidth >= 900;
      const d1 = document.querySelector('#sec-trigger .stage-deck-disclosure');
      if (d1) d1.open = isDesktop;
      const d2 = document.querySelector('#sec-optics .optics-notes-disclosure');
      if (d2) d2.open = isDesktop;
      const d3 = document.querySelector('#sec-imssu .range-notes-disclosure');
      if (d3) d3.open = isDesktop;
      if (!isDesktop && hwViewMode === 'all') setHardwareView('rifle', false);
      else if (isDesktop && hwViewMode !== 'all') setHardwareView('all', false);
    };
    syncTriggerDeck();
    window.addEventListener('resize', syncTriggerDeck);
    switchTab(MODULE_IDS.includes(initialHash) ? initialHash : 'sec-biomech', false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootStudio, { once: true });
  else bootStudio();
})();
