import JSZip from "jszip";
import { initGeneratorsDatabase } from "../../db/connections/generatorsDatabase";
import {
	exportSectionDefaultReferenceJson,
	exportSectionTemplateJson,
} from "./exporters";
import { generatorCatalogRegistry } from "./registry";

export const GENERATOR_CATALOG_TEMPLATE_ARCHIVE_NAME =
	"Terra-Logger Generator Catalog Templates.zip";

export const GENERATOR_CATALOG_TEMPLATE_ARCHIVE_ROOT =
	"Terra-Logger Generator Catalog Templates";

const GENERATOR_CATALOG_TEMPLATE_MANIFEST_SCHEMA =
	"terra-logger/generator-catalog-template-archive/v1";

function createReadme(sectionCount: number): string {
	return `# Terra-Logger Generator Catalog Templates

This archive contains editable examples and immutable default references for
every generator catalog section currently registered by Terra-Logger.

## Using the templates

1. Choose a file under \`templates/\`.
2. Keep its \`$schema\`, \`generatorType\`, and \`sectionId\` values unchanged.
3. Replace the example records with your own records.
4. Give every record a stable, unique \`user:\` ID and keep
   \`"source": "user"\`.
5. Paste the completed JSON into Settings > Generator Catalogs.
6. Validate and preview the changes before saving.

The archive contains ${sectionCount} editable section template${
		sectionCount === 1 ? "" : "s"
	}.

## Folders

- \`templates/\` contains safe user-editable examples.
- \`reference/\` contains the currently active immutable default records.
- \`manifest.json\` lists every included generator type, section, and path.

Reference files are informational. Records with \`default:\` IDs cannot be
created, updated, or deleted through the user-catalog interface. A reference
file may contain an empty \`records\` array when that section has no bundled
defaults in the installed Terra-Logger version.

## Save modes

- **Merge** inserts or updates submitted user records and preserves other user
  records in the section.
- **Replace User Section** inserts or updates submitted records and removes
  other user records from that section.

Neither mode changes immutable defaults.
`;
}

export async function createGeneratorCatalogTemplateArchive(): Promise<Blob> {
	const database = await initGeneratorsDatabase();
	const zip = new JSZip();
	const root = zip.folder(GENERATOR_CATALOG_TEMPLATE_ARCHIVE_ROOT);
	if (!root)
		throw new Error("The generator catalog archive could not be created.");

	const generatorTypes = generatorCatalogRegistry.listTypes();
	const sections = generatorTypes.flatMap((generatorType) =>
		generatorType.sections.map((section) => ({
			generatorType,
			section,
		})),
	);
	const occupiedPaths = new Set<string>();

	for (const { section } of sections) {
		for (const path of [section.templatePath, section.referencePath]) {
			if (occupiedPaths.has(path)) {
				throw new Error(`Duplicate generator catalog archive path "${path}".`);
			}
			occupiedPaths.add(path);
		}

		root.file(section.templatePath, exportSectionTemplateJson(section));
		const storedDefaults = await database.getAllFromIndex(
			section.store,
			"sourceIndex",
			"default",
		);
		const activeDefaults = storedDefaults
			.filter(section.matchesRecord)
			.filter((record) => record.enabled);
		root.file(
			section.referencePath,
			exportSectionDefaultReferenceJson(section, activeDefaults),
		);
	}

	const manifest = {
		$schema: GENERATOR_CATALOG_TEMPLATE_MANIFEST_SCHEMA,
		generatedAt: new Date().toISOString(),
		generators: generatorTypes.map((generatorType) => ({
			id: generatorType.id,
			label: generatorType.label,
			sections: generatorType.sections.map((section) => ({
				id: section.id,
				label: section.label,
				templatePath: section.templatePath,
				referencePath: section.referencePath,
			})),
		})),
	};

	root.file("README.md", createReadme(sections.length));
	root.file("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

	return zip.generateAsync({
		type: "blob",
		mimeType: "application/zip",
		compression: "DEFLATE",
		compressionOptions: { level: 6 },
	});
}
