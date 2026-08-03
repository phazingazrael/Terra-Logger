export const GENERATOR_CATALOG_CHANGED_EVENT =
	"terra-logger:generator-catalog-changed";

export type GeneratorCatalogChangedDetail = {
	sectionId: string;
};

export function notifyGeneratorCatalogChanged(sectionId: string): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<GeneratorCatalogChangedDetail>(
			GENERATOR_CATALOG_CHANGED_EVENT,
			{ detail: { sectionId } },
		),
	);
}
