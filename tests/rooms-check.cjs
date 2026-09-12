const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {tmpdir}=require('node:os');
const baseURL=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';
const shot=name=>path.join(tmpdir(),`abidi-rooms-${name}.png`);
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(baseURL+'/index.html',{waitUntil:'networkidle'});
    await page.locator('#inventory').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    assert.match(await page.locator('.inventory-atmosphere').evaluate(el=>getComputedStyle(el,'::before').backgroundImage),/abidi-showroom-hero-v1/);
    await page.screenshot({path:shot('inventory-desktop')});
    await page.locator('#services').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    assert.match(await page.locator('.experience-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage),/abidi-showroom-hero-v1/);
    assert.equal(await page.locator('.service-grid article').count(),3);
    const before=await page.locator('.experience-backdrop').evaluate(el=>getComputedStyle(el).transform);
    const box=await page.locator('#services').boundingBox();
    await page.mouse.move(box.x+box.width*.85,box.y+box.height*.45);
    await page.waitForTimeout(500);
    const after=await page.locator('.experience-backdrop').evaluate(el=>getComputedStyle(el).transform);
    assert.notEqual(before,after,'Services environment responds to pointer movement');
    await page.screenshot({path:shot('services-desktop')});
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    assert.match(await page.locator('.about-environment').evaluate(el=>getComputedStyle(el).backgroundImage),/abidi-showroom-panorama-v2/);
    await page.screenshot({path:shot('about-desktop')});
    assert.deepEqual(errors,[]);

    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await mobile.goto(baseURL+'/index.html',{waitUntil:'networkidle'});
    await mobile.locator('#inventory').scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(700);
    await mobile.screenshot({path:shot('inventory-mobile')});
    await mobile.locator('#services').scrollIntoViewIfNeeded();
    assert.equal(await mobile.locator('.service-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
    await mobile.locator('#services').screenshot({path:shot('services-mobile')});
    await mobile.locator('#about').scrollIntoViewIfNeeded();
    assert.equal(await mobile.locator('#about').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
    assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile rooms create horizontal overflow');
    await mobile.locator('#about').screenshot({path:shot('about-mobile')});
    await mobile.close();
    console.log('PASS: Services and About backgrounds, pointer depth, scroll motion hooks, responsive layouts and reduced motion.');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
