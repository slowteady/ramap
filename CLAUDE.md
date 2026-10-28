# 라맵 (Ramap)

한국 라멘을 장르로 찾는 지도 — ramap.kr. Next.js(App Router) + TypeScript + Tailwind v4 + shadcn/ui + Supabase + Vitest/Playwright.

- 규칙은 `.claude/rules/`가 원천이다: `project.md`(라맵 전용 — 구조·컨벤션·금지·검증·리뷰 기준)만 이 레포에서 고치고, `git.md`·`code.md`·`docs.md`·`superpowers.md`와 `.claude/hooks`·`.claude/skills`의 issue-create·issue-work·pr-review는 보일러플레이트 `slowteady/ai-issue-workflow`가 원본이다(여기서 고치지 않고 원본에서 고친 뒤 복사, 단 `.github/workflows/claude-review.yml`은 라맵에서 쓰지 않음).
- 문서 색인: `docs/README.md`. 모듈별 명세는 `docs/modules/<모듈>/`, 할지 말지 정할 후보는 `docs/backlog.md`.
- 명령: `npm run dev -- -p 3001` / `npm run build` / `npm test` / `npm run test:e2e` / `npm run format`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
