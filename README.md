# Boston AI Tinkerers

Boston AI Tinkerers is a single-page meetup copilot for a fictional-but-plausible Boston builder night. It helps visitors:

- explore a polished meetup landing page with schedule, demos, attendee context, and local identity
- get AI-powered attendee/session recommendations for a specific goal
- generate multiple meetup-relevant build ideas with concrete implementation angles
- stay functional even without an OpenRouter key thanks to deterministic fallback behavior

## Stack

- Node.js 22+
- Express 4
- CommonJS modules
- Bun for install / verify workflows
- OpenRouter for optional AI completions

## Run locally

1. Install dependencies:
   - `bun install`
2. Optional: copy env settings from `.env.example`
3. Start the server:
   - `bun run start`
4. Open:
   - `http://localhost:8080`
5. Optional health check:
   - `curl http://localhost:8080/healthz`

If `OPENROUTER_API_KEY` is not set, the app still works in fallback mode for both AI features.

## Environment variables

- `PORT` (default: `8080`)
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL` (default: `https://openrouter.ai/api/v1`)
- `OPENROUTER_MODEL` (default: `google/gemma-3-27b-it:free`)
- `OPENROUTER_SITE_NAME` (default: `Boston AI Tinkerers`)
- `OPENROUTER_SITE_URL` (optional; sent as the OpenRouter referer header when provided)
- `ALLOW_FALLBACK_AI` (default: `true`)

## Verification

Direct project checks:

- `bun install`
- `bun run lint`
- `bun run test`
- `bun run build`

Fabro generic-build checks:

- `APP_DIR=. bash fabro/workflows/generic-build/scripts/install-deps.sh`
- `APP_DIR=. bash fabro/workflows/generic-build/scripts/lint.sh`
- `APP_DIR=. bash fabro/workflows/generic-build/scripts/test.sh`
- `APP_DIR=. bash fabro/workflows/generic-build/scripts/typecheck.sh`
- `APP_DIR=. bash fabro/workflows/generic-build/scripts/build.sh`
- `APP_DIR=. bash fabro/workflows/generic-build/scripts/format.sh`

## Container build

- `docker build -t boston-ai-tinkerers .`

## Notes

- Meetup content is seeded and intentionally richer than the original MVP so the AI features have better context.
- There is no auth, persistence, or real event backend integration.
- The UI and APIs are designed around the Boston AI Tinkerers meetup-discovery, matching, and idea-generation specs.
- The SPA and API are intended to run on the same origin, so no permissive CORS policy is enabled by default.
