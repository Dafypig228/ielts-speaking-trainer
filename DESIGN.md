---
name: IELTS Speaking Trainer
description: A plain, white practice tool for answering IELTS Speaking questions out loud, with the test date always in view.
colors:
  bg: "oklch(0.972 0.0060 262)"
  surface: "oklch(0.997 0.0014 262)"
  sunken: "oklch(0.948 0.0100 262)"
  ink: "oklch(0.235 0.0350 262)"
  muted: "oklch(0.470 0.0300 262)"
  line: "oklch(0.895 0.0130 262)"
  line-strong: "oklch(0.800 0.0200 262)"
  board: "oklch(0.300 0.0800 262)"
  on-board: "oklch(0.975 0.0080 262)"
  act: "oklch(0.420 0.1500 262)"
  act-ink: "oklch(0.430 0.1500 262)"
  act-soft: "oklch(0.940 0.0286 262)"
  on-act: "oklch(0.985 0.0050 262)"
  signal: "oklch(0.830 0.1550 80)"
  signal-ink: "oklch(0.500 0.1100 68)"
  signal-soft: "oklch(0.955 0.0450 88)"
  on-signal: "oklch(0.235 0.0350 262)"
  rec: "oklch(0.555 0.2000 27)"
  rec-ink: "oklch(0.500 0.1900 27)"
  rec-soft: "oklch(0.950 0.0249 27)"
  on-rec: "oklch(0.990 0.0048 27)"
  ok: "oklch(0.500 0.1200 150)"
  ok-soft: "oklch(0.950 0.0350 150)"
  warn: "oklch(0.520 0.1100 65)"
  warn-soft: "oklch(0.955 0.0400 80)"
  p1: "oklch(0.500 0.0853 200)"
  p1-ink: "oklch(0.450 0.0769 200)"
  p1-soft: "oklch(0.945 0.0300 200)"
  p2: "oklch(0.540 0.1500 45)"
  p3: "oklch(0.480 0.1600 305)"
  on-part: "oklch(0.990 0.0040 262)"
typography:
  display:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(24px, 6vw, 30px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"pnum\" 1"
  body-small:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  timer:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
rounded:
  xs: "5px"
  sm: "10px"
  md: "14px"
  sheet: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "28px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.act}"
    textColor: "{colors.on-act}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "48px"
    typography: "{typography.label}"
  button-primary-big:
    backgroundColor: "{colors.act}"
    textColor: "{colors.on-act}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "54px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.act-ink}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "48px"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  chip-filter-selected:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.pill}"
  exam-chip:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
    height: "32px"
  exam-chip-unset:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal-ink}"
  part-badge:
    backgroundColor: "{colors.p1}"
    textColor: "{colors.on-part}"
    rounded: "{rounded.xs}"
    size: "22px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  record-button:
    backgroundColor: "{colors.rec}"
    textColor: "{colors.on-rec}"
    rounded: "{rounded.pill}"
    size: "76px"
---

# Design System: IELTS Speaking Trainer

## Overview

**Creative North Star: "The Quiet Test Room"**

A white, calm room with one job in it: say the next answer out loud. The page is plain white and pale blue-grey; colour is spent on meaning, never on decoration. Each strong colour has exactly one job (blue acts, navy marks where you are, amber marks what is next, red means the microphone is on), so a user can read the state of the screen from colour alone. The only constant chrome is a white header carrying the test-date chip, because the date is the reason the app exists.

Density is moderate and phone-first: one column, 44px touch targets, a bottom tab bar of four (Today / Questions / My answers / Words) with settings behind a gear. On a computer (900px and up) the same components stay the same size; the tab bar becomes a 96px left rail and pages split into a main column and a side column. Nothing grows into a dashboard.

Progress is shown as plain measured facts (seconds spoken, pauses, band estimates from the coach) and never as a game. There are no streaks, points, badges, confetti or daily targets. The coach costs a request and runs only when the user presses its button.

**Key Characteristics:**
- White header and surfaces on a cool off-white page (hue 262 throughout the neutrals).
- One family, Onest variable, for everything, including timers.
- Colour by job: act blue, board navy, signal amber, record red, three part colours.
- Part identity carried by 22px numeral badges, not by tinted screens.
- A length-zone bar per part is the main piece of feedback while speaking.
- Flat surfaces with 1px hairlines; shadows only on things that float.
- Full light and dark themes from the same token names.

## Colors

A cool, low-chroma blue-grey base with five saturated accents, each reserved for one meaning. Every token has a dark-theme value under the same name (see `.impeccable/design.json`); dark mode follows `prefers-color-scheme` and can be forced with `data-theme`.

