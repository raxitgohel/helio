// Option A — "The Programme"
// Editorial / curatorial streaming home. Warm film palette, serif voice.
// Catalog is presented as a curated nightly programme, not a thumbnail wall.
// Scoped under .pa-  •  exports window.OptionAProgramme

const PA_FONTS = "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Archivo:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

const paCSS = `
@import url('${PA_FONTS}');
.pa-root{--ink:#f3e9da;--ink-2:#c9bca6;--ink-3:#8a7f6c;--bg:#16110c;--bg-2:#1f1812;--line:rgba(243,233,218,.13);--brass:oklch(0.78 0.10 75);--brass-deep:oklch(0.62 0.11 60);
  width:1440px;font-family:'Archivo',sans-serif;background:
    radial-gradient(120% 80% at 80% -10%, #2a1f15 0%, transparent 55%),
    var(--bg);
  color:var(--ink);position:relative;overflow:hidden;}
.pa-root *{box-sizing:border-box;}
.pa-grain{position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:soft-light;
  background-image:radial-gradient(rgba(255,255,255,.5) .5px,transparent .6px);background-size:3px 3px;}
.pa-serif{font-family:'Newsreader',serif;}
.pa-mono{font-family:'JetBrains Mono',monospace;}
.pa-nav{display:flex;align-items:center;justify-content:space-between;padding:30px 64px;border-bottom:1px solid var(--line);position:relative;z-index:2;}
.pa-mark{font-family:'Newsreader',serif;font-size:26px;letter-spacing:.32em;font-weight:500;}
.pa-mark b{color:var(--brass);font-weight:500;}
.pa-navlinks{display:flex;gap:36px;}
.pa-navlinks a{color:var(--ink-2);text-decoration:none;font-size:14px;letter-spacing:.02em;}
.pa-navlinks a.on{color:var(--ink);}
.pa-navlinks a.on::after{content:"";display:block;height:1px;background:var(--brass);margin-top:7px;}
.pa-navr{display:flex;align-items:center;gap:24px;}
.pa-ico{width:18px;height:18px;border:1.5px solid var(--ink-2);border-radius:50%;position:relative;}
.pa-ico::after{content:"";position:absolute;width:7px;height:1.5px;background:var(--ink-2);right:-5px;bottom:0;transform:rotate(45deg);transform-origin:left;}
.pa-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--brass),var(--brass-deep));}
.pa-kicker{display:flex;align-items:center;gap:14px;color:var(--brass);font-size:12px;letter-spacing:.34em;text-transform:uppercase;}
.pa-kicker .ln{height:1px;width:46px;background:var(--brass);opacity:.5;}
.pa-hero{display:grid;grid-template-columns:1fr 520px;gap:60px;padding:56px 64px 60px;align-items:center;position:relative;z-index:2;}
.pa-h1{font-family:'Newsreader',serif;font-weight:400;font-size:78px;line-height:.98;letter-spacing:-.015em;margin:22px 0 0;text-wrap:balance;}
.pa-h1 em{font-style:italic;color:var(--brass);}
.pa-note{font-family:'Newsreader',serif;font-size:20px;line-height:1.55;color:var(--ink-2);max-width:520px;margin-top:24px;text-wrap:pretty;}
.pa-meta{display:flex;gap:22px;margin-top:28px;color:var(--ink-3);font-size:12.5px;letter-spacing:.06em;align-items:center;}
.pa-meta span{display:flex;gap:22px;}
.pa-dot{width:3px;height:3px;border-radius:50%;background:var(--ink-3);align-self:center;}
.pa-cta{display:flex;gap:16px;margin-top:34px;}
.pa-btn{display:inline-flex;align-items:center;gap:12px;padding:15px 28px;border-radius:2px;font-size:14px;letter-spacing:.04em;cursor:pointer;border:1px solid var(--brass);}
.pa-btn.solid{background:var(--brass);color:#1a130b;font-weight:600;}
.pa-btn.ghost{background:transparent;color:var(--ink);border-color:var(--line);}
.pa-poster{position:relative;height:560px;border-radius:3px;overflow:hidden;box-shadow:0 40px 90px -30px rgba(0,0,0,.8);}
.pa-poster .cap{position:absolute;left:0;right:0;bottom:0;padding:26px;background:linear-gradient(transparent,rgba(0,0,0,.6));}
.pa-poster .cap .t{font-family:'Newsreader',serif;font-size:34px;line-height:1;}
.pa-sec{padding:8px 64px 64px;position:relative;z-index:2;}
.pa-sechead{display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid var(--line);padding-top:26px;margin-bottom:30px;}
.pa-sechead h2{font-family:'Newsreader',serif;font-weight:400;font-size:30px;margin:8px 0 0;letter-spacing:-.01em;}
.pa-sechead .all{color:var(--ink-3);font-size:13px;letter-spacing:.04em;text-decoration:none;}
.pa-three{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;}
.pa-card .pa-poster{height:330px;}
.pa-card .ct{font-family:'Newsreader',serif;font-size:24px;margin:18px 0 8px;}
.pa-card .cb{color:var(--ink-2);font-size:14.5px;line-height:1.5;font-family:'Newsreader',serif;}
.pa-card .cm{color:var(--ink-3);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;margin-top:14px;display:flex;gap:14px;}
.pa-index{display:grid;grid-template-columns:1fr;gap:0;}
.pa-row{display:grid;grid-template-columns:44px 1.4fr 1fr 120px 90px;gap:24px;align-items:center;padding:20px 0;border-top:1px solid var(--line);transition:.2s;cursor:pointer;}
.pa-row:hover{background:linear-gradient(90deg,rgba(243,233,218,.04),transparent);}
.pa-row .no{font-family:'JetBrains Mono',monospace;color:var(--brass);font-size:13px;}
.pa-row .ti{font-family:'Newsreader',serif;font-size:23px;}
.pa-row .de{color:var(--ink-3);font-size:13.5px;}
.pa-row .ge{color:var(--ink-2);font-size:12px;letter-spacing:.1em;text-transform:uppercase;}
.pa-row .du{color:var(--ink-3);font-family:'JetBrains Mono',monospace;font-size:13px;text-align:right;}
`;

