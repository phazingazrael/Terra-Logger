import { npcAncestryDefaultBundle } from "../../components/NPC/generator/ancestries";
import { npcAppearanceDefaultBundles } from "../../components/NPC/generator/appearance";
import { npcGenderDefaultBundles } from "../../components/NPC/generator/genders";
import { npcGovernmentDefaultBundle } from "../../components/NPC/generator/governments";
import { npcNamePoolDefaultBundle } from "../../components/NPC/generator/namePools";
import { npcProfessionDefaultBundles } from "../../components/NPC/generator/professions";
import { npcProfileDefaultBundles } from "../../components/NPC/generator/profile";
import { defaultCatalogBundleRegistry } from "./registry";

defaultCatalogBundleRegistry.register(npcAncestryDefaultBundle);
for (const bundle of npcAppearanceDefaultBundles) {
	defaultCatalogBundleRegistry.register(bundle);
}
for (const bundle of npcGenderDefaultBundles) {
	defaultCatalogBundleRegistry.register(bundle);
}
defaultCatalogBundleRegistry.register(npcNamePoolDefaultBundle);
for (const bundle of npcProfessionDefaultBundles) {
	defaultCatalogBundleRegistry.register(bundle);
}
defaultCatalogBundleRegistry.register(npcGovernmentDefaultBundle);
for (const bundle of npcProfileDefaultBundles) {
	defaultCatalogBundleRegistry.register(bundle);
}
