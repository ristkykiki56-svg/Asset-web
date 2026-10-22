/* Reparent the live lesson controls on phones; comment anchors preserve desktop order. */
(() => {
    'use strict';
    function layoutHardwarePins(points, width, height) {
        const ordered = points.slice().sort((a, b) => a.x - b.x);
        return ordered.map((point, index) => {
            const rail = index % 2;
            const count = Math.ceil((ordered.length - rail) / 2);
            const column = Math.floor(index / 2);
            return {key:point.key, anchorX:point.x, anchorY:point.y,
                x:(column + 1) * width / (count + 1), y:rail ? height - 24 : 24};
        });
    }
    window.addEventListener('DOMContentLoaded', () => {
        const media = window.matchMedia('(max-width: 767px)');
        const $ = selector => document.querySelector(selector);
        let mounted = false;
        let restores = [];
        let generated = [];
        let controller;
        let hardwareObserver;
        let redrawFrame = 0;
        let refreshNavigation = () => {};
        let refreshHardware = () => {};

        function redraw() {
            cancelAnimationFrame(redrawFrame);
            redrawFrame = requestAnimationFrame(() => {
                if (typeof window.positionBiomechPins === 'function') window.positionBiomechPins();
                if (typeof window.updateOpticalSim === 'function') window.updateOpticalSim();
                if (typeof window.renderOcularLoop === 'function') window.renderOcularLoop(performance.now(), true);

                refreshHardware();
            });
        }
        function el(tag, className, text) {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text) node.textContent = text;
            return node;
        }
        function listen(node, type, fn, options = {}) {
            node?.addEventListener(type, fn, { ...options, signal: controller.signal });
        }
        function move(node, destination) {
            if (!node || !destination) return node;
            const anchor = document.createComment('lw: ' + (node.id || node.tagName));
            node.before(anchor);
            restores.push(() => { anchor.replaceWith(node); });
            destination.append(node);
            return node;
        }
        function attribute(node, name, value) {
            if (!node) return;
            const old = node.getAttribute(name);
            restores.push(() => old === null ? node.removeAttribute(name) : node.setAttribute(name, old));
            if (value === null) node.removeAttribute(name);
            else node.setAttribute(name, value);
        }
        function details(panel, label) {
            const node = el('details', 'lw-options');
            node.append(el('summary', '', label));
            panel.append(node);
            listen(node, 'toggle', () => {
                if (node.open) panel.querySelectorAll(':scope > details').forEach(other => {
                    if (other !== node) other.open = false;
                });
                redraw();
            });
            return node;
        }
        function tabs(work, kind, entries, onSelect) {
            const group = el('div', 'lw-tabs');
            group.setAttribute('role', 'group');
            group.setAttribute('aria-label', 'Pilih eksperimen');
            entries.forEach(([key, label]) => {
                const button = el('button', '', label);
                button.type = 'button';
                button.setAttribute('data-lw-' + kind, key);
                button.setAttribute('aria-pressed', 'false');
                listen(button, 'click', () => onSelect(key));
                group.append(button);
            });
            work.stage.before(group);
            return key => group.querySelectorAll('button').forEach(button => {
                button.setAttribute('aria-pressed', String(button.getAttribute('data-lw-' + kind) === key));
            });
        }
        function workspace(id, title, hint, dialog) {
            const section = document.getElementById(id);
            if (!section) return null;
            const root = el('div', 'lw-workbench');
            const heading = el('div', 'lw-heading');
            const text = el('div');
            text.append(el('h2', '', title), el('p', 'lw-hint', hint));
            const info = el('button', 'lw-info-button', 'Info & sumber');
            info.type = 'button';
            listen(info, 'click', () => dialog.showModal());
            heading.append(text, info);
            const stage = el('div', 'lw-stage');
            const panel = el('div', 'lw-panel');
            const limitation = el('p', 'lw-limitation', 'Ilustrasi edukatif, bukan pengukuran atlet.');
            root.append(heading, stage, panel, limitation);
            section.append(root);
            generated.push(root);
            return { root, stage, panel };
        }
        function mount() {
            if (mounted) return;
            mounted = true;
            controller = new AbortController();
            document.documentElement.classList.add('lw-active');
            const dialog = el('dialog', 'lw-info');
            dialog.id = 'lw-info';
            dialog.setAttribute('aria-label', 'Informasi dan sumber laboratorium');
            const close = el('button', 'lw-dialog-close', 'Tutup ×');
            close.type = 'button';
            listen(close, 'click', () => dialog.close());
            dialog.append(close);
            document.body.append(dialog);
            generated.push(dialog);
            move($('#lab-sources'), dialog);

            const posture = workspace('sec-biomech', 'Postur tubuh', 'Pilih titik pada tubuh.', dialog);
            if (posture) {
                move($('.lab-biomech-stage'), posture.stage);
                posture.root.querySelector('.lw-limitation').textContent = 'Foto untuk pembelajaran postur berdiri.';
                move($('#dossierTitle'), posture.panel);
                move($('#labCalloutPicker'), posture.panel);
                move($('#posturePhotoZoom'), posture.panel);
                move($('#postureArtControls'), posture.panel);
                const pointInfo = details(posture.panel, 'Penjelasan titik');
                move($('#dossierBody'), pointInfo);
                move($('#dossierViewNote'), pointInfo);
            }

            const trigger = workspace('sec-trigger', 'Pelatuk', 'Pilih tahap A, B, atau C, lalu amati kurva.', dialog);
            if (trigger) {
                const curve = el('div', 'lw-view lw-trigger-curve');
                const direction = el('div', 'lw-view lw-trigger-direction');
                const curvePanel = el('div', 'lw-view lw-trigger-actions');
                const directionPanel = el('div', 'lw-view lw-direction-controls');
                trigger.stage.append(curve, direction);
                trigger.panel.append(curvePanel, directionPanel);
                move($('#oscPhaseLabel'), curve);
                move($('#triggerOscCanvas'), curve);
                move($('#triggerVectorDiagram'), direction);

                direction.querySelectorAll('[tabindex]').forEach(node => attribute(node, 'tabindex', '-1'));
                move($('#tactileTriggerBtn'), curvePanel);
                move($('button[onclick="runIdealCurvePlayback()"]'), curvePanel);
                move($('#triggerStageButtons'), directionPanel);
                move($('#triggerStageExplanation'), directionPanel);
                const curveInfo = details(trigger.panel, 'Cara membaca kurva');
                move($('#triggerCurveHelp'), curveInfo);
                let mark;
                const select = key => {
                    curve.hidden = curvePanel.hidden = curveInfo.hidden = key !== 'curve';
                    direction.hidden = directionPanel.hidden = key !== 'direction';
                    mark(key);
                    redraw();
                };
                mark = tabs(trigger, 'trigger', [['direction', 'Tahapan'], ['curve', 'Kurva']], select);
                select('direction');
            }

            const optics = workspace('sec-optics', 'Optik', 'Pilih kontrol, lalu amati gambarnya.', dialog);
            if (optics) {
                optics.root.querySelector('.lw-limitation').textContent = 'Angka contoh ilustrasi, bukan rekomendasi setelan.';
                const lens = el('div', 'lw-view lw-optics-lens');
                lens.append(el('p', 'lw-optics-caption', 'Pandangan melalui lensa'));
                optics.stage.append(lens);
                move($('#ocularLensCanvas'), lens);
                const label = el('label', 'lw-parameter-label', 'Kontrol');
                const parameter = el('select', 'lw-parameter-choice');
                parameter.setAttribute('aria-label', 'Pilih kontrol optik');
                label.append(parameter);
                optics.panel.append(label);
                const definitions = [
                    ['optEyeDist', 'Jarak mata'], ['optCheekHeight', 'Tinggi mata'],
                    ['optLat', 'Posisi ke samping']
                ];
                const wrappers = definitions.map(([id]) => {
                    const wrapper = document.getElementById(id)?.parentElement;
                    if (wrapper) {
                        attribute(wrapper, 'class', wrapper.className + ' lw-parameter-control');
                        attribute(wrapper, 'hidden', null);
                        move(wrapper, optics.panel);
                    }
                    return wrapper;
                });
                const showParameter = () => {
                    wrappers.forEach((node, i) => { if (node) node.hidden = definitions[i][0] !== parameter.value; });
                    redraw();
                };
                listen(parameter, 'change', showParameter);
                parameter.replaceChildren(...definitions.map(([id, title]) => {
                    const option = el('option', '', title); option.value = id; return option;
                }));
                showParameter();
                move($('#sec-optics button[onclick="calibratePerfectOptics()"]'), optics.panel);
                move($('#opticsExplanation'), details(optics.panel, 'Cara membaca gambar'));
            }

            const silhouette = workspace('sec-imssu', 'Sasaran siluet', 'Pilih kelompok, lalu ketuk sasaran.', dialog);
            if (silhouette) {
                const rangeTabs = $('#rangeBtn-chicken')?.parentElement;
                if (rangeTabs) {
                    attribute(rangeTabs, 'class', rangeTabs.className + ' lw-tabs');
                    move(rangeTabs, silhouette.stage);
                }
                move($('[data-rack-animal]')?.parentElement, silhouette.stage);
                const readout = el('div', 'lw-readout');
                silhouette.panel.append(readout);
                move($('#rackGroupScore')?.parentElement, readout);
                move($('button[onclick="resetSilhouetteRack()"]'), silhouette.panel);
                move($('#silhouetteHelp'), silhouette.panel);

            }

            const hardware = workspace('sec-hardware', 'Peralatan', 'Pilih komponen pada gambar.', dialog);
            if (hardware) {
                const svg = $('#hardwareBlueprintSvg');
                const view = el('div', 'lw-hardware-view');
                hardware.stage.append(view);
                move(svg, view);
                attribute(svg, 'viewBox', svg?.getAttribute('viewBox'));
                const picker = $('#labHardwarePicker');
                move(picker, hardware.panel);
                move($('#hwSpecTitle'), hardware.panel);
                move($('#hwSpecBody'), hardware.panel);
                move($('#hwSpecNote'), hardware.panel);
                const options = Array.from(picker?.options || []);
                const initialKey = picker?.value || 'stock';
                const ns = 'http://www.w3.org/2000/svg';
                const leaders = document.createElementNS(ns, 'svg');
                leaders.classList.add('lw-hardware-leaders');
                leaders.setAttribute('aria-hidden', 'true');
                view.append(leaders);
                const markerButtons = Array.from(svg.querySelectorAll('.hw-marker')).map(marker => {
                    const button = el('button', 'lw-hardware-pin', marker.querySelector('.hw-marker-number').textContent.trim());
                    button.type = 'button';
                    const key = marker.getAttribute('data-hw-key');
                    button.dataset.hwKey = key;
                    button.setAttribute('aria-label', marker.getAttribute('aria-label'));
                    attribute(marker, 'aria-hidden', 'true');
                    attribute(marker, 'tabindex', '-1');
                    listen(button, 'click', () => window.inspectHardware(key));
                    view.append(button);
                    const line = document.createElementNS(ns, 'line');
                    const dot = document.createElementNS(ns, 'circle');
                    dot.setAttribute('r', '3');
                    leaders.append(line, dot);
                    return { marker, button, key, line, dot };
                });
                const stash = document.createDocumentFragment();
                options.forEach(option => move(option, stash));
                const scopeKeys = new Set(options.slice(6).map(option => option.value));
                let mode = '';
                let selected = '';
                let mark;
                refreshHardware = () => {
                    const bounds = view.getBoundingClientRect();
                    if (!bounds.width || !bounds.height) return;
                    leaders.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
                    const points = [];
                    markerButtons.forEach(({marker, button, key, line, dot}) => {
                        const hidden = scopeKeys.has(key) !== (mode === 'scope');
                        button.hidden = hidden;
                        line.style.display = dot.style.display = hidden ? 'none' : '';
                        button.setAttribute('aria-pressed', marker.getAttribute('aria-pressed'));
                        if (hidden) return;
                        const point = marker.querySelector('.hw-marker-halo').getBoundingClientRect();
                        points.push({key, x:point.left + point.width / 2 - bounds.left,
                            y:point.top + point.height / 2 - bounds.top});
                    });
                    for (const pin of layoutHardwarePins(points, bounds.width, bounds.height)) {
                        const {button, marker, line, dot} = markerButtons.find(item => item.key === pin.key);
                        button.style.left = pin.x + 'px';button.style.top = pin.y + 'px';
                        line.setAttribute('x1', pin.x);line.setAttribute('y1', pin.y);
                        line.setAttribute('x2', pin.anchorX);line.setAttribute('y2', pin.anchorY);
                        dot.setAttribute('cx', pin.anchorX);dot.setAttribute('cy', pin.anchorY);
                        const color = marker.getAttribute('aria-pressed') === 'true' ? '#0057A5' : '#67747B';
                        line.setAttribute('stroke', color);dot.setAttribute('fill', color);
                    }
                };
                function selectGroup(nextMode, key, inspect) {
                    if (!picker || !svg) return;
                    if (nextMode !== mode) {
                        options.forEach(option => stash.append(option));
                        options.filter(option => scopeKeys.has(option.value) === (nextMode === 'scope')).forEach(option => picker.append(option));
                        mode = nextMode;
                        hardware.stage.classList.toggle('lw-scope', mode === 'scope');
                        hardware.stage.classList.toggle('lw-rifle', mode === 'rifle');
                        svg.setAttribute('viewBox', mode === 'scope' ? '0 0 880 180' : '0 180 880 300');
                    }
                    selected = key;
                    picker.value = key;
                    mark(mode);
                    if (inspect && typeof window.inspectHardware === 'function') window.inspectHardware(key);
                    redraw();
                }
                mark = tabs(hardware, 'hardware', [['rifle', 'Senapan'], ['scope', 'Teleskop']], nextMode => {
                    selectGroup(nextMode, nextMode === 'scope' ? 'objective' : 'stock', true);
                });
                listen(picker, 'change', () => selectGroup(scopeKeys.has(picker.value) ? 'scope' : 'rifle', picker.value, false));
                hardwareObserver = new MutationObserver(() => {
                    const active = svg?.querySelector('.hw-marker[aria-pressed="true"]')?.getAttribute('data-hw-key');
                    if (active && active !== selected) selectGroup(scopeKeys.has(active) ? 'scope' : 'rifle', active, false);
                    refreshHardware();
                });
                hardwareObserver.observe(svg, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
                selectGroup(scopeKeys.has(initialKey) ? 'scope' : 'rifle', initialKey, false);
            }

            const modulePicker = $('#labMobileModuleSelect');
            const next = $('#labNextModule');
            const updateNavigation = () => {
                if (modulePicker?.value === 'sec-hardware' && next) {
                    next.disabled = false;
                    next.textContent = 'Kembali ke Postur →';
                }
                redraw();
            };
            refreshNavigation = updateNavigation;
            listen(modulePicker, 'change', updateNavigation);
            listen(window, 'hashchange', () => requestAnimationFrame(updateNavigation));
            listen(next, 'click', event => {
                if (modulePicker?.value !== 'sec-hardware') return;
                event.preventDefault();
                event.stopImmediatePropagation();
                modulePicker.value = 'sec-biomech';
                modulePicker.dispatchEvent(new Event('change', { bubbles: true }));
            }, { capture: true });
            updateNavigation();
            redraw();
        }
        function unmount() {
            if (!mounted) return;
            mounted = false;
            hardwareObserver?.disconnect();
            controller.abort();
            refreshNavigation = () => {};
            refreshHardware = () => {};
            const dialog = $('#lw-info');
            if (dialog?.open) dialog.close();
            const hardwareKey = $('#labHardwarePicker')?.value;
            restores.reverse().forEach(restore => restore());
            if (hardwareKey) $('#labHardwarePicker').value = hardwareKey;
            restores = [];
            generated.forEach(node => node.remove());
            generated = [];
            document.documentElement.classList.remove('lw-active');
            redraw();
        }
        const sync = () => requestAnimationFrame(() => {
            if (media.matches) {
                mount();
                refreshNavigation();
            } else unmount();
        });
        media.addEventListener('change', sync);
        window.addEventListener('resize', () => {
            sync();
            if (mounted) redraw();
        });
        sync();
    });
})();
