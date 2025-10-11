import type { TLCity, TLCountry, TLCulture, TLNote, TLReligion, MapInf } from "./TerraLogger";

/**
 * DataSets is an object that contains all the data that we need to render the markdown files.
 * It has 5 properties:
 * - MapInfo: the map's metadata (name, seed, width, height, etc.)
 * - Cities: an array of City objects, which contain information about each city (name, population, etc.)
 * - Countries: an array of Country objects, which contain information about each country (name, capital, etc.)
 * - Cultures: an array of Culture objects, which contain information about each culture (name, code, etc.)
 * - Notes: an array of Note objects, which contain information about each note (text, tags, etc.)
 * - Religions: an array of Religion objects, which contain information about each religion (name, code, etc.)
 */
export type DataSets = {
  MapInfo: MapInf;
  Cities: TLCity[];
  Countries: TLCountry[];
  Cultures: TLCulture[];
  Notes: TLNote[];
  Religions: TLReligion[];
};

/**
 * TemplateMap is an object that contains the markdown templates for each type of data.
 *
 * The keys of this object are the names of the types of data that we want to render
 * (e.g. "City", "Country", etc.), and the values are the markdown templates for
 * each type of data as strings.
 *
 * For example, the "City" template might look like this:
 *
 *     # {{City.name}}
 *     ## Overview
 *     **Country/Empire/Faction:** [[{{City.country.name}}]]
 *     **Region/Province/Sector:** [Region Name]
 *     **Established/Founded by:** [Date / Founder / Mythological Event]
 *     **Population:** {{City.population}}
 *     **Demonym:** [Demonym]
 *
 * The templates use Mustache syntax to inject data from the DataSets object into
 * the markdown files. For example, the `{{City.name}}` syntax will be replaced with
 * the value of `City.name` from the DataSets object.
 *
 * The templates can also use conditionals, loops, and functions to generate more
 * complex output. For example, the following template will generate a list of
 * all the cities in a country:
 *
 *     {{#Cities}}
 *       - {{.name}}
 *     {{/Cities}}
 */
type TemplateMapBase = {
  MapInfo: string;
  City: string;
  Country: string;
  Culture: string;
  Note: string;
  Religion: string;
};
export type TemplateMap = TemplateMapBase & Record<string, string>;

/**
 * PartialTemplates is a type that represents a partial TemplateMap object.
 * It has the same keys as TemplateMap, but the values are optional.
 *
 * This is useful when you want to provide a subset of the templates to the
 * exportMarkdownFiles function. For example, if you only want to generate
 * markdown files for cities and countries, you can pass an object with only
 * the "City" and "Country" properties.
 */
export type PartialTemplates = Partial<TemplateMap>;

/**
 * FileSpec represents a single file that we want to generate.
 *
 * It has 3 properties:
 * - `path`: the path of the file, relative to the root of the zip archive
 * - `name`: the name of the file, without the path.
 * - `content`: the contents of the file as a string. This is the markdown text that we want to generate.
 */
export type FileSpec = {
  path: string; // path of the file relative to the root of the zip archive (or cwd if not zip)
  name: string; // name of the file without the path
  content: string; // contents of the file as a string (markdown text)
};

/**
 * RenderOptions is an object that contains options for the renderMarkdownFiles
 * function.
 *
 * The properties of this object are:
 *
 * - `mapInfoFilename`: an optional string that specifies the filename of the
 *   map info file. If not provided, the default is "map info.md".
 *
 * - `useFolders`: an optional boolean that specifies whether to use folders to
 *   organize the markdown files. If not provided, the default is true.
 *
 * - `filenameFields`: an optional object that specifies which fields to use
 *   when generating filenames for each of the datasets. The keys of this object
 *   are the names of the datasets (e.g. "Cities", "Countries", etc.), and the
 *   values are arrays of strings that specify the fields to use.
 *
 *   For example, if we want to generate filenames for cities based on the
 *   "name" and "title" fields, we would specify:
 *
 *   {
 *     Cities: ["name", "title"],
 *   }
 *
 *   If not provided, the default is to use the following fields for each
 *   dataset:
 *
 *   {
 *     Cities: ["name", "title", "id", "_id"],
 *     Countries: ["name", "nameFull", "id", "_id"],
 *     Cultures: ["name", "code", "id", "_id"],
 *     Notes: ["name", "id", "_id"],
 *     Religions: ["name", "code", "_id"],
 *   }
 *
 * - `extension`: an optional string that specifies the file extension to use
 *   for the markdown files. If not provided, the default is ".md".
 */
export type RenderOptions = {
  mapInfoFilename?: string; // default: "map info.md"
  filenameFields?: Partial<Record<keyof Omit<DataSets, "MapInfo">, string[]>>; // default: see above
  extension?: string; // default: ".md"
  css?: string;
  templateName?: string;
};

export type ZipEntry = {
  path: string;
  name: string;
  content: string | Uint8Array;
  zipOptions?: any;
};
