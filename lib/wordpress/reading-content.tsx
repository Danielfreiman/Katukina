import { createElement, Fragment, type ReactNode } from "react";
import { parseFragment, type DefaultTreeAdapterTypes } from "parse5";
import type { ReadingChapter } from "@/components/site/reading-page";

type Node = DefaultTreeAdapterTypes.ChildNode;
const ignored = new Set(["script", "style", "template", "iframe", "noscript"]);
const containers = new Set([
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
]);
const textElements = new Set([
  "p",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "sup",
  "sub",
  "del",
  "figcaption",
]);

// Only recreate local text elements. WordPress attributes and embeds never reach the page.
function renderText(node: Node, key: number): ReactNode {
  if ("value" in node) return node.value;
  if (!("tagName" in node) || ignored.has(node.tagName)) return null;
  if (node.tagName === "br") return <br key={key} />;
  const children = node.childNodes.map(renderText);
  const tag = textElements.has(node.tagName) ? node.tagName : Fragment;
  return createElement(tag, { key }, children);
}

function headingText(node: Node): string {
  if ("value" in node) return node.value;
  if (!("tagName" in node) || ignored.has(node.tagName)) return "";
  return node.tagName === "br"
    ? " "
    : node.childNodes.map(headingText).join("");
}

function* blocks(nodes: Node[]): Generator<Node> {
  for (const node of nodes) {
    if ("tagName" in node && containers.has(node.tagName))
      yield* blocks(node.childNodes);
    else yield node;
  }
}

export function readingContent(html: string) {
  const nodes = Array.from(blocks(parseFragment(html).childNodes));
  const headings = new Map<Node, { level: number; title: string }>();
  for (const node of nodes) {
    if (!("tagName" in node) || !/^h[1-6]$/.test(node.tagName)) continue;
    const title = headingText(node).replace(/\s+/g, " ").trim();
    if (title) headings.set(node, { level: Number(node.tagName[1]), title });
  }

  const chapterLevel = Math.min(
    ...Array.from(headings.values(), (h) => h.level),
  );
  const chapters: ReadingChapter[] = [];
  const used = new Set<string>();
  const introduction: ReactNode[] = [];
  let content = introduction;

  nodes.forEach((node, index) => {
    const heading = headings.get(node);
    if (!heading) {
      content.push(renderText(node, index));
      return;
    }
    if (heading.level > chapterLevel) {
      content.push(
        createElement(
          `h${Math.min(6, 2 + heading.level - chapterLevel)}`,
          { key: index },
          heading.title,
        ),
      );
      return;
    }
    const slug = heading.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "");
    const base = `chapter-${slug || chapters.length + 1}`;
    let id = base;
    for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`;
    used.add(id);
    content = [];
    chapters.push({ id, title: heading.title, content });
  });
  return { introduction, chapters };
}
