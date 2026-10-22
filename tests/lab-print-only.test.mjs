import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Lab uses print-paper styling with no settings, dark mode or audio implementation',()=>{
 assert.doesNotMatch(read('lab.html'),/lab-settings|themeSwitchBtn|sfxSwitchBtn|togglePaperTheme|toggleAudioSfx|Pengaturan/);
 assert.doesNotMatch(read('lab.js'),/AudioContext|sfxActive|audioCtx|playMechTick|playSteelImpactSound|togglePaperTheme|toggleAudioSfx|cad-dark|lab-settings/);
 assert.doesNotMatch(read('lab.css')+read('lab-workspace.css'),/cad-dark|lab-settings/);
 assert.match(read('lab.css'),/--bg-paper: #F3F1EA/);
});
