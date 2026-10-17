// Cloudflare Worker: serves the static site (ASSETS) and a tiny leaderboard API on /api/scores.
const J = (o, s = 200, h = {}) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", ...h } });

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname !== "/api/scores") return env.ASSETS.fetch(req);

    if (req.method === "GET") {
      const lim = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit")) || 50));
      const { results } = await env.DB
        .prepare("SELECT k,n,av,p,t FROM scores ORDER BY p DESC, dt ASC LIMIT ?")
        .bind(lim)
        .all();
      return J(results, 200, { "cache-control": "public, max-age=10" });
    }

    if (req.method === "POST") {
      let b;
      try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
      const n = String(b.n ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 22);
      const av = Number.isInteger(b.av) ? b.av : -1;
      const p = Number.isInteger(b.p) ? b.p : -999;
      const t = String(b.t ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").slice(0, 30);
      const id = String(b.id ?? "");
      if (!n || av < 0 || av > 11 || p < -100 || p > 600 || id.length < 16 || id.length > 64) {
        return J({ error: "invalid" }, 400);
      }
      const k = n.toLowerCase(), now = Date.now();
      try {
        const old = await env.DB.prepare("SELECT owner,dt FROM scores WHERE k=?").bind(k).first();
        if (old) {
          if (old.owner !== id) return J({ error: "name taken" }, 409); // a name belongs to the device that first used it
          if (now - old.dt < 20000) return J({ error: "slow down" }, 429);
          await env.DB
            .prepare("UPDATE scores SET n=?1,av=?2,t=CASE WHEN ?3>=p THEN ?4 ELSE t END,p=MAX(p,?3),pl=pl+1,dt=?5 WHERE k=?6")
            .bind(n, av, p, t, now, k)
            .run();
        } else {
          await env.DB
            .prepare("INSERT INTO scores(k,n,av,p,t,owner,pl,dt) VALUES(?,?,?,?,?,?,1,?)")
            .bind(k, n, av, p, t, id, now)
            .run();
        }
        return J({ ok: true });
      } catch {
        return J({ error: "conflict" }, 409);
      }
    }
    return J({ error: "method not allowed" }, 405);
  },
};
