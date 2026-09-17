# Multi-Agent Research Workflow · 多智能体科研协作工作流

> A **multi-agent + web-LLM supervised** research collaboration workflow: GPT (thinking mode) proposes plans,
> Claude (max power) audits them, hermes writes & runs code, Claude Code writes reports, and the web GPT/Claude
> supervise every output through a scoring loop.
>
> 一个**「多智能体 + 网页模型监督」**的科研协作工作流：方案调研用 GPT 思考模式、方案审计用 Claude max 功率、
> hermes 写码跑码、Claude Code 出报告，网页版 GPT/Claude 全程打分监督，所有产出走「打分 → replan → 防空转 → learn」闭环。

---

## English

### What is this?

This repository packages the workflow we built and battle-tested in a real research project
(SPY VaR forecasting, see `example/`). It orchestrates **local agents (hermes, Claude Code) + web LLMs
(ChatGPT / Claude / Gemini)** with human review gates and full supervision over every artifact.

### Core Pipeline

```
GPT(thinking) proposes → Claude(max) audits → User approves → hermes writes & runs code (issues → GPT)
→ Claude Code writes editable report → Web GPT/Claude check everything (scoring table)
```

### Roles

| Role | What it does |
|------|--------------|
| **GPT** (web, thinking mode) | plan research, brainstorm, solve coding issues |
| **Claude** (web, max power) | audit plans, audit results, review all outputs (0/1 scoring) |
| **hermes** (WSL agent) | create projects, write code, run code |
| **Claude Code** | generate editable reports from experiment results |
| **DSH orchestrator** | orchestrate, write prompts, verify, maintain relations |
| **User** | review & approve plans (the gate) |

### Key Mechanisms

- **Prompt generator**: user's raw input → structured prompt → worker agent (never distorts intent; marks additions).
- **Output supervision (0/1 scoring)**: every artifact (notes/links/paper-search/ideas/PPT/code/experiments/reports)
  goes through: score → if fail, replan → max 2 rounds → escalate to human → record learn.
- **Learn memory**: pitfalls recorded; consulted before generating the next prompt.
- **Web-LLM bridge** (`bridge/`): Playwright + Chrome DevTools Protocol drives logged-in
  ChatGPT / Claude / Gemini — supports thinking mode, drawing, file upload, and robust reply-waiting.
- **Dispatch to local agents via a visible terminal window**: never drive hermes / Claude Code as
  unattended background shell commands. Open a Windows Terminal tab and wake them up:
  `wsl -d Ubuntu` → `hermes` for hermes, plain `claude` for Claude Code.
  Files are handed over as **absolute paths** — Windows paths (`C:\...`) for Claude Code,
  WSL paths (`/mnt/c/...`) for hermes — with long prompts written to `dispatch/NNNN-*.md` files.

### Repository Layout

| Path | Description |
|------|-------------|
| `docs/` | Workflow specs & prompt templates (blueprint / prompt-gen spec / note spec / orchestration / optimization / research-project workflow / 8 templates) |
| `bridge/` | Web-LLM bridge (`bridge.js`, `md2pdf.js`, `relaunch-chrome.ps1`, diagnostics) |
| `example/` | Example project: SPY VaR forecasting (end-to-end artifacts) |

### Quick Start

1. **Prepare web models**: log into ChatGPT / Claude / Gemini in a dedicated Chrome profile,
   launched with `--remote-debugging-port=9222` (see `bridge/README.md`).
2. **Follow the pipeline**: GPT proposes → Claude audits → user approves → hermes codes/runs → Claude Code reports.
3. **Supervise everything**: have web GPT/Claude score each output with `docs/templates/08-监督验收.md`.

### Attribution

If you use, reference, fork, or adapt this workflow — in a paper, report, coursework, or commercial project —
**please credit the source and star this repository**:

```
https://github.com/sameshimamami/multiagent-research-workflow
```

Keep this README and the LICENSE when forking/re-publishing.

