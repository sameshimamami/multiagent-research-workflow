# Academic Writing Constraints — Master Prompt（定稿版）

> 学术写作通用约束提示词。适用于所有学术写作任务：论文、Proposal、PPT 讲稿、Research Statement、摘要、相关工作、rebuttal 等。
> 由用户原始要求 + GPT 起草 + Claude 完整版 + GPT 审计，三方迭代定稿（2026-08）。
> 使用方式：任何学术写作任务前，把本文件内容附加到 prompt 开头，并提醒模型"写作时逐条遵守、完成后逐条自查"。

---

## Scope 适用范围 & 核心原则

Apply to all academic writing tasks — papers, proposals, PPTs, research statements, abstracts, related-work sections, rebuttal letters.
核心原则：Problem-driven（问题驱动）、logically unified（逻辑统一）、technically precise（技术准确）、evidence-grounded（证据支撑）、concise（简洁）。

---

## ① 问题与结构｜Problem & Structure

### □ 1. 单一主导问题｜One Dominant Problem, Not a List
规则：**不要罗列并列论点**。每个写作单元由一个主导问题驱动；全文各节共同服务于**同一个核心研究问题**，创新点围绕它展开，不堆叠并列贡献。
【反面】We improve efficiency, robustness, generalization, and scalability through several complementary techniques.
【正面】We address a central problem: how to adapt a model to new domains while preserving previously acquired knowledge.

### □ 2. 问题一句话说清｜State the Problem in One Sentence
规则：表述问题不绕弯，**一句话讲清"是什么问题"**，不用从属句层层铺垫。
【反面】Given the increasing complexity of real-world systems and the growing demand for scalable solutions, along with the observation that existing methods often fail under certain conditions, it becomes necessary to consider...
【正面】Existing methods degrade sharply when the domain shifts.

### □ 3. 动机问题驱动｜Motivation Is Problem-Driven
规则：动机段落**先点出要解决的问题**，再展开背景与方案；不先写背景综述再倒推问题。
【反面】Continual learning has attracted increasing attention... Many methods have been proposed... We propose a subspace-based method.
【正面】Adapting to new domains often overwrites previously learned knowledge. We study how to prevent this overwriting while still allowing effective adaptation.

### □ 4. Task → Solution → Evidence 闭环｜Closed Loop
规则：每个研究主张形成链条：**问题 → 我们要做什么 → 怎么做 → 如何验证**，四者缺一不可、顺序不乱。
【反面】Our contributions include a new architecture, an optimization strategy, and extensive experiments.
【正面】We aim to enable efficient adaptation by separating knowledge preservation from task-specific updates, and evaluate whether this separation improves both retention and adaptation.

---

## ② 语言风格｜Language Style

### □ 5. 通俗易懂｜Plain, Not Esoteric
规则：用同行能立刻理解的语言，不堆砌生僻术语；必须用新概念时先给一句话解释。
【反面】We exploit the isomorphism between the latent manifold's holonomy and the task-adaptation trajectory.
【正面】We constrain updates to a subspace that does not interfere with previously learned directions.

### □ 6. 不过度 Claim + 证据边界｜No Overclaiming; Claim Scope = Evidence Scope
规则：避免 revolution / 全面解决 / 首次 / universally 等满溢词；**结论强度与范围必须匹配实验实际验证的范围**（dataset/setting/task/assumption），区分 observed / suggests / demonstrates。
【反面】These results prove that our method is universally superior and fully solves catastrophic forgetting.
【正面】These results show improved OOD performance across the evaluated datasets and settings (4 datasets, 3 OOD settings).

### □ 7. 禁止"不是 X 而是 Y"｜No "Rather Than / Not X but Y"
规则：不用 rather than / not X but Y / 不是……而是…… 制造二元对立；直接正面陈述真实关系。
【反面】We focus on knowledge preservation rather than simply improving adaptation.
【正面】We jointly consider knowledge preservation and adaptation during model updates.

---

## ③ 方法表述｜Method Description

### □ 8. 任务优先 + 采用什么解决｜Task First, Solution Second (We aim to ... by ...)
规则：描述方法时**先说明任务目标，再说明采用什么机制解决**（We aim to ... by ...）；避免以工具/技术名词开头让任务目标消失。注意：不是绝对禁用 "We use / We leverage"（方法节里它们可以自然出现），关键是任务目标不能缺席。
【反面】We leverage null-space projection and model merging to improve continual adaptation.
【正面】We aim to preserve previously acquired knowledge during adaptation by restricting new updates to a protected subspace.

