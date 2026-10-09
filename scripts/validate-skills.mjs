import assert from 'node:assert/strict';
import {readFile, readdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=['.agents/skills/faiku/SKILL.md','.agents/skills/pimp-my-skill/SKILL.md',...(await readdir(path.join(root,'docs/skills'))).filter(f=>f.endsWith('.md')).map(f=>'docs/skills/'+f)];
let links=0, examples=0;
for(const file of files){
 const text=await readFile(path.join(root,file),'utf8');
 if(file.endsWith('SKILL.md')){
  const lines = text.split(String.fromCharCode(10));
  assert.equal(lines[0], '---');
  assert.ok(lines[1].startsWith('name: '));
  assert.ok(lines[2].startsWith('description: '));
  assert.equal(text.match(/^## [FP]\d+ /gm)?.length,file.includes('/faiku/')?6:7);
 }
 for(const [,href] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
  if (/^[a-z]+:|^#/i.test(href)) continue;
  const target=path.resolve(root,path.dirname(file),href.split('#')[0]);
  assert.ok(target.startsWith(root),file+': outside root');
  await access(target); links++;
 }
 for(const [,json] of text.matchAll(/```json\s*([\s\S]*?)```/g)) {
  const result=JSON.parse(json);
  assert.ok(['DERIVED','FAULT'].includes(result.status));
  assert.ok(Array.isArray(result.evidence));
  assert.equal(typeof result.detail,'string'); examples++;
 }
}
const anchors=await readFile(path.join(root,'docs/skills/ANCHORS.md'),'utf8');
for(const id of ['F1','F2','F3','F4','F5','F6','P1','P2','P3','P4','P5','P6','P7']) assert.ok(anchors.includes(id),id);
console.log(JSON.stringify({files:files.length,links,examples,procedures:13,status:'passed'},null,2));
