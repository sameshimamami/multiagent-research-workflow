---
name: multiagent-research-workflow
description: 多智能体+网页模型监督的科研协作工作流。当用户要进行研究项目（找论文/读论文/记笔记/做PPT/改代码/跑实验/写报告）并希望多智能体协作+网页模型监督时使用。核心：GPT思考模式提方案→Claude max审计→用户审核→hermes写码跑码→Claude Code报告→网页GPT/Claude全程打分监督。
---

# Multi-Agent Research Workflow

按 `docs/08-研究项目工作流.md` 的六步流程组织研究项目：
1. GPT(思考模式)提方案 → 2. Claude(max)审计 → 3. 用户审核 → 4. hermes写码跑码 → 5. Claude Code报告 → 6. 网页GPT/Claude全程检查。

## 关键规则
- **提示词生成器**：用户原始输入 → 结构化提示词 → 喂给干活智能体（见 `docs/01-提示词生成规范.md`）。
- **产出监督**：任何产出按 `docs/templates/08-监督验收.md` 打分表 0/1 检查，不过就 replan，最多 2 轮，升级给人，通过记 learn。
- **额度规则**：网页模型额度用完自动等恢复时间，不询问用户。
- **网页 LLM 桥接**：`bridge/bridge.js`（Playwright+CDP 驱动 ChatGPT/Claude/Gemini）。

## 用法
- 研究项目（论文调研/实验/报告）：按六步流程推进。
- 做 PPT/改代码/跑实验：先生成提示词（按 `docs/templates/` 对应模板）再派活。
- 需要网页模型帮忙：`node bridge/bridge.js ask <gpt|claude|gemini> "<prompt>"`、`draw <gemini|gpt> "<画图>" --out 目录`。

> 引用/使用请注明出处并 star：https://github.com/sameshimamami/multiagent-research-workflow
