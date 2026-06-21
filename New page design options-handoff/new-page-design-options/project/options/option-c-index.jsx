// Option C — "Index"
// Minimal precision-luxe streaming home. Warm paper-white, near-mono.
// The catalog as a typographic ledger: numbered, exact, restrained. One acid accent.
// Scoped under .ix-  •  exports window.OptionCIndex

const IX_FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500;600&display=swap";

const ixCSS = `
@import url('${IX_FONTS}');
.ix-root{--paper:#f4f3ee;--paper-2:#eceae2;--ink:#15140f;--ink-2:#56544a;--ink-3:#8c897c;--line:#d8d5c9;
  --acid:oklch(0.86 0.20 128);--acid-deep:oklch(0.58 0.14 128);
  width:1440px;font-family:'Archivo',sans-serif;background:var(--paper);color:var(--ink);position:relative;overflow:hidden;}
.ix-root *{box-sizing:border-box;}
.ix-mono{font-family:'Spline Sans Mono',monospace;}
.ix-util{display:flex;align-items:center;justify-content:space-between;padding:12px 40px;border-bottom:1px solid var(--line);
  font-family:'Spline Sans Mono',monospace;font-size:11.5px;letter-spacing:.04em;color:var(--ink-3);text-transform:uppercase;}
.ix-util .l{display:flex;gap:26px;}
.ix-util .dot{color:var(--acid-deep);}
.ix-nav{display:flex;align-items:center;justify-content:space-between;padding:24px 40px;border-bottom:2px solid var(--ink);}
.ix-mark{font-weight:800;font-size:24px;letter-spacing:-.02em;display:flex;align-items:center;gap:11px;}
.ix-sq{width:16px;height:16px;background:var(--acid);border:1.5px solid var(--ink);}
.ix-nl{display:flex;gap:30px;font-family:'Spline Sans Mono',monospace;font-size:13px;}
.ix-nl a{color:var(--ink-2);text-decoration:none;cursor:pointer;}
.ix-nl a.on{color:var(--ink);font-weight:600;border-bottom:2px solid var(--acid);padding-bottom:3px;}
.ix-navr{display:flex;align-items:center;gap:14px;font-family:'Spline Sans Mono',monospace;font-size:12px;}
.ix-srch{border:1px solid var(--line);padding:9px 16px;display:flex;gap:40px;align-items:center;color:var(--ink-3);min-width:200px;}
.ix-av{width:32px;height:32px;background:var(--ink);color:var(--acid);display:flex;align-items:center;justify-content:center;font-family:'Spline Sans Mono',monospace;font-size:12px;font-weight:600;}
.ix-hero{display:grid;grid-template-columns:1fr 380px;border-bottom:2px solid var(--ink);}
.ix-hl{padding:48px 40px 40px;border-right:1px solid var(--line);}
.ix-tagline{font-family:'Spline Sans Mono',monospace;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-2);display:flex;gap:14px;align-items:center;}
.ix-tagline b{background:var(--acid);color:var(--ink);padding:3px 8px;font-weight:600;letter-spacing:.1em;}
.ix-h1{font-weight:800;font-size:92px;line-height:.9;letter-spacing:-.045em;margin:26px 0 0;text-wrap:balance;}
.ix-h1 .o{-webkit-text-stroke:2px var(--ink);color:transparent;}
.ix-lede{font-size:17px;line-height:1.55;color:var(--ink-2);max-width:560px;margin-top:24px;text-wrap:pretty;}
.ix-specs{display:flex;gap:0;margin-top:34px;border-top:1px solid var(--line);}
.ix-spec{flex:1;padding:18px 0;border-right:1px solid var(--line);}
.ix-spec:last-child{border-right:none;}
.ix-spec .k{font-family:'Spline Sans Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);}
.ix-spec .v{font-family:'Spline Sans Mono',monospace;font-size:18px;margin-top:7px;}
.ix-cta{display:flex;gap:12px;margin-top:32px;}
.ix-b1{background:var(--ink);color:var(--paper);padding:15px 30px;font-family:'Spline Sans Mono',monospace;font-size:14px;cursor:pointer;display:flex;gap:12px;align-items:center;}
.ix-b1 .a{color:var(--acid);}
.ix-b2{border:1px solid var(--ink);padding:15px 26px;font-family:'Spline Sans Mono',monospace;font-size:14px;cursor:pointer;}
.ix-hr{position:relative;}
.ix-poster{position:absolute;inset:0;overflow:hidden;}
.ix-poster .pg{position:absolute;inset:0;opacity:.3;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.ix-poster .frame{position:absolute;left:24px;right:24px;top:24px;bottom:24px;border:1px solid rgba(255,255,255,.4);}
.ix-poster .num{position:absolute;top:32px;left:34px;font-family:'Spline Sans Mono',monospace;font-size:12px;color:rgba(255,255,255,.85);letter-spacing:.1em;}
.ix-poster .nm{position:absolute;left:34px;bottom:34px;font-weight:800;font-size:30px;color:#fff;letter-spacing:-.02em;line-height:.95;}
.ix-ledger{padding:0 40px 56px;}
.ix-lhead{display:grid;grid-template-columns:70px 1.5fr 1fr 110px 130px 90px;gap:20px;padding:16px 0;border-bottom:1px solid var(--ink);
  font-family:'Spline Sans Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);}
.ix-lrow{display:grid;grid-template-columns:70px 1.5fr 1fr 110px 130px 90px;gap:20px;padding:19px 0;align-items:center;border-bottom:1px solid var(--line);cursor:pointer;transition:.15s;}
.ix-lrow:hover{background:var(--paper-2);padding-left:10px;padding-right:10px;margin:0 -10px;}
.ix-lrow .cat{font-family:'Spline Sans Mono',monospace;font-size:13px;color:var(--acid-deep);}
.ix-lrow .nm{font-weight:600;font-size:19px;letter-spacing:-.01em;}
.ix-lrow .sy{color:var(--ink-2);font-size:14px;}
.ix-lrow .fmt{font-family:'Spline Sans Mono',monospace;font-size:11px;color:var(--ink-2);}
.ix-lrow .fmt s{text-decoration:none;border:1px solid var(--line);padding:3px 7px;}
.ix-lrow .ru{font-family:'Spline Sans Mono',monospace;font-size:13px;color:var(--ink-2);}
.ix-lrow .pl{font-family:'Spline Sans Mono',monospace;font-size:12px;text-align:right;color:var(--ink);display:flex;align-items:center;gap:8px;justify-content:flex-end;}
.ix-lrow:hover .pl .ar{color:var(--acid-deep);}
.ix-secrow{display:flex;align-items:baseline;justify-content:space-between;margin:36px 0 4px;}
.ix-secrow h2{font-weight:700;font-size:20px;letter-spacing:-.01em;margin:0;}
.ix-secrow .c{font-family:'Spline Sans Mono',monospace;font-size:12px;color:var(--ink-3);}
`;

