# CLAUDE.md

## Purpose
This is the master reference ("brain") for Claude when working in the **InnoVision** repository. It documents the product, architecture, data models, routes, conventions, and rules of engagement. Read this before making changes.

---

## 1. Product Overview
InnoVision is an AI-powered adaptive learning platform. It dynamically generates structured, chapter-wise courses on any topic and layers on gamification, community, certification, and monetization.

**Core capabilities:**
- AI course generation from a topic/prompt (Gemini / OpenAI)
- YouTube-to-course conversion (transcript → roadmap → chapters → quizzes)
- Content ingestion (PDF, EPUB, text → course)
- Instructor Studio (WYSIWYG course builder) with admin approval before publish
- Adaptive roadmaps with three learning modes (Fast, Balanced, In-Depth)
- Interactive tasks: quizzes, fill-in-the-blanks, matching
- In-browser code editor with execution and website generation
- Gamification: XP, levels, streaks, badges, daily quests, leaderboard, combo multipliers
- Community discussions with nested replies, voting, and delete
- Course reviews and ratings
- Certificates with unique IDs and public verification
- Premium subscriptions (Razorpay) with a 7-day free trial
- Notifications (in-app + web push study reminders)
- Analytics, recommendations, offline support, multi-language (Google Translate)

**Production domains:** innovision7.live, innovision-open-source.vercel.app, inno-vision.vercel.app

---

## 2. Tech Stack
- **Framework:** Next.js 15 (App Router) with Turbopack; React 19
- **Language:** JavaScript (JSX). No TypeScript. Path alias `@/*` → `src/*` (`jsconfig.json`)
- **Styling:** Tailwind CSS v4, `tailwindcss-animate`, `cn()` helper (`clsx` + `tailwind-merge`)
- **UI primitives:** Radix UI wrapped as shadcn-style components in `src/components/ui`
- **Auth:** Firebase Authentication (Google, GitHub, Email/Password)
- **Database:** Cloud Firestore — client SDK (`src/lib/firebase.js`) + Admin SDK (`src/lib/firebase-admin.js`)
- **AI:** `@google/generative-ai` (Gemini) and `openai`
- **Payments:** Razorpay
- **Email:** Brevo (`src/lib/brevo.js`), emailjs
- **Animation/3D:** Framer Motion, GSAP, three.js / react-three-fiber, canvas-confetti, lottie
- **Docs/parsing:** pdf-parse, epub2, youtube-transcript, jspdf, react-markdown + remark-gfm
- **Testing:** Vitest + Testing Library + fast-check, happy-dom environment
- **Analytics:** @vercel/analytics
- **Storage helpers:** idb (IndexedDB) for offline, lru-cache

---

## 3. Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack). **Long-running — do not run in automation.** |
| `npm run build` | Production build. Use to verify changes compile. |
| `npm run start` | Start production server. |
| `npm run lint` | ESLint (`next lint`). |
| `npm run format` | Prettier across the repo. |
| `npm run test` | Vitest once (`vitest --run`). Prefer over watch. |
| `npm run test:watch` | Vitest watch mode. |

> Note: `next.config.mjs` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to `true`. Builds will not fail on lint/type issues, so run `npm run lint` explicitly.

---

## 4. Folder Structure
```
src/
  app/                 # App Router: pages + API routes
    api/               # Backend route handlers (route.js)
    (feature dirs)/    # Page routes (page.jsx)
    layout.jsx         # Root layout + provider tree
    page.jsx           # Landing page
    globals.css        # Global styles / Tailwind
  components/
    ui/                # shadcn-style Radix primitives (button, card, dialog, ...)
    Navbar/            # Navbar, DesktopNav, MobileMenu, UserMenu, NotificationBell
    Landing/           # Marketing landing sections
    Tasks/             # Quiz, FillUps, Match, TaskDecider
    gamification/      # XP charts, streaks, badges, level-up, combo, quests
    certificates/      # CertificateDialog, CertificateGenerator (canvas)
    chapter_content/   # Chapter viewer, bookmark, loading/error states
    reviews/           # Course reviews UI
    studio/            # WYSIWYG editor, templates, resources
    profile/, dashboard/, premium/, chat/, share/, export/, skeletons/, settings/, roadmap/, Home/
    (loose components).jsx
  contexts/            # auth.js, xp.jsx, nightMode.jsx, notifications.js
  hooks/               # use-mobile, useOffline, usePersonalization
  lib/                 # firebase, premium, notifications, ingestion, curriculum data, utils, ...
  scripts/             # standalone DB debug scripts (check_db, deep_search_courses, ...)
```

