// Option E — "Soft Index"
// Keeps Option C's structured, numbered, column-aligned index — but softened and
// re-themed for ENTERTAINMENT: warm blush palette, coral accent, rounded + shadowed
// (no hard rules / outline type), friendly Bricolage + Hanken type, tabular numerals.
// Completely different color scheme & font family from Helio / C / D.
// Scoped under .sx-  •  exports window.OptionESoftIndex

const SX_FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap";

const sxCSS = `
@import url('${SX_FONTS}');
.sx-root{
  --paper:#f8f1ea;--paper-2:#fdf9f4;--paper-3:#f1e7dd;--ink:#3a2d2b;--ink-2:#8c7972;--ink-3:#b8a79d;
  --coral:#ef8a5d;--coral-deep:#d4633a;--berry:#d8607a;--plum:#9a6fbf;--line:rgba(58,45,43,.09);
  --glow-1:#fbe6d8;--glow-2:#f6e3ea;
  --radius:22px;--shadow:0 16px 38px -18px rgba(74,45,40,.34);
  width:1440px;font-family:'Hanken Grotesk',sans-serif;-webkit-font-smoothing:antialiased;
  background:
    radial-gradient(80% 50% at 88% -8%, var(--glow-1) 0%, transparent 60%),
    radial-gradient(60% 40% at 4% 0%, var(--glow-2) 0%, transparent 55%),
    var(--paper);
  color:var(--ink);position:relative;overflow:hidden;}
.sx-root *{box-sizing:border-box;}
.sx-disp{font-family:'Bricolage Grotesque',sans-serif;}
.sx-num{font-variant-numeric:tabular-nums;}
/* top bar — friendly, soft */
.sx-nav{display:flex;align-items:center;gap:26px;padding:26px 48px 18px;position:relative;z-index:2;}
.sx-logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:27px;letter-spacing:-.02em;display:flex;align-items:center;gap:11px;margin:0;}
.sx-logo .dot{width:16px;height:16px;border-radius:7px 7px 7px 2px;background:linear-gradient(140deg,var(--coral),var(--berry));}
.sx-nl{display:flex;gap:8px;margin-left:8px;}
.sx-nl a{color:var(--ink-2);text-decoration:none;font-size:15px;font-weight:500;padding:8px 16px;border-radius:999px;cursor:pointer;}
.sx-nl a.on{background:var(--ink);color:var(--paper);}
.sx-navr{margin-left:auto;display:flex;align-items:center;gap:12px;}
.sx-search{display:flex;align-items:center;gap:44px;background:var(--paper-2);border:1px solid var(--line);border-radius:999px;padding:11px 18px;color:var(--ink-3);font-size:14.5px;box-shadow:var(--shadow);}
.sx-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(140deg,var(--plum),var(--berry));box-shadow:var(--shadow);}
/* genre pills (entertainment breadth) */
.sx-genres{display:flex;gap:10px;padding:4px 48px 6px;position:relative;z-index:2;flex-wrap:wrap;}
.sx-gpill{display:flex;align-items:center;gap:8px;background:var(--paper-2);border:1px solid var(--line);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:500;color:var(--ink-2);cursor:pointer;}
.sx-gpill .gd{width:8px;height:8px;border-radius:50%;}
.sx-gpill.on{background:var(--ink);color:var(--paper);border-color:transparent;}
/* hero (C structure, softened) */
.sx-hero{display:grid;grid-template-columns:1fr 440px;gap:46px;align-items:center;padding:26px 48px 40px;position:relative;z-index:2;}
.sx-eyebrow{display:inline-flex;align-items:center;gap:12px;font-size:13px;font-weight:600;letter-spacing:.02em;color:var(--ink-2);white-space:nowrap;}
.sx-eyebrow b{background:var(--coral);color:#fff;padding:5px 12px;border-radius:999px;font-size:12px;letter-spacing:.06em;white-space:nowrap;}
.sx-h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:84px;line-height:.92;letter-spacing:-.03em;margin:22px 0 0;text-wrap:balance;}
.sx-h1 .soft{color:var(--coral-deep);}
.sx-lede{font-size:18px;line-height:1.55;color:var(--ink-2);max-width:540px;margin-top:20px;text-wrap:pretty;}
/* soft spec strip — pill, dot-separated (replaces C's hard cells) */
.sx-specs{display:inline-flex;align-items:center;gap:24px;margin-top:28px;background:var(--paper-2);border:1px solid var(--line);
  border-radius:999px;padding:16px 28px;box-shadow:var(--shadow);}
.sx-spec{display:flex;flex-direction:column;gap:3px;}
.sx-spec .k{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);}
.sx-spec .v{font-size:17px;font-weight:600;}
.sx-specs .sep{width:1px;height:26px;background:var(--line);}
.sx-fmts{display:flex;gap:6px;}
.sx-fmt{font-size:11px;font-weight:600;letter-spacing:.04em;background:var(--paper-3);border-radius:999px;padding:4px 10px;color:var(--ink-2);}
.sx-actions{display:flex;gap:12px;margin-top:30px;}
.sx-btn{display:inline-flex;align-items:center;gap:11px;border:none;border-radius:999px;padding:16px 30px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;}
.sx-btn.primary{background:var(--coral);color:#fff;box-shadow:0 14px 30px -12px var(--coral);}
.sx-btn.ghost{background:var(--paper-2);color:var(--ink);border:1px solid var(--line);}
/* poster — rounded, soft shadow */
.sx-poster{position:relative;height:500px;border-radius:26px;overflow:hidden;box-shadow:0 40px 90px -34px rgba(74,45,40,.5);}
.sx-poster .g{position:absolute;inset:0;opacity:.18;background-image:radial-gradient(rgba(255,255,255,.7) .5px,transparent .6px);background-size:3px 3px;}
.sx-poster .tag{position:absolute;top:22px;left:22px;background:rgba(255,255,255,.92);color:var(--ink);font-size:12px;font-weight:700;letter-spacing:.04em;padding:7px 14px;border-radius:999px;}
.sx-poster .nm{position:absolute;left:26px;bottom:26px;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:38px;color:#fff;line-height:.92;letter-spacing:-.02em;text-shadow:0 2px 18px rgba(0,0,0,.35);}
/* index (C structure preserved, softened) */
.sx-sec{padding:6px 48px 50px;position:relative;z-index:2;}
.sx-sechead{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px;}
.sx-sechead h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:26px;letter-spacing:-.02em;margin:0;}
.sx-sechead h2 small{font-family:'Hanken Grotesk',sans-serif;font-weight:500;color:var(--ink-3);font-size:14px;margin-left:12px;}
.sx-sechead .sort{background:var(--paper-2);border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:14px;font-weight:600;color:var(--ink-2);cursor:pointer;}
.sx-cols{display:grid;grid-template-columns:62px 1.5fr 1fr 150px 92px 70px;gap:20px;padding:8px 22px;
  font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);}
.sx-list{display:flex;flex-direction:column;gap:8px;}
.sx-row{display:grid;grid-template-columns:62px 1.5fr 1fr 150px 92px 70px;gap:20px;align-items:center;
  background:var(--paper-2);border:1px solid var(--line);border-radius:18px;padding:18px 22px;cursor:pointer;
  transition:transform .14s ease, box-shadow .14s ease;}
.sx-row:hover{transform:translateY(-2px);box-shadow:var(--shadow);}
.sx-row .no{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:18px;color:var(--coral-deep);}
.sx-row .nm{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:20px;letter-spacing:-.01em;}
.sx-row .sy{color:var(--ink-2);font-size:14.5px;line-height:1.4;}
.sx-row .fmt{display:flex;gap:6px;flex-wrap:wrap;}
.sx-row .ru{font-size:14.5px;color:var(--ink-2);}
.sx-row .meta{display:flex;align-items:center;gap:8px;justify-content:flex-end;font-size:14px;font-weight:600;color:var(--ink);}
.sx-row .star{color:var(--coral);}
`;

