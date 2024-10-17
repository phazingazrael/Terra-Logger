import type { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
	interface TLTheme extends Theme {
		status: {
			danger: string;
		};
	}
	interface TLThemeOptions extends ThemeOptions {
		status?: {
			danger?: string;
		};
	}
	export function createTheme(options?: ThemeOptions): TLTheme;
}