**Rules:** Respect this structure. Reuse `src/components/ui` primitives before adding new ones. Do not create unnecessary files. Keep business logic out of UI where practical.

---

## 5. Provider Tree (src/app/layout.jsx)
Wraps the whole app in this order:
```
AuthProvider → XpProvider → NightModeProvider → NotificationProvider → LoaderProvider
  → Navbar, <main>{children}</main>, OfflineIndicator, NotificationChecker, Toaster
```
- Fonts: Roboto + Roboto Mono via `next/font/google`.
- `<main>` has `pt-16` to offset the fixed Navbar.
- Toasts use `sonner` (`<Toaster richColors />`). Use `import { toast } from "sonner"`.

---

## 6. Contexts
- **`auth.js`** (`useAuth`): Firebase auth state. Exposes `user`, `loading`, `googleSignIn`, `githubSignIn`, `emailSignUp`, `emailSignIn`, `resetPassword`, `logout`, `getToken`. On login it syncs a `session` cookie via `/api/auth/session` and upserts a user doc in Firestore (`users/{email}`). `user` merges the Firebase user with the Firestore user doc.
- **`xp.jsx`** (`xpContext`): XP/level/streak state, `awardXP(action, value, useCombo)`, `getXp()`, combo multiplier, badge awarding, level-up modal, milestone confetti. Polls `/api/gamification/stats` every 10s.
- **`nightMode.jsx`** (`useNightMode`): blue-light filter toggle (separate from light/dark theme).
- **`notifications.js`** (`useNotifications`): in-app notifications, `unreadCount`, `markAsRead`, `markAllAsRead`, `deleteNotification`. Polls `/api/notifications` every 60s.

Theme (light/dark) is managed in `Navbar.jsx` via `localStorage` + `document.documentElement` class, not a context.

---

## 7. Authentication & Sessions
- Client auth via Firebase (`src/lib/firebase.js`). Providers: Google, GitHub, Email/Password.
- On sign-in, the Firebase **ID token** is POSTed to `/api/auth/session` and stored as an httpOnly `session` cookie (5-day maxAge, `secure` in production, `sameSite: lax`).
- Server-side, use **`getServerSession()`** from `src/lib/auth-server.js`. It:
  1. Reads the `session` cookie.
  2. Verifies the token with Firebase Admin (`getAuth().verifyIdToken`) when Admin SDK is initialized.
  3. Falls back to manual JWT payload decode if Admin is unavailable.
  4. Returns `{ user: { email, name, image, uid } }` or `null`.
- **The primary user key throughout Firestore is the user's email.** Prefer `session.user.uid || session.user.email` for ownership checks where both may apply.

---

## 8. Firestore Data Model
Top-level collections and notable subcollections:

- **`users/{email}`** — profile: `name`, `email`, `image`, `provider`, `xp`, `roadmapLevel {fast,inDepth,balanced}`, `xptrack`, `createdAt`, premium fields (`isPremium`, `premiumActivatedAt`, `premiumExpiresAt`, `premiumPaymentId`), `bookmarks`.
  - **`users/{email}/roadmaps/{courseId}`** — AI-generated courses. Fields include `chapters[]` (each with `completed`, `title`, `content`, optional `duration`), `process` ("completed" when done), `courseTitle`/`title`.
  - **`users/{email}/youtube-courses/{id}`** — YouTube-generated courses.
  - **`users/{email}/studio-courses/{id}`** — Studio drafts.
  - **`users/{email}/certificates/{id}`** — issued certificates (see §11).
