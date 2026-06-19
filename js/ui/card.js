// Shared poster card + loading skeleton, used by Home, Catalog, and Search.
// Centralizing it means the broken-poster fallback and markup live in one place.

export function makeCard(meta, onSelect) {
  const card = document.createElement("button");
  card.className = "focusable card";
  card.type = "button";

  if (meta.poster) {
    const img = document.createElement("img");
    img.className = "poster";
    img.loading = "lazy";
    img.alt = "";
    img.src = meta.poster;
    // Broken/blocked poster URL → swap in the empty placeholder instead of a
    // browser broken-image glyph.
    img.onerror = () => {
      const ph = document.createElement("span");
      ph.className = "poster poster-empty";
      if (img.parentNode) img.replaceWith(ph);
    };
    card.appendChild(img);
  } else {
    const ph = document.createElement("span");
    ph.className = "poster poster-empty";
    card.appendChild(ph);
  }

  const title = document.createElement("span");
  title.className = "card-title";
  title.textContent = meta.name || "Untitled";
  card.appendChild(title);

  card.onclick = onSelect;
  return card;
}

// A shimmering placeholder shown while a catalog loads.
export function makeSkeleton() {
  const sk = document.createElement("div");
  sk.className = "card card-skeleton";
  sk.innerHTML = `<span class="poster poster-skel"></span><span class="title-skel"></span>`;
  return sk;
}
