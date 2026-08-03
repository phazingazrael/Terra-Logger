import { useEffect, useState, type JSX } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useActiveMap } from "./db/DataContext";
import { useDeviceType } from "./hooks/useDeviceType";
import { getAppSettings } from "./db/appSettings";

import MobileLayout from "./layouts/MobileLayout";

import type { MapInf } from "./definitions/TerraLogger";
import type { AppInfo } from "./definitions/AppInfo";

import "./App.css";
import BookLoader from "./components/Util/bookLoader";
import { handleSvgReplace } from "./components/Util/handleSvgReplace";

const router = createBrowserRouter([
	{
		path: "/",
		async lazy() {
			const [{ default: MainLayout }, { default: ErrorBoundary }] =
				await Promise.all([
					import("./layouts/MainLayout"),
					import("./pages/ErrorPage/ErrorPage"),
				]);
			return { Component: MainLayout, ErrorBoundary };
		},
		children: [
			{
				index: true,
				lazy: () =>
					import("./pages/HomePage/HomePage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "settings",
				lazy: () =>
					import("./pages/Settings/Settings").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "countries",
				lazy: () =>
					import("./pages/CountriesPage/CountriesPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "cities",
				lazy: () =>
					import("./pages/CitiesPage/CitiesPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "religions",
				lazy: () =>
					import("./pages/ReligionsPage/ReligionsPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "notes",
				lazy: () =>
					import("./pages/NotesPage/notesPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "cultures",
				lazy: () =>
					import("./pages/CulturesPage/CulturesPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "npcs",
				lazy: () =>
					import("./pages/NPCsPage/NPCsPage").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "export",
				lazy: () =>
					import("./pages/ExportPage/export").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "about",
				lazy: () =>
					import("./pages/AboutPage/AboutPage").then((m) => ({
						Component: m.default,
					})),
			},
			// Viewing Pages
			{
				path: "view_city/:_id",
				lazy: () =>
					import("./pages/ViewingPages/city").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "view_country/:_id",
				lazy: () =>
					import("./pages/ViewingPages/country").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "view_religion/:_id",
				lazy: () =>
					import("./pages/ViewingPages/religion").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "view_note/:_id",
				lazy: () =>
					import("./pages/ViewingPages/note").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "view_npc/:_id",
				lazy: () =>
					import("./pages/ViewingPages/npc").then((m) => ({
						Component: m.default,
					})),
			},
			{
				path: "view_culture/:_id",
				lazy: () =>
					import("./pages/ViewingPages/culture").then((m) => ({
						Component: m.default,
					})),
			},
		],
		HydrateFallback: () => <div>Loading...</div>,
	},
]);

const App = (): JSX.Element => {
	const activeMap = useActiveMap<MapInf>();

	// load appSettings from IndexedDB so we can check forceMobile
	const [appSettings, setAppSettings] = useState<AppInfo | null>(null);
	const [settingsLoaded, setSettingsLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const settings = await getAppSettings();
				if (!cancelled) setAppSettings(settings);
			} catch (e) {
				console.error("Failed to load appSettings:", e);
				if (!cancelled) setAppSettings(null);
			} finally {
				if (!cancelled) setSettingsLoaded(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// detect device once per render
	const device = useDeviceType();
	const isHandheld = device === "phone" || device === "tablet";

	const activeMapSvg = activeMap?.SVG;
	const activeMapHeight = activeMap?.info.height;
	const activeMapWidth = activeMap?.info.width;

	// resize map
	useEffect(() => {
		if (
			!activeMapSvg ||
			activeMapHeight === undefined ||
			activeMapWidth === undefined
		) {
			return;
		}

		handleSvgReplace({
			svg: activeMapSvg,
			height: activeMapHeight,
			width: activeMapWidth,
		});

		function handleResize() {
			const { innerHeight, innerWidth } = window;

			const mapElement = document.getElementById("map");
			const viewBox = document.getElementById("viewbox");

			if (!mapElement || !viewBox) {
				return;
			}

			mapElement.setAttribute("height", String(innerHeight));
			mapElement.setAttribute("width", String(innerWidth));

			viewBox.setAttribute("height", String(innerHeight));
			viewBox.setAttribute("width", String(innerWidth));

			const safeWidth = activeMapWidth || 1;
			const safeHeight = activeMapHeight || 1;

			const scaleX = innerWidth / safeWidth;
			const scaleY = innerHeight / safeHeight;

			const formatScale = (value: number) =>
				Number.isFinite(value) ? Number(value.toFixed(6)) : 1;

			viewBox.setAttribute(
				"transform",
				`scale(${formatScale(scaleX)} ${formatScale(scaleY)})`,
			);
		}

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [activeMapSvg, activeMapHeight, activeMapWidth]);

	// avoid layout flash while classifying device or loading settings
	if (device === "unknown" || !settingsLoaded) return <BookLoader />;

	if (isHandheld) {
		if (appSettings?.forceMobile !== true) {
			return <MobileLayout />;
		}
	}
	return <RouterProvider router={router} />;
};

export default App;