### □ 9. 方法服务于问题｜Method Serves the Problem
规则：技术细节详略由"是否解释了问题为何被解决"决定，不因方法新颖就展开无关分支。
【反面】Our method employs a three-stage pipeline combining spectral clustering, contrastive pretraining, and a novel attention-gating mechanism, each described in detail below.
【正面】We identify the subspace spanned by prior task gradients and project new updates outside it, which directly prevents overwriting.

---

## ④ 方法流水线｜Method Pipeline: Input → Output

### □ 10. 上一节输出喂给下一节｜Chained Input–Output
规则：方法按**输入→输出**顺序逐步写，每个模块的输入是上一模块的输出。允许真实存在的并行分支（dual encoders 等），但必须写明各分支的输入/输出及汇合方式；**禁止无输入输出关系的模块平铺罗列**。
【反面】Our method consists of three modules: a graph encoder, a null-space projector, and a fusion module.
【正面】The graph encoder first produces node embeddings. These embeddings are then projected into the protected subspace. The projected embeddings are finally combined with the previous-task parameters in the fusion module.

### □ 11. 每步解释"为什么"｜Justify Each Step
规则：流水线每一步不只描述"做了什么"，紧跟一句"为什么这样做"。
【反面】We then apply SVD to the gradient matrix to obtain the null space.
【正面】We apply SVD to obtain the null space, because updates confined to this space do not interfere with directions used by previous tasks.

### □ 12. 区分训练与推理流程｜Separate Training vs. Inference
规则：明确哪些步骤发生在训练、哪些在推理，不混写。
【反面】The model computes the projection, updates the parameters, and then predicts the output.
【正面】During training, the projector computes the protected subspace and constrains parameter updates. At inference, no projection is performed; the adapted parameters are used directly.

---

## ⑤ 实验分析｜Experiment Analysis: Fixed 4-Part Structure

### □ 13. 第一段：实验目的｜Purpose First
规则：先说明这个实验是为了验证/回答什么。
【正面】This experiment examines whether the proposed subspace constraint improves knowledge retention across sequential tasks.

### □ 14. 第二段：实验设置｜What Was Done
规则：说明进行的实验——数据集、对比方法、评测指标，客观陈述不夹带结果。
【正面】We evaluate on four continual-learning benchmarks against five baselines, reporting average accuracy and backward transfer.

### □ 15. 第三段：结果——先趋势后数字｜Results: Trend First, Then Numbers
规则：先一句话概括整体趋势形态（总体上升 / V 型 / W 型 / 先降后稳等），**再给支撑该趋势的具体数值**（与基线的差值、百分比，必须有数字）。趋势概括与数字在同一段内、顺序不能反。
【反面】On dataset A we get 78.3%, on B 81.2%, on C 76.9%...（上来就报数字）
【正面】Accuracy consistently increases as the number of tasks grows. Specifically, it improves average accuracy by 4.7 points over the strongest baseline (83.4% vs. 78.7%) and reduces backward-transfer degradation from 6.2% to 1.9%.

### □ 16. 第四段：总结｜Close the Loop
规则：结尾一句话说明这段实验说明了什么，呼应第一段目的，不引入未讨论的新结果。
【反面】（直接结束无总结，或引入新数据如 attention maps 观察）
【正面】These results confirm that the subspace constraint effectively preserves prior knowledge without sacrificing adaptation performance.

---

## □ 总检查清单｜Final Self-Check（写作完成前逐条自查）

- [ ] 全文/每个写作单元是否只有一个主导问题驱动，无并列论点堆叠？
- [ ] 问题是否一句话说清，无层层铺垫？
- [ ] 动机是否先问题后方案？
- [ ] 每个主张是否 Task → Solution → Evidence 闭环？
- [ ] 有无生僻术语且未加一句话解释？
- [ ] 有无 revolution / 全面解决 / 首次 / universally 等过度 claim？结论范围是否 ≤ 证据范围？
- [ ] 有无 "rather than" / "not X but Y" / "不是……而是……"？
- [ ] 方法句是否任务优先（We aim to ... by ...），任务目标未消失？
- [ ] 技术细节详略是否服务于问题？
- [ ] 方法流水线是否输入→输出环环相扣（并行分支也写清汇合）？
- [ ] 每步是否解释了为什么？
- [ ] 是否区分训练/推理？
- [ ] 每组实验是否四段式：目的 → 设置 → 结果（趋势→数字）→ 总结？
- [ ] 结果段是否先趋势概括再具体数值（非数字表罗列）？
- [ ] 总结是否呼应目的、无未铺垫新内容？
