import type { MarkdownBlock } from "../../../../builder/exportTypes";
export const botiNPCFrontmatterBlock: MarkdownBlock = { id: "boti.npc.frontmatter", render: (context) => {
  const { entity } = context;
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
  const referenceProperties = [
    ["ancestry", "race", "Race"], ["profession", "occupation", "Occupation"],
  ].flatMap(([field, type, property]) => {
    const reference = entity[field] as { id?: string; name?: string } | undefined;
    if (!reference?.name?.trim()) return [];
    const id = reference.id?.trim() || `name:${reference.name.trim()}`;
    const target = context.documentPaths?.[`${type}:${id}`];
    return target ? [`${property}: ${JSON.stringify(`[[${target}]]`)}`] : [];
  });
  return ["---", `BANNER: ${JSON.stringify("")}`, `NoteIcon: ${JSON.stringify("npc")}`, `Name: ${JSON.stringify(name)}`, `Pronouns: ${JSON.stringify(Array.isArray(entity.pronouns) ? entity.pronouns.join("/") : "")}`, `Pronounced: ${JSON.stringify(String(entity.pronounced ?? ""))}`, `Aliases: ${JSON.stringify(aliases)}`, `tags: ${JSON.stringify(tags)}`, ...referenceProperties, "---"].join("\n");
}};
