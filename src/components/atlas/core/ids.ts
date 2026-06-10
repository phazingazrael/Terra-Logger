export function createAtlasId(prefix: string): string {
	return `${prefix}_${crypto.randomUUID()}`;
}
