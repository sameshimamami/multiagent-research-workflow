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

---

## 额度规则

- 网页模型额度耗尽 → 读恢复时间 → **自动等，不询问用户**。
- 各模型额度独立（GPT / Claude / Gemini 各自算），一个用完可换另一个。

---

## 执行要点（来自实战经验）

- 网页模型回复慢/卡：GPT 思考模式 5-10 分钟/批，Claude 搜索可能卡死（服务端问题，等恢复即可）；都可用后台 job + 轮询页面最后一条回复获取。
- 文件上传给 Claude 读 PDF：先开新对话避免图片配额问题。
- 邮件/申请材料等正式产出：Claude 在指定聊天里写 → 用户审核 → 再发送。
- 每完成一个任务，把可复用的提示词、脚本、learn 记录到 `research-workflow/` 相应文档，持续内化。
