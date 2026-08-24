const { chromium } = require('playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const p = b.contexts()[0].pages().find(x => x.url().includes('chatgpt.com'));
  if (!p) { console.log('no gpt page'); return; }
  await p.bringToFront();
  await p.waitForTimeout(1000);
  const r = await p.evaluate(() => {
    const us = document.querySelectorAll('[data-message-author-role="user"]');
    const o = ['user 消息数: ' + us.length];
    us.forEach((el, i) => { if (i >= us.length - 3) o.push('  U' + i + ': ' + (el.innerText || '').slice(0, 60).replace(/\n/g, ' ')); });
    // 附件痕迹
    const att = document.querySelectorAll('[data-message-author-role="user"] img, [data-message-author-role="user"] [class*="attachment"], [data-message-author-role="user"] [class*="file"]');
    o.push('用户消息里的附件痕迹: ' + att.length);
    return o;
  });
  r.forEach(l => console.log(l));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
