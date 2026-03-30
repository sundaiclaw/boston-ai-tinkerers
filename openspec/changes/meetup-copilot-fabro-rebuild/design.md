# Design: Meetup Copilot Fabro Rebuild

## Context
The product already exists as a meetup copilot, but the user explicitly wants it rebuilt with the full OpenSpec + Fabro workflow. The project should keep the same concept while tightening the polish and ensuring the implementation is re-driven from the specs.

## Goals
- Keep the product focused on meetup navigation and collaboration.
- Make the page feel more specifically Boston / builder-community flavored.
- Preserve clearly user-facing AI value.
- Ensure the repo passes through Fabro validation and execution.

## Non-Goals
- Real attendee accounts or event backend integration.
- Multi-page auth or persistence.

## Decisions
- Continue using a Node/Express single-page app for quick deploys.
- Expand the seeded meetup content so the AI has richer context.
- Use Fabro generic-build as the implementation/verification engine.
