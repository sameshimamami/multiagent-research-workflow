// web-llm-bridge/bridge.js
// 通过 CDP 连接 Chrome，驱动 ChatGPT / Claude / Gemini 对话框。
// 用法：node bridge.js ask <gpt|claude|gemini> "<prompt>"
//      node bridge.js draw <gpt|gemini> "<画图提示>" [输出目录]
// 环境变量：CDP_URL 默认 http://127.0.0.1:9222

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.CDP_URL || 'http://127.0.0.1:9222';

// —— 三个站点的选择器（TODO：连上 Chrome 后实测微调）——
const MODELS = {
  gpt: {
    name: 'ChatGPT',
    url: /chatgpt\.com|chat\.openai\.com/,
    input: 'div[contenteditable="true"]',                     // ChatGPT 输入框（ProseMirror）
    assistant: '[data-message-author-role="assistant"]',      // 助手消息
    generating: 'button[data-testid="stop-button"], button[aria-label*="Stop"]', // 生成中信号
  },
  claude: {
    name: 'Claude',
    url: /claude\.ai/,
    input: 'div[contenteditable="true"]',                     // Claude 输入框（contenteditable）
    assistant: '.font-claude-response',                       // Claude 回复体
    generating: '[data-is-streaming="true"]',                 // 生成中信号（完成变 false）
  },
  gemini: {
    name: 'Gemini',
    url: /gemini\.google\.com/,
    input: 'div[aria-label="为 Gemini 输入提示"]',            // Gemini 输入框（ql-editor）
    assistant: 'message-content, .model-response-text',        // Gemini 回复
    generating: 'button[aria-label*="Stop"]',                  // 生成中信号
  },
};

async function connect() {
  return await chromium.connectOverCDP(CDP_URL);
}

function findPage(context, model) {
  const pages = context.pages();
  return pages.find(p => MODELS[model].url.test(p.url())) || null;
}

async function sendAndWait(page, model, prompt) {
  const cfg = MODELS[model];
  await page.bringToFront();
  // 记录发送前的 assistant 消息数，用于识别"本轮新回复"
  const before = await page.evaluate((s) => document.querySelectorAll(s).length, cfg.assistant);
  // 聚焦输入框并填入
  const input = page.locator(cfg.input).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.click();
  await page.keyboard.type(prompt, { delay: 5 });
  await page.keyboard.press('Enter');
  // 等回复真正结束：优先"生成中信号消失 + 文本稳定"；选择器无效时退回纯文本稳定
  const sel = cfg.assistant;
  const genSel = cfg.generating;
  let last = '';
  let stable = 0;
  const start = Date.now();
  const MAX = 600000; // 最多 10 分钟（思考模式 + 多篇论文很慢）
  while (Date.now() - start < MAX) {
    await page.waitForTimeout(2000);
    const info = await page.evaluate((s) => {
      const els = document.querySelectorAll(s);
      return { n: els.length, text: els.length ? els[els.length - 1].innerText : '' };
    }, sel);
    const cur = info.n > before ? info.text : ''; // 新消息出现前视作空（避免返回旧回复）
    let generating = false;
    if (genSel) {
      generating = await page.evaluate((s) => {
        try { return !!document.querySelector(s); } catch (e) { return false; }
      }, genSel);
    }
    // 完成判定：不再生成 且 文本已出现 且 连续稳定
    if (!generating && cur !== '') {
      if (cur === last) { stable++; } else { stable = 0; last = cur; }
      if (stable >= 2) break; // 不再生成 + 连续 2 轮稳定 = 完成
    } else {
      stable = 0;
      last = cur;
    }
  }
  return last;
}

async function enableThink(page) {
  // ChatGPT 的"思考"按钮：没开就点开（开思考/深度推理模式）
  const btn = page.locator('button', { hasText: '思考' }).first();
  if (await btn.count() === 0) return; // 没找到（界面不同/该账号无此入口）
  const on = await btn.evaluate(el => {
    const p = el.getAttribute('aria-pressed');
    if (p !== null) return p === 'true';
    return /active|selected|enabled|is-active/i.test((el.className || '') + '');
  });
  if (!on) {
    await btn.click();
    await page.waitForTimeout(600);
  }
}

