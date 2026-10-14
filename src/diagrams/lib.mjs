// インラインSVG図の共通部品。色はページ側のCSS（.dg 配下のクラス）で決まり、
// ライト／ダーク両テーマに追従する。座標はすべて viewBox 上の値。
// テキストは dominant-baseline: central（CSS）なので、y は文字の縦中心を表す。

export const diagrams = {};
export const warnings = [];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SIZES = { 'tx-s': 13, 'tx-xs': 12, 'tx-h': 17, 'tx-mono': 13 };
const sizeOf = cls => {
  for (const c of String(cls || '').split(/\s+/)) if (SIZES[c]) return SIZES[c];
  return 15;
};
const WIDE = /[←-⇿①-⓿■-➿⺀-鿿豈-﫿＀-｠￠-￦]/;

// 文字幅の概算（全角1em、英字は約0.56〜0.68em）。はみ出し検査に使う。
export function textWidth(s, cls = '') {
  const size = sizeOf(cls);
  const mono = /tx-mono/.test(cls);
  const bold = /tx-b|tx-h/.test(cls);
  let w = 0;
  for (const ch of String(s)) {
    if (WIDE.test(ch)) w += 1;
    else if (mono) w += 0.62;
    else if (/[A-Z]/.test(ch)) w += 0.68;
    else if (/[a-z0-9]/.test(ch)) w += 0.57;
    else if (/[\s.,:;'|!()[\]{}/]/.test(ch)) w += 0.34;
    else w += 0.62;
  }
  return w * size * (bold ? 1.06 : 1);
}

const markerDefs = id =>
  '<defs>' +
  ['n', 'ac', 'wm', 'ok', 'bad']
    .map(
      c =>
        `<marker id="${id}-${c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path class="mk${c === 'n' ? '' : ' ' + c}" d="M0,1 L10,5 L0,9 z"/></marker>`,
    )
    .join('') +
  '</defs>';

const markerFor = cls => (['ac', 'wm', 'ok', 'bad'].find(c => String(cls).split(/\s+/).includes(c)) ?? 'n');

export function diagram(id, meta, draw) {
  if (diagrams[id]) throw new Error('図IDの重複: ' + id);
  const parts = [];
  const check = (s, cls, max, where) => {
    if (max != null && textWidth(s, cls) > max) {
      warnings.push(`${id}: 「${s}」が幅 ${Math.round(max)} に収まりません（概算 ${Math.round(textWidth(s, cls))}）${where ? ' @' + where : ''}`);
    }
  };
  const g = {
    raw: s => parts.push(s),
    box(x, y, w, h, cls = '', rx = 7) {
      parts.push(`<rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`);
    },
    // 単独テキスト。max を渡すと幅を検査する。
    t(x, y, s, cls = '', anchor = 'middle', max) {
      check(s, cls, max, `${x},${y}`);
      parts.push(`<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`);
    },
    // 線の上に置くラベル。背景色の矩形を敷いて、下を通る線を隠す。
    label(x, y, s, cls = 'tx-s', anchor = 'middle', max) {
      check(s, cls, max, `${x},${y}`);
      const w = textWidth(s, cls) + 10;
      const h = sizeOf(cls) * 1.5;
      const x0 = anchor === 'start' ? x - 5 : anchor === 'end' ? x - w + 5 : x - w / 2;
      parts.push(`<rect class="lbl-bg" x="${x0.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`);
      parts.push(`<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`);
    },
    // 複数行テキストを (x, cy) を中心に縦に並べる。行は文字列か [文字列, クラス]。
    lines(x, cy, rows, { cls = '', anchor = 'middle', max, gap = 1.38 } = {}) {
      const items = rows.map(r => (Array.isArray(r) ? { s: r[0], c: r[1] } : { s: r, c: cls }));
      const hs = items.map(it => sizeOf(it.c) * gap);
      const total = hs.reduce((a, b) => a + b, 0);
      let top = cy - total / 2;
      items.forEach((it, i) => {
        check(it.s, it.c, max, `${x},${cy}`);
        parts.push(`<text class="${it.c}" x="${x}" y="${(top + hs[i] / 2).toFixed(1)}" text-anchor="${anchor}">${esc(it.s)}</text>`);
        top += hs[i];
      });
    },
    // 枠＋中央寄せの複数行ラベル。幅の検査つき。
    node(x, y, w, h, rows, { cls = '', tcls = '', pad = 9, anchor = 'middle', rx = 7 } = {}) {
      g.box(x, y, w, h, cls, rx);
      const rowsArr = Array.isArray(rows) ? rows : [rows];
      const tx = anchor === 'start' ? x + pad + 3 : anchor === 'end' ? x + w - pad - 3 : x + w / 2;
      g.lines(tx, y + h / 2, rowsArr, { cls: tcls, anchor, max: w - pad * 2 });
      const hs = rowsArr.reduce((a, r) => a + sizeOf(Array.isArray(r) ? r[1] : tcls) * 1.38, 0);
      if (hs > h + 2) warnings.push(`${id}: 枠(${x},${y})の高さ ${h} に ${rowsArr.length} 行が収まりません（必要 ${Math.round(hs)}）`);
    },
    // 折れ線の矢印。points = [[x,y], ...]
    arrow(points, { cls = '', head = true, tail = false } = {}) {
      const m = markerFor(cls);
      const pts = points.map(p => p.join(',')).join(' ');
      parts.push(
        `<polyline class="ln ${cls}" points="${pts}"${head ? ` marker-end="url(#${id}-${m})"` : ''}${tail ? ` marker-start="url(#${id}-${m})"` : ''}/>`,
      );
    },
    // 任意のパス（曲線など）
    path(d, { cls = '', head = true, tail = false } = {}) {
      const m = markerFor(cls);
      parts.push(`<path class="ln ${cls}" d="${d}"${head ? ` marker-end="url(#${id}-${m})"` : ''}${tail ? ` marker-start="url(#${id}-${m})"` : ''}/>`);
    },
    line(x1, y1, x2, y2, cls = '') {
      parts.push(`<line class="ln ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    },
    circle(cx, cy, r, cls = 'dot') {
      parts.push(`<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`);
    },
    // ✕印（スキップ・不可を表す）
    cross(cx, cy, r = 7, cls = 'bad') {
      parts.push(`<path class="ln ${cls}" d="M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}"/>`);
    },
    // 縦の波括弧風ブラケット（範囲を示す）
    bracket(x, y1, y2, side = 'right', cls = '') {
      const d = side === 'right' ? 10 : -10;
      parts.push(`<path class="ln ${cls}" d="M${x},${y1} h${d} V${y2} h${-d}"/>`);
    },
  };
  draw(g);
  const { w, h, title, caption, minWidth } = meta;
  diagrams[id] = {
    title,
    caption,
    minWidth,
    svg: `<svg class="dg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg">${markerDefs(id)}${parts.join('')}</svg>`,
  };
}
