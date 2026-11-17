# Coach loop + editable Support page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the coach from a one-shot report into a loop that works one focus at a time until it's fixed, and make the Support page a block editor the admin controls.

**Architecture:** Client code goes into a new module `v23.js` (coach loop) and `v24.js` (support builder), appended to `/home/claude/build/app.html` before `\ninit();\n` like v13–v22, overriding functions by reassignment. Server changes go into `/home/claude/build/edge/api/index.ts`: extra fields in the existing `analyze` output, plus new actions `dispute`, `support_save`, `support_img`. State lives in `S.set` (synced meta) and `app_config`.

**Tech Stack:** Vanilla JS single-file app, Supabase (auth, Postgres, Storage, Edge Function in Deno/TS), Gemini via `gemini(parts, json, temperature, fast)`.

**Spec:** "Wasabi coach: research map", section "The coach after research" — https://claude.ai/artifact/WNTsLmMgWkaP7WiHGV5hav — plus Adil's message of 17 Nov 22:24 for the Support page ("add images, placement of text and photo, add new ones").

## Global Constraints

- Build: `python3 build.py` → `web/index.html`; deploy = copy to repo `index.html`, set `BUILD_ID`, bump `sw.js` cache name (`ielts-v39` → next), commit as `Dafypig228 <Dafypig228@users.noreply.github.com>` with the session attribution lines, push.
- Edge deploy: commit `supabase/functions/api/index.ts`, push, deploy stub `import "https://raw.githubusercontent.com/Dafypig228/wasabi/<sha>/supabase/functions/api/index.ts";` with verify_jwt false. Syntax check: `npx --yes esbuild index.ts --format=esm --platform=neutral --log-level=error --outfile=/tmp/edge_check.js`.
- Friends' data is private: anything shown to another user needs that user's explicit opt-in.
- Never type passwords, keys or tokens into fields.
- Coach copy: no praise of the person; never round a band up when unsure; plain, short sentences.
- Better versions (band 7/8) stay hidden until the retry, or until the student confirms "show them before I try myself".
- One focus for speaking, one for writing; grammar slips count for both.
- Last 7 days before `S.set.examDate`: habit-level focuses only (`extend`, `p3extend`, `p2structure`, `paraphrase`, `slip`).

## Review Focus

- Old attempts saved before this change (no `verdict`, no `on_topic`, no `pauses[].where`) must render exactly as now — every new field read with a fallback.
- A retry whose first answer was never checked (no `a.ai`), or whose check failed, must run as a normal full check, not a verdict.
- Guest mode: the one free try runs the full loop; every new `data-act` is either in `G_FREE`/`G_TRY` or deliberately locked.
- 360 px phone: guess-band chips, self-mark transcript and verdict card fit without sideways scroll; tapping words must not open the keyboard.
- Support page: a non-image or >4 MB upload is refused with a message; a deleted block's image doesn't break the page; signed-out visitors see the page.

---

### Task 1: Server — loop fields in the speaking check

**Files:**
- Modify: `/home/claude/build/edge/api/index.ts` (`analyze` prompt and post-processing)
- Modify: `/home/claude/test/mock/server.py` (analyze returns the new fields)
- Test: `/home/claude/test/t40.py`

