---
name: error-guard
description: Preserve clear, typed error behavior when changing a H.O.M.E. service, hook, or data-facing screen. Use for error handling and loading/empty/error state changes.
---

# Error handling

- BabyHien owns backend error contracts, safe service/hook responses, validation, and logging. Keep the repository's established typed contract; do not force a wrapper type or swallow an error.
- Do not return invented fallback records for a failed real-data query. Preserve a clear error result so the UI can distinguish failure from a valid empty result.
- Never send raw database/provider exceptions or patient-sensitive detail to the UI or ordinary logs. Preserve a safe diagnostic code where the existing contract supports it.
- BabyHien logs mutations according to the system's audit model. A failed read is not a successful data mutation and should not create a fake mutation audit event.
- Babyluong owns user-facing presentation. For a data view, implement the applicable loading, error, empty, and success states using established components and accessible retry behavior where retry is supported.
- Follow the module's existing boundary and error conventions. Introduce a page-wide boundary, error registry, translation key, or new dependency only when the task or existing architecture requires it.

Report cross-lane backend/UI requirements to Amri with the interface request.
