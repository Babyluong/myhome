# H.O.M.E. premium 3D login brief

Prepared 13 October 2026 for `SYSTEM-RULES-UPDATE-20261013`. This is a reviewable brief for a future presentation slice. The current task repairs shared style contracts and records direction; it does not implement another login redesign.

The historical intent is a premium, animated, physically dimensional H.O.M.E. gateway. The T-008 decision reserves lazy-loaded WebGL for login/hub with a static fallback; the login audit rejected a faint wireframe scene and a flat SVG replacement. A convincing 3D sculpture is part of the requested identity. Operational dashboard density and control-transition timings do not impose a title-size or hero-motion ceiling on this page.

Use the existing global palette during the current Tailwind/CSS repair. A future login palette may be scoped to the approved visual direction, with its own dark/light materials and evidence, without recoloring operational modules.

## Composition and materials

- Create an unmistakably three-dimensional H.O.M.E. sculpture with a considered silhouette, focal angle, shaped highlights, reflection/material depth and grounding. Merely rotating a primitive wireframe or substituting an SVG does not satisfy this direction.
- Treat dark and light as separately lit versions of one identity. Dark mode needs legible surface separation and highlights; light mode needs a visible sculpture, tonal edges and grounding rather than a nearly transparent object on white. Check the final composite opacity, not individual material values alone.
- Keep one coherent type and surface hierarchy between hero and form. Form fields, labels, validation and primary action remain stationary and immediately readable. Background or hero motion must not reduce their contrast.
- Size the panel by useful content space. At desktop widths of 1,024px and above, use 320px of field-content width as a review target; at 1,440px and above, use a panel width of at least 420px as a starting target. Avoid cumulative nested padding that leaves roughly 300px of usable controls inside a disproportionately large region. These are proportion checks, not a maximum-width or typography ceiling; document any deliberate variation with a rendered comparison.
- On ultrawide screens, balance sculpture, headline and form as one composition; a narrow form stranded in an oversized blank region fails review. At 320px and 390px, stack content without horizontal clipping and keep the action reachable by ordinary vertical scrolling.

## Motion, fallback and behavior

- Hero movement should reveal the sculpture's volume or respond subtly to attention. Bound pointer response and stop it from obstructing the form. Choose animation pace from that purpose; control transitions and a continuous hero have different jobs.
- Provide an accessible pause control when continuous movement is present. Reduced motion stops hero movement and uses a static scene or lightweight CSS/static visual with equivalent composition. WebGL failure, scene-module failure and low-capability rendering must leave a complete, usable form and visible brand treatment.
- Keep 3D lazy-loaded behind the existing boundary. Sign-in must remain usable while that chunk loads or fails. Do not add unsupported libraries or promise frame-rate/bundle results without measurement.
- Preserve credential validation, lockout/loading/error behavior, auth-store updates, success callbacks, redirects and recovery/access-request/support/policy links. Any required auth contract change is a separately owned backend request to Amri.
- Use no invented facility, staff or usage statistics. Test the form with isolated fixtures; no privileged credential is needed to judge presentation.

## Evidence and acceptance

Capture actual browser renders in both themes at 320x780, 390x844, 1,024x768, 1,440x900 and 3,439x1,440 CSS pixels. The last width follows the supplied ultrawide-class screenshot; record device scale, zoom, browser and actual viewport. Include a shorter desktop-height check if the form cannot fit naturally at the laptop size.

| Criterion | Required evidence |
|---|---|
| Premium 3D identity and balanced proportions | Full-page screenshots at every listed viewport, plus a sculpture/panel detail in each theme; reviewer can distinguish dimensional geometry, readable controls and intentional hierarchy |
| Readability and access | Computed text contrast, keyboard order and visible focus, 200% zoom/reflow, unclipped labels/errors/actions and mobile keyboard access; apply actual WCAG large-text thresholds without rounding PASS values |
| Meaningful motion | Browser observation or short recording of hero movement, pointer bounds and pause/resume; controls remain stable |
| Reduced motion and failures | Captures with reduced motion, WebGL unavailable and scene-load failure; form remains complete and operable without movement |
| Existing login behavior | Focused isolated regression evidence for validation, loading/error, lockout and redirect/callback behavior; no production account requirement |
| Technical integration | Lazy-chunk/build evidence, semantic alpha/shadow compilation in both themes, scoped diff and applicable checks |

Amri supplies the selected direction and exact implementation paths before dispatch. Babyluong reports presentation evidence; BabyHien owns any backend contract; BabyAaralyn verifies assigned criteria. Amri accepts against the approved direction and evidence. This brief does not guarantee visual perfection or treat a screenshot as proof of authentication security.

References: `docs/audits/login-premium-20261012.md`, `docs/DECISIONS.md` (historical T-008), `docs/DESIGN_SYSTEM.md`, and `docs/tasks/SYSTEM-RULES-UPDATE-20261013.md`.