function SxPoster({ pal, title, tag, h }) {
  const bg = `radial-gradient(120% 95% at 28% 14%, ${pal[0]} 0%, transparent 62%), linear-gradient(158deg, ${pal[1]}, ${pal[2]})`;
  return (
    <div className="sx-poster" style={{ background: bg, height: h }}>
      <div className="g"></div>
      {tag && <div className="tag">{tag}</div>}
      {title && <div className="nm">{title}</div>}
    </div>
  );
}

function OptionESoftIndex({ vars = {}, heroPal } = {}) {
  const genres = [
    { n: "All", on: true }, { n: "Comedy", c: "#ef8a5d" }, { n: "Drama", c: "#d8607a" },
    { n: "Thriller", c: "#9a6fbf" }, { n: "Feel-good", c: "#e0a458" }, { n: "Docs", c: "#5fae9a" },
  ];
  const rows = [
    { nm: "The Inventory", sy: "A night auditor counts a tower that won't stop growing.", fmt: ["4K", "Comedy"], ru: "1h 54m", rt: "4.7" },
    { nm: "Mara, Slowly", sy: "Two strangers share one apartment across forty years.", fmt: ["4K", "Drama"], ru: "2h 11m", rt: "4.9" },
    { nm: "Foldback", sy: "A sound engineer starts hearing tomorrow in the monitors.", fmt: ["HD", "Thriller"], ru: "1h 39m", rt: "4.5" },
    { nm: "Sunday Roast", sy: "A chaotic family runs the world's smallest supper club.", fmt: ["4K", "Comedy"], ru: "1h 22m", rt: "4.8" },
    { nm: "Dry County", sy: "A bootlegger's daughter runs the last honest still in town.", fmt: ["4K", "Drama"], ru: "2h 02m", rt: "4.6" },
  ];
  return (
    <div className="sx-root" style={vars}>
      <style dangerouslySetInnerHTML={{ __html: sxCSS }} />

      <nav className="sx-nav">
        <h1 className="sx-logo"><span className="dot"></span>Marlow</h1>
        <div className="sx-nl"><a className="on">Home</a><a>Films</a><a>Series</a><a>Watchlist</a></div>
        <div className="sx-navr"><div className="sx-search"><span>What are we watching?</span><span>⌕</span></div><div className="sx-av"></div></div>
      </nav>

      <div className="sx-genres">
        {genres.map((g, i) => (
          <div key={i} className={"sx-gpill" + (g.on ? " on" : "")}>
            {g.c && <span className="gd" style={{ background: g.c }}></span>}{g.n}
          </div>
        ))}
      </div>

      <section className="sx-hero">
        <div>
          <div className="sx-eyebrow"><b>TONIGHT'S PICK</b> chosen for a Saturday in</div>
          <h1 className="sx-h1">Sunday<br /><span className="soft">Roast</span></h1>
          <p className="sx-lede">A gloriously chaotic family turns their tiny flat into the world's smallest supper club. Warm, loud, and over before the kettle's cold — the perfect easy watch.</p>
          <div className="sx-specs">
            <div className="sx-spec"><div className="k">Runtime</div><div className="v sx-num">1h 22m</div></div>
            <div className="sep"></div>
            <div className="sx-spec"><div className="k">Format</div><div className="sx-fmts"><span className="sx-fmt">4K</span><span className="sx-fmt">ATMOS</span></div></div>
            <div className="sep"></div>
            <div className="sx-spec"><div className="k">Loved by</div><div className="v sx-num">★ 4.8</div></div>
          </div>
          <div className="sx-actions">
            <button className="sx-btn primary">▶ Play now</button>
            <button className="sx-btn ghost">＋ Watchlist</button>
          </div>
        </div>
        <SxPoster pal={heroPal || ["#f6a86b", "#d8607a", "#7a3a55"]} title="Sunday Roast" tag="Comedy · 2025" />
      </section>

      <section className="sx-sec">
        <div className="sx-sechead">
          <h2>Tonight's lineup<small>Hand-picked, newest first</small></h2>
          <button className="sort">Sort: Trending ⌄</button>
        </div>
        <div className="sx-cols"><div>#</div><div>Title</div><div>What's it about</div><div>Tags</div><div>Runtime</div><div>Rating</div></div>
        <div className="sx-list">
          {rows.map((r, i) => (
            <div className="sx-row" key={i}>
              <div className="no sx-num">{i + 1}</div>
              <div className="nm">{r.nm}</div>
              <div className="sy">{r.sy}</div>
              <div className="fmt">{r.fmt.map((f, j) => <span className="sx-fmt" key={j}>{f}</span>)}</div>
              <div className="ru sx-num">{r.ru}</div>
              <div className="meta sx-num"><span className="star">★</span>{r.rt}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

window.OptionESoftIndex = OptionESoftIndex;

// Curated color themes (chrome only — posters stay as colourful content art).
// Each: vars override the CSS custom props; heroPal tints the featured key-art;
// genres optionally recolours the genre-dot palette to match.
window.SOFT_INDEX_THEMES = [
  {
    id: "coral", name: "Coral Blush", note: "Warm cream · coral — the current pick",
    swatches: ["#f8f1ea", "#ef8a5d", "#d8607a", "#9a6fbf"],
    vars: {},
    heroPal: ["#f6a86b", "#d8607a", "#7a3a55"],
  },
  {
    id: "mulberry", name: "Mulberry Dusk", note: "Lavender paper · magenta — moody evening",
    swatches: ["#f3eef6", "#c2548a", "#8a5cc4", "#6f5bd0"],
    vars: {
      "--paper": "#f3eef6", "--paper-2": "#fbf8fc", "--paper-3": "#ece2f0",
      "--ink": "#2f2535", "--ink-2": "#7a6c86", "--ink-3": "#b0a3bb",
      "--coral": "#c2548a", "--coral-deep": "#9c3a6e", "--berry": "#8a5cc4", "--plum": "#6f5bd0",
      "--line": "rgba(47,37,53,.10)", "--glow-1": "#ecd9f0", "--glow-2": "#e0d6f7",
    },
    heroPal: ["#c069a8", "#7a4bbf", "#3c2a5e"],
  },
  {
    id: "forest", name: "Forest Supper", note: "Sage · terracotta — cosy & earthy",
    swatches: ["#f1f0e6", "#d9774a", "#c99a3e", "#5f8c6a"],
    vars: {
      "--paper": "#f1f0e6", "--paper-2": "#fafaf2", "--paper-3": "#e6e6d6",
      "--ink": "#2c322a", "--ink-2": "#6f7a68", "--ink-3": "#a3ab98",
      "--coral": "#d9774a", "--coral-deep": "#b85733", "--berry": "#c99a3e", "--plum": "#5f8c6a",
      "--line": "rgba(44,50,42,.10)", "--glow-1": "#e3ecd6", "--glow-2": "#f0e6d2",
    },
    heroPal: ["#e0a05a", "#c2683c", "#4a5a3a"],
  },
  {
    id: "seafoam", name: "Seafoam Soda", note: "Cool mint · coral pop — fresh & playful",
    swatches: ["#e9f3ef", "#ff7a66", "#2bb39a", "#3aa0c4"],
    vars: {
      "--paper": "#e9f3ef", "--paper-2": "#f6fbf9", "--paper-3": "#d8ebe4",
      "--ink": "#233330", "--ink-2": "#5f7a72", "--ink-3": "#9ab3aa",
      "--coral": "#ff7a66", "--coral-deep": "#e85a44", "--berry": "#2bb39a", "--plum": "#3aa0c4",
      "--line": "rgba(35,51,48,.10)", "--glow-1": "#d2f0e6", "--glow-2": "#ffe4dc",
    },
    heroPal: ["#41c4a8", "#ff8a72", "#1f5a52"],
  },
  {
    id: "midnight", name: "Midnight Velvet", note: "Dark plum · peach — premium night-in",
    swatches: ["#1a1620", "#ff9e7a", "#e86a96", "#b78cff"],
    vars: {
      "--paper": "#1a1620", "--paper-2": "#241f2c", "--paper-3": "#2e2838",
      "--ink": "#f4ecf2", "--ink-2": "#b6a8be", "--ink-3": "#7c7088",
      "--coral": "#ff9e7a", "--coral-deep": "#ff8259", "--berry": "#e86a96", "--plum": "#b78cff",
      "--line": "rgba(255,255,255,.10)", "--glow-1": "#3a2a4a", "--glow-2": "#2a2440",
      "--shadow": "0 18px 44px -18px rgba(0,0,0,.62)",
    },
    heroPal: ["#ff9e7a", "#e86a96", "#3a2a4a"],
  },
];
