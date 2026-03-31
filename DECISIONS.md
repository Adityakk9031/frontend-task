# Implementation Decisions

This document outlines the design decisions made for the Agent Run Panel, specifically addressing the intentionally under-specified requirements.

## 1. Agent Thoughts
**Decision:** Agent thoughts are shown as secondary, italicized text below the task label, prefixed with a thought bubble emoji (💭).
**Reasoning:** Since the target user is a financial analyst (non-technical), overwhelming them with a detailed "developer log" would be counter-productive. However, showing the "why" behind an agent's action builds trust. By keeping thoughts subtle but visible, the user can see the reasoning process without it cluttering the main task flow. If we were targeting developers, we might move these to a collapsible technical log.
**Reconsideration Signal:** If users report that the UI feels too "noisy" or if they ignore the thoughts entirely, I would consider making them collapsible or only showing them on hover/demand.

## 2. Parallel Task Layout
**Decision:** Parallel tasks are shown in a vertical list but visually grouped by a continuous vertical connector line on the left side, with a slight indentation.
**Reasoning:** A true horizontal grid for parallel tasks often fails on smaller screens or when task labels are long. By keeping them vertical but using a grouping line, we maintain a clear execution order (top-to-bottom) while explicitly signaling "these tasks belong together." This approach balances readability with the conceptual model of parallel execution.
**Reconsideration Signal:** If the number of parallel tasks exceeds 5-6, the vertical list might become too long. In that case, a compact grid or a "Parallel Group" card containing nested tasks might be more efficient.

## 3. Partial Outputs (`is_final: false`)
**Decision:** Partial outputs are shown inline as they arrive, styled as a "Streaming Output" block with a subtle pulse animation.
**Reasoning:** Analysts value seeing progress. Showing data as it's being "fetched" or "synthesized" makes the system feel faster and more transparent. Discarding them until the final result arrives makes the UI feel static and unresponsive. We style them differently from the final output to ensure the user knows they are viewing "work in progress."
**Reconsideration Signal:** If tasks emit hundreds of small partial updates (e.g., token by token), the UI will flicker. In that case, I would implement a "last N lines" log or a debounced update mechanism.

## 4. Cancelled with Reason: `sufficient_data`
**Decision:** This state is treated as a "Neutral/Positive" event. It uses a soft gray/slate color scheme with an information icon (ℹ️) and a label like "Auto-completed."
**Reasoning:** In an orchestrated pipeline, stopping a task because you already have the answer is an optimization, not a failure. Using red or orange would alarm the user unnecessarily. By labeling it "Auto-completed" and explaining that the coordinator had enough data, we frame it as the system being "smart" rather than "broken."
**Reconsideration Signal:** If users are confused why a task "stopped," I might change the label to "Optimized" or "Resolved early" and move it to a "Completed" category with a special badge.

## 5. Task Dependency Display
**Decision:** Dependencies are shown as small, non-interactive badges at the bottom of each task card. If a dependency (like `t_004`) was cancelled but the synthesis task still starts, the UI simply reflects the state: the synthesis task is "Running" because the coordinator explicitly allowed it.
**Reasoning:** For an analyst, the exact graph of IDs is less important than the "Status" of the current task. Showing the IDs provides a "paper trail" for trust, but we don't draw complex arrows which would clutter the UI. The fact that a synthesis task can complete even if a dependency was cancelled (due to `sufficient_data`) is handled by the coordinator logic; the UI's job is to reflect that the coordinator is satisfied.
**Reconsideration Signal:** If the pipeline has very complex many-to-many dependencies, the ID badges will become unreadable. I would then consider a "Step 1, Step 2" numbering system or a high-level progress bar.