- **`gamification/{email}`** — `xp`, `level`, `streak`, `badges[]`, `rank`, `achievements[]`, `lastActive`. Level = `floor(xp/500)+1`.
- **`published_courses/{id}`** — courses submitted from Studio. Approval fields: `status` ("pending"|"published"|"rejected"), `approvalStatus` ("pending"|"approved"|"rejected"), `submittedAt`, `publishedAt`, `reviewedBy`, `reviewedAt`, `rejectionReason`, `createdBy`, `chapters[]`.
- **`discussions/{id}`** — community posts: `title`, `content`, `category`, `authorId`, `authorName`, `authorImage`, `upvotes`, `downvotes`, `replies`, `views`, `isPinned`, `isLocked`, `courseId`, `createdAt`, `updatedAt`.
- **`discussionReplies/{id}`** — `discussionId`, `content`, `authorId`, `authorName`, `authorImage`, `parentReplyId` (null = root; enables nesting), `createdAt`.
- **`discussionVotes/{discussionId}_{userId}`** — `type` ("upvote"|"downvote"), `userId`, `discussionId`, `createdAt`.
- **`notifications/{id}`** — `userId`, `title`, `body`, `type` (system|achievement|progress|premium|info|warning), `link`, `read`, `createdAt`.
- **`reviews`** — course reviews/ratings (with vote/report subroutes).

When adding fields, keep them optional and backward-compatible; existing docs may lack them.

---

## 9. Pages (src/app)
Public/marketing: `/` (landing), `/features` (+ `/features/{analytics,lms,multimodal,offline,personalization,projects}`), `/demo`, `/contact`, `/privacy`, `/terms`, `/research`, `/curriculum`, `/test-curriculum`.

Auth: `/login`, `/unauthorized`.

Learning: `/roadmap` (dashboard), `/roadmap/[id]`, `/courses`, `/courses/[id]`, `/ingested-course/[courseId]`, `/studio-course/[courseId]`, `/youtube-course` (+ `/youtube-course/[id]`), `/chapter-test/[roadmapId]`, `/code-editor`.

Creation: `/generate` (AI), `/studio` (instructor studio), `/content-ingestion`.

Engagement: `/gamification`, `/analytics`, `/notifications`, `/feedback`, `/profile` (+ `/profile/certificates`), `/verify/[certificateId]` (public certificate verification).

Monetization: `/premium`.

Admin: `/admin/courses` — super admin approval dashboard (see §12).

Community: `/community`, `/community/new`, `/community/[id]`, `/community/debug`.

---

## 10. API Endpoints (src/app/api — App Router `route.js`)
Handlers export named HTTP methods and return `NextResponse.json(...)`.

- **auth:** `auth/session` (POST set cookie / DELETE clear)
- **ai:** `ai/chat`, `ai/generate`
- **user:** `getuser`, `getrank`, `user/profile`, `user/update-profile`, `user_prompt`, `chapter-prompt`
- **roadmap:** `roadmap` (CRUD), `roadmap/all`, `roadmap/bulk`, `roadmap/duplicate`, `roadmap/export`, `roadmap/[id]` (+ `archive`, `unenroll`)
- **chapters:** `get-chapter`, `get-chapter/[roadmapId]/[chapter]`, `debug-chapter/[roadmapId]/[chapter]`
- **tasks:** `tasks`, `tasks/reminders`
- **courses (public):** `courses/public`, `courses/public/[id]`, `courses/[id]` (+ `check-enrollment`, `enroll`)
- **studio:** `studio/save`, `studio/publish` (submits as pending), `studio/enhance`, `studio/courses`, `studio/courses/[id]`
- **admin:** `admin/courses/pending` (GET), `admin/courses/approve` (POST approve/reject) — super-admin gated
- **ingestion:** `content/ingest`, `ingested-courses`, `ingested-courses/[courseId]` (+ `chapters`, `progress`)
- **youtube:** `youtube/info`, `youtube/transcript`, `youtube/summarize`, `youtube/roadmap`, `youtube/generate-course`, `youtube/course/[id]`, `youtube/quiz`, `youtube/exercises`, `youtube/status`
- **code:** `code/execute`, `code/generate-website`
- **gamification:** `gamification/stats` (GET reads/updates streak; POST awards XP+badges), `activity`, `award-badge`, `daily-quests`, `fix-streak`, `leaderboard`, `reset`, `test`, `xp-history`
- **certificates:** `certificates/generate` (POST), `certificates/[userId]`, `certificates/verify/[certificateId]`
- **community:** `community` (GET list / POST create), `community/[id]` (GET + increments views), `community/[id]/vote` (GET user vote / POST toggle), `community/[id]/replies` (GET / POST, supports `parentReplyId`), `community/[id]/replies/[replyId]` (DELETE), `community/[id]/delete` (DELETE, cascades replies+votes)
- **reviews:** `reviews`, `reviews/[reviewId]` (+ `vote`, `report`)
- **premium:** `premium/create-order`, `premium/verify-payment`, `premium/status`
- **notifications:** `notifications` (GET list / PATCH mark-all), `notifications/[id]` (PATCH read / DELETE)
- **bookmarks:** `bookmarks`
- **recommendations:** `recommendations`
- **personalization:** `personalization`
- **analytics:** `analytics`, `analytics/share`
- **progress:** `progress/sync`
- **multimodal:** `multimodal/audio`, `multimodal/video`
- **lms:** `lms/sync`
- **research:** `research/export`

