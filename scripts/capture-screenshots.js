const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const shots = 'docs/screenshots';
  const bust = Date.now();

  // Creator
  const creatorCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await creatorCtx.newPage();
  await page.goto(`https://skillswap-ai-ecru.vercel.app/?v=${bust}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({ path: `${shots}/landing.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/login?v=${bust}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/login.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/register?v=${bust}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/register.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/login?v=${bust}`, { waitUntil: 'networkidle' });
  await page.fill('#email', 'creator@skillswap.ai');
  await page.fill('#password', 'Demo@12345');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/creator**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${shots}/creator-dashboard.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/creator/ai-builder?v=${bust}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/ai-builder.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/creator/portfolio?v=${bust}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/portfolio.png` });
  await page.goto(`https://skillswap-ai-ecru.vercel.app/creator/gigs?v=${bust}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/gigs.png` });
  await creatorCtx.close();

  // Client in fresh context
  const clientCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const client = await clientCtx.newPage();
  await client.goto(`https://skillswap-ai-ecru.vercel.app/login?v=${bust}`, { waitUntil: 'networkidle' });
  await client.fill('#email', 'client@skillswap.ai');
  await client.fill('#password', 'Demo@12345');
  await client.getByRole('button', { name: 'Sign in' }).click();
  await client.waitForURL('**/client**', { timeout: 20000 });
  await client.waitForTimeout(2000);
  await client.screenshot({ path: `${shots}/client-dashboard.png` });
  await client.goto(`https://skillswap-ai-ecru.vercel.app/client/post-job?v=${bust}`, { waitUntil: 'networkidle' });
  await client.waitForTimeout(1200);
  await client.screenshot({ path: `${shots}/post-job.png` });
  await client.goto(`https://skillswap-ai-ecru.vercel.app/client/creators?v=${bust}`, { waitUntil: 'networkidle' });
  await client.waitForTimeout(1200);
  await client.screenshot({ path: `${shots}/browse-creators.png` });
  await clientCtx.close();

  const docs = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await docs.goto('https://skillswap-ai-api-production.up.railway.app/docs', { waitUntil: 'networkidle' });
  await docs.waitForTimeout(2000);
  await docs.screenshot({ path: `${shots}/api-docs.png` });
  await browser.close();
  console.log('all screenshots saved');
})().catch((e) => { console.error(e); process.exit(1); });
