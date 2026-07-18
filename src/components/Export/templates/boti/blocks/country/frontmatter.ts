import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";

export const botiCountryFrontmatterBlock: MarkdownBlock = {
  id: "boti.country.frontmatter",

  render({ entity }) {
    const name =
      readString(entity, "name") ||
      readString(entity, "nameFull") ||
      readString(entity, "title");

    const nameFull = readString(entity, "nameFull");
    const aliases =
      readString(entity, "aliases") ||
      readString(entity, "Aliases") ||
      (nameFull && nameFull !== name ? `${name}, ${nameFull}` : name);

    const govtType =
      readString(entity, "political.formName") ||
      readString(entity, "political.form") ||
      readString(entity, "govName") ||
      readString(entity, "govForm");

    const pronounced =
      readString(entity, "pronounced") ||
      readString(entity, "Pronounced") ||
      name;

    const theme =
      readString(entity, "theme") ||
      readString(entity, "Theme") ||
      readString(entity, "type");

    const tags = normalizeTags(entity.tags);

    return [
      "---",
      `BANNER: ${quoteYamlString("[[Country-Banner.png|145]]")}`,
      `Name: ${formatYamlValue(name)}`,
      `Aliases: ${formatYamlValue(aliases)}`,
      `GovtType: ${quoteYamlString(govtType)}`,
      `Leaders: ${formatYamlValue(readString(entity, "leaders") || readString(entity, "Leaders"))}`,
      "NoteIcon: Country",
      `PlanetPlane: ${formatYamlValue(readString(entity, "planetPlane") || readString(entity, "PlanetPlane"))}`,
      `Pronounced: ${formatYamlValue(pronounced)}`,
      `Religions: ${formatYamlValue(readString(entity, "religions") || readString(entity, "Religions"))}`,
      `Rulers: ${formatYamlValue(readString(entity, "rulers") || readString(entity, "Rulers"))}`,
      `Terrain: ${formatYamlValue(readString(entity, "terrain") || readString(entity, "Terrain"))}`,
      `Theme: ${formatYamlValue(theme)}`,
      "tags:",
      ...tags.map((tag) => `  - ${quoteYamlString(tag)}`),
      "---",
    ].join("\n");
  },
};

function normalizeTags(value: unknown): string[] {
  const tags = Array.isArray(value) ? value : [];

  const names = tags
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();

      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;

        return String(record.Name ?? record.name ?? "").trim();
      }

      return "";
    })
    .filter(Boolean);

  return names.length > 0 ? names : ["Country"];
}

function formatYamlValue(value: string): string {
  return value.trim();
}

function quoteYamlString(value: string): string {
  return JSON.stringify(value ?? "");
}
