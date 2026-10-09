import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {isSourceFile,normalizePath,relationshipPredicate,relationshipEntries,documentTitle} from '../scripts/normalize-source.mjs';
import {claimEntries} from '../scripts/extract-concepts.mjs';
import {createIdentityResolver} from '../scripts/concept-identity.mjs';
const a=JSON.parse(await readFile(new URL('../data/atlas.json',import.meta.url)));
const legacy=JSON.parse(await readFile(new URL('../scripts/legacy-identities.json',import.meta.url)));
const id=key=>a.sourceNodeMap[key];
test('dynamic source discovery excludes generated artifacts and accounts for every upload',async()=>{
 const files=(await readdir(new URL('../data/',import.meta.url))).filter(isSourceFile).sort();
 assert.deepEqual(a.documents.map(d=>d.file),files);assert.equal(files.length,37);
 for(const file of ['atlas.json','overview.json','placeholder'])assert.equal(isSourceFile(file),false);
 for(const c of a.audit.coverage){assert.equal(c.inputNodes,c.importedNodeVariants,c.file);for(const section of c.sections)assert.equal(section.input,section.imported,c.file);assert.equal(c.duplicateNodeIds.length,0);}
 assert.equal(new Set(a.edges.map(e=>e.id)).size,a.edges.length);
 assert.equal(new Set(a.paths.map(p=>p.id)).size,a.paths.length);
});
test('schema adapters preserve steps, reference paths, predicates and claim nodes',()=>{
 const data={nodes:[{id:'a'},{id:'path',type:'learning_path',sequence:['a']},{id:'claim',type:'claim',statement:'reported'}],source_claims:['claim']};
 assert.deepEqual(normalizePath('path',data,x=>x).steps,['a']);
 assert.deepEqual(normalizePath({steps:['a']},data,x=>x).steps,['a']);
 assert.equal(relationshipPredicate({type:'delivers_as_service'}),'delivers_as_service');
 assert.throws(()=>relationshipEntries({relationships:{}}),/Expected relationship array/);
 assert.equal(documentTitle({topic:{name:'Router'}},'fallback'),'Router');
 assert.deepEqual(claimEntries(data),[data.nodes[2]]);
 assert.throws(()=>normalizePath('missing',data,x=>x),/Unknown learning-path/);
 assert.throws(()=>claimEntries({...data,source_claims:['missing']}),/Unknown source-claim/);
});
test('new matching words never merge implicitly and old deep links retain reviewed targets',()=>{
 const docs=['one','two'].map(g=>({file:g+'.json',data:{nodes:[{id:'routing',label:'Routing'}],edges:[]}}));
 const identity=createIdentityResolver(docs,[],{});assert.notEqual(identity.resolve('one.json','routing'),identity.resolve('two.json','routing'));
 for(const [key,old] of Object.entries(legacy.sourceNodeMap))assert.equal(a.aliases[old]||old,id(key),key);
 assert.notEqual(id('React_Graph.json:routing'),id('Routing.json:routing'));
 assert.notEqual(id('React_Native.json:react_native'),id('React_Graph.json:react'));
 assert.notEqual(id('IPv6.json:router'),id('Router_Graph.json:router'));
 assert.notEqual(id('python_language:http'),id('HTTP_regenerated.json:http'));
});
test('editorial bridges are typed directed scoped and independently attributed',()=>{
 const edge=a.edges.find(e=>e.id==='editorial:http-tcp-version-scope');assert.equal(edge.source,id('HTTP_regenerated.json:http'));assert.equal(edge.target,id('TCP_IP:tcp'));assert.equal(edge.kind,'uses');assert.ok(edge.scope.includes('HTTP/3 excluded'));
 for(const e of a.edges.filter(e=>e.record.evidenceChecked==='2026-10-09')){assert.equal(e.provenance,'editorial');assert.ok(e.rationale&&e.scope&&e.evidenceSection&&e.evidenceUrls.length);assert.ok(e.evidence.every(v=>v.checked==='2026-10-09'));}
 assert.equal(a.edges.find(e=>e.id==='editorial:wifi-physical').target,id('osi_model:layer_1'));
 assert.equal(a.edges.find(e=>e.id==='editorial:wifi-link').target,id('osi_model:layer_2'));
});
test('all source domains have meaningful visible overview coverage',()=>{
 const shown=new Set(a.overview.nodeIds);for(const doc of a.documents)assert.ok(a.nodes.some(n=>shown.has(n.id)&&n.topics.includes(doc.graphId)),doc.file);
});
