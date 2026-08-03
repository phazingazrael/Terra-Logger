import { npcCatalogTypeDefinition } from "./npc";
import type {
	GeneratorCatalogSectionDefinition,
	GeneratorCatalogTypeDefinition,
} from "./types";

export class GeneratorCatalogRegistry {
	readonly #types = new Map<string, GeneratorCatalogTypeDefinition>();
	readonly #sections = new Map<string, GeneratorCatalogSectionDefinition>();

	register(definition: GeneratorCatalogTypeDefinition): void {
		if (this.#types.has(definition.id)) {
			throw new Error(
				`Generator catalog type "${definition.id}" is registered.`,
			);
		}
		if (!definition.sections.length) {
			throw new Error(
				`Generator catalog type "${definition.id}" has no sections.`,
			);
		}

		const localSectionIds = new Set<string>();
		for (const section of definition.sections) {
			if (section.generatorType !== definition.id) {
				throw new Error(
					`Section "${section.id}" belongs to "${section.generatorType}", not "${definition.id}".`,
				);
			}
			if (localSectionIds.has(section.id) || this.#sections.has(section.id)) {
				throw new Error(
					`Generator catalog section "${section.id}" is registered.`,
				);
			}
			localSectionIds.add(section.id);
		}

		const registeredSections = definition.sections.map((section) =>
			Object.freeze({ ...section }),
		);
		const registeredDefinition: GeneratorCatalogTypeDefinition = {
			...definition,
			sections: Object.freeze(registeredSections),
		};
		this.#types.set(definition.id, Object.freeze(registeredDefinition));
		for (const section of registeredDefinition.sections) {
			this.#sections.set(section.id, section);
		}
	}

	listTypes(): readonly GeneratorCatalogTypeDefinition[] {
		return Object.freeze(
			[...this.#types.values()].sort((left, right) =>
				left.label.localeCompare(right.label),
			),
		);
	}

	listSections(
		generatorType: string,
	): readonly GeneratorCatalogSectionDefinition[] {
		const definition = this.#types.get(generatorType);
		return definition?.sections ?? [];
	}

	getType(generatorType: string): GeneratorCatalogTypeDefinition | undefined {
		return this.#types.get(generatorType);
	}

	getSection(sectionId: string): GeneratorCatalogSectionDefinition | undefined {
		return this.#sections.get(sectionId);
	}

	requireSection(sectionId: string): GeneratorCatalogSectionDefinition {
		const section = this.getSection(sectionId);
		if (!section) {
			throw new Error(`Unknown generator catalog section "${sectionId}".`);
		}
		return section;
	}
}

export const generatorCatalogRegistry = new GeneratorCatalogRegistry();
generatorCatalogRegistry.register(npcCatalogTypeDefinition);
