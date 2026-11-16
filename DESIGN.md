---
name: IELTS Speaking Trainer
description: Speaking practice set as a station departure board, counting down to exam day.
colors:
  board: "oklch(0.300 0.0800 262)"
  board-2: "oklch(0.370 0.0850 262)"
  on-board: "oklch(0.975 0.0080 262)"
  on-board-muted: "oklch(0.800 0.0450 262)"
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
  p1: "oklch(0.500 0.0853 200)"
  p1-ink: "oklch(0.450 0.0769 200)"
  p1-soft: "oklch(0.945 0.0300 200)"
  p2: "oklch(0.540 0.1500 45)"
  p2-ink: "oklch(0.500 0.1400 45)"
  p2-soft: "oklch(0.950 0.0280 50)"
  p3: "oklch(0.480 0.1600 305)"
  p3-ink: "oklch(0.450 0.1600 305)"
  p3-soft: "oklch(0.950 0.0297 305)"
  on-part: "oklch(0.990 0.0040 262)"
  ok: "oklch(0.500 0.1200 150)"
  ok-soft: "oklch(0.950 0.0350 150)"
  warn: "oklch(0.520 0.1100 65)"
  warn-soft: "oklch(0.955 0.0400 80)"
  bg: "oklch(0.972 0.0060 262)"
  surface: "oklch(0.997 0.0014 262)"
  sunken: "oklch(0.948 0.0100 262)"
  ink: "oklch(0.235 0.0350 262)"
  muted: "oklch(0.470 0.0300 262)"
  line: "oklch(0.895 0.0130 262)"
  line-strong: "oklch(0.800 0.0200 262)"
typography:
  board-timer:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
  board-time:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(22px, 5.2vw, 29px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title-page:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  title-row:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"pnum\""
  body-small:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label-board:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.04em"
  label-tab:
    fontFamily: "Onest, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
rounded:
  cue: "4px"
  badge: "5px"
  tag: "6px"
  sm: "8px"
  md: "10px"
  sheet: "14px"
  round: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  row: "14px"
  lg: "16px"
  xl: "20px"
  col: "40px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.act}"
    textColor: "{colors.on-act}"
    rounded: "{rounded.sm}"
    padding: "9px 15px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 15px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  button-ghost:
    textColor: "{colors.act-ink}"
    rounded: "{rounded.sm}"
    padding: "9px 15px"
  button-on:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.sm}"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.rec-ink}"
    rounded: "{rounded.sm}"
  segment-pressed:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.sm}"
    padding: "6px 13px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  record-button:
    backgroundColor: "{colors.rec}"
    textColor: "{colors.on-rec}"
    rounded: "{rounded.round}"
    size: "64px"
  record-dock-live:
    backgroundColor: "{colors.rec-soft}"
  part-badge-1:
    backgroundColor: "{colors.p1}"
    textColor: "{colors.on-part}"
    rounded: "{rounded.badge}"
    size: "22px"
  part-badge-2:
    backgroundColor: "{colors.p2}"
    textColor: "{colors.on-part}"
    rounded: "{rounded.badge}"
    size: "22px"
  part-badge-3:
    backgroundColor: "{colors.p3}"
    textColor: "{colors.on-part}"
    rounded: "{rounded.badge}"
    size: "22px"
  band-low:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    rounded: "{rounded.tag}"
    height: "28px"
  band-mid:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    height: "28px"
  band-high:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    rounded: "{rounded.tag}"
    height: "28px"
  departure-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "14px 16px"
  board-header:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board-muted}"
    typography: "{typography.label-board}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  toast:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.sm}"
    padding: "10px 10px 10px 16px"
---

# Design System: IELTS Speaking Trainer

## Overview

**Creative North Star: "The Station Board"**

The app reads like the departure hall of a Kazakh railway station. A deep board-blue band runs across the top and, on phones, across the bottom; between them is a cool near-white floor of ruled rows. The home screen is a timetable: each practice mode is a departure, its duration sits in the time column, and what is left for it sits in the status column. Exam day is the one fixed departure in the header, counted down in bold numerals.

