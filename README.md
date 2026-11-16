# IELTS Speaking Trainer

Practice every predicted IELTS Speaking question (Sep–Dec 2026 predictions, updates 1–2, May–Aug forecast, Part 2/3 book): 1,153 questions.

- **Mock test** like the real exam: Part 1 → cue card (1 min prep, 2 min talk) → Part 3, with the questions read aloud
- **Mixed drill**, browse and search, starred questions
- **Voice recordings** for every question, as many takes as you like, with playback, self-scores and notes
- **Sign in with your Telegram username** (only people the admin adds); first password = username, then you set your own. Everything syncs between phone and PC; each account is private.
- **Gemini coach**: listens to a take and gives a transcript with pauses and fillers marked, band estimates, pronunciation notes, grammar fixes, more natural phrasing, a band-8 version to shadow, and phrases to save
- **Pause analysis** measured from the waveform (no AI): speaking time, pauses, longest pause, how long before you started
- **Study**: speaking structures, idioms, topic vocabulary and grammar (inversion, mixed conditionals, complex passives), a personal phrase notebook with spaced review, and a challenge mode to use a phrase in your answer
- 5-second microphone test, daily goal, band trend
- Works offline too; **Export / Import** backups; on desktop Chrome/Edge every take can also be saved as an audio file to a folder

Backend: Supabase (auth + Postgres + storage + the `api` Edge Function in `supabase/functions/api`, which holds the Gemini key server-side), schema in `supabase-schema.sql`, every row and file protected by row level security.

Open the site, allow the microphone, and start. On a phone, use "Add to Home Screen" to install it like an app.
