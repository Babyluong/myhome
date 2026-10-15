---
name: emil-kowalski
description: "Apply purposeful, interruptible H.O.M.E. UI motion with the active control timings, reduced-motion support and separately approved login/hub hero behavior."
---

# Motion engineering

Follow docs/DESIGN_SYSTEM.md and the approved visual brief. For control transitions use 150-250ms, with shorter immediate feedback when appropriate. Longer or continuous identity-hero movement is a separate approved behavior, not a control-transition exception inferred by the agent.

- Animate transform and opacity for ordinary UI movement; avoid layout-triggering animation unless a measured, explicitly approved interaction needs it.
- Use the established easing/spring conventions. Keep responses interruptible and do not delay submission, navigation or keyboard access.
- Give movement a purpose: spatial continuity, state feedback or the expressly approved login/hub identity composition. Operational modules remain restrained and CSS-based.
- An approved continuous hero needs an accessible pause control, stationary readable sign-in controls and a reduced-motion/static fallback. Keep WebGL confined to the approved hero boundaries.
- Handle prefers-reduced-motion in JavaScript animation as well as CSS where applicable. Verify the rendered behavior; a media rule alone does not prove a canvas or motion library stopped.
- Use will-change only when useful for an active animation. Measure performance before claiming smoothness or absence of dropped frames.

Report actual browser motion/fallback observations to Amri through BabyAaralyn's acceptance criteria.
