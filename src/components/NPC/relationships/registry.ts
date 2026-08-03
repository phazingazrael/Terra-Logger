import type { NPCEntityType } from "../../../definitions/TerraLogger";

export type NPCRelationshipDefinition = {
  id: string;
  label: string;
  inverseId: string;
  inverseLabel: string;
  allowedEntityTypes: readonly NPCEntityType[];
  createsInverseForNPC?: boolean;
};

const ALL_ENTITY_TYPES: readonly NPCEntityType[] = ["country", "city", "culture", "religion", "npc"];
const NPC_ONLY: readonly NPCEntityType[] = ["npc"];

export function toFormalCase(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export const NPC_RELATIONSHIP_DEFINITIONS: readonly NPCRelationshipDefinition[] = [
  { id: "parent", label: "Parent", inverseId: "child", inverseLabel: "Child", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "child", label: "Child", inverseId: "parent", inverseLabel: "Parent", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "spouse", label: "Spouse", inverseId: "spouse", inverseLabel: "Spouse", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "sibling", label: "Sibling", inverseId: "sibling", inverseLabel: "Sibling", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "mentor", label: "Mentor", inverseId: "student", inverseLabel: "Student", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "student", label: "Student", inverseId: "mentor", inverseLabel: "Mentor", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "employer", label: "Employer", inverseId: "employee", inverseLabel: "Employee", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "employee", label: "Employee", inverseId: "employer", inverseLabel: "Employer", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "friend", label: "Friend", inverseId: "friend", inverseLabel: "Friend", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "ally", label: "Ally", inverseId: "ally", inverseLabel: "Ally", allowedEntityTypes: ALL_ENTITY_TYPES, createsInverseForNPC: true },
  { id: "rival", label: "Rival", inverseId: "rival", inverseLabel: "Rival", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "enemy", label: "Enemy", inverseId: "enemy", inverseLabel: "Enemy", allowedEntityTypes: ALL_ENTITY_TYPES, createsInverseForNPC: true },
  { id: "advisor", label: "Advisor", inverseId: "advised-by", inverseLabel: "Advised By", allowedEntityTypes: ALL_ENTITY_TYPES, createsInverseForNPC: true },
  { id: "advised-by", label: "Advised By", inverseId: "advisor", inverseLabel: "Advisor", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "member", label: "Member", inverseId: "member", inverseLabel: "Member", allowedEntityTypes: ["culture", "religion"] },
  { id: "leader", label: "Leader", inverseId: "led-by", inverseLabel: "Led By", allowedEntityTypes: ["country", "city", "culture", "religion"] },
  { id: "led-by", label: "Led By", inverseId: "leader", inverseLabel: "Leader", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "ruler", label: "Ruler", inverseId: "subject", inverseLabel: "Subject", allowedEntityTypes: ["country", "city"] },
  { id: "rules", label: "Rules", inverseId: "subject", inverseLabel: "Subject", allowedEntityTypes: ["country", "city"] },
  { id: "subject", label: "Subject", inverseId: "ruler", inverseLabel: "Ruler", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "leads", label: "Leads", inverseId: "led-by", inverseLabel: "Led By", allowedEntityTypes: ["country", "city", "culture", "religion"] },
  { id: "serves", label: "Serves", inverseId: "served-by", inverseLabel: "Served By", allowedEntityTypes: ALL_ENTITY_TYPES },
  { id: "served-by", label: "Served By", inverseId: "serves", inverseLabel: "Serves", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
  { id: "resident", label: "Resident", inverseId: "resident", inverseLabel: "Resident", allowedEntityTypes: ["country", "city"] },
  { id: "resides-in", label: "Resides In", inverseId: "resident", inverseLabel: "Resident", allowedEntityTypes: ["country", "city"] },
  { id: "works-in", label: "Works In", inverseId: "worker", inverseLabel: "Worker", allowedEntityTypes: ["country", "city"] },
  { id: "protects", label: "Protects", inverseId: "protected-by", inverseLabel: "Protected By", allowedEntityTypes: ALL_ENTITY_TYPES },
  { id: "stationed-in", label: "Stationed In", inverseId: "station", inverseLabel: "Station", allowedEntityTypes: ["country", "city"] },
  { id: "headquartered-in", label: "Headquartered In", inverseId: "headquarters-of", inverseLabel: "Headquarters Of", allowedEntityTypes: ["city"] },
  { id: "supplies", label: "Supplies", inverseId: "supplied-by", inverseLabel: "Supplied By", allowedEntityTypes: ALL_ENTITY_TYPES },
  { id: "owner", label: "Owner", inverseId: "owned-by", inverseLabel: "Owned By", allowedEntityTypes: ["city"] },
  { id: "owned-by", label: "Owned By", inverseId: "owner", inverseLabel: "Owner", allowedEntityTypes: NPC_ONLY, createsInverseForNPC: true },
] as const;

const byId = new Map(NPC_RELATIONSHIP_DEFINITIONS.map((definition) => [definition.id, definition]));

export function getNPCRelationshipDefinition(id: string): NPCRelationshipDefinition | undefined {
  return byId.get(id.trim().toLowerCase());
}

export function getNPCRelationshipLabel(id: string): string {
  return getNPCRelationshipDefinition(id)?.label ?? toFormalCase(id);
}

export function listNPCRelationshipDefinitions(entityType: NPCEntityType): readonly NPCRelationshipDefinition[] {
  return NPC_RELATIONSHIP_DEFINITIONS.filter((definition) => definition.allowedEntityTypes.includes(entityType));
}

export function getInverseNPCRelationshipType(id: string): string {
  return getNPCRelationshipDefinition(id)?.inverseId ?? id;
}