Density is moderate and practical: rows are tall enough to hit with a thumb (56 to 84px), type is one family at a small number of weights, and colour is spent only where it carries information. Blue means the board and the action. Amber means now or next. Red means the microphone. Teal, orange and violet are the three lines (Parts 1, 2, 3). Everything else is ink on paper.

Progress is shown as plain facts and counts, never as rewards: there are no rings, streak flames, trophies, confetti or celebratory colour anywhere in the build.

**Key Characteristics:**
- Board-blue header and tab bar framing a cool near-white ground.
- One typeface, Onest, with bold numerals for every time, duration and countdown.
- Rows divided by 1px rules inside lightly bordered containers; depth is mostly flat.
- Amber kept for now/next, red kept for recording, part line colours kept for part identity.
- Full light and dark themes from the same OKLCH token set, hue 262 for every neutral.

## Colors

A cool blue-grey neutral family (all at hue 262) carrying three tightly scoped signal colours and three line colours.

### Primary
- **Station Board Blue** (board): the header bar, the bottom tab bar, the departure board's column header, the toast, pressed segment buttons, and the scrim tint behind sheets and modals. Its lighter step (board-2) is reserved for board-on-board layering.
- **Departure Blue** (act): the action colour. Primary buttons, caret, focus ring, links (act-ink), progress fills, the "Change" link in filters. act-soft is its quiet tint.

### Secondary
- **Signal Amber** (signal): the now/next light. Days-left numeral in the header, the selected-tab underline, the current stop on the mock-test line, and "phrases due" when phrases are due. signal-ink is its text-safe step on light ground; signal-soft backs "on" toggles, the phrase challenge box and text selection.
- **Record Red** (rec): the record control, always. rec-soft and rec-ink appear on the live dock, the live inline recorder, pause marks in transcripts and destructive button text.

### Tertiary
- **Line Teal** (p1), **Line Orange** (p2), **Line Violet** (p3): IELTS Parts 1, 2 and 3. Each has an -ink step for text and a -soft step for tints; on-part is the numeral colour on a filled badge.
- **Confirm Green** (ok) and **Caution Ochre** (warn): band estimates (high / low), coverage and timing bars, flagged-filler marks and status tags, each with a -soft tint.

### Neutral
- **Platform Floor** (bg): page ground; also the sheet panel ground.
- **Timetable Paper** (surface): cards, lists, the board body, inputs, secondary buttons, the idle dock.
- **Recess** (sunken): row hover, idle inline recorder, transcript and ideas wells, mid-band chips.
- **Board Ink** (ink): body text and numerals. **Faded Ink** (muted): secondary lines, captions, units such as "min".
- **Rule** (line): 1px dividers between rows and container edges. **Strong Rule** (line-strong): control borders, empty-count numerals, the row arrow, the mock-test track.

Dark theme swaps every token for its dark step (see the sidecar); roles do not change.

### App icon and install colours
Where OKLCH cannot be used, the identity carries hex stand-ins for three tokens: board as #162c55 (icon ground, manifest and meta theme_color), bg as #f3f6fa (the microphone mark, manifest background_color) and signal as #fcbb39 (the dot on the icon). The icon is a rounded board-blue square (rx 112 on 512) with a paper-white microphone and one amber dot in the top right corner: the board, the record control and the now light.

### Named Rules
**The Now-and-Next Rule.** Amber marks only what is current or due: days left, the selected tab, the current mock stop, phrases due today. A count of zero or a past item is never amber.

**The Live Red Rule.** The record button is red at rest by convention. The 3px red line under the header and the red-tinted dock appear only while a recording is live, and go away when it stops.

**The Line Colour Rule.** Teal, orange and violet identify Parts 1, 2 and 3 and nothing else: badges, mock-test stops, coverage meters.

## Typography

**Display Font:** Onest (with Segoe UI, system-ui, sans-serif)
**Body Font:** Onest (same stack)

**Character:** One variable family does everything. Board numerals come from weight (700) and size, not from a second face. Headings sit at 650 with slight negative tracking.