### License

MIT © 2026 sameshimamami (see `LICENSE`)

---

## 中文

### 这是什么

本仓库把我们在一项真实研究项目（SPY VaR 预测，见 `example/`）中打磨出来的工作流项目化：
编排**本地智能体（hermes、Claude Code）+ 网页模型（ChatGPT / Claude / Gemini）**，带人工审核关卡与全产出监督。

### 核心流程

```
GPT(思考)提方案 → Claude(max)审计 → 用户审核 → hermes 写码跑码(问题回GPT) → Claude Code 出可编辑报告 → 网页GPT/Claude 全程打分检查
```

### 角色分工

| 角色 | 干什么 |
|------|--------|
| **GPT**（网页·思考模式） | 方案调研/思考/形成；写码跑码遇问题的解法 |
| **Claude**（网页·max） | 审计方案、审计结果、全程检查（0/1 打分表） |
| **hermes**（WSL） | 创建项目、写代码、跑代码 |
| **Claude Code** | 根据实验结果生成可编辑报告 |
| **DSH 编排者** | 组织编排、写提示词、验收、关系维护 |
| **用户** | 审核方案（流程关卡） |

### 核心机制

- **提示词生成器**：用户原始输入 → 结构化提示词 → 喂给干活智能体（不曲解原意、补全标注）。
- **产出监督（打分表 0/1）**：所有产出（笔记/建链/找论文/创新点/PPT/代码/实验/报告）都走
  「打分 → 不过就 replan → 最多 2 轮 → 升级给人 → 记 learn」。
- **learn 记忆**：每次踩坑记进工作流记忆，下次生成提示词前先查。
- **网页 LLM 桥接**（`bridge/`）：Playwright + CDP 驱动 Chrome 里已登录的 ChatGPT/Claude/Gemini，
  支持思考模式、画图、文件上传、稳健等回复。
- **派活给本地智能体要开可见终端窗口**：不要把 hermes / Claude Code 当后台无人值守命令跑。
  开一个 Windows Terminal 标签页把它们唤醒：hermes 先 `wsl -d Ubuntu` 再输入 `hermes`；
  Claude Code 直接敲 `claude`。**让它们看文件就直接给绝对路径**——Claude Code 给 Windows 路径
  `C:\...`，hermes 给 WSL 路径 `/mnt/c/...`；长提示词写成 `dispatch/NNNN-*.md`，窗口里只说
  「读 <绝对路径>，照它执行」。

### 目录

| 路径 | 说明 |
|------|------|
| `docs/` | 工作流规范与提示词模板（总蓝图/提示词生成规范/笔记规范/落地编排/工作流优化/研究项目工作流/8 个模板） |
| `bridge/` | 网页 LLM 桥接（bridge.js / md2pdf.js / relaunch-chrome.ps1 / 诊断脚本） |
| `example/` | 示例项目：SPY VaR 预测（全流程产物展示） |

### 快速上手

1. **准备三个网页模型**：Chrome（专用 profile）里登录 ChatGPT / Claude / Gemini，
   并带 `--remote-debugging-port=9222` 启动（详见 `bridge/README.md`）。
2. **按流程走**：GPT 提方案 → Claude 审计 → 用户审核 → hermes 写码跑码 → Claude Code 报告。
3. **全程监督**：让网页 GPT/Claude 按 `docs/templates/08-监督验收.md` 的打分表检查每个产出。

### 声明（使用与引用）

- **引用/使用请注明出处并 star**：本仓库为开源工作流，欢迎 fork 与复用。
- 若在论文、报告、课程作业或商业项目中引用/改用于本工作流，请在致谢或 README 中标注本仓库地址与名称。
- fork/二次发布时请保留本 README 的出处声明与 LICENSE。

```
https://github.com/sameshimamami/multiagent-research-workflow
```

### 许可证

MIT © 2026 sameshimamami（见 `LICENSE`）
