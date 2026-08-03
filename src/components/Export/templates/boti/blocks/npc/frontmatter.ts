import type { MarkdownBlock } from "../../../../builder/exportTypes";
export const botiNPCFrontmatterBlock: MarkdownBlock = { id: "boti.npc.frontmatter", render: ({ entity }) => {
  const name = String(entity.fullName ?? entity.name ?? "Unnamed NPC");
  const aliases = Array.isArray(entity.aliases) ? entity.aliases : [];
  const tags = Array.isArray(entity.tags)
    ? entity.tags.flatMap((tag) => {
        const name =
          typeof tag === "string"
            ? tag
            : String((tag as { name?: unknown })?.name ?? "");

        return name ? [name] : [];
      })
    : [];
  return ["---", `BANNER: ${JSON.stringify("")}`, `NoteIcon: ${JSON.stringify("npc")}`, `Name: ${JSON.stringify(name)}`, `Pronouns: ${JSON.stringify(Array.isArray(entity.pronouns) ? entity.pronouns.join("/") : "")}`, `Pronounced: ${JSON.stringify(String(entity.pronounced ?? ""))}`, `Aliases: ${JSON.stringify(aliases)}`, `tags: ${JSON.stringify(tags)}`, "---"].join("\n");
}};
