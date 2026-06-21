// Option D — "Ambient Index"  (a B × C hybrid, built in Helio's real design system)
// B: immersive cool-dark glow, featured hero, mood-forward.
// C: precise numbered ledger — catalog codes, format chips, exact tabular runtimes.
// Uses Helio tokens verbatim (bg #0b0e14, accent #5cc8ff, companion #b78cff,
// Segoe UI, 2:3 posters, .focusable.focused ring+scale). Scoped under .hx-
// exports window.OptionDAmbientIndex

const hxCSS = `
.hx-root{
  --bg:#0b0e14;--bg-elev:#151a23;--bg-elev-2:#1d2430;--text:#f3f6fb;--text-dim:#9aa6b8;
  --accent:#5cc8ff;--accent-ink:#04141f;--violet:#b78cff;--line:rgba(154,166,184,.16);--radius:12px;
  width:1440px;font-family:"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;
  background:var(--bg);color:var(--text);position:relative;overflow:hidden;}
.hx-root *{box-sizing:border-box;}
.hx-num{font-variant-numeric:tabular-nums;}
/* ambient atmosphere — cool, restrained, Helio-dark (from B) */
.hx-atmos{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(48% 46% at 16% 8%, rgba(92,200,255,.30) 0%, transparent 60%),
    radial-gradient(42% 44% at 92% 4%, rgba(183,140,255,.22) 0%, transparent 58%),
    radial-gradient(60% 50% at 70% 120%, rgba(92,200,255,.10) 0%, transparent 60%);}
.hx-atmos::after{content:"";position:absolute;inset:0;opacity:.5;mix-blend-mode:overlay;
  background-image:radial-gradient(rgba(255,255,255,.5) .5px,transparent .6px);background-size:3px 3px;}
.hx-pad{padding:0 56px;position:relative;z-index:2;}
/* topbar */
.hx-top{display:flex;align-items:center;gap:26px;padding:28px 56px 16px;position:relative;z-index:2;}
.hx-logo{margin:0;font-size:30px;font-weight:800;letter-spacing:.5px;
  background:linear-gradient(90deg,#5cc8ff,#b78cff);-webkit-background-clip:text;background-clip:text;color:transparent;}
.hx-filters{display:flex;gap:10px;}
.hx-filter{background:var(--bg-elev);color:var(--text-dim);border:none;border-radius:999px;padding:9px 20px;font-size:16px;cursor:pointer;}
.hx-filter.active{background:var(--accent);color:var(--accent-ink);font-weight:700;}
.hx-top-r{margin-left:auto;display:flex;align-items:center;gap:14px;}
.hx-search{display:flex;align-items:center;gap:42px;background:var(--bg-elev);border:1px solid #2b3340;border-radius:999px;padding:10px 18px;color:var(--text-dim);font-size:15px;}
.hx-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(140deg,#5cc8ff,#b78cff);display:flex;align-items:center;justify-content:center;color:var(--accent-ink);font-weight:700;font-size:14px;}
/* hero */
.hx-hero{display:grid;grid-template-columns:1.06fr 500px;gap:48px;align-items:center;padding:30px 56px 44px;position:relative;z-index:2;}
.hx-eyebrow{display:flex;align-items:center;gap:12px;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--text-dim);}
.hx-eyebrow .pulse{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 14px var(--accent);}
.hx-eyebrow b{color:var(--accent);font-weight:700;}
.hx-h1{font-size:80px;line-height:.94;letter-spacing:-.025em;font-weight:800;margin:20px 0 0;text-wrap:balance;}
.hx-lede{font-size:18px;line-height:1.55;color:#d7deea;max-width:520px;margin-top:20px;text-wrap:pretty;}
/* precise spec strip (from C) */
.hx-specs{display:flex;align-items:stretch;margin-top:28px;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;width:max-content;}
.hx-spec{padding:13px 22px;border-right:1px solid var(--line);}
.hx-spec:last-child{border-right:none;}
.hx-spec .k{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--text-dim);}
.hx-spec .v{font-size:17px;margin-top:5px;}
.hx-chips{display:flex;gap:6px;margin-top:6px;}
.hx-fchip{font-size:11px;letter-spacing:.06em;border:1px solid var(--line);border-radius:6px;padding:3px 8px;color:var(--text-dim);}
.hx-actions{display:flex;gap:12px;margin-top:30px;}
.hx-btn{display:inline-flex;align-items:center;gap:12px;border:none;border-radius:var(--radius);padding:15px 28px;font-size:17px;cursor:pointer;font-family:inherit;}
.hx-btn.primary{background:var(--accent);color:var(--accent-ink);font-weight:700;}
.hx-btn.ghost{background:var(--bg-elev-2);color:var(--text);}
/* key art (from B — glow) */
.hx-key{position:relative;height:520px;border-radius:18px;overflow:hidden;border:1px solid var(--line);
  box-shadow:0 50px 120px -44px rgba(92,200,255,.45);}
.hx-key .g{position:absolute;inset:0;opacity:.22;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.hx-key .frame{position:absolute;inset:20px;border:1px solid rgba(255,255,255,.16);border-radius:8px;}
.hx-key .code{position:absolute;top:30px;left:32px;font-size:12px;letter-spacing:.14em;color:rgba(255,255,255,.8);}
.hx-key .nm{position:absolute;left:32px;bottom:30px;font-size:34px;font-weight:800;letter-spacing:-.02em;line-height:.95;}
/* focusable model (verbatim from Helio) */
.hx-focusable{outline:none;transition:transform .08s ease,box-shadow .08s ease;}
.hx-focused{box-shadow:0 0 0 3px var(--accent),0 8px 28px rgba(0,0,0,.5);transform:scale(1.04);z-index:3;border-radius:var(--radius);}
/* section head */
.hx-sec{padding:6px 56px 30px;position:relative;z-index:2;}
.hx-sechead{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:16px;}
.hx-sectitle{font-size:21px;margin:0;font-weight:700;}
.hx-sectitle small{color:var(--text-dim);font-weight:400;font-size:14px;margin-left:12px;letter-spacing:.04em;}
.hx-seeall{background:transparent;color:var(--accent);border:none;font-size:16px;cursor:pointer;}
/* poster row (Helio cards) */
.hx-row{display:flex;gap:22px;overflow:hidden;}
.hx-card{flex:0 0 208px;display:flex;flex-direction:column;gap:9px;cursor:pointer;}
.hx-poster{position:relative;width:100%;aspect-ratio:2/3;border-radius:var(--radius);overflow:hidden;background:var(--bg-elev-2);}
.hx-poster .g{position:absolute;inset:0;opacity:.2;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.hx-poster .pt{position:absolute;left:16px;right:16px;bottom:34px;font-size:21px;font-weight:700;line-height:1;text-shadow:0 2px 12px rgba(0,0,0,.5);}
.hx-prog{position:absolute;left:14px;right:14px;bottom:14px;height:5px;border-radius:3px;background:rgba(255,255,255,.22);overflow:hidden;}
.hx-prog i{display:block;height:100%;background:var(--accent);}
.hx-ct{font-size:15px;line-height:1.25;}
.hx-cm{font-size:13px;color:var(--text-dim);}
/* ledger (from C, reskinned dark) */
.hx-lhead{display:grid;grid-template-columns:84px 1.5fr 1fr 150px 92px 64px;gap:18px;padding:12px 14px;
  font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--text-dim);border-bottom:1px solid var(--line);}
.hx-lrow{display:grid;grid-template-columns:84px 1.5fr 1fr 150px 92px 64px;gap:18px;align-items:center;
  padding:16px 14px;border-radius:var(--radius);cursor:pointer;transition:background .12s ease;border-bottom:1px solid rgba(154,166,184,.07);}
.hx-lrow:hover{background:var(--bg-elev);}
.hx-lrow .cat{color:var(--accent);font-size:14px;}
.hx-lrow .nm{font-size:19px;font-weight:600;letter-spacing:-.01em;}
.hx-lrow .sy{color:var(--text-dim);font-size:14px;}
.hx-lrow .fmt{display:flex;gap:6px;}
.hx-lrow .ru{color:var(--text-dim);font-size:14px;}
.hx-lrow .yr{color:var(--text-dim);font-size:14px;text-align:right;}
`;