function PaPoster({ pal, title, sub }) {
  const bg = `radial-gradient(120% 90% at 30% 15%, ${pal[0]} 0%, transparent 60%), linear-gradient(155deg, ${pal[1]} 0%, ${pal[2]} 100%)`;
  return (
    <div className="pa-poster" style={{ background: bg }}>
      <div className="pa-grain" style={{ opacity: .35 }}></div>
      {title && (
        <div className="cap">
          <div className="t">{title}</div>
          {sub && <div className="pa-mono" style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--ink-3)", marginTop: 8, textTransform: "uppercase" }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

function OptionAProgramme() {
  const three = [
    { t: "Cold Harbour", b: "A lighthouse keeper and the winter that refused to end.", m: ["1971", "Restored 4K"], pal: ["#3a4a52", "#1c2a30", "#0d1418"] },
    { t: "Ember Season", b: "Two sisters, one orchard, and the fire on the ridge.", m: ["2024", "Vesper Original"], pal: ["#7a3b22", "#3d1d12", "#1a0e08"] },
    { t: "The Long Field", b: "A quiet portrait of the last harvest before the road came.", m: ["2019", "Director's Cut"], pal: ["#5a5230", "#2e2a18", "#15130b"] },
  ];
  const idx = [
    { t: "Nightjar", d: "A detective loses an hour she can't account for.", g: "Mystery", du: "1h 52m" },
    { t: "Salt & Iron", d: "Shipbuilders hold the line through a brutal strike.", g: "Drama", du: "2h 14m" },
    { t: "Paper Moon Lane", d: "A travelling cinema arrives in a town that forgot how to watch.", g: "Romance", du: "1h 38m" },
    { t: "The Glasshouse", d: "Botanists race a frost that shouldn't be possible.", g: "Thriller", du: "1h 47m" },
  ];
  return (
    <div className="pa-root">
      <style dangerouslySetInnerHTML={{ __html: paCSS }} />
      <div className="pa-grain"></div>

      <nav className="pa-nav">
        <div className="pa-mark">VES<b>·</b>PER</div>
        <div className="pa-navlinks">
          <a className="on">Tonight</a><a>Films</a><a>Series</a><a>Collections</a><a>My Lists</a>
        </div>
        <div className="pa-navr"><div className="pa-ico"></div><div className="pa-av"></div></div>
      </nav>

      <section className="pa-hero">
        <div>
          <div className="pa-kicker"><span className="ln"></span>Tonight's Programme · Sat 21 June</div>
          <h1 className="pa-h1">The Quiet<br /><em>Hours</em></h1>
          <p className="pa-note">Our curators set aside the loud and the obvious. Tonight is for slow light, long takes, and films that trust you to wait. Begin at dusk.</p>
          <div className="pa-meta"><span>2023</span><span className="pa-dot"></span><span>2h 06m</span><span className="pa-dot"></span><span>Curated by M. Adeyemi</span></div>
          <div className="pa-cta">
            <div className="pa-btn solid">▷ Begin the evening</div>
            <div className="pa-btn ghost">Add to Lists</div>
          </div>
        </div>
        <PaPoster pal={["#8a6a3a", "#3e2c18", "#140d06"]} title="The Quiet Hours" sub="Feature presentation" />
      </section>

      <section className="pa-sec">
        <div className="pa-sechead">
          <div>
            <div className="pa-kicker"><span className="ln"></span>The Late Show</div>
            <h2>Three for after midnight</h2>
          </div>
          <a className="all">See the full programme →</a>
        </div>
        <div className="pa-three">
          {three.map((c, i) => (
            <div className="pa-card" key={i}>
              <PaPoster pal={c.pal} />
              <div className="ct">{c.t}</div>
              <div className="cb">{c.b}</div>
              <div className="cm">{c.m.map((m, j) => <span key={j}>{m}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pa-sec" style={{ paddingBottom: 72 }}>
        <div className="pa-sechead">
          <div>
            <div className="pa-kicker"><span className="ln"></span>Now Showing</div>
            <h2>The standing collection</h2>
          </div>
          <a className="all">A–Z index →</a>
        </div>
        <div className="pa-index">
          {idx.map((r, i) => (
            <div className="pa-row" key={i}>
              <div className="no">{String(i + 1).padStart(2, "0")}</div>
              <div className="ti">{r.t}</div>
              <div className="de">{r.d}</div>
              <div className="ge">{r.g}</div>
              <div className="du">{r.du}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

window.OptionAProgramme = OptionAProgramme;
