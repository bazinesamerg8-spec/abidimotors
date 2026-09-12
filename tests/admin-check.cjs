const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const baseURL=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(baseURL+'/admin.html',{waitUntil:'networkidle'});
    await page.evaluate(()=>localStorage.setItem('abidi-enquiries',JSON.stringify([{id:101,createdAt:new Date().toISOString(),name:'Test Customer',phone:'0795263552',vehicle:'Jetour T2 1.5',message:'Please confirm availability.',status:'New'}])));
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('#activeMetric').textContent(),'31');
    assert.equal(await page.locator('#leadMetric').textContent(),'1');
    assert.equal(await page.locator('[data-admin-view]:not([hidden])').getAttribute('data-admin-view'),'dashboard');

    await page.locator('[data-view="inventory"]').click();
    assert.equal(await page.locator('#adminRows tr').count(),31);
    await page.locator('#adminSearch').fill('T-Roc');
    assert.equal(await page.locator('#adminRows tr').count(),1);
    await page.locator('[data-edit="4"]').click();
    assert(await page.locator('#editDialog').evaluate(dialog=>dialog.open));
    await page.locator('#editForm [name="price"]').fill('540');
    await page.locator('#editForm button[type="submit"]').click();
    await page.waitForTimeout(750);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('abidi-vehicles')).find(vehicle=>vehicle.id===4).price),540);

    await page.locator('[data-view="enquiries"]').click();
    assert.equal(await page.locator('.lead-card').count(),1);
    await page.locator('.lead-card [data-open-lead="101"]').click();
    assert.match(await page.locator('.lead-dialog-actions a').getAttribute('href'),/wa\.me\/213795263552/);
    await page.locator('[data-lead-status="101"]').selectOption('Contacted');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('abidi-enquiries'))[0].status),'Contacted');
    assert.deepEqual(errors,[]);
    await context.close();

    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();
    await phone.goto(baseURL+'/admin.html',{waitUntil:'networkidle'});
    assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Admin has horizontal page overflow');
    await phone.locator('#menuButton').tap();
    assert(await phone.locator('#adminSidebar').evaluate(element=>element.classList.contains('open')));
    await phone.locator('[data-view="inventory"]').tap();
    await phone.locator('#adminSearch').fill('Roewe');
    await phone.locator('[data-edit="11"]').tap();
    assert(await phone.locator('#editDialog').evaluate(dialog=>dialog.open));
    assert(await phone.locator('#editDialog').evaluate(dialog=>dialog.scrollHeight<=dialog.clientHeight||getComputedStyle(dialog).overflowY==='auto'));
    assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Admin mobile dialog creates page overflow');
    await mobile.close();
    console.log('PASS: admin dashboard metrics, navigation, inventory filters/editing, enquiry workflow, WhatsApp action and mobile layout.');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
