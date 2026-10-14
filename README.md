# LogVoice UI — Sentinel

A single-page, Jarvis-style HUD for the [LogVoice](../logvoice-api) API. It
subscribes to the backend's live alert stream and speaks every incoming
voice alert automatically — no click needed once the session is active.

## Run it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies `/api/**` to
`http://localhost:8080`, so start the backend first (see
[../logvoice-api/README.md](../logvoice-api/README.md) — it needs
`FISHAUDIO_API_KEY` set to actually synthesize audio).

By default the backend only allows CORS requests from
`http://localhost:5173`; if you serve this UI from elsewhere, set
`LOGVOICE_UI_ORIGIN` on the backend to match, or set `VITE_API_BASE_URL`
here to point at a differently-hosted backend.

## How auto-play works

- The page opens on an **activation gate**. Browsers block audio with
  sound from playing without a prior user gesture — clicking
  "INITIALIZE" spends that one gesture (a muted play/pause round trip)
  and opens an `EventSource` connection to
  `GET /api/log-events/stream`.
- Every alert the backend generates afterward arrives over that stream
  and is queued for playback immediately — the orb lights up, the
  transcript appears, and the audio plays with zero further interaction.
- Alerts replayed from the stream's backlog on (re)connect are shown in
  the feed but not spoken, so refreshing the page doesn't blast out a
  queue of old audio.

## Triggering alerts

The backend has no built-in log producer — it's a REST demo endpoint.
Use the **INJECT LOG** panel in the UI (bottom-right) to POST a sample
event, or from a terminal:

```bash
curl -X POST http://localhost:8080/api/log-events \
  -H "Content-Type: application/json" \
  -d '{"level":"ERROR","service":"payment-service","message":"connection pool exhausted"}'
```

Either way, the resulting alert reaches the UI over SSE and plays
automatically.
