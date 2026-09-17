# skill: multiagent-web-collab（多智能体 + 网页模型协作工作流）

> 用途：DSH 组织多智能体 + 网页模型协作完成科研/工程任务的标准工作流。
> 用户已确认长期生效（2026-08），无需每次重复解释流程。
> 来源：提炼自 `research-workflow/` 与 `multiagent-research-workflow/` 的实际执行经验（VaR 项目、论文调研、PhD 申请邮件、CSC proposal 等）。

---

## 触发方式

- 用户提出任何研究/工程任务（提方案、找论文、改代码、跑实验、写报告、做 PPT、写申请材料等），且希望多智能体 + 网页模型协作时，自动按本 skill 执行。
- 无需用户重复说明流程；执行时按下面的分工与步骤来。

---

## 核心六步流程

1. **GPT 提方案**（思考模式）：DSH 根据用户的问题/需求 → 用 bridge 问 GPT（开思考模式）→ 得到方案/点子/论文调研。
2. **Claude 审计**（max 功率）：把 GPT 方案给 Claude 审计——需不需要优化、哪里可改进、有无事实错误；Claude 和 GPT 的产出要**互相检查、可迭代多轮**（把 A 的输出给 B 审，再把 B 的意见给 A 修订）。
3. **用户审核**：关键方案/产出给用户过目，拍板通过 / 修改。
4. **hermes 写码 + 跑码**：DSH 写提示词 → hermes 创建项目文件夹、按要求写代码、跑代码；写码/跑码遇到难或不确定的问题 → **主动用 bridge 问网页版 GPT（思考模式）要方案/思路**，拿到解答再继续，不硬撑、不卡住。
5. **Claude Code 报告**：跑完根据结果写提示词 → Claude Code 制作报告/PPT（**可编辑优先**）。
6. **全程检查**：网页 GPT/Claude 负责全程结果检查（打分表见 `research-workflow/templates/08-监督验收.md`），不过就 replan（最多 2 轮），仍不过升级给用户。

---

## 角色分工

| 角色 | 干什么 |
|------|--------|
| GPT（网页·思考模式） | 提方案、调研论文、写码/跑码遇难题时的解法、审计别人的方案 |
| Claude（网页·max） | 审计方案、互相检查 GPT 的产出、全程检查、写申请材料（邮件/Proposal 正文） |
| 用户 | 审核方案/材料（关卡） |
| hermes | 创建项目文件夹、写代码、跑代码 |
| Claude Code | 生成报告/PPT（可编辑） |
| DSH（我） | 组织编排、写提示词、桥接、验收、内化 learn |

---

## 桥接工具（web-llm-bridge）

- 位置：`C:\Users\我\Documents\DEEPSEEK\web-llm-bridge\`
- **bridge.js**：`node bridge.js ask <gpt|claude|gemini> "<prompt>"`（GPT 自动开思考模式；`--file <path>` 可上传附件；Claude 支持读 PDF）。
- **专用 Chrome**：CDP 端口 9222，`--user-data-dir=web-llm-bridge\.chrome-profile`；CDP 卡死（connectOverCDP 超时）→ kill chrome-profile 进程 + 内联命令重启 + 重开标签页。
- **Claude 输入技巧**：composer 被 overlay 挡住时用 `click({ force: true })` 再输入；等待回复要等新 assistant 消息出现且 `[data-is-streaming="true"]` 消失。
- **Claude 附件配额**：每个 PDF 页算一张图；老聊天附件多会超配额 → 开新对话（`https://claude.ai/new`）。
- **Gmail 发送**：`node send-gmail.js "<to>" "<subject>" "<body-file>"`（To 用 `input[aria-label="发送至收件人"]` + fill，Enter 确认收件人，附件注入，支持 `--dry-run`）。
- **固定对话原则（用户明确要求）**：一个任务在网页上和 GPT/Claude 聊时，**只用一个固定对话**，后续迭代都进同一个对话，绝不新建对话框。任务开始时记录对话 URL（GPT: `chatgpt.com/c/<id>`；Claude: `claude.ai/chat/<id>`），之后直接导航回该 URL 继续，保持上下文连续、不浪费额度。唯一例外：Claude 附件配额超限时（PDF 页算图）才开新对话。
- **一次性完整发送原则（用户明确要求·硬约束）**：和网页模型沟通时，把**全部要求一次性完整写进输入框**再发送，**绝不连续发送多条消息**（不要先发短的再追加、不要分多次发、不要发半句）。发送前必须**校验输入框内容 = 预期完整内容**（字符数核对），确认无残留草稿、无截断后再触发发送。**操作规程（GPT 长文本）**：① 打开/导航到固定对话并等页面完全加载；② 清空输入框（JS `textContent=''` + input 事件，重复 2-3 次并核对为 0）；③ 用 `fill()`（若 contenteditable 支持）或 `insertText` 一次性注入完整 prompt（**不用 keyboard.type 输长文本**——它会被 GPT 写作块编辑器打断或误触发送）；④ 校验 `innerText.length` 与预期一致（≥ 预期的 95%）；⑤ 再点 composer-submit 发送，发送后确认输入框已清空（= 真的发出去了）才结束。若中途发现 GPT 进入"写作块编辑器"（出现"编辑/打开编辑器"按钮或全屏 dialog），先退出编辑器模式再操作，绝不带半截内容发送。

---

## 额度规则

- 网页模型额度耗尽 → 读恢复时间 → **自动等，不询问用户**。
- 各模型额度独立（GPT / Claude / Gemini 各自算），一个用完可换另一个。

---

## 执行要点（来自实战经验）

