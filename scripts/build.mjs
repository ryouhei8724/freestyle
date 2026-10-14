import { readFile, writeFile, mkdir, readdir, rm, cp } from 'node:fs/promises';
import { diagrams, warnings } from '../src/diagrams.mjs';

// 本文の技術内容を確認した日付。ビルド日ではなく、内容を見直したときに更新する。
const TECH_DATE = '2026-10-14';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const out = new URL('dist/client/', root);

const escapeAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

if (warnings.length) {
  throw new Error('図のラベルが枠からはみ出す可能性があります:\n' + warnings.map(w => '  - ' + w).join('\n'));
}

const sectionFiles = (await readdir(new URL('src/sections/', root))).filter(f => f.endsWith('.html')).sort();
let body = (await Promise.all(sectionFiles.map(f => read('src/sections/' + f)))).join('\n');

let figNo = 0;
const usedFigures = new Set();
body = body.replace(/<!--\s*figure:([\w-]+)\s*-->/g, (_, id) => {
  const d = diagrams[id];
  if (!d) throw new Error('未定義の図: ' + id);
  if (usedFigures.has(id)) throw new Error('図が二重に使われています: ' + id);
  usedFigures.add(id);
  figNo += 1;
  const minw = d.minWidth ? ` data-minw style="--minw:${d.minWidth}px"` : '';
  const svg = d.svg.replace('<svg ', `<svg${minw} `);
  return `<figure id="fig-${id}">
<div class="fig-scroll">${svg}</div>
<p class="scroll-hint" aria-hidden="true">← 図は横にスクロールできます →</p>
<figcaption><span class="fig-no">図${figNo}</span>${d.caption}</figcaption>
</figure>`;
});
const unused = Object.keys(diagrams).filter(id => !usedFigures.has(id));
if (unused.length) throw new Error('本文で使われていない図: ' + unused.join(', '));

// 目次：章（section.chapter）と節（h3[id]）から生成する
const toc = [];
const chapterRe = /<section class="chapter( resources)?" id="([\w-]+)" data-no="([^"]+)" data-toc="([^"]+)">([\s\S]*?)<\/section>/g;
let chapterCount = 0;
for (const m of body.matchAll(chapterRe)) {
  const [, resources, id, no, title, inner] = m;
  if (!resources) chapterCount += 1;
  toc.push(`        <a href="#${id}"><span class="no">${no}</span>${title}</a>`);
  for (const h of inner.matchAll(/<h3 id="([\w-]+)"(?: data-toc="([^"]+)")?>([\s\S]*?)<\/h3>/g)) {
    const sec = h[3].match(/<span class="sec">([^<]+)<\/span>/);
    const label = h[2] ?? stripTags(h[3].replace(/<span class="sec">[^<]*<\/span>/, ''));
    toc.push(`        <a class="sub" href="#${h[1]}" data-chapter="${id}">${sec ? `<span class="no">${sec[1]}</span>` : ''}${label}</a>`);
  }
}
if (chapterCount === 0) throw new Error('章が見つかりません');

const template = await read('src/template.html');
const css = await read('src/styles.css');
const js = await read('src/app.js');
const html = template
  .replaceAll('{{CSS}}', css.trim())
  .replaceAll('{{JS}}', js.trim())
  .replaceAll('{{TOC}}', toc.join('\n'))
  .replaceAll('{{BODY}}', body.trim())
  .replaceAll('{{FIGCOUNT}}', String(figNo))
  .replaceAll('{{CHAPTERCOUNT}}', String(chapterCount))
  .replaceAll('{{DATE}}', TECH_DATE)
  .replaceAll('{{DATE_DOT}}', TECH_DATE.replaceAll('-', '.'));

const leftover = html.match(/\{\{[A-Z_]+\}\}/);
if (leftover) throw new Error('未置換のプレースホルダー: ' + leftover[0]);

// 重複IDとページ内リンク切れを検出する
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) throw new Error('重複したID: ' + [...new Set(dup)].join(', '));
const idSet = new Set(ids);
const broken = [...html.matchAll(/href="#([^"]*)"/g)].map(m => m[1]).filter(id => id && !idSet.has(id));
if (broken.length) throw new Error('リンク先のないページ内リンク: ' + [...new Set(broken)].join(', '));

const notFound = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ページが見つかりません｜オープンテーブルフォーマットを読み解く</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:"Hiragino Sans","Yu Gothic UI","Noto Sans JP",sans-serif;background:#fcfcfa;color:#14222e;padding:16px}@media(prefers-color-scheme:dark){body{background:#0e1318;color:#e2e8ed}a{color:#8fcde1}}a{color:#145a72}</style>
</head><body><main><p>お探しのページは見つかりませんでした。</p><p><a href="/">${escapeAttr('オープンテーブルフォーマットを読み解く')} のトップへ</a></p></main></body></html>
`;

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(new URL('public/', root), out, { recursive: true });
await writeFile(new URL('index.html', out), html);
await writeFile(new URL('404.html', out), notFound);
console.log(`Built dist/client/index.html — ${chapterCount} chapters, ${figNo} figures, ${(html.length / 1024).toFixed(0)} KiB`);
