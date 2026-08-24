# bridge/ · 网页 LLM 桥接

用 Playwright + Chrome DevTools Protocol（CDP）驱动 Chrome 里已登录的 **ChatGPT / Claude / Gemini**，让网页模型参与方案调研、审计、检查、画图、传文件。

## 环境要求

- Node.js（v18+）与 Playwright：`npm install playwright`
- Chrome 用**专用 profile** + 调试端口启动（Chrome 136+ 对默认 profile 会忽略调试端口）：

```powershell
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--remote-debugging-port=9222', "--user-data-dir=C:\path\to\.chrome-profile", '--remote-allow-origins=*'
```

- 在该 Chrome 窗口登录 ChatGPT / Claude / Gemini（一次性）。
- 一键唤醒脚本：`relaunch-chrome.ps1`（幂等，会自动开三个标签页）。

## 用法

```bash
# 问文本（GPT 自动开思考模式；Claude/Gemini 直接问）
node bridge.js ask gpt "你的问题"
node bridge.js ask claude "你的问题"
node bridge.js ask gemini "你的问题"

# 上传文件/图片再问
node bridge.js ask claude "描述这份报告" --file C:\path\to\file.pptx

# 画图（Gemini 优先；GPT 画图模式）
node bridge.js draw gemini "画一张示意图" --out C:\path\to\outdir
```

## 关键实现点

- **等回复**：发送前记 assistant 消息数，只有出现"新消息"且生成结束信号消失（Claude `[data-is-streaming="true"]` 消失）才算答完，避免在思考/搜索阶段误判。
- **思考模式**：GPT 的"思考"按钮自动点开（`enableThink`）。
- **文件上传**：`setInputFiles` 直接喂隐藏的 `input[type=file]`（GPT/Claude 可用；Gemini 需点"+"，待完善）。
- **画图**：轮询等生成大图出现，用 canvas 读像素转 base64 存盘（绕过站点对 blob fetch 的限制）。
- **额度检测**：回复命中额度关键词会打 `[QUOTA 提醒]`，命中后自动等恢复时间。
- **PDF 生成**：`md2pdf.js` 用 markdown-it+katex 把报告转 HTML，再经 Chrome CDP `Page.printToPDF` 出 PDF。

> 网页版 DOM 会随站点更新而变化，选择器需按需维护。