### Hierarchy
- **Board timer** (700, 64px, line-height 1, tabular figures): the large mock-test countdown.
- **Board time** (700, 32px, -0.04em, proportional figures): the time column of the departure board (28px under 420px). Related bold numerals: status count 24px, record time 30px, dock time 28px, prep timer 26px, header date and days left 19px (18px on small phones).
- **Headline** (600, clamp 22 to 29px, 1.25, max 30ch, balanced): the question being answered. The vocabulary review prompt uses a larger step (650, clamp 26 to 34px).
- **Page title** (650, 24px, 1.2): page heads such as "Weak spots".
- **Row title** (650, 18px): departure names (17px under 420px). Section heads are 15 to 16px at 650.
- **Body** (400, 16px, 1.5): running text, list rows, inputs. Coach text and ideas cap at 70ch, cue cards at 62ch.
- **Small** (400 to 500, 14px): row subtitles, meta lines, page meta.
- **Board label** (600, 12px, 0.04em, uppercase): the departure board's column header only (TIME / PRACTICE / STATUS).
- **Tab label** (500, 12px; 650 when current): bottom tab captions; 15px inline in the desktop header.

### Named Rules
**The Bold Numeral Rule.** Times, durations, counts and countdowns are Onest 700. Digits are proportional everywhere except timers that tick (record, dock, prep, mock clock), which use tabular figures so they do not jitter.

**The Station Header Rule.** Uppercase tracked text is the board's column header and nowhere else.

## Layout

A single column on phones, up to 760px wide for practice and sheet content and 1120px for the home and takes pages. Page padding is 16px at the sides, 20px top (28px at 900px and up), with bottom padding that clears the fixed tab bar (60px) and, when present, the record dock (88px).

At 900px and wider the tab bar moves into the header as inline links and the home page becomes a 7:5 two-column grid with a 40px gap: departure board and coverage on the left, last takes on the right. On phones the order is board, last takes, coverage.

Spacing steps observed in use: 6, 8, 12, 14, 16, 20 and 40px. 14px is the vertical rhythm of stacked blocks; 26px separates sections (section heads). Every control is at least 44px tall; record buttons are 64 to 68px.

The departure row is a four-column grid: time (64px, 54px on small phones), name and description, status (right-aligned), arrow (18px).

## Elevation & Depth

Mostly flat. Containers separate from the ground by a 1px rule and a one-step lighter fill (bg to surface); rows inside them are divided by 1px rules; hover drops a row into sunken. Shadows exist only on things that float above the page or on the record control.

### Shadow Vocabulary
- **Lift** (`0 1px 2px color-mix(in oklab, var(--ink) 10%, transparent), 0 6px 20px color-mix(in oklab, var(--ink) 8%, transparent)`): modal box and toast.
- **Sheet** (`0 -10px 34px color-mix(in oklab, var(--ink) 22%, transparent)`): the bottom sheet panel.
- **Dock** (`0 -6px 18px color-mix(in oklab, var(--ink) 7%, transparent)`): the record dock above the tab bar.
- **Record glow** (`0 4px 14px color-mix(in oklab, var(--rec) 30%, transparent)`): the record button; while live it pulses out to a 9px ring at 20%.

### Named Rules
**The Ruled Rows Rule.** Rows are divided by 1px rules, not by gaps between floating cards. A new surface earns a shadow only if it sits above the page.

## Shapes

Modest, consistent rounding. Containers 10px; controls and inputs 8px; chips, tags and band chips 6px; part badges 5px (square numerals); the Part 2 cue card 4px with a 1.5px ink border, like a printed exam card. The sheet has 14px top corners only. Round shapes are kept for the record buttons, play buttons, status dots and mock-test stops. On the mock-test line Part 2 stops are rounded squares, Parts 1 and 3 are circles; the current stop is a larger amber dot with a board-blue ring and a soft amber halo.

## Components

### Buttons
- **Shape:** gently rounded (8px), min height 44px, 15px semibold label, optional 18px line icon.
- **Primary:** Departure Blue fill, near-white text, padding 9px 15px. Hover mixes 12% ink in.
- **Secondary:** paper fill, strong-rule border, ink text; hover to sunken; active nudges down 1px.
- **Ghost:** no fill or border, act-ink text. **Danger:** secondary with rec-ink text. **On:** signal-soft fill, amber border, signal-ink text (starred, active toggles). **Big:** 52px tall, 17px.
- **Focus:** 2px act outline, 2px offset; inside the header and tab bar the outline is amber.
- **Link buttons:** underlined act-ink text, 1px underline 3px below.

