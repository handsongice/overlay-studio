import type { ReactNode } from "react";

/* ============================================================
   极简 Markdown 渲染器（只覆盖镜头配方卡实际用到的语法）
   支持：段落 / 无序列表 / 表格 / 引用 / **粗体** / `行内代码`
   ============================================================ */

function inline(text: string, keyBase: string): ReactNode[] {
  // 先切行内代码，再处理粗体
  const nodes: ReactNode[] = [];
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(<code key={`${keyBase}-c${i}`}>{part.slice(1, -1)}</code>);
    } else if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{part.slice(2, -2)}</strong>);
    } else {
      nodes.push(<span key={`${keyBase}-t${i}`}>{part}</span>);
    }
  });
  return nodes;
}

interface Block {
  type: "p" | "ul" | "table" | "quote";
  lines: string[];
}

function splitBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;

  const flush = () => {
    if (cur) blocks.push(cur);
    cur = null;
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (!cur || cur.type !== "ul") {
        flush();
        cur = { type: "ul", lines: [] };
      }
      cur.lines.push(ul[1]);
      continue;
    }
    if (line.startsWith("|")) {
      if (!cur || cur.type !== "table") {
        flush();
        cur = { type: "table", lines: [] };
      }
      cur.lines.push(line);
      continue;
    }
    if (line.startsWith(">")) {
      if (!cur || cur.type !== "quote") {
        flush();
        cur = { type: "quote", lines: [] };
      }
      cur.lines.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (!cur || cur.type !== "p") {
      flush();
      cur = { type: "p", lines: [] };
    }
    cur.lines.push(line);
  }
  flush();
  return blocks;
}

function Table({ lines }: { lines: string[] }) {
  const rows = lines
    .filter((l) => !/^\|[\s:|-]+\|$/.test(l))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );
  if (rows.length === 0) return null;
  const [head, ...body] = rows;
  return (
    <div className="md-table-wrap">
      <table className="md-table">
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i}>{inline(c, `th${i}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>
              {head.map((_, ci) => (
                <td key={ci}>{inline(r[ci] ?? "", `td${ri}-${ci}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 把某节正文渲染为 React 片段 */
export function renderMarkdown(content: string, keyBase: string): ReactNode {
  const blocks = splitBlocks(content);
  return blocks.map((b, bi) => {
    const k = `${keyBase}-${bi}`;
    switch (b.type) {
      case "ul":
        return (
          <ul className="md-ul" key={k}>
            {b.lines.map((l, li) => (
              <li key={li}>{inline(l, `${k}-li${li}`)}</li>
            ))}
          </ul>
        );
      case "table":
        return <Table key={k} lines={b.lines} />;
      case "quote":
        return (
          <blockquote className="md-quote" key={k}>
            {b.lines.map((l, li) => (
              <p key={li}>{inline(l, `${k}-q${li}`)}</p>
            ))}
          </blockquote>
        );
      default:
        return (
          <p className="md-p" key={k}>
            {inline(b.lines.join(" "), k)}
          </p>
        );
    }
  });
}
