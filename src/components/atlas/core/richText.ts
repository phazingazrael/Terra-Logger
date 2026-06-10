export type AtlasRichTextDoc = {
  type: "doc";
  content: Array<{
    type: "paragraph" | "heading" | "bulletList" | "orderedList";
    attrs?: Record<string, unknown>;
    content?: Array<{
      type: "text";
      text: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }>;
  }>;
};

export function readPlainTextFromRichTextValue(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  try {
    const parsed = JSON.parse(value) as AtlasRichTextDoc;

    if (parsed?.type !== "doc" || !Array.isArray(parsed.content)) {
      return value;
    }

    return (
      parsed.content
        ?.flatMap((node) => node.content?.map((child) => child.text) ?? [])
        .join("\n") ?? ""
    );
  } catch {
    return value;
  }
}

export function createRichTextJson(text = ""): string {
  const doc: AtlasRichTextDoc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };

  return JSON.stringify(doc);
}

export function readPlainTextFromRichTextJson(json: unknown): string {
  if (typeof json !== "string" || json.trim().length === 0) return "";

  try {
    const parsed = JSON.parse(json) as AtlasRichTextDoc;
    return parsed.content
      ?.flatMap((node) => node.content?.map((child) => child.text) ?? [])
      .join("\n") ?? "";
  } catch {
    return "";
  }
}
