// md2pdf.js — 把 VaR报告.md 转成带公式的 HTML，再用 Chrome CDP 打印成 PDF
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const MarkdownIt = require('markdown-it');
const texmath = require('markdown-it-texmath');
const katex = require('katex');
const { chromium } = require('playwright');

const REPORT = 'C:/Users/我/Documents/DEEPSEEK/VaR-project/report';
const MD = path.join(REPORT, 'VaR报告.md');
const HTML = path.join(REPORT, 'VaR报告.html');
const PDF = path.join(REPORT, 'VaR报告.pdf');

const md = new MarkdownIt({ html: true, linkify: true })
  .use(texmath, { engine: katex, delimiters: 'dollars', katexOptions: { throwOnError: false } });

const body = md.render(fs.readFileSync(MD, 'utf8'));

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>SPY 日度 VaR 预测研究报告</title>
<style>
@page { size: A4; margin: 1.6cm 1.8cm; }
body { font-family: "Noto Serif CJK SC", "SimSun", serif; font-size: 11pt; line-height: 1.65; color: #111; max-width: 100%; }
h1 { font-size: 20pt; text-align: center; border-bottom: 2px solid #333; padding-bottom: 8px; }
h2 { font-size: 15pt; border-bottom: 1px solid #999; padding-bottom: 4px; margin-top: 22px; }
h3 { font-size: 12.5pt; margin-top: 16px; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; page-break-inside: auto; }
th, td { border: 1px solid #bbb; padding: 4px 7px; text-align: center; }
th { background: #f0f0f0; }
img { max-width: 100%; height: auto; display: block; margin: 8px auto; }
blockquote { border-left: 3px solid #aaa; margin: 8px 0; padding: 2px 12px; color: #444; }
code { background: #f5f5f5; padding: 1px 4px; font-size: 9.5pt; }
pre { background: #f7f7f7; padding: 10px; overflow-x: auto; font-size: 9pt; }
.katex-display { overflow-x: auto; overflow-y: hidden; padding: 4px 0; }
strong { color: #000; }
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(HTML, html, 'utf8');
console.log('HTML 已生成:', HTML, fs.statSync(HTML).size, 'bytes');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  try {
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(HTML).href, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(4000); // 等图片加载
    const session = await ctx.newCDPSession(page);
    const { data } = await session.send('Page.printToPDF', {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0cm', bottom: '0cm', left: '0cm', right: '0cm' },
    });
    fs.writeFileSync(PDF, Buffer.from(data, 'base64'));
    console.log('PDF 已生成:', PDF, fs.statSync(PDF).size, 'bytes');
    await page.close();
  } finally {
    await browser.close();
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