---

## 11. Certificates
- Generated in `src/app/api/certificates/generate/route.js` from `users/{email}/roadmaps/{courseId}`.
- Requires all chapters completed. Idempotent: returns existing cert if already issued.
- Fields: `certificateId` (nanoid 12), `userId`, `courseId`, `courseTitle`, `userName`, `completionDate`, `chapterCount`, `totalHours`, `issuedAt` (serverTimestamp), `verified`.
- `totalHours` is derived from chapter `duration` (number = minutes; string parses "hours"/"mins") or estimated from content word count (200 wpm), min 0.5h.
- Rendered client-side to a canvas in `CertificateGenerator.jsx` (download/share). Verify URL pattern: `/verify/{certificateId}`.
- Backward compatibility: older certs may lack `totalHours` → display "N/A".

---

## 12. Admin / Course Approval
- **Super admin email:** `vickkie028@gmail.com` (hardcoded constant in the admin API routes and UI).
- Studio publish (`studio/publish`) saves courses as `status: "pending"`, `approvalStatus: "pending"` and notifies the creator "submitted for review".
- Admin dashboard at `/admin/courses` (gated client-side; redirects non-admins) lists pending courses via `admin/courses/pending`.
- Approve/reject via `admin/courses/approve`: on approve sets `status: "published"`, `approvalStatus: "approved"`, `publishedAt`; on reject stores `rejectionReason`. Both notify the instructor.
- Public course listing (`courses/public`) filters `status == "published" AND approvalStatus == "approved"` — only approved courses are browsable.
- Navbar surfaces an "Admin Dashboard" link (Crown/Shield) only when `user.email === SUPER_ADMIN_EMAIL`.
- To add more admins, convert the single-email constant to an allowlist array and check membership in all three places.

---

## 13. Gamification System
- Stats live in `gamification/{email}`. XP rewards per action defined in `gamification/stats` POST (`complete_chapter:5`, `complete_course:50`, `perfect_quiz:2`, `view_course:10`, `generate_course:10`, etc.).
- Level = `floor(xp/500)+1`. Streak logic compares `lastActive` day-diff (0 keep, 1 increment, >1 reset).
- Badges auto-awarded in `checkBadges` (e.g. `first_course`, `perfect_score`, `week_streak`, `month_streak`, `master`, `legend`, `night_owl`, `early_bird`, `scholar`, `bookworm`).
- New badges and level-ups trigger `createNotification`. Client shows confetti/toasts/level-up modal via `XpProvider`.
- Combo multiplier increments on correct answers; resets on wrong/timeout.

---

## 14. Premium & Trial (src/lib/premium.js)
- New users get a **7-day free trial** from `users/{email}.createdAt`.
- `isPremiumUser` checks `isPremium && premiumExpiresAt > now`.
- `checkFullAccess` = premium OR in-trial.
- Free-tier limits: AI courses ≤ 3, YouTube courses ≤ 5, Studio courses ≤ 1. Premium is effectively unlimited (AI capped at 100).
- Payments via Razorpay: `premium/create-order` → checkout → `premium/verify-payment` → `activatePremium(email, months, paymentId)` sets premium fields and notifies the user.

---

