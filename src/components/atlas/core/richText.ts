export type AtlasRichTextMark = {
  type: "bold" | "italic" | "underline" | "link" | "code";
  attrs?: Record<string, unknown>;
};

export type AtlasRichTextTextNode = {
  type: "text";
  text: string;
  marks?: AtlasRichTextMark[] | undefined;
};

export type AtlasRichTextInlineNode = AtlasRichTextTextNode;

export type AtlasRichTextBlockNode =
  | {
    type: "paragraph";
    content?: AtlasRichTextInlineNode[];
  }
  | {
    type: "heading";
    attrs?: {
      level?: number;
    };
    content?: AtlasRichTextInlineNode[];
  }
  | {
    type: "bulletList" | "orderedList";
    content?: Array<{
      type: "listItem";
      content?: AtlasRichTextInlineNode[];
    }>;
  };

export type AtlasRichTextDoc = {
  type: "doc";
  content: AtlasRichTextBlockNode[];
};

export function createRichTextJson(text = ""): string {
  const paragraphs = text.split(/\n{2,}/g);

  const doc: AtlasRichTextDoc = {
    type: "doc",
    content: paragraphs.map((paragraph) => ({
      type: "paragraph",
      content: paragraph
        ? [
          {
            type: "text",
            text: paragraph,
          },
        ]
        : [],
    })),
  };

  if (doc.content.length === 0) {
    doc.content.push({
      type: "paragraph",
      content: [],
    });
  }

  return JSON.stringify(doc);
}

export function readPlainTextFromRichTextValue(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  const parsed = parseRichTextJson(value);

  if (!parsed) {
    return stripHtmlToPlainText(value);
  }

  return readPlainTextFromDoc(parsed);
}

export function richTextJsonToHtml(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "<p></p>";
  }

  const parsed = parseRichTextJson(value);

  if (!parsed) {
    return plainTextToHtml(value);
  }

  return docToHtml(parsed);
}

export function htmlToRichTextJson(html: string): string {
  const trimmed = html.trim();

  if (!trimmed) {
    return createRichTextJson("");
  }

  if (looksLikeRichTextJson(trimmed)) {
    return trimmed;
  }

  /**
   * Important:
   * contentEditable may sometimes return raw text with newline characters
   * instead of wrapping new paragraphs in <p> or <div>.
   *
   * If we send raw text through DOMParser, the whole thing becomes one text
   * node, which later renders as one paragraph with collapsed whitespace.
   */
  if (!looksLikeHtml(trimmed)) {
    return createRichTextJson(trimmed);
  }

  if (typeof DOMParser === "undefined") {
    return createRichTextJson(stripHtmlToPlainText(html));
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const content = Array.from(document.body.childNodes)
    .flatMap(convertDomNodeToBlocks)
    .filter((block): block is AtlasRichTextBlockNode => Boolean(block));

  const doc: AtlasRichTextDoc = {
    type: "doc",
    content:
      content.length > 0
        ? content
        : [
          {
            type: "paragraph",
            content: [],
          },
        ],
  };

  return JSON.stringify(doc);
}

function parseRichTextJson(value: string): AtlasRichTextDoc | null {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) return null;
    if (parsed.type !== "doc") return null;
    if (!Array.isArray(parsed.content)) return null;

    return normalizeRichTextDoc(parsed);
  } catch {
    return null;
  }
}

function normalizeRichTextDoc(value: unknown): AtlasRichTextDoc | null {
  if (!isRecord(value)) return null;
  if (value.type !== "doc") return null;
  if (!Array.isArray(value.content)) return null;

  const content = value.content
    .map(normalizeBlockNode)
    .filter((block): block is AtlasRichTextBlockNode => Boolean(block));

  return {
    type: "doc",
    content,
  };
}

function normalizeBlockNode(value: unknown): AtlasRichTextBlockNode | null {
  if (!isRecord(value)) return null;

  if (value.type === "paragraph") {
    return {
      type: "paragraph",
      content: normalizeInlineContent(value.content),
    };
  }

  if (value.type === "heading") {
    return {
      type: "heading",
      attrs: {
        level: normalizeHeadingLevel(
          isRecord(value.attrs) ? value.attrs.level : undefined,
        ),
      },
      content: normalizeInlineContent(value.content),
    };
  }

  if (value.type === "bulletList" || value.type === "orderedList") {
    const listItems: Array<{
      type: "listItem";
      content?: AtlasRichTextInlineNode[];
    }> = [];

    if (Array.isArray(value.content)) {
      for (const item of value.content) {
        if (!isRecord(item)) continue;
        if (item.type !== "listItem") continue;

        listItems.push({
          type: "listItem",
          content: normalizeInlineContent(item.content),
        });
      }
    }

    return {
      type: value.type,
      content: listItems,
    };
  }

  return null;
}

