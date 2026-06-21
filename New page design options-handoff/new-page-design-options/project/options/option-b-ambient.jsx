// Option B — "Ambient"
// Immersive single-focus streaming home. Cool dark, artwork-derived glow.
// Mood-first browsing: pick a feeling, the room changes.
// Scoped under .am-  •  exports window.OptionBAmbient

const AM_FONTS = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@300;400;500;600&display=swap";

const amCSS = `
@import url('${AM_FONTS}');
.am-root{--bg:#070a10;--ink:#eef3fb;--ink-2:#9fb0c7;--ink-3:#5f6e85;--line:rgba(180,205,255,.10);
  --glow-a:oklch(0.70 0.14 250);--glow-b:oklch(0.72 0.13 320);--glow-c:oklch(0.74 0.12 190);
  width:1440px;font-family:'Manrope',sans-serif;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;}
.am-root *{box-sizing:border-box;}
.am-grot{font-family:'Space Grotesk',sans-serif;}
.am-atmos{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(60% 55% at 22% 28%, color-mix(in oklch, var(--glow-a) 55%, transparent) 0%, transparent 60%),
    radial-gradient(50% 50% at 88% 18%, color-mix(in oklch, var(--glow-b) 40%, transparent) 0%, transparent 55%),
    radial-gradient(70% 60% at 65% 95%, color-mix(in oklch, var(--glow-c) 30%, transparent) 0%, transparent 60%);
  filter:saturate(1.1);opacity:.9;transition:opacity .6s;}
.am-noise{position:absolute;inset:0;pointer-events:none;opacity:.4;mix-blend-mode:overlay;
  background-image:radial-gradient(rgba(255,255,255,.6) .5px,transparent .6px);background-size:3px 3px;}
.am-nav{display:flex;align-items:center;justify-content:space-between;padding:30px 56px;position:relative;z-index:3;}
.am-mark{display:flex;align-items:center;gap:13px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:20px;letter-spacing:.02em;}
.am-orb{width:26px;height:26px;border-radius:50%;background:conic-gradient(from 200deg,var(--glow-a),var(--glow-b),var(--glow-c),var(--glow-a));filter:blur(.3px);box-shadow:0 0 22px -2px var(--glow-a);}
.am-tabs{display:flex;gap:6px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:100px;padding:5px;}
.am-tab{padding:9px 20px;border-radius:100px;font-size:13.5px;color:var(--ink-2);cursor:pointer;}
.am-tab.on{background:rgba(255,255,255,.10);color:var(--ink);}
.am-navr{display:flex;align-items:center;gap:20px;}
.am-search{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink-2);}
.am-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(140deg,var(--glow-b),var(--glow-a));}
.am-mood{display:flex;align-items:center;gap:14px;padding:6px 56px 0;position:relative;z-index:3;flex-wrap:wrap;}
.am-mlabel{font-family:'Space Grotesk',sans-serif;font-size:13px;color:var(--ink-3);letter-spacing:.04em;margin-right:6px;}
.am-chip{padding:9px 18px;border-radius:100px;border:1px solid var(--line);font-size:13.5px;color:var(--ink-2);cursor:pointer;background:rgba(255,255,255,.02);transition:.2s;}
.am-chip.on{border-color:transparent;background:linear-gradient(120deg,color-mix(in oklch,var(--glow-a) 70%,transparent),color-mix(in oklch,var(--glow-b) 70%,transparent));color:#0a0d14;font-weight:600;}
.am-hero{padding:44px 56px 30px;position:relative;z-index:3;display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center;}
.am-eyebrow{font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:var(--ink-2);display:flex;align-items:center;gap:12px;}
.am-eyebrow .pulse{width:7px;height:7px;border-radius:50%;background:var(--glow-c);box-shadow:0 0 14px var(--glow-c);}
.am-h1{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:84px;line-height:.95;letter-spacing:-.03em;margin:22px 0 0;text-wrap:balance;}
.am-sub{font-size:18px;line-height:1.6;color:var(--ink-2);max-width:440px;margin-top:22px;font-weight:300;text-wrap:pretty;}
.am-row1{display:flex;align-items:center;gap:18px;margin-top:30px;}
.am-play{display:inline-flex;align-items:center;gap:13px;padding:16px 30px;border-radius:100px;background:var(--ink);color:#0a0d14;font-weight:600;font-size:15px;cursor:pointer;font-family:'Space Grotesk',sans-serif;}
.am-min{display:inline-flex;align-items:center;gap:11px;padding:16px 26px;border-radius:100px;border:1px solid var(--line);color:var(--ink);font-size:14px;cursor:pointer;}
.am-tags{display:flex;gap:10px;margin-top:26px;color:var(--ink-3);font-size:13px;font-family:'Space Grotesk',sans-serif;}
.am-tags span{padding:5px 0;}
.am-tags i{opacity:.4;}
.am-key{position:relative;height:440px;border-radius:20px;overflow:hidden;border:1px solid var(--line);
  box-shadow:0 50px 120px -40px color-mix(in oklch,var(--glow-a) 60%,#000);}
.am-key .kgrain{position:absolute;inset:0;opacity:.25;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.am-key .kcap{position:absolute;left:24px;bottom:22px;font-family:'Space Grotesk',sans-serif;}
.am-spine{padding:14px 0 60px 56px;position:relative;z-index:3;}
.am-sphead{display:flex;align-items:baseline;gap:16px;margin-bottom:20px;padding-right:56px;}
.am-sphead h2{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:22px;margin:0;letter-spacing:-.01em;}
.am-sphead .meta{color:var(--ink-3);font-size:13px;margin-left:auto;font-family:'Space Grotesk',sans-serif;}
.am-track{display:flex;gap:18px;overflow:hidden;padding-bottom:6px;}
.am-tile{flex:0 0 232px;}
.am-tile .pic{height:300px;border-radius:14px;position:relative;overflow:hidden;border:1px solid var(--line);}
.am-tile .pic .g{position:absolute;inset:0;opacity:.22;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.am-tile .pic .feel{position:absolute;top:14px;left:14px;font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.85);background:rgba(0,0,0,.28);backdrop-filter:blur(6px);padding:6px 11px;border-radius:100px;}
.am-tile .tt{font-family:'Space Grotesk',sans-serif;font-size:18px;margin:16px 0 5px;}
.am-tile .td{color:var(--ink-3);font-size:13px;}
.am-scrub{height:3px;border-radius:3px;background:rgba(255,255,255,.08);margin:26px 56px 0 0;position:relative;}
.am-scrub::after{content:"";position:absolute;left:0;top:0;height:100%;width:34%;border-radius:3px;background:linear-gradient(90deg,var(--glow-a),var(--glow-b));}
`;