## 15. Coding Conventions
- Client components begin with `"use client";`. Server route handlers do not.
- Always import via `@/` alias (e.g. `import { Button } from "@/components/ui/button"`).
- Use existing `ui` primitives and the `cn()` helper for class merging.
- Icons from `lucide-react`.
- Toasts via `sonner`.
- Descriptive names; small, focused functions; avoid duplicated logic.
- Comment only non-obvious logic.
- Match the style of neighboring files.

---

## 16. API Route Conventions
- Get DB with `getAdminDb()` and null-check before use (Admin SDK may be unconfigured in some envs).
- Import Admin helpers from `@/lib/firebase-admin` (`getAdminDb`, `FieldValue`, `adminDb`).
- Authenticate protected routes with `getServerSession()`; return `401` if missing, `403` if not permitted, `404` if resource missing, `400` for bad input.
- Wrap logic in try/catch; `console.error` with context; return meaningful JSON errors.
- Prefer batched writes (`adminDb.batch()`) for multi-doc mutations (see community delete cascade).
- Avoid queries needing composite indexes when in-memory sort over a small result set suffices (existing pattern in community & replies).
- Use `FieldValue.increment()` for counters (votes, views, reply counts).

---

## 17. Error Handling
- Handle all failure cases; never silently swallow errors.
- Validate and sanitize all inputs.
- Return correct HTTP status codes and human-meaningful messages.
- Optimistic UI updates on the client must roll back on failure (see community voting).

---

## 18. Security
- Never expose secrets/API keys. Use env vars (`.env`, documented in `.env.example`).
- Never read or echo secret values from `.env` back into responses or logs.
- Verify ownership server-side before mutating/deleting user content (discussions, replies, roadmaps).
- Admin actions must be validated server-side against the super-admin email, not just hidden in the UI.
- Firestore security rules should allow authenticated users to read/write only their own data.
- Guard against XSS in rendered markdown/user content.
- Flag `.env`, credentials, and key files before committing.

---

## 19. Performance
- Minimize Firestore reads/writes; batch related writes.
- Avoid unnecessary React re-renders; memoize where it matters.
- Poll intervals already exist (XP 10s, notifications 60s) — do not add redundant polling.
- Consider scalability of loops, queries, and canvas/animation work.

---

## 20. Testing
- Tests are co-located as `*.test.js` (e.g. `certificates/generate/route.test.js`, `roadmap/[id]/route.test.js`, `user_prompt/route.test.js`).
- Vitest with happy-dom; Testing Library for components; fast-check for property-based tests.
- Ensure new code does not break existing behavior; add edge-case and error-path coverage for new logic.
- Run `npm run test` before finishing.

---

## 21. Git
- Small, logical commits; only commit when explicitly asked.
- Never rewrite unrelated code or reformat untouched files.
- Preserve formatting; do not mass-reformat.
- Flag files that may contain secrets before staging.

---

## 22. Environment Variables
Exact names (see `.env.example`):
- **Firebase client:** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_AUTH_DOMAIN`, `NEXT_PUBLIC_PROJECT_ID`, `NEXT_PUBLIC_STORAGE_BUCKET`, `NEXT_PUBLIC_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_APP_ID`, `NEXT_PUBLIC_MEASUREMENT_ID`
- **Firebase Admin:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (quoted, with escaped `\n` newlines — code does `.replace(/\\n/g, "\n")`)
- **AI:** `GEMINI_API_KEY` — **a single key used for both** the Gemini SDK and the OpenAI-compatible client. There is no separate OpenAI key.
- **Payments:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- **Email (EmailJS):** `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_USER_ID`
- **Email (Brevo):** `BREVO_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME`
- **Misc:** `NODE_ENV`

Production values also live in the Vercel project settings. Mirror any new var in `.env.example` (without real values).

---

## 23. When Writing Code
Always:
- Think before coding; read surrounding files first.
- Follow existing patterns and reuse existing components/utilities.
- Keep changes minimal, focused, and production-ready.
- Verify with `npm run build` and `npm run test` where applicable.
- Explain significant design decisions and any breaking changes.

## 24. When Unsure
Ask clarifying questions for scope changes or destructive actions instead of assuming.

## 25. Goal
Write clean, maintainable, production-ready code that integrates naturally with the existing InnoVision codebase.
