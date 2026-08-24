# example/ · SPY VaR 预测项目（本工作流全流程产物示例）

> 这是本工作流端到端跑通的一个真实研究项目（VaR 预测筛选任务），展示「GPT 方案 → Claude 审计 → 用户审核 → hermes 写码跑码 → Claude Code 报告 → 网页模型全程检查」的完整产物。

## 任务
预测 SPY 对数收益的 1-day-ahead VaR（α ∈ {1%, 5%, 10%}），rolling window（W=1000），对比 5 个模型：
Historical Simulation、GJR-GARCH(1,1)+skewed-t、CAViaR(SAV)、Quantile MLP、iTransformer（Chronos-2 因依赖过重跳过）。

## 核心结论
- **GJR-GARCH(1,1)+skewed-t 综合最优**：失败率 0.9%/4.9%/9.3%（最贴目标 1%/5%/10%），通过全部 Kupiec/Christoffersen/DQ 检验，MCS 唯一存活（p=1.0），2008 危机期 1% 失败率 1.01%（vs 深度模型 8%）。
- 深度模型（MLP/iTransformer）极端尾部过度保守（1%/5% 失败率偏低、10% 偏高），且 2008 危机期严重失效。
- 多 seed（5 个）验证：深度模型结论跨 seed 稳健；GJR 在 Basel 红绿灯中是唯一零红档模型。

## 产物（完整版在用户本地 `VaR-project/`）
- 报告：PDF + Markdown（含数据探索/方法论/rolling 细节/结果/统计检验/讨论/结论/补充分析/参考文献）
- 代码：`models.py` / `var_lib.py` / `run_all.py` / `descriptive.py` / `supplement.py` / `multiseed.py`
- 数据：`spy_data.csv`（log_ret / rv5 / bv，4640 日观测）
- 结果：失败率 / pinball / Kupiec / Christoffersen / DQ / DM / MCS / regime / W 敏感性 / Basel / 多 seed（CSV + 图）

> 完整数据与结果文件较大，未全部放入仓库；需要复现可联系作者，或按 `bridge/README.md` 的环境要求自行搭建后重跑。
