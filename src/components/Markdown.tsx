import type { ReactNode } from 'react';
import { MiniJit } from './MiniJit';
import { COLOR_LIST, SHAPE_LIST } from '../lib/shapes';

/**
 * Just enough Markdown for GitHub release notes: headings, paragraphs, nested
 * lists, tables, code fences and inline code/bold/italic/links. Builds React
 * elements directly, so nothing in a release body is ever injected as HTML.
 */

const INLINE = /(`[^`]+`)|(\*\*[^*]+?\*\*)|(\*[^*\s][^*]*?\*)|(_[^_\s][^_]*?_)|(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s)]+)/g;

export function inline(text: string, key = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const tok = m[0];
    const k = `${key}-${n++}`;
    if (m[1]) out.push(<code key={k} className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.86em] text-ink-2">{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={k} className="font-semibold text-ink">{inline(tok.slice(2, -2), k)}</strong>);
    else if (m[3] || m[4]) out.push(<em key={k} className="text-muted">{inline(tok.slice(1, -1), k)}</em>);
    else if (m[5]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok) ?? [];
      out.push(/^https?:\/\//.test(href ?? '') ? <a key={k} href={href} target="_blank" rel="noopener" className="text-accent-2 underline decoration-accent-2/30 underline-offset-4 hover:decoration-accent-2">{inline(label, k)}</a> : label);
    } else out.push(<a key={k} href={tok} target="_blank" rel="noopener" className="break-all text-accent-2 underline decoration-accent-2/30 underline-offset-4">{tok}</a>);
    last = at + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Item = { text: string; children: Item[] };
type Block =
  | { t: 'h'; level: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'list'; ordered: boolean; items: Item[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'code'; text: string };

const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function parse(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.trim().startsWith('```')) {
      const body: string[] = [];
      for (i++; i < lines.length && !lines[i].trim().startsWith('```'); i++) body.push(lines[i]);
      blocks.push({ t: 'code', text: body.join('\n') });
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { blocks.push({ t: 'h', level: h[1].length, text: h[2].trim() }); i++; continue; }

    if (line.trim().startsWith('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? '')) {
      const head = cells(line);
      const rows: string[][] = [];
      for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) rows.push(cells(lines[i]));
      blocks.push({ t: 'table', head, rows });
      continue;
    }

    const first = LIST.exec(line);
    if (first) {
      const root: Item = { text: '', children: [] };
      const stack: { indent: number; item: Item }[] = [{ indent: -1, item: root }];
      const ordered = /\d/.test(first[2]);
      for (; i < lines.length; i++) {
        const m = LIST.exec(lines[i]);
        if (!m) {
          // A wrapped continuation line belongs to the item above it.
          if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && stack.length > 1) { stack[stack.length - 1].item.text += ' ' + lines[i].trim(); continue; }
          break;
        }
        const indent = m[1].replace(/\t/g, '    ').length;
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        const item: Item = { text: m[3], children: [] };
        stack[stack.length - 1].item.children.push(item);
        stack.push({ indent, item });
      }
      blocks.push({ t: 'list', ordered, items: root.children });
      continue;
    }

    const para: string[] = [];
    for (; i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\s*([-*+]|\d+[.)])\s)/.test(lines[i]) && !lines[i].trim().startsWith('|'); i++) para.push(lines[i].trim());
    blocks.push({ t: 'p', text: para.join(' ') });
  }
  return blocks;
}

/** Splits notes into the intro and one entry per `## ` section. */
export function sections(md: string) {
  const blocks = parse(md);
  const intro: Block[] = [];
  const out: { title: string; blocks: Block[] }[] = [];
  for (const b of blocks) {
    if (b.t === 'h' && b.level <= 2) out.push({ title: b.text, blocks: [] });
    else (out.length ? out[out.length - 1].blocks : intro).push(b);
  }
  return { intro, sections: out };
}

function List({ items, depth = 0, seed = 0 }: { items: Item[]; depth?: number; seed?: number }) {
  return (
    <ul className={depth ? 'mt-2.5 space-y-2' : 'space-y-3.5'}>
      {items.map((it, i) => {
        const b = seed + i;
        return (
          <li key={i} className="flex gap-3.5">
            {depth === 0 ? (
              <MiniJit shape={SHAPE_LIST[b % SHAPE_LIST.length]} color={COLOR_LIST[(b * 3) % COLOR_LIST.length]} size={18} className="mt-[3px] shrink-0" />
            ) : (
              <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-faint" />
            )}
            <div className="min-w-0 flex-1">
              {inline(it.text, `li${depth}-${b}`)}
              {it.children.length > 0 && <List items={it.children} depth={depth + 1} seed={b * 5} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[15.5px] leading-[1.7] text-ink-2/90">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h':
            return <h4 key={i} className="pt-2 text-[17px] font-semibold tracking-tight text-ink">{inline(b.text)}</h4>;
          case 'p':
            return <p key={i}>{inline(b.text, `p${i}`)}</p>;
          case 'list':
            return <List key={i} items={b.items} seed={i * 3} />;
          case 'code':
            return <pre key={i} className="overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-[13px] leading-relaxed text-ink-2">{b.text}</pre>;
          case 'table':
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-white/[0.03] text-muted">
                    <tr>{b.head.map((c, j) => <th key={j} className="px-4 py-2.5 font-medium">{inline(c)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-line">{r.map((c, k) => <td key={k} className="px-4 py-2.5 align-top">{inline(c, `t${j}${k}`)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
