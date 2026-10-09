import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { overviewProjection, meaningful } from '../scripts/semantic-model.mjs';
const a=JSON.parse(await readFile(new URL('../data/atlas.json',import.meta.url)));
const id=key=>a.sourceNodeMap[key];
test('all uploads and all existing sources retain exact git bytes and structured coverage',async()=>{
 assert.equal(a.documents.length,37);
 for(const prefix of ['c_language','cpp_programming_language','cuda','ruby_on_rails']) assert.ok(a.documents.some(d=>d.graphId===prefix));
 for(const d of a.documents) assert.deepEqual(await readFile(new URL('../data/'+d.file,import.meta.url)),execFileSync('git',['show','3dec97f:data/'+d.file],{maxBuffer:10000000}));
 for(const c of a.audit.coverage) {assert.equal(c.inputNodes,c.importedNodeVariants);assert.equal(c.duplicateNodeIds.length,0);for(const s of c.sections)assert.equal(s.input,s.imported);}
 assert.equal(new Set(a.nodes.map(n=>n.id)).size,a.nodes.length);
});
test('language compiler GPU and framework distinctions and directions stay typed',()=>{
 assert.notEqual(id('c_language:language_c'),id('cpp_programming_language:cpp'));
 assert.equal(id('cpp_programming_language:c'),id('cuda:c'));
 assert.equal(id('ruby_on_rails:ruby'),id('c_language:ruby'));
 assert.notEqual(id('ruby_on_rails:ruby'),id('ruby_on_rails:rails'));
 assert.equal(new Set(['cuda','cuda_c','toolkit','runtime_api','gpu'].map(x=>id('cuda:'+x))).size,5);
 for(const [g,s,t,p,k] of [['ruby_on_rails','rails','ruby','written_in','implementation-language'],['cpp_programming_language','cpp','c','extends','other'],['cuda','cuda_c','nvcc','compiled_by','compilation'],['cuda','nvrtc','cuda_c','runtime_compiles','compilation']]) {
 const e=a.edges.find(e=>e.document.startsWith(g+'_')&&e.record.source===s&&e.record.target===t&&e.relation===p);assert.ok(e);assert.equal(e.source,id(g+':'+s));assert.equal(e.target,id(g+':'+t));assert.equal(e.kind,k);assert.match(e.assertionStatus,/not independently/);
 }
 const bridge=a.edges.find(e=>e.id==='editorial:kamal-docker-deployment');assert.equal(bridge.kind,'uses');assert.match(bridge.scope,/Optional/);assert.equal(bridge.record.evidenceChecked,'2026-10-07');
 assert.ok(!a.edges.some(e=>e.source===id('ruby_on_rails:rails')&&e.target==='docker'&&e.kind==='dependency'));
});
test('large meaningful overview is an evidence-only projection; full archive remains available',()=>{
 assert.deepEqual(a.overview,overviewProjection(a.nodes,a.edges));assert.ok(a.overview.nodeIds.length>300);
 const shown=new Set(a.overview.nodeIds);
 for(const n of shown) assert.ok(new Set(a.edges.filter(e=>e.source!==e.target && shown.has(e.source)&&shown.has(e.target)&&(e.source===n||e.target===n)).map(e=>e.source===n?e.target:e.source)).size>=2);
 const fixture=overviewProjection(['a','b','c','tail','leaf'].map(id=>({id,type:'concept'})),[['a','b'],['b','c'],['c','a'],['a','tail'],['tail','leaf']].map(([source,target],i)=>({id:String(i),source,target})));
 assert.deepEqual(fixture.nodeIds,['a','b','c']);
 assert.ok(a.overview.nodeIds.every(id=>meaningful(a.nodes.find(n=>n.id===id))));
 assert.ok(a.overview.edgeIds.every(id=>a.edges.some(e=>e.id===id)));
});
test('lightweight payload omits full records but retains stable layout identity',async()=>{
 const o=JSON.parse(await readFile(new URL('../data/overview.json',import.meta.url)));assert.ok(o.lightweight);assert.equal(o.nodes.length,a.nodes.length);assert.deepEqual(o.nodes.map(n=>n.layout),a.nodes.map(n=>n.layout));assert.ok(o.nodes.every(n=>n.variants.length===0));assert.ok(JSON.stringify(o).length<JSON.stringify(a).length/2);
});