**Interfaces:**
- Consumes: request body adds `focus?: {key: string, label: string}`, `prev?: {problem: string, steps: string[], transcript: string, bands: object, misses: number}`, `change?: string` (the student's "what will I change" line), `examDays?: number`.
- Produces in the response (all optional for old clients):
  - `on_topic: {ok: boolean, note: string}`
  - `error_count: number` (all grammar/word-form errors in the answer, not only the 5 listed)
  - `bands_range: {low: number, high: number}` (overall, 0.5 steps; `high - low` ≤ 1)
  - `pauses[].where: "mid" | "end"` (mid = inside a clause)
  - `focus_check: {hit: boolean, quote: string, note: string}` when `focus` was sent
  - `verdict: {fixed: "yes"|"partly"|"no", quote: string, change: string, next: string}` when `prev` was sent
  - every item in `grammar`, `vocab`, `pron_words` gets `conf: "high"|"medium"`
- Prompt rules added verbatim in spirit: no praise of the person; if torn between two bands give the lower; pronunciation points only where a listener would misunderstand the word (accent alone is not a point); with `prev.misses >= 2` give the rule and the correct sentence explicitly; with `examDays <= 7` choose `fix_first` only from habit-level problems.

- [ ] **Step 1:** Write `t40.py`: posts an `analyze` with `focus` and `prev` to the mock and asserts the app renders `.verdict` and `.ontopic`; posts without them and asserts neither appears.
- [ ] **Step 2:** Run it, expect FAIL (mock lacks fields, app lacks rendering — rendering lands in Task 3, so assert only the mock JSON keys here).
- [ ] **Step 3:** Add the fields to the prompt schema and to the mock.
- [ ] **Step 4:** esbuild check passes; `t40.py` passes.
- [ ] **Step 5:** Commit.

### Task 2: Client — focus model

**Files:**
- Create: `/home/claude/build/v23.js` (first section)
- Test: `/home/claude/test/t41.py`

**Interfaces:**
- Produces:
  - `const FOCI = {extend, midpause, accuracy, range, p3extend, p2structure, paraphrase, slip, ontopic}` each `{label: string, habit: boolean, target: string}` — `target` is the one-line instruction shown before answering (e.g. extend → "Answer, then add one more thing: a reason or an example.").
  - `focusOf(skill: "s"|"w") -> {key: string, hits: string[], misses: number, since: number}` stored in `S.set.focus[skill]`, synced (`SYNC_KEYS.push('focus')`).
  - `pickFocus(skill) -> key`: from the last 8 checked attempts choose the lowest criterion and map it: FC with mid pauses → `midpause`, short answers → `extend`/`p3extend`, `error_count`/words×100 > 1.5 → `accuracy`, GRA ok but LR/GRA range low → `range`, off-topic in ≥2 of 8 → `ontopic`. With `examDays() <= 7` only keys with `habit: true`.
  - `focusRecord(skill, qid, hit: boolean)`: a hit on a question not already in `hits` adds it; 3 hits → `pickFocus` again; a miss increments `misses`.
  - `errRate(a) -> number|null` = `a.ai.error_count / words(a.ai.transcript) * 100`.
  - `slipShared()`: a grammar slip seen in both speaking and writing in the last 8 attempts becomes focus `slip` for both skills.
  - `weekCount() -> {answers: number, retries: number, hits: number}` for the last 7 days, shown as one quiet line on Today (replaces nothing; no streaks).
- [ ] **Step 1:** `t41.py` seeds 8 attempts with `fc:5.5`, `error_count:6`, 100-word transcripts and asserts `pickFocus('s') === 'accuracy'`; seeds exam date 3 days ahead and asserts the pick is a habit key; three hits on three different qids switch the focus.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Pass.
- [ ] **Step 5:** Commit.

### Task 3: Client — the answer loop UI

**Files:**
- Modify: `/home/claude/build/v23.js` (second section)
- Modify: `/home/claude/ui2/layout6.css` (v24 block)
- Test: `/home/claude/test/t42.py`

**Interfaces:**
- Consumes: Task 1 fields, Task 2 functions, existing `coachAttempt(id)`, `coachBlock(a)`, `doRec(again)`, `api('analyze', body)`.
- Produces: attempt fields `a.loop = {guess: number|null, marked: number[], change: string, prevId: string|null, showVersions: boolean}`; acts `lguess`, `lmark`, `lreveal`, `lretry`, `lnext`, `lversions`.
- Behaviour, in order on the result page:
  1. Before recording: a banner with `FOCI[key].target`.
  2. After the check returns: off-topic line first if `on_topic.ok === false`.
  3. "Guess your band" chips 5–8.5 (`lguess`); results stay folded until a guess or "skip".
  4. Transcript as tappable words (`lmark`), mid-clause pauses drawn as `‖` between words; "Show the coach's marks" (`lreveal`) compares marks with `grammar[].said`.
  5. Verdict card: `focus_check`, errors per 100 words with the line "band 7 ≈ 1.5", `bands_range`, `conf` badge per point.
  6. "What will you change?" one-line input + "Say it again" (`lretry`): records the same question and calls analyze with `prev` + `change`.
  7. On the retry: `verdict` card; better versions unlock. Before that, `lversions` asks "See them before you try yourself?" and sets `showVersions`.
  8. "Next question, same type" (`lnext`): a random unanswered question of the same part.
- [ ] **Step 1:** `t42.py` (mic faked): record → check → asserts guess chips visible and versions hidden; guess → results shown; retry → `.verdict` visible and versions unlocked; `lnext` opens a different qid of the same part. At 360 px, `scrollWidth === clientWidth`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement as overrides of `coachBlock` and the practice result view; old attempts without `loop` render the current layout.
- [ ] **Step 4:** Pass.
- [ ] **Step 5:** Commit.

### Task 4: "I disagree"

**Files:**
- Modify: `index.ts` (new action `dispute`), `v23.js` (button + thread), mock
- Test: `/home/claude/test/t43.py`

**Interfaces:**
- Request `{action: "dispute", point: {kind: "grammar"|"vocab"|"pron"|"band", said: string, coach: string}, transcript: string, argument: string}`.
- Response `{verdict: "coach_right"|"student_right"|"unclear", reason: string}`. Prompt: decide from the rule first, write that decision, then read the argument; change only on evidence (rule, dictionary, example); never because of tone or authority claims.
- Stored on the attempt: `a.ai.disputes[]`.
- [ ] **Step 1:** `t43.py`: dispute a grammar point in the mock, assert the reply card shows "still wrong" for `coach_right` and "you're right" for `student_right`.
- [ ] **Step 2–5:** fail, implement, pass, commit.

### Task 5: Spacing, writing loop, exam morning

**Files:**
- Modify: `v23.js` (third section), `index.ts` (`essay` prompt: `overview_ok`, `position_ok` first), mock
- Test: `/home/claude/test/t44.py`

**Interfaces:**
- `fxDueDays(level: number) -> number`: review gaps 1, 2, 2 days when `examDays() <= 7`, else 1, 3, 7, 14.
- Essay result gains `overview_ok: boolean` (Task 1) / `position_ok: boolean` (Task 2), shown first; then "Rewrite the marked sentences" panel: each marked sentence gets an input; `api('wcheck', {mode:'rewrite', pairs})` returns `{ok: boolean, note: string}[]`.
- Exam morning: route `#morning`, shown as a card on Today when `examDays() === 0`; a private textarea (never saved, cleared on leave) and 3 Part 1 questions.
- [ ] **Step 1:** `t44.py`: exam date today → Today shows the morning card; textarea text not in localStorage after leaving; a rewritten sentence returns a verdict row.
- [ ] **Step 2–5:** fail, implement, pass, commit.

### Task 6: Shadowing, Part 2 notes check, friend rating

**Files:**
- Modify: `v23.js` (fourth section), `index.ts` (`friend_pick`, `friend_rate`), mock
- Test: `/home/claude/test/t45.py`

**Interfaces:**
- Shadowing: act `shadow` on the better version: plays the clip (own-voice if made, else examiner TTS) and records at the same time; the recording is saved as a practice take, not checked.
- Part 2 notes: a notes box during the 60 s prep; text sent as `body.p2notes`; prompt adds `notes_check: {used: string[], missed: string[]}`.
- Friends: `S.set.shareAnswers: boolean` (Settings toggle, default false). `friend_pick` returns one attempt from a sharing user for a question the caller also answered: `{id, qid, audioUrl (signed, 10 min), bands}`; `friend_rate` stores the caller's guess and returns the coach bands. Only users with `shareAnswers` true are ever returned. Entry point: a tile "Rate a friend's answer" on Speaking home.
- [ ] **Step 1:** `t45.py`: with sharing off for everyone, the tile says nobody shares yet; with friend_one sharing, the caller gets friend_one's answer and sees the comparison after rating.
- [ ] **Step 2–5:** fail, implement, pass, commit.

### Task 7: Support page builder

**Files:**
- Create: `/home/claude/build/v24.js`
- Modify: `index.ts` (`support_save`, `support_img`; `status` returns `support_page`), mock, CSS
- Test: `/home/claude/test/t46.py`

**Interfaces:**
- `support_page = {blocks: Block[]}` in `app_config`, where `Block = {id: string, type: "text"|"image"|"button"|"split", text?: string, url?: string, img?: string, side?: "left"|"right", size?: "s"|"m"|"l"}`; `split` = image beside text, `side` picks which side the image sits on.
- `support_img` takes `{name, b64, mime}` (admin only, image/* only, ≤ 4 MB), stores in a public Storage bucket `support`, returns `{url}`.
- Page for everyone (signed in or not): renders blocks in order. Admin sees "Edit page": per block move up/down, delete, change type/side/size, edit text in place; "+ Text", "+ Image", "+ Image with text", "+ Button"; "Save" → `support_save`. Falls back to the old `support_text`/`support_link` when no blocks exist.
- [ ] **Step 1:** `t46.py`: admin adds an image-with-text block on the right, moves it up, saves; a second context (non-admin, then signed out) sees the image right of the text in the same order; uploading a `.txt` shows the refusal.
- [ ] **Step 2–5:** fail, implement, pass, commit.

### Task 8: Deploy and verify live

- [ ] Edge: esbuild check, commit, push, deploy stub with the new sha; live `status` returns 401 unsigned, `guest_info` 200.
- [ ] App: build, bump sw, commit, push; live HTML contains `v23:` and `v24:` after Pages publishes.
- [ ] Run `t40`–`t46` once more against the built site.

## Deferred (needs material we don't have)

- Rated examples in the scoring prompt (research theme 4): needs 10–20 answers with official or examiner bands; none are available as audio we may use. When Adil has some (e.g. his own officially scored answers), add them as `anchors` in `app_config` and inline 3 per check.
