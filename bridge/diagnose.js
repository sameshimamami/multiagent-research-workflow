const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();

  for (const name of ['claude', 'gpt', 'gemini']) {
    const key = name === 'gpt' ? /chatgpt\.com/ : name === 'claude' ? /claude\.ai/ : /gemini\.google\.com/;
    const page = pages.find(p => key.test(p.url()));
    if (!page) { console.log(`[${name}] 未找到标签页`); continue; }
    await page.bringToFront();
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const out = [];
      const ce = document.querySelectorAll('div[contenteditable="true"], div[contenteditable="plaintext-only"], div[contenteditable=""]');
      out.push(`contenteditable divs: ${ce.length}`);
      ce.forEach((el, i) => { if (i < 4) out.push(`  CE${i} aria="${el.getAttribute('aria-label')}" placeholder="${el.getAttribute('data-placeholder')||el.getAttribute('placeholder')}" cls="${(el.className+'').slice(0,60)}"`); });
      const ta = document.querySelectorAll('textarea');
      out.push(`textareas: ${ta.length}`);
      ta.forEach((el, i) => { if (i < 4) out.push(`  TA${i} placeholder="${el.getAttribute('placeholder')}" cls="${(el.className+'').slice(0,60)}"`); });
      return out;
    });
    console.log(`\n=== ${name} (${page.url()}) ===`);
    info.forEach(l => console.log(l));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
