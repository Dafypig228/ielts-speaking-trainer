import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { encode as msgpack } from "npm:@msgpack/msgpack@3";
import { encodeBase64, decodeBase64 } from "jsr:@std/encoding@1/base64";

const URL = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(URL, SRK, { auth: { persistSession: false, autoRefreshToken: false } });
const DOMAIN = "tg.ielts-trainer.app";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const j = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const norm = (u: unknown) => String(u ?? "").trim().replace(/^@/, "").toLowerCase();
const okName = (u: string) => /^[a-z0-9_]{3,32}$/.test(u);
const pw = (p: string) => "ist:" + p;
const emailOf = (u: string) => `${u}@${DOMAIN}`;

async function cfg(key: string, def = ""): Promise<string> {
  const { data } = await admin.from("app_config").select("value").eq("key", key).maybeSingle();
  return data?.value ?? def;
}
async function setCfg(key: string, value: string) {
  const { error } = await admin.from("app_config").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function findUser(username: string) {
  const email = emailOf(username);
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}
async function allUsers() {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    out.push(...data.users);
    if (data.users.length < 200) break;
  }
  return out;
}

/* ---------------- coach ---------------- */
const STYLE = `How you write (this matters as much as the content):
- Sound like a real, experienced IELTS teacher talking to one student after class. Plain words, contractions, short and long sentences mixed. Have an opinion; say what actually worked and what didn't.
- Be specific: quote the student's exact words when you point something out.
- No flattery, no "Great job!", no "Overall, this is a solid answer". If something is good, say exactly what and why in a few words.
- Never use these words: delve, crucial, pivotal, vibrant, tapestry, testament, showcase, underscore, highlight (as a verb), foster, enhance, landscape (abstract), intricate, seamless, robust, leverage, additionally, moreover, furthermore, notably, it's worth noting, in today's world, navigate (abstract).
- No em dashes. No "not only X but Y" or "it's not just X, it's Y" patterns. Don't group things in threes just to sound complete. No bold, no emojis, no headings inside strings.
- Rewrites and suggested phrases must sound like natural SPOKEN English from a confident real person (contractions, normal rhythm, a little informality is fine), not like a written essay and not like memorised exam templates. Examiners mark down chunks that sound rehearsed, so prefer natural collocations over showy idioms; suggest an idiom only if it genuinely fits.`;

const COURSE = `The student is also studying this course material. Where one of these fits the answer naturally, suggest it (at most two per answer, and only if it would sound natural):
Structures: "To be perfectly honest, I'd say that...", "What strikes me the most is...", "If I had to choose, I'd probably go for...", "Compared to the past, nowadays people tend to...", "This is largely because...", "A good example that comes to mind is...", "Well, it really depends on the situation...", "Looking back, I realise that...", "At the end of the day, what really matters is...".
Idioms: once in a blue moon, piece of cake, break the ice, hit the nail on the head, burn the midnight oil, cost an arm and a leg, under the weather, rule of thumb, over the moon, have a heart of gold, snowed under, fed up with, at a crossroads, go the extra mile, kill two birds with one stone, bite the bullet, play it safe, make ends meet.
Topic vocab: broaden one's horizons, learn the ropes, cutting-edge technology, tech-savvy, a double-edged sword, climb the career ladder, a dead-end job, carbon footprint, throwaway society, health-conscious, kick the habit, the rat race, generation gap, silver lining.
Grammar for Part 3: inversion (Rarely do people..., Not only is..., Had we acted earlier...), mixed conditionals (If I had studied medicine, I would be a doctor now), complex passives (It is widely believed that..., X is thought to...).`;

const DESCRIPTORS = `IELTS Speaking band descriptors (public version), condensed. Score each criterion separately by BEST FIT: pick the band whose description matches the answer most closely. A candidate does not have to meet every point of a band to get it.
FLUENCY AND COHERENCE
9: fluent, only rare repetition or self-correction; any hesitation is about content, not searching for words or grammar; fully coherent; develops topics fully.
8: fluent with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language; develops topics coherently.
7: speaks at length without noticeable effort or loss of coherence; may show some language-related hesitation at times, or some repetition/self-correction; uses a range of connectives and discourse markers with some flexibility.
6: willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation; uses a range of connectives but not always appropriately.
5: usually keeps going but relies on repetition, self-correction and/or slow speech; may over-use some connectives; simple speech is fluent but more complex communication causes fluency problems.
4: cannot respond without noticeable pauses; may speak slowly with frequent repetition and self-correction; links basic sentences with repetitive simple connectives; some breakdowns in coherence.
3: long pauses; limited ability to link simple sentences; only simple responses, often unable to convey the basic message.
LEXICAL RESOURCE
9: full flexibility and precision on all topics; idiomatic language used naturally and accurately.
8: wide resource used readily and flexibly for precise meaning; less common and idiomatic vocabulary used skilfully, occasional inaccuracies; paraphrases effectively.
7: uses vocabulary flexibly across topics; some less common and idiomatic vocabulary with some awareness of style and collocation, some inappropriate choices; paraphrases effectively.
6: wide enough vocabulary to discuss topics at length and make meaning clear despite inappropriacies; generally paraphrases successfully.
5: can talk about familiar and unfamiliar topics but with limited flexibility; attempts paraphrase with mixed success.
4: can talk about familiar topics but only basic meaning on unfamiliar ones; frequent errors in word choice; rarely paraphrases.
GRAMMATICAL RANGE AND ACCURACY
9: full range of structures, naturally and appropriately; consistently accurate apart from native-speaker-like slips.
8: wide range used flexibly; majority of sentences error-free, only very occasional inappropriacies or non-systematic errors.
7: range of complex structures with some flexibility; frequently error-free sentences, though some mistakes persist.
6: mix of simple and complex structures with limited flexibility; may make frequent mistakes with complex structures, but these rarely cause comprehension problems.
5: basic sentence forms with reasonable accuracy; limited range of complex structures, usually with errors that may cause some comprehension problems.
4: basic sentence forms and some correct simple sentences, subordinate structures rare; errors frequent and may cause misunderstanding.
PRONUNCIATION
9: full range of features with precision and subtlety; sustains flexible use; effortless to understand.
8: wide range of features; sustains flexible use with occasional lapses; easy to understand throughout; L1 accent has minimal effect on intelligibility.
7: all positive features of 6 and some, not all, of 8.
6: range of features with mixed control; some effective use but not sustained; generally understood throughout, though some words or sounds are mispronounced and reduce clarity at times.
5: all positive features of 4 and some, not all, of 6.
4: limited range of features; attempts control but lapses are frequent; mispronunciations frequent and cause some difficulty for the listener.
Scoring rules: a Kazakh or Russian accent is NOT an error in itself; only mark down pronunciation that makes words hard to understand. Pauses spent thinking about WHAT to say are acceptable even at band 8; mark down pauses spent searching for words or grammar. A single short answer gives limited evidence: in Part 1, a short but natural, accurate answer can still score 6.5 to 7; don't drop a band just because an answer is brief, but say it should be longer. Real examiners are fair, not stingy: if an answer sits between two bands, give the half band between them.`;

function questionText(q: any) {
  if (!q) return "";
  if (q.part === 2) return `Part 2 cue card: ${q.text}\nYou should say: ${(q.bullets || []).join("; ")}`;
  return `Part ${q.part} question: ${q.text}`;
}

async function gemini(parts: any[], json = true, temperature = 0.6, fast = false) {
  const key = await cfg("gemini_key");
  if (!key) throw Object.assign(new Error("The admin hasn't added a Gemini API key yet."), { code: "no_key" });
  const models = fast ? ["gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-2.5-flash"] : [...new Set([await cfg("model", "gemini-flash-latest"), "gemini-flash-latest", "gemini-2.5-flash"])];
  let last = "";
  for (const m of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}), ...(fast && m === "gemini-2.5-flash" ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
      }),
    });
    if (r.status === 404) { last = `model ${m} not found`; continue; }
    const t = await r.text();
    if (!r.ok) {
      let msg = t.slice(0, 300);
      try { msg = JSON.parse(t).error.message; } catch { /* keep */ }
      throw Object.assign(new Error("Gemini: " + msg), { code: r.status === 429 ? "gemini_quota" : r.status === 400 || r.status === 403 ? "gemini_key" : "gemini_error" });
    }
    const d = JSON.parse(t);
    const text = (d.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
    if (!text) throw Object.assign(new Error("Gemini returned an empty answer (" + (d.candidates?.[0]?.finishReason || d.promptFeedback?.blockReason || "unknown") + ")"), { code: "gemini_empty" });
    if (!json) return { text, model: m };
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    return { data: JSON.parse(clean), model: m };
  }
  throw Object.assign(new Error("No Gemini model available: " + last), { code: "gemini_model" });
}

async function refund(userId: string, used: number) {
  const day = new Date().toISOString().slice(0, 10);
  await admin.from("ai_usage").upsert({ user_id: userId, day, count: Math.max(0, used - 1) });
}
async function bumpUsage(userId: string) {
  if (!(await cfg("gemini_key"))) throw Object.assign(new Error("The admin hasn't added a Gemini API key yet."), { code: "no_key" });
  const day = new Date().toISOString().slice(0, 10);
  const limit = parseInt(await cfg("daily_limit", "60")) || 60;
  const { data } = await admin.from("ai_usage").select("count").eq("user_id", userId).eq("day", day).maybeSingle();
  const n = data?.count ?? 0;
  if (n >= limit) throw Object.assign(new Error(`Daily coach limit reached (${limit}). It resets tomorrow.`), { code: "limit" });
  await admin.from("ai_usage").upsert({ user_id: userId, day, count: n + 1 });
  return { used: n + 1, limit };
}

function fmtPauses(stats: any) {
  if (!stats) return "No pause data.";
  const ps = (stats.pauses || []).map((p: number[]) => `${p[0].toFixed(1)}s (lasted ${p[1].toFixed(1)}s)`).join(", ");
  return `Measured from the waveform: total ${stats.dur?.toFixed?.(1)}s, speaking ${Math.round((stats.speechRatio || 0) * 100)}% of the time, started talking after ${stats.startDelay?.toFixed?.(1)}s, ${stats.nPause} pauses of 0.6s or longer, ${stats.nLong} of 1.5s or longer, longest ${stats.longest?.toFixed?.(1)}s. Pauses start at: ${ps || "none"}.`;
}

