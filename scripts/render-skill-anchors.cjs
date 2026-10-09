const fs=require('node:fs');
if (!process.env.CHROMIUM_PATH || !process.env.MERMAID_BUNDLE) throw new Error('Provide an approved CHROMIUM_PATH and existing MERMAID_BUNDLE.');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,chromiumSandbox:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1100}});
  await page.setContent('<html><body style="background:white;margin:24px"><div id="graph"></div></body></html>');
  await page.addScriptTag({path:process.env.MERMAID_BUNDLE});
  const text=fs.readFileSync('docs/skills/ANCHORS.md','utf8');
  const fence=String.fromCharCode(96).repeat(3);
  const graph=text.split(fence+'mermaid')[1].split(fence)[0].trim();
  const result=await page.evaluate(async graph=>{
   mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'default'});
   await mermaid.parse(graph);
   const {svg}=await mermaid.render('skillAnchorGraph',graph);
   document.querySelector('#graph').innerHTML=svg;
   return {svg,nodes:document.querySelectorAll('.node').length};
  },graph);
  fs.writeFileSync('docs/skills/anchors.svg',result.svg);
  await page.screenshot({path:'docs/qa/current/skill-anchors.png',fullPage:true});
  console.log(JSON.stringify({parsed:true,rendered:true,browser:await browser.version(),svgBytes:Buffer.byteLength(result.svg),nodes:result.nodes},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