### Primary
- **Action Blue** (`act`): fill of primary buttons, the switch "on" state, the focus outline, the input focus ring, playback progress and the live length bar. `act-ink` is the text version for links, ghost buttons and text buttons. `act-soft` is the pale wash behind the current Words section, the active gear and the numbered phrase dots in "Try to use".

### Secondary
- **Board Navy** (`board`, text `on-board`): the "you are here / selected" marker. It draws the 3px active-tab bar (top edge on phone, left edge on the rail) and the active tab label, fills selected filter chips and segmented pills, and colours current-item text in the Words list. It is also the toast background and the tint of the sheet/modal scrim.

### Tertiary
- **Signal Amber** (`signal`, `signal-ink`, `signal-soft`, text `on-signal`): what is next or still owed. The "next" step mark in Today's session, the current segment of the session progress bar, the unset "Set test date" chip, the Part 2 preparation countdown band, the toast's action text and text selection.
- **Record Red** (`rec`, `rec-ink`, `rec-soft`, `on-rec`): the microphone. The round record button, the docked bar while recording (soft red fill, 2px red top edge), the inset red line under the session header while recording, and the input level meter.

### Part colours
- **Part 1 Teal** (`p1`), **Part 2 Orange** (`p2`), **Part 3 Violet** (`p3`), all with `on-part` numerals. Used as the fill of 22px numeral badges and pills that label a question's part. `p1` also colours completed segments of the session bar, the "Start here" line and topic tags (`p1-soft` / `p1-ink`).

### Feedback
- **Measured Green** (`ok`, `ok-soft`): inside the target length, completed steps, high band estimates, improvements in the second-try comparison.
- **Short Brown-Amber** (`warn`, `warn-soft`): too short, flagged pauses and filler marks in the transcript, low band estimates. This is a darker, browner amber than Signal and is never used for "next".

### Neutral
- **Cool Paper** (`bg`): page background.
- **White Card** (`surface`): header, tab bar, cards, lists, inputs, dock.
- **Sunken Grey** (`sunken`): transcript and idea blocks, fact tiles, the exam chip at rest, list hover, segmented-switch track.
- **Ink** (`ink`) and **Muted** (`muted`): text and secondary text.
- **Hairline** (`line`) and **Strong Hairline** (`line-strong`): dividers and card borders; button, input and chip borders, chevrons.

### Named Rules
**The One Job Per Colour Rule.** Blue acts, navy marks the current place or selection, amber marks what is next or unset, red means recording. Never borrow one colour for another job; a primary button is never navy, a selected chip is never blue.

**The Red Means Live Rule.** Record red appears only on the record control, the live-recording dock and header line, and the level meter. Destructive text buttons use `rec-ink` as text only, with no red fill.

**The Two Ambers Rule.** `signal` (bright, yellow-amber) is "next / due / unset". `warn` (dark, brown-amber) is "too short / check this". They do not swap.

## Typography

**Display Font:** Onest variable (embedded), falling back to Segoe UI, system-ui, sans-serif
**Body Font:** Onest, same stack
**Label/Mono Font:** none distinct; every role uses Onest

**Character:** A single clear grotesque with Cyrillic coverage, set in many fine weight steps (400, 500, 550, 600, 650, 700) instead of size jumps. Headings are tight (-0.012em to -0.015em) and balanced; body is 16px at 1.45.

### Hierarchy
- **Display** (600, clamp(24px, 6vw, 30px), 1.25): the question being answered. 21px inside the Part 2 cue card, 18px in compact contexts. The Words review prompt uses clamp(26px, 7vw, 34px) at 650.
- **Headline** (650, 24px, 1.2): page titles; 26px on Today, 22px for the "Start here" card title, 20px for "Today's session".
- **Title** (650, 16px, 1.2): section and card headings (`h2`), 15px for `h3`.
- **Body** (400, 16px, 1.45): running text. Transcripts at 15px / 1.65.
- **Body small** (400, 14px; also 13.5px and 12.5px): sub-lines in lists, hints, zone labels, fact labels.
- **Label** (600, 14px): buttons (16px at 600 in the default button, 17px in big), chips, section links, step titles.
- **Timer** (700, 56px, 1): the speaking timer; 30px in the Part 2 prep band, 26px in the dock, 28px in older runner views.

### Named Rules
**The Proportional Digits Rule.** Body text sets `proportional-nums`. Only ticking timers and counters (`tabular-nums`) get fixed-width digits, so they do not jitter while counting.

**The Weight Not Size Rule.** Hierarchy comes from weight steps between 500 and 700 and a short size range (12.5px to 30px); the only large type is a running timer.

## Layout