async function analyze(body: any, userId: string) {
  const q = body.question || {};
  if (!userId && !(await cfg("gemini_key"))) throw Object.assign(new Error("The coach isn't set up yet."), { code: "no_key" });
  const usage = userId ? await bumpUsage(userId) : { used: 0, limit: 0 };
  const targets: string[] = Array.isArray(body.targets) ? body.targets.filter((x: unknown) => typeof x === "string").slice(0, 4) : [];
  const target = (body.target ? `\nThe student was challenged to use this naturally in the answer: "${body.target}". Say whether they used it and whether it sounded natural.` : "") +
    (targets.length ? `\nBefore answering, the app suggested these phrases: ${targets.map((t) => `"${t}"`).join(", ")}.` : "");
  const goal = Number(body.goal) >= 4 && Number(body.goal) <= 9 ? Number(body.goal) : null;
  const level = Number(body.level) >= 3 && Number(body.level) <= 9 ? Number(body.level) : null;
  const higher = goal ? Math.min(9, goal + 1) : 8;
  const goalText = goal
    ? `The student's goal is band ${goal}.${level ? ` Their recent checked answers average about band ${level}.` : ""} Aim everything at that goal: put first the changes that would move THIS answer toward band ${goal}, in order of how many band points they cost. Don't push words, idioms or grammar that a band ${goal} speaker wouldn't naturally use; suggest what is realistic for them now.`
    : `The student hasn't set a goal band; assume they are aiming for band 7.`;
  const h = body.history && typeof body.history === "object" ? body.history : null;
  const names = (x: unknown) => (Array.isArray(x) ? x.map((r: any) => (typeof r === "string" ? r : `${r.rule} (in ${r.in_answers} earlier answers)`)).slice(0, 8).join("; ") : "");
  const histText = h && Number(h.checked) >= 2 ? `What this student's earlier checked answers show (${Number(h.checked)} so far).
Mistakes that keep repeating: ${names(h.repeating) || "none yet"}.
Mistakes that have disappeared: ${names(h.gone) || "none yet"}.
Corrected in their previous answer: ${names(h.last_corrected) || "nothing"}.
How to use this: a repeating mistake that shows up again matters more than a one-off slip, so give it more space and count it honestly; but don't force it to be the root problem if something else costs more in this answer. Don't praise or mention the disappeared ones unless they come back. This student applies corrections fast and tends to over-apply them (for example adding "the" before country names after being told about missing articles), so check for the opposite of what was corrected last time. For "rule" in grammar items use one of these exact names when it fits: "articles a/an/the", "verb tense", "subject-verb agreement", "plural / countable", "prepositions", "word form", "word choice".` : "";
  const focus = body.focus && typeof body.focus.key === "string" ? { label: String(body.focus.label || body.focus.key).slice(0, 80), target: String(body.focus.target || "").slice(0, 200) } : null;
  const prev = body.prev && typeof body.prev === "object" && typeof body.prev.transcript === "string" ? body.prev : null;
  const change = typeof body.change === "string" ? body.change.slice(0, 300).trim() : "";
  const p2notes = q.part === 2 && typeof body.p2notes === "string" ? body.p2notes.replace(/[`$\\]/g, " ").slice(0, 600).trim() : "";
  const examDays = body.examDays != null && isFinite(Number(body.examDays)) ? Number(body.examDays) : null;
  const loopText = [
    focus ? `The student is working on ONE focus right now: "${focus.label}"${focus.target ? ` (${focus.target})` : ""}. Judge honestly whether this answer hits it.` : "",
    prev ? `This is a RETRY of the same question. In the previous try the root problem was: "${String(prev.problem || "").slice(0, 300)}". Steps they were given: ${(Array.isArray(prev.steps) ? prev.steps : []).map((x: unknown) => String(x).slice(0, 160)).slice(0, 3).join(" / ") || "none"}. Previous transcript: "${String(prev.transcript).slice(0, 2500)}". Previous bands: ${JSON.stringify(prev.bands || {}).slice(0, 200)}.${change ? ` Before retrying, the student wrote what they would change: "${change}".` : ""} Compare the two tries: this check is about whether the change happened, not a fresh report.${Number(prev.misses) >= 2 ? ` They have missed this focus ${Number(prev.misses)} times: in verdict.next state the rule plainly and give one correct example sentence built from their own words.` : ""}` : "",
    examDays != null && examDays >= 0 && examDays <= 7 ? `The exam is in ${examDays} day(s): choose fix_first only from habits that can change in a few days (answer length, extending with a reason or example, not stopping mid-sentence, paraphrasing the question, one repeated grammar slip), not long-term vocabulary range.` : "",
  ].filter(Boolean).join("\n");
  const prompt = `${STYLE}

${DESCRIPTORS}

${COURSE}

${goalText}

${histText}

${loopText}

Rules for everything you write: never praise the person ("great job", "well done", "excellent"); describe what they did and what to do. When you are torn between two bands, give the lower one. Pronunciation points only for words a listener would misunderstand or struggle with; a foreign accent on its own is not a problem.

You are listening to a recording of an IELTS Speaking candidate (their first language is Kazakh/Russian).
${questionText(q)}
Recording length: ${Math.round(body.dur || 0)} seconds. ${q.part === 2 ? "Target: 1.5 to 2 minutes." : q.part === 3 ? "Target: about 40-60 seconds with reasons and examples." : "Target: about 20-30 seconds, 2-4 sentences."}
${fmtPauses(body.stats)}${target}

Listen carefully to the audio, then return ONLY a JSON object with these keys:
"transcript": verbatim transcript of what they actually said, including um, uh, er, repetitions, self-corrections and unfinished words. Put pause markers like [pause 1.8s] where the measured pauses of 1s or longer happen (use the timings above to place them).
"bands": {"fc": number, "lr": number, "gra": number, "p": number, "overall": number} IELTS bands in 0.5 steps, scored by best fit against the band descriptors above, the way a trained, fair examiner would: neither inflated nor harsh. Only an answer that is off-topic or just a few words should score very low.
"band_reasons": {"fc": ..., "lr": ..., "gra": ..., "p": ...} one short sentence each saying which descriptor the answer matches and what it would need for the next half band, quoting their words where useful.
"summary": 2-3 sentences, the most important thing about this answer.
"fluency": 2-4 sentences about pauses, hesitation, fillers and speed: say where the long pauses were (quote the words around them) and what probably caused them (searching for a word, planning the next idea, grammar).
"pronunciation": 1-3 sentences about specific words or sounds you actually heard as unclear, wrong word stress, or flat intonation. If it was clear, say so briefly.
"fix_first": the ROOT problem of this answer, as an object {"problem": one sentence naming it and quoting their words, "why": one sentence on which band criterion it pulls down and roughly how much, "steps": 2-3 concrete things to do next time, at least one being a ready-made phrase or sentence frame they can actually say, "drill": one exercise they can do in the next minute in this app (for example "Answer again and don't stop: if you need time, say 'let me think' instead of going silent")}.
How to choose the root problem: pick the single issue that costs the most band points, not the easiest one to name. Use the measured data above. If there are pauses of 1.5 s or longer, or they started talking after more than 2 s, or the answer is far below the target length, the root problem is almost always fluency or answer length, so address that unless something bigger is wrong (off-topic, very hard to understand). Never skip measured long pauses; never pick a small grammar slip when the real problem is hesitation.
"pauses": array, one item for each measured pause of 1.2 s or longer (at most 5, longest first): {"at": its start time in seconds, copied from the measured list, "len": its length in seconds, "before": the 2-5 words said just before it, "after": the first 2-4 words after it, "cause": what most likely caused it, in a few plain words (e.g. "looking for the word 'tradition'", "didn't know what to say next", "fixing grammar mid-sentence"), "instead": a short natural phrase that would fill exactly this gap (fitting the sentence), "tip": how to avoid this pause next time, under 14 words}. Empty array if there were no such pauses.
"grammar": array (0-5) of {"said": exact words, "better": corrected version, "why": under 12 words, "rule": the general rule in 2-6 lowercase words, worded the same way every time for the same kind of mistake (for example "like + -ing", "past simple for finished time", "articles a/an/the", "plural -s", "third person -s", "present perfect with since/for")}.
"repeats": array (0-2) of {"word": a word or filler they overused in this answer (e.g. "very", "good", "like", "basically"), "times": how many times, "instead": 2-3 natural alternatives}. Empty array if nothing was overused.
"used_targets": array with one item per suggested phrase, in the same order: {"phrase": the phrase, "used": true if they used it or a close natural variant}. Empty array if no phrases were suggested.
"vocab": array (2-6) of {"said": their plain or awkward phrase, "better": [1-3 more natural or precise alternatives], "note": when you'd use it, under 15 words}.
"natural_version": their answer rewritten the way a confident band ${goal || 7} speaker would actually SAY it, keeping their own ideas, facts and personal details, similar length, spoken style. It should be reachable for them, not showy.
"higher_version": the same answer the way a band ${higher} speaker would say it (more precise words, more flexible grammar, still natural spoken English), same ideas.
"target_band": ${goal || 7}.
"phrases": array of 3-4 useful phrases for this topic: {"phrase": ..., "meaning_en": short plain-English meaning, "meaning_ru": short Russian meaning, "example": one natural spoken example}.
"next_time": one concrete thing to do differently next time.
${p2notes ? `"notes_check": {"used": the words or ideas from their preparation notes that they actually talked about, "missed": the ones from the notes they never got to}. Their notes were: "${p2notes}".
` : ""}"on_topic": {"ok": true if the answer actually answers this question, "note": if not, one sentence on what was asked and what they talked about instead, else ""}.
"error_count": the total number of grammar and word-form errors in the whole answer (count every one, not only the ones listed in "grammar"; a slip they corrected themselves doesn't count).
"bands_range": {"low": number, "high": number} the overall band range you are confident in, 0.5 steps, high minus low at most 1; "low" is what you would bet on.
${focus ? `"focus_check": {"hit": true or false, did this answer do "${focus.label}", "quote": their words that show it, or the place where they missed it, "note": one sentence: what exactly to do differently, or what made it work}.
` : ""}${prev ? `"verdict": {"fixed": "yes", "partly" or "no": is the previous root problem fixed in this try, "quote": their words from THIS try that show it, "change": one concrete sentence comparing this try with the previous one, "next": the one thing to do on the next new question}.
` : ""}Also add to every item of "pauses" a key "where": "mid" if the pause is inside a sentence or clause (between words that belong together), "end" if it is between sentences or ideas. Add to every item of "grammar", "vocab" and "pron_words" a key "conf": "high" if you are sure, "medium" if it may come from how the audio sounded.
"audio_quality": "ok" if the speech is clear enough to judge individual sounds; "noisy" if background noise, music or other voices make sounds hard to judge; "quiet" if the voice is too quiet or far from the microphone.
"pron_words": array (0-5) of {"word": the word as it should be said, "heard": how it actually sounded, as a simple respelling (e.g. "VEJ-uh-tuh-bul", "zis" for "this"), "tip": how to fix it, under 12 words}. Only words you clearly heard said wrongly (sounds or word stress). If audio_quality is not "ok", return [] and say in "pronunciation" that the recording was too noisy or quiet to judge sounds.
${q.part === 2 ? `"card_check": array with one item per "You should say" point, in the card's order: {"point": the point as written on the card, "covered": true if they actually talked about it, "from": roughly the second they started on it (number, or null if not covered), "to": roughly the second they moved on, "note": under 12 words, e.g. "covered in one sentence, needs a detail"}.
"ran_out": true if the talk ended before all points were covered or stopped short of a natural ending.
` : ""}"follow_up": ${q.part === 3 ? 'one follow-up question a real examiner would ask next, picking up something specific the candidate said (ask why, for an example, a comparison, or about society or the future). Natural spoken English, at most 20 words.' : 'empty string ""'}`;
  const parts: any[] = [{ text: prompt }];
  if (body.audio) parts.push({ inline_data: { mime_type: body.mime || "audio/wav", data: body.audio } });
  let r;
  try { r = await gemini(parts, true, 0.3); } catch (e) { if (userId) await refund(userId, usage.used); throw e; }
  // IELTS overall = mean of the four criteria; .25 rounds up to .5 and .75 up to the next whole band
  if (r.data) r.data.used_targets = targets.length && Array.isArray(r.data.used_targets) ? r.data.used_targets.filter((x: any) => targets.includes(x?.phrase)) : [];
  const b = r.data?.bands;
  if (b && ["fc", "lr", "gra", "p"].every((k) => typeof b[k] === "number" || !isNaN(Number(b[k])))) {
    b.overall = ieltsRound((Number(b.fc) + Number(b.lr) + Number(b.gra) + Number(b.p)) / 4);
  }
  const d = r.data || {};
  if (b && b.overall != null) {
    const ov = Number(b.overall), br = d.bands_range || {};
    let lo = Number(br.low), hi = Number(br.high);
    if (!isFinite(lo) || lo > ov) lo = ov;
    if (!isFinite(hi) || hi < ov) hi = ov;
    lo = Math.floor(lo * 2) / 2; hi = Math.ceil(hi * 2) / 2;
    if (hi - lo > 1) hi = lo + 1;
    d.bands_range = { low: lo, high: hi };
  }
  if (d.error_count != null) d.error_count = Math.max(0, Math.round(Number(d.error_count)) || 0);
  if (d.verdict && !["yes", "partly", "no"].includes(d.verdict.fixed)) d.verdict.fixed = "partly";
  if (!prev) delete d.verdict;
  if (!focus) delete d.focus_check;
  return { ...d, model: r.model, usage };
}

async function dispute(body: any, userId: string) {
  const pt = body.point || {};
  const kind = ["grammar", "vocab"].includes(pt.kind) ? pt.kind : "grammar";
  const said = String(pt.said || "").slice(0, 300), coach = String(pt.coach || "").slice(0, 300), arg = String(body.argument || "").slice(0, 600).trim();
  if (!said || !arg) throw Object.assign(new Error("Write why you think it's right."), { code: "bad" });
  const usage = await bumpUsage(userId);
  const prompt = `You are a strict, fair IELTS examiner re-checking ONE point of feedback from scratch. Never praise.
${body.question ? questionText(body.question) : ""}
The student's full answer (transcript): "${String(body.transcript || "").slice(0, 3000)}"
The coach marked this ${kind === "grammar" ? "grammar mistake" : "word choice"}: they said "${said}", the coach suggested "${coach}".
Step 1: before reading the student's argument, decide from the rules of English alone whether "${said}" is wrong in this sentence. Write that decision in "first".
Step 2: now read the student's argument: "${arg}"
Change your step-1 decision only if the argument gives real evidence that it was wrong: a grammar rule, a dictionary meaning, or clear standard usage. Ignore confidence, tone, repetition, or claims about teachers or other apps.
Return ONLY JSON: {"first": your step-1 decision in one sentence, "verdict": "coach_right" if the student's words are wrong, "student_right" if they are acceptable in this sentence, "unclear" if both are acceptable or it depends on the accent of the recording, "reason": one or two plain sentences naming the rule${kind === "grammar" ? ', and if coach_right, the correct sentence' : ""}}.`;
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.2); } catch (e) { await refund(userId, usage.used); throw e; }
  const d = r.data || {};
  if (!["coach_right", "student_right", "unclear"].includes(d.verdict)) d.verdict = "unclear";
  return { verdict: d.verdict, reason: String(d.reason || ""), first: String(d.first || ""), usage };
}

async function sharers(except: string): Promise<string[]> {
  const { data } = await admin.from("meta").select("user_id,share:data->set->shareAnswers").limit(1000);
  return (data || []).filter((r: any) => r.user_id !== except && r.share === true).map((r: any) => r.user_id);
}
async function friendPick(body: any, userId: string) {
  const ids = await sharers(userId);
  const meShares = (await admin.from("meta").select("share:data->set->shareAnswers").eq("user_id", userId).maybeSingle()).data?.share === true;
  if (!ids.length) return { none: true, meShares };
  const { data } = await admin.from("attempts").select("user_id,id,qid,part,dur,path,ai").in("user_id", ids).eq("deleted", false).not("path", "is", null).not("ai", "is", null).order("ts", { ascending: false }).limit(80);
  const seen = new Set(Array.isArray(body.seen) ? body.seen.map(String) : []);
  const mine = new Set(Array.isArray(body.qids) ? body.qids.map(String) : []);
  const ok = (data || []).filter((a: any) => a.ai?.bands?.overall != null && a.dur >= 8 && !seen.has(a.user_id + "|" + a.id));
  if (!ok.length) return { none: true, empty: true, meShares };
  const pref = ok.filter((a: any) => mine.has(a.qid));
  const l = pref.length ? pref : ok;
  const a: any = l[Math.floor(Math.random() * l.length)];
  const { data: su } = await admin.storage.from("recordings").createSignedUrl(a.path, 900);
  if (!su?.signedUrl) return { none: true, empty: true, meShares };
  return { key: a.user_id + "|" + a.id, qid: a.qid, part: a.part, dur: a.dur, audio: su.signedUrl, meShares };
}
async function friendRate(body: any, userId: string) {
  const [uid, id] = String(body.key || "").split("|");
  if (!uid || !id || uid === userId) throw Object.assign(new Error("That answer is gone."), { code: "bad" });
  if (!(await sharers(userId)).includes(uid)) throw Object.assign(new Error("Your friend stopped sharing this answer."), { code: "gone" });
  const { data: a } = await admin.from("attempts").select("ai,qid").eq("user_id", uid).eq("id", id).eq("deleted", false).maybeSingle();
  if (!a?.ai?.bands) throw Object.assign(new Error("That answer is gone."), { code: "gone" });
  const ff = a.ai.fix_first;
  return { bands: a.ai.bands, range: a.ai.bands_range || null, problem: ff && typeof ff === "object" ? String(ff.problem || "") : String(ff || a.ai.next_time || ""), transcript: String(a.ai.transcript || "").slice(0, 3000) };
}

function supClean(p: any) {
  const httpsOk = (u: unknown) => typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) && u.length <= 600;
  const blocks = (Array.isArray(p?.blocks) ? p.blocks : []).slice(0, 40).map((b: any) => {
    const type = ["text", "image", "split", "button"].includes(b?.type) ? b.type : null;
    if (!type) return null;
    const o: any = { id: String(b.id || crypto.randomUUID()).slice(0, 40), type };
    if (type === "text" || type === "split") o.text = String(b.text || "").slice(0, 3000);
    if (type === "image" || type === "split") { o.img = httpsOk(b.img) ? b.img : ""; o.alt = String(b.alt || "").slice(0, 200); o.size = ["s", "m", "l"].includes(b.size) ? b.size : "m"; }
    if (type === "split") o.side = b.side === "right" ? "right" : "left";
    if (type === "button") { o.label = String(b.label || "Support").slice(0, 60); o.url = httpsOk(b.url) ? b.url : ""; }
    return o;
  }).filter(Boolean);
  return { blocks, at: Date.now() };
}
async function supPage() { try { const p = JSON.parse(await cfg("support_page", "null")); return p && Array.isArray(p.blocks) ? p : null; } catch { return null; } }
async function supImg(body: any) {
  const mime = String(body.mime || "");
  const ext = ({ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" } as Record<string, string>)[mime];
  if (!ext) throw Object.assign(new Error("Only PNG, JPG, WebP or GIF images."), { code: "bad" });
  const b64 = String(body.b64 || "");
  if (b64.length > 5_600_000) throw Object.assign(new Error("That image is over 4 MB."), { code: "bad" });
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const sig = [...bytes.slice(0, 4)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const okSig = ext === "png" ? sig === "89504e47" : ext === "jpg" ? sig.startsWith("ffd8ff") : ext === "gif" ? sig.startsWith("47494638") : sig === "52494646" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!okSig) throw Object.assign(new Error("That file is not a real image."), { code: "bad" });
  await admin.storage.createBucket("support", { public: true }).catch(() => {});
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const up = await admin.storage.from("support").upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw new Error("Upload failed: " + up.error.message);
  return { url: admin.storage.from("support").getPublicUrl(path).data.publicUrl };
}

async function ideas(body: any, userId: string) {
  const q = body.question || {};
  const { data: cached } = await admin.from("ideas").select("data").eq("qid", body.qid).maybeSingle();
  if (cached && !body.fresh) return { ...cached.data, cached: true };
  const usage = await bumpUsage(userId);
  const prompt = `${STYLE}

${COURSE}

Help an IELTS candidate (aiming for band 7+) prepare for this question.
${questionText(q)}

Return ONLY a JSON object:
"angles": 3 different directions they could take, one sentence each, concrete (real-life details a teenager in Kazakhstan might actually have).
"phrases": 6 natural phrases or collocations for this topic: {"phrase", "meaning_en", "meaning_ru", "example"}.
"opening": one natural first sentence (not a template like "That's an interesting question").
"sample": a sample answer as a real person would say it out loud (${q.part === 2 ? "about 230-260 words, covering every bullet, with a small personal story" : q.part === 3 ? "about 90-120 words, a clear view, a reason and an example" : "about 45-60 words"}). Use contractions and normal spoken rhythm.
${q.part === 2 ? '"outline": 4 short note lines a student could jot down in the 1 minute of preparation.' : ""}`;
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.8); } catch (e) { await refund(userId, usage.used); throw e; }
  const data = { ...r.data, model: r.model };
  await admin.from("ideas").upsert({ qid: body.qid, data });
  return { ...data, usage };
}

async function followup(body: any, userId: string) {
  const q = body.question || {};
  const usage = await bumpUsage(userId);
  const tr = typeof body.transcript === "string" ? body.transcript.slice(0, 4000) : "";
  const prompt = `You are a friendly, experienced IELTS Speaking examiner in Part 3 (the discussion).
${questionText(q)}
${tr ? `The candidate answered: "${tr}"` : "The candidate's answer is in the audio."}

Ask ONE follow-up question the way a real examiner would: pick up something specific the candidate said and ask them to explain why, give an example, compare, or say whether it applies to society or the future. Natural spoken English, at most 20 words, no preamble, no praise.
If the audio is silent, mostly noise, or not in English, set "question" to "" and "heard_ok" to false.
Return ONLY JSON: {"question": "...", "heard_ok": true}`;
  const parts: any[] = [{ text: prompt }];
  if (!tr && body.audio) parts.push({ inline_data: { mime_type: body.mime || "audio/wav", data: body.audio } });
  let r;
  try { r = await gemini(parts, true, 0.7); } catch (e) { await refund(userId, usage.used); throw e; }
  return { question: String(r.data.question || "").trim(), heard_ok: r.data.heard_ok !== false, model: r.model, usage };
}

function ieltsRound(avg: number) {
  const whole = Math.floor(avg + 1e-9), frac = avg - whole;
  return frac < 0.25 - 1e-9 ? whole : frac < 0.75 - 1e-9 ? whole + 0.5 : whole + 1;
}

async function mockReport(body: any, userId: string) {
  const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
  if (!items.length) throw Object.assign(new Error("No checked answers in this test."), { code: "bad_request" });
  const goal = Number(body.goal) >= 4 && Number(body.goal) <= 9 ? Number(body.goal) : null;
  const usage = await bumpUsage(userId);
  const lines = items.map((it: any, i: number) => `Answer ${i + 1} (Part ${it.part}, ${Math.round(it.dur || 0)} s). Question: ${String(it.question || "").slice(0, 200)}
Transcript: ${String(it.transcript || "").slice(0, 1500)}
Coach bands for this answer: ${JSON.stringify(it.bands || {})}. Main problem noted: ${String(it.fix || "").slice(0, 200)}${(it.pauses || []).length ? `. Long pauses: ${JSON.stringify(it.pauses).slice(0, 300)}` : ""}`).join("\n\n");
  const prompt = `${STYLE}

${DESCRIPTORS}

You are an IELTS Speaking examiner giving the result of a full mock test (Parts 1, 2 and 3) to a candidate whose first language is Kazakh/Russian.${goal ? ` Their goal is band ${goal}.` : ""}
Examiners score the whole performance, not an average of single answers: Part 2 and Part 3 show more of what the candidate can do, so they count for more than short Part 1 answers. Use the band descriptors and the evidence below.

${lines}

Return ONLY a JSON object:
"bands": {"fc": number, "lr": number, "gra": number, "p": number} for the whole test, 0.5 steps, best fit, fair.
"band_reasons": {"fc": ..., "lr": ..., "gra": ..., "p": ...} one sentence each: which descriptor fits and what the next half band needs, with a quote from the test.
"top_issues": array of up to 3 things that cost the most band points across the whole test, most costly first: {"issue": plain name, "evidence": where it happened, with a short quote and the part, "fix": one concrete thing to do in the next few days, including a phrase or frame they can say}.
"strengths": array of 2 things that already work, specific, with a short quote.
"plan": array of 3 short, concrete practice tasks for the days before the test, using this app (Part 1 quick-fire, Part 2 cue cards, Part 3 discussion, Repeat after, practising a mistake).`;
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.3); } catch (e) { await refund(userId, usage.used); throw e; }
  const b = r.data?.bands;
  if (b && ["fc", "lr", "gra", "p"].every((k) => !isNaN(Number(b[k])))) b.overall = ieltsRound((Number(b.fc) + Number(b.lr) + Number(b.gra) + Number(b.p)) / 4);
  return { ...r.data, model: r.model, usage };
}

