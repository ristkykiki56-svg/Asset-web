import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
// Lab Studio keeps the old rule for the five lessons (no settings UI, no dark
// mode, no audio) and scopes sound to the Match game only, where it belongs.
test('Lab Studio uses static styling with no settings UI; audio lives only in the Match game',()=>{
 assert.doesNotMatch(read('lab.html'),/lab-settings|themeSwitchBtn|sfxSwitchBtn|togglePaperTheme|toggleAudioSfx|Pengaturan/);
 assert.doesNotMatch(read('lab-studio.js'),/AudioContext|sfxActive|audioCtx|playMechTick|playSteelImpactSound|togglePaperTheme|toggleAudioSfx|cad-dark|lab-settings/);
 assert.doesNotMatch(read('lab-studio.css'),/cad-dark|lab-settings/);
 assert.match(read('lab-studio.css'),/:root\s*\{/);
 assert.doesNotMatch(read('lab.html'),/cdn\.tailwindcss\.com/);
 assert.match(read('lab.html'),/href="lab-studio\.css"/);
 assert.match(read('lab-match.js'),/AudioContext/);
});
