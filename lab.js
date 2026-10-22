let sfxActive = false;
        let audioCtx = null;

        function ensureAudio() {
            if (!audioCtx) {
                const Cls = window.AudioContext || window.webkitAudioContext;
                if (Cls) audioCtx = new Cls();
            }
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            return audioCtx;
        }

        function playMechTick(freq = 900) {
            if (!sfxActive) return;
            try {
                const ctx = ensureAudio();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.04);
            } catch (e) {}
        }

        function playSteelImpactSound() {
            if (!sfxActive) return;
            try {
                const ctx = ensureAudio();
                if (!ctx) return;
                [1240, 1890, 2920].forEach((f, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = idx === 0 ? 'square' : 'sine';
                    osc.frequency.setValueAtTime(f, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(f * 0.93, ctx.currentTime + 0.42);
                    gain.gain.setValueAtTime(0.07 / (idx + 1), ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.44);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.45);
                });
            } catch (e) {}
        }

        function toggleAudioSfx() {
            sfxActive = !sfxActive;
            document.getElementById('sfxDot').style.backgroundColor = sfxActive ? '#0E7C47' : '#7E838C';
            document.getElementById('sfxLabel').textContent = sfxActive ? 'AUDIO: AKTIF' : 'AUDIO: BISU';
            document.getElementById('sfxSwitchBtn').setAttribute('aria-pressed', String(sfxActive));
            if (sfxActive) playMechTick(1050);
        }

        function togglePaperTheme() {
            const root = document.documentElement;
            const isDark = root.classList.toggle('cad-dark');
            document.getElementById('themeText').textContent = isDark ? 'MODE: DARKROOM CAD' : 'MODE: KERTAS CETAK';
            document.getElementById('themeSwitchBtn').setAttribute('aria-pressed',String(isDark));
            playMechTick(760);
            renderBiomechViewport();
            drawOscilloscope(oscProgress);
        }

        const POSTER_BIOMECH_DATA = [
            {
                id: 'spine', num: '01', pose: 'back', x: 52, y: 40,
                ref: 'POSTUR BERDIRI',
                title: 'Punggung dan kenyamanan postur',
                desc: 'Posisi badan sedikit condong ke belakang dengan panggul maju untuk membentuk tumpuan yang seimbang. Lengkungan punggung tetap dalam batas nyaman dan tidak dibuat berlebihan.',
                viewNote: 'Penanda menunjukkan area punggung. Perhatikan hubungannya dengan bahu dan panggul saat mempertahankan posisi berdiri.'
            },
            {
                id: 'head', num: '02', pose: 'sideLeft', x: 50, y: 16,
                ref: 'POSTUR BERDIRI',
                title: 'Kepala, pipi, dan arah pandang',
                desc: 'Kepala berada dalam posisi rileks dengan pipi bertumpu pada sandaran pipi. Mata menghadap langsung ke lensa okuler agar bidang pandang terlihat penuh dan jelas.',
                viewNote: 'Pembesaran berpusat pada area mata. Perhatikan jarak mata terhadap okuler dan letak pipi di atas sandaran.'
            },
            {
                id: 'rightShoulder', num: '03', pose: 'back', x: 39, y: 28,
                ref: 'POSTUR BERDIRI',
                title: 'Bahu kanan dan bantalan bahu',
                desc: 'Bahu kanan tetap rileks, sementara bantalan popor bertumpu dengan mantap pada bahu. Posisi ini menjaga hubungan senapan dengan badan selama membidik.',
                viewNote: 'Penanda mengarah ke area bahu kanan di dekat ujung popor. Sebagian permukaan kontak dapat tertutup pakaian atau senapan.'
            },
            {
                id: 'leftArm', num: '04', pose: 'front', x: 58, y: 33,
                ref: 'POSTUR BERDIRI',
                title: 'Bahu kiri dan lengan penopang',
                desc: 'Bahu kiri berada dalam keadaan rileks dengan lengan atas dekat pada badan. Lengan kiri dan tangan penopang bekerja sebagai satu tumpuan untuk menahan bagian depan senapan.',
                viewNote: 'Penanda menunjukkan area lengan atas kiri. Bandingkan dengan letak siku pada titik 07.'
            },
            {
                id: 'leftWrist', num: '05', pose: 'sideRight', x: 67, y: 26,
                ref: 'POSTUR BERDIRI',
                title: 'Tangan dan pergelangan kiri',
                desc: 'Tangan kiri menopang bagian depan senapan melalui telapak terbuka atau genggaman. Pergelangan tetap lurus untuk mempertahankan tumpuan yang nyaman.',
                viewNote: 'Penanda berada pada pergelangan tangan penopang, tepat di bawah bagian depan senapan.'
            },
            {
                id: 'rightHand', num: '06', pose: 'sideRight', x: 43, y: 31,
                ref: 'POSTUR BERDIRI',
                title: 'Tangan kanan dan jari pelatuk',
                desc: 'Tangan kanan menggenggam grip dengan mantap dan rileks. Jari telunjuk menyentuh bilah pelatuk hanya saat siap menembak, sementara genggaman tetap nyaman.',
                viewNote: 'Penanda menunjukkan tangan yang menggenggam grip. Bilah pelatuk berada di depan grip.'
            },
            {
                id: 'elbowHip', num: '07', pose: 'front', x: 56, y: 44,
                ref: 'POSTUR BERDIRI',
                title: 'Siku kiri dan pinggul',
                desc: 'Siku kiri bertumpu di bagian atas pinggul kiri untuk membantu merilekskan lengan penopang. Posisi panggul yang sedikit maju mendekatkan tumpuan siku ke badan.',
                viewNote: 'Penanda mengikuti area siku kiri. Batas kontak siku dengan pinggul dapat tertutup pakaian.'
            },
            {
                id: 'pelvis', num: '08', pose: 'back', x: 50, y: 51,
                ref: 'POSTUR BERDIRI',
                title: 'Badan, bahu, dan panggul',
                desc: 'Panggul sedikit maju, bahu mengarah ke sasaran, dan bagian atas badan condong ke belakang. Hubungan ketiganya membentuk posisi berdiri yang stabil dan nyaman.',
                viewNote: 'Penanda berada di area panggul. Perhatikan hubungannya dengan punggung dan kedua tungkai.'
            },
            {
                id: 'leftLeg', num: '09', pose: 'feet', x: 39, y: 78,
                ref: 'POSTUR BERDIRI',
                title: 'Kaki kiri dan tumpuan berdiri',
                desc: 'Kaki kiri menjadi tumpuan utama dengan posisi mendekati tegak. Lutut dan tungkai tetap nyaman tanpa ketegangan berlebihan saat mempertahankan posisi berdiri.',
                viewNote: 'Penanda berada pada pergelangan kaki kiri. Foto kaki memperjelas arah tungkai dan letak sepatu.'
            },
            {
                id: 'rightLeg', num: '10', pose: 'feet', x: 62, y: 78,
                ref: 'POSTUR BERDIRI',
                title: 'Lutut dan kaki kanan',
                desc: 'Kaki kanan ditempatkan sedikit lebih ke luar untuk melengkapi tumpuan kaki kiri. Arah lutut dan telapak disesuaikan agar posisi berdiri tetap nyaman.',
                viewNote: 'Penanda mengarah ke area pergelangan kaki kanan. Pada foto serong, bagian ini dapat tertutup tungkai kiri. Bandingkan letak kedua sepatu untuk melihat susunan tumpuan.'
            }
        ];

        let currentPose = 'back';
        let activeBiomechId = 'spine';

        // Anchor locations refer to illustrative SVG anatomy, not measured positions.
        // Keeping coordinates in SVG units prevents responsive letterbox offsets.
        function biomechAnchor(point, arch, hipLock) {
            const spriteAnchor = window.tsPosturePoseArt?.anchor(point, currentPose);
            if (spriteAnchor) return spriteAnchor;
            return [point.x * 4.6, point.y * 5.4];
        }

        // Convert SVG units to container pixels, preserving correct alignment
        // across aspect ratios and CSS viewport scaling.
        function positionBiomechPins() {
            const svg = document.getElementById('biomechDraftSvg');
            const overlay = document.getElementById('biomechPinsOverlay');
            const matrix = svg?.getScreenCTM?.();
            if (!svg || !overlay || !matrix) return;
            const bounds = overlay.getBoundingClientRect();
            const workspace = document.documentElement.classList.contains('lw-active');
            const leftIds = new Set(['spine', 'rightShoulder', 'rightHand', 'rightLeg']);
            const positions = [];
            overlay.querySelectorAll('.callout-node').forEach(button => {
                if (button.hidden) return;
                const point = svg.createSVGPoint();
                point.x = Number(button.dataset.svgX);
                point.y = Number(button.dataset.svgY);
                const pixel = point.matrixTransform(matrix);
                positions.push({button, x:pixel.x-bounds.left, y:pixel.y-bounds.top});
            });
            for (const left of [true, false]) {
                const group = positions.filter(p => leftIds.has(p.button.dataset.biomechId) === left).sort((a,b)=>a.y-b.y);
                const gap = group.length>1 ? Math.min(44,Math.max(0,bounds.height-48)/(group.length-1)) : 44;
                let previous = 24-gap;
                group.forEach((p,index) => {
                    const ceiling = bounds.height-24-(group.length-1-index)*gap;
                    p.labelY = Math.max(previous+gap,Math.min(ceiling,p.y));
                    previous=p.labelY;
                });
            }
            positions.forEach(({button,x,y,labelY}) => {
                const left = leftIds.has(button.dataset.biomechId);
                const labelX = workspace ? (left?28:bounds.width-28) : x;
                const top = workspace ? labelY : y;
                button.dataset.lwSide=left?'left':'right';
                button.style.setProperty('--lw-leader',workspace?Math.hypot(x-labelX,y-top)+'px':'0px');
                button.style.setProperty('--lw-leader-angle',Math.atan2(y-top,x-labelX)*180/Math.PI+'deg');
                button.style.left=labelX+'px';
                button.style.top=top+'px';
            });
        }

        function renderBiomechViewport() {
            const athleteLayer = document.getElementById('svgAthleteLayer');
            const arrowsLayer = document.getElementById('svgSpinalArrowsLayer');
            const leaderLayer = document.getElementById('svgActiveLeaderLine');
            const pinsContainer = document.getElementById('biomechPinsOverlay');

            const arch = 0, hipLock = 0;
            athleteLayer.innerHTML = window.tsPosturePoseArt?.figure(currentPose, activeBiomechId) || '';
            arrowsLayer.replaceChildren();

            // Leader and interactive numbers must refer to the same anchor.
            const activePt = POSTER_BIOMECH_DATA.find(p => p.id === activeBiomechId);
            if (activePt && activePt.pose === currentPose) {
                const [px, py] = biomechAnchor(activePt, arch, hipLock);
                const side = px > 270 ? -1 : 1;
                const lineEnd = side > 0 ? 450 : 10;
                const labelX = side > 0 ? 355 : 15;
                const labelCenter = labelX + 45;
                const labelY = Math.max(32, Math.min(494, py - 39));
                leaderLayer.innerHTML = `
                    <polyline points="${px},${py} ${px + side * 35},${labelY + 8} ${lineEnd},${labelY + 8}" fill="none" stroke="#C85C35" stroke-width="1.8" pointer-events="none"/>
                    <rect x="${labelX}" y="${labelY}" width="90" height="16" fill="#B95B37" pointer-events="none"/>
                    <text x="${labelCenter}" y="${labelY + 11}" text-anchor="middle" fill="#FFFFFF" font-family="IBM Plex Mono" font-size="9" font-weight="bold" pointer-events="none">TITIK #${activePt.num}</text>
                `;
            } else {
                leaderLayer.replaceChildren();
            }

            // Reuse actual buttons across redraws. Replacing the whole container
            // on every click/slider input used to destroy keyboard focus.
            POSTER_BIOMECH_DATA.forEach(pt => {
                let btn = pinsContainer.querySelector('[data-biomech-id="' + pt.id + '"]');
                if (!btn) {
                    btn = document.createElement('button');
                    btn.type = 'button';
                    btn.dataset.biomechId = pt.id;
                    btn.textContent = pt.num;
                    btn.setAttribute('aria-label', `Titik ${pt.num}: ${pt.title}`);
                    btn.addEventListener('click', () => selectBiomechCallout(pt.id));
                    pinsContainer.appendChild(btn);
                }
                const isSelected = pt.id === activeBiomechId;
                btn.className = `callout-node pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 font-mono-tech text-[11px] font-bold flex items-center justify-center border ${
                    isSelected
                        ? 'bg-[#FF4800] text-white border-white ring-2 ring-[#FF4800] z-20 scale-110'
                        : 'bg-[var(--ink-900)] text-[var(--bg-surface)] border-[var(--bg-surface)] z-10'
                }`;
                btn.hidden = pt.pose !== currentPose;
                const [x, y] = biomechAnchor(pt, arch, hipLock);
                btn.dataset.svgX = String(x);
                btn.dataset.svgY = String(y);
                btn.setAttribute('aria-pressed', String(isSelected));
            });
            positionBiomechPins();
        }

        function openPosturePhotoDetail() {
            if (!window.tsPosturePoseArt?.isActive()) return;
            const dialog = document.getElementById('posturePhotoDialog');
            const item = POSTER_BIOMECH_DATA.find(point => point.id === activeBiomechId);
            document.getElementById('posturePhotoDetailTitle').textContent =
                window.tsPosturePoseArt.person() + ' · ' + item.title;
            document.getElementById('posturePhotoDetailView').innerHTML =
                window.tsPosturePoseArt.detail(currentPose, activeBiomechId);
            if (!dialog.open) dialog.showModal();
        }

        function selectBiomechCallout(id) {
            const item = POSTER_BIOMECH_DATA.find(d => d.id === id);
            if (!item) return;
            activeBiomechId = item.id;
            currentPose = item.pose;
            playMechTick(880);

            const viewLabels = {
                back: 'Postur: punggung dan bahu',
                front: 'Postur: lengan dan siku',
                sideLeft: 'Detail kepala',
                sideRight: 'Detail tangan',
                feet: 'Detail kaki'
            };
            document.getElementById('stagePoseTitle').textContent = viewLabels[currentPose];
            const picker = document.getElementById('labCalloutPicker');
            if (picker) picker.value = item.id;

            document.getElementById('dossierCode').textContent = `TITIK ${item.num} // ${item.title.toUpperCase()}`;
            document.getElementById('dossierRef').textContent = item.ref;
            document.getElementById('dossierTitle').textContent = item.title;
            document.getElementById('dossierBody').textContent = item.desc;
            document.getElementById('dossierViewNote').textContent = item.viewNote;
            renderBiomechViewport();
            renderBiomechIndexTable();
        }

        function renderBiomechIndexTable() {
            const list = document.getElementById('biomechIndexList');
            list.innerHTML = POSTER_BIOMECH_DATA.map(item => {
                const active = item.id === activeBiomechId;
                return `
                    <button aria-pressed="${active}" onclick="selectBiomechCallout('${item.id}')" class="text-left p-2.5 border transition flex items-start gap-2.5 ${
                        active
                            ? 'border-[var(--rule-heavy)] bg-[var(--bg-paper)] ring-1 ring-[#FF4800]'
                            : 'border-[var(--rule-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)]'
                    }">
                        <span class="font-mono-tech text-xs font-bold px-1.5 py-0.5 ${
                            active ? 'bg-[#FF4800] text-white' : 'bg-[var(--ink-900)] text-[var(--bg-surface)]'
                        }">${item.num}</span>
                        <div class="min-w-0">
                            <div class="font-bold text-xs truncate">${item.title}</div>
                            <div class="font-mono-tech text-[10px] text-[var(--ink-500)] truncate">${({back:'Foto belakang',front:'Foto depan / serong',sideLeft:'Detail kepala',sideRight:'Detail tangan',feet:'Detail kaki'})[item.pose]}</div>
                        </div>
                    </button>
                `;
            }).join('');
        }

        const TRIGGER_STAGES = {
            A: {title:'A · Tarikan awal (Take-up)', body:'Pergerakan awal pelatuk sebelum tahanan mulai terasa. Tahap ini mendahului pergerakan menuju titik pelepasan.', progress:0.18, x:75},
            B: {title:'B · Sebelum pelepasan (Creep)', body:'Pergerakan pelatuk setelah tahanan mulai terasa hingga mencapai titik pelepasan. Pelepasan menandai akhir tahap ini.', progress:0.48, x:205},
            C: {title:'C · Setelah pelepasan (Over-travel)', body:'Pergerakan pelatuk yang masih berlanjut setelah titik pelepasan. Tahap ini terjadi sesudah mekanisme penahan terlepas.', progress:0.82, x:345}
        };
        let selectedTriggerStage = '';
        function selectTriggerStage(key, syncCurve = true) {
            const stage = TRIGGER_STAGES[key];
            if (!stage) return;
            for (const id of ['A','B','C']) {
                const selected = id === key;
                document.getElementById('btnStage-'+id).setAttribute('aria-pressed', String(selected));
                document.getElementById('triggerZone'+id).setAttribute('stroke-width', selected ? '3' : '1');
                document.getElementById('triggerZone'+id).setAttribute('stroke', selected ? '#0057A5' : '#65747B');
            }
            document.getElementById('triggerTravelMarker').setAttribute('cx', stage.x);
            if (selectedTriggerStage !== key) {
                document.getElementById('triggerStageTitle').textContent = stage.title;
                document.getElementById('triggerStageBody').textContent = stage.body;
                selectedTriggerStage = key;
            }
            if (syncCurve) {
                endLiveTriggerPull(true);
                oscProgress = stage.progress;
                drawOscilloscope(stage.progress);
                document.getElementById('oscPhaseLabel').textContent = stage.title;
            }
        }

        let oscProgress = 0.65;
        let oscPulling = false;
        let oscReq = null;
        let oscShotFired = false;
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

            const padL = 46, padR = 18, padT = 22, padB = 32;
            const pw = w - padL - padR, ph = h - padT - padB;

            // Technical Grid
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 4; i++) {
                const y = padT + (i / 4) * ph;
                ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();
            }

            // 4 Phase Vertical Dividers (Penarikan Awal | Stabil | Pelepasan | Gerakan Lanjutan)
            [0.28, 0.58, 0.64, 1.0].forEach(p => {
                const x = padL + p * pw;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();
            });
            ctx.setLineDash([]);

            // Axes
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(padL, padT);
            ctx.lineTo(padL, padT + ph);
            ctx.lineTo(padL + pw, padT + ph);
            ctx.stroke();

            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 10px IBM Plex Mono';
            ctx.fillText('KURVA CONTOH', padL + 6, padT + 10);
            ctx.fillText('URUTAN MODEL →', padL + pw - 103, padT + ph + 22);

            // Reference Curve
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

            // Active Trace
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

                if (prog >= 0.60) {
                    const bx = padL + 0.60 * pw;
                    const by = padT + ph - computePosterTriggerCurve(0.60) * ph;
                    ctx.fillStyle = '#10B981';
                    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText('PELEPASAN (MODEL)', bx - 48, by - 12);
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
                el.className = on
                    ? 'p-1.5 border border-[#FF4800] bg-[#FF4800]/20 text-white'
                    : 'p-1.5 border border-slate-800 text-slate-400';
            });
        }

        function beginLiveTriggerPull(playback = false) {
            oscPlaybackMode = playback;
            oscPulling = true;
            oscProgress = 0;
            oscShotFired = false;
            playMechTick(600);
            if (oscReq) cancelAnimationFrame(oscReq);

            function frame() {
                if (!oscPulling) return;
                oscProgress = Math.min(1, oscProgress + 0.0085);
                selectTriggerStage(oscProgress < 0.28 ? 'A' : oscProgress < 0.64 ? 'B' : 'C', false);

                const lbl = document.getElementById('oscPhaseLabel');
                if (oscProgress < 0.28) lbl.textContent = 'A · TARIKAN AWAL';
                else if (oscProgress < 0.58) lbl.textContent = 'B · MENUJU PELEPASAN';
                else if (oscProgress < 0.64) {
                    lbl.textContent = 'TITIK PELEPASAN';
                    if (!oscShotFired) {
                        oscShotFired = true;
                        playSteelImpactSound();
                    }
                } else {
                    lbl.textContent = 'C · GERAKAN LANJUTAN';
                }

                drawOscilloscope(oscProgress);
                if (oscProgress < 1) oscReq = requestAnimationFrame(frame);
                else { oscPulling = false; oscReq = null; document.getElementById('tactileTriggerBtn').setAttribute('aria-pressed','false'); }
            }
            oscReq = requestAnimationFrame(frame);
        }

        function endLiveTriggerPull(force = false) {
            if (oscPlaybackMode && force !== true) return;
            oscPulling = false;
            if (oscReq != null) cancelAnimationFrame(oscReq);
            oscReq = null;
            document.getElementById('tactileTriggerBtn').setAttribute('aria-pressed','false');
        }

        function runIdealCurvePlayback() {
            beginLiveTriggerPull(true);
        }

        function setupTriggerInput() {
            const btn = document.getElementById('tactileTriggerBtn');
            btn.setAttribute('aria-pressed','false');
            btn.addEventListener('pointerdown', ev => {
                if (!ev.isPrimary || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
                oscPlaybackMode = false;
                btn.setPointerCapture(ev.pointerId);
                btn.setAttribute('aria-pressed','true');
                beginLiveTriggerPull(false);
            });
            btn.addEventListener('pointerup', endLiveTriggerPull);
            btn.addEventListener('pointercancel', endLiveTriggerPull);
            btn.addEventListener('lostpointercapture', endLiveTriggerPull);
            btn.addEventListener('keydown', ev => {
                if (ev.key === ' ' || ev.key === 'Enter') {
                    ev.preventDefault();
                    if (!ev.repeat && !oscPulling) {
                        btn.setAttribute('aria-pressed','true');
                        beginLiveTriggerPull(false);
                    }
                }
            });
            btn.addEventListener('keyup', ev => {
                if (ev.key === ' ' || ev.key === 'Enter') {ev.preventDefault();endLiveTriggerPull();}
            });
            btn.addEventListener('blur', endLiveTriggerPull);
            document.addEventListener('visibilitychange', () => {if(document.hidden) endLiveTriggerPull();});
        }

        let ocularVisible = false;
        let ocularReq = null;
        let ocularLast = 0;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        function scheduleOcularFrame() {
            if (ocularReq == null && !document.hidden && ocularVisible) ocularReq = requestAnimationFrame(renderOcularLoop);
        }
        function setupOcularVisibility() {
            const target = document.getElementById('ocularLensCanvas');
            if ('IntersectionObserver' in window) {
                const obs = new IntersectionObserver(entries => {
                    ocularVisible = entries.some(e => e.isIntersecting);
                    if (ocularVisible) scheduleOcularFrame();
                    else if (ocularReq != null) {cancelAnimationFrame(ocularReq); ocularReq=null;}
                }, {threshold:0});
                obs.observe(target);
            } else {ocularVisible=true; scheduleOcularFrame();}
            document.addEventListener('visibilitychange', () => {if(!document.hidden) scheduleOcularFrame();});
            reducedMotion.addEventListener?.('change', () => {if(ocularVisible) scheduleOcularFrame();});
        }

        function updateOpticalSim() {
            const dist = parseFloat(document.getElementById('optEyeDist').value);
            const comb = parseFloat(document.getElementById('optCheekHeight').value);
            const lat = parseFloat(document.getElementById('optLat').value);

            document.getElementById('optEyeDistLabel').textContent = `${dist} mm (CONTOH MODEL)`;
            document.getElementById('optCheekHeightLabel').textContent = `${comb > 0 ? '+' : ''}${comb.toFixed(1)} mm (MODEL)`;
            document.getElementById('optLatLabel').textContent = `${lat > 0 ? '+' : ''}${lat.toFixed(1)} mm (MODEL)`;

            const err = Math.hypot(dist - 85, comb * 1.5, lat * 1.5);
            const badge = document.getElementById('opticsLockBadge');
            if (err < 7) {
                badge.textContent = 'SIMULASI LINGKARAN TERLIHAT';
                badge.className = 'px-2 py-0.5 bg-[#0E7C47] text-white font-bold';
            } else {
                badge.textContent = 'SIMULASI BAYANGAN TEPI';
                badge.className = 'px-2 py-0.5 bg-[#D11F26] text-white font-bold';
            }
            // Always paint a static optical view immediately; on mobile this module can
            // become visible after the IntersectionObserver's first notification.
            // Waiting for visibility alone previously left an empty canvas.
            renderOcularLoop(performance.now(), true);
        }

        function calibratePerfectOptics() {
            document.getElementById('optEyeDist').value = 85;
            document.getElementById('optCheekHeight').value = 0;
            document.getElementById('optLat').value = 0;
            playMechTick(1020);
            updateOpticalSim();
        }

        function renderOcularLoop(timestamp = performance.now(), force = false) {
            ocularReq = null;
            if (!force && (!ocularVisible || document.hidden)) return;
            if (!force && timestamp - ocularLast < 32) return;
            ocularLast = timestamp;
            const canvas = document.getElementById('ocularLensCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
            // No idle motion: only changes to the controls update the optical sketch.

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

            // Neutral field-study illustration, not a simulated optical measurement.
            const sky = ctx.createLinearGradient(0, 15, 0, cy + 35);
            sky.addColorStop(0, '#C4CDD0');
            sky.addColorStop(0.58, '#E4E5DD');
            sky.addColorStop(1, '#D4D5C7');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#AAB5A8';
            ctx.beginPath();
            ctx.moveTo(0, cy + 10);
            ctx.quadraticCurveTo(80, cy + 1, 156, cy + 17);
            ctx.quadraticCurveTo(224, cy + 7, 300, cy + 16);
            ctx.lineTo(300, 300);ctx.lineTo(0,300);ctx.closePath();ctx.fill();
            const ground = ctx.createLinearGradient(0, cy + 14, 0, h);
            ground.addColorStop(0, '#849286');
            ground.addColorStop(0.36, '#68796A');
            ground.addColorStop(1, '#46574D');
            ctx.fillStyle = ground;
            ctx.fillRect(0, cy + 32, w, h);
            ctx.strokeStyle = 'rgba(34,54,47,.16)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath(); ctx.moveTo(i * 46 - 24, cy + 39);
                ctx.lineTo(i * 50 - 10, h); ctx.stroke();
            }

            // A restrained conceptual silhouette; deliberately no score or aim feedback.
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = '#25302B';
            ctx.beginPath();
            ctx.moveTo(-19,-13);
            ctx.lineTo(9,-13);
            ctx.lineTo(15,-20);
            ctx.bezierCurveTo(19,-29,32,-25,31,-17);
            ctx.bezierCurveTo(31,-12,27,-10,23,-13);
            ctx.lineTo(19,-7);
            ctx.lineTo(18,11);
            ctx.lineTo(12,11);
            ctx.lineTo(10,3);
            ctx.lineTo(-11,3);
            ctx.lineTo(-13,12);
            ctx.lineTo(-19,12);
            ctx.lineTo(-18,2);
            ctx.lineTo(-23,-7);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Etched Match Reticle
            ctx.strokeStyle = '#111315';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(w, cy);
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
            ctx.stroke();

            ctx.strokeStyle = '#466875';
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#B4603B';
            ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, Math.PI * 2); ctx.fill();

            ctx.restore();

            // Lunar Shadow Vignette
            const grad = ctx.createRadialGradient(
                cx - lat * 2.2, cy + comb * 2.2, exitPupilRadius * 0.75,
                cx, cy, 144
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.85, 'rgba(9,11,14,0.88)');
            grad.addColorStop(1, 'rgba(9,11,14,1)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(cx, cy, 148, 0, Math.PI * 2); ctx.fill();

            // No continuous idle frame; await the next user input.
        }

        // Source: four orange target shapes isolated from the poster's rack.
        // These WebPs are educational illustrations, not certified target dimensions.
        const SILHOUETTE_RASTERS = Object.freeze({
            chicken: '/assets/silhouettes/chicken.webp',
            pig: '/assets/silhouettes/pig.webp',
            turkey: '/assets/silhouettes/turkey.webp',
            ram: '/assets/silhouettes/ram.webp'
        });
        const SILHOUETTE_NAMES = Object.freeze({
            chicken: 'Ayam', pig: 'Babi', turkey: 'Kalkun', ram: 'Domba'
        });
        // Raster remains primary. These simple contours appear only if a
        // poster WebP fails to load, so a target remains recognizable.
        const SILHOUETTE_FALLBACK_PATHS = Object.freeze({
            chicken: 'M13 24Q9 19 10 12L15 14L16 7L21 14Q26 12 30 15Q33 10 37 10Q44 12 43 19L39 23L36 30L31 32L30 39H25L24 31H20L19 39H14L16 27Z',
            pig: 'M9 19Q11 12 22 11H41Q47 8 52 14L56 15L57 21L53 24L50 28L46 29L45 38H39L38 30H23L21 38H15L16 28Q9 27 9 19Z',
            turkey: 'M11 24Q10 16 15 12L14 8Q21 9 25 17L28 13L33 16Q34 9 39 8Q45 8 45 13L42 21L46 25Q46 31 37 33L33 37L34 47H28L27 37L23 34Q13 34 11 24Z',
            ram: 'M10 25L17 16L34 15L40 17Q43 8 49 8Q58 8 57 16Q56 24 50 23Q47 23 46 19L43 28L40 44H34L34 33H21L20 44H14L14 30Z'
        });

        const RANGE_SPECS = {
            chicken: { label: 'AYAM (CHICKEN)', dist: 18 },
            pig:     { label: 'BABI (PIG)',     dist: 27 },
            turkey:  { label: 'KALKUN (TURKEY)',dist: 33 },
            ram:     { label: 'DOMBA (RAM)',    dist: 41 }
        };

        let selectedAnimal = 'ram';
        let downedSet = new Set();

        function buildSilhouetteRack() {
            ['ram', 'turkey', 'pig', 'chicken'].forEach(animal => {
                const container = document.getElementById(`rackRow-${animal}`);
                if (!container) return;
                container.innerHTML = '';
                for (let i = 0; i < 5; i++) {
                    const btn = document.createElement('button');
                    btn.id = `target-${animal}-${i}`;
                    btn.className = 'steel-target-btn hover:scale-110 cursor-pointer';
                    btn.type = 'button';
                    btn.setAttribute('aria-label', `${SILHOUETTE_NAMES[animal]} sasaran ${i + 1}`);
                    btn.setAttribute('aria-pressed','false');
                    const image = document.createElement('img');
                    image.className = 'silhouette-raster';
                    image.src = SILHOUETTE_RASTERS[animal];
                    image.dataset.targetAnimal = animal;
                    image.width = 232;
                    image.height = 176;
                    image.alt = '';
                    image.setAttribute('aria-hidden','true');
                    image.decoding = 'async';
                    const fallback = document.createElement('span');
                    fallback.className = 'silhouette-fallback';
                    fallback.textContent = SILHOUETTE_NAMES[animal];
                    fallback.hidden = true;
                    image.addEventListener('error', () => {
                        image.hidden = true;
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
                    }, {once:true});
                    btn.append(image, fallback);
                    btn.onclick = () => hitSteelTarget(animal, i);
                    container.appendChild(btn);
                }
            });
        }

        function hitSteelTarget(animal, idx) {
            const key = `${animal}-${idx}`;
            const el = document.getElementById(`target-${animal}-${idx}`);
            if (!el) return;
            playSteelImpactSound();
            selectRangeAnimal(animal);

            if (downedSet.has(key)) {
                downedSet.delete(key);
                el.classList.remove('steel-knocked');
                el.setAttribute('aria-pressed','false');
            } else {
                downedSet.add(key);
                el.classList.add('steel-knocked');
                el.setAttribute('aria-pressed','true');
            }
            updateRackCounters();
        }

        function resetSilhouetteRack() {
            downedSet.clear();
            playMechTick(840);
            document.querySelectorAll('.steel-target-btn').forEach(b => {b.classList.remove('steel-knocked');b.setAttribute('aria-pressed','false');});
            updateRackCounters();
        }

        function selectRangeAnimal(animal) {
            selectedAnimal = animal;
            const s = RANGE_SPECS[animal];
            document.getElementById('activeRangeBadge').textContent = `${s.label} // ${s.dist} METER`;

            ['chicken', 'pig', 'turkey', 'ram'].forEach(k => {
                const b = document.getElementById(`rangeBtn-${k}`);
                if (!b) return;
                b.className = k === animal
                    ? 'p-2.5 border-2 border-[#FF4800] bg-[#FF4800]/10 text-center transition'
                    : 'p-2.5 border border-[var(--rule-light)] bg-[var(--bg-surface)] text-center transition';
                b.setAttribute('aria-pressed', String(k === animal));
                const tier = document.querySelector('[data-rack-animal="' + k + '"]');
                if (tier) tier.classList.toggle('is-current', k === animal);
            });
            updateRackCounters();
        }

        function updateRackCounters() {
            const total = downedSet.size;
            const group = [...downedSet].filter(key => key.startsWith(selectedAnimal + '-')).length;
            document.getElementById('rackHitScore').textContent = `${String(total).padStart(2, '0')} / 20`;
            const active = document.getElementById('rackGroupScore');
            if (active) active.textContent = `${group} / 5`;
        }

        // Text is indexed to the current poster-derived rifle and the
        // separate, schematic scope illustration. No measured specifications.
        const HARDWARE_SPECS = {
            stock: {
                code: 'KOMPONEN #01 // POPOR',
                title: 'Popor dan Bantalan Bahu',
                body: 'Titik 01 menunjukkan popor dan bantalan di bagian paling belakang senapan. Bantalan bahu berada di ujung yang bersentuhan dengan bahu.',
                note: 'Bandingkan dengan sandaran pipi, nomor 02, yang berada di bagian atas popor.'
            },
            cheekpiece: {
                code: 'KOMPONEN #02 // SANDARAN PIPI',
                title: 'Sandaran Pipi',
                body: 'Titik 02 menandai sandaran pipi di atas popor. Bagian ini menjadi tempat pipi bertumpu ketika mata menghadap teleskop.',
                note: 'Letaknya lebih tinggi daripada grip. Gambar memperlihatkan komponen, bukan posisi kepala atlet.'
            },
            grip: {
                code: 'KOMPONEN #03 // PEGANGAN',
                title: 'Pegangan dan Pelatuk',
                body: 'Titik 03 menunjukkan grip atau pegangan tangan di belakang bilah pelatuk. Pada gambar, area ini berada di bawah bagian tengah senapan.',
                note: 'Bilah pelatuk berada di depan grip. Untuk mempelajari tahapan pergerakan pelatuk, buka materi Pelatuk.'
            },
            riser: {
                code: 'KOMPONEN #04 // BADAN DEPAN',
                title: 'Penopang Depan',
                body: 'Titik 04 menunjukkan bagian bawah badan depan senapan, di depan grip. Bagian ini merupakan area tempat tangan penopang berada.',
                note: 'Bandingkan dengan tabung udara nomor 05 di bagian depan senapan. Nomor 04 bukan pengatur teleskop.'
            },
            cylinder: {
                code: 'KOMPONEN #05 // TABUNG UDARA',
                title: 'Tabung Udara',
                body: 'Titik 05 menunjukkan tabung udara di bawah laras. Tabung ini menyimpan udara bertekanan yang digunakan senapan angin.',
                note: 'Tabung dan laras adalah bagian berbeda. Pada gambar, laras berada lebih tinggi dan memanjang ke arah ujung depan.'
            },
            barrel: {
                code: 'KOMPONEN #06 // LARAS',
                title: 'Laras',
                body: 'Titik 06 menandai laras di bagian depan senapan. Laras merupakan jalur keluarnya pellet menuju mulut laras.',
                note: 'Ikuti bagian yang memanjang dari badan senapan ke ujung paling depan. Bentuk luar tidak menunjukkan isi laras.'
            },
            objective: {
                code: 'KOMPONEN #07 // OBJEKTIF',
                title: 'Lensa Objektif',
                body: 'Titik 07 menandai lensa objektif di ujung depan teleskop. Lensa ini menerima cahaya dari objek yang dilihat.',
                note: 'Pada ilustrasi, objektif berada di sisi kiri. Bandingkan dengan lensa okuler nomor 10 di sisi kanan, dekat mata.'
            },
            turrets: {
                code: 'KOMPONEN #08 // TURRET',
                title: 'Turret Elevasi dan Windage',
                body: 'Titik 08 menandai turret, yaitu kenop di sekitar bagian tengah teleskop. Kenop ini berkaitan dengan pengaturan posisi garis bidik.',
                note: 'Gambar hanya menunjukkan letak kenop. Memilih nomor ini tidak mengubah pembidikan atau setelan teleskop.'
            },
            zoom: {
                code: 'KOMPONEN #09 // CINCIN PEMBESARAN',
                title: 'Cincin Pembesaran',
                body: 'Titik 09 menandai cincin pembesaran di dekat ujung belakang teleskop. Cincin ini digunakan untuk mengubah pembesaran pada teleskop yang mendukungnya.',
                note: 'Nomor ini hanya menyorot komponen; ukuran gambar sasaran tidak ikut diperbesar.'
            },
            ocular: {
                code: 'KOMPONEN #10 // OKULER',
                title: 'Lensa Okuler',
                body: 'Titik 10 menandai okuler, yaitu ujung teleskop yang menghadap mata. Bagian ini menjadi tempat pengguna melihat gambar dan garis bidik.',
                note: 'Untuk mempelajari perubahan pandangan melalui lensa, buka materi Optik.'
            }
        };

        function inspectHardware(key) {
            playMechTick(860);
            const item = HARDWARE_SPECS[key];
            if (!item) return;
            const componentSelect = document.getElementById('labHardwarePicker');
            if (componentSelect) componentSelect.value = key;
            document.querySelectorAll('#hardwareBlueprintSvg [data-hw-key]').forEach(node => {
                const selected = node.getAttribute('data-hw-key') === key;
                node.classList.toggle('is-highlighted', selected);
                if (node.classList.contains('hw-marker')) node.setAttribute('aria-pressed', String(selected));
            });
            document.querySelectorAll('#sec-hardware button[onclick^="inspectHardware("]').forEach(button => {
                const selected = button.getAttribute('onclick') === `inspectHardware('${key}')`;
                button.setAttribute('aria-pressed', String(selected));
                button.classList.toggle('is-current', selected);
            });
            document.getElementById('blueprintActiveLabel').textContent = 'DIPILIH: ' + item.title;
            document.getElementById('hwSpecCode').textContent = item.code;
            document.getElementById('hwSpecTitle').textContent = item.title;
            document.getElementById('hwSpecBody').textContent = item.body;
            document.getElementById('hwSpecNote').textContent = item.note;

            // On narrow screens the full diagram is wider than its viewport.
            // Center the selected marker so the component picker feels connected
            // to the diagram, without auto-scrolling the entire page.
            const scroller = document.querySelector('#sec-hardware .lab-hardware-scroll');
            if (scroller && window.matchMedia('(max-width: 767px)').matches) {
                requestAnimationFrame(() => {
                    const marker = [...document.querySelectorAll('#hardwareBlueprintSvg .hw-marker[data-hw-key]')]
                        .find(node => node.getAttribute('data-hw-key') === key);
                    if (!marker || scroller.scrollWidth <= scroller.clientWidth) return;
                    const markerRect = marker.getBoundingClientRect();
                    const scrollRect = scroller.getBoundingClientRect();
                    if (!markerRect.width) return;
                    const centerOffset = markerRect.left + markerRect.width / 2
                        - (scrollRect.left + scrollRect.width / 2);
                    scroller.scrollLeft += centerOffset;
                });
            }
        }

        window.addEventListener('DOMContentLoaded', function () {
            setupTriggerInput();
            selectTriggerStage('A');
            setupOcularVisibility();
            renderBiomechIndexTable();
            selectBiomechCallout('spine');
            drawOscilloscope(oscProgress);
            updateOpticalSim();
            buildSilhouetteRack();
            selectRangeAnimal('ram');
            inspectHardware('cheekpiece');
        });

/* Mobile lesson navigation. Original five experiments and their calculations remain intact. */
function setupLabMobileExperience() {
    const media = window.matchMedia('(max-width: 767px)');
    const disclosures = Array.from(document.querySelectorAll('[data-lab-mobile-collapse]'));
    const settings = document.querySelector('.lab-settings');
    const picker = document.getElementById('labMobileModuleSelect');
    if (!picker) return;
    const anatomySelect = document.getElementById('labCalloutPicker');
    if (anatomySelect) {
        anatomySelect.replaceChildren(...POSTER_BIOMECH_DATA.map(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.num} · ${item.title}`;
            return option;
        }));
        anatomySelect.value = activeBiomechId;
        anatomySelect.addEventListener('change', () => selectBiomechCallout(anatomySelect.value));
    }
    const hardwareSelect = document.getElementById('labHardwarePicker');
    hardwareSelect?.addEventListener('change', () => inspectHardware(hardwareSelect.value));
    if (hardwareSelect) hardwareSelect.value = 'cheekpiece';

    const ids = ['sec-biomech', 'sec-trigger', 'sec-optics', 'sec-imssu', 'sec-hardware'];
    const labels = ['Postur', 'Pelatuk', 'Optik', 'Siluet', 'Peralatan'];
    const sections = ids.map(id => document.getElementById(id));
    const prev = document.getElementById('labPrevModule');
    const next = document.getElementById('labNextModule');
    const progress = document.getElementById('labModuleProgress');
    let active = ids[0];

    function showModule(id, scroll) {
        if (!ids.includes(id)) return;
        active = id;
        const index = ids.indexOf(id);
        picker.value = id;
        sections.forEach((section, n) => {
            if (section) section.classList.toggle('is-active', n === index);
        });
        if (prev) prev.disabled = index === 0;
        if (next) {
            next.disabled = index === ids.length - 1;
            next.textContent = index < ids.length - 1 ? 'Berikutnya: ' + labels[index + 1] + ' →' : 'Selesai';
        }
        if (progress) progress.textContent = (index + 1) + ' dari ' + ids.length;
        if (id === 'sec-biomech') window.requestAnimationFrame(positionBiomechPins);
        if (id === 'sec-optics') {
            renderOcularLoop(performance.now(), true);

        }
        if (id === 'sec-hardware' && media.matches) {
            // Initial selection may be made while the lesson is still hidden.
            // Center it when the diagram becomes visible.
            const current = document.getElementById('labHardwarePicker')?.value || 'cheekpiece';
            requestAnimationFrame(() => inspectHardware(current));
        }
        if (scroll && media.matches) {
            window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({block:'start', behavior:'auto'}));
        }
    }
    function navigate(id) {
        if (!ids.includes(id)) return;
        showModule(id, true);
        if (window.location.hash !== '#' + id) window.location.hash = id;
    }
    const syncHash = () => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (ids.includes(hash)) {
            showModule(hash, media.matches);
        } else if (hash === 'lab-sources') {
            const sourcePanel = document.querySelector('.lab-sources-wrap');
            if (sourcePanel) sourcePanel.open = true;
            window.requestAnimationFrame(() => document.getElementById('lab-sources')?.scrollIntoView({block:'start'}));
        }
    };
    const syncBreakpoint = () => {
        document.documentElement.classList.toggle('lab-mobile-focused', media.matches);
        for (const panel of disclosures) {
            const compactReference = panel.matches('.lab-notice-wrap,.lab-sources-wrap,.lab-facts');
            panel.open = !media.matches && !compactReference;
        }
        if (settings) settings.open = !media.matches;
        showModule(active, false);
    };
    const postureStage = document.querySelector('.lab-biomech-stage');
    if (postureStage && typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => window.requestAnimationFrame(positionBiomechPins)).observe(postureStage);
    }
    window.addEventListener('resize', () => window.requestAnimationFrame(positionBiomechPins));
    picker.addEventListener('change', () => navigate(picker.value));
    prev?.addEventListener('click', () => navigate(ids[Math.max(0, ids.indexOf(active) - 1)]));
    next?.addEventListener('click', () => navigate(ids[Math.min(ids.length - 1, ids.indexOf(active) + 1)]));
    window.addEventListener('hashchange', syncHash);
    syncBreakpoint();
    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', syncBreakpoint);
    } else if (typeof media.addListener === 'function') {
        media.addListener(syncBreakpoint);
    }
    syncHash();
    setupLabDesktopActiveNav(ids);
}
function setupLabDesktopActiveNav(ids) {
    const links = [...document.querySelectorAll('[data-lab-desktop-nav] a[href^="#sec-"]')];
    if (!links.length || !('IntersectionObserver' in window)) return;
    const setActive = id => {
        links.forEach(link => {
            const active = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-current', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };
    const observer = new IntersectionObserver(entries => {
        if (window.matchMedia('(max-width: 767px)').matches) return;
        const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
    }, {rootMargin:'-125px 0px -50% 0px',threshold:[0,0.15,0.5]});
    ids.forEach(id => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
    });
    const hash = window.location.hash.slice(1);
    setActive(ids.includes(hash) ? hash : ids[0]);
}
window.addEventListener('DOMContentLoaded', setupLabMobileExperience);