async function paraphrase(body: any, userId: string) {
  const usage = await bumpUsage(userId);
  const words: string[] = Array.isArray(body.avoid) ? body.avoid.filter((x: unknown) => typeof x === "string").slice(0, 6) : [];
  const prompt = `${STYLE}

An IELTS candidate (first language Kazakh/Russian) is practising paraphrase. The examiner asked: "${String(body.question || "").slice(0, 300)}"
The candidate tried to start their answer WITHOUT repeating these key words or their word family: ${words.map((w) => `"${w}"`).join(", ")}.
Listen to the recording (only the first sentence or two matter).
Return ONLY JSON:
"transcript": what they said, verbatim.
"heard_ok": false if the audio is silent, mostly noise, or not English; otherwise true.
"repeated": array of the key words (or same-family words, e.g. "reading" for "read") they repeated. Small words like "do", "you", "like" don't count unless they are a key word.
"paraphrased": array of the natural replacements they actually used (e.g. "I'm a big fan of books" for "enjoy reading").
"ok": true if they avoided the key words AND the opening sounds natural and answers the question.
"better": array of 2 natural spoken openings that paraphrase the key words, each under 15 words.
"tip": one short sentence, specific to what they said.`;
  const parts: any[] = [{ text: prompt }];
  if (body.audio) parts.push({ inline_data: { mime_type: body.mime || "audio/wav", data: body.audio } });
  let r;
  try { r = await gemini(parts, true, 0.3); } catch (e) { if (userId) await refund(userId, usage.used); throw e; }
  return { ...r.data, model: r.model, usage };
}

