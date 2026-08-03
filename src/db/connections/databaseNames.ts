/**
 * IndexedDB database names owned by Terra-Logger.
 *
 * Keep these names centralized so each database connection has one stable,
 * explicit boundary.
 */
export const TERRA_LOGGER_APP_DB_NAME = "TerraLogger-App" as const;
export const TERRA_LOGGER_MAPS_DB_NAME = "TerraLogger-Maps" as const;
export const TERRA_LOGGER_GENERATORS_DB_NAME =
	"TerraLogger-Generators" as const;