function normalizeInlineContent(value: unknown): AtlasRichTextInlineNode[] {
  if (!Array.isArray(value)) return [];

  const nodes: AtlasRichTextInlineNode[] = [];

  for (const node of value) {
    if (!isRecord(node)) continue;
    if (node.type !== "text") continue;
    if (typeof node.text !== "string") continue;

    const marks = normalizeMarks(node.marks);

    const textNode: AtlasRichTextInlineNode = {
      type: "text",
      text: node.text,
    };

    if (marks) {
      textNode.marks = marks;
    }

    nodes.push(textNode);
  }

  return nodes;
}

function normalizeMarks(value: unknown): AtlasRichTextMark[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const marks: AtlasRichTextMark[] = [];

  for (const mark of value) {
    if (!isRecord(mark)) continue;
    if (!isRichTextMarkType(mark.type)) continue;

    const nextMark: AtlasRichTextMark = {
      type: mark.type,
    };

    if (isRecord(mark.attrs)) {
      nextMark.attrs = mark.attrs;
    }

    marks.push(nextMark);
  }

  return marks.length > 0 ? marks : undefined;
}

function isRichTextMarkType(value: unknown): value is AtlasRichTextMark["type"] {
  return (
    value === "bold" ||
    value === "italic" ||
    value === "underline" ||
    value === "link" ||
    value === "code"
  );
}

function docToHtml(doc: AtlasRichTextDoc): string {
  if (doc.content.length === 0) {
    return "<p></p>";
  }

  return doc.content.map(blockToHtml).join("");
}

function blockToHtml(block: AtlasRichTextBlockNode): string {
  if (block.type === "paragraph") {
    return `<p>${inlineContentToHtml(block.content)}</p>`;
  }

  if (block.type === "heading") {
    const level = normalizeHeadingLevel(block.attrs?.level);
    return `<h${level}>${inlineContentToHtml(block.content)}</h${level}>`;
  }

  if (block.type === "bulletList") {
    return `<ul>${listItemsToHtml(block.content)}</ul>`;
  }

  if (block.type === "orderedList") {
    return `<ol>${listItemsToHtml(block.content)}</ol>`;
  }

  return "";
}

function listItemsToHtml(
  items:
    | Array<{
      type: "listItem";
      content?: AtlasRichTextInlineNode[];
    }>
    | undefined,
): string {
  return (
    items
      ?.map((item) => `<li>${inlineContentToHtml(item.content)}</li>`)
      .join("") ?? ""
  );
}

function inlineContentToHtml(content: AtlasRichTextInlineNode[] = []): string {
  if (content.length === 0) return "";

  return content.map(textNodeToHtml).join("");
}

