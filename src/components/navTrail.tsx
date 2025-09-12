// NavTrail.tsx;
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
	Breadcrumbs,
	Link as MuiLink,
	Typography,
	Divider,
} from "@mui/material";
import { useDB } from "../db/DataContext";

type LabelMap = Record<string, string>;
import type {
	TLCity,
	TLCountry,
	TLReligion,
	TLNote,
	TLCulture,
} from "../definitions/TerraLogger";

/** Breadcrumbs based on the current pathname. */
function BreadcrumbsNav({
	labelMap,
	maxItems = 4,
	rootLabel = "Home",
	rootTo = "/",
}: {
	labelMap?: LabelMap;
	maxItems?: number;
	rootLabel?: string;
	rootTo?: string;
}) {
	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);

	const { useActive } = useDB();
	const religions = useActive<TLReligion>("religions");
	const countries = useActive<TLCountry>("countries");
	const cities = useActive<TLCity>("cities");
	const notes = useActive<TLNote>("notes");
	const cultures = useActive<TLCulture>("cultures");

	const crumbs = [
		{ to: rootTo, label: rootLabel },
		...segments.map((seg, i) => {
			const to = `/${segments.slice(0, i + 1).join("/")}`;
			if (seg === "view_country") return { to: "/countries", label: "Country" };
			if (seg === "view_religion")
				return { to: "/religions", label: "Religion" };
			if (seg === "view_city") return { to: "/cities", label: "City" };
			if (seg === "view_note") return { to: "/notes", label: "Notes" };
			if (seg === "view_culture") return { to: "/cultures", label: "Cultures" };
			const prevSeg = segments[i - 1];
			if (prevSeg === "view_religion") {
				const religion = religions.find((r) => r._id === seg);
				return { to, label: religion?.name ?? "" };
			}
			if (prevSeg === "view_country") {
				const country = countries.find((c) => c._id === seg);
				return { to, label: country?.name ?? "" };
			}
			if (prevSeg === "view_city") {
				const city = cities.find((c) => c._id === seg);
				return { to, label: city?.name ?? "" };
			}
			if (prevSeg === "view_note") {
				const note = notes.find((n) => n._id === seg);
				return { to, label: note?.name ?? "" };
			}
			if (prevSeg === "view_culture") {
				const culture = cultures.find((c) => c._id === seg);
				return { to, label: culture?.name ?? "" };
			}
			const label = labelMap?.[seg] ?? seg;
			return { to, label };
		}),
	];

	return (
		<Breadcrumbs maxItems={maxItems} aria-label="breadcrumb">
			{crumbs.map((c, i) =>
				i < crumbs.length - 1 ? (
					<MuiLink
						key={c.to}
						component={RouterLink}
						underline="hover"
						color="inherit"
						to={c.to}
					>
						{c.label}
					</MuiLink>
				) : (
					<Typography key={c.to} color="text.primary">
						{c.label}
					</Typography>
				),
			)}
		</Breadcrumbs>
	);
}

/** Auto: show Back when you *can* go back; otherwise show Breadcrumbs. */
function NavTrail({
	labelMap,
	maxItems,
	rootLabel,
	rootTo,
}: {
	labelMap?: LabelMap;
	maxItems?: number;
	rootLabel?: string;
	rootTo?: string;
}) {
	return (
		<div className="navTrail">
			<BreadcrumbsNav
				labelMap={labelMap}
				maxItems={maxItems}
				rootLabel={rootLabel}
				rootTo={rootTo}
			/>
			<Divider />
		</div>
	);
}

export default NavTrail;
