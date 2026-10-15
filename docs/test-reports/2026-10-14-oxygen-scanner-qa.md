# Oxygen scanner browser QA — 2026-10-14

Revision: `f1d4918084f4b9da515d055471f21acc1525e243`
Scanner source SHA-256: `e21e03906ae0d813161eaca6f47c67b450accc64348fececcd0a77fe56657149`
Browser: Chromium `155.0.8059.40`; viewport 1280×900; theme light; motion no-preference.
External requests: none.

Isolated QA catalogue and locations; mocked getUserMedia/MediaStream track and QR decoder; no application Supabase client or production records.

| Criterion | Status | Evidence |
| --- | --- | --- |
| Camera stop button closes the preview and releases stream tracks | **PASS** | Mock stream requested 1 time(s); after close track.stop calls=1, video removed=true, inactive fallback shown=true. |
| Switching to the Manual tab releases the camera stream | **PASS** | Track.stop calls=1; manual input rendered=true; selected-tab class captured. |
| QR frame is decoded and dispatched through the current scan handler | **PASS** | Decoded frame count=1; match call included ID drug-a/type drug; selected item rendered=true; camera stopped after match=true. |
| Manual list filters matching item and result selection updates form state | **PASS** | Search “gauze” rendered GAUZE-10Sterile Gauze 10 cm / non_drug; Paracetamol excluded; selected non-drug item rendered=true; input cleared=true; mocked camera starts=1, track stops=1. |

No production code or production data was used. A failed assertion remains a failure; browser availability or a missing fixture signal remains unverified.
