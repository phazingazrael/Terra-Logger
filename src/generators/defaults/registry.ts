import type { DefaultCatalogBundle } from "./types";

function bundleKey(
	bundle: Pick<DefaultCatalogBundle, "generatorType" | "sectionId">,
): string {
	return `${bundle.generatorType}:${bundle.sectionId}`;
}

export class DefaultCatalogBundleRegistry {
	readonly #bundles = new Map<string, DefaultCatalogBundle>();

	register(bundle: DefaultCatalogBundle): void {
		if (!Number.isInteger(bundle.version) || bundle.version < 1) {
			throw new Error(
				`Default bundle "${bundle.sectionId}" needs a positive integer version.`,
			);
		}

		const key = bundleKey(bundle);
		if (this.#bundles.has(key)) {
			throw new Error(`Default catalog bundle "${key}" is registered.`);
		}

		this.#bundles.set(
			key,
			Object.freeze({
				...bundle,
				records: Object.freeze(bundle.records.map((record) => ({ ...record }))),
			}),
		);
	}

	list(): readonly DefaultCatalogBundle[] {
		return Object.freeze(
			[...this.#bundles.values()].sort((left, right) =>
				bundleKey(left).localeCompare(bundleKey(right)),
			),
		);
	}
}

/**
 * Detailed catalog stages register their bundled defaults here.
 * Stage 6 intentionally does not invent placeholder production records.
 */
export const defaultCatalogBundleRegistry = new DefaultCatalogBundleRegistry();