function OptionCIndex() {
  const rows = [
    { cat: "SG·041", nm: "The Inventory", sy: "A night auditor counts a building that keeps adding floors.", fmt: ["4K", "ATMOS"], ru: "01:54", yr: "'25" },
    { cat: "SG·038", nm: "Carbon Light", sy: "Two physicists fall for the same impossible result.", fmt: ["4K", "HDR"], ru: "02:11", yr: "'24" },
    { cat: "SG·036", nm: "Margin Notes", sy: "An archivist finds a confession in the footnotes.", fmt: ["HD"], ru: "01:39", yr: "'24" },
    { cat: "SG·031", nm: "Dry County", sy: "A bootlegger's daughter runs the last honest still.", fmt: ["4K"], ru: "02:02", yr: "'23" },
    { cat: "SG·029", nm: "Foldback", sy: "A sound engineer hears tomorrow in the monitors.", fmt: ["4K", "ATMOS"], ru: "01:47", yr: "'23" },
  ];
  return (
    <div className="ix-root">
      <style dangerouslySetInnerHTML={{ __html: ixCSS }} />

      <div className="ix-util">
        <div className="l"><span><span className="dot">●</span> SYSTEM ONLINE</span><span>CATALOG · 1,284 TITLES</span><span>EDITION 06.21.26</span></div>
        <div>4K · DOLBY ATMOS · NO ADS</div>
      </div>

      <nav className="ix-nav">
        <div className="ix-mark"><div className="ix-sq"></div>SIGNAL</div>
        <div className="ix-nl"><a className="on">Index</a><a>Films</a><a>Series</a><a>Live</a><a>Saved</a></div>
        <div className="ix-navr"><div className="ix-srch"><span>Search the index</span><span>⌕</span></div><div className="ix-av">JD</div></div>
      </nav>

      <section className="ix-hero">
        <div className="ix-hl">
          <div className="ix-tagline"><b>FEATURED</b> Entry No. 041 · Selected today</div>
          <h1 className="ix-h1">The <span className="o">Inventory</span></h1>
          <p className="ix-lede">A night auditor is sent to count the assets of a tower that keeps adding floors after dark. Restraint, repetition, and one very long elevator ride. Filed under: dread, comedy of, slow.</p>
          <div className="ix-specs">
            <div className="ix-spec"><div className="k">Runtime</div><div className="v">01:54:08</div></div>
            <div className="ix-spec"><div className="k">Format</div><div className="v">4K · ATMOS</div></div>
            <div className="ix-spec"><div className="k">Catalog</div><div className="v">SG·041</div></div>
            <div className="ix-spec"><div className="k">Match</div><div className="v" style={{ color: "var(--acid-deep)" }}>97%</div></div>
          </div>
          <div className="ix-cta">
            <div className="ix-b1"><span className="a">▶</span> Play entry 041</div>
            <div className="ix-b2">＋ Add to index</div>
          </div>
        </div>
        <div className="ix-hr">
          <div className="ix-poster" style={{ background: "linear-gradient(165deg, #2a2a26 0%, #0e0e0c 100%)" }}>
            <div className="pg"></div>
            <div className="frame"></div>
            <div className="num">SG·041 / 35MM TRANSFER</div>
            <div className="nm">THE<br />INVENTORY</div>
          </div>
        </div>
      </section>

      <section className="ix-ledger">
        <div className="ix-secrow"><h2>The standing index</h2><span className="c">SORTED · NEWEST FIRST</span></div>
        <div className="ix-lhead"><div>Cat.</div><div>Title</div><div>Synopsis</div><div>Format</div><div>Runtime</div><div>Year</div></div>
        {rows.map((r, i) => (
          <div className="ix-lrow" key={i}>
            <div className="cat">{r.cat}</div>
            <div className="nm">{r.nm}</div>
            <div className="sy">{r.sy}</div>
            <div className="fmt">{r.fmt.map((f, j) => <s key={j} style={{ marginRight: 5 }}>{f}</s>)}</div>
            <div className="ru">{r.ru}</div>
            <div className="pl"><span className="ar">▶</span> {r.yr}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

window.OptionCIndex = OptionCIndex;