const W_DESCRIPTORS = `IELTS Writing Task 2 band descriptors (public version), condensed. Each criterion gets a WHOLE band (5, 6, 7...), by best fit.
TASK RESPONSE
8: sufficiently addresses all parts; well-developed response with relevant, extended and supported ideas.
7: addresses all parts; clear position throughout; main ideas extended and supported, though there may be over-generalisation or supporting ideas may lack focus.
6: addresses all parts although some more fully than others; relevant position, though conclusions may be unclear or repetitive; relevant main ideas but some inadequately developed or unclear.
5: addresses the task only partially; expresses a position but development is not always clear; limited or insufficiently developed ideas, may be irrelevant detail.
COHERENCE AND COHESION
8: sequences information and ideas logically; manages all aspects of cohesion well; paragraphing sufficient and appropriate.
7: logically organises information; clear progression throughout; range of cohesive devices used appropriately, with some under- or over-use; clear central topic in each paragraph.
6: arranges information coherently with clear overall progression; cohesive devices effective but cohesion within or between sentences may be faulty or mechanical; referencing not always clear; paragraphing not always logical.
5: some organisation but may lack overall progression; inadequate, inaccurate or over-used cohesive devices; may be repetitive; paragraphing may be inadequate.
LEXICAL RESOURCE
8: wide range used fluently and flexibly for precise meaning; skilful use of uncommon items with occasional inaccuracies in word choice and collocation; rare errors in spelling or word formation.
7: sufficient range for some flexibility and precision; less common items with some awareness of style and collocation; occasional errors in word choice, spelling or word formation.
6: adequate range for the task; attempts less common vocabulary with some inaccuracy; some errors in spelling or word formation, but they do not impede communication.
5: limited range, minimally adequate; noticeable errors in spelling or word formation that may cause some difficulty for the reader.
GRAMMATICAL RANGE AND ACCURACY
8: wide range of structures; the majority of sentences are error-free; only very occasional errors.
7: variety of complex structures; frequent error-free sentences; good control of grammar and punctuation with a few errors.
6: mix of simple and complex forms; some errors in grammar and punctuation but they rarely reduce communication.
5: limited range; attempts complex sentences but these tend to be less accurate than simple ones; frequent errors that can cause some difficulty for the reader.
Scoring rules: real examiners are fair, not stingy. Essays with wide, accurate language and a position that is clear enough score 8 even with small gaps in reasoning, a conditional opinion or a close paraphrase of the topic; do not mark those down a band. Small logic points are polish, not band-losers. Under 250 words lowers Task Response. Spelling mistakes that leave the meaning clear fit band 6 vocabulary, not 5.`;

async function essay(body: any, userId: string) {
  const text = String(body.text || "").trim().slice(0, 6000);
  const promptQ = String(body.prompt || "").trim().slice(0, 800);
  if (text.length < 150 || !promptQ) throw Object.assign(new Error("Need the question and your essay."), { code: "bad_request" });
  const usage = await bumpUsage(userId);
  const goal = Number(body.goal) >= 4 && Number(body.goal) <= 9 ? Number(body.goal) : 7;
  const h = body.history && typeof body.history === "object" ? body.history : null;
  const names = (x: unknown) => (Array.isArray(x) ? x.map((r: any) => (typeof r === "string" ? r : r.rule)).slice(0, 8).join("; ") : "");
  const pw = Array.isArray(body.problem_words) ? body.problem_words.filter((x: unknown) => typeof x === "string").slice(0, 40).join(", ") : "";
  const prompt = `${STYLE}

${W_DESCRIPTORS}

You are checking an IELTS Academic Writing Task 2 essay by a student whose first languages are Kazakh and Russian (no articles in either). Their goal is band ${goal}.
Question: ${promptQ}
Written in ${Number(body.minutes) || "?"} minutes (limit 40), ${Number(body.words) || "?"} words (minimum 250).
${h ? `From their earlier checked work: mistakes that keep repeating: ${names(h.repeating) || "none yet"}. Corrected last time: ${names(h.last_corrected) || "nothing"}. This student applies corrections fast and tends to over-apply them, so look for the opposite of what was corrected last time.` : ""}
${pw ? `Words they have misspelled before: ${pw}.` : ""}

Essay:
"""
${text}
"""

Return ONLY a JSON object:
"bands": {"tr": n, "cc": n, "lr": n, "gra": n} whole bands, best fit, fair.
"band_reasons": {"tr": ..., "cc": ..., "lr": ..., "gra": ...} one sentence each: which descriptor fits and what the next band needs, quoting the essay.
"summary": 2 sentences: the one thing that costs the most band points in this essay, and the one thing to do differently next time. Concrete, no praise.
"errors": array of EVERY language error you find, in essay order, at most 25, grammar and word choice, not spelling: {"said": the exact wrong words copied from the essay (2 to 12 words, enough to find it), "better": the corrected words, "why": under 12 words, "rule": one of exactly "articles a/an/the", "verb tense", "subject-verb agreement", "plural / countable", "prepositions", "word form", "word choice", or another short lowercase name if none fits}. Count repeated errors each time; don't skip an error because it is the same kind as an earlier one.
"spelling": array of {"wrong": as written, "right": correct spelling, "in_task": true if the correct word is printed in the question}.
"position_ok": true only if the introduction answers the exact question asked (gives a clear position, or for a two-part / causes-solutions question names both parts) and the conclusion keeps the same position.
"position": {"quote": the sentence in the introduction that states their position, or "" if there is none, "fix": if position_ok is false, one sentence they could write instead, using their own idea; else ""}.
"overcorrection": one sentence if the essay shows the opposite of a recently corrected mistake (for example "the" before a country name or a plural used in general), quoting it; otherwise "".
"ideas": array of at most 3 Task Response or Coherence points that really cost marks: {"point": what is wrong in plain words, "where": a short quote, "fix": what to write there, as a concrete suggestion}. Empty array if the ideas and structure are fine for the goal band. Do not invent problems.
"keep": array of 1-2 specific things that already work, each with a short quote.
"corrected": the student's own essay with every error fixed, keeping their ideas, structure, sentences and level of vocabulary. Do not upgrade the style.
"higher_version": the same essay as a band ${Math.min(9, goal)} writer would produce it: same argument and paragraph plan, ideas extended where they were thin, 260-290 words, natural linking, plain accurate vocabulary rather than showy words.
"target_band": ${Math.min(9, goal)}.`;
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.3); } catch (e) { await refund(userId, usage.used); throw e; }
  const b = r.data?.bands;
  if (b && ["tr", "cc", "lr", "gra"].every((k) => !isNaN(Number(b[k])))) {
    for (const k of ["tr", "cc", "lr", "gra"]) b[k] = Math.round(Number(b[k]));
    b.overall = ieltsRound((b.tr + b.cc + b.lr + b.gra) / 4);
  }
  return { ...r.data, model: r.model, usage };
}

