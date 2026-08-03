import type { NPCRelationship } from "../../../definitions/TerraLogger";
import { getInverseNPCRelationshipType } from "./registry";

export function createInverseNPCRelationship(
  relationship: NPCRelationship,
  ownerNPCId: string,
  now = new Date().toISOString(),
): NPCRelationship {
  return {
    ...relationship,
    id: `${relationship.id}:inverse`,
    relatedEntityType: "npc",
    relatedEntityId: ownerNPCId,
    relationshipType: getInverseNPCRelationshipType(relationship.relationshipType),
    primary: relationship.primary,
    source: relationship.source,
    createdAt: relationship.createdAt || now,
    updatedAt: now,
  };
}
