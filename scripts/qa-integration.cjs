// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Run only in an environment whose browser policy permits local-page QA.
// Existing Playwright/Mermaid assets are reused; no dependency installation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const install = process.env.OPENCLAW_INSTALL || '/home/openclaw/.openclaw/tools/node-v24.19.0/lib/node_modules/openclaw';
const { chromium } = require(path.join(install, 'node_modules/playwright-core'));
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'data/atlas.json')));
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', headless:true, args:['--no-sandbox'], env:{...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/tmp/pimp-my-skill-render-libs/root/usr/lib/x86_64-linux-gnu'}});
  const checks=[], errors=[], runs=[];
  try {
    for (const width of [1440,390,320]) {
      const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
      page.on('pageerror',e=>errors.push(e.message));
      const before=Date.now();
      await page.goto(process.env.QA_URL || 'http://127.0.0.1:4173/');
      await page.waitForFunction(()=>document.querySelector('#metric-concepts').textContent.includes('2,278'));
      const loadMs=Date.now()-before;
      assert.equal(await page.locator('#route-list .route-card').count(),10);
      const entryTimings=[];
      for (const id of ['os','python','sandbox','volume_computing:volume','optical_disc_image','system_image','virtual_machine']) {
        const start=Date.now();
        if (await page.locator('#clear-focus').count()) await page.locator('#clear-focus').click();
        const entry=page.locator('[data-start="'+id+'"]'); await entry.click();
        const verify=async()=>{
          const actual=await page.evaluate(()=>({draw:JSON.parse(document.querySelector('#network').dataset.incidentEdgeIds).sort(),list:[...document.querySelectorAll('[data-relation-id]')].map(e=>e.dataset.relationId).sort()}));
          const expected=atlas.edges.filter(e=>e.source===id||e.target===id).map(e=>e.id).sort();
          assert.deepEqual(actual.draw,expected); assert.deepEqual(actual.list,expected);
          return expected.length;
        };
        const incident=await verify();
        await page.locator('#edge-focus').click(); await verify();
        await page.locator('[data-topic="docker"]').click(); await verify();
        await page.locator('#clear-focus').click(); await entry.click(); await verify();
        assert.equal(await page.locator('#edge-focus').getAttribute('aria-pressed'),'false');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        entryTimings.push({id,incident,totalInteractionMs:Date.now()-start});
      }
      await page.locator('[data-topic="all"]').click();
      await page.locator('#search').fill('python');
      assert.equal(await page.locator('#search-results [data-concept]').first().getAttribute('data-concept'),'python');
      await page.locator('#search').fill('');
      await page.locator('#routes-more').click();
      assert.equal(await page.locator('#route-list .route-card').count(),133);
      await page.locator('[data-route="python_language:path:13"]').click();
      assert.match(await page.locator('#route-detail').textContent(),/Unresolved source segment/);
      assert.equal(await page.locator('#route-explore').count(),0);
      await page.locator('#route-next').click();
      await page.keyboard.press('Escape');
      if (await page.locator('#clear-focus').count()) await page.locator('#clear-focus').click();
      await page.locator('[data-start="os"]').click();
      const rich=page.locator('[data-relation-id="operating_system:rich_semantic_relationships:0"]');
      assert.match(await rich.textContent(),/Conditions/);
      await page.locator('#explorer').scrollIntoViewIfNeeded();
      const screenshot='docs/qa/integration-'+(width===1440?'desktop':width===390?'mobile':'narrow')+'.png';
      await page.screenshot({path:path.join(root,screenshot)});
      runs.push({width,loadMs,entryTimings,screenshot,noHorizontalOverflow:true});
      await page.close();
    }
    assert.deepEqual(errors,[]);
    checks.push('All ten domains and 133 paths','seven new/core entries per viewport','all incident edge IDs equal atlas and inspector after select, emphasis, unrelated filter and reselect','rich metadata','prose-only path safely unresolved','exact Python search','no page errors or overflow');
    const assetRoot='/home/openclaw/.openclaw/cache/control-ui-assets'; let bundle;
    for(const dir of fs.readdirSync(assetRoot)){const assets=path.join(assetRoot,dir,'assets');if(!fs.existsSync(assets))continue;const file=fs.readdirSync(assets).find(f=>f.startsWith('mermaid.min-')&&f.endsWith('.js'));if(file){bundle=path.join(assets,file);break;}}
    assert.ok(bundle);
    const renderPage=await browser.newPage();await renderPage.setContent('<html><body></body></html>');await renderPage.addScriptTag({path:bundle});
    const graph=fs.readFileSync(path.join(root,'docs/data-integration.mmd'),'utf8');
    const rendered=await renderPage.evaluate(async graph=>{mermaid.initialize({startOnLoad:false,securityLevel:'strict'});await mermaid.parse(graph);return (await mermaid.render('dataIntegration',graph)).svg;},graph);
    fs.writeFileSync(path.join(root,'docs/integration-graph.svg'),rendered);await renderPage.close();
    const result={attribution:'Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService',date:'2026-10-07',browser:await browser.version(),checks,errors,runs,mermaid:{parsed:true,rendered:true,svgBytes:Buffer.byteLength(rendered)}};
    fs.writeFileSync(path.join(root,'docs/integration-browser.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