/* ---------------- reported topics from the public @cdireport page ---------------- */
function tgText(html: string) {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)));
}
function parseCdi(html: string) {
  const out: any[] = [];
  for (const chunk of html.split('tgme_widget_message_wrap').slice(1)) {
    const post = (chunk.match(/data-post="([^"]+)"/) || [])[1];
    const m = chunk.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (!post || !m) continue;
    const txt = tgText(m[1]);
    if (!/#writing/i.test(txt)) continue;
    const head = txt.split("\n")[0].replace(/[^\x20-\x7E]/g, "").trim();
    const [date, centre] = head.split(/\s+-\s+/);
    const grab = (a: RegExp, b: RegExp) => { const i = txt.search(a); if (i < 0) return ""; const rest = txt.slice(i).replace(a, ""); const j = rest.search(b); return (j < 0 ? rest : rest.slice(0, j)).replace(/[^\x20-\x7E‘-”—\n]/g, "").replace(/\s+/g, " ").trim(); };
    const t1 = grab(/Part\s*1\s*/i, /Part\s*2/i), t2 = grab(/Part\s*2\s*/i, /Report your questions|@cdireport_admin|cdireport\.t\.me/i);
    if (t2.length < 30) continue;
    const time = (chunk.match(/<time[^>]*datetime="([^"]+)"/) || [])[1] || "";
    out.push({ post, date: (date || "").trim(), centre: (centre || "").trim(), t1, t2, at: time });
  }
  return out;
}
async function reported() {
  let cache: any = null;
  try { cache = JSON.parse(await cfg("cdi_cache", "null")); } catch { /* none */ }
  if (cache && Date.now() - cache.ts < 6 * 3600e3) return cache.items;
  const items: any[] = []; let before = "";
  try {
    for (let page = 0; page < 14; page++) {
      const r = await fetch("https://t.me/s/cdireport" + (before ? "?before=" + before : ""), { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) break;
      const html = await r.text();
      items.push(...parseCdi(html));
      const ids = [...html.matchAll(/data-post="cdireport\/(\d+)"/g)].map((x) => Number(x[1]));
      if (!ids.length) break;
      before = String(Math.min(...ids));
    }
  } catch { /* keep what we have */ }
  if (!items.length) return cache ? cache.items : [];
  const seen = new Set<string>(); const uniq = items.filter((x) => (seen.has(x.t2) ? false : (seen.add(x.t2), true))).sort((a, b) => (b.at || "").localeCompare(a.at || "")).slice(0, 220);
  await setCfg("cdi_cache", JSON.stringify({ ts: Date.now(), items: uniq }));
  return uniq;
}

/* ---------------- short writing checks: intro, paragraph, frame, re-checked sentences ---------------- */
const RULES = `For "rule" use one of exactly: "articles a/an/the", "verb tense", "subject-verb agreement", "plural / countable", "prepositions", "word form", "word choice", "punctuation", or another short lowercase name if none fits.`;
async function wcheck(body: any, userId: string) {
  const mode = String(body.mode || "");
  const q = String(body.prompt || "").slice(0, 800);
  const usage = await bumpUsage(userId);
  let prompt = "";
  if (mode === "intro" || mode === "para") {
    const text = String(body.text || "").slice(0, 3000);
    prompt = `${STYLE}

You are checking one part of an IELTS Writing Task 2 answer by a student whose first languages are Kazakh and Russian.
Question: ${q}
${mode === "intro" ? "The student wrote ONLY the introduction: the question in their own words, then their position." : "The student wrote ONE body paragraph. It should have: a clear claim, why it is true, one specific example (one person or case, not a list), and what it leads to."}
${body.plan ? `Their plan: ${JSON.stringify(body.plan).slice(0, 400)}` : ""}
Text:
"""
${text}
"""
Return ONLY JSON:
"note": 1-2 sentences: the one thing that matters most in this ${mode === "intro" ? "introduction" : "paragraph"}, concrete, quoting them. No praise.
"points": array (0-3) of {"point": what is missing or weak, in plain words, "fix": a concrete suggestion, a sentence frame where useful}. ${mode === "intro" ? "Check: is the question paraphrased (not copied), is the position clear and does it answer what the question asks?" : "Check each of: claim, why, example (specific?), result. Only list what is actually weak."}
"errors": array of EVERY language error, at most 15: {"said": exact wrong words copied from the text (2-10 words), "better": corrected words, "why": under 10 words, "rule": ...}. ${RULES}
"better": the same ${mode === "intro" ? "introduction" : "paragraph"} as a band 7 writer would write it, same ideas, plain accurate words.`;
  } else if (mode === "frame") {
    prompt = `A student practising IELTS Writing Task 2 sentence frames wrote one sentence using this frame: "${String(body.frame || "").slice(0, 300)}".
The essay question: ${q}
Their sentence: "${String(body.text || "").slice(0, 600)}"
Return ONLY JSON: "fits": true if the sentence follows the frame's structure (wording can vary a little) and makes sense for this question; "errors": array of language errors {"said","better","why","rule"} (${RULES}); "note": one short sentence, specific, no praise.`;
  } else if (mode === "sentences") {
    const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    prompt = `A student is correcting their own IELTS essay. For each item you get the original sentence, the mistakes that were found in it, and the student's new version.
Essay question: ${q}
Items:
${items.map((it: any) => `#${Number(it.i)} original: "${String(it.orig || "").slice(0, 400)}" | mistakes: ${JSON.stringify(it.errs || []).slice(0, 600)} | new: "${String(it.now || "").slice(0, 400)}"`).join("\n")}
For each item decide if ALL the listed mistakes are fixed in the new version and no new error was added.
Return ONLY JSON: {"results": [{"i": number, "fixed": true|false, "still": array of the mistakes still there or newly added, each {"said": exact words from the NEW version, "better", "why", "rule"} (${RULES})}]}`;
  } else throw Object.assign(new Error("Unknown check."), { code: "bad_request" });
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.2); } catch (e) { await refund(userId, usage.used); throw e; }
  return { ...r.data, model: r.model, usage };
}


/* ---------------- Writing Task 1: generated visuals, checking, find-the-mistake hunts ---------------- */
const W1_DESCRIPTORS = `IELTS Academic Writing Task 1 band descriptors (public version, May 2023), condensed. Each criterion gets a WHOLE band by best fit.
TASK ACHIEVEMENT
8: covers all requirements appropriately, relevantly and sufficiently; key features skilfully selected, clearly presented, highlighted and illustrated; occasional omissions or lapses.
7: covers the requirements; content relevant and accurate with a few omissions or lapses; key features covered and clearly highlighted but could be more fully illustrated; presents a CLEAR OVERVIEW, data appropriately categorised, main trends or differences identified.
6: focuses on the requirements, appropriate format; key features adequately highlighted; a relevant overview is ATTEMPTED; information appropriately selected and supported with figures; some details may be irrelevant, inaccurate, missing or excessive.
5: generally addresses the task; key features not adequately covered; recounting of detail is mainly mechanical; there may be no data to support the description; may focus on details without the bigger picture.
COHERENCE AND COHESION
8: message followed with ease; logically sequenced; cohesion well managed; paragraphing sufficient and appropriate.
7: logically organised with clear progression; range of cohesive devices including reference and substitution used flexibly with some inaccuracies or over/under use.
6: coherent with clear overall progression; cohesive devices used to some good effect but cohesion may be faulty or mechanical; reference and substitution may lack flexibility or clarity.
5: organisation evident but not wholly logical; limited/overused cohesive devices; repetitive.
LEXICAL RESOURCE
8: wide resource used fluently and flexibly for precise meaning; skilful use of uncommon items; occasional errors in word choice, collocation, spelling.
7: sufficient for flexibility and precision; some less common items; awareness of style and collocation with some inappropriacies; few spelling/word formation errors.
6: generally adequate; meaning clear despite restricted range or lack of precision; some spelling/word formation errors that do not impede communication.
5: limited but minimally adequate; frequent lapses in word choice; noticeable spelling errors.
GRAMMATICAL RANGE AND ACCURACY
8: wide range used flexibly and accurately; majority of sentences error-free; occasional non-systematic errors.
7: variety of complex structures with some flexibility and accuracy; grammar and punctuation generally well controlled; error-free sentences frequent.
6: mix of simple and complex forms with limited flexibility; errors occur but rarely impede communication.
5: limited, repetitive range; complex sentences tend to be faulty; frequent errors.
Rules: under 150 words lowers Task Achievement. No overview caps Task Achievement at 5. Figures that contradict the data count as inaccuracy. Opinions or causes not shown in the visual are irrelevant content. Be fair, not stingy.`;

function t1Brief(it: any) {
  try {
    const k = String(it.kind || "");
    if (k === "line" || k === "bar") return `${k} chart. x: ${JSON.stringify(it.x)}. unit: ${it.unit || ""}. series: ${(it.series || []).map((s: any) => `${s.name}: ${JSON.stringify(s.values)}`).join("; ")}`;
    if (k === "pie") return `pie chart(s), unit %: ${(it.charts || []).map((c: any) => `${c.label}: ${(c.parts || []).map((p: any) => `${p.name} ${p.value}`).join(", ")}`).join(" | ")}`;
    if (k === "table") return `table. columns: ${JSON.stringify(it.cols)}. unit: ${it.unit || ""}. rows: ${(it.rows || []).map((r: any) => `${r.name}: ${JSON.stringify(r.values)}`).join("; ")}`;
    if (k === "process") return `process diagram, ${it.cycle ? "a cycle" : "linear"}. stages: ${(it.steps || []).map((s: any, i: number) => `${i + 1}. ${s.label}${s.note ? " (" + s.note + ")" : ""}`).join(" ")}`;
    if (k === "map") return `two maps. ${(it.maps || []).map((m: any) => `${m.label}: ${(m.items || []).map((x: any) => `${x.name} at column ${x.x}, row ${x.y} (grid 12x8, row 0 is north)`).join("; ")}`).join(" || ")}`;
  } catch { /* fallthrough */ }
  return JSON.stringify(it).slice(0, 3000);
}

const T1K = ["line", "bar", "pie", "table", "process", "map"];
function t1Ok(it: any) {
  if (!it || typeof it !== "object" || !it.title) return false;
  const num = (a: any) => Array.isArray(a) && a.length && a.every((v: any) => isFinite(Number(v)));
  const k = it.kind;
  if (k === "line" || k === "bar") return Array.isArray(it.x) && it.x.length >= 2 && Array.isArray(it.series) && it.series.length > 0 && it.series.every((x: any) => x && x.name && num(x.values) && x.values.length === it.x.length);
  if (k === "pie") return Array.isArray(it.charts) && it.charts.length > 0 && it.charts.every((c: any) => Array.isArray(c.parts) && c.parts.length >= 2);
  if (k === "table") return Array.isArray(it.cols) && Array.isArray(it.rows) && it.rows.length > 0 && it.rows.every((r: any) => r.name && num(r.values));
  if (k === "process") return Array.isArray(it.steps) && it.steps.length >= 3;
  if (k === "map") return Array.isArray(it.maps) && it.maps.length === 2 && it.maps.every((m: any) => Array.isArray(m.items) && m.items.length >= 2);
  return false;
}
const t1Norm = (d: string) => d.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
async function t1Pool(): Promise<any[]> { try { const p = JSON.parse(await cfg("t1_pool", "[]")); return Array.isArray(p) ? p : []; } catch { return []; } }
async function t1Save(it: any) { const p = await t1Pool(); if (it.src && p.some((x) => x.src === it.src)) return; p.push(it); await setCfg("t1_pool", JSON.stringify(p.slice(-400))); }
async function t1Make(kind: string, desc: string) {
  const prompt = `Create ONE practice visual for IELTS Academic Writing Task 1${desc ? ` that matches this description reported by a test taker: "${desc}". Keep its topic, years and categories when they are given; invent plausible numbers.` : ` of kind "${kind || "line"}" on an everyday academic topic (energy, transport, education, spending, population, tourism, health, environment).`}
Return ONLY JSON with these keys:
"kind": one of "line", "bar", "pie", "table", "process", "map";
"title": one sentence starting "The line graph shows" / "The bar chart compares" / "The pie charts show" / "The table shows" / "The diagram shows" / "The maps show", as on the exam paper;
and the data for that kind:
- line or bar: "x": 4-7 labels (years or categories), "unit": short unit text, "series": 2-4 objects {"name", "values": numbers, one per x}. Numbers realistic, with clear trends and at least one crossing or contrast.
- pie: "charts": 1-2 objects {"label": year or group, "parts": 4-6 objects {"name", "value"}}; values in each chart add up to 100.
- table: "cols": 3-4 column labels, "unit": text, "rows": 4-6 objects {"name", "values": numbers, one per column}.
- process: "steps": 6-10 objects {"label": short stage, 2-7 words, "note": optional detail, 0-6 words}, "cycle": true if the last stage leads back to the first.
- map: "maps": exactly 2 objects {"label": year or "Now"/"Planned", "items": 6-10 objects {"name": 1-3 words, "x": 0-11, "y": 0-7, "w": 1-6, "h": 1-4, "kind": one of "building", "green", "water", "road", "sport", "parking"}} on a 12 by 8 grid, row 0 is north. Items in one map must not overlap. Keep some features the same, remove some, add some, change some.`;
  const r = await gemini([{ text: prompt }], true, 0.8, true);
  const it = r.data; if (!t1Ok(it)) throw Object.assign(new Error("The drawing came out broken. Try again."), { code: "gemini_error" });
  it.id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); it.gen = true; it.ts = Date.now();
  if (desc) it.src = t1Norm(desc); else it.kind = it.kind || kind;
  await t1Save(it);
  return it;
}
function later(p: Promise<unknown>) { const er = (globalThis as any).EdgeRuntime; const q = p.catch(() => {}); if (er && er.waitUntil) er.waitUntil(q); }
async function t1gen(body: any) {
  const kind = T1K.includes(String(body.kind)) ? String(body.kind) : "";
  const desc = String(body.desc || "").slice(0, 600).trim();
  const skip = new Set(Array.isArray(body.skip) ? body.skip.map(String) : []);
  const pool = await t1Pool();
  if (desc) {
    const hit = pool.find((x) => x.src === t1Norm(desc));
    if (hit) return { item: hit, cached: true };
    return { item: await t1Make("", desc), cached: false };
  }
  const k = kind || T1K[Math.floor(Math.random() * T1K.length)];
  const free = pool.filter((x) => !x.src && x.kind === k && !skip.has(x.id));
  if (free.length) {
    if (free.length < 3) later(t1Make(k, ""));
    return { item: free[Math.floor(Math.random() * free.length)], cached: true };
  }
  const it = await t1Make(k, "");
  later(t1Make(k, ""));
  return { item: it, cached: false };
}
/* fill the pool ahead of time: one per kind that is short, and the newest reported Task 1 descriptions */
async function t1warm() {
  const last = Number(await cfg("t1_warm_ts", "0")) || 0;
  if (Date.now() - last < 10 * 60 * 1000) return { ok: true, skipped: true };
  await setCfg("t1_warm_ts", String(Date.now()));
  const pool = await t1Pool(), jobs: (() => Promise<unknown>)[] = [];
  for (const k of T1K) if (pool.filter((x) => !x.src && x.kind === k).length < 2) jobs.push(() => t1Make(k, ""));
  try {
    const c = JSON.parse(await cfg("cdi_cache", "null"));
    const have = new Set(pool.map((x) => x.src).filter(Boolean));
    for (const r of (c?.items || []).filter((r: any) => r.t1 && r.t1.trim().length > 25).slice(0, 12)) {
      const d = String(r.t1).replace(/[^\x20-\x7E’‘“”–—]/g, "").trim();
      if (!have.has(t1Norm(d)) && jobs.length < 8) jobs.push(() => t1Make("", d));
    }
  } catch { /* no reports cached */ }
  later((async () => { for (const j of jobs) { try { await j(); } catch { /* next */ } } })());
  return { ok: true, started: jobs.length };
}

async function essay1(body: any, userId: string) {
  const text = String(body.text || "").trim().slice(0, 4000);
  const it = body.item && typeof body.item === "object" ? body.item : null;
  if (text.length < 80 || !it) throw Object.assign(new Error("Need the task and your report."), { code: "bad_request" });
  const usage = await bumpUsage(userId);
  const goal = Number(body.goal) >= 4 && Number(body.goal) <= 9 ? Number(body.goal) : 7;
  const prompt = `${STYLE}

${W1_DESCRIPTORS}

You are checking an IELTS Academic Writing Task 1 report by a student whose first languages are Kazakh and Russian (no articles in either). Goal band ${goal}.
Task: ${String(it.title || "").slice(0, 300)} Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.
The visual, as data: ${t1Brief(it)}
Written in ${Number(body.minutes) || "?"} minutes (aim 20), ${Number(body.words) || "?"} words (minimum 150).

Report:
"""
${text}
"""

Return ONLY a JSON object:
"bands": {"tr": n (Task Achievement), "cc": n, "lr": n, "gra": n} whole bands, best fit, fair.
"band_reasons": {"tr","cc","lr","gra"} one sentence each: which descriptor fits and what the next band needs, quoting the report.
"summary": 2 sentences: what costs the most band points here and what to do next time. Concrete.
"overview_ok": true only if there is a separate overview that names the main trends or biggest differences and contains no specific figures.
"overview": {"present": true/false, "quote": the overview sentence if there is one, "fix": one sentence: what a clear overview of THIS visual would say}.
"data_errors": array of figures or trends that contradict the data: {"said": exact words, "fact": what the data shows}.
"errors": array of EVERY language error, in order, at most 25: {"said": exact wrong words (2-12), "better", "why": under 12 words, "rule": one of exactly "articles a/an/the", "verb tense", "subject-verb agreement", "plural / countable", "prepositions", "word form", "word choice", or another short lowercase name}.
"spelling": array of {"wrong","right","in_task": false}.
"ideas": array of at most 3 points about selection, grouping, comparisons or paragraphing that really cost marks: {"point","where","fix"}.
"keep": 1-2 specific things that work, with short quotes.
"corrected": the student's report with every error fixed, same structure and level.
"higher_version": the same report at band ${Math.min(9, goal)}: intro, overview, two body paragraphs grouping the data, 170-190 words, accurate figures, natural comparison language.
"target_band": ${Math.min(9, goal)}.`;
  let r;
  try { r = await gemini([{ text: prompt }], true, 0.3); } catch (e) { await refund(userId, usage.used); throw e; }
  const b = r.data?.bands;
  if (b && ["tr", "cc", "lr", "gra"].every((k) => !isNaN(Number(b[k])))) {
    for (const k of ["tr", "cc", "lr", "gra"]) b[k] = Math.round(Number(b[k]));
    b.overall = ieltsRound((b.tr + b.cc + b.lr + b.gra) / 4);
  }
  return { ...r.data, model: r.model, usage };
}

const HUNT: Record<string, string> = {
  articles: "article mistakes only: a missing a/an/the, a wrong one (a instead of the, the before a general plural or uncountable noun, the before most country names), or a instead of an",
  prepositions: "preposition mistakes only: wrong or missing prepositions (in/on/at, for/since, depend of, interested about, discuss about)",
  tense: "verb tense mistakes only: present instead of past, past simple instead of present perfect, wrong future forms",
  agreement: "subject-verb agreement mistakes only: people is, the number of cars are, everyone have, it don't",
  plural: "plural and countable mistakes only: informations, a advice, many money, one of the reason, two year",
  mixed: "a mix of the kinds of mistakes listed in focus",
};
async function hunt(body: any) {
  const kind = HUNT[String(body.kind)] ? String(body.kind) : "articles";
  const src = String(body.text || "").trim().slice(0, 1500);
  const focus = Array.isArray(body.focus) ? body.focus.filter((x: unknown) => typeof x === "string").slice(0, 4).join(", ") : "";
  const n = Math.max(3, Math.min(7, Number(body.n) || 5));
  const prompt = `Make a find-the-mistake exercise for an IELTS student (first languages Kazakh and Russian).
${src ? `Start from this correct text written by the student (keep it, change only what is needed to put the mistakes in):\n"""${src}"""` : `Write a correct academic paragraph of 90-120 words on: ${String(body.topic || "a common IELTS Task 2 topic").slice(0, 200)}.`}
Then put in exactly ${n} ${HUNT[kind]}${kind === "mixed" && focus ? ` (focus: ${focus})` : ""}. Each mistake must be clearly wrong in standard English, not a style choice, and fixable from the sentence alone. Do not put two mistakes in the same three words.
Return ONLY JSON: {"text": the paragraph WITH the mistakes, "errors": [{"wrong": the exact words in "text" that are wrong, 1-4 words, including the word right after a missing article, "right": the corrected words, "why": under 10 words}] in text order}.`;
  const r = await gemini([{ text: prompt }], true, 0.5, true);
  return { ...r.data, model: r.model };
}

/* ---------------- voice cloning test (admin only) ---------------- */
const VOICE_MODELS: Record<string, { key: string; label: string }> = {
  fish: { key: "fish_key", label: "Fish Audio S2.1 Pro (free)" },
  f5: { key: "fal_key", label: "F5-TTS on fal" },
  chatterbox: { key: "fal_key", label: "Chatterbox HD on fal" },
};
async function voiceTest(body: any) {
  const m = VOICE_MODELS[body.provider];
  if (!m) throw Object.assign(new Error("Unknown model."), { code: "bad_request" });
  const key = await cfg(m.key);
  if (!key) throw Object.assign(new Error(`No ${m.key === "fish_key" ? "Fish Audio" : "fal"} key saved yet.`), { code: "no_key" });
  const text = String(body.text || "").trim().slice(0, 1500);
  if (!text || typeof body.ref_audio !== "string") throw Object.assign(new Error("Need a voice sample and some text."), { code: "bad_request" });
  const bytes = decodeBase64(body.ref_audio);
  let refText = String(body.ref_text || "").trim();
  if (!refText && body.provider === "fish") {
    try {
      const r = await gemini([{ text: 'Transcribe this English speech exactly as spoken, without fillers like um or uh. Return ONLY JSON {"text": "..."}' }, { inline_data: { mime_type: "audio/wav", data: body.ref_audio } }], true, 0);
      refText = String(r.data.text || "").trim();
    } catch { /* Fish can work without it */ }
  }
  const t0 = Date.now();
  if (body.provider === "fish") {
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/msgpack", model: "s2.1-pro-free" },
      body: msgpack({ text, references: [{ audio: bytes, text: refText }], format: "mp3", mp3_bitrate: 128, normalize: true, latency: "normal" }),
    });
    if (!r.ok) throw Object.assign(new Error("Fish Audio: " + (await r.text()).slice(0, 300)), { code: "voice_error" });
    const ab = new Uint8Array(await r.arrayBuffer());
    return { audio: encodeBase64(ab), mime: r.headers.get("content-type") || "audio/mpeg", ms: Date.now() - t0, ref_text: refText };
  }
  // fal models need the sample at a URL: put it in storage for 10 minutes
  const path = `voicelab/${crypto.randomUUID()}.wav`;
  const up = await admin.storage.from("recordings").upload(path, bytes, { contentType: "audio/wav", upsert: true });
  if (up.error) throw up.error;
  try {
    const { data: su, error: se } = await admin.storage.from("recordings").createSignedUrl(path, 600);
    if (se || !su) throw se || new Error("Could not share the sample.");
    const [endpoint, input] = body.provider === "f5"
      ? ["fal-ai/f5-tts", { gen_text: text, ref_audio_url: su.signedUrl, ref_text: refText, model_type: "F5-TTS", remove_silence: true }]
      : ["resemble-ai/chatterboxhd/text-to-speech", { text, audio_url: su.signedUrl, high_quality_audio: true, exaggeration: 0.4, cfg: 0.5 }];
    const r = await fetch(`https://fal.run/${endpoint}`, { method: "POST", headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const t = await r.text();
    if (!r.ok) throw Object.assign(new Error("fal: " + t.slice(0, 300)), { code: "voice_error" });
    const d = JSON.parse(t);
    const url = d.audio_url?.url || d.audio?.url;
    if (!url) throw Object.assign(new Error("fal returned no audio."), { code: "voice_error" });
    return { url, ms: Date.now() - t0, ref_text: refText };
  } finally {
    await admin.storage.from("recordings").remove([path]);
  }
}

/* ---------------- "your voice": each person's saved sample, Fish S2.1 Pro (free) ---------------- */
const STYLES: Record<string, string> = {
  natural: "",
  calm: "[calm, clear, relaxed conversational tone] ",
  confident: "[confident, friendly, natural speaking pace] ",
  lively: "[lively, enthusiastic, expressive] ",
};
async function fishTTS(key: string, text: string, refs: { audio: Uint8Array; text: string }[], o: { speed?: number; temperature?: number; top_p?: number }) {
  const r = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/msgpack", model: "s2.1-pro-free" },
    body: msgpack({ text, references: refs, format: "mp3", mp3_bitrate: 128, normalize: true, latency: "normal",
      temperature: o.temperature ?? 0.7, top_p: o.top_p ?? 0.7, repetition_penalty: 1.2, prosody: { speed: o.speed ?? 1, volume: 0 } }),
  });
  if (!r.ok) throw Object.assign(new Error("Fish Audio: " + (await r.text()).slice(0, 300)), { code: "voice_error" });
  return new Uint8Array(await r.arrayBuffer());
}
async function sha(s: string) { const h = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s)); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 20); }
async function myVoice(body: any, uid: string) {
  const store = admin.storage.from("recordings");
  if (body.op === "save") {
    if (typeof body.ref_audio !== "string" || body.ref_audio.length > 4_000_000) throw Object.assign(new Error("The sample is missing or too long."), { code: "bad_request" });
    let refText = String(body.ref_text || "").trim().slice(0, 1500);
    if (!refText) {
      try {
        const r = await gemini([{ text: 'Transcribe this English speech exactly as spoken, without fillers like um or uh. Return ONLY JSON {"text": "..."}' }, { inline_data: { mime_type: "audio/wav", data: body.ref_audio } }], true, 0);
        refText = String(r.data.text || "").trim();
      } catch { /* optional */ }
    }
    const n = body.slot === 2 ? "ref2" : "ref";
    const a = await store.upload(`${uid}/voice/${n}.wav`, decodeBase64(body.ref_audio), { contentType: "audio/wav", upsert: true });
    if (a.error) throw a.error;
    const b = await store.upload(`${uid}/voice/${n}.json`, new TextEncoder().encode(JSON.stringify({ text: refText, at: Date.now(), dur: body.dur || 0 })), { contentType: "application/json", upsert: true });
    if (b.error) throw b.error;
    const { data: old } = await store.list(`${uid}/voice/out`, { limit: 1000 });
    if (old?.length) await store.remove(old.map((f) => `${uid}/voice/out/${f.name}`));
    return { ok: true, ref_text: refText };
  }
  if (body.op === "delete" || body.op === "delete2") {
    const { data: out } = await store.list(`${uid}/voice/out`, { limit: 1000 });
    const own = body.op === "delete2" ? [`${uid}/voice/ref2.wav`, `${uid}/voice/ref2.json`] : [`${uid}/voice/ref.wav`, `${uid}/voice/ref.json`, `${uid}/voice/ref2.wav`, `${uid}/voice/ref2.json`];
    await store.remove([...own, ...(out || []).map((f) => `${uid}/voice/out/${f.name}`)]);
    return { ok: true };
  }
  if (body.op === "status") {
    const { data } = await store.download(`${uid}/voice/ref.json`);
    if (!data) return { has: false };
    const meta = JSON.parse(await data.text());
    const { data: su } = await store.createSignedUrl(`${uid}/voice/ref.wav`, 3600);
    const { data: m2 } = await store.download(`${uid}/voice/ref2.json`);
    const { data: su2 } = m2 ? await store.createSignedUrl(`${uid}/voice/ref2.wav`, 3600) : { data: null };
    return { has: true, ref_text: meta.text, dur: meta.dur, at: meta.at, sample: su?.signedUrl || null, has2: !!m2, sample2: su2?.signedUrl || null };
  }
  // op: "say"
  const key = await cfg("fish_key");
  if (!key) throw Object.assign(new Error("The admin hasn't added a Fish Audio key yet."), { code: "no_key" });
  const text = String(body.text || "").trim().slice(0, 1500);
  if (!text) throw Object.assign(new Error("Nothing to say."), { code: "bad_request" });
  const speed = Math.max(0.7, Math.min(1.3, Number(body.speed) || 1));
  const style = STYLES[body.style] !== undefined ? body.style : "natural";
  const temperature = Math.max(0.3, Math.min(1, Number(body.temperature) || 0.7));
  const id = await sha([text, speed, style, temperature].join("|"));
  const outPath = `${uid}/voice/out/${id}.mp3`;
  const hit = await store.createSignedUrl(outPath, 3600);
  if (hit.data?.signedUrl && !body.fresh) {
    const head = await fetch(hit.data.signedUrl, { method: "HEAD" });
    if (head.ok) return { url: hit.data.signedUrl, cached: true };
  }
  const { data: refBlob } = await store.download(`${uid}/voice/ref.wav`);
  const { data: metaBlob } = await store.download(`${uid}/voice/ref.json`);
  if (!refBlob) throw Object.assign(new Error("Save a voice sample first (Settings → Your voice)."), { code: "no_sample" });
  const meta = metaBlob ? JSON.parse(await metaBlob.text()) : { text: "" };
  const refs = [{ audio: new Uint8Array(await refBlob.arrayBuffer()), text: meta.text || "" }];
  const { data: ref2 } = await store.download(`${uid}/voice/ref2.wav`);
  const { data: meta2b } = await store.download(`${uid}/voice/ref2.json`);
  if (ref2) refs.push({ audio: new Uint8Array(await ref2.arrayBuffer()), text: meta2b ? JSON.parse(await meta2b.text()).text || "" : "" });
  const audio = await fishTTS(key, STYLES[style] + text, refs, { speed, temperature, top_p: 0.7 });
  const up = await store.upload(outPath, audio, { contentType: "audio/mpeg", upsert: true });
  if (up.error) return { audio: encodeBase64(audio), mime: "audio/mpeg" };
  const { data: su } = await store.createSignedUrl(outPath, 3600);
  return { url: su?.signedUrl };
}