async function ask(model, prompt, opts = {}) {
  if (!MODELS[model]) throw new Error(`未知模型: ${model}（可选 gpt/claude/gemini）`);
  const browser = await connect();
  try {
    const context = browser.contexts()[0];
    const page = findPage(context, model);
    if (!page) throw new Error(`没找到 ${MODELS[model].name} 标签页，请先在 Chrome 打开对应网站`);
    await page.bringToFront();
    if (model === 'gpt') await enableThink(page); // GPT 默认开思考模式
    if (opts.file) {
      // 上传文件/图片（setInputFiles 可直接喂隐藏的 input[type=file]）
      const fi = page.locator('input[type="file"]').first();
      await fi.setInputFiles(opts.file);
      await page.waitForTimeout(2500); // 等附件上传/预览完成
    }
    const text = await sendAndWait(page, model, prompt);
    return text;
  } finally {
    await browser.close();
  }
}

async function draw(model, prompt, outDir = '.') {
  if (model !== 'gpt' && model !== 'gemini') throw new Error('画图仅支持 gpt/gemini');
  const browser = await connect();
  try {
    const context = browser.contexts()[0];
    const page = findPage(context, model);
    if (!page) throw new Error(`没找到 ${MODELS[model].name} 标签页`);
    await sendAndWait(page, model, prompt);
    // 轮询等生成的大图渲染出来（图片生成比文字慢，最多 60s）
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(2000);
      const n = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
        .filter(im => im.naturalWidth > 400 && !((im.className || '') + '').includes('sparkle')).length);
      if (n > 0) { ready = true; break; }
    }
    if (!ready) return { saved: [] };
    fs.mkdirSync(outDir, { recursive: true });
    // 用 canvas 读像素（绕过站点对 blob fetch 的限制）
    const dataUrls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
        .filter(im => im.naturalWidth > 400 && !((im.className || '') + '').includes('sparkle'));
      const out = [];
      for (const im of imgs) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = im.naturalWidth;
          canvas.height = im.naturalHeight;
          canvas.getContext('2d').drawImage(im, 0, 0);
          out.push(canvas.toDataURL('image/png'));
        } catch (e) { /* skip */ }
      }
      return out;
    });
    const saved = [];
    for (let i = 0; i < dataUrls.length; i++) {
      const m = dataUrls[i].match(/^data:(image\/[\w+]+);base64,(.*)$/s);
      if (!m) continue;
      const ext = (m[1].split('/')[1] || 'png').replace('jpeg', 'jpg');
      const fp = path.join(outDir, `${model}-draw-${Date.now()}-${i}.${ext}`);
      fs.writeFileSync(fp, Buffer.from(m[2], 'base64'));
      saved.push(fp);
    }
    return { saved };
  } finally {
    await browser.close();
  }
}

const [cmd, model, ...rest] = process.argv.slice(2);
(async () => {
  if (cmd === 'ask') {
    const fileIdx = rest.indexOf('--file');
    const file = fileIdx >= 0 ? rest[fileIdx + 1] : null;
    const prompt = (fileIdx >= 0 ? rest.slice(0, fileIdx) : rest).join(' ');
    const out = await ask(model, prompt, { file });
    console.log(out);
    if (/额度|上限|限制|rate limit|limit reached|请稍后|try again|quota|恢复时间|小时|分钟/i.test(out)) {
      console.error('[QUOTA 提醒] 回复疑似命中免费额度限制，请按提示的恢复时间稍后再交互。');
    }
  } else if (cmd === 'draw') {
    const outIdx = rest.indexOf('--out');
    const outDir = outIdx >= 0 ? rest[outIdx + 1] : '.';
    const prompt = (outIdx >= 0 ? rest.slice(0, outIdx) : rest).join(' ');
    const r = await draw(model, prompt, outDir);
    console.log('SAVED:', r.saved.join('\n'));
  } else {
    console.log('用法: node bridge.js ask <gpt|claude|gemini> "<prompt>"');
    console.log('      node bridge.js draw <gpt|gemini> "<画图提示>" [--out 目录]');
  }
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