function AmTile({ feel, t, d, pal }) {
  const bg = `radial-gradient(120% 100% at 28% 12%, ${pal[0]} 0%, transparent 62%), linear-gradient(160deg, ${pal[1]}, ${pal[2]})`;
  return (
    <div className="am-tile">
      <div className="pic" style={{ background: bg }}>
        <div className="g"></div>
        <div className="feel">{feel}</div>
      </div>
      <div className="tt">{t}</div>
      <div className="td">{d}</div>
    </div>
  );
}

function OptionBAmbient() {
  const moods = ["Restless", "Tender", "Wide awake", "Somewhere else", "Slow burn", "Weightless"];
  const tiles = [
    { feel: "Wide awake", t: "Neon Tide", d: "Sci-fi · 2025", pal: ["#2f6df0", "#16224a", "#080d1c"] },
    { feel: "Tender", t: "Mara, Slowly", d: "Drama · 2024", pal: ["#c25a93", "#3a1d36", "#140a18"] },
    { feel: "Slow burn", t: "Undertow", d: "Thriller · 2023", pal: ["#1f9c9c", "#0e3a40", "#06151a"] },
    { feel: "Somewhere else", t: "Pale Horizon", d: "Adventure · 2022", pal: ["#6a5cff", "#241c52", "#0c0a22"] },
    { feel: "Restless", t: "Static City", d: "Crime · 2025", pal: ["#e0683a", "#43221a", "#160c0a"] },
  ];
  return (
    <div className="am-root">
      <style dangerouslySetInnerHTML={{ __html: amCSS }} />
      <div className="am-atmos"></div>
      <div className="am-noise"></div>

      <nav className="am-nav">
        <div className="am-mark"><div className="am-orb"></div>AURA</div>
        <div className="am-tabs">
          <div className="am-tab on">For now</div><div className="am-tab">Films</div><div className="am-tab">Series</div><div className="am-tab">Sound</div>
        </div>
        <div className="am-navr"><div className="am-search">⌕</div><div className="am-av"></div></div>
      </nav>

      <div className="am-mood">
        <span className="am-mlabel">Tonight I feel</span>
        {moods.map((m, i) => <div key={i} className={"am-chip" + (i === 2 ? " on" : "")}>{m}</div>)}
      </div>

      <section className="am-hero">
        <div>
          <div className="am-eyebrow"><span className="pulse"></span>Tuned to · Wide awake</div>
          <h1 className="am-h1">Neon<br />Tide</h1>
          <p className="am-sub">A diver maps a city that only surfaces at 3am. We pulled this one up because you wanted to stay up — the glow follows the mood you pick.</p>
          <div className="am-row1">
            <div className="am-play">▷ Play · 2h 09m</div>
            <div className="am-min">＋ Save for later</div>
          </div>
          <div className="am-tags"><span>Luminous</span><i>/</i><span>Restless</span><i>/</i><span>Synth score</span><i>/</i><span>4K Dolby Vision</span></div>
        </div>
        <div className="am-key" style={{ background: "radial-gradient(120% 100% at 30% 10%, #3f7bff 0%, transparent 60%), linear-gradient(155deg, #16224a, #060a16)" }}>
          <div className="kgrain"></div>
          <div className="kcap"><div style={{ fontSize: 30, fontWeight: 500 }}>Neon Tide</div><div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginTop: 6 }}>Now playing in the room</div></div>
        </div>
      </section>

      <section className="am-spine">
        <div className="am-sphead">
          <h2>Drifting in the same key</h2>
          <span className="meta">Scrub to drift →</span>
        </div>
        <div className="am-track">{tiles.map((t, i) => <AmTile key={i} {...t} />)}</div>
        <div className="am-scrub"></div>
      </section>
    </div>
  );
}

window.OptionBAmbient = OptionBAmbient;