/* ---------------- topic vocabulary for a writing question, cached for everyone ---------------- */
async function wvocab(body: any) {
  const prompt = String(body.prompt || "").trim().slice(0, 700);
  if (prompt.length < 20) throw Object.assign(new Error("No question."), { code: "bad_request" });
  const key = (await sha(prompt.toLowerCase().replace(/\s+/g, " "))).slice(0, 16);
  let pool: any = {}; try { pool = JSON.parse(await cfg("wvocab_pool", "{}")) || {}; } catch { pool = {}; }
  if (pool[key]) return { ...pool[key], cached: true };
  const text = `You help a Kazakh student (Russian speaker, aiming for IELTS band 7) write this IELTS Writing Task 2 essay:
"${prompt}"
Give 10 topic-specific collocations or short phrases they could really use in THIS essay. Natural academic English that examiners reward as "less common lexis" at band 7-8: collocations (verb+noun, adjective+noun), not idioms, not single basic words, not linking words.
For each: "w" the phrase, "ru" a short Russian translation, "ex" one sentence (max 20 words) using it about this exact question.
Return JSON: {"topic": "2-4 word topic name", "words": [{"w": "", "ru": "", "ex": ""}]}`;
  const r = await gemini([{ text }], true, 0.4, true);
  const words = (Array.isArray(r.data?.words) ? r.data.words : []).filter((x: any) => x && x.w).slice(0, 12).map((x: any) => ({ w: String(x.w).slice(0, 80), ru: String(x.ru || "").slice(0, 80), ex: String(x.ex || "").slice(0, 220) }));
  if (!words.length) throw Object.assign(new Error("Could not get words."), { code: "ai_failed" });
  const out = { topic: String(r.data?.topic || "").slice(0, 40), words, at: Date.now() };
  const keys = Object.keys(pool); if (keys.length > 400) for (const k of keys.sort((a, b) => (pool[a].at || 0) - (pool[b].at || 0)).slice(0, keys.length - 400)) delete pool[k];
  pool[key] = out; await setCfg("wvocab_pool", JSON.stringify(pool));
  return { ...out, cached: false };
}