function HxPoster({ pal, title, progress }) {
  const bg = `radial-gradient(120% 100% at 26% 12%, ${pal[0]} 0%, transparent 62%), linear-gradient(160deg, ${pal[1]}, ${pal[2]})`;
  return (
    <div className="hx-poster" style={{ background: bg }}>
      <div className="g"></div>
      <div className="pt">{title}</div>
      {progress != null && <div className="hx-prog"><i style={{ width: progress + "%" }}></i></div>}
    </div>
  );
}

function OptionDAmbientIndex() {
  const filters = ["For You", "Films", "Series", "Live", "Saved"];
  const cont = [
    { t: "Neon Tide", m: "1h 12m left", p: 44, pal: ["#3f8bff", "#16224a", "#0a0f1c"], focus: true },
    { t: "Undertow", m: "S2 · E4", p: 70, pal: ["#1f9c9c", "#0e3a40", "#08151a"] },
    { t: "Pale Horizon", m: "26m left", p: 82, pal: ["#7a6bff", "#241c52", "#0c0a22"] },
    { t: "Static City", m: "S1 · E2", p: 18, pal: ["#5aa0ff", "#1a2c52", "#0a1020"] },
    { t: "Carbon Light", m: "48m left", p: 60, pal: ["#46b6c8", "#143a45", "#08161c"] },
  ];
  const ledger = [
    { cat: "HE·041", nm: "The Inventory", sy: "A night auditor counts a tower that keeps adding floors.", fmt: ["4K", "ATMOS"], ru: "1:54", yr: "'25" },
    { cat: "HE·038", nm: "Mara, Slowly", sy: "Two strangers share one apartment across forty years.", fmt: ["4K", "HDR"], ru: "2:11", yr: "'24" },
    { cat: "HE·036", nm: "Foldback", sy: "A sound engineer hears tomorrow in the monitors.", fmt: ["HD"], ru: "1:39", yr: "'24" },
    { cat: "HE·031", nm: "Dry County", sy: "A bootlegger's daughter runs the last honest still.", fmt: ["4K"], ru: "2:02", yr: "'23" },
    { cat: "HE·029", nm: "Margin Notes", sy: "An archivist finds a confession in the footnotes.", fmt: ["4K", "ATMOS"], ru: "1:47", yr: "'23" },
  ];
  return (
    <div className="hx-root">
      <style dangerouslySetInnerHTML={{ __html: hxCSS }} />
      <div className="hx-atmos"></div>

      <header className="hx-top">
        <h1 className="hx-logo">Helio</h1>
        <div className="hx-filters">
          {filters.map((f, i) => <button key={i} className={"hx-filter" + (i === 0 ? " active" : "")}>{f}</button>)}
        </div>
        <div className="hx-top-r">
          <div className="hx-search"><span>Search the index</span><span>⌕</span></div>
          <div className="hx-av">JD</div>
        </div>
      </header>

      <section className="hx-hero">
        <div>
          <div className="hx-eyebrow"><span className="pulse"></span><b>Featured</b> · Entry HE·041 · tuned to your evening</div>
          <h1 className="hx-h1">Neon<br />Tide</h1>
          <p className="hx-lede">A diver maps a city that only surfaces at 3am. Picked for tonight — luminous, restless, and exact to the minute.</p>
          <div className="hx-specs">
            <div className="hx-spec"><div className="k">Runtime</div><div className="v hx-num">2:09:04</div></div>
            <div className="hx-spec"><div className="k">Format</div><div className="hx-chips"><span className="hx-fchip">4K</span><span className="hx-fchip">DOLBY VISION</span><span className="hx-fchip">ATMOS</span></div></div>
            <div className="hx-spec"><div className="k">Catalog</div><div className="v hx-num">HE·041</div></div>
            <div className="hx-spec"><div className="k">Match</div><div className="v hx-num" style={{ color: "var(--accent)" }}>97%</div></div>
          </div>
          <div className="hx-actions">
            <button className="hx-btn primary">▶ Play</button>
            <button className="hx-btn ghost">＋ Add to index</button>
          </div>
        </div>
        <div className="hx-key" style={{ background: "radial-gradient(120% 100% at 28% 8%, #3f8bff 0%, transparent 60%), radial-gradient(90% 80% at 95% 100%, rgba(183,140,255,.45) 0%, transparent 55%), linear-gradient(155deg, #16224a, #070b16)" }}>
          <div className="g"></div>
          <div className="frame"></div>
          <div className="code hx-num">HE·041 / KEY ART</div>
          <div className="nm">NEON<br />TIDE</div>
        </div>
      </section>

      <section className="hx-sec">
        <div className="hx-sechead">
          <h2 className="hx-sectitle">Continue<small>Picking up where you left off</small></h2>
          <button className="hx-seeall">See all →</button>
        </div>
        <div className="hx-row">
          {cont.map((c, i) => (
            <div className={"hx-card hx-focusable" + (c.focus ? " hx-focused" : "")} key={i}>
              <HxPoster pal={c.pal} title={c.t} progress={c.p} />
              <div className="hx-ct">{c.t}</div>
              <div className="hx-cm hx-num">{c.m}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="hx-sec" style={{ paddingBottom: 60 }}>
        <div className="hx-sechead">
          <h2 className="hx-sectitle">The index<small>Newest first · 1,284 titles</small></h2>
          <button className="hx-seeall">Sort →</button>
        </div>
        <div className="hx-lhead"><div>Cat.</div><div>Title</div><div>Synopsis</div><div>Format</div><div>Runtime</div><div>Year</div></div>
        {ledger.map((r, i) => (
          <div className="hx-lrow" key={i}>
            <div className="cat hx-num">{r.cat}</div>
            <div className="nm">{r.nm}</div>
            <div className="sy">{r.sy}</div>
            <div className="fmt">{r.fmt.map((f, j) => <span className="hx-fchip" key={j}>{f}</span>)}</div>
            <div className="ru hx-num">{r.ru}</div>
            <div className="yr hx-num">{r.yr}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

window.OptionDAmbientIndex = OptionDAmbientIndex;
