// Run with NODE_PATH pointing to an installation of Playwright.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const {tmpdir} = require('node:os');

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:8765';
const shot = name => path.join(tmpdir(),`abidi-mobile-${name}.png`);
const devices = [
  {name:'iphone-se', width:375, height:667, ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'},
  {name:'iphone-15', width:393, height:852, ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'},
  {name:'android-small', width:360, height:800, ua:'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36'},
  {name:'pixel', width:412, height:915, ua:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36'},
  {name:'tablet', width:768, height:1024, ua:'Mozilla/5.0 (Linux; Android 14; Tablet) AppleWebKit/537.36 Chrome/125 Safari/537.36'},
  {name:'landscape', width:844, height:390, ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'}
];

const inViewport = (box,width,height) => box && box.x >= -1 && box.y >= -1 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1;

(async()=>{
  const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await chromium.launch({executablePath,headless:true});
  try {
    for (const device of devices) {
      const context = await browser.newContext({
        viewport:{width:device.width,height:device.height},
        userAgent:device.ua,
        isMobile:true,
        hasTouch:true,
        reducedMotion:'reduce'
      });
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(baseURL+'/index.html',{waitUntil:'networkidle'});

      assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`${device.name}: page has horizontal overflow`);
      const header = await page.locator('.site-header').boundingBox();
      assert(header.x >= -1 && header.x + header.width <= device.width + 1,`${device.name}: header exceeds viewport`);
      assert.equal(Math.round(await page.locator('#home').evaluate(el=>el.getBoundingClientRect().height)),device.height,`${device.name}: showroom follows the dynamic viewport`);

      await page.locator('.nav-toggle').tap();
      const menu = await page.locator('.main-nav').boundingBox();
      assert(menu.x >= -1 && menu.x + menu.width <= device.width + 1,`${device.name}: mobile menu exceeds viewport`);
      const navTarget = await page.locator('.main-nav a').first().evaluate(el=>getComputedStyle(el).minHeight);
      assert(parseFloat(navTarget)>=44,`${device.name}: navigation touch targets are too small`);
      await page.locator('.nav-toggle').tap();

      await page.locator('#tourAction').tap();
      await page.locator('#tourAction').tap();
      assert.equal(await page.locator('#home').getAttribute('data-room'),'collection',`${device.name}: room controls remain usable`);
      assert(await page.locator('.tour-display').first().isVisible(),`${device.name}: collection cards are visible`);
      await page.screenshot({path:shot(device.name+'-collection')});

      await page.locator('.tour-display').first().tap();
      const dialog = await page.locator('#vehicleModal').boundingBox();
      assert(inViewport(dialog,device.width,device.height),`${device.name}: vehicle dialog exceeds viewport`);
      assert(await page.locator('#vehicleModal').evaluate(el=>el.scrollHeight<=el.clientHeight || getComputedStyle(el).overflowY==='auto'),`${device.name}: dialog cannot scroll`);
      if (device.name==='iphone-se') await page.screenshot({path:shot('iphone-se-details')});
      await page.keyboard.press('Escape');

      await page.locator('#inventory').scrollIntoViewIfNeeded();
      const toolbarBoxes = await page.locator('.inventory-toolbar input,.inventory-toolbar select').evaluateAll(elements=>elements.map(el=>({box:el.getBoundingClientRect().toJSON(),font:parseFloat(getComputedStyle(el).fontSize)})));
      assert(toolbarBoxes.every(item=>item.box.left>=-1 && item.box.right<=device.width+1),`${device.name}: a filter exceeds viewport`);
      assert(toolbarBoxes.every(item=>item.font>=16),`${device.name}: form text could trigger iOS zoom`);
      const columns = await page.locator('#vehicleGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(columns,device.width<=600?1:2,`${device.name}: catalogue column count is incorrect`);
      if (device.name==='iphone-se') await page.screenshot({path:shot('iphone-se-inventory')});

      if (device.width<=600) {
        await page.locator('[data-compare]').first().check();
        const compare = await page.locator('#compareBar').boundingBox();
        assert(compare.x>=-1 && compare.x+compare.width<=device.width+1,`${device.name}: comparison bar exceeds viewport`);
        await page.locator('#clearCompare').tap();
      }

      await page.locator('#contact').scrollIntoViewIfNeeded();
      assert(await page.locator('#contactForm input').evaluateAll(elements=>elements.every(el=>parseFloat(getComputedStyle(el).fontSize)>=16)),`${device.name}: contact form can trigger iOS zoom`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`${device.name}: lower page has horizontal overflow`);
      assert.deepEqual(errors,[],`${device.name}: runtime errors`);
      await context.close();
    }
    const adminContext = await browser.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true});
    const admin = await adminContext.newPage();
    await admin.goto(baseURL+'/admin.html',{waitUntil:'networkidle'});
    assert(await admin.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'admin: page has horizontal overflow');
    assert(await admin.locator('.table-wrap').evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).overflowX==='auto'),'admin: inventory table is not independently scrollable');
    await admin.locator('[data-edit]').first().tap();
    const editor = await admin.locator('#editDialog').boundingBox();
    assert(inViewport(editor,375,667),'admin: editor exceeds phone viewport');
    assert(await admin.locator('#editForm input[name="price"]').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16),'admin: editor could trigger iOS zoom');
    await adminContext.close();
    console.log('PASS: iPhone, Android, tablet and landscape layouts; viewport sizing, touch targets, navigation, tour, inventory, dialogs, compare bar and forms.');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
