const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('claude.ai'));
  if (!page) { console.log('no claude page'); return; }
  await page.bringToFront();
  await page.waitForTimeout(1200);
  const msgs = await page.evaluate(() => {
    const out = [];
    const um = document.querySelectorAll('[data-testid="user-message"]');
    out.push('user-message count: ' + um.length);
    um.forEach((el, i) => out.push('  USER' + i + ': ' + el.innerText.slice(0, 80)));
    const sels = ['.font-claude-message', '[data-testid="assistant-message"]', '.font-claude-response', 'div[data-is-streaming]'];
    for (const s of sels) out.push('sel "' + s + '" count: ' + document.querySelectorAll(s).length);
    const main = document.querySelector('main');
    if (main) out.push('MAIN: ' + main.innerText.slice(0, 400).replace(/\n/g, ' | '));
    return out;
  });
  msgs.forEach(l => console.log(l));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