- **Phone (below 900px):** one column, max 720px wide, 18px side padding. Sticky white header (56px) with brand, test-date chip, sync-status dot and gear. Fixed bottom tab bar (64px) with four equal tabs, icon over 12px label. Below 600px the sync chip collapses to its dot.
- **Computer (900px and up):** a two-column grid, 96px left rail plus content up to 1184px with 28px/32px padding. The tab bar becomes the rail with the same icons and labels stacked vertically. Pages split into a main column (flex-basis 440-460px, up to 640px on Today) and a side column (300-440px) with 28px gaps; they wrap back to one column when space runs out.
- **Answering session:** the tabs hide; a session header (close button, title, position) and a 4px segmented progress bar replace them. Content widens to 1040px. Controls live in a fixed bottom dock (min 96px) with a three-slot grid: left action, record button centred, right action. On a computer the two-button dock right-aligns its buttons at min 200px each.
- **Rhythm:** gaps of 6, 8, 10, 12, 14, 18, 22 and 28px. Stacks default to 14px, rows to 10px, page sections to 18px. List rows are at least 56px tall with 12px x 14px padding.
- **Touch:** every interactive element is at least 44px (`tap`) on its short side, or 40px for in-row chips and segmented buttons.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (Cool Paper page, White Card surfaces, Sunken Grey insets) and 1px hairlines. Shadows exist only for things that float above the page or must read as live.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 2px color-mix(in oklab, var(--ink) 10%, transparent), 0 8px 24px color-mix(in oklab, var(--ink) 10%, transparent)`): bottom sheet, modal box, toast.
- **Record glow** (`box-shadow: 0 4px 14px color-mix(in oklab, var(--rec) 32%, transparent)`): the record button at rest; while recording it pulses a 10px ring at 18% red every 1.4s.
- **Switch thumb** (`box-shadow: 0 1px 2px color-mix(in oklab, var(--ink) 14%, transparent)`): the selected half of a two-way switch.
- **Focus ring** (`box-shadow: 0 0 0 3px color-mix(in oklab, var(--act) 22%, transparent)`): focused inputs; other controls use a 2px solid `act` outline at 2px offset.

### Named Rules
**The Only Floaters Cast Shadows Rule.** Cards, lists and buttons never carry a shadow. If it does not sit above the page (sheet, modal, toast, record button), it is flat.

## Shapes

Soft, consistent rounding: 14px on cards, lists and the modal; 10px on buttons, inputs, icon buttons, notes-in-cards and fact tiles; 12px on notes; 16px top corners on the bottom sheet; full pills on filter chips, segmented pills and the exam chip; circles for the record button, play buttons and step marks. Small labels use 5-6px: part badges (5px), band scores and topic tags (6px). The Part 2 cue card is the one deliberate exception: a 1.5px ink border with a tight 6px radius, so it reads like the printed card the examiner hands over.

Borders are 1px `line` on containers and 1px `line-strong` on controls. Selected states replace the border colour with the fill colour.

## Components

### Buttons
Solid, roomy and plainly labelled, with an icon trailing or leading at 18px.
- **Shape:** gently rounded (10px), min height 48px, 0 18px padding, 16px / 600 label.
- **Primary:** Action Blue fill and border, `on-act` text. Hover mixes 12% ink into the blue. Used once per view for the next step ("Start Part 1", "Continue with Part 2").
- **Big / wide:** 54px tall at 17px for the main call to action on Today; full width on phone.
- **Secondary:** White Card fill, `line-strong` border, ink text; hover to Sunken Grey.
- **Ghost / text:** transparent with `act-ink` text; the text-button variant is underlined at 1px with 3px offset.
- **Small:** 40px tall, 12px padding, 14px text.
- **Toggled on:** soft amber fill, amber-mixed border, `signal-ink` text.
- **Pressed / disabled:** 1px downward nudge on press; 45% opacity when disabled.
- **Icon button:** 44px square, 10px radius, `line-strong` border.

### Chips
- **Filter chips and segmented pills:** 38-40px tall pills, 1px `line-strong` border, White Card fill, 14px / 500 text. Selected: Board Navy fill and border, `on-board` text at 600.
- **Two-way switch:** Sunken Grey track (10px radius, 3px padding); selected half becomes White Card with ink text and the switch-thumb shadow.
- **Test-date chip (header):** Sunken Grey pill, calendar icon, "Test Sat 12 Dec · 26 days" in 14px / 600. When no date is set it turns Signal Amber soft with `signal-ink` text and reads "Set test date".
- **Status chip:** 13px muted text after an 8px dot; green when connected/synced (`ok`), amber when pending (`signal`), grey otherwise.

### Part badge (signature)
A 22px square with a 5px radius, filled with the part's colour and carrying the part numeral (1, 2, 3) in 13px / 700 `on-part`. It sits before every question title, step title and answer row. The pill variant pairs the badge with a 14px / 600 muted label.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** White Card on Cool Paper.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px `line`.
- **Internal Padding:** 16px; 18px on the Today start card.
- **Lists:** a card with no padding whose rows are separated by 1px `line` top borders, at least 56px tall, with a bold 600 title, a 14px muted sub-line and a `line-strong` chevron. Rows tint to Sunken Grey on hover.
- **Notes:** 12px radius, 10px x 14px padding, 15px text, in four tones: `ok`, `warn`, `amber` (signal) and `plain` (sunken).

### Inputs / Fields
- **Style:** White Card fill, 1px `line-strong` border, 10px radius, 10px x 12px padding, 44px minimum height, 16px text (prevents zoom on iOS).
- **Focus:** border turns Action Blue with a 3px 22% blue ring.
- **Search:** 20px muted magnifier inset 12px from the left, 40px left padding.
- **Settings switch:** 46 x 28px track in `line-strong`, white 22px knob; on state fills Action Blue.

### Navigation
- **Header:** white, 56px, 1px bottom hairline; brand in 17px / 700 ink; test-date chip; status dot; 44px gear in muted, which turns navy on `act-soft` when Settings is open.
- **Tabs (phone):** four equal columns, 22px icons over 12px / 500 muted labels. Active: navy text at 700 with a 3px navy bar along the top edge (inset 30% each side).
- **Rail (computer):** same tabs stacked in a 96px column with a right hairline; the active bar moves to the left edge (3px, inset 14px top and bottom).
- **Session header:** replaces the tab bar during practice; close button, title with part badge, muted "2 of 5" position, then the segmented progress bar (done segments in `p1`, the current one in `signal`, rest in `line`).

### Length zone bar (signature)
A 12px rounded bar split into three zones sized from each part's limits: too short (`warn-soft`), target (`ok-soft`), over (`sunken`). A solid Action Blue fill grows across it while the user speaks (0.25s linear). Targets: Part 1 20-30 s (bar to 45 s), Part 2 90-120 s (bar to 120 s), Part 3 45-60 s (bar to 90 s). Labels under it are 12.5px muted with the target range in green 600, and a 15px / 600 state line reads short (warn), good (ok) or long (muted).

### Record dock (signature)
Fixed to the bottom in a session. At rest: White Card with a top hairline, a 76px red record button with the glow shadow, flanked by left and right actions. While recording: the dock fills `rec-soft` with a 2px `rec` top edge, the button shows a 26px square stop mark and pulses, its label turns `rec-ink`, and the session header gains a 3px red inset line.

### Coach and second-try views
Facts appear as three Sunken Grey tiles (10px radius) with a 12.5px label, an 18px / 700 value and a sub-line, tinted ok or warn when the number is in or out of range. The transcript is a Sunken Grey block at 15px / 1.65 with pauses and fillers marked in `warn-soft`. The second-try comparison is a three-column table (measure, first, second) with improvements in green 700. The coach request is an ordinary secondary button inside a card, with the remaining daily checks stated in muted text beside it.

## Do's and Don'ts

### Do:
- **Do** keep the header white and put the test-date chip in it on every main screen; switch it to the amber "Set test date" state when the date is missing.
- **Do** use Action Blue for the single primary button of a view, and Board Navy only for the active tab marker, the selected chip or pill, and the current item.
- **Do** label every question with its 22px part badge in teal (1), orange (2) or violet (3).
- **Do** show the length zone bar for the question's part while recording, with the ranges Part 1 20-30 s, Part 2 90-120 s, Part 3 45-60 s.
- **Do** report progress as measured facts (seconds, pauses, band estimates) in plain sentences.
- **Do** use `tabular-nums` on ticking timers and counters only.
- **Do** keep touch targets at 44px and reuse the same components on phone and computer; only the shell (tabs to 96px rail) and column count change.
- **Do** honour `prefers-reduced-motion`: the build turns off all animation and transitions under it.

### Don't:
- **Don't** use red for anything except the record control, the live recording state and the level meter.
- **Don't** use Signal Amber for warnings or Warn amber for "next"; the two ambers have separate jobs.
- **Don't** add game mechanics: no streaks, points, badges, confetti, celebratory copy or daily targets.
- **Don't** run the coach automatically; it runs only when the user presses "Check with coach".
- **Don't** put shadows on cards, lists or buttons.
- **Don't** tint whole screens or cards with a part colour; part colour lives on the badge.
- **Don't** add a second typeface; timers and labels are Onest too.
- **Don't** add small uppercase labels or kickers above headings; the "Start here" line on the first-run Today card is a known exception in the build, not a pattern.