- 网页模型回复慢/卡：GPT 思考模式 5-10 分钟/批，Claude 搜索可能卡死（服务端问题，等恢复即可）；都可用后台 job + 轮询页面最后一条回复获取。
- 文件上传给 Claude 读 PDF：先开新对话避免图片配额问题。
- 邮件/申请材料等正式产出：Claude 在指定聊天里写 → 用户审核 → 再发送。
- **学术写作约束（用户明确要求·默认生效）**：任何学术相关写作（论文/Proposal/PPT 讲稿/Research Statement/稿子/邮件等），写作前先加载 `skills/academic-writing-constraints.md` 并附加其内容到 prompt；模型完成后用其中的总检查清单自查。核心：问题驱动单一主导问题、禁"不是X而是Y"、方法写成"任务+采用什么解决"、方法流水线输入输出环环相扣、实验四段式（目的→设置→趋势→数字→总结）、不过度 claim。
- 每完成一个任务，把可复用的提示词、脚本、learn 记录到 `research-workflow/` 相应文档，持续内化。

---

## 硬规则：派活给 hermes / Claude Code —— 开终端窗口问它们（用户明确要求 2026-09）

**背景**：DSH 不要试图把 hermes / Claude Code 当「后台无人值守的 shell 命令」跑（沙箱、TTY、交互确认都会踩坑）。
正确做法是**开一个可见的终端窗口**，在窗口里把它们唤醒，然后像问人一样把任务交代给它们。

### 开窗命令（Windows Terminal）

- **hermes（WSL 侧）**：先 `wsl -d Ubuntu` 进 WSL，再输入 `hermes` 唤醒。
  ```powershell
  Start-Process wt.exe -ArgumentList 'new-tab','--title','hermes','wsl.exe','-d','Ubuntu','--','bash','-lc','cd "<工作目录>"; hermes'
  ```
  等价手工操作：开终端 → 敲 `wsl -d Ubuntu` 回车 → 敲 `hermes` 回车。
  实测：hermes v0.11.0，`/home/stf/.local/bin/hermes`，交互式 TUI（28 tools / 84 skills，默认 `deepseek-v4-pro`）。

- **Claude Code（Windows 侧）**：终端里直接 `claude`（→ `C:\Users\我\.local\bin\claude.exe`）。
  ```powershell
  Start-Process wt.exe -ArgumentList 'new-tab','--title','claude','claude.exe'
  ```
  实测：`claude --version` → `2.1.216 (Claude Code)`。

- 一个任务一个窗口，标题写清是谁 + 干什么（如 `--title hermes-写码`），用户一眼能看到进度。
- 两边都支持非交互参数（hermes `-z "<prompt>"`、claude `-p "<prompt>"`），但**默认走可见窗口**——用户要能看见、能插话。

### 让它们看文件：直接给绝对路径

**不要**把长文粘进终端（会截断、转义出错、中文乱码）。把提示词写成文件，窗口里只给路径。

| 智能体 | 运行侧 | 给它的路径形态 | 例 |
|--------|--------|----------------|-----|
| Claude Code | Windows | Windows 绝对路径 | `C:\Users\我\Documents\DEEPSEEK\research-workflow\dispatch\0014-写码.md` |
| hermes | WSL | WSL 绝对路径 | `/mnt/c/Users/我/Documents/DEEPSEEK/research-workflow/dispatch/0014-写码.md` |

- **转换规则**：`C:\` → `/mnt/c/`，反斜杠 → 正斜杠；路径含中文/空格一律加引号。
- 提示词文件按 `research-workflow/dispatch/NNNN-主题.md` 规范写（头部标「给 hermes」或「给 Claude Code」）；
  窗口里只交代一句：`读 <绝对路径>，照它执行`。
- 交代完先让它们回一句「读到了 / 开始干」，再让它们跑；干完 DSH 读回产物验收（`templates/08-监督验收.md`）。

---

## 硬规则：有文件就发附件，不要往输入框粘贴长文

**背景**：把整篇文档粘贴进网页模型的输入框会踩三个坑（2026-09 实测）：
1. **长度上限**：ChatGPT 直接拒收长消息（返回"你提交的消息过长，请编辑后重新发送"）。实测 37K 字符被拒；重复成 74K 更必拒。
2. **内容重复**：对 ProseMirror/contenteditable 用 `element.fill()` 会**把内容写两遍**（实测 36,903 字符的 prompt 在 composer 里变成 75,830，ratio 2.055）。原因是先做了 DOM 级清空（`textContent=''`），ProseMirror 内部状态未同步，随后的插入与旧状态合并导致重复。
3. **校验失效**：只校验"长度 ≥ 90%"抓不到重复，必须**同时校验上界**（> 1.2× 即中止）。

### 正确做法
- **文档一律走附件**：用 `page.setInputFiles()` 上传到隐藏的 `input[type=file]`，等附件 chip 出现后再发消息。
  - ChatGPT：`input#upload-files`
  - Claude：`input#chat-input-file-upload-bottom`
- **消息只写"要求 + 任务 + 约束"**（通常 2–4K 字符），正文交给附件。
- **清空输入框只用键盘事件**：`Control+A` → `Delete`（重复 3 次），**不要**用 `textContent=''`。
- **插入长文本用 `keyboard.insertText()`**，不要用 `keyboard.type()`（会触发 GPT 写作块编辑器）。
- **双边界校验**：插入后校验 `0.9× ≤ len ≤ 1.2×`，越界即中止，不要抱着侥幸提交。
- **一条消息只发一次**：发前把完整 prompt 写进文件、校验长度，切勿分次补发。

参考实现：`web-llm-bridge/attach-send.mjs`（用法：`node attach-send.mjs gpt|claude <附件路径> <消息文件>`）。
