import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { detailArtifacts, MAX_SHARD_BYTES } from '../scripts/build-details.mjs';
import { relationKind } from '../scripts/semantic-model.mjs';
const root = new URL('../', import.meta.url);
const atlas = JSON.parse(await readFile(new URL('data/atlas.json',root)));
const overview = JSON.parse(await readFile(new URL('data/overview.json',root)));
const html = await readFile(new URL('index.html',root),'utf8');
const scripts = await Promise.all(['map-key','network','details','app'].map(n=>readFile(new URL('src/'+n+'.js',root),'utf8')));
const artifacts = detailArtifacts(atlas);
const pause = () => new Promise(r=>setTimeout(r,10));
async function until(fn) {for(let i=0;i<100;i++){if(fn())return;await pause();}assert.ok(fn(),'UI did not reach expected state');}
async function mount({url='https://example.test/', response, delay}={}) {
 const dom=new JSDOM(html,{url,runScripts:'outside-only'}),w=dom.window,calls=[];
 Object.defineProperty(w,'crypto',{value:webcrypto});w.TextEncoder=TextEncoder;w.AbortController=AbortController;
 w.fetch=async (url,options)=>{calls.push(url);if(delay)await delay(url);if(response){const r=response(url);if(r)return r;}if(url.includes('overview'))return {ok:true,json:async()=>structuredClone(overview)};if(url.includes('atlas.json'))return {ok:true,text:async()=>'',json:async()=>JSON.parse('')};const text=artifacts.files.get(url.replace('./data/',''));return {ok:!!text,status:text?200:404,text:async()=>text||''};};
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width:390,height:560,left:0,top:0});
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(_,key)=>key==='measureText'?value=>({width:value.length*7}):()=>{}});
 w.requestAnimationFrame=fn=>{fn();return 1;};for(const script of scripts)w.eval(script);await until(()=>w.document.querySelector('#metric-concepts').textContent!=='—');
 return {dom,w,d:w.document,calls};
}

test('deterministic content-addressed shards cover each exact record, edge, source and path within bounds',()=>{
 const again=detailArtifacts(atlas);assert.deepEqual(artifacts.reference,again.reference);assert.deepEqual([...artifacts.files],[...again.files]);
 assert.ok(artifacts.reference.bytes<1024*1024);
 const m=artifacts.manifest;
 for(const kind of ['nodes','edges','documents','paths']){
  const keys=kind==='paths'?m.paths:[...new Set(Object.values(m[kind]))];
  const records=keys.flatMap(key=>{const ref=m.shards[key],text=artifacts.files.get(ref.file);assert.ok(ref.bytes<=MAX_SHARD_BYTES);assert.equal(Buffer.byteLength(text),ref.bytes);assert.equal(createHash('sha256').update(text).digest('hex'),ref.sha256);return JSON.parse(text).records;});
  const key=item=>kind==='documents'?item.file:item.id;
  assert.deepEqual(records.sort((a,b)=>key(a).localeCompare(key(b))),[...atlas[kind]].sort((a,b)=>key(a).localeCompare(key(b))));
 }
 const ids=new Set(atlas.nodes.map(n=>n.id));for(const e of atlas.edges){assert.ok(ids.has(e.source));assert.ok(ids.has(e.target));assert.ok(m.edges[e.id]);}
 assert.equal(overview.details.sha256,artifacts.reference.sha256);
});

test('empty 200 archive is never fetched: search click shows immediate complete link index then verified evidence without camera movement',async()=>{
 let release;const gate=new Promise(r=>release=r);const {w,d,calls}=await mount({delay:url=>url.includes('details/')?gate:undefined});
 const before=d.querySelector('canvas').dataset.nodePositions;
 const input=d.querySelector('#search');input.value='Next.js';input.dispatchEvent(new w.Event('input'));
 d.querySelector('#search-results [data-concept="Next.js.json:nextjs"]').click();
 assert.equal(d.querySelector('canvas').dataset.selectedConcept,'Next.js.json:nextjs');assert.match(d.querySelector('#map-preview').textContent,/Loading full evidence/);assert.match(d.querySelector('#inspector').textContent,/record is incomplete/);
 assert.equal(d.querySelectorAll('[data-connection-id]').length,atlas.edges.filter(e=>e.source==='Next.js.json:nextjs'||e.target==='Next.js.json:nextjs').length);
 release();await until(()=>d.querySelector('.detail-status.ready'));
 assert.match(d.querySelector('#inspector').textContent,/Original source records/);assert.ok(d.querySelector('[data-relation-id="editorial:next-web-framework"] a'));
 const after=JSON.parse(d.querySelector('canvas').dataset.nodePositions);for(const [id,point] of Object.entries(JSON.parse(before)))assert.deepEqual(after[id],point,id);assert.ok(!calls.some(url=>url.includes('atlas.json')));
 w.close();
});

for(const failure of ['empty','malformed','missing','stale'])test(failure+' detail response retains selection and retries successfully',async()=>{
 let broken=true;const {w,d}=await mount({response:url=>broken&&url.includes('details/')?{ok:failure!=='missing',status:404,text:async()=>failure==='empty'?'':failure==='malformed'?'{':'{}'}:null});
 w.selectConcept('python');await until(()=>d.querySelector('[data-retry-details]'));
 assert.equal(d.querySelector('canvas').dataset.selectedConcept,'python');assert.match(d.querySelector('#map-preview').textContent,/overview retained/);assert.ok(d.querySelectorAll('[data-connection-id]').length>0);
 broken=false;d.querySelector('[data-retry-details]').click();await until(()=>d.querySelector('.detail-status.ready'));assert.match(d.querySelector('#inspector').textContent,/Original source records/);w.close();
});