/* ---------------- guest: one free coach check for people without an account ---------------- */
async function guestAnalyze(body: any, req: Request) {
  if ((await cfg("guest_on", "1")) !== "1") throw Object.assign(new Error("Free tries are switched off right now."), { code: "guest_off" });
  const audio = String(body.audio || "");
  if (!audio || audio.length > 5_600_000) throw Object.assign(new Error("The recording is missing or too long."), { code: "bad_request" });
  const day = new Date().toISOString().slice(0, 10), key = "guest_" + day;
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "?").split(",")[0].trim();
  const h = (await sha(ip + "|" + day + "|wasabi")).slice(0, 16);
  let st: any = {}; try { st = JSON.parse(await cfg(key, "{}")) || {}; } catch { st = {}; }
  st.n = st.n || 0; st.ips = st.ips || {};
  const cap = parseInt(await cfg("guest_cap", "25")) || 25, perIp = parseInt(await cfg("guest_per_ip", "4")) || 4;
  if (st.n >= cap) throw Object.assign(new Error("Today's free tries are used up. Come back tomorrow, or ask for an account."), { code: "guest_cap" });
  if ((st.ips[h] || 0) >= perIp) throw Object.assign(new Error("This network has used its free tries for today."), { code: "guest_ip" });
  st.n++; st.ips[h] = (st.ips[h] || 0) + 1; await setCfg(key, JSON.stringify(st));
  const clean = { audio, mime: "audio/wav", question: body.question, dur: Math.min(240, Number(body.dur) || 0), stats: body.stats };
  try { return await analyze(clean, ""); }
  catch (e) { st.n--; st.ips[h]--; await setCfg(key, JSON.stringify(st)); throw e; }
}

