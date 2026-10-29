# SHADOWMIND

An interactive psychology education website built with React, TypeScript, Vite, and Tailwind CSS. Its ivory and terracotta editorial design includes locally bundled Fraunces and DM Sans fonts, frosted panels, and an original botanical SVG illustration.

## What works

- Six evidence-informed lessons: manipulation awareness, gaslighting, persuasion, cognitive biases, emotional intelligence, and boundaries.
- Three fictional interactive case studies with contextual feedback.
- A five-question quiz with explanations, review, retakes, and best-score tracking.
- Six reversible flashcards with familiarity tracking.
- A guided workplace conversation exercise with response-specific feedback.
- Browser-local learning progress, a private-session option, and confirmed data deletion.
- Mobile navigation, keyboard-accessible lesson dialogs, reduced-motion support, and a reading room with source links and support guidance.

This is education, not therapy, diagnosis, or personalized safety advice. Conversation responses are authored scenarios, not an AI chatbot. Progress stays in the current browser; it does not sync across devices. Clearing progress does not clear browser history.

## Cloud development

Use the existing checkout at `/workspace/shadowmind`. This task is already isolated; no additional Git worktree is needed.

```sh
npm ci
npm run dev
```

Vite listens on port 5173. The cloud host must support port exposure to supply a public preview. This onboarding chat currently has no public preview tool. All development and validation can run in the cloud; no installation on a public computer is required.

## Validation

```sh
npm run build
npm test
```

The production build runs TypeScript checking and Vite bundling. Playwright tests run against the production preview on port 4173. The cloud includes Chromium at `/usr/bin/chromium`; `playwright.config.ts` uses it, avoiding a separate browser download. On another host, set `CHROMIUM_PATH` to an installed Chromium executable or install the Playwright Chromium browser and remove the executable override.

Browser tests cover lesson completion and persistence, data deletion, quiz scoring, case feedback, flashcards, conversations, private mode, malformed storage recovery, mobile navigation, dialog keyboard dismissal, responsive overflow, and runtime errors. Test screenshots are generated in the ignored `test-results/` folder.

No backend, database, API key, or secret is needed. Fonts and application assets are bundled locally. External source and support links open only when selected.

## Complete academy curriculum

The **Academy** navigation item opens the expanded knowledge system. Existing Learning paths and Practice studio remain available, and their original progress key is preserved. New academy progress uses `shadowmind-academy-v1`; the shared Private session option prevents new writes, and Clear all learning data removes both progress keys.

Implemented: all 55 structured curriculum lessons across five complete modules, 30 conversation decoders, 15 branching cases with at least three decisions on every path, 10 bias demonstrations, 100 academy quiz questions, 100 glossary terms and matching revision cards, and 30 toolkit responses. This continuation adds 43 lessons, 12 cases, and 58 questions while retaining existing IDs and stored progress. The home page loads the academy on demand to avoid downloading all curriculum data before it is needed. Each full lesson contains definitions, mechanisms, two fictional examples, dialogue, recognition guidance, limitations, consequences, responses, alternatives, takeaways, a knowledge check, related links and sources. Content is separated into typed modules under `src/academy/`.

The numerical curriculum, case-study, and quiz targets are complete. Read [CONTENT_INVENTORY.md](CONTENT_INVENTORY.md) for module coverage, individual lesson word counts, counts, and limitations. No empty cards are presented as finished lessons. The quiz comprises 55 lesson checks, 30 shared decoder questions, and 15 further application questions. Flashcards reuse glossary content; shared material is not counted twice as distinct questions. Bias demonstrations are instructional choices, not controlled studies or diagnostic measurements. Difficulty levels are editorial guides.

```sh
npm run validate:content
npm run build
npm test
```

Validation generates the inventory and checks IDs, required teaching fields, curriculum numbers 1–55, exact module coverage, integer answer indices, internal relationships, unreachable case nodes, cycles, and three-decision minimum paths. The 19-test suite includes original regressions plus expanded-module navigation, pre-expansion academy progress and bookmarks, mobile related lessons, and new case decisions. Browser tests exercise academy search, related links, persistence, compatibility with original progress, scoring and incorrect-answer review, branch consequences, flashcards, bookmarks, glossary search, privacy, mobile overflow, and accessibility. Automated checks cannot certify psychological validity or replace expert editorial review.

All 16 reference URLs were attempted through the configured cloud proxy on 29 October 2026. All were blocked by outbound domain policy (HTTP CONNECT 403); none is labelled verified reachable. See [SOURCE_CHECKS.md](SOURCE_CHECKS.md) and the machine-readable `source-checks.json` for observed results. No access rules were bypassed or changed. Citations identify known publications and authoritative resources, with an explicit register of limitations. Review references and content independently before treating the academy as an academically reviewed publication. Malayalam explanations are deferred pending qualified language review.

## Preserve your code before cloud access ends

Do not rely on this chat or a trial workspace as the only copy. A fresh source-only archive, `shadowmind-complete-source.tar.gz`, is provided beside this checkout for download (also refreshed as `shadowmind-source.tar.gz`). It excludes dependencies, build outputs, browser profiles, and credentials. Store it somewhere you control; on a public computer, transfer it to personal storage and remove local downloads after confirming your copy.

To preserve the source in GitHub from the cloud terminal, review the changes and commit them before pushing to a branch. These commands publish repository code, not a live website; run them only when ready to share the changes with the repository’s audience:

```sh
cd /workspace/shadowmind
git status --short
git switch -c academy-complete
git add README.md CONTENT_INVENTORY.md SOURCE_CHECKS.md source-checks.json .gitignore index.html package.json package-lock.json tsconfig.json vite.config.ts playwright.config.ts src tests scripts
git commit -m "Complete SHADOWMIND curriculum, branching cases, and quiz bank"
git push -u origin academy-complete
```

Then open a pull request on GitHub from `academy-complete` to `main`. Confirm the files are visible in that branch before assuming preservation is complete. A source backup is separate from deploying the public website. These commands do not deploy a website. No payment card, private secret, or API key is required to run this application.


## Download the preservation branch from GitHub

The source-preservation branch is `backup/complete-academy-2026-10-29` in the existing repository `Ziyan35-Zi/shadowmind`. Treat the backup as secure only after the remote commit has been verified; branch creation or a local commit alone is insufficient.

Open `https://github.com/Ziyan35-Zi/shadowmind`, select `backup/complete-academy-2026-10-29` in the branch selector, then choose **Code → Download ZIP**. The ZIP includes the source, inline illustration assets, curriculum, package lockfile, configuration, documentation, and tests. Installed dependencies, generated build outputs, browser test artifacts, and local credentials are intentionally excluded. Rebuild in a development environment using `npm ci`, `npm run validate:content`, and `npm run build`; `npm test` uses the documented Chromium setup. No installation on a public computer is required to download and store the ZIP.

The existing repository and its history are preserved; the backup branch does not overwrite `main`. The connected account must permit HTTPS Git push to this repository for remote preservation to succeed. Source publication does not verify academic references and does not create a public website deployment.
