// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Run only in an environment whose browser policy permits local-page QA.
// Requires an existing Playwright installation and explicitly selected browser.
// This script does not install browsers, bypass browser policy or disable the sandbox.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
if (!process.env.CHROMIUM_PATH) throw new Error('Set CHROMIUM_PATH to an approved installed browser. No browser is installed by this script.');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = path.resolve(process.env.QA_OUTPUT || path.join(root, 'docs/qa/current'));
fs.mkdirSync(output, {recursive:true});
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({status:'running',date:new Date().toISOString()},null,2));
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'data/atlas.json')));
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH, headless:true});
  const checks=[], errors=[], runs=[];
  try {
    for (const width of [1440,390,320]) {
      const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
      page.on('pageerror',e=>errors.push(e.message));
      const before=Date.now();
      await page.goto(process.env.QA_URL || 'http://127.0.0.1:4173/');
      await page.waitForFunction(expected => document.querySelector('#metric-concepts').textContent.replaceAll(',', '') === String(expected), atlas.nodes.length);
      const loadMs=Date.now()-before;
      assert.equal(await page.locator('#route-list .route-card').count(),Math.min(36,atlas.paths.length));
      const entryTimings=[];
      for (const id of ['os','python','sandbox','volume_computing:volume','optical_disc_image','system_image','virtual_machine']) {
        const start=Date.now();
        await page.locator('#reset-map').click();
        const entry=page.locator('[data-start="'+id+'"]'); await entry.click();
        await page.locator('#map-preview .detail-status.ready').waitFor();
        const verify=async()=>{
          const actual=await page.evaluate(()=>({draw:JSON.parse(document.querySelector('#network').dataset.incidentEdgeIds).sort(),list:[...document.querySelectorAll('[data-relation-id]')].map(e=>e.dataset.relationId).sort()}));
          const expected=atlas.edges.filter(e=>e.source===id||e.target===id).map(e=>e.id).sort();
          assert.deepEqual(actual.draw,expected); assert.deepEqual(actual.list,expected);
          return expected.length;
        };
        const incident=await verify();
        assert.equal(await page.locator('#connection-results [data-connection-id]').count(),incident);
        await page.locator('#connection-search').fill('no-match-zzzz');
        assert.equal(await page.locator('#connection-results [data-connection-id]').count(),0);
        await verify();
        await page.locator('#connection-search').fill('');
        const explain=page.locator('#connection-results [data-inspect-edge]').first();
        const edgeId=await explain.getAttribute('data-inspect-edge');
        await explain.click(); await verify();
        assert.equal(await page.evaluate(()=>document.activeElement.id),'active-relationship');
        assert.equal(new URL(page.url()).searchParams.get('edge'),edgeId);
        await page.locator('#source-select').selectOption('docker');
        assert.equal(await page.locator('#network').getAttribute('data-active-edge'),edgeId);
        assert.equal(await page.locator('#network').getAttribute('data-edge-emphasized'),'true');
        await page.locator('#neighborhood-view').click();
        assert.equal(await page.locator('#network').getAttribute('data-view-mode'),'context'); await verify();
        await page.locator('#neighborhood-view').click();
        await page.locator('#fit-selection').click();
        await page.locator('#network').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>{const c=document.querySelector('#network'),r=c.getBoundingClientRect();return Math.abs(c.height/Math.min(devicePixelRatio||1,2)-r.height)<1;});
        const labels=await page.locator('#network').evaluate(el=>JSON.parse(el.dataset.labelTargets));
        const size=await page.locator('#network').boundingBox();
        const label=labels.find(l=>l.id!==id && l.x>=0 && l.y>=0 && l.x+l.w<size.width && l.y+l.h<size.height);
        assert.ok(label,'a neighbor label is available');
        const box=await page.locator('#network').boundingBox();
        await page.mouse.click(box.x+label.x+label.w/2,box.y+label.y+label.h/2);
        const picked=await page.locator('#network').getAttribute('data-selected-concept');
        if(picked!==label.id) console.error(JSON.stringify({width,id,label,box,picked,hit:await page.evaluate(({x,y})=>{const el=document.elementFromPoint(x,y);return {tag:el?.tagName,id:el?.id,viewport:[innerWidth,innerHeight],labels:JSON.parse(document.querySelector('#network').dataset.labelTargets).filter(l=>l.id==='resource_management')};},{x:box.x+label.x+label.w/2,y:box.y+label.y+label.h/2})}));
        assert.equal(picked,label.id);
        await page.locator('#selection-back').click(); await verify();
        await page.locator('#edge-focus').click(); await verify();
        await page.locator('#source-select').selectOption('docker'); await verify();
        await page.locator('#reset-map').click(); await entry.click(); await verify();
        assert.equal(await page.locator('#edge-focus').getAttribute('aria-pressed'),'false');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        entryTimings.push({id,incident,totalInteractionMs:Date.now()-start});
      }
      await page.locator('#source-select').selectOption('all');
      await page.locator('#search').fill('python');
      assert.equal(await page.locator('#search-results [data-concept]').first().getAttribute('data-concept'),'python');
      await page.locator('#search').fill('');
      await page.locator('#routes-more').click();
      await page.waitForFunction(count=>document.querySelectorAll('#route-list .route-card').length===count,atlas.paths.length);
      await page.locator('[data-route="python_language:path:13"]').click();
      assert.match(await page.locator('#route-detail').textContent(),/Unresolved source segment/);
      assert.equal(await page.locator('#route-explore').count(),0);
      await page.locator('#route-next').click();
      await page.keyboard.press('Escape');
      await page.locator('#reset-map').click();
      await page.locator('[data-start="os"]').click();
      await page.locator('#map-preview .detail-status.ready').waitFor();
      const rich=page.locator('[data-relation-id="operating_system:rich_semantic_relationships:0"]');
      assert.match(await rich.textContent(),/Conditions/);
      await page.locator('#explorer').scrollIntoViewIfNeeded();
      const screenshot='integration-'+(width===1440?'desktop':width===390?'mobile':'narrow')+'.png';
      await page.screenshot({path:path.join(output,screenshot)});
      runs.push({width,loadMs,entryTimings,screenshot,noHorizontalOverflow:true});
      await page.close();
    }
    assert.deepEqual(errors,[]);
    checks.push('All '+atlas.documents.length+' source domains and '+atlas.paths.length+' paths','seven entries per viewport','incident edges match source archive','connection search, source select, emphasis, context, fit, canvas click and Back','rich metadata','unresolved path preserved','no page errors or horizontal overflow');
    const result={status:'passed',date:new Date().toISOString(),browser:await browser.version(),checks,errors,runs};
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  } catch (error) {
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({status:'failed',date:new Date().toISOString(),error:error.message,checks,errors,runs},null,2));
    throw error;
  } finally {await browser.close();}
})().catch(error=>{
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({status:'failed',date:new Date().toISOString(),error:error.message},null,2));
  console.error(error);process.exitCode=1;
});
