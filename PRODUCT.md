# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adil (@fforthosv), a high-school student in Kazakhstan, first languages Kazakh/Russian, with an IELTS exam booked within the next week (as of 16 Nov 2026), and a few friends he adds by Telegram username who are preparing too. He practises in two scenes equally: short bursts on the phone (between lessons, on the bus, earphones) and longer sessions at the desk on a Windows PC with headphones. Each friend practises alone; nobody sees anyone else's data.

## Product Purpose

Turn the weeks before the exam into as many real spoken answers as possible, each one heard back and improved. Success is the user walking into the test having said out loud answers to most predicted questions, having sat full mock tests under exam timing, and having replaced weak phrasing with better vocabulary.

A session serves one of four jobs, all confirmed as real:
1. Simulate the real exam (full mock: Part 1 → cue card with 1 min prep and 2 min talk → Part 3).
2. Quick reps: many random questions, fast, to build fluency.
3. Fix weak spots from coach feedback: pauses, fillers, grammar, vocabulary.
4. Learn to add vocabulary: phrases saved from feedback and study material, reviewed and then used in answers.

## Positioning

A trainer built on this cycle's actual predicted question bank (1,153 questions from the files the user collected: Sep–Dec 2026 predictions, two updates, May–Aug forecast, Part 2/3 book), with recordings of the user's own voice at the centre, pauses measured from the waveform, and a Gemini coach that listens to the audio and rewrites answers in natural spoken English rather than template phrases.

## Operating Context

- Phone browser (installed to home screen) and desktop Chrome/Edge; same account syncs both (Supabase).
- Microphone recording in the browser; the examiner voice reads questions aloud (speech synthesis).
- Exam conditions matter: in the real test the candidate hears questions rather than reads them; Part 2 has 1 minute prep with notes and up to 2 minutes speaking.
- Study material in the app comes from the user's course PDFs (speaking structures, Band 9 idioms, topic vocabulary, grammar: inversion, mixed conditionals, complex passives), with Russian glosses.

## Capabilities and Constraints

- Telegram-username login; only usernames the admin (@fforthosv) adds can sign in; first password = username, then changed.
- Admin panel: add/remove people, reset passwords, Gemini key and daily coach limit.
- Per take: audio, waveform pause stats, coach feedback (transcript with pauses/fillers, band estimates, pronunciation, grammar, better phrasing, band-8 version, phrases), self score, notes.
- Phrase notebook with spaced review; challenge mode (use a given phrase in an answer).
- Static site on GitHub Pages (single index.html + PWA files); Supabase for auth, database, storage and the `api` Edge Function.
- Undecided: exact exam date is not yet stored in the app (user said: within one week of 16 Nov 2026).
- The user picks the mode each time on opening (mock / quick reps / weak spots / vocabulary); the app does not decide for him.

## Evidence on Hand

- Real question bank (data inside index.html), real study material from `Fluent_Future_Speaking.pdf` and `Advanced_Vocabulary_Grammar_Speed-Dating` lesson.
- No testimonials, no user counts, no scores achieved yet: never fabricate any.

## Product Principles

1. Speaking out loud is the unit of progress; every screen should lead to the next answer recorded.
2. The exam is close: show what is left to do before test day, not vanity totals.
3. Feedback must be checkable: quote the user's own words and measured numbers, never vague praise.
4. Fit both scenes: one-handed on a phone, focused at a desk.
5. Each friend's practice is private.
6. No game mechanics: no streak pressure, badges, confetti or cheerleading. Progress is shown as plain facts.
7. Results are never buried: the latest takes and coach findings are reachable from where you practise.
8. Filters and settings exist but stay out of the way of the question being answered.

## Accessibility & Inclusion

English is the user's second language: interface copy stays plain; Russian glosses for vocabulary. Works one-handed on phones; readable in light and dark.
