// Reusable on-screen keyboard for D-pad text entry. Keys are plain `.focusable`
// buttons, so the centralized input engine handles arrow navigation and Enter
// for free. The caller owns the text buffer; this only emits key actions.
// Symbols row is URL-friendly so the same keyboard can serve addon-URL entry.

import { icon } from "./icons.js";

export function createKeyboard({
  onInput,                 // (char) => void
  onSpace,                 // () => void
  onBackspace,             // () => void
  onClear,                 // () => void
  onSubmit,                // () => void
  submitLabel = "Search",
}) {
  const el = document.createElement("div");
  el.className = "keyboard";

  const rows = [
    "1234567890",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "./:-_?=&",
  ];

  rows.forEach((chars) => {
    const row = document.createElement("div");
    row.className = "kb-row";
    [...chars].forEach((ch) => {
      const key = document.createElement("button");
      key.className = "focusable kb-key";
      key.type = "button";
      key.textContent = ch;
      key.onclick = () => onInput(ch);
      row.appendChild(key);
    });
    el.appendChild(row);
  });

  const actions = document.createElement("div");
  actions.className = "kb-row kb-actions";
  const mkAction = (html, cls, fn) => {
    const b = document.createElement("button");
    b.className = `focusable kb-key ${cls}`;
    b.type = "button";
    b.innerHTML = html;
    b.onclick = fn;
    return b;
  };
  actions.appendChild(mkAction("Space", "kb-space", onSpace));
  actions.appendChild(mkAction(icon("backspace"), "kb-back", onBackspace));
  actions.appendChild(mkAction("Clear", "kb-clear", onClear));
  actions.appendChild(mkAction(submitLabel, "kb-submit", onSubmit));
  el.appendChild(actions);

  return el;
}
