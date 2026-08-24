# Multi-Agent Research Workflow（多智能体科研协作工作流）

一个**「多智能体 + 网页模型监督」**的科研协作工作流：方案调研用 GPT 思考模式、方案审计用 Claude max 功率、
hermes 写码跑码、Claude Code 出报告，网页版 GPT/Claude 全程监督打分，所有产出走 **「打分 → replan → 防空转 → learn」** 闭环。

> 本仓库由 DSH 编排者与网页模型（ChatGPT/Claude/Gemini）协作实测打磨而来，
> 已在真实的「SPY VaR 预测」研究项目上端到端跑通（见 `example/`）。

---

## 核心流程

```
GPT(思考模式)提方案 → Claude(max功率)审计 → 用户审核 → hermes写码跑码(问题回GPT) → Claude Code出报告(可编辑) → 网页GPT/Claude全程检查
```

| 角色 | 干什么 |
|------|--------|
| **GPT**（网页·思考模式） | 方案调研/思考/形成；写码跑码遇问题的解法 |
| **Claude**（网页·max） | 审计方案、审计结果、全程检查（打分表） |
| **hermes**（WSL） | 创建项目、写代码、跑代码 |
| **Claude Code** | 根据实验结果生成可编辑报告 |
| **DSH 编排者** | 组织编排、写提示词、验收、关系维护 |
| **用户** | 审核方案（流程关卡） |

## 核心机制

- **提示词生成器**：用户的原始输入 → 结构化提示词 → 喂给干活智能体（不曲解原意、补全标注）。
- **产出监督（打分表 0/1）**：所有产出（笔记/建链/找论文/创新点/PPT/代码/实验/报告）都走
  「打分 → 不过就 replan → 最多 2 轮 → 升级给人 → 记 learn」。
- **learn 记忆**：每次踩坑记进工作流记忆，下次生成提示词前先查。
- **网页 LLM 桥接**（`bridge/`）：Playwright + CDP 驱动 Chrome 里已登录的 ChatGPT/Claude/Gemini，
  支持思考模式、画图、文件上传、等回复。

## 目录

| 路径 | 说明 |
|------|------|
| `docs/` | 工作流规范与提示词模板（总蓝图/提示词生成规范/笔记规范/落地编排/工作流优化/研究项目工作流/8 个模板） |
| `bridge/` | 网页 LLM 桥接（bridge.js / md2pdf.js / relaunch-chrome.ps1 / 诊断脚本） |
| `example/` | 示例项目：SPY VaR 预测（全流程产物展示） |

## 快速上手

1. **准备三个网页模型**：Chrome（专用 profile）里登录 ChatGPT / Claude / Gemini，
   并带 `--remote-debugging-port=9222` 启动（详见 `bridge/README.md`）。
2. **按流程走**：向 GPT 提方案 → 让 Claude 审计 → 用户审核 → hermes 写码跑码 → Claude Code 报告。
3. **全程监督**：让网页 GPT/Claude 按 `docs/templates/08-监督验收.md` 的打分表检查每个产出。

## 声明（使用与引用）

- **引用/使用请注明出处并 star**：本仓库为开源工作流，欢迎 fork 与复用。
- 若在论文、报告、课程作业或商业项目中引用/改用于本工作流，请在致谢或 README 中标注本仓库地址与名称。
- fork/二次发布时请保留本 README 的出处声明与 LICENSE。
- 默认 **MIT** 许可，详见 `LICENSE`。

## License

MIT © 2026 sameshimamami（见 `LICENSE`）
