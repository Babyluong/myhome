# H.O.M.E. Login Design Audit

**Task:** LOGIN-PREMIUM-20261012  
**Issued:** 13 October 2026  
**Status:** Complete; ready for user review  
**Decision:** The current login does not meet the requested premium 3D direction. Redesign is warranted. No production login code has been changed.

## Summary

The weak result has concrete causes in the screen's implementation and a mismatch in how design guidance was applied. The login's source code already supports a lazy-loaded 3D hero, but the shipped scene is a faint, generic wireframe primitive. The supplied screenshots show an unusually small login card on an ultrawide screen, a nearly invisible light-mode graphic, and a dark page whose surface layering is hard to read.

The first proposed replacement also failed the request: it showed a flat SVG network and omitted the requested 3D sculpture and animated scene. It should not be treated as an acceptable direction.

## Findings

| Priority | Finding | Evidence and effect |
| --- | --- | --- |
| Critical | Intended translucent surfaces are missing in compiled CSS. | The Tailwind theme maps semantic colors to complete `var(--...)` values in `tailwind.config.js:20–39`, while theme tokens in `src/index.css:20–25,50–55` contain hex colors. A read-only compile confirmed that opacity forms such as `bg-surface/90`, `dark:bg-surface/80`, and `bg-subtle/50` generate no CSS. This removes the intended panel and ambient layers in `src/modules/auth/pages/LoginPage.tsx:100–123,233–237`. |
| High | The sign-in controls become too narrow for the available screen. | The desktop grid allocates 42% of the page to the form region (`src/modules/auth/pages/LoginPage.tsx:205`). A 460px wrapper includes 96px of padding and contains a card with another 64px of padding (`:233–237`), leaving about 300px for fields while the region can exceed 1,400px on the provided display. |
| High | The current sculpture is made nearly transparent. | The page applies parent opacity of `.20` or `.30` (`src/modules/auth/pages/LoginPage.tsx:123`). This multiplies the scene's `.35` body opacity and `.20` wireframe opacity (`src/components/three/HeroScene.tsx:35,45`) to roughly 7–10.5% and 4–6% effective opacity. The light-theme hero consequently fades into the background. |
| High | The 3D scene lacks the lighting and materials expected of a finished brand hero. | `src/components/three/HeroScene.tsx:25–46,57,64–66` uses a basic octahedron, a wireframe sphere, and a transparent standard material. It has ambient and point lights but no reflection environment, shaped studio highlights, or grounding surface. Continuous rotation is present, but it does not make this scene feel physically crafted. |
| Medium | Desktop hero interaction is disabled. | Pointer events are disabled on both the page's hero wrapper (`src/modules/auth/pages/LoginPage.tsx:123`) and scene (`src/components/three/HeroScene.tsx:57`). The object cannot respond to a pointer. Existing animation continuously rotates the primitive meshes (`HeroScene.tsx:10–22`). |
| Medium | Typography and theme do not work as one identity. | The same fixed blue and teal materials are used in both themes (`src/components/three/HeroScene.tsx:28–29,42`), while the page background switches between light and black. The hero mixes heavy sans and italic styling while the form switches to serif (`src/modules/auth/pages/LoginPage.tsx:151–154,245`). Small secondary text further weakens legibility. |
| Critical | The previous proposal was only a flat mockup. | `home-login-directions.html` uses an SVG diagram and CSS surfaces; it contains no 3D scene or animated geometry. Its mostly form-only second direction does not meet the premium animated brief either. |

## Guidance audit

- The active H.O.M.E. design system expressly reserves lazy-loaded WebGL heroes for the login and hub, with CSS fallback and reduced-motion behavior (`docs/DESIGN_SYSTEM.md:14–18`). Real 3D on login is within the existing design rules.
- TasteSkill describes the audience as hospital operators and gives workflow pages a dense information target and low motion setting (`.agents/skills/tasteskill/SKILL.md:10–32`). Applying its 28px title ceiling and density target to the login hero flattened the identity and made the workmanlike form dominate.
- Emil Kowalski's rule against decorative movement and 400ms cap guides control transitions (`.agents/skills/emil-kowalski/SKILL.md:19–45`). It was overextended when used to reject the explicitly requested, purposeful 3D hero animation. The user's current request controls this design choice; reduced-motion support remains required.
- Impeccable says to reserve shadows for floating overlays (`.agents/skills/impeccable/SKILL.md:17`), while the H.O.M.E. system defines elevation and shadows for panels and surfaces (`docs/DESIGN_SYSTEM.md:43–50`). Apply the H.O.M.E. surface specification to product UI; a rendered 3D object should use scene lighting, not UI drop-shadow rules.
- The Babyluong charter routes screen design to the frontend owner and calls for visual evidence (`.agents/skills/babyluong/SKILL.md:9–29`). The failed first proposal was not reviewed against the user's explicit 3D requirement before presentation. This is an assignment and acceptance miss; the audit does not establish a general problem with an agent.

## Keep intact

- Preserve lazy loading, error handling, the WebGL fallback and reduced-motion handling in `src/components/three/LazyHero3D.tsx:39–51`.
- Preserve credential validation, lockout and loading behavior, auth-store updates and the success callback in `src/shared/components/forms/LoginForm.tsx:28–76`.
- Preserve redirects and the existing recovery, access-request, support and policy entry points in `src/modules/auth/pages/LoginPage.tsx:72–94,255–287,316–331`.
- Do not invent facility or staff statistics to fill the composition.

## Recommended acceptance criteria

1. Show an unmistakably dimensional H.O.M.E. sculpture, using convincing highlights, reflections, material depth and an intentional focal angle. A wireframe or flat CSS/SVG drawing alone does not qualify.
2. Give dark and light themes separate, coherent lighting and background treatments; render the sign-in panel as an opaque, properly sized surface in both.
3. Animate the 3D scene with purposeful, restrained movement and a bounded pointer response. Provide an explicit pause control; automatically stop hero movement under `prefers-reduced-motion`.
4. Keep sign-in fields and primary action stationary, clear, keyboard accessible and readable on ordinary laptops and ultrawide displays. Stack without clipping on a 320px-wide screen.
5. Keep 3D code lazy-loaded and test the static fallback when WebGL or the scene module is unavailable.
6. Review actual rendered screenshots in dark and light at 320px, 390px, 1,024px, 1,440px and the supplied 3,439px-class ultrawide width. Confirm scene movement and reduced-motion behavior in a browser before accepting.

## Scope and decision

This review covered the supplied screenshots, the active design rules, the existing login and 3D source, and one in-memory Tailwind compile check. The source audit found the surface-style compilation problem but did not change it. The current acceptance decision is **revise**. Production work should be scoped to the login presentation and this confirmed styling defect while preserving the authentication and routing behaviors listed above.

The audit does not recommend changing shared design skills from this one page. If H.O.M.E. wants a lasting login exception, record it as a scoped future policy proposal with explicit approval and keep dashboard density guidance for operational modules.