function textNodeToHtml(node: AtlasRichTextTextNode): string {
  let html = escapeHtml(node.text).replace(/\n/g, "<br>");

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        html = `<strong>${html}</strong>`;
        break;
      case "italic":
        html = `<em>${html}</em>`;
        break;
      case "underline":
        html = `<u>${html}</u>`;
        break;
      case "code":
        html = `<code>${html}</code>`;
        break;
      case "link": {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : "";

        if (isSafeHref(href)) {
          html = `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
        }

        break;
      }
    }
  }

  return html;
}

function convertDomNodeToBlocks(node: ChildNode): AtlasRichTextBlockNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return plainTextToBlocks(node.textContent ?? "");
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === "br") {
    return [
      {
        type: "paragraph",
        content: [],
      },
    ];
  }

  if (tagName === "p" || tagName === "div") {
    return [
      {
        type: "paragraph",
        content: convertInlineChildren(node),
      },
    ];
  }

  if (/^h[1-6]$/.test(tagName)) {
    return [
      {
        type: "heading",
        attrs: {
          level: normalizeHeadingLevel(Number(tagName.slice(1))),
        },
        content: convertInlineChildren(node),
      },
    ];
  }

  if (tagName === "ul" || tagName === "ol") {
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === "li")
      .map((child) => ({
        type: "listItem" as const,
        content: convertInlineChildren(child),
      }));

    return [
      {
        type: tagName === "ul" ? "bulletList" : "orderedList",
        content: items,
      },
    ];
  }

  if (tagName === "li") {
    return [
      {
        type: "paragraph",
        content: convertInlineChildren(node),
      },
    ];
  }

  const inlineContent = convertInlineChildren(node);

  if (inlineContent.length === 0) {
    return [];
  }

  return [
    {
      type: "paragraph",
      content: inlineContent,
    },
  ];
}

function convertInlineChildren(element: Element): AtlasRichTextInlineNode[] {
  const output: AtlasRichTextInlineNode[] = [];

  for (const child of Array.from(element.childNodes)) {
    output.push(...convertInlineNode(child, collectMarksFromAncestors(child)));
  }

  return mergeAdjacentTextNodes(output);
}

function convertInlineNode(
  node: ChildNode,
  parentMarks: AtlasRichTextMark[] = [],
): AtlasRichTextInlineNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";

    if (!text) return [];

    return [
      {
        type: "text",
        text,
        marks: parentMarks.length > 0 ? parentMarks : undefined,
      },
    ];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  if (node.tagName.toLowerCase() === "br") {
    return [
      {
        type: "text",
        text: "\n",
        marks: parentMarks.length > 0 ? parentMarks : undefined,
      },
    ];
  }

  const marks = mergeMarks(parentMarks, getMarksForElement(node));

  return Array.from(node.childNodes).flatMap((child) =>
    convertInlineNode(child, marks),
  );
}

function collectMarksFromAncestors(node: ChildNode): AtlasRichTextMark[] {
  const marks: AtlasRichTextMark[] = [];
  let current = node.parentElement;

  while (current && current.tagName.toLowerCase() !== "body") {
    marks.push(...getMarksForElement(current));
    current = current.parentElement;
  }

  return dedupeMarks(marks.reverse());
}

function getMarksForElement(element: HTMLElement): AtlasRichTextMark[] {
  const tagName = element.tagName.toLowerCase();
  const marks: AtlasRichTextMark[] = [];

  if (tagName === "strong" || tagName === "b") {
    marks.push({ type: "bold" });
  }

  if (tagName === "em" || tagName === "i") {
    marks.push({ type: "italic" });
  }

  if (tagName === "u") {
    marks.push({ type: "underline" });
  }

  if (tagName === "code") {
    marks.push({ type: "code" });
  }

  if (tagName === "a") {
    const href = element.getAttribute("href") ?? "";

    if (isSafeHref(href)) {
      marks.push({
        type: "link",
        attrs: {
          href,
        },
      });
    }
  }

  return marks;
}

function mergeAdjacentTextNodes(
  nodes: AtlasRichTextInlineNode[],
): AtlasRichTextInlineNode[] {
  const output: AtlasRichTextInlineNode[] = [];

  for (const node of nodes) {
    const previous = output[output.length - 1];

    if (
      previous &&
      JSON.stringify(previous.marks ?? []) === JSON.stringify(node.marks ?? [])
    ) {
      previous.text += node.text;
      continue;
    }

    output.push({ ...node });
  }

  return output;
}

function mergeMarks(
  baseMarks: AtlasRichTextMark[],
  nextMarks: AtlasRichTextMark[],
): AtlasRichTextMark[] {
  return dedupeMarks([...baseMarks, ...nextMarks]);
}

function dedupeMarks(marks: AtlasRichTextMark[]): AtlasRichTextMark[] {
  const output: AtlasRichTextMark[] = [];

  for (const mark of marks) {
    const key =
      mark.type === "link"
        ? `${mark.type}:${String(mark.attrs?.href ?? "")}`
        : mark.type;

    const alreadyExists = output.some((existing) => {
      const existingKey =
        existing.type === "link"
          ? `${existing.type}:${String(existing.attrs?.href ?? "")}`
          : existing.type;

      return existingKey === key;
    });

    if (!alreadyExists) {
      output.push(mark);
    }
  }

  return output;
}

function readPlainTextFromDoc(doc: AtlasRichTextDoc): string {
  return doc.content
    .map((block) => {
      switch (block.type) {
        case "bulletList":
        case "orderedList":
          return (
            block.content
              ?.map((item) => inlineContentToPlainText(item.content))
              .join("\n") ?? ""
          );

        case "heading":
        case "paragraph":
          return inlineContentToPlainText(block.content);

        default:
          return "";
      }
    })
    .join("\n")
    .trim();
}

function inlineContentToPlainText(
  content: AtlasRichTextInlineNode[] = [],
): string {
  return content.map((node) => node.text).join("");
}

function plainTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/g)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function plainTextToBlocks(text: string): AtlasRichTextBlockNode[] {
  const normalized = text.replace(/\r\n/g, "\n");

  if (!normalized.trim()) return [];

  return normalized.split(/\n{2,}/g).map((paragraph) => ({
    type: "paragraph",
    content: paragraph
      ? [
        {
          type: "text",
          text: paragraph,
        },
      ]
      : [],
  }));
}

function stripHtmlToPlainText(value: string): string {
  if (!looksLikeHtml(value)) return value;

  if (typeof DOMParser === "undefined") {
    return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(value, "text/html");

  return document.body.textContent?.trim() ?? "";
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function looksLikeRichTextJson(value: string): boolean {
  return (
    value.startsWith("{") &&
    value.includes('"type"') &&
    value.includes('"doc"')
  );
}

function normalizeHeadingLevel(value: unknown): number {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) return 2;

  return Math.min(6, Math.max(1, Math.round(numberValue)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeHref(value: string): boolean {
  const trimmed = value.trim().toLowerCase();

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/")
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
