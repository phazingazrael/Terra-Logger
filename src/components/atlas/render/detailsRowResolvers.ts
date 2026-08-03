import type { AtlasRenderContext } from "../../../definitions/Atlas";

export type DetailsRowResolver = (
  context: AtlasRenderContext,
  args?: Record<string, unknown>,
) => unknown;


function relatedLeaderNames(context: AtlasRenderContext): string[] {
  const entityId = String((context.entity as { _id?: unknown })._id ?? "");
  const relationshipTypes = new Set(["rules", "ruler", "leads", "leader"]);

  return (context.related?.npcs ?? [])
    .flatMap((npc) => {
      const relationship = npc.relationships.find((item: { relatedEntityType: string; relatedEntityId: string; relationshipType: string }) =>
        item.relatedEntityType === context.sourceType &&
        item.relatedEntityId === entityId &&
        relationshipTypes.has(item.relationshipType.toLocaleLowerCase()),
      );
      if (!relationship) return [];
      const name = npc.fullName || npc.name;
      return [`${name}${relationship.roleTitle ? ` — ${relationship.roleTitle}` : ""}`];
    })
    .sort((left, right) => left.localeCompare(right));
}

export const detailsRowResolvers: Record<string, DetailsRowResolver> = {
  "country.capitalCityName": (context) => {
    const entity = context.entity as {
      cities?: Array<{
        name?: string;
        capital?: boolean;
      }>;
    };

    return (
      entity.cities?.find((city) => city.capital === true)?.name ?? ""
    );
  },

  "country.currentRulers": relatedLeaderNames,

  "city.currentRulers": relatedLeaderNames,

  "country.cityCount": (context) => {
    const entity = context.entity as {
      cities?: unknown[];
    };

    return entity.cities?.length ?? 0;
  },
};