/* ---------------- handler ---------------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let body: any;
  try { body = await req.json(); } catch { return j({ error: "bad_request", message: "Bad JSON" }, 400); }
  const action = body.action;
  try {
    if (action === "claim") {
      const u = norm(body.username);
      if (!okName(u)) return j({ error: "bad_username", message: "That doesn't look like a Telegram username." }, 400);
      const { data: au } = await admin.from("allowed_users").select("username").eq("username", u).maybeSingle();
      if (!au) return j({ error: "not_allowed", message: "This username isn't on the list yet. Ask the admin to add you." }, 403);
      if (body.password !== u) return j({ error: "wrong_password", message: "Wrong password." }, 400);
      const { error } = await admin.auth.admin.createUser({ email: emailOf(u), password: pw(u), email_confirm: true, user_metadata: { username: u, must_change: true } });
      if (error) {
        if (/already|exists|registered/i.test(error.message)) return j({ error: "exists", message: "Wrong password." }, 409);
        return j({ error: "server", message: error.message }, 500);
      }
      return j({ ok: true });
    }

    if (action === "guest_analyze") return j(await guestAnalyze(body, req));
    if (action === "support_info") return j({ page: await supPage(), text: await cfg("support_text", ""), link: await cfg("support_link", "") });
    if (action === "guest_info") return j({ on: (await cfg("guest_on", "1")) === "1", contact: await cfg("guest_contact", "fforthosv") });

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: ud, error: ue } = await admin.auth.getUser(token);
    if (ue || !ud?.user) return j({ error: "not_signed_in", message: "Sign in again." }, 401);
    const user = ud.user;
    const uname = user.email?.endsWith("@" + DOMAIN) ? user.email.split("@")[0] : "";
    const { data: me } = await admin.from("allowed_users").select("*").eq("username", uname).maybeSingle();
    if (!me) return j({ error: "not_allowed", message: "Your access was removed." }, 403);

    if (action === "analyze") return j(await analyze(body, user.id));
    if (action === "ideas") return j(await ideas(body, user.id));
    if (action === "dispute") return j(await dispute(body, user.id));
    if (action === "friend_pick") return j(await friendPick(body, user.id));
    if (action === "friend_rate") return j(await friendRate(body, user.id));
    if (action === "followup") return j(await followup(body, user.id));
    if (action === "myvoice") return j(await myVoice(body, user.id));
    if (action === "mockreport") return j(await mockReport(body, user.id));
    if (action === "paraphrase") return j(await paraphrase(body, user.id));
    if (action === "essay") return j(await essay(body, user.id));
    if (action === "wtopics") { let t: unknown = []; try { t = JSON.parse(await cfg("w_topics", "[]")); } catch { /* empty */ } return j({ topics: Array.isArray(t) ? t.slice(0, 200) : [], reported: await reported() }); }
    if (action === "wcheck") return j(await wcheck(body, user.id));
    if (action === "essay1") return j(await essay1(body, user.id));
    if (action === "t1gen") return j(await t1gen(body));
    if (action === "t1warm") return j(await t1warm());
    if (action === "wvocab") return j(await wvocab(body));
    if (action === "hunt") return j(await hunt(body));
    if (action === "status") {
      const day = new Date().toISOString().slice(0, 10);
      const { data } = await admin.from("ai_usage").select("count").eq("user_id", user.id).eq("day", day).maybeSingle();
      return j({ username: uname, admin: me.is_admin, hasKey: !!(await cfg("gemini_key")), used: data?.count ?? 0, limit: parseInt(await cfg("daily_limit", "60")), support_text: await cfg("support_text", ""), support_link: await cfg("support_link", ""), support_page: await supPage() });
    }

    if (!me.is_admin) return j({ error: "forbidden", message: "Admins only." }, 403);
    if (action === "support_save") { const p = supClean(body.page); await setCfg("support_page", JSON.stringify(p)); return j({ ok: true, page: p }); }
    if (action === "support_img") return j(await supImg(body));

    if (action === "admin_list") {
      const [{ data: allowed }, users, { data: atts }, { data: usage }] = await Promise.all([
        admin.from("allowed_users").select("*").order("added_at"),
        allUsers(),
        admin.from("attempts").select("user_id").eq("deleted", false),
        admin.from("ai_usage").select("user_id,count"),
      ]);
      const byEmail = new Map(users.map((u) => [u.email, u]));
      const cnt = new Map<string, number>(); (atts || []).forEach((a: any) => cnt.set(a.user_id, (cnt.get(a.user_id) || 0) + 1));
      const ai = new Map<string, number>(); (usage || []).forEach((a: any) => ai.set(a.user_id, (ai.get(a.user_id) || 0) + a.count));
      const key = await cfg("gemini_key");
      return j({
        users: (allowed || []).map((a: any) => {
          const u = byEmail.get(emailOf(a.username));
          return { username: a.username, admin: a.is_admin, note: a.note, added: a.added_at, joined: !!u, last: u?.last_sign_in_at || null, mustChange: !!u?.user_metadata?.must_change, takes: u ? cnt.get(u.id) || 0 : 0, ai: u ? ai.get(u.id) || 0 : 0 };
        }),
        config: { hasKey: !!key, keyHint: key ? "…" + key.slice(-4) : "", hasFish: !!(await cfg("fish_key")), hasFal: !!(await cfg("fal_key")), daily_limit: await cfg("daily_limit", "60"), model: await cfg("model", "gemini-flash-latest") },
      });
    }
    if (action === "admin_add") {
      const names = (Array.isArray(body.usernames) ? body.usernames : String(body.usernames || "").split(/[\s,;]+/)).map(norm).filter(Boolean);
      const bad = names.filter((n: string) => !okName(n));
      const good = names.filter(okName);
      if (good.length) {
        const { error } = await admin.from("allowed_users").upsert(good.map((u: string) => ({ username: u, note: body.note || null })), { onConflict: "username", ignoreDuplicates: true });
        if (error) throw error;
      }
      return j({ added: good, bad });
    }
    if (action === "admin_remove") {
      const u = norm(body.username);
      if (u === uname) return j({ error: "self", message: "You can't remove yourself." }, 400);
      const au = await findUser(u);
      if (au) {
        const { data: files } = await admin.storage.from("recordings").list(au.id, { limit: 1000 });
        if (files?.length) await admin.storage.from("recordings").remove(files.map((f) => `${au.id}/${f.name}`));
        for (const sub of ["voice/out", "voice"]) {
          const { data: vf } = await admin.storage.from("recordings").list(`${au.id}/${sub}`, { limit: 1000 });
          if (vf?.length) await admin.storage.from("recordings").remove(vf.map((f) => `${au.id}/${sub}/${f.name}`));
        }
        const { error } = await admin.auth.admin.deleteUser(au.id);
        if (error) throw error;
      }
      await admin.from("allowed_users").delete().eq("username", u);
      return j({ ok: true });
    }
    if (action === "admin_reset") {
      const u = norm(body.username);
      const au = await findUser(u);
      if (!au) return j({ error: "not_joined", message: "They haven't signed in yet, so their password is already their username." }, 400);
      const { error } = await admin.auth.admin.updateUserById(au.id, { password: pw(u), user_metadata: { ...(au.user_metadata || {}), must_change: true } });
      if (error) throw error;
      return j({ ok: true });
    }
    if (action === "admin_admin") {
      const u = norm(body.username);
      if (u === uname && !body.value) return j({ error: "self", message: "You can't remove your own admin rights." }, 400);
      await admin.from("allowed_users").update({ is_admin: !!body.value }).eq("username", u);
      return j({ ok: true });
    }
    if (action === "admin_config") {
      if (typeof body.gemini_key === "string") {
        const k = body.gemini_key.trim();
        if (k) await setCfg("gemini_key", k); else await admin.from("app_config").delete().eq("key", "gemini_key");
      }
      for (const k of ["fish_key", "fal_key"]) {
        if (typeof body[k] === "string") { const v = body[k].trim(); if (v) await setCfg(k, v); else await admin.from("app_config").delete().eq("key", k); }
      }
      if (typeof body.w_topics === "string" && body.w_topics.length < 60000) await setCfg("w_topics", body.w_topics);
      if (typeof body.support_text === "string") await setCfg("support_text", body.support_text.trim().slice(0, 1000));
      if (typeof body.support_link === "string") { const l = body.support_link.trim(); if (!l || /^https:\/\/\S{3,300}$/.test(l)) await setCfg("support_link", l); }
      if (typeof body.guest_on === "boolean") await setCfg("guest_on", body.guest_on ? "1" : "0");
      if (body.guest_cap) await setCfg("guest_cap", String(Math.max(0, Math.min(500, parseInt(body.guest_cap) || 25))));
      if (body.daily_limit) await setCfg("daily_limit", String(Math.max(1, Math.min(1000, parseInt(body.daily_limit) || 60))));
      if (body.model) await setCfg("model", String(body.model).trim());
      return j({ ok: true });
    }
    if (action === "voicetest") return j(await voiceTest(body));
    if (action === "admin_test") {
      const r = await gemini([{ text: "Reply with exactly: ok" }], false, 0);
      return j({ ok: true, reply: r.text.trim().slice(0, 40), model: r.model });
    }
    return j({ error: "unknown_action" }, 400);
  } catch (e) {
    const err = e as any;
    return j({ error: err.code || "server", message: err.message || String(e) }, err.code === "limit" ? 429 : err.code === "no_key" ? 400 : 500);
  }
});
