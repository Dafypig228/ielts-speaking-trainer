import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

function questionText(q: any) {
  if (!q) return "";
  if (q.part === 2) return `Part 2 cue card: ${q.text}\nYou should say: ${(q.bullets || []).join("; ")}`;
  return `Part ${q.part} question: ${q.text}`;
}

async function gemini(parts: any[], json = true, temperature = 0.6) {
  const key = await cfg("gemini_key");
  if (!key) throw Object.assign(new Error("The admin hasn't added a Gemini API key yet."), { code: "no_key" });
  const models = [...new Set([await cfg("model", "gemini-flash-latest"), "gemini-flash-latest", "gemini-2.5-flash"])];
  let last = "";
  for (const m of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
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
  const usage = await bumpUsage(userId);
  const targets: string[] = Array.isArray(body.targets) ? body.targets.filter((x: unknown) => typeof x === "string").slice(0, 4) : [];
  const target = (body.target ? `\nThe student was challenged to use this naturally in the answer: "${body.target}". Say whether they used it and whether it sounded natural.` : "") +
    (targets.length ? `\nBefore answering, the app suggested these phrases: ${targets.map((t) => `"${t}"`).join(", ")}.` : "");
  const prompt = `${STYLE}

${COURSE}

You are listening to a recording of an IELTS Speaking candidate (their first language is Kazakh/Russian).
${questionText(q)}
Recording length: ${Math.round(body.dur || 0)} seconds. ${q.part === 2 ? "Target: 1.5 to 2 minutes." : q.part === 3 ? "Target: about 40-60 seconds with reasons and examples." : "Target: about 20-30 seconds, 2-4 sentences."}
${fmtPauses(body.stats)}${target}

Listen carefully to the audio, then return ONLY a JSON object with these keys:
"transcript": verbatim transcript of what they actually said, including um, uh, er, repetitions, self-corrections and unfinished words. Put pause markers like [pause 1.8s] where the measured pauses of 1s or longer happen (use the timings above to place them).
"bands": {"fc": number, "lr": number, "gra": number, "p": number, "overall": number} estimated IELTS bands in 0.5 steps, honest, not inflated. If the answer is far too short or off-topic, score accordingly.
"summary": 2-3 sentences, the most important thing about this answer.
"fluency": 2-4 sentences about pauses, hesitation, fillers and speed: say where the long pauses were (quote the words around them) and what probably caused them (searching for a word, planning the next idea, grammar).
"pronunciation": 1-3 sentences about specific words or sounds you actually heard as unclear, wrong word stress, or flat intonation. If it was clear, say so briefly.
"fix_first": one or two plain sentences: the single most useful thing to change in THIS answer.
"grammar": array (0-5) of {"said": exact words, "better": corrected version, "why": under 12 words, "rule": the general rule in 2-6 lowercase words, worded the same way every time for the same kind of mistake (for example "like + -ing", "past simple for finished time", "articles a/an/the", "plural -s", "third person -s", "present perfect with since/for")}.
"repeats": array (0-2) of {"word": a word or filler they overused in this answer (e.g. "very", "good", "like", "basically"), "times": how many times, "instead": 2-3 natural alternatives}. Empty array if nothing was overused.
"used_targets": array with one item per suggested phrase, in the same order: {"phrase": the phrase, "used": true if they used it or a close natural variant}. Empty array if no phrases were suggested.
"vocab": array (2-6) of {"said": their plain or awkward phrase, "better": [1-3 more natural or precise alternatives], "note": when you'd use it, under 15 words}.
"natural_version": their answer rewritten the way a confident band 8 speaker would actually SAY it, keeping their own ideas, facts and personal details, similar length, spoken style.
"phrases": array of 3-4 useful phrases for this topic: {"phrase": ..., "meaning_en": short plain-English meaning, "meaning_ru": short Russian meaning, "example": one natural spoken example}.
"next_time": one concrete thing to do differently next time.`;
  const parts: any[] = [{ text: prompt }];
  if (body.audio) parts.push({ inline_data: { mime_type: body.mime || "audio/wav", data: body.audio } });
  let r;
  try { r = await gemini(parts, true, 0.5); } catch (e) { await refund(userId, usage.used); throw e; }
  return { ...r.data, model: r.model, usage };
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

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: ud, error: ue } = await admin.auth.getUser(token);
    if (ue || !ud?.user) return j({ error: "not_signed_in", message: "Sign in again." }, 401);
    const user = ud.user;
    const uname = user.email?.endsWith("@" + DOMAIN) ? user.email.split("@")[0] : "";
    const { data: me } = await admin.from("allowed_users").select("*").eq("username", uname).maybeSingle();
    if (!me) return j({ error: "not_allowed", message: "Your access was removed." }, 403);

    if (action === "analyze") return j(await analyze(body, user.id));
    if (action === "ideas") return j(await ideas(body, user.id));
    if (action === "status") {
      const day = new Date().toISOString().slice(0, 10);
      const { data } = await admin.from("ai_usage").select("count").eq("user_id", user.id).eq("day", day).maybeSingle();
      return j({ username: uname, admin: me.is_admin, hasKey: !!(await cfg("gemini_key")), used: data?.count ?? 0, limit: parseInt(await cfg("daily_limit", "60")) });
    }

    if (!me.is_admin) return j({ error: "forbidden", message: "Admins only." }, 403);

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
        config: { hasKey: !!key, keyHint: key ? "…" + key.slice(-4) : "", daily_limit: await cfg("daily_limit", "60"), model: await cfg("model", "gemini-flash-latest") },
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
      if (body.daily_limit) await setCfg("daily_limit", String(Math.max(1, Math.min(1000, parseInt(body.daily_limit) || 60))));
      if (body.model) await setCfg("model", String(body.model).trim());
      return j({ ok: true });
    }
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