### Segmented choices
- Row of 40px buttons (paper, strong-rule border). Pressed state is a board-blue fill with on-board text.

### Chips, tags and bands
- **Status chip:** dot plus text; in the header the dot is green (synced) or amber (attention). In content it gets a 1px rule border, 6px corners.
- **Band chip:** bold numeral on a 28px chip: ochre tint below 6, neutral 6 to 6.5, green tint 7 and above.
- **Part badge:** 22px rounded square in the part line colour with a bold white numeral, then "Part N" in muted text.

### Cards / Containers
- **Corner Style:** 10px. **Background:** surface. **Border:** 1px line. **Shadow:** none. **Padding:** 16px (question card 18px 16px, 22px 24px from 600px).
- Lists are a single bordered container of rows (min 56px, padding 12px 16px) with rules between them.

### Inputs / Fields
- **Style:** paper fill, 1px strong-rule border, 8px corners, 10px 12px padding, 16px text, muted placeholder.
- **Focus:** border turns act plus a 3px act ring at 22%.
- Filters collapse to one ruled line with a summary and a "Change" link.

### Navigation
- **Phone:** fixed bottom bar in board blue, four equal tabs (22px icon over 12px label), on-board-muted at rest; current tab is on-board, 650, with a 3px amber bar along the top edge.
- **Desktop (900px+):** the same tabs sit inline in the header after the name; the amber bar moves to the bottom edge.
- **Header:** board blue, 56px; name on the left (second word muted), exam date and amber days left on the right, sync chip last. While recording, a 3px red line runs along its bottom.

### Departure Board (signature)
A bordered container whose top strip is board blue with the uppercase column header. Each mode is a row: bold time numeral with "min" beneath, mode name and one-line description, right-aligned bold status count with its caption, and a strong-rule arrow that darkens and shifts 2px on hover. A zero count is drawn in strong-rule grey; a due count is amber (signal-ink).

### Mock-test Line (signature)
A 2px strong-rule track with one stop per question in the part's line colour: hollow when ahead, filled when done, Part 2 as a square, the current stop amber.

### Record Control and Dock
- **Record button:** 64px (dock) or 68px (inline) red circle, white mic or stop glyph, record glow. Pulses while live.
- **Dock:** fixed above the tab bar (bottom of viewport on desktop), paper with a top rule and a soft upward shadow; three columns: back/end, record plus timer, next. While live it turns rec-soft with a red top rule. The time bar fills green and turns ochre past the target.

### Sheet, Modal, Toast
- **Sheet:** slides up (320ms, ease-out-expo) over a 55% board-blue scrim; panel on bg with a paper header row.
- **Modal:** centred paper box, 10px corners, lift shadow, max 400px.
- **Toast:** board-blue bar (8px corners), on-board text, amber action text.

## Do's and Don'ts

### Do:
- **Do** set every time, duration and countdown in Onest 700, tabular only when it ticks.
- **Do** keep amber for now/next: days left, current tab, current mock stop, phrases due.
- **Do** keep the record button red at rest and switch the header line and dock to red only while live.
- **Do** mark Parts 1, 2, 3 with teal, orange and violet square numeral badges and matching mock stops.
- **Do** divide rows with 1px rules inside one bordered container; keep controls at 44px or taller.
- **Do** take every colour from the OKLCH tokens so light and dark themes both hold.

### Don't:
- **Don't** add game mechanics or their visuals: streaks, badges, goal rings, confetti, celebratory colour.
- **Don't** use amber for decoration, emphasis, warnings or zero counts.
- **Don't** use red anywhere but recording, pause marks and destructive actions.
- **Don't** reuse the part line colours for anything other than part identity.
- **Don't** add uppercase tracked labels outside the departure board's column header.
- **Don't** put shadows on cards or rows; shadows belong to the sheet, modal, toast, dock and record button.
- **Don't** add a second typeface.