test('rapid selection, clear, and late responses cannot replace the current selection',async()=>{
 let release;const gate=new Promise(r=>release=r);const {w,d}=await mount({delay:url=>url.includes('details/')?gate:undefined});
 w.selectConcept('c');w.selectConcept('python');w.clearSelection();w.selectConcept('Next.js.json:nextjs');release();await until(()=>d.querySelector('.detail-status.ready'));
 assert.equal(d.querySelector('canvas').dataset.selectedConcept,'Next.js.json:nextjs');assert.equal(d.querySelector('#map-preview h3').textContent,'Next.js');w.close();
});

test('deep link and scoped aliases expose cross-source incoming/outgoing edges, implementation facets, neighbor navigation, back and reset',async()=>{
 const {w,d}=await mount({url:'https://example.test/?concept=python_language:cpython'});await until(()=>d.querySelector('.detail-status.ready'));
 assert.ok(d.querySelector('[data-relation-id="editorial:cpython-implementation-c"] a[href^="https://docs.python.org/"]'));
 const kind=d.querySelector('#connection-kind');kind.value='implementation-language';kind.dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('[data-connection-id="editorial:cpython-implementation-c"]'));
 d.querySelector('[data-connection-id="editorial:cpython-implementation-c"] [data-neighbor]').click();await until(()=>d.querySelector('.detail-status.ready'));
 assert.equal(d.querySelector('canvas').dataset.selectedConcept,'c');const incoming=d.querySelector('#connection-direction');incoming.value='incoming';incoming.dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('[data-connection-id="editorial:cpython-implementation-c"]'));
 d.querySelector('#connection-reset').click();assert.equal(d.querySelector('#connection-direction').value,'all');
 d.querySelector('#selection-back').click();assert.equal(d.querySelector('canvas').dataset.selectedConcept,'python_language:cpython');
 d.querySelector('#reset-map').click();assert.equal(d.querySelector('#source-select').value,'all');assert.equal(d.querySelector('canvas').dataset.selectedConcept,'');
 const input=d.querySelector('#search');input.value='V8';input.dispatchEvent(new w.Event('input'));input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'}));await until(()=>d.querySelector('.detail-status.ready'));assert.equal(d.querySelector('canvas').dataset.selectedConcept,'JavaScript.json:v8');
 assert.ok(d.querySelector('[data-relation-id="editorial:v8-written-cpp"]'));assert.ok(d.querySelector('[data-relation-id="editorial:v8-ecmascript"]'));w.close();
});

test('paths load without full archive and detail requests are deduplicated and concurrency bounded',async()=>{
 let active=0,max=0;const {w,d,calls}=await mount({delay:async url=>{if(!url.includes('details/'))return;active++;max=Math.max(max,active);await pause();active--;}});
 w.selectConcept('python');w.selectConcept('python');d.querySelector('#routes-more').click();await until(()=>d.querySelectorAll('#route-list .route-card').length===atlas.paths.length);await until(()=>d.querySelector('.detail-status.ready'));
 assert.ok(max<=3);assert.equal(new Set(calls).size,calls.length);assert.ok(!calls.some(x=>x.includes('atlas.json')));w.close();
});

test('semantic facets do not conflate implementations, languages, runtimes, specs and compilation',()=>{
 for(const [predicate,kind] of Object.entries({written_in:'implementation-language',implemented_in:'implementation-language',uses_language:'language-use',runs_on:'runtime',implements_spec:'specification',compiles_to:'compilation',library_of:'library',depends_on:'dependency',related_to:'other',reference_implementation_of:'implementation-of',implements_incremental_work_for:'other'}))assert.equal(relationKind(predicate),kind,predicate);
 const edges=atlas.edges.filter(e=>e.curated);assert.ok(!edges.some(e=>e.source==='python'&&e.relation==='written_in'));assert.ok(!edges.some(e=>e.source==='javascript'&&e.relation==='written_in'));
});


test('exact edge deep link remains synchronized through delayed evidence and dataset changes', async () => {
 let release;const gate=new Promise(resolve=>release=resolve);
 const id='editorial:next-css';
 const {w,d}=await mount({url:'https://example.test/?concept=Next.js.json:nextjs&edge='+id,delay:url=>url.includes('details/')?gate:undefined});
 assert.equal(d.querySelector('canvas').dataset.activeEdge,id);
 const filter=d.querySelector('#source-select');filter.value='docker';filter.dispatchEvent(new w.Event('change'));
 assert.equal(d.querySelector('canvas').dataset.activeEdge,id);
 assert.equal(d.querySelector('canvas').dataset.edgeEmphasized,'true');
 const input=d.querySelector('#connection-search');input.value='CSS';input.dispatchEvent(new w.Event('input'));input.focus();input.setSelectionRange(1,2);
 d.querySelector('#connection-results').scrollTop=110;
 release();await until(()=>d.querySelector('.detail-status.ready'));
 assert.equal(d.querySelector('canvas').dataset.activeEdge,id);
 assert.equal(new URL(w.location.href).searchParams.get('edge'),id);
 assert.equal(d.activeElement.id,'connection-search');
 assert.equal(d.activeElement.value,'CSS');assert.equal(d.activeElement.selectionStart,1);
 assert.equal(d.querySelector('#connection-results').scrollTop,110);
 assert.match(d.querySelector('.dynamic-proof').textContent,/supports_styling_with/);
 assert.ok(d.querySelector('.dynamic-proof a[href="https://nextjs.org/docs/app/getting-started/css"]'));
 w.close();
});
